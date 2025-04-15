import { DashboardShell } from "@/components/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PortfolioSummary } from "@/components/portfolio-summary"
import { PortfolioHoldings } from "@/components/portfolio-holdings"
import { PortfolioPerformance } from "@/components/portfolio-performance"
import { PortfolioAllocation } from "@/components/portfolio-allocation"

export default function PortfolioPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Portfolio" text="Comprehensive view of your investment portfolio." />

      <PortfolioSummary />

      <Tabs defaultValue="holdings" className="mt-6">
        <TabsList>
          <TabsTrigger value="holdings">Holdings</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="allocation">Allocation</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        <TabsContent value="holdings" className="mt-4">
          <PortfolioHoldings />
        </TabsContent>
        <TabsContent value="performance" className="mt-4">
          <PortfolioPerformance />
        </TabsContent>
        <TabsContent value="allocation" className="mt-4">
          <PortfolioAllocation />
        </TabsContent>
        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>History of all your portfolio transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Coming soon: Transaction history with filtering and sorting options.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}
