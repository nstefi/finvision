import { DashboardShell } from "@/components/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { WatchlistProvider } from "@/lib/context/watchlist-context"
import { WatchlistCard } from "@/components/watchlist-card"
import { StockPerformance } from "@/components/stock-performance"
import { NewsCard } from "@/components/news-card"

export default function MarketPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Market" text="Track market trends and stock performance." />

      <WatchlistProvider>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <WatchlistCard />
          <StockPerformance />
        </div>
      </WatchlistProvider>

      <div className="mt-8">
        <NewsCard />
      </div>
    </DashboardShell>
  )
}
