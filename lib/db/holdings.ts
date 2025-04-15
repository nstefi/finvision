import type { Stock } from "./schema"
import { transactions } from "./transactions"

// Calculate holdings based on transaction history
export function calculateHoldings(): Stock[] {
  // Create a map to track holdings by symbol
  const holdingsMap = new Map<
    string,
    {
      symbol: string
      name: string
      category: string
      shares: number
      totalCost: number
      costBasis: number
      price: number
      change: number
      value: number
      allocation: number
      gain: number
      color?: string
    }
  >()

  // Process all transactions to build current holdings
  transactions.forEach((transaction) => {
    if (!transaction.symbol) return // Skip transactions without a symbol (like cash deposits)

    const { symbol, name, category, shares, price, type } = transaction

    // Get existing holding or create new one
    const existing = holdingsMap.get(symbol) || {
      symbol,
      name,
      category,
      shares: 0,
      totalCost: 0,
      costBasis: 0,
      price: 0, // Will be updated with latest price
      change: 0, // Will be updated with latest change
      value: 0,
      allocation: 0,
      gain: 0,
    }

    // Update shares and cost basis based on transaction type
    if (type === "buy") {
      existing.shares += shares
      existing.totalCost += shares * price
    } else if (type === "sell") {
      existing.shares -= shares
      // For simplicity, we're reducing cost basis proportionally
      if (existing.shares > 0) {
        const sellRatio = shares / (existing.shares + shares)
        existing.totalCost -= existing.totalCost * sellRatio
      } else {
        existing.totalCost = 0
      }
    }

    // Only keep track of stocks we still own
    if (existing.shares > 0) {
      holdingsMap.set(symbol, existing)
    } else {
      holdingsMap.delete(symbol)
    }
  })

  // Get the latest price and change for each holding
  // In a real app, this would come from a market data API
  const latestPrices = new Map([
    ["AAPL", { price: 185.92, change: 1.25 }],
    ["MSFT", { price: 408.35, change: 2.78 }],
    ["GOOGL", { price: 161.25, change: -0.85 }],
    ["AMZN", { price: 182.4, change: 1.15 }],
    ["TSLA", { price: 235.45, change: -1.2 }],
    ["NVDA", { price: 950.02, change: 3.2 }],
    ["JPM", { price: 198.75, change: 0.45 }],
    ["V", { price: 275.35, change: 0.65 }],
    ["JNJ", { price: 158.22, change: 0.22 }],
    ["PG", { price: 162.5, change: 0.35 }],
    ["KO", { price: 62.45, change: 0.15 }],
    ["DIS", { price: 108.75, change: -0.45 }],
    ["INTC", { price: 43.25, change: -0.65 }],
  ])

  // Assign colors to holdings
  const colors = [
    "#3b82f6", // Blue
    "#10b981", // Green
    "#f59e0b", // Orange
    "#8b5cf6", // Purple
    "#ef4444", // Red
    "#06b6d4", // Cyan
    "#14b8a6", // Teal
    "#f43f5e", // Pink
    "#22c55e", // Lime
    "#f97316", // Orange
    "#ec4899", // Hot pink
    "#6366f1", // Indigo
    "#a855f7", // Violet
    "#6b7280", // Gray
  ]

  // Calculate final values for each holding
  let totalValue = 0
  const holdings = Array.from(holdingsMap.values()).map((holding, index) => {
    const latestData = latestPrices.get(holding.symbol) || { price: holding.costBasis, change: 0 }

    holding.price = latestData.price
    holding.change = latestData.change
    holding.value = holding.shares * holding.price
    holding.costBasis = holding.totalCost / holding.shares
    holding.gain = ((holding.price - holding.costBasis) / holding.costBasis) * 100
    holding.color = colors[index % colors.length]

    totalValue += holding.value
    return holding
  })

  // Calculate allocation percentages
  return holdings.map((holding) => ({
    ...holding,
    allocation: (holding.value / totalValue) * 100,
  }))
}

// Get current holdings
export const holdings = calculateHoldings()
