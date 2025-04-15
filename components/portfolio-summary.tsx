"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDown, ArrowUp, TrendingUp, DollarSign, Percent, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { getPortfolioSummary } from "@/lib/actions/portfolio-actions"

export function PortfolioSummary() {
  const [summary, setSummary] = useState({
    totalValue: 0,
    dailyChange: 0,
    dailyChangePercent: 0,
    annualReturn: 0,
    annualReturnChange: 0,
    inceptionDate: "",
    inceptionDuration: "",
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadSummary() {
      try {
        const data = await getPortfolioSummary()
        setSummary(data)
      } catch (error) {
        console.error("Failed to load portfolio summary:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSummary()
  }, [])

  const portfolioMetrics = [
    {
      title: "Total Value",
      value: `$${summary.totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      change: `${summary.dailyChangePercent >= 0 ? "+" : ""}${summary.dailyChangePercent.toFixed(2)}%`,
      isPositive: summary.dailyChangePercent >= 0,
      icon: DollarSign,
    },
    {
      title: "Daily Change",
      value: `$${Math.abs(summary.dailyChange).toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      change: `${summary.dailyChangePercent >= 0 ? "+" : ""}${summary.dailyChangePercent.toFixed(2)}%`,
      isPositive: summary.dailyChangePercent >= 0,
      icon: TrendingUp,
    },
    {
      title: "Annual Return",
      value: `${summary.annualReturn}%`,
      change: `${summary.annualReturnChange >= 0 ? "+" : ""}${summary.annualReturnChange}%`,
      isPositive: summary.annualReturnChange >= 0,
      icon: Percent,
    },
    {
      title: "Inception Date",
      value: summary.inceptionDate,
      change: summary.inceptionDuration,
      isPositive: true,
      icon: Calendar,
    },
  ]

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
              <div className="h-3 w-16 bg-muted rounded animate-pulse mt-2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {portfolioMetrics.map((metric, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
            <metric.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <p className={cn("text-xs", metric.isPositive ? "text-green-500" : "text-red-500")}>
              <span className="flex items-center">
                {metric.isPositive ? <ArrowUp className="mr-1 h-3 w-3" /> : <ArrowDown className="mr-1 h-3 w-3" />}
                {metric.change}
              </span>
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
