"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowDown, ArrowUp, SortAsc, SortDesc, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { getTransactions } from "@/lib/actions/transaction-actions"
import type { Transaction } from "@/lib/db/schema"

export function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortColumn, setSortColumn] = useState("date")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const itemsPerPage = 10

  useEffect(() => {
    async function loadTransactions() {
      try {
        setIsLoading(true)
        // Get all transactions to count them
        const allTransactions = await getTransactions()
        setTotalCount(allTransactions.length)

        // Get paginated transactions
        const data = await getTransactions({
          limit: itemsPerPage,
          offset: (currentPage - 1) * itemsPerPage,
          sortBy: sortColumn,
          sortDirection: sortDirection,
        })
        setTransactions(data)
      } catch (error) {
        console.error("Failed to load transactions:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadTransactions()
  }, [currentPage, sortColumn, sortDirection])

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
    setCurrentPage(1) // Reset to first page when sorting changes
  }

  const totalPages = Math.ceil(totalCount / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case "buy":
        return "bg-green-500/20 text-green-500 hover:bg-green-500/30"
      case "sell":
        return "bg-red-500/20 text-red-500 hover:bg-red-500/30"
      case "dividend":
        return "bg-blue-500/20 text-blue-500 hover:bg-blue-500/30"
      case "deposit":
        return "bg-purple-500/20 text-purple-500 hover:bg-purple-500/30"
      case "withdrawal":
        return "bg-orange-500/20 text-orange-500 hover:bg-orange-500/30"
      default:
        return "bg-gray-500/20 text-gray-500 hover:bg-gray-500/30"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>Record of all your portfolio transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer" onClick={() => handleSort("date")}>
                  <div className="flex items-center">
                    Date
                    {sortColumn === "date" &&
                      (sortDirection === "asc" ? (
                        <SortAsc className="ml-1 h-4 w-4" />
                      ) : (
                        <SortDesc className="ml-1 h-4 w-4" />
                      ))}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("type")}>
                  <div className="flex items-center">
                    Type
                    {sortColumn === "type" &&
                      (sortDirection === "asc" ? (
                        <SortAsc className="ml-1 h-4 w-4" />
                      ) : (
                        <SortDesc className="ml-1 h-4 w-4" />
                      ))}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("symbol")}>
                  <div className="flex items-center">
                    Symbol
                    {sortColumn === "symbol" &&
                      (sortDirection === "asc" ? (
                        <SortAsc className="ml-1 h-4 w-4" />
                      ) : (
                        <SortDesc className="ml-1 h-4 w-4" />
                      ))}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>
                  <div className="flex items-center">
                    Name
                    {sortColumn === "name" &&
                      (sortDirection === "asc" ? (
                        <SortAsc className="ml-1 h-4 w-4" />
                      ) : (
                        <SortDesc className="ml-1 h-4 w-4" />
                      ))}
                  </div>
                </TableHead>
                <TableHead className="text-right cursor-pointer" onClick={() => handleSort("shares")}>
                  <div className="flex items-center justify-end">
                    Shares
                    {sortColumn === "shares" &&
                      (sortDirection === "asc" ? (
                        <SortAsc className="ml-1 h-4 w-4" />
                      ) : (
                        <SortDesc className="ml-1 h-4 w-4" />
                      ))}
                  </div>
                </TableHead>
                <TableHead className="text-right cursor-pointer" onClick={() => handleSort("price")}>
                  <div className="flex items-center justify-end">
                    Price
                    {sortColumn === "price" &&
                      (sortDirection === "asc" ? (
                        <SortAsc className="ml-1 h-4 w-4" />
                      ) : (
                        <SortDesc className="ml-1 h-4 w-4" />
                      ))}
                  </div>
                </TableHead>
                <TableHead className="text-right cursor-pointer" onClick={() => handleSort("total")}>
                  <div className="flex items-center justify-end">
                    Total
                    {sortColumn === "total" &&
                      (sortDirection === "asc" ? (
                        <SortAsc className="ml-1 h-4 w-4" />
                      ) : (
                        <SortDesc className="ml-1 h-4 w-4" />
                      ))}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("category")}>
                  <div className="flex items-center">
                    Category
                    {sortColumn === "category" &&
                      (sortDirection === "asc" ? (
                        <SortAsc className="ml-1 h-4 w-4" />
                      ) : (
                        <SortDesc className="ml-1 h-4 w-4" />
                      ))}
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    Loading transactions...
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    No transactions found.
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{formatDate(transaction.date)}</TableCell>
                    <TableCell>
                      <Badge className={cn("capitalize", getTransactionTypeColor(transaction.type))}>
                        {transaction.type === "buy" ? (
                          <ArrowDown className="mr-1 h-3 w-3" />
                        ) : transaction.type === "sell" ? (
                          <ArrowUp className="mr-1 h-3 w-3" />
                        ) : null}
                        {transaction.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{transaction.symbol || "-"}</TableCell>
                    <TableCell>{transaction.name}</TableCell>
                    <TableCell className="text-right">{transaction.shares || "-"}</TableCell>
                    <TableCell className="text-right">
                      {transaction.price ? `$${transaction.price.toFixed(2)}` : "-"}
                    </TableCell>
                    <TableCell className="text-right">${transaction.total.toFixed(2)}</TableCell>
                    <TableCell>{transaction.category}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, totalCount)} of {totalCount} transactions
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous Page</span>
            </Button>
            <div className="text-sm">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next Page</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
