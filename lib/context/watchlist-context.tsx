"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface WatchlistContextType {
  selectedStocks: string[]
  watchlistStocks: string[]
  toggleStock: (symbol: string) => void
  isSelected: (symbol: string) => boolean
  addStock: (symbol: string) => void
  removeStock: (symbol: string) => void
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined)

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const [selectedStocks, setSelectedStocks] = useState<string[]>([]) // Start with empty selection
  const [watchlistStocks, setWatchlistStocks] = useState<string[]>(["AAPL", "MSFT", "GOOGL", "AMZN"])

  const toggleStock = (symbol: string) => {
    setSelectedStocks((prev) => (prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol]))
  }

  const isSelected = (symbol: string) => {
    return selectedStocks.includes(symbol)
  }

  const addStock = (symbol: string) => {
    if (!watchlistStocks.includes(symbol)) {
      setWatchlistStocks((prev) => [...prev, symbol.toUpperCase()])
    }
  }

  const removeStock = (symbol: string) => {
    setWatchlistStocks((prev) => prev.filter((s) => s !== symbol))
    setSelectedStocks((prev) => prev.filter((s) => s !== symbol))
  }

  return (
    <WatchlistContext.Provider
      value={{
        selectedStocks,
        watchlistStocks,
        toggleStock,
        isSelected,
        addStock,
        removeStock
      }}
    >
      {children}
    </WatchlistContext.Provider>
  )
}

export function useWatchlist() {
  const context = useContext(WatchlistContext)
  if (context === undefined) {
    throw new Error("useWatchlist must be used within a WatchlistProvider")
  }
  return context
}
