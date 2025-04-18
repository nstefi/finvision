"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Loader2 } from "lucide-react"
import { NewsItem, DEFAULT_WATCHLIST_STOCKS } from "@/lib/types"

interface MarketInsightsProps {
    page?: 'dashboard' | 'insights'
    news: NewsItem[]
    loading: boolean
    error: string | null
    watchlistOnly: boolean
    useAIAnalysis: boolean
    setNews: (news: NewsItem[]) => void
    setLoading: (loading: boolean) => void
    setError: (error: string | null) => void
    setWatchlistOnly: (value: boolean) => void
    setUseAIAnalysis: (value: boolean) => void
}

export function MarketInsights({
    page = 'dashboard',
    news,
    loading,
    error,
    watchlistOnly,
    useAIAnalysis,
    setNews,
    setLoading,
    setError,
    setWatchlistOnly,
    setUseAIAnalysis
}: MarketInsightsProps) {
    const isMobile = useMediaQuery("(max-width: 768px)")
    const [loadingAI, setLoadingAI] = useState(false)

    // Set news limits based on page and screen size
    const getNewsLimit = () => {
        if (page === 'dashboard') {
            return isMobile ? 8 : 12
        } else { // insights page
            return 24 // 8 rows of 3 on desktop, single column on mobile
        }
    }

    useEffect(() => {
        const fetchNews = async () => {
            const isFetchingAI = page === 'insights' && useAIAnalysis
            try {
                setLoading(true)
                setError(null)
                setLoadingAI(isFetchingAI)

                let queryParams = watchlistOnly ? `?symbols=${DEFAULT_WATCHLIST_STOCKS.join(',')}` : ''
                if (isFetchingAI) {
                    queryParams += queryParams ? '&' : '?'
                    queryParams += 'useAI=true'
                }

                const response = await fetch(`/api/yahoo-news${queryParams}`)

                if (!response.ok) {
                    const errorText = await response.text()
                    try {
                        // Try to parse as JSON
                        const errorJson = JSON.parse(errorText)
                        throw new Error(errorJson.error || `Server error: ${response.status}`)
                    } catch (parseError) {
                        // If not JSON, use the text
                        throw new Error(`Failed to fetch news: ${response.status} ${errorText.slice(0, 100)}`)
                    }
                }

                const data = await response.json()

                if (!Array.isArray(data)) {
                    throw new Error('Invalid data format received from server')
                }

                setNews(data)
            } catch (err) {
                console.error("News fetch error:", err)
                setError(err instanceof Error ? err.message : 'Failed to load news')
                setNews([])
            } finally {
                setLoading(false)
                setLoadingAI(false)
            }
        }

        fetchNews()
    }, [watchlistOnly, useAIAnalysis, page, setError, setLoading, setNews])

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

    const formatDateTime = (timestamp: string) => {
        const date = new Date(timestamp)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')

        return `${year}-${month}-${day} ${hours}:${minutes}`
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
                    <CardDescription className="text-red-500">Error loading news: {error}</CardDescription>
                </CardHeader>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex items-center flex-wrap gap-3">
                    <CardTitle>Market Insights</CardTitle>

                    <div className="flex items-center space-x-2">
                        <Switch
                            id="watchlist-mode"
                            checked={watchlistOnly}
                            onCheckedChange={setWatchlistOnly}
                        />
                        <Label htmlFor="watchlist-mode" className="text-sm text-muted-foreground">
                            {watchlistOnly ? 'Watchlist Only' : 'All Stocks'}
                        </Label>
                    </div>

                    {page === 'insights' && (
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="ai-analysis-mode"
                                checked={useAIAnalysis}
                                onCheckedChange={setUseAIAnalysis}
                                disabled={loading}
                            />
                            <Label htmlFor="ai-analysis-mode" className="text-sm font-medium text-muted-foreground">
                                Tag news using Google AI (Gemini)
                            </Label>
                        </div>
                    )}
                </div>
                <CardDescription>
                    {watchlistOnly
                        ? 'Latest news for watchlist stocks'
                        : 'Latest market news'}
                    {page === 'insights' && useAIAnalysis &&
                        <span className="text-blue-600"> (AI Analyzed)</span>}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {news.length === 0 ? (
                        <div className="col-span-3 text-center text-gray-500">
                            <div>No news articles available for watchlist stocks</div>
                        </div>
                    ) : (
                        news.slice(0, getNewsLimit()).map((item, index) => (
                            <div key={index} className="flex flex-col space-y-1">
                                <div className="flex items-center gap-2">
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
                                        {formatDateTime(item.timePublished)}
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