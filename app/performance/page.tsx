import { DashboardShell } from "@/components/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard-header"
import { PortfolioPerformance } from "@/components/portfolio-performance"

export default function PerformancePage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Performance" text="Track your portfolio's performance over time." />
      <div className="mt-6">
        <PortfolioPerformance />
      </div>
    </DashboardShell>
  )
}
