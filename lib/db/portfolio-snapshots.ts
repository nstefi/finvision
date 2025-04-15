import { transactions } from "./transactions"
import type { Transaction } from "./schema"

export interface PortfolioSnapshot {
  date: string
  totalValue: number
  change: number
  changePercent: number
  transaction: Transaction
  holdings: {
    symbol: string
    shares: number
    price: number
    value: number
  }[]
}

// Get market prices for stocks
// In a real app, this would come from a market data API with historical prices
const getStockPrice = (symbol: string, date: string): number => {
  // For demo purposes, we'll use a simplified approach with our latest prices
  // and add some random variation based on the date to simulate price changes
  const latestPrices: Record<string, number> = {
    AAPL: 185.92,
    MSFT: 408.35,
    GOOGL: 161.25,
    AMZN: 182.4,
    TSLA: 235.45,
    NVDA: 950.02,
    JPM: 198.75,
    V: 275.35,
    JNJ: 158.22,
    PG: 162.5,
    KO: 62.45,
    DIS: 108.75,
    INTC: 43.25,
  }

  // Get base price or use a default
  const basePrice = latestPrices[symbol] || 100

  // Create a deterministic but varying price based on the date
  const dateObj = new Date(date)
  const dateSeed = dateObj.getTime()
  const randomFactor = Math.sin(dateSeed / 86400000) * 0.1 // Varies by ±10%

  return basePrice * (1 + randomFactor)
}

export function generatePortfolioSnapshots(): PortfolioSnapshot[] {
  const snapshots: PortfolioSnapshot[] = []
  const currentHoldings = new Map<string, { shares: number; costBasis: number }>()
  let cashBalance = 0 // Track cash balance separately
  let previousValue = 0

  // Sort transactions by date
  const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Add initial deposit as starting point if it exists
  const initialDeposit = sortedTransactions.find((tx) => tx.type === "deposit")
  if (initialDeposit) {
    cashBalance += initialDeposit.total // Add to cash balance
    snapshots.push({
      date: initialDeposit.date,
      totalValue: initialDeposit.total,
      change: initialDeposit.total,
      changePercent: 100,
      transaction: initialDeposit,
      holdings: [],
    })
    previousValue = initialDeposit.total
  }

  for (const transaction of sortedTransactions) {
    // Skip the initial deposit we already processed
    if (transaction === initialDeposit) continue

    // Update cash balance based on transaction type
    if (transaction.type === "deposit") {
      cashBalance += transaction.total
    } else if (transaction.type === "withdrawal") {
      // Ensure we don't withdraw more than available
      const withdrawalAmount = Math.min(cashBalance, transaction.total)
      cashBalance -= withdrawalAmount
    } else if (transaction.type === "buy") {
      cashBalance -= transaction.total // Reduce cash when buying
    } else if (transaction.type === "sell") {
      cashBalance += transaction.total // Increase cash when selling
    } else if (transaction.type === "dividend") {
      cashBalance += transaction.total // Add dividends to cash
    }

    // Update holdings based on transaction
    processTransaction(currentHoldings, transaction)

    // Create a snapshot of the portfolio after this transaction
    const snapshot = createSnapshot(transaction, currentHoldings, previousValue, cashBalance)
    snapshots.push(snapshot)

    previousValue = snapshot.totalValue
  }

  return snapshots
}

function processTransaction(
  holdings: Map<string, { shares: number; costBasis: number }>,
  transaction: Transaction,
): void {
  const { symbol, shares, price, type } = transaction

  if (type === "deposit" || type === "withdrawal" || type === "dividend") {
    // These don't affect stock holdings directly
    return
  }

  if (!symbol) return // Skip other cash transactions

  if (type === "buy") {
    const existing = holdings.get(symbol) || { shares: 0, costBasis: 0 }
    // Calculate new average cost basis (weighted average)
    const totalShares = existing.shares + shares
    const newCostBasis = (existing.shares * existing.costBasis + shares * price) / totalShares

    holdings.set(symbol, {
      shares: totalShares,
      costBasis: newCostBasis,
    })
  } else if (type === "sell") {
    const existing = holdings.get(symbol)
    if (existing) {
      const remainingShares = existing.shares - shares
      if (remainingShares > 0) {
        holdings.set(symbol, {
          shares: remainingShares,
          costBasis: existing.costBasis, // Keep the same cost basis
        })
      } else {
        holdings.delete(symbol) // Sold all shares
      }
    }
  }
}

function createSnapshot(
  transaction: Transaction,
  holdings: Map<string, { shares: number; costBasis: number }>,
  previousValue: number,
  cashBalance: number,
): PortfolioSnapshot {
  let stocksValue = 0
  const holdingsArray = []

  // Calculate portfolio value based on current holdings and market prices
  for (const [symbol, { shares, costBasis }] of holdings.entries()) {
    const price = getStockPrice(symbol, transaction.date)
    const value = shares * price
    stocksValue += value

    holdingsArray.push({
      symbol,
      shares,
      price,
      value,
    })
  }

  // Total value is stocks plus cash
  const totalValue = stocksValue + cashBalance

  // Calculate change
  const change = totalValue - previousValue
  const changePercent = previousValue === 0 ? 0 : (change / previousValue) * 100

  return {
    date: transaction.date,
    totalValue,
    change,
    changePercent,
    transaction,
    holdings: holdingsArray,
  }
}
