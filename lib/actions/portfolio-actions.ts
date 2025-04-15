"use server"

import { calculateHoldings } from "../db/holdings"
import type { Stock } from "../db/schema"

export async function getPortfolioHoldings(): Promise<Stock[]> {
  // In a real app, this would fetch from a database
  // For now, we'll calculate holdings from transactions
  return calculateHoldings()
}

export async function getPortfolioSummary() {
  const holdings = await getPortfolioHoldings()

  const totalValue = holdings.reduce((sum, holding) => sum + holding.value, 0)

  // Calculate daily change
  const dailyChange = holdings.reduce((sum, holding) => {
    const dailyChangeAmount = holding.value * (holding.change / 100)
    return sum + dailyChangeAmount
  }, 0)

  const dailyChangePercent = (dailyChange / (totalValue - dailyChange)) * 100

  // For demo purposes, we'll use fixed values for annual return
  // In a real app, this would be calculated from historical data
  const annualReturn = 12.8
  const annualReturnChange = 2.3

  return {
    totalValue,
    dailyChange,
    dailyChangePercent,
    annualReturn,
    annualReturnChange,
    inceptionDate: "Jan 2020",
    inceptionDuration: "3.5 years",
  }
}
