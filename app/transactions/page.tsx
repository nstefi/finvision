"use client"

import { useState, useCallback } from "react"
import { DashboardShell } from "@/components/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard-header"
import { TransactionHistory } from "@/components/transaction-history"
import { TransactionSummary } from "@/components/transaction-summary"
import { TransactionFilters } from "@/components/transaction-filters"

export default function TransactionsPage() {
  // Add state for filters
  const [filters, setFilters] = useState({})

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: any) => {
    setFilters(newFilters)
  }, [])

  return (
    <DashboardShell>
      <DashboardHeader heading="Transactions" text="History of all your portfolio transactions." />

      <TransactionSummary />

      <div className="mt-6">
        <TransactionFilters onFiltersChange={handleFiltersChange} />
      </div>

      <div className="mt-4">
        <TransactionHistory />
      </div>
    </DashboardShell>
  )
}
