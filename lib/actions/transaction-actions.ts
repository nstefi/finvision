"use server"

import type { Transaction } from "../db/schema"
import { transactions } from "../db/transactions"

export async function getTransactions(options?: {
  limit?: number
  offset?: number
  sortBy?: string
  sortDirection?: "asc" | "desc"
  filter?: {
    type?: string
    symbol?: string
    category?: string
    dateFrom?: string
    dateTo?: string
    search?: string
  }
}): Promise<Transaction[]> {
  // In a real app, this would be a database query
  let result = [...transactions]

  // Apply filters if provided
  if (options?.filter) {
    const { type, symbol, category, dateFrom, dateTo, search } = options.filter

    if (type && type !== "all") {
      result = result.filter((tx) => tx.type === type)
    }

    if (symbol) {
      result = result.filter((tx) => tx.symbol === symbol)
    }

    if (category) {
      result = result.filter((tx) => tx.category === category)
    }

    if (dateFrom) {
      result = result.filter((tx) => new Date(tx.date) >= new Date(dateFrom))
    }

    if (dateTo) {
      result = result.filter((tx) => new Date(tx.date) <= new Date(dateTo))
    }

    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter(
        (tx) =>
          tx.symbol.toLowerCase().includes(searchLower) ||
          tx.name.toLowerCase().includes(searchLower) ||
          tx.category.toLowerCase().includes(searchLower),
      )
    }
  }

  // Apply sorting
  const sortBy = options?.sortBy || "date"
  const sortDirection = options?.sortDirection || "desc"

  result.sort((a, b) => {
    const aValue = a[sortBy as keyof Transaction]
    const bValue = b[sortBy as keyof Transaction]

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }

    return sortDirection === "asc" ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number)
  })

  // Apply pagination
  if (options?.limit) {
    const offset = options.offset || 0
    result = result.slice(offset, offset + options.limit)
  }

  return result
}

export async function getRecentTransactions(limit = 5): Promise<Transaction[]> {
  return getTransactions({
    limit,
    sortBy: "date",
    sortDirection: "desc",
  })
}

export async function getTransactionStats() {
  // Calculate transaction statistics
  const allTransactions = await getTransactions()

  const totalBuys = allTransactions.filter((tx) => tx.type === "buy").reduce((sum, tx) => sum + tx.total, 0)

  const totalSells = allTransactions.filter((tx) => tx.type === "sell").reduce((sum, tx) => sum + tx.total, 0)

  const buyCount = allTransactions.filter((tx) => tx.type === "buy").length
  const sellCount = allTransactions.filter((tx) => tx.type === "sell").length

  const netCashFlow = totalBuys - totalSells

  const lastTransaction = allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

  const lastTransactionDate = new Date(lastTransaction.date)
  const today = new Date()
  const diffTime = Math.abs(today.getTime() - lastTransactionDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return {
    totalBuys,
    totalSells,
    buyCount,
    sellCount,
    netCashFlow,
    lastTransaction,
    daysSinceLastTransaction: diffDays,
  }
}
