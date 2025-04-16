import { NextResponse } from 'next/server'
import yahooFinance from 'yahoo-finance2'
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'

// Initialize Google AI Client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '')
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash-latest", // Using the latest flash model
    // Optional safety settings - adjust as needed
    safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ]
})

// Function to get sentiment and topics using Google AI
async function getAISentimentAndTopics(title: string): Promise<{ sentiment: string; topics: string[] }> {
    const prompt = `
        Analyze the sentiment and determine the primary topic for the following financial news headline.

        Headline: "${title}"

        Instructions:
        1.  Determine the overall sentiment. Respond with one of: "Bullish", "Bearish", "Neutral", "Mixed".
        2.  Determine the primary topic. Respond with one of: "Markets", "Economic", "Technology", "Earnings", "Crypto", "General".

        Return the result as a valid JSON object with the keys "sentiment" and "topic".
        Example:
        {
            "sentiment": "Bullish",
            "topic": "Earnings"
        }
    `

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
            sentiment: analysis.sentiment || 'Neutral', // Default to Neutral
            topics: [analysis.topic || 'General']      // Default to General
        }
    } catch (error) {
        console.error(`Error analyzing title with AI: "${title}"`, error)
        return { sentiment: 'Neutral', topics: ['General'] } // Fallback on error
    }
}

// Utility function to add delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function GET(request: Request) {
    try {
        console.log('API Route: Starting Yahoo Finance news fetch')

        // Get symbols from the URL parameters
        const url = new URL(request.url)
        const symbolsParam = url.searchParams.get('symbols')
        const symbols = symbolsParam ? symbolsParam.split(',') : ['^GSPC', '^DJI', 'AAPL', 'MSFT', 'GOOGL']

        console.log('Fetching news for symbols:', symbols)

        const newsPromises = symbols.map(symbol =>
            yahooFinance.search(symbol, { newsCount: 5 })
                .then(result => result.news || [])
                .catch(error => {
                    console.error(`Error fetching news for ${symbol}:`, error)
                    return []
                })
        )

        let newsResults = await Promise.all(newsPromises)
        newsResults = newsResults.flat()

        // Analyze sentiment and topics for each news item sequentially with delay
        console.log(`Analyzing ${newsResults.length} news items with AI (sequentially)...`)
        const analyses: { sentiment: string; topics: string[] }[] = []
        for (const item of newsResults) {
            // Add delay before each API call to respect rate limits
            await sleep(4100) // ~4.1 seconds delay (keeps under 15 reqs/min)
            const analysis = await getAISentimentAndTopics(item.title)
            analyses.push(analysis)
            console.log(`  Analyzed: "${item.title.substring(0, 50)}..." -> ${analysis.sentiment} / ${analysis.topics[0]}`)
        }
        console.log('AI analysis complete.')

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
                    topics: analyses[index].topics,       // Use AI topics
                    sentiment: analyses[index].sentiment, // Use AI sentiment
                    relatedSymbols: symbols.filter(symbol =>
                        item.title.includes(symbol) ||
                        (symbol === '^GSPC' && (item.title.includes('S&P') || item.title.includes('S&P 500'))) ||
                        (symbol === '^DJI' && (item.title.includes('Dow') || item.title.includes('DJIA')))
                    )
                })
            }
        })

        const uniqueNews = Array.from(uniqueNewsMap.values())

        // Sort by publish time
        const sortedNews = uniqueNews.sort((a, b) =>
            new Date(b.timePublished).getTime() - new Date(a.timePublished).getTime()
        )

        // Filter news to only include those related to the provided symbols
        const filteredNews = symbolsParam
            ? sortedNews.filter(item => item.relatedSymbols.length > 0)
            : sortedNews

        console.log(`API Route: Successfully processed ${filteredNews.length} Yahoo Finance news items`)
        return NextResponse.json(filteredNews)
    } catch (error) {
        console.error('API Route: Error details:', error)
        return NextResponse.json({
            error: 'Failed to fetch Yahoo Finance news',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
} 