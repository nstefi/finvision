"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface WatchlistContextType {
  selectedStocks: string[]
  toggleStock: (symbol: string) => void
  isSelected: (symbol: string) => boolean
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined)

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const [selectedStocks, setSelectedStocks] = useState<string[]>(["AAPL", "MSFT"]) // Default selected stocks

  const toggleStock = (symbol: string) => {
    setSelectedStocks((prev) => (prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol]))
  }

  const isSelected = (symbol: string) => {
    return selectedStocks.includes(symbol)
  }

  return (
    <WatchlistContext.Provider value={{ selectedStocks, toggleStock, isSelected }}>
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
