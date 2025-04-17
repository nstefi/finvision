"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { StockChart } from "@/components/ui/stock-chart"
import { useWatchlist } from "@/lib/context/watchlist-context"
import { AlertCircle, LineChart } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useTheme } from "next-themes"
import { darkThemePalette, lightThemePalette } from "@/lib/types"

interface StockPerformanceProps extends React.HTMLAttributes<HTMLDivElement> { }

export function StockPerformance({ className, ...props }: StockPerformanceProps) {
  const [period, setPeriod] = useState("1m")
  const { selectedStocks } = useWatchlist()
  const [stockData, setStockData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  // Generate stock colors dynamically based on current theme
  const stockColors = useMemo(() => {
    const palette = isDark ? darkThemePalette : lightThemePalette
    return selectedStocks.reduce((colors, symbol, index) => {
      colors[symbol] = palette[index % palette.length]
      return colors
    }, {} as Record<string, string>)
  }, [selectedStocks, isDark])

  useEffect(() => {
    let isMounted = true

    async function loadStockData() {
      if (!isMounted || selectedStocks.length === 0) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        console.log(`Fetching stock data for: ${selectedStocks.join(", ")}, period: ${period}`)

        // Use the Next.js API route instead of Netlify function
        const url = `/api/stock-data?symbols=${selectedStocks.join(',')}&period=${period}`
        console.log(`Calling API endpoint: ${url}`)

        const response = await fetch(url)

        // Log the response status
        console.log(`API response status: ${response.status}`)

        // Check if the response is OK
        if (!response.ok) {
          const text = await response.text()
          console.error(`API error (${response.status}): ${text}`)

          try {
            // Try to parse it as JSON anyway
            const errorData = JSON.parse(text)
            setError(errorData.error || `API returned status code ${response.status}`)
          } catch (parseError) {
            // If it's not valid JSON, show the raw text (limited)
            const truncatedText = text.length > 100
              ? text.substring(0, 100) + "..."
              : text
            setError(`API returned non-JSON response: ${truncatedText}`)
          }

          setIsLoading(false)
          return
        }

        const data = await response.json()
        console.log(`Received data with ${data.length || 0} points`)

        if (!isMounted) return

        if (!data || data.error) {
          console.error("API returned error:", data.error)
          setError(data.error || "No stock data available for the selected period.")
          return
        }

        if (data.length === 0) {
          console.log("API returned empty data array")
          setError("No stock data available for the selected period.")
          return
        }

        setStockData(data)
      } catch (error: any) {
        if (!isMounted) return

        console.error("Failed to load stock data:", error)
        setError(`API connection issue: ${error.message || "Unknown error"}`)
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
  }, [period, selectedStocks])

  // Calculate percentage change for each stock
  const calculatePerformance = () => {
    if (stockData.length < 2) return []

    const firstDataPoint = stockData[0]
    const lastDataPoint = stockData[stockData.length - 1]

    return selectedStocks.map((symbol) => {
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
        {error && (
          <Alert
            variant="default"
            className="mb-4 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>API Connection Issue</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {selectedStocks.length > 0 && performance.length > 0 && (
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
              </div>
            ))}
          </div>
        )}

        <div className="h-[300px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : selectedStocks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-2">
              <LineChart className="h-12 w-12 mb-2 opacity-50" />
              <div className="text-center">
                <p className="font-medium">No stocks selected</p>
                <p className="text-sm">Select one or more stocks from the watchlist to compare their performance</p>
              </div>
            </div>
          ) : stockData.length > 0 ? (
            <StockChart
              data={stockData}
              symbols={selectedStocks}
              colors={stockColors}
              isLoading={isLoading}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
