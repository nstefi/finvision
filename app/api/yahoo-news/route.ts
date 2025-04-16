import { NextResponse } from 'next/server'
import yahooFinance from 'yahoo-finance2'
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'

// Initialize Google AI Client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '')
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash-latest",
    safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ]
})

// Function to get sentiment and topics using Google AI with retries
async function getAISentimentAndTopics(title: string, retries = 2): Promise<{ sentiment: string; topics: string[] }> {
    const prompt = `
        Analyze the sentiment and determine the primary topic for the following financial news headline.
        Headline: "${title}"
        Instructions:
        1. Determine the overall sentiment. Respond with one of: "Bullish", "Bearish", "Neutral", "Mixed".
        2. Determine the primary topic. Respond with one of: "Markets", "Economic", "Technology", "Earnings", "Crypto", "General".
        Return the result as a valid JSON object with the keys "sentiment" and "topic".
        Example: {"sentiment": "Bullish", "topic": "Earnings"}
    `.trim()

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const result = await model.generateContent(prompt)
            const response = result.response
            let text = response.text()

            // Clean the response to extract JSON
            const jsonMatch = text.match(/\{.*\}/s)
            if (jsonMatch && jsonMatch[0]) {
                text = jsonMatch[0]
            }

            const analysis = JSON.parse(text)
            return {
                sentiment: analysis.sentiment || 'Neutral',
                topics: [analysis.topic || 'General']
            }
        } catch (error) {
            if (attempt === retries) {
                console.error(`Failed to analyze after ${retries + 1} attempts:`, error)
                // Use basic sentiment analysis as fallback
                return determineBasicSentiment(title)
            }
            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
        }
    }

    return determineBasicSentiment(title)
}

// Basic sentiment analysis as fallback
function determineBasicSentiment(title: string): { sentiment: string; topics: string[] } {
    const lowerTitle = title.toLowerCase()

    // Simple keyword-based sentiment analysis
    const bullishWords = ['surge', 'jump', 'rise', 'gain', 'high', 'boost', 'growth', 'positive']
    const bearishWords = ['fall', 'drop', 'decline', 'low', 'loss', 'down', 'crash', 'negative']

    const bullishCount = bullishWords.filter(word => lowerTitle.includes(word)).length
    const bearishCount = bearishWords.filter(word => lowerTitle.includes(word)).length

    let sentiment = 'Neutral'
    if (bullishCount > bearishCount) sentiment = 'Bullish'
    else if (bearishCount > bullishCount) sentiment = 'Bearish'

    // Simple topic detection
    let topic = 'General'
    if (lowerTitle.includes('stock') || lowerTitle.includes('market')) topic = 'Markets'
    else if (lowerTitle.includes('tech') || lowerTitle.includes('ai')) topic = 'Technology'

    return { sentiment, topics: [topic] }
}

export async function GET(request: Request) {
    try {
        const url = new URL(request.url)
        const symbolsParam = url.searchParams.get('symbols')
        const symbols = symbolsParam ? symbolsParam.split(',') : ['^GSPC', '^DJI', 'AAPL', 'MSFT', 'GOOGL']

        // Fetch news with a timeout
        const newsPromises = symbols.map(symbol =>
            Promise.race([
                yahooFinance.search(symbol, { newsCount: 5 })
                    .then(result => result.news || [])
                    .catch(error => {
                        console.error(`Error fetching news for ${symbol}:`, error)
                        return []
                    }),
                new Promise<[]>((_, reject) =>
                    setTimeout(() => reject(new Error('Timeout')), 8000)
                )
            ]).catch(() => [])
        )

        let newsResults = await Promise.all(newsPromises)
        newsResults = newsResults.flat()

        // Process news in smaller batches to avoid rate limits
        const batchSize = 5
        const allAnalyses: { sentiment: string; topics: string[] }[] = []

        for (let i = 0; i < newsResults.length; i += batchSize) {
            const batch = newsResults.slice(i, i + batchSize)
            const batchAnalyses = await Promise.all(
                batch.map(item => getAISentimentAndTopics(item.title))
            )
            allAnalyses.push(...batchAnalyses)
        }

        // Combine news data with AI analysis and deduplicate
        const uniqueNewsMap = new Map()
        newsResults.forEach((item, index) => {
            if (!uniqueNewsMap.has(item.link)) {
                uniqueNewsMap.set(item.link, {
                    title: item.title,
                    url: item.link,
                    timePublished: new Date(
                        String(item.providerPublishTime).length <= 10
                            ? item.providerPublishTime * 1000
                            : item.providerPublishTime
                    ).toISOString(),
                    source: item.publisher,
                    topics: allAnalyses[index]?.topics || ['General'],
                    sentiment: allAnalyses[index]?.sentiment || 'Neutral',
                    relatedSymbols: symbols.filter(symbol =>
                        item.title.includes(symbol) ||
                        (symbol === '^GSPC' && (item.title.includes('S&P') || item.title.includes('S&P 500'))) ||
                        (symbol === '^DJI' && (item.title.includes('Dow') || item.title.includes('DJIA')))
                    )
                })
            }
        })

        const uniqueNews = Array.from(uniqueNewsMap.values())
        const sortedNews = uniqueNews.sort((a, b) =>
            new Date(b.timePublished).getTime() - new Date(a.timePublished).getTime()
        )

        const filteredNews = symbolsParam
            ? sortedNews.filter(item => item.relatedSymbols.length > 0)
            : sortedNews

        return NextResponse.json(filteredNews)
    } catch (error) {
        console.error('API Route: Error details:', error)
        return NextResponse.json({
            error: 'Failed to fetch Yahoo Finance news',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
} 