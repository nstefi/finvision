import { NextResponse } from 'next/server'

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY
const NEWS_API_URL = 'https://www.alphavantage.co/query'

// For debugging purposes - remove in production
const SAMPLE_NEWS = [
    {
        title: "Fed Signals Potential Rate Changes",
        summary: "Federal Reserve indicates possible rate adjustments based on economic data",
        url: "https://example.com/fed-news",
        source: "Financial Times",
        time_published: new Date().toISOString(),
        overall_sentiment_label: "Neutral"
    },
    {
        title: "Tech Sector Shows Strong Growth",
        summary: "Technology companies report better than expected earnings",
        url: "https://example.com/tech-news",
        source: "Reuters",
        time_published: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        overall_sentiment_label: "Bullish"
    }
]

// Helper function to categorize news based on content
function categorizeNews(item: any) {
    const title = item.title.toLowerCase()
    const topics = item.topics || []

    if (title.includes('tech') || title.includes('technology') || topics.includes('technology')) {
        return ['Sector Analysis', 'Technology']
    }
    if (title.includes('fed') || title.includes('interest rate') || title.includes('inflation')) {
        return ['Economic']
    }
    if (title.includes('oil') || title.includes('gold') || title.includes('commodity')) {
        return ['Commodities']
    }
    if (title.includes('retail') || title.includes('consumer')) {
        return ['Consumer']
    }
    if (title.includes('housing') || title.includes('real estate') || title.includes('property')) {
        return ['Real Estate']
    }
    if (title.includes('market') || title.includes('stock') || title.includes('index')) {
        return ['Markets']
    }

    return ['General']
}

export async function GET() {
    console.log('API Route: Starting news fetch')
    console.log('API Key available:', !!ALPHA_VANTAGE_API_KEY)

    if (!ALPHA_VANTAGE_API_KEY) {
        console.error('API Route: Missing Alpha Vantage API key')
        return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    try {
        console.log('API Route: Fetching from Alpha Vantage (Simplified Topics)')
        const apiUrl = `${NEWS_API_URL}?function=NEWS_SENTIMENT&topics=financial_markets&apikey=${ALPHA_VANTAGE_API_KEY}`
        console.log('API URL (without key):', apiUrl.replace(ALPHA_VANTAGE_API_KEY, 'HIDDEN'))

        const newsResponse = await fetch(apiUrl)
        console.log('API Response Status:', newsResponse.status)
        console.log('API Response Headers:', Object.fromEntries(newsResponse.headers.entries()))

        const responseText = await newsResponse.text()
        console.log('Raw API Response:', responseText.substring(0, 500) + '...')

        if (!newsResponse.ok) {
            console.error('API Route: Alpha Vantage response not ok:', newsResponse.status)
            // If API fails, use sample data for debugging
            console.log('Using sample data for debugging (Simplified Topics Test)')
            const newsItems = SAMPLE_NEWS.map(item => ({
                title: item.title,
                summary: item.summary,
                url: item.url,
                source: item.source,
                timePublished: item.time_published,
                sentiment: item.overall_sentiment_label,
                topics: categorizeNews(item)
            }))
            return NextResponse.json(newsItems)
        }

        let newsData
        try {
            newsData = JSON.parse(responseText)
        } catch (e) {
            console.error('Failed to parse JSON:', e)
            throw new Error('Invalid JSON response from Alpha Vantage')
        }

        if (!newsData.feed || !Array.isArray(newsData.feed) || newsData.feed.length === 0) {
            console.error('API Route: Invalid or empty data format received:', newsData)
            // If invalid format or empty feed, use sample data for debugging
            console.log('Using sample data due to invalid/empty format (Simplified Topics Test)')
            const newsItems = SAMPLE_NEWS.map(item => ({
                title: item.title,
                summary: item.summary,
                url: item.url,
                source: item.source,
                timePublished: item.time_published,
                sentiment: item.overall_sentiment_label,
                topics: categorizeNews(item)
            }))
            return NextResponse.json(newsItems)
        }

        const newsItems = newsData.feed.map((item: any) => ({
            title: item.title,
            summary: item.summary,
            url: item.url,
            source: item.source,
            timePublished: item.time_published,
            sentiment: item.overall_sentiment_label,
            topics: categorizeNews(item)
        }))

        newsItems.sort((a: any, b: any) =>
            new Date(b.timePublished).getTime() - new Date(a.timePublished).getTime()
        )

        console.log(`API Route: Successfully processed ${newsItems.length} news items (Simplified Topics Test)`)
        return NextResponse.json(newsItems)
    } catch (error) {
        console.error('API Route: Error details:', error)
        // In case of any error, return sample data for debugging
        console.log('Using sample data due to error (Simplified Topics Test)')
        const newsItems = SAMPLE_NEWS.map(item => ({
            title: item.title,
            summary: item.summary,
            url: item.url,
            source: item.source,
            timePublished: item.time_published,
            sentiment: item.overall_sentiment_label,
            topics: categorizeNews(item)
        }))
        return NextResponse.json(newsItems)
    }
} 