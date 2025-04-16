import { NextResponse } from 'next/server'
import yahooFinance from 'yahoo-finance2'
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'

// --- Google AI Setup (only initialized if needed) ---
let genAI: GoogleGenerativeAI | null = null
let model: any | null = null // Use any for flexibility

function initializeAI() {
    if (!genAI) {
        if (!process.env.GOOGLE_API_KEY) {
            console.warn('GOOGLE_API_KEY not set. AI analysis disabled.')
            return false
        }
        try {
            genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY)
            model = genAI.getGenerativeModel({
                model: "gemini-2.0-flash-lite",
                safetySettings: [
                    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                ]
            })
            console.log('Google AI Client Initialized.')
            return true
        } catch (error) {
            console.error('Failed to initialize Google AI Client:', error)
            genAI = null // Ensure it stays null on failure
            model = null
            return false
        }
    }
    return true // Already initialized
}

// --- Hardcoded Logic (Restored) ---
function determineTopics(title: string): string[] {
    const lowerTitle = title.toLowerCase()
    if (lowerTitle.includes('stock') || lowerTitle.includes('market') || lowerTitle.includes('index')) return ['Markets']
    if (lowerTitle.includes('fed') || lowerTitle.includes('interest rate') || lowerTitle.includes('inflation')) return ['Economic']
    if (lowerTitle.includes('tech') || lowerTitle.includes('technology') || lowerTitle.includes('ai')) return ['Technology']
    if (lowerTitle.includes('earnings') || lowerTitle.includes('revenue')) return ['Earnings']
    if (lowerTitle.includes('crypto') || lowerTitle.includes('bitcoin')) return ['Crypto']
    return ['General']
}

function determineSentiment(title: string): string {
    const lowerTitle = title.toLowerCase()
    const bullishWords = ['surge', 'jump', 'rise', 'gain', 'high', 'boost', 'growth', 'positive', 'outperform', 'upgrade', 'beat', 'record', 'strong']
    const bearishWords = ['fall', 'drop', 'decline', 'low', 'loss', 'down', 'crash', 'negative', 'plunge', 'tumble', 'downgrade', 'miss', 'weak']
    const neutralWords = ['hold', 'maintain', 'stable', 'steady', 'unchanged', 'flat', 'mixed']

    const bullishCount = bullishWords.filter(word => lowerTitle.includes(word)).length
    const bearishCount = bearishWords.filter(word => lowerTitle.includes(word)).length
    const neutralCount = neutralWords.filter(word => lowerTitle.includes(word)).length

    if (bullishCount > bearishCount && bullishCount > neutralCount) return 'Bullish'
    if (bearishCount > bullishCount && bearishCount > neutralCount) return 'Bearish'
    if (neutralCount > bullishCount && neutralCount > bearishCount) return 'Neutral'
    if (bullishCount === bearishCount && bullishCount > 0) return 'Mixed'
    return 'Neutral'
}

// --- Google AI Analysis Function (with fallback to hardcoded) ---
async function getAISentimentAndTopics(title: string, retries = 1): Promise<{ sentiment: string; topics: string[] }> {
    if (!model && !initializeAI()) {
        // Fallback if AI can't be initialized (e.g., missing key)
        return { sentiment: determineSentiment(title), topics: determineTopics(title) }
    }

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
            // Add a small base delay to slightly space out even batched requests
            await new Promise(resolve => setTimeout(resolve, 200 * attempt));
            const result = await model!.generateContent(prompt) // Use non-null assertion
            const response = result.response
            let text = response.text()
            const jsonMatch = text.match(/\{.*\}/s)
            if (jsonMatch && jsonMatch[0]) text = jsonMatch[0]
            const analysis = JSON.parse(text)
            return {
                sentiment: analysis.sentiment || determineSentiment(title), // Fallback within AI logic
                topics: [analysis.topic || determineTopics(title)[0]]
            }
        } catch (error: any) {
            console.warn(`AI analysis attempt ${attempt + 1} failed for "${title.substring(0, 30)}...": ${error.message}`)
            if (attempt === retries) {
                console.error(`AI analysis failed after ${retries + 1} attempts. Falling back to basic analysis.`)
                return { sentiment: determineSentiment(title), topics: determineTopics(title) } // Final fallback
            }
            // Exponential backoff before retry
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt + 1) * 1000))
        }
    }
    // Should not be reached if retries >= 0, but guarantees return
    return { sentiment: determineSentiment(title), topics: determineTopics(title) }
}

// --- API Route Handler ---
export async function GET(request: Request) {
    try {
        const url = new URL(request.url)
        const symbolsParam = url.searchParams.get('symbols')
        const useAI = url.searchParams.get('useAI') === 'true'
        const symbols = symbolsParam ? symbolsParam.split(',') : ['^GSPC', '^DJI', 'AAPL', 'MSFT', 'GOOGL']

        if (useAI) {
            console.log('AI Analysis Requested')
            if (!initializeAI()) {
                // Handle case where AI cannot be used (e.g. no API key on server)
                // Maybe return an error or proceed with basic analysis? For now, proceed.
                console.warn('Proceeding with basic analysis as AI could not be initialized.')
            }
        }

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

        let analyses: { sentiment: string; topics: string[] }[] = []

        if (useAI && model) {
            // Use AI Analysis (Batched)
            console.log(`Analyzing ${newsResults.length} items with AI...`)
            const batchSize = 5 // Keep batching
            for (let i = 0; i < newsResults.length; i += batchSize) {
                const batch = newsResults.slice(i, i + batchSize)
                // Run batch requests concurrently
                const batchAnalyses = await Promise.all(
                    batch.map(item => getAISentimentAndTopics(item.title))
                )
                analyses.push(...batchAnalyses)
                if (newsResults.length > batchSize) {
                    // Add a small delay between batches if there are many items
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }
            console.log('AI analysis finished.')
        } else {
            // Use Hardcoded Logic
            console.log(`Analyzing ${newsResults.length} items with basic logic...`)
            analyses = newsResults.map(item => ({
                sentiment: determineSentiment(item.title),
                topics: determineTopics(item.title)
            }))
            console.log('Basic analysis finished.')
        }

        // Combine news data with analysis (AI or hardcoded)
        const uniqueNewsMap = new Map()
        newsResults.forEach((item, index) => {
            if (!uniqueNewsMap.has(item.link)) {
                const analysisResult = analyses[index] || { sentiment: 'Neutral', topics: ['General'] } // Fallback if analysis array mismatch
                uniqueNewsMap.set(item.link, {
                    title: item.title,
                    url: item.link,
                    timePublished: new Date(
                        String(item.providerPublishTime).length <= 10
                            ? item.providerPublishTime * 1000
                            : item.providerPublishTime
                    ).toISOString(),
                    source: item.publisher,
                    topics: analysisResult.topics,
                    sentiment: analysisResult.sentiment,
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