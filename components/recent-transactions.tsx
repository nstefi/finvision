"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { ArrowDown, ArrowUp, Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getRecentTransactions } from "@/lib/actions/transaction-actions"
import type { Transaction } from "@/lib/db/schema"
import Link from "next/link"

interface RecentTransactionsProps extends React.HTMLAttributes<HTMLDivElement> {}

export function RecentTransactions({ className, ...props }: RecentTransactionsProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    async function loadTransactions() {
      try {
        const data = await getRecentTransactions(5)
        setTransactions(data)
      } catch (error) {
        console.error("Failed to load transactions:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadTransactions()
  }, [])

  const filteredTransactions = transactions.filter(
    (tx) =>
      tx.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  return (
    <Card className={cn(className)} {...props}>
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your recent stock trades</CardDescription>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Symbol</TableHead>
              <TableHead>Shares</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  Loading transactions...
                </TableCell>
              </TableRow>
            ) : filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No transactions found.
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{formatDate(transaction.date)}</TableCell>
                  <TableCell>
                    <Badge variant={transaction.type === "buy" ? "default" : "destructive"} className="capitalize">
                      {transaction.type === "buy" ? (
                        <ArrowDown className="mr-1 h-3 w-3" />
                      ) : transaction.type === "sell" ? (
                        <ArrowUp className="mr-1 h-3 w-3" />
                      ) : null}
                      {transaction.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{transaction.symbol || "-"}</TableCell>
                  <TableCell>{transaction.shares || "-"}</TableCell>
                  <TableCell>${transaction.price ? transaction.price.toFixed(2) : "-"}</TableCell>
                  <TableCell className="text-right">${transaction.total.toFixed(2)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <div className="mt-4 flex justify-end">
          <Button variant="outline" asChild>
            <Link href="/transactions">View All Transactions</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
