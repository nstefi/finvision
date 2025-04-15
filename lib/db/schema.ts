// This file defines our database schema types

export interface Transaction {
  id: string
  date: string
  symbol: string
  name: string
  type: "buy" | "sell" | "dividend" | "deposit" | "withdrawal"
  shares: number
  price: number
  total: number
  category: string
}

export interface Stock {
  symbol: string
  name: string
  category: string
  shares: number
  price: number
  change: number
  value: number
  allocation: number
  costBasis: number
  gain: number
  color?: string
}
