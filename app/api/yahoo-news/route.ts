import { NextResponse } from 'next/server'
import yahooFinance from 'yahoo-finance2'

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
                        sentiment: determineSentiment(item.title),
                        relatedSymbols: symbols.filter(symbol =>
                            item.title.includes(symbol) ||
                            (symbol === '^GSPC' && (item.title.includes('S&P') || item.title.includes('S&P 500'))) ||
                            (symbol === '^DJI' && (item.title.includes('Dow') || item.title.includes('DJIA')))
                        )
                    }])
            ).values()
        )

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

    // Enhanced sentiment analysis with more comprehensive keyword lists
    const bullishWords = [
        'surge', 'jump', 'rise', 'gain', 'high', 'boost', 'growth',
        'outperform', 'upgrade', 'beat', 'exceed', 'record', 'strong',
        'positive', 'breakthrough', 'rally', 'recover', 'momentum'
    ]
    const bearishWords = [
        'fall', 'drop', 'decline', 'low', 'loss', 'down', 'crash',
        'plunge', 'tumble', 'downgrade', 'miss', 'weak', 'negative',
        'concern', 'risk', 'volatile', 'pressure', 'struggle'
    ]
    const neutralWords = [
        'hold', 'maintain', 'stable', 'steady', 'unchanged',
        'flat', 'mixed', 'balance', 'consolidate'
    ]

    // Count occurrences of sentiment words
    const bullishCount = bullishWords.filter(word => lowerTitle.includes(word)).length
    const bearishCount = bearishWords.filter(word => lowerTitle.includes(word)).length
    const neutralCount = neutralWords.filter(word => lowerTitle.includes(word)).length

    // Determine sentiment based on word counts and specific patterns
    if (bullishCount > bearishCount && bullishCount > neutralCount) {
        return 'Bullish'
    } else if (bearishCount > bullishCount && bearishCount > neutralCount) {
        return 'Bearish'
    } else if (neutralCount > bullishCount && neutralCount > bearishCount) {
        return 'Neutral'
    } else if (bullishCount === bearishCount) {
        return 'Mixed'
    }

    return 'Neutral'
} 