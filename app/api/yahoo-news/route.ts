import { NextResponse } from 'next/server'
import yahooFinance from 'yahoo-finance2'

export async function GET() {
    try {
        console.log('API Route: Starting Yahoo Finance news fetch')

        // Get news for major market indices and tech companies
        const symbols = ['^GSPC', '^DJI', 'AAPL', 'MSFT', 'GOOGL']
        const newsPromises = symbols.map(symbol =>
            yahooFinance.search(symbol, { newsCount: 5 })
                .then(result => result.news || [])
                .catch(error => {
                    console.error(`Error fetching news for ${symbol}:`, error)
                    return []
                })
        )

        const newsResults = await Promise.all(newsPromises)

        // Flatten and deduplicate news by url
        const uniqueNews = Array.from(
            new Map(
                newsResults.flat()
                    .map(item => [item.link, {
                        title: item.title,
                        url: item.link,
                        timePublished: new Date(item.providerPublishTime * 1000).toISOString(),
                        source: item.publisher,
                        topics: determineTopics(item.title),
                        sentiment: determineSentiment(item.title)
                    }])
            ).values()
        )

        // Sort by publish time
        uniqueNews.sort((a, b) =>
            new Date(b.timePublished).getTime() - new Date(a.timePublished).getTime()
        )

        console.log(`API Route: Successfully processed ${uniqueNews.length} Yahoo Finance news items`)
        return NextResponse.json(uniqueNews)
    } catch (error) {
        console.error('API Route: Error details:', error)
        return NextResponse.json({
            error: 'Failed to fetch Yahoo Finance news',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}

function determineTopics(title: string): string[] {
    const lowerTitle = title.toLowerCase()

    if (lowerTitle.includes('stock') || lowerTitle.includes('market') || lowerTitle.includes('index')) {
        return ['Markets']
    }
    if (lowerTitle.includes('fed') || lowerTitle.includes('interest rate') || lowerTitle.includes('inflation')) {
        return ['Economic']
    }
    if (lowerTitle.includes('tech') || lowerTitle.includes('technology')) {
        return ['Technology']
    }
    if (lowerTitle.includes('earnings') || lowerTitle.includes('revenue')) {
        return ['Earnings']
    }
    if (lowerTitle.includes('crypto') || lowerTitle.includes('bitcoin')) {
        return ['Crypto']
    }

    return ['General']
}

function determineSentiment(title: string): string {
    const lowerTitle = title.toLowerCase()

    // Simple sentiment analysis based on keywords
    const bullishWords = ['surge', 'jump', 'rise', 'gain', 'high', 'boost', 'growth']
    const bearishWords = ['fall', 'drop', 'decline', 'low', 'loss', 'down', 'crash']

    if (bullishWords.some(word => lowerTitle.includes(word))) {
        return 'Bullish'
    }
    if (bearishWords.some(word => lowerTitle.includes(word))) {
        return 'Bearish'
    }

    return 'Neutral'
} 