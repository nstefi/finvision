"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, PieChart } from "@/components/ui/chart"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState, useEffect } from "react"
import { getPortfolioHoldings } from "@/lib/actions/portfolio-actions"
import type { Stock } from "@/lib/db/schema"

export function PortfolioAllocation() {
  const [view, setView] = useState("category")
  const [holdings, setHoldings] = useState<Stock[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadHoldings() {
      try {
        const data = await getPortfolioHoldings()
        setHoldings(data)
      } catch (error) {
        console.error("Failed to load holdings:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadHoldings()
  }, [])

  // Group holdings by category
  const categoryData = holdings.reduce(
    (acc, holding) => {
      const existingCategory = acc.find((item) => item.name === holding.category)
      if (existingCategory) {
        existingCategory.value += holding.allocation
      } else {
        acc.push({
          name: holding.category,
          value: holding.allocation,
          color: holding.color,
        })
      }
      return acc
    },
    [] as { name: string; value: number; color?: string }[],
  )

  // For asset class and geography, we'll use mock data for now
  // In a real app, this would come from additional data in the holdings

  const assetClassData = [
    { name: "Stocks", value: 65.0, color: "#3b82f6" },
    { name: "Bonds", value: 15.0, color: "#10b981" },
    { name: "Cash", value: 10.0, color: "#f59e0b" },
    { name: "Real Estate", value: 5.0, color: "#8b5cf6" },
    { name: "Crypto", value: 5.0, color: "#ef4444" },
  ]

  const geographyData = [
    { name: "United States", value: 60.0, color: "#3b82f6" },
    { name: "Europe", value: 15.0, color: "#10b981" },
    { name: "Asia Pacific", value: 12.0, color: "#f59e0b" },
    { name: "Emerging Markets", value: 8.0, color: "#8b5cf6" },
    { name: "Other", value: 5.0, color: "#ef4444" },
  ]

  const getAllocationData = () => {
    switch (view) {
      case "category":
        return categoryData
      case "assetClass":
        return assetClassData
      case "geography":
        return geographyData
      default:
        return categoryData
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
        <div>
          <CardTitle>Portfolio Allocation</CardTitle>
          <CardDescription>Breakdown of your portfolio by different dimensions</CardDescription>
        </div>
        <Tabs value={view} onValueChange={setView}>
          <TabsList>
            <TabsTrigger value="category">Category</TabsTrigger>
            <TabsTrigger value="assetClass">Asset Class</TabsTrigger>
            <TabsTrigger value="geography">Geography</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-muted-foreground">Loading chart data...</div>
            </div>
          ) : (
            <ChartContainer>
              <PieChart
                data={getAllocationData().sort((a, b) => b.value - a.value)} // Sort data by value in descending order
                index="name"
                category="value"
                valueFormatter={(value) => `${value}%`}
                colors={getAllocationData().map((item) => item.color || "#6b7280")}
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
