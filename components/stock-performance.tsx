"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { ChartContainer, ChartTooltip, LineChart } from "@/components/ui/chart"
import { useWatchlist } from "@/lib/context/watchlist-context"
import { fetchStockData } from "@/lib/actions/stock-actions"
import { AlertCircle, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface StockPerformanceProps extends React.HTMLAttributes<HTMLDivElement> { }

export function StockPerformance({ className, ...props }: StockPerformanceProps) {
  const [period, setPeriod] = useState("1m")
  const { selectedStocks } = useWatchlist()
  const [stockData, setStockData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUsingSimulatedData, setIsUsingSimulatedData] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)

  // Define colors for each stock
  const stockColors: Record<string, string> = {
    AAPL: "#10b981", // Green
    MSFT: "#3b82f6", // Blue
    GOOGL: "#f59e0b", // Orange
    AMZN: "#ef4444", // Red
    TSLA: "#8b5cf6", // Purple
    NVDA: "#06b6d4", // Cyan
    META: "#6366f1", // Indigo
    JPM: "#14b8a6", // Teal
    V: "#f43f5e", // Pink
    JNJ: "#22c55e", // Lime
  }

  useEffect(() => {
    let isMounted = true

    async function loadStockData() {
      if (!isMounted) return

      setIsLoading(true)
      setError(null)
      setIsUsingSimulatedData(false)
      setDebugInfo(null)

      try {
        const symbols = ["AAPL", "MSFT", "GOOGL", "AMZN"]
        console.log(`Fetching stock data for period: ${period}`)

        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Request timeout")), 10000))

        const dataPromise = fetchStockData(symbols, period)
        const data = await Promise.race([dataPromise, timeoutPromise])

        if (!isMounted) return

        if (!data || data.length === 0) {
          setError("No stock data available for the selected period.")
          return
        }

        setStockData(data)
        console.log(`Received ${data.length} data points`)

        // Check if we're using simulated data
        if (data._simulated) {
          setIsUsingSimulatedData(true)
          setDebugInfo("Using simulated data")
          delete data._simulated
        }
      } catch (error: any) {
        if (!isMounted) return

        console.error("Failed to load stock data:", error)
        setError(`API connection issue: ${error.message || "Unknown error"}`)
        setDebugInfo("Using simulated data instead")
        setIsUsingSimulatedData(true)

        // Generate fallback data
        const endDate = new Date()
        let startDate: Date
        switch (period) {
          case "1w":
            startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000)
            break
          case "1m":
            startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000)
            break
          case "3m":
            startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000)
            break
          case "1y":
            startDate = new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000)
            break
          default:
            startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000)
        }

        const fallbackData = generateFallbackData(["AAPL", "MSFT", "GOOGL", "AMZN"], startDate, endDate, period)
        fallbackData._simulated = true
        setStockData(fallbackData)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadStockData()

    return () => {
      isMounted = false
    }
  }, [period])

  // Generate fallback data if API fails completely
  function generateFallbackData(symbols: string[], startDate: Date, endDate: Date, period: string) {
    const result = []
    const dayMs = 24 * 60 * 60 * 1000
    let step: number

    switch (period) {
      case "1w":
        step = dayMs / 3
        break
      case "1m":
        step = dayMs
        break
      case "3m":
        step = 3 * dayMs
        break
      case "1y":
        step = 7 * dayMs
        break
      default:
        step = dayMs
    }

    for (let time = startDate.getTime(); time <= endDate.getTime(); time += step) {
      const date = new Date(time)
      const dataPoint: any = {
        date: date.toISOString().split("T")[0],
        formattedDate: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      }

      symbols.forEach((symbol) => {
        const seed = time + symbol.charCodeAt(0) * 1000
        const random = Math.sin(seed) * 10000 - Math.floor(Math.sin(seed) * 10000)
        const basePrice = stockColors[symbol] ? 100 + Object.keys(stockColors).indexOf(symbol) * 20 : 100
        dataPoint[symbol] = basePrice * (1 + (random * 0.2 - 0.1))
      })

      result.push(dataPoint)
    }

    return result
  }

  // Filter categories to only include selected stocks
  const filteredCategories = selectedStocks.length > 0 ? selectedStocks : ["AAPL", "MSFT"]

  // Get colors for selected stocks
  const selectedColors = filteredCategories.map((symbol) => stockColors[symbol] || "#6b7280")

  // Calculate percentage change for each stock
  const calculatePerformance = () => {
    if (stockData.length < 2) return []

    const firstDataPoint = stockData[0]
    const lastDataPoint = stockData[stockData.length - 1]

    return filteredCategories.map((symbol) => {
      const startPrice = firstDataPoint[symbol]
      const endPrice = lastDataPoint[symbol]

      // Check if we have valid price data
      if (startPrice === undefined || endPrice === undefined) {
        return {
          symbol,
          percentChange: "N/A",
          hasData: false,
        }
      }

      const percentChange = ((endPrice - startPrice) / startPrice) * 100

      return {
        symbol,
        percentChange: percentChange.toFixed(2),
        hasData: true,
      }
    })
  }

  const performance = calculatePerformance()

  return (
    <Card className={cn(className)} {...props}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle>Stock Performance</CardTitle>
          <CardDescription>Compare selected stocks</CardDescription>
        </div>
        <Tabs defaultValue="1m" value={period} onValueChange={setPeriod}>
          <TabsList>
            <TabsTrigger value="1w">1W</TabsTrigger>
            <TabsTrigger value="1m">1M</TabsTrigger>
            <TabsTrigger value="3m">3M</TabsTrigger>
            <TabsTrigger value="1y">1Y</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {isUsingSimulatedData && (
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertTitle>Using simulated data</AlertTitle>
            <AlertDescription>Stock price history is simulated for demonstration purposes.</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert
            variant="default"
            className="mb-4 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>API Connection Issue</AlertTitle>
            <AlertDescription>Using simulated data instead.</AlertDescription>
          </Alert>
        )}

        {performance.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            {performance.map(({ symbol, percentChange, hasData }) => (
              <div key={symbol} className="bg-muted/50 p-2 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{symbol}</div>
                  {hasData ? (
                    <div
                      className={cn(
                        "text-sm font-bold",
                        Number.parseFloat(percentChange) >= 0 ? "text-green-500" : "text-red-500",
                      )}
                    >
                      {Number.parseFloat(percentChange) >= 0 ? "+" : ""}
                      {percentChange}%
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">N/A</div>
                  )}
                </div>
                <div
                  className="h-1 mt-1 rounded-full"
                  style={{
                    backgroundColor: stockColors[symbol] || "#6b7280",
                    opacity: hasData ? 0.7 : 0.3,
                  }}
                ></div>
              </div>
            ))}
          </div>
        )}

        <div className="h-[300px] w-full">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-muted-foreground">Loading stock data...</div>
            </div>
          ) : error && !stockData.length ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-muted-foreground">Using simulated data</div>
            </div>
          ) : (
            <ChartContainer>
              <LineChart
                data={stockData}
                index="formattedDate"
                categories={filteredCategories}
                colors={selectedColors}
                valueFormatter={(value) => `${value}`}
                showLegend={true}
                showXAxis={true}
                showYAxis={true}
                yAxisWidth={60}
                showGridLines={true}
              />
              <ChartTooltip />
            </ChartContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
