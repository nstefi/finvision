"use client"

import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"
import { formatCurrency, formatPercentage } from "@/lib/utils"
import { useWatchlist } from "@/lib/context/watchlist-context"
import { Checkbox } from "@/components/ui/checkbox"

export function WatchlistCard() {
  const [newSymbol, setNewSymbol] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)

  const {
    watchlistSymbols,
    watchlistData,
    loading,
    error,
    addSymbol,
    removeSymbol,
    selectSymbol,
    selectedSymbols,
  } = useWatchlist()

  // Handler for adding a new stock
  const handleAddStock = () => {
    if (newSymbol.trim()) {
      addSymbol(newSymbol.trim())
      setNewSymbol("")
      setDialogOpen(false)
    }
  }

  if (loading && Object.keys(watchlistData).length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Watchlist</CardTitle>
          <CardDescription>Select stocks to compare</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-[140px] flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Loading watchlist data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error && Object.keys(watchlistData).length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Watchlist</CardTitle>
          <CardDescription>Select stocks to compare</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-[140px] flex items-center justify-center">
              <p className="text-sm text-destructive">Error loading watchlist: {error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Watchlist</CardTitle>
          <CardDescription>Select stocks to compare</CardDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setDialogOpen(true)}>+</Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {watchlistSymbols.length === 0 ? (
            <div className="h-[140px] flex items-center justify-center">
              <p className="text-sm text-muted-foreground">
                No stocks in watchlist. Click + to add stocks.
              </p>
            </div>
          ) : (
            <div className="grid gap-2">
              {watchlistSymbols.map((symbol) => {
                const data = watchlistData[symbol] || {};
                const isSelected = selectedSymbols.includes(symbol);
                return (
                  <div
                    key={symbol}
                    className="flex items-center justify-between p-2 rounded border hover:bg-muted"
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`select-${symbol}`}
                        checked={isSelected}
                        onCheckedChange={() => selectSymbol(symbol)}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{symbol}</span>
                        <span className="text-xs text-muted-foreground">
                          {data.name || symbol}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col items-end">
                        <span className="font-medium">
                          {data.price ? formatCurrency(data.price) : "—"}
                        </span>
                        <span
                          className={`text-xs ${data.changePercent === undefined
                            ? ""
                            : data.changePercent >= 0
                              ? "text-green-500"
                              : "text-red-500"
                            }`}
                        >
                          {data.changePercent !== undefined
                            ? formatPercentage(data.changePercent)
                            : "—"}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSymbol(symbol);
                        }}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>

      {/* Add Stock Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to Watchlist</DialogTitle>
            <DialogDescription>
              Enter a stock symbol to add to your watchlist.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="AAPL, MSFT, GOOGL, etc."
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddStock();
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddStock}>Add Stock</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
