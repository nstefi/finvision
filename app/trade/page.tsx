import { DashboardShell } from "@/components/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function TradePage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Trade" text="Execute trades and manage your portfolio." />

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Trading Platform</CardTitle>
            <CardDescription>Execute buy and sell orders</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Trading functionality will be implemented here.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
