"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWatchlist } from "@/lib/context/watchlist-context"
import { ArrowDown, ArrowUp, BarChart2 } from "lucide-react"
import { useState, useEffect } from "react"
import { Chart } from "./chart"
import { formatCurrency, formatPercentage } from "@/lib/utils"

interface StockHistoricalData {
  date: string;
  price: number;
  symbol: string;
}

export function StockPerformance() {
  const [timeframe, setTimeframe] = useState("1W")
  const { watchlistData, selectedSymbols } = useWatchlist()
  const [historicalData, setHistoricalData] = useState<StockHistoricalData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch historical data when selected symbols or timeframe changes
  useEffect(() => {
    const fetchHistoricalData = async () => {
      if (!selectedSymbols || selectedSymbols.length === 0) {
        setHistoricalData([])
        return
      }

      setLoading(true)
      setError(null)

      try {
        // Replace with actual API endpoint when available
        const response = await fetch(`/api/historical-prices?symbols=${selectedSymbols.join(',')}&timeframe=${timeframe}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch historical data')
        }

        setHistoricalData(data)
      } catch (err) {
        console.error('Error fetching historical data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load historical data')
        // Fall back to mock data for development
        setHistoricalData(generatePerformanceData(selectedSymbols, timeframe))
      } finally {
        setLoading(false)
      }
    }

    fetchHistoricalData()
  }, [selectedSymbols, timeframe])

  // If no stocks are selected, show instructions
  if (!selectedSymbols || selectedSymbols.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Stock Performance</CardTitle>
          <CardDescription>Compare selected stocks from your watchlist</CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex flex-col items-center justify-center">
          <BarChart2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-sm text-muted-foreground">
            Select one or more stocks from your watchlist to compare performance
          </p>
        </CardContent>
      </Card>
    )
  }

  // Show loading state
  if (loading && historicalData.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Stock Performance</CardTitle>
          <CardDescription>Loading stock data...</CardDescription>
          <Tabs defaultValue={timeframe} className="w-full mt-2" onValueChange={setTimeframe}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="1D">1D</TabsTrigger>
              <TabsTrigger value="1W">1W</TabsTrigger>
              <TabsTrigger value="1M">1M</TabsTrigger>
              <TabsTrigger value="1Y">1Y</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading chart data...</p>
        </CardContent>
      </Card>
    )
  }

  // Use performance data (either real or mock)
  const performanceData = historicalData.length > 0 ? historicalData : generatePerformanceData(selectedSymbols, timeframe)

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Stock Performance</CardTitle>
        <CardDescription>Performance comparison for selected stocks</CardDescription>
        <Tabs defaultValue={timeframe} className="w-full mt-2" onValueChange={setTimeframe}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="1D">1D</TabsTrigger>
            <TabsTrigger value="1W">1W</TabsTrigger>
            <TabsTrigger value="1M">1M</TabsTrigger>
            <TabsTrigger value="1Y">1Y</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {error && (
            <div className="text-sm text-red-500 mb-2">
              {error} (showing sample data)
            </div>
          )}
          <div className="grid grid-cols-1 gap-4">
            <Chart
              data={performanceData}
              xAxisKey="date"
              yAxisKey="price"
              categoryKey="symbol"
              colors={getChartColors(selectedSymbols)}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              {selectedSymbols.map((symbol) => {
                const data = watchlistData[symbol] || {}
                const perfData = performanceData.filter((d) => d.symbol === symbol)
                const firstPrice = perfData[0]?.price || 0
                const lastPrice = perfData[perfData.length - 1]?.price || 0
                const change = lastPrice - firstPrice
                const changePercent = (change / firstPrice) * 100

                return (
                  <div
                    key={symbol}
                    className="flex items-center justify-between p-3 border rounded-md"
                  >
                    <div>
                      <div className="font-medium">{symbol}</div>
                      <div className="text-sm text-muted-foreground">{data.name || symbol}</div>
                    </div>
                    <div className="text-right">
                      <div>{formatCurrency(data.price || 0)}</div>
                      <div
                        className={`flex items-center text-sm ${changePercent >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                      >
                        {changePercent >= 0 ? (
                          <ArrowUp className="h-4 w-4 mr-1" />
                        ) : (
                          <ArrowDown className="h-4 w-4 mr-1" />
                        )}
                        <span>{formatPercentage(Math.abs(changePercent))}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Helper function to generate sample performance data
function generatePerformanceData(symbols: string[], timeframe: string) {
  const data: Array<{ date: string; price: number; symbol: string }> = []
  const today = new Date()
  let days = 7

  switch (timeframe) {
    case "1D":
      days = 1
      break
    case "1W":
      days = 7
      break
    case "1M":
      days = 30
      break
    case "1Y":
      days = 365
      break
  }

  const startDate = new Date(today)
  startDate.setDate(today.getDate() - days)

  const baseValues: Record<string, number> = {}
  symbols.forEach((symbol) => {
    baseValues[symbol] = 100 + Math.random() * 200
  })

  for (let i = 0; i <= days; i++) {
    const currentDate = new Date(startDate)
    currentDate.setDate(startDate.getDate() + i)
    const dateStr = currentDate.toISOString().split('T')[0]

    symbols.forEach((symbol) => {
      const volatility = 0.02
      const lastValue = i === 0 ? baseValues[symbol] : data.find(d => d.symbol === symbol && d.date === data.filter(x => x.symbol === symbol)[i - 1].date)?.price || baseValues[symbol]
      const change = (Math.random() - 0.5) * volatility * lastValue
      const price = lastValue + change

      data.push({
        date: dateStr,
        price,
        symbol
      })
    })
  }

  return data
}

// Helper function to get chart colors for symbols
function getChartColors(symbols: string[]) {
  const colorMap: Record<string, string> = {
    AAPL: "hsl(230, 80%, 60%)",
    MSFT: "hsl(160, 80%, 40%)",
    GOOGL: "hsl(340, 80%, 55%)",
    AMZN: "hsl(30, 80%, 50%)",
    TSLA: "hsl(280, 80%, 50%)",
    NVDA: "hsl(100, 70%, 45%)",
    META: "hsl(200, 80%, 50%)",
    JPM: "hsl(60, 80%, 40%)",
    V: "hsl(260, 80%, 60%)",
    JNJ: "hsl(320, 70%, 55%)",
  }

  return symbols.map((symbol) => colorMap[symbol] || `hsl(${Math.random() * 360}, 70%, 50%)`)
}
