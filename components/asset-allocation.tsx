"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, PieChart } from "@/components/ui/chart"
import { getPortfolioHoldings } from "@/lib/actions/portfolio-actions"
import type { Stock } from "@/lib/db/schema"

interface AssetAllocationProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AssetAllocation({ className, ...props }: AssetAllocationProps) {
  const [stockData, setStockData] = useState<Stock[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadStocks() {
      try {
        const data = await getPortfolioHoldings()
        setStockData(data)
      } catch (error) {
        console.error("Failed to load stocks:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStocks()
  }, [])

  // Prepare data for the chart
  const chartData = stockData.map((stock) => ({
    name: stock.symbol,
    value: stock.allocation,
    color: stock.color,
  }))

  return (
    <Card className={className} {...props}>
      <CardHeader className="space-y-1">
        <CardTitle>Stock Allocation</CardTitle>
        <CardDescription>Distribution of your stock portfolio</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-muted-foreground">Loading chart data...</div>
            </div>
          ) : (
            <ChartContainer>
              <PieChart
                data={chartData.sort((a, b) => b.value - a.value)} // Sort data by value in descending order
                index="name"
                category="value"
                valueFormatter={(value) => `${value}%`}
                colors={chartData.map((stock) => stock.color || "#6b7280")}
                showAnimation={true}
                showTooltip={true}
                showLegend={true}
                showLabels={false}
                enableArcLinkLabels={false}
                legendPosition="right"
                margin={{ top: 20, right: 160, bottom: 20, left: 20 }}
                startAngle={0}
                endAngle={360}
                direction="clockwise"
              />
            </ChartContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
