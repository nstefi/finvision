import { DashboardShell } from "@/components/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard-header"
import { MarketInsights } from "@/components/market-insights"

export default function InsightsPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Insights" text="Market insights and analysis." />
      <div className="mt-6">
        <MarketInsights />
      </div>
    </DashboardShell>
  )
}
