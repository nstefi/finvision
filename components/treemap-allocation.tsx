"use client"

import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveTreeMap } from "@nivo/treemap"

interface TreemapAllocationProps extends React.HTMLAttributes<HTMLDivElement> {}

export function TreemapAllocation({ className, ...props }: TreemapAllocationProps) {
  // Sample data with more holdings
  const stockData = {
    name: "portfolio",
    color: "hsl(var(--background))",
    children: [
      { name: "MSFT", value: 25.0, color: "#3b82f6" },
      { name: "AAPL", value: 15.8, color: "#10b981" },
      { name: "AMZN", value: 9.3, color: "#f59e0b" },
      { name: "TSLA", value: 8.0, color: "#8b5cf6" },
      { name: "GOOGL", value: 6.6, color: "#ef4444" },
      { name: "NVDA", value: 5.2, color: "#06b6d4" },
      { name: "META", value: 4.8, color: "#8b5cf6" },
      { name: "JPM", value: 3.5, color: "#14b8a6" },
      { name: "V", value: 3.2, color: "#f43f5e" },
      { name: "WMT", value: 2.9, color: "#22c55e" },
      { name: "DIS", value: 2.7, color: "#3b82f6" },
      { name: "PG", value: 2.5, color: "#f97316" },
      { name: "KO", value: 2.3, color: "#ec4899" },
      { name: "BAC", value: 2.1, color: "#6366f1" },
      { name: "CSCO", value: 1.9, color: "#a855f7" },
      { name: "Other", value: 4.2, color: "#6b7280" },
    ],
  }

  return (
    <Card className={className} {...props}>
      <CardHeader className="space-y-1">
        <CardTitle>Stock Allocation</CardTitle>
        <CardDescription>Distribution of your stock portfolio</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveTreeMap
            data={stockData}
            identity="name"
            value="value"
            valueFormat={(value) => `${value.toFixed(1)}%`}
            margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
            labelSkipSize={12}
            labelTextColor={{
              from: "color",
              modifiers: [["darker", 3]],
            }}
            parentLabelPosition="left"
            parentLabelTextColor={{
              from: "color",
              modifiers: [["darker", 2]],
            }}
            borderColor={{
              from: "color",
              modifiers: [["darker", 0.1]],
            }}
            colors={{ datum: "data.color" }}
            nodeOpacity={1}
            borderWidth={2}
            animate={true}
          />
        </div>
      </CardContent>
    </Card>
  )
}
