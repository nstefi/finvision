"use client"

import * as React from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card } from "@/components/ui/card"

interface ChartProps {
    data: any[]
    xAxisKey: string
    yAxisKey: string
    categoryKey: string
    colors?: string[]
}

export function Chart({ data, xAxisKey, yAxisKey, categoryKey, colors = [] }: ChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-80 border rounded-md">
                <p className="text-sm text-muted-foreground">No data available</p>
            </div>
        )
    }

    // Get unique categories
    const categories = Array.from(new Set(data.map(item => item[categoryKey])))

    // Generate default colors if not provided
    const defaultColors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#6366f1", "#14b8a6"]
    const chartColors = colors.length >= categories.length ? colors : defaultColors

    return (
        <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data}
                    margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis
                        dataKey={xAxisKey}
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => {
                            // Format date strings to be more readable
                            if (typeof value === 'string' && value.includes('-')) {
                                const date = new Date(value)
                                return `${date.getMonth() + 1}/${date.getDate()}`
                            }
                            return value
                        }}
                    />
                    <YAxis tick={{ fontSize: 12 }} width={40} />
                    <Tooltip
                        formatter={(value) => [`$${Number(value).toFixed(2)}`, '']}
                        labelFormatter={(label) => {
                            if (typeof label === 'string' && label.includes('-')) {
                                const date = new Date(label)
                                return date.toLocaleDateString()
                            }
                            return label
                        }}
                    />
                    <Legend />
                    {categories.map((category, index) => (
                        <Line
                            key={category as string}
                            type="monotone"
                            dataKey={yAxisKey}
                            name={category as string}
                            data={data.filter(item => item[categoryKey] === category)}
                            stroke={chartColors[index % chartColors.length]}
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 6 }}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
} 