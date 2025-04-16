"use client"

import { useEffect, useState } from "react"

interface NewsItem {
    title: string
    summary: string
    url: string
    source: string
    timePublished: string
    sentiment: string
    topics: string[]
}

export function NewsCard() {
    const [news, setNews] = useState<NewsItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await fetch('/api/news')
                if (!response.ok) {
                    throw new Error('Failed to fetch news')
                }
                const data = await response.json()
                setNews(data)
            } catch (err) {
                setError('Failed to load news')
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchNews()
    }, [])

    if (loading) {
        return (
            <div className="bg-black rounded-lg p-6">
                <h2 className="text-2xl font-bold text-white mb-2">Market Insights</h2>
                <p className="text-gray-400 mb-6">Latest market news and analysis</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                            <div className="h-6 bg-gray-700 rounded w-24 mb-2"></div>
                            <div className="h-4 bg-gray-700 rounded w-full"></div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-black rounded-lg p-6">
                <h2 className="text-2xl font-bold text-white mb-2">Market Insights</h2>
                <p className="text-red-500">{error}</p>
            </div>
        )
    }

    // Group news by column based on timestamp
    const today = news.filter(item => {
        const hours = Math.floor((Date.now() - new Date(item.timePublished).getTime()) / (1000 * 60 * 60))
        return hours < 24
    })
    const yesterday = news.filter(item => {
        const hours = Math.floor((Date.now() - new Date(item.timePublished).getTime()) / (1000 * 60 * 60))
        return hours >= 24 && hours < 48
    })
    const older = news.filter(item => {
        const hours = Math.floor((Date.now() - new Date(item.timePublished).getTime()) / (1000 * 60 * 60))
        return hours >= 48
    })

    const getBadgeClass = (category: string) => {
        const categories: { [key: string]: string } = {
            'Sector Analysis': 'bg-blue-600',
            'Economic': 'bg-blue-500',
            'Commodities': 'bg-red-600',
            'Consumer': 'bg-blue-700',
            'Real Estate': 'bg-zinc-600',
            'Technology': 'bg-purple-600',
            'Markets': 'bg-green-600'
        }
        return categories[category] || 'bg-gray-600'
    }

    const renderNewsColumn = (items: NewsItem[], timeLabel: string) => (
        <div className="space-y-6">
            {items.map((item, index) => (
                <div key={index}>
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getBadgeClass(item.topics[0])}`}>
                            {item.topics[0]}
                        </span>
                        <span className="text-sm text-gray-400">{timeLabel}</span>
                    </div>
                    <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                    >
                        <h3 className="text-white text-base font-medium hover:text-blue-400 transition-colors">
                            {item.title}
                        </h3>
                    </a>
                </div>
            ))}
        </div>
    )

    return (
        <div className="bg-black rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-2">Market Insights</h2>
            <p className="text-gray-400 mb-6">Latest market news and analysis</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {renderNewsColumn(today, 'Today')}
                {renderNewsColumn(yesterday, 'Yesterday')}
                {renderNewsColumn(older, older[0] ? `${Math.floor((Date.now() - new Date(older[0].timePublished).getTime()) / (1000 * 60 * 60 * 24))} days ago` : '')}
            </div>
        </div>
    )
} 