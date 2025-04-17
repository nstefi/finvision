"use client"

import { createContext, useContext, useState, type ReactNode, useEffect, useCallback } from "react"
import { fetchLatestStockPrices } from "@/lib/actions/stock-actions"

// --- Types ---
interface StockData {
  price?: number
  changePercent?: number
  name?: string
}

interface WatchlistContextType {
  watchlistSymbols: string[]
  watchlistData: Record<string, StockData>
  loading: boolean
  error: string | null
  addSymbol: (symbol: string) => void
  removeSymbol: (symbol: string) => void
  selectedSymbols: string[] // Used in StockPerformance component
  selectSymbol: (symbol: string) => void
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined)

// Default symbols and stock names mapping
const DEFAULT_SYMBOLS = ["AAPL", "MSFT", "GOOGL", "AMZN"]
const STOCK_NAMES: Record<string, string> = {
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

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const [watchlistSymbols, setWatchlistSymbols] = useState<string[]>(DEFAULT_SYMBOLS)
  const [watchlistData, setWatchlistData] = useState<Record<string, StockData>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([])

  // --- Fetching Logic ---
  const fetchDataForSymbols = useCallback(async (symbols: string[]) => {
    if (symbols.length === 0) {
      setWatchlistData({})
      setLoading(false)
      setError(null)
      return
    }
    setLoading(true)
    setError(null)
    try {
      // Fetch stock prices
      const prices = await fetchLatestStockPrices(symbols);

      // Create combined data with price info and stock names
      const combinedData: Record<string, StockData> = {};
      symbols.forEach((symbol) => {
        combinedData[symbol] = {
          price: prices[symbol]?.price,
          changePercent: prices[symbol]?.change, // Note: fetchLatestStockPrices returns 'change' as changePercent
          name: STOCK_NAMES[symbol] || `${symbol} Stock` // Use our mapping for names
        };
      });

      setWatchlistData(combinedData);
    } catch (err) {
      console.error("Error fetching watchlist data:", err);
      setError(err instanceof Error ? err.message : "Failed to load watchlist data");
      setWatchlistData({}); // Set empty data on error
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch and fetch when symbols change
  useEffect(() => {
    fetchDataForSymbols(watchlistSymbols);
  }, [watchlistSymbols, fetchDataForSymbols]);

  // --- Symbol Management ---
  const addSymbol = (symbol: string) => {
    const upperSymbol = symbol.toUpperCase();
    if (!watchlistSymbols.includes(upperSymbol)) {
      setWatchlistSymbols(prev => [...prev, upperSymbol]);
    }
  };

  const removeSymbol = (symbol: string) => {
    setWatchlistSymbols(prev => prev.filter(s => s !== symbol));
    setSelectedSymbols(prev => prev.filter(s => s !== symbol)); // Also remove from selection
    setWatchlistData(prev => {
      const { [symbol]: _, ...rest } = prev; // Remove data for the symbol
      return rest;
    });
  };

  // --- Selection Management ---
  const selectSymbol = (symbol: string) => {
    setSelectedSymbols((prev) =>
      prev.includes(symbol)
        ? prev.filter((s) => s !== symbol)
        : [...prev, symbol]
    );
  };

  const contextValue: WatchlistContextType = {
    watchlistSymbols,
    watchlistData,
    loading,
    error,
    addSymbol,
    removeSymbol,
    selectedSymbols, // Exposed for StockPerformance component
    selectSymbol,
  };

  return (
    <WatchlistContext.Provider value={contextValue}>
      {children}
    </WatchlistContext.Provider>
  );
}

// --- Custom Hook ---
export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (context === undefined) {
    throw new Error("useWatchlist must be used within a WatchlistProvider");
  }
  return context;
}
