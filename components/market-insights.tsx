"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function MarketInsights() {
  const insights = [
    {
      title: "Tech sector shows strong growth",
      category: "Sector Analysis",
      date: "Today",
      type: "positive",
    },
    {
      title: "Fed signals potential rate cut",
      category: "Economic",
      date: "Yesterday",
      type: "positive",
    },
    {
      title: "Oil prices drop amid supply concerns",
      category: "Commodities",
      date: "2 days ago",
      type: "negative",
    },
    {
      title: "Retail sales exceed expectations",
      category: "Consumer",
      date: "3 days ago",
      type: "positive",
    },
    {
      title: "Housing market shows signs of cooling",
      category: "Real Estate",
      date: "1 week ago",
      type: "neutral",
    },
  ]

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Market Insights</CardTitle>
        <CardDescription>Latest market news and analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {insights.map((insight, index) => (
            <div key={index} className="flex flex-col space-y-1">
              <div className="flex items-center justify-between">
                <Badge
                  variant={
                    insight.type === "positive" ? "default" : insight.type === "negative" ? "destructive" : "outline"
                  }
                  className="text-xs"
                >
                  {insight.category}
                </Badge>
                <span className="text-xs text-muted-foreground">{insight.date}</span>
              </div>
              <p className="text-sm font-medium">{insight.title}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
