"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
import { ChartContainer, LineChart } from "@/components/ui/chart"

export function PortfolioPerformance() {
  const [timeframe, setTimeframe] = useState("1y")

  // Sample performance data for different timeframes
  const performanceData = {
    "1m": [
      { date: "Week 1", portfolio: 172000, benchmark: 170000 },
      { date: "Week 2", portfolio: 173500, benchmark: 171200 },
      { date: "Week 3", portfolio: 175800, benchmark: 172500 },
      { date: "Week 4", portfolio: 178000, benchmark: 173800 },
    ],
    "3m": [
      { date: "Jan", portfolio: 165000, benchmark: 164000 },
      { date: "Feb", portfolio: 170000, benchmark: 168000 },
      { date: "Mar", portfolio: 178000, benchmark: 173800 },
    ],
    "1y": [
      { date: "Apr 2023", portfolio: 145000, benchmark: 142000 },
      { date: "Jun 2023", portfolio: 150000, benchmark: 146000 },
      { date: "Aug 2023", portfolio: 155000, benchmark: 150000 },
      { date: "Oct 2023", portfolio: 160000, benchmark: 154000 },
      { date: "Dec 2023", portfolio: 165000, benchmark: 158000 },
      { date: "Feb 2024", portfolio: 170000, benchmark: 162000 },
      { date: "Apr 2024", portfolio: 178000, benchmark: 166000 },
    ],
    "3y": [
      { date: "2021", portfolio: 100000, benchmark: 100000 },
      { date: "2022", portfolio: 120000, benchmark: 115000 },
      { date: "2023", portfolio: 150000, benchmark: 140000 },
      { date: "2024", portfolio: 178000, benchmark: 166000 },
    ],
    all: [
      { date: "2020", portfolio: 80000, benchmark: 80000 },
      { date: "2021", portfolio: 100000, benchmark: 100000 },
      { date: "2022", portfolio: 120000, benchmark: 115000 },
      { date: "2023", portfolio: 150000, benchmark: 140000 },
      { date: "2024", portfolio: 178000, benchmark: 166000 },
    ],
  }

  // Calculate performance metrics
  const currentData = performanceData[timeframe as keyof typeof performanceData]
  const firstValue = currentData[0]
  const lastValue = currentData[currentData.length - 1]

  const portfolioReturn = ((lastValue.portfolio - firstValue.portfolio) / firstValue.portfolio) * 100
  const benchmarkReturn = ((lastValue.benchmark - firstValue.benchmark) / firstValue.benchmark) * 100
  const alpha = portfolioReturn - benchmarkReturn

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
        <div>
          <CardTitle>Performance History</CardTitle>
          <CardDescription>Compare your portfolio against the benchmark</CardDescription>
        </div>
        <Tabs value={timeframe} onValueChange={setTimeframe}>
          <TabsList>
            <TabsTrigger value="1m">1M</TabsTrigger>
            <TabsTrigger value="3m">3M</TabsTrigger>
            <TabsTrigger value="1y">1Y</TabsTrigger>
            <TabsTrigger value="3y">3Y</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="text-sm text-muted-foreground">Portfolio Return</div>
            <div className={`text-2xl font-bold ${portfolioReturn >= 0 ? "text-green-500" : "text-red-500"}`}>
              {portfolioReturn >= 0 ? "+" : ""}
              {portfolioReturn.toFixed(2)}%
            </div>
          </div>
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="text-sm text-muted-foreground">Benchmark Return</div>
            <div className={`text-2xl font-bold ${benchmarkReturn >= 0 ? "text-green-500" : "text-red-500"}`}>
              {benchmarkReturn >= 0 ? "+" : ""}
              {benchmarkReturn.toFixed(2)}%
            </div>
          </div>
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="text-sm text-muted-foreground">Alpha</div>
            <div className={`text-2xl font-bold ${alpha >= 0 ? "text-green-500" : "text-red-500"}`}>
              {alpha >= 0 ? "+" : ""}
              {alpha.toFixed(2)}%
            </div>
          </div>
        </div>
        <div className="h-[400px]">
          <ChartContainer>
            <LineChart
              data={performanceData[timeframe as keyof typeof performanceData]}
              index="date"
              categories={["portfolio", "benchmark"]}
              colors={["#3b82f6", "#6b7280"]}
              valueFormatter={(value) => `$${value.toLocaleString()}`}
              showLegend={true}
              showXAxis={true}
              showYAxis={true}
              yAxisWidth={80}
              showGridLines={true}
            />
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}
