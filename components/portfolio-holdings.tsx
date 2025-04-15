"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { ArrowDown, ArrowUp, Search, SortAsc, SortDesc } from "lucide-react"
import { cn } from "@/lib/utils"
import { getPortfolioHoldings } from "@/lib/actions/portfolio-actions"
import type { Stock } from "@/lib/db/schema"

export function PortfolioHoldings() {
  const [holdings, setHoldings] = useState<Stock[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortColumn, setSortColumn] = useState("symbol")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    async function loadHoldings() {
      try {
        const data = await getPortfolioHoldings()
        setHoldings(data)
      } catch (error) {
        console.error("Failed to load holdings:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadHoldings()
  }, [])

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const filteredHoldings = holdings.filter(
    (holding) =>
      holding.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      holding.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      holding.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const sortedHoldings = [...filteredHoldings].sort((a, b) => {
    const aValue = a[sortColumn as keyof typeof a]
    const bValue = b[sortColumn as keyof typeof b]

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }

    return sortDirection === "asc" ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number)
  })

  const totalValue = sortedHoldings.reduce((sum, holding) => sum + holding.value, 0)

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Portfolio Holdings</CardTitle>
            <CardDescription>Your current investment holdings</CardDescription>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search holdings..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
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
                <TableHead className="text-right cursor-pointer" onClick={() => handleSort("change")}>
                  <div className="flex items-center justify-end">
                    Change
                    {sortColumn === "change" &&
                      (sortDirection === "asc" ? (
                        <SortAsc className="ml-1 h-4 w-4" />
                      ) : (
                        <SortDesc className="ml-1 h-4 w-4" />
                      ))}
                  </div>
                </TableHead>
                <TableHead className="text-right cursor-pointer" onClick={() => handleSort("value")}>
                  <div className="flex items-center justify-end">
                    Value
                    {sortColumn === "value" &&
                      (sortDirection === "asc" ? (
                        <SortAsc className="ml-1 h-4 w-4" />
                      ) : (
                        <SortDesc className="ml-1 h-4 w-4" />
                      ))}
                  </div>
                </TableHead>
                <TableHead className="text-right cursor-pointer" onClick={() => handleSort("allocation")}>
                  <div className="flex items-center justify-end">
                    Allocation
                    {sortColumn === "allocation" &&
                      (sortDirection === "asc" ? (
                        <SortAsc className="ml-1 h-4 w-4" />
                      ) : (
                        <SortDesc className="ml-1 h-4 w-4" />
                      ))}
                  </div>
                </TableHead>
                <TableHead className="text-right cursor-pointer" onClick={() => handleSort("gain")}>
                  <div className="flex items-center justify-end">
                    Gain/Loss
                    {sortColumn === "gain" &&
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
                  <TableCell colSpan={9} className="text-center py-4">
                    Loading holdings...
                  </TableCell>
                </TableRow>
              ) : sortedHoldings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-4">
                    No holdings found.
                  </TableCell>
                </TableRow>
              ) : (
                sortedHoldings.map((holding) => (
                  <TableRow key={holding.symbol}>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: holding.color }}></div>
                        <span className="font-medium">{holding.symbol}</span>
                      </div>
                    </TableCell>
                    <TableCell>{holding.name}</TableCell>
                    <TableCell>{holding.category}</TableCell>
                    <TableCell className="text-right">{holding.shares}</TableCell>
                    <TableCell className="text-right">${holding.price.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <span
                        className={cn(
                          "flex items-center justify-end",
                          holding.change >= 0 ? "text-green-500" : "text-red-500",
                        )}
                      >
                        {holding.change >= 0 ? (
                          <ArrowUp className="mr-1 h-3 w-3" />
                        ) : (
                          <ArrowDown className="mr-1 h-3 w-3" />
                        )}
                        {Math.abs(holding.change).toFixed(2)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right">${holding.value.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{holding.allocation.toFixed(1)}%</TableCell>
                    <TableCell className="text-right">
                      <span className={cn(holding.gain >= 0 ? "text-green-500" : "text-red-500")}>
                        {holding.gain >= 0 ? "+" : "-"}
                        {Math.abs(holding.gain).toFixed(1)}%
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
              <TableRow>
                <TableCell colSpan={6} className="font-bold">
                  Total
                </TableCell>
                <TableCell className="text-right font-bold">${totalValue.toFixed(2)}</TableCell>
                <TableCell className="text-right font-bold">100%</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
