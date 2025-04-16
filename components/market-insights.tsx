"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface NewsItem {
    title: string
    url: string
    timePublished: string
    topics: string[]
    sentiment: string
    source: string
    relatedSymbols: string[]
}

// Define watchlist symbols (same as in WatchlistCard)
const watchlistSymbols = ["AAPL", "MSFT", "GOOGL", "AMZN"]

export function MarketInsights() {
    const [news, setNews] = useState<NewsItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchNews = async () => {
            try {
                setLoading(true)
                const queryParams = `?symbols=${watchlistSymbols.join(',')}`
                const response = await fetch(`/api/yahoo-news${queryParams}`)
                const data = await response.json()

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch news')
                }

                if (data.error) {
                    throw new Error(data.error)
                }

                if (!Array.isArray(data)) {
                    throw new Error('Invalid data format')
                }

                setNews(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load news')
            } finally {
                setLoading(false)
            }
        }

        fetchNews()
    }, [])

    const getBadgeVariant = (sentiment: string) => {
        switch (sentiment?.toLowerCase()) {
            case 'bullish':
                return 'outline'
            case 'bearish':
                return 'destructive'
            case 'mixed':
                return 'outline'
            case 'neutral':
            default:
                return 'secondary'
        }
    }

    const getBadgeLabel = (sentiment: string, topic: string) => {
        // If we have a sentiment, show it along with the topic
        if (sentiment && sentiment !== 'Neutral') {
            return `${topic} • ${sentiment}`
        }
        // Otherwise just show the topic
        return topic
    }

    const getTimeAgo = (timestamp: string) => {
        const now = new Date()
        const publishedDate = new Date(timestamp)
        const diffInHours = Math.floor((now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60))

        if (diffInHours < 24) {
            return 'Today'
        } else if (diffInHours < 48) {
            return 'Yesterday'
        } else {
            const days = Math.floor(diffInHours / 24)
            return `${days} days ago`
        }
    }

    if (loading) {
        return (
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle>Market Insights</CardTitle>
                    <CardDescription>Loading latest market news...</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="animate-pulse space-y-2">
                                <div className="h-5 bg-gray-200 rounded w-24"></div>
                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (error) {
        return (
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle>Market Insights</CardTitle>
                    <CardDescription className="text-red-500">{error}</CardDescription>
                </CardHeader>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle>Market Insights</CardTitle>
                <CardDescription>Latest news for watchlist stocks</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {news.length === 0 ? (
                        <div className="col-span-3 text-center text-gray-500">
                            <div>No news articles available for watchlist stocks</div>
                        </div>
                    ) : (
                        news.map((item, index) => (
                            <div key={index} className="flex flex-col space-y-1">
                                <div className="flex items-center justify-between">
                                    <Badge
                                        variant={getBadgeVariant(item.sentiment)}
                                        className={`text-xs ${item.sentiment?.toLowerCase() === 'bullish'
                                            ? 'bg-green-500 hover:bg-green-600 text-white border-transparent'
                                            : ''
                                            }`}
                                    >
                                        {getBadgeLabel(item.sentiment, item.topics?.[0] || 'General')}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                        {getTimeAgo(item.timePublished)}
                                    </span>
                                </div>
                                <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm font-medium hover:text-blue-600 transition-colors"
                                >
                                    {item.title}
                                </a>
                                <span className="text-xs text-muted-foreground">
                                    Source: {item.source}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    )
} 