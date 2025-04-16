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

export default function DashboardPage() {
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
          <MarketInsights page="dashboard" />
        </div>
      </WatchlistProvider>

      <div className="mt-4">
        <RecentTransactions />
      </div>
    </DashboardShell>
  )
}
