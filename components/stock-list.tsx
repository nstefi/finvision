"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowDown, ArrowUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { getPortfolioHoldings } from "@/lib/actions/portfolio-actions"
import type { Stock } from "@/lib/db/schema"

interface StockListProps extends React.HTMLAttributes<HTMLDivElement> {}

export function StockList({ className, ...props }: StockListProps) {
  const [stocks, setStocks] = useState<Stock[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadStocks() {
      try {
        const data = await getPortfolioHoldings()
        // Sort stocks by allocation in descending order
        const sortedData = [...data].sort((a, b) => b.allocation - a.allocation)
        setStocks(sortedData)
      } catch (error) {
        console.error("Failed to load stocks:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStocks()
  }, [])

  return (
    <Card className={cn(className)} {...props}>
      <CardHeader className="space-y-1">
        <CardTitle>Stock Holdings</CardTitle>
        <CardDescription>Your individual stock investments</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Symbol</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Shares</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Change</TableHead>
              <TableHead className="text-right">Value</TableHead>
              <TableHead className="text-right">Allocation</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  Loading stocks...
                </TableCell>
              </TableRow>
            ) : stocks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  No stocks found.
                </TableCell>
              </TableRow>
            ) : (
              stocks.map((stock) => (
                <TableRow key={stock.symbol}>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: stock.color }}></div>
                      <span className="font-medium">{stock.symbol}</span>
                    </div>
                  </TableCell>
                  <TableCell>{stock.name}</TableCell>
                  <TableCell className="text-right">{stock.shares}</TableCell>
                  <TableCell className="text-right">${stock.price.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <span
                      className={cn(
                        "flex items-center justify-end",
                        stock.change >= 0 ? "text-green-500" : "text-red-500",
                      )}
                    >
                      {stock.change >= 0 ? (
                        <ArrowUp className="mr-1 h-3 w-3" />
                      ) : (
                        <ArrowDown className="mr-1 h-3 w-3" />
                      )}
                      {Math.abs(stock.change).toFixed(2)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">${stock.value.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{stock.allocation.toFixed(1)}%</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
