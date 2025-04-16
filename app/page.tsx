"use client"

import { useState } from "react"
import { DashboardShell } from "@/components/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard-header"
import { PortfolioOverview } from "@/components/portfolio-overview"
import { StockPerformance } from "@/components/stock-performance"
import { RecentTransactions } from "@/components/recent-transactions"
import { AssetAllocation } from "@/components/asset-allocation"
import { MarketInsights } from "@/components/market-insights"
import { WatchlistCard } from "@/components/watchlist-card"
import { StockList } from "@/components/stock-list"
import { WatchlistProvider } from "@/lib/context/watchlist-context"

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

export default function DashboardPage() {
  // State for MarketInsights on Dashboard
  const [dashboardNews, setDashboardNews] = useState<NewsItem[]>([])
  const [loadingDashboardNews, setLoadingDashboardNews] = useState(true)
  const [errorDashboardNews, setErrorDashboardNews] = useState<string | null>(null)
  // Note: watchlistOnly and useAIAnalysis might not be needed here if dashboard defaults
  const [dashboardWatchlistOnly, setDashboardWatchlistOnly] = useState(true)
  // AI Analysis is off by default on dashboard and toggle is not shown
  const dashboardUseAIAnalysis = false
  const setDashboardUseAIAnalysis = () => { } // No-op setter for dashboard

  return (
    <DashboardShell>
      <DashboardHeader heading="Portfolio Dashboard" text="Track and analyze your financial portfolio performance." />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <PortfolioOverview className="lg:col-span-2" />
        <AssetAllocation />
      </div>
      <div className="mt-4">
        <StockList />
      </div>

      <WatchlistProvider>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <WatchlistCard />
          <StockPerformance />
        </div>
        <div className="mt-4">
          <MarketInsights
            page="dashboard"
            news={dashboardNews}
            loading={loadingDashboardNews}
            error={errorDashboardNews}
            watchlistOnly={dashboardWatchlistOnly}
            useAIAnalysis={dashboardUseAIAnalysis} // Always false for dashboard
            setNews={setDashboardNews}
            setLoading={setLoadingDashboardNews}
            setError={setErrorDashboardNews}
            setWatchlistOnly={setDashboardWatchlistOnly}
            setUseAIAnalysis={setDashboardUseAIAnalysis} // No-op setter
          />
        </div>
      </WatchlistProvider>

      <div className="mt-4">
        <RecentTransactions />
      </div>
    </DashboardShell>
  )
}
