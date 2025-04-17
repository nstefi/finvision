"use client"

import { ArrowDown, ArrowUp, Plus, Minus, AlertCircle, Info } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { useWatchlist } from "@/lib/context/watchlist-context"
import { useEffect, useState } from "react"
import { fetchLatestStockPrices } from "@/lib/actions/stock-actions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { StockData } from "@/lib/types"

export function WatchlistCard() {
  const { toggleStock, isSelected, addStock, watchlistStocks, removeStock, selectedStocks } = useWatchlist()
  const [stockData, setStockData] = useState<Record<string, StockData>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUsingSimulatedData, setIsUsingSimulatedData] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const [showPopup, setShowPopup] = useState(false)
  const [newSymbol, setNewSymbol] = useState("")
  const [addError, setAddError] = useState("")

  useEffect(() => {
    let isMounted = true

    async function loadStockData() {
      if (!isMounted) return

      setIsLoading(true)
      setError(null)
      setIsUsingSimulatedData(false)
      setDebugInfo(null)

      try {
        console.log("Fetching latest stock prices...")

        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Request timeout")), 10000))

        const dataPromise = fetchLatestStockPrices(watchlistStocks)
        const data = (await Promise.race([dataPromise, timeoutPromise])) as Record<
          string,
          StockData
        >

        if (!isMounted) return

        setStockData(data)
        console.log("Received stock price data:", Object.keys(data).length, "symbols")

        // Only mark as simulated if we get an explicit signal from the API call
        if (data._simulated) {
          setIsUsingSimulatedData(true)
          setDebugInfo("Using simulated data due to API limitations")
          delete data._simulated
        }
      } catch (error: any) {
        if (!isMounted) return

        console.error("Failed to load stock data:", error)
        setError(`API connection issue: ${error.message || "Unknown error"}`)
        setDebugInfo("Using simulated data due to API connection issues")
        setIsUsingSimulatedData(true)

        const fallbackData = generateFallbackStockData(watchlistStocks)
        setStockData(fallbackData)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadStockData()

    const intervalId = setInterval(loadStockData, 60000)

    return () => {
      isMounted = false
      clearInterval(intervalId)
    }
  }, [watchlistStocks])

  function generateFallbackStockData(symbols: string[]) {
    const result: Record<string, StockData> & { _simulated?: boolean } = {}

    const stockProfiles: Record<string, StockData> = {
      AAPL: { price: 185.92, change: 1.25 },
      MSFT: { price: 408.35, change: 0.75 },
      GOOGL: { price: 161.25, change: -0.5 },
      AMZN: { price: 182.4, change: 1.1 },
    }

    symbols.forEach((symbol) => {
      result[symbol] = stockProfiles[symbol] || { price: 100, change: 0 }
    })

    // Adding the _simulated property to the result object to indicate these are mock values
    result._simulated = true
    return result
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Watchlist</CardTitle>
            <CardDescription>Select stocks to compare</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => setShowPopup(true)}>
              <Plus className="h-4 w-4" />
              <span className="sr-only">Add stock</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                selectedStocks.forEach(symbol => removeStock(symbol));
              }}
              disabled={selectedStocks.length === 0}
            >
              <Minus className="h-4 w-4" />
              <span className="sr-only">Remove selected stocks</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isUsingSimulatedData && (
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertTitle>Using simulated data</AlertTitle>
            <AlertDescription>Stock prices are simulated for demonstration purposes.</AlertDescription>
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

        {isLoading ? (
          <div className="space-y-3">
            {watchlistStocks.map((symbol) => (
              <div key={symbol} className="flex items-center justify-between animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="h-4 w-4 rounded bg-muted"></div>
                  <div className="space-y-1">
                    <div className="h-4 w-16 bg-muted rounded"></div>
                    <div className="h-3 w-24 bg-muted rounded"></div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="h-4 w-16 bg-muted rounded"></div>
                  <div className="h-3 w-12 bg-muted rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {watchlistStocks.map((symbol) => {
              const stock = {
                symbol,
                name: getStockName(symbol),
                price: stockData[symbol]?.price || 0,
                change: stockData[symbol]?.change || 0,
              }

              return (
                <div key={stock.symbol} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id={`stock-${stock.symbol}`}
                      checked={isSelected(stock.symbol)}
                      onCheckedChange={() => toggleStock(stock.symbol)}
                    />
                    <div className="space-y-0.5">
                      <div className="font-medium">{stock.symbol}</div>
                      <div className="text-xs text-muted-foreground">{stock.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${stock.price.toFixed(2)}</div>
                    <div
                      className={cn("flex items-center text-xs", stock.change >= 0 ? "text-green-500" : "text-red-500")}
                    >
                      {stock.change >= 0 ? (
                        <ArrowUp className="mr-1 h-3 w-3" />
                      ) : (
                        <ArrowDown className="mr-1 h-3 w-3" />
                      )}
                      {Math.abs(stock.change).toFixed(2)}%
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {showPopup && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-black opacity-50" onClick={() => setShowPopup(false)} />
            <div className="relative bg-white rounded-lg shadow-lg p-8 z-10 w-full max-w-sm">
              <div className="mb-4 font-semibold text-lg">Add Stock to Watchlist</div>
              <form onSubmit={async e => {
                e.preventDefault();
                setAddError("");
                if (newSymbol.trim()) {
                  const symbol = newSymbol.trim().toUpperCase();

                  try {
                    console.log(`Validating ticker symbol: ${symbol}`);
                    const data = await fetchLatestStockPrices([symbol]);

                    // Check if we got actual data or simulated fallback data
                    // Yahoo Finance API will return real data for valid tickers
                    if (data._simulated || !data[symbol] || typeof data[symbol].price !== "number") {
                      setAddError(`'${symbol}' is not a valid ticker symbol.`);
                      return;
                    }

                    // Valid symbol with real data from Yahoo Finance
                    addStock(symbol);
                    setShowPopup(false);
                    setNewSymbol("");
                  } catch (err) {
                    console.error("Error validating ticker:", err);
                    setAddError(`'${symbol}' is not a valid ticker symbol.`);
                  }
                }
              }}>
                <input
                  type="text"
                  className="border rounded px-3 py-2 w-full mb-4"
                  placeholder="e.g. TSLA"
                  value={newSymbol}
                  onChange={e => setNewSymbol(e.target.value.toUpperCase())}
                  autoFocus
                />
                {addError && (
                  <div className="text-red-500 text-sm mb-2">{addError}</div>
                )}
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowPopup(false)}>Cancel</Button>
                  <Button type="submit">Add</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Helper function to get stock names
function getStockName(symbol: string): string {
  const stockNames: Record<string, string> = {
    AAPL: "Apple Inc.",
    MSFT: "Microsoft Corp.",
    GOOGL: "Alphabet Inc.",
    AMZN: "Amazon.com Inc.",
    TSLA: "Tesla Inc.",
    NVDA: "NVIDIA Corp.",
    META: "Meta Platforms Inc.",
    JPM: "JPMorgan Chase & Co.",
    V: "Visa Inc.",
    JNJ: "Johnson & Johnson",
  }

  return stockNames[symbol] || `${symbol} Stock`
}
