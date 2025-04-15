"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDown, ArrowUp, DollarSign, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { getTransactionStats } from "@/lib/actions/transaction-actions"

export function TransactionSummary() {
  const [stats, setStats] = useState({
    totalBuys: 0,
    totalSells: 0,
    buyCount: 0,
    sellCount: 0,
    netCashFlow: 0,
    lastTransaction: { date: "" },
    daysSinceLastTransaction: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getTransactionStats()
        setStats(data)
      } catch (error) {
        console.error("Failed to load transaction stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [])

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  const transactionMetrics = [
    {
      title: "Total Buys",
      value: `$${stats.totalBuys.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      change: `${stats.buyCount} transactions`,
      isPositive: true,
      icon: ArrowDown,
    },
    {
      title: "Total Sells",
      value: `$${stats.totalSells.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      change: `${stats.sellCount} transactions`,
      isPositive: false,
      icon: ArrowUp,
    },
    {
      title: "Net Cash Flow",
      value: `$${stats.netCashFlow.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      change: "Last 30 days",
      isPositive: stats.netCashFlow >= 0,
      icon: DollarSign,
    },
    {
      title: "Last Transaction",
      value: formatDate(stats.lastTransaction?.date || ""),
      change: `${stats.daysSinceLastTransaction} days ago`,
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
      {transactionMetrics.map((metric, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
            <metric.icon
              className={cn(
                "h-4 w-4",
                metric.title === "Total Buys"
                  ? "text-green-500"
                  : metric.title === "Total Sells"
                    ? "text-red-500"
                    : metric.title === "Net Cash Flow"
                      ? metric.isPositive
                        ? "text-green-500"
                        : "text-red-500"
                      : "text-muted-foreground",
              )}
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <p className="text-xs text-muted-foreground">{metric.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
