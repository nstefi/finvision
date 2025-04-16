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
}

export function MarketInsights() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [debug, setDebug] = useState<string[]>([])

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setDebug(prev => [...prev, 'Starting news fetch...'])
        const response = await fetch('/api/news')
        setDebug(prev => [...prev, `Response status: ${response.status}`])

        if (!response.ok) {
          throw new Error('Failed to fetch news')
        }

        const data = await response.json()
        setDebug(prev => [...prev, `Received ${Array.isArray(data) ? data.length : 0} news items`])

        if (!Array.isArray(data)) {
          console.error('Expected array of news items, got:', typeof data)
          throw new Error('Invalid data format')
        }

        setNews(data)
      } catch (err) {
        console.error('Error details:', err)
        setError('Failed to load news')
        setDebug(prev => [...prev, `Error: ${err instanceof Error ? err.message : 'Unknown error'}`])
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
  }, [])

  const getBadgeVariant = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case 'bullish':
        return 'default'
      case 'bearish':
        return 'destructive'
      default:
        return 'outline'
    }
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
          <CardTitle>Market Insights [v1.2]</CardTitle>
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
          <div className="mt-4 text-sm text-gray-500">
            <div>Debug Info:</div>
            {debug.map((msg, i) => (
              <div key={i}>{msg}</div>
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
          <CardTitle>Market Insights [v1.2]</CardTitle>
          <CardDescription className="text-red-500">{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mt-4 text-sm text-gray-500">
            <div>Debug Info:</div>
            {debug.map((msg, i) => (
              <div key={i}>{msg}</div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Market Insights [v1.2]</CardTitle>
        <CardDescription>Latest market news and analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {news.length === 0 ? (
            <div className="col-span-3 text-center text-gray-500">
              <div>No news articles available at the moment</div>
              <div className="mt-4 text-sm text-left">
                <div>Debug Info:</div>
                {debug.map((msg, i) => (
                  <div key={i}>{msg}</div>
                ))}
              </div>
            </div>
          ) : (
            news.map((item, index) => (
              <div key={index} className="flex flex-col space-y-1">
                <div className="flex items-center justify-between">
                  <Badge
                    variant={getBadgeVariant(item.sentiment)}
                    className="text-xs"
                  >
                    {item.topics?.[0] || 'General'}
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
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
