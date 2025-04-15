"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { ArrowDown, ArrowUp, DollarSign } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ChartContainer, LineChart } from "@/components/ui/chart"
import { generatePortfolioSnapshots } from "@/lib/db/portfolio-snapshots"

interface PortfolioOverviewProps extends React.HTMLAttributes<HTMLDivElement> {}

export function PortfolioOverview({ className, ...props }: PortfolioOverviewProps) {
  const [portfolioData, setPortfolioData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Generate portfolio snapshots from transactions
    const generatedSnapshots = generatePortfolioSnapshots()

    // Format data for the chart
    const chartData = generatedSnapshots.map((snapshot) => ({
      date: formatDate(snapshot.date),
      value: snapshot.totalValue,
      transaction: snapshot.transaction,
      change: snapshot.change,
      changePercent: snapshot.changePercent,
    }))

    setPortfolioData(chartData)
    setIsLoading(false)
  }, [])

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(date)
  }

  const currentValue = portfolioData.length > 0 ? portfolioData[portfolioData.length - 1].value : 0
  const previousValue = portfolioData.length > 1 ? portfolioData[portfolioData.length - 2].value : 0
  const percentageChange = previousValue === 0 ? 0 : ((currentValue - previousValue) / previousValue) * 100
  const isPositive = percentageChange >= 0

  return (
    <Card className={cn("overflow-hidden", className)} {...props}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle>Portfolio Value</CardTitle>
          <CardDescription>Total value of your investments</CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span className="text-2xl font-bold">{currentValue.toLocaleString()}</span>
          <div className={cn("flex items-center text-xs font-medium", isPositive ? "text-green-500" : "text-red-500")}>
            {isPositive ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
            {Math.abs(percentageChange).toFixed(2)}%
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[200px] w-full">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-muted-foreground">Loading chart data...</div>
            </div>
          ) : (
            <ChartContainer>
              <LineChart
                data={portfolioData}
                index="date"
                categories={["value"]}
                colors={["hsl(var(--primary))"]}
                valueFormatter={(value) => `$${value.toLocaleString()}`}
                showLegend={false}
                showXAxis={true}
                showYAxis={true}
                yAxisWidth={60}
                showGridLines={true}
              />
            </ChartContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
