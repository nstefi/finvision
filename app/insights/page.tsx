"use client"

import { useState } from "react"
import { DashboardShell } from "@/components/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard-header"
import { MarketInsights } from "@/components/market-insights"
import { AiInsightsCard } from "@/components/ai-insights-card"

// --- Type Definition (reuse from components) ---
interface NewsItem {
  title: string
  url: string
  timePublished: string
  topics: string[]
  sentiment: string
  source: string
  relatedSymbols: string[]
}

export default function InsightsPage() {
  // Lift state up from MarketInsights
  const [news, setNews] = useState<NewsItem[]>([])
  const [loadingNews, setLoadingNews] = useState(true)
  const [errorNews, setErrorNews] = useState<string | null>(null)
  const [watchlistOnly, setWatchlistOnly] = useState(true)
  const [useAIAnalysis, setUseAIAnalysis] = useState(false)

  // Determine relevant symbols based on watchlist toggle
  // Note: Assuming watchlistSymbols is defined somewhere accessible or passed down
  // For simplicity here, let's redefine it or import if available globally.
  const watchlistSymbols = ["AAPL", "MSFT", "GOOGL", "AMZN"]
  const relevantSymbols = watchlistOnly ? watchlistSymbols : [] // Empty array could signify 'all' for the insights card, or fetch all symbols if needed

  return (
    <DashboardShell>
      <DashboardHeader heading="Insights" text="Market insights and analysis." />
      <div className="mt-6 grid gap-6">
        {/* Pass state and setters down to MarketInsights */}
        <MarketInsights
          page="insights"
          // Pass down state
          news={news}
          loading={loadingNews}
          error={errorNews}
          watchlistOnly={watchlistOnly}
          useAIAnalysis={useAIAnalysis}
          // Pass down setters
          setNews={setNews}
          setLoading={setLoadingNews}
          setError={setErrorNews}
          setWatchlistOnly={setWatchlistOnly}
          setUseAIAnalysis={setUseAIAnalysis}
        />
        {/* Render AiInsightsCard below, passing necessary props */}
        <AiInsightsCard
          news={news}
          relevantSymbols={relevantSymbols} // Pass symbols currently being viewed
          isLoadingNews={loadingNews} // Let it know if the news itself is loading
        />
      </div>
    </DashboardShell>
  )
}
