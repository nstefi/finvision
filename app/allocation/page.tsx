import { DashboardShell } from "@/components/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard-header"
import { PortfolioAllocation } from "@/components/portfolio-allocation"

export default function AllocationPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Asset Allocation" text="Analyze your portfolio's asset allocation." />
      <div className="mt-6">
        <PortfolioAllocation />
      </div>
    </DashboardShell>
  )
}
