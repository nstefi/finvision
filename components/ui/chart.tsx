"use client"

import type React from "react"

import { ResponsiveLine } from "@nivo/line"
import { ResponsivePie } from "@nivo/pie"
import { useTheme } from "next-themes"

interface ChartContainerProps {
  children: React.ReactNode
}

export function ChartContainer({ children }: ChartContainerProps) {
  return <div className="w-full h-full relative">{children}</div>
}

interface LineChartProps {
  data: any[]
  index: string
  categories: string[]
  colors: string[]
  valueFormatter?: (value: number) => string
  showLegend?: boolean
  showXAxis?: boolean
  showYAxis?: boolean
  yAxisWidth?: number
  showGridLines?: boolean
}

export function LineChart({
  data,
  index,
  categories,
  colors,
  valueFormatter = (value) => `${value}`,
  showLegend = false,
  showXAxis = true,
  showYAxis = true,
  yAxisWidth = 40,
  showGridLines = true,
}: LineChartProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  // Set theme-aware colors
  const textColor = isDark ? "rgba(255, 255, 255, 0.8)" : "rgba(0, 0, 0, 0.8)"
  const gridColor = isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.1)"
  const tooltipBg = isDark ? "#1f2937" : "#ffffff"
  const tooltipBorder = isDark ? "#374151" : "#e5e7eb"
  const tooltipText = isDark ? "#f3f4f6" : "#111827"

  return (
    <ResponsiveLine
      data={categories.map((category) => ({
        id: category,
        data: data.map((item) => ({
          x: item[index],
          y: item[category],
          originalData: item,
        })),
      }))}
      margin={{ top: 20, right: 20, bottom: 50, left: yAxisWidth }}
      xScale={{
        type: "point",
      }}
      yScale={{
        type: "linear",
        min: "auto",
        max: "auto",
        stacked: false,
        reverse: false,
      }}
      yFormat=" >-.2f"
      curve="monotoneX"
      axisTop={null}
      axisRight={null}
      axisBottom={
        showXAxis
          ? {
              orient: "bottom",
              tickSize: 5,
              tickPadding: 5,
              tickRotation: -45, // Rotate labels for better readability
              legend: "",
              legendOffset: 36,
              legendPosition: "middle",
              tickColor: gridColor,
              tickStrokeWidth: 1,
              renderTick: (tick) => {
                return (
                  <g transform={`translate(${tick.x},${tick.y})`}>
                    <line stroke={gridColor} strokeWidth={1} y2={6} />
                    <text
                      textAnchor="end"
                      dominantBaseline="middle"
                      transform="rotate(-45)"
                      style={{
                        fontSize: "10px",
                        fill: textColor,
                        fontWeight: 500,
                      }}
                      y={-5}
                      x={-5}
                    >
                      {tick.value}
                    </text>
                  </g>
                )
              },
            }
          : null
      }
      axisLeft={
        showYAxis
          ? {
              orient: "left",
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              format: (value) => valueFormatter(value),
              legend: "",
              legendOffset: -40,
              legendPosition: "middle",
              tickColor: gridColor,
              renderTick: (tick) => {
                return (
                  <g transform={`translate(${tick.x},${tick.y})`}>
                    <line stroke={gridColor} strokeWidth={1} x2={-6} />
                    <text
                      textAnchor="end"
                      dominantBaseline="middle"
                      style={{
                        fontSize: "10px",
                        fill: textColor,
                        fontWeight: 500,
                      }}
                      x={-8}
                    >
                      {valueFormatter(tick.value)}
                    </text>
                  </g>
                )
              },
            }
          : null
      }
      enableGridX={showGridLines}
      enableGridY={showGridLines}
      gridXValues={5}
      gridYValues={5}
      gridColor={gridColor}
      colors={colors}
      lineWidth={3}
      pointSize={8}
      pointColor={{ theme: "background" }}
      pointBorderWidth={2}
      pointBorderColor={{ from: "serieColor" }}
      pointLabelYOffset={-12}
      useMesh={true}
      enableArea={true}
      areaOpacity={0.1}
      tooltip={({ point }) => (
        <div
          style={{
            background: tooltipBg,
            padding: "12px",
            border: `1px solid ${tooltipBorder}`,
            borderRadius: "4px",
            color: tooltipText,
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: "4px" }}>{point.data.x}</div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
            <div
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: point.serieColor,
                borderRadius: "50%",
              }}
            />
            <span style={{ fontWeight: 600 }}>{point.serieId}</span>
          </div>
          <div style={{ fontSize: "16px", fontWeight: 700 }}>${Number(point.data.y).toFixed(2)}</div>
          {point.data.originalData && point.data.originalData.date && (
            <div style={{ fontSize: "11px", opacity: 0.7, marginTop: "4px" }}>{point.data.originalData.date}</div>
          )}
        </div>
      )}
      legends={
        showLegend
          ? [
              {
                anchor: "bottom",
                direction: "row",
                justify: false,
                translateX: 0,
                translateY: 50,
                itemsSpacing: 10,
                itemDirection: "left-to-right",
                itemWidth: 80,
                itemHeight: 20,
                itemOpacity: 0.75,
                symbolSize: 12,
                symbolShape: "circle",
                symbolBorderColor: "rgba(0, 0, 0, .5)",
                itemTextColor: textColor,
                effects: [
                  {
                    on: "hover",
                    style: {
                      itemBackground: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.03)",
                      itemOpacity: 1,
                    },
                  },
                ],
              },
            ]
          : []
      }
      theme={{
        grid: {
          line: {
            stroke: gridColor,
          },
        },
        crosshair: {
          line: {
            stroke: isDark ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)",
            strokeWidth: 1,
            strokeOpacity: 0.5,
          },
        },
      }}
    />
  )
}

interface PieChartProps {
  data: any[]
  index: string
  category: string
  valueFormatter?: (value: number) => string
  colors: string[]
  showAnimation?: boolean
  showTooltip?: boolean
  showLegend?: boolean
  showLabels?: boolean
  enableArcLinkLabels?: boolean
  legendPosition?: "bottom" | "right"
  margin?: { top: number; right: number; bottom: number; left: number }
  startAngle?: number
  endAngle?: number
  sortByValue?: boolean
  direction?: "clockwise" | "counterclockwise"
}

export function PieChart({
  data,
  index,
  category,
  valueFormatter,
  colors,
  showAnimation,
  showTooltip = true,
  showLegend = false,
  showLabels = false,
  enableArcLinkLabels = true,
  legendPosition = "right",
  margin = { top: 40, right: 40, bottom: 40, left: 40 },
  startAngle = 0,
  endAngle = 360,
  sortByValue = false,
  direction = "clockwise",
}: PieChartProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  // Set theme-aware colors
  const textColor = isDark ? "rgba(255, 255, 255, 0.8)" : "rgba(0, 0, 0, 0.8)"
  const tooltipBg = isDark ? "#1f2937" : "#ffffff"
  const tooltipBorder = isDark ? "#374151" : "#e5e7eb"
  const tooltipText = isDark ? "#f3f4f6" : "#111827"

  return (
    <ResponsivePie
      data={data.map((item) => ({
        id: item[index],
        label: item[index],
        value: item[category],
      }))}
      margin={margin}
      innerRadius={0.5}
      padAngle={0.7}
      cornerRadius={3}
      activeOuterRadiusOffset={8}
      colors={colors}
      borderWidth={1}
      borderColor={{
        from: "color",
        modifiers: [["darker", 0.2]],
      }}
      enableArcLinkLabels={enableArcLinkLabels}
      arcLinkLabelsSkipAngle={10}
      arcLinkLabelsTextColor={textColor}
      arcLinkLabelsThickness={2}
      arcLinkLabelsColor={{ from: "color" }}
      enableArcLabels={showLabels}
      arcLabelsSkipAngle={10}
      arcLabelsTextColor={{
        from: "color",
        modifiers: [["darker", 2]],
      }}
      isInteractive={showTooltip}
      legends={
        showLegend
          ? [
              {
                anchor: legendPosition === "right" ? "right" : "bottom",
                direction: "column",
                justify: false,
                translateX: legendPosition === "right" ? 120 : 0,
                translateY: legendPosition === "right" ? 0 : 56,
                itemsSpacing: 10,
                itemWidth: 100,
                itemHeight: 20,
                itemTextColor: textColor, // Use theme-aware text color
                itemDirection: "left-to-right",
                itemOpacity: 1,
                symbolSize: 12,
                symbolShape: "circle",
                symbolSpacing: 10,
                effects: [
                  {
                    on: "hover",
                    style: {
                      itemTextColor: isDark ? "#ffffff" : "#000000",
                    },
                  },
                ],
              },
            ]
          : []
      }
      valueFormat={valueFormatter}
      startAngle={0} // 0 degrees = 3 o'clock position
      endAngle={360} // 360 degrees = complete the circle clockwise
      sortByValue={true} // Sort slices by value
      direction={direction}
      tooltip={({ datum }) => (
        <div
          style={{
            background: tooltipBg,
            padding: "8px 12px",
            border: `1px solid ${tooltipBorder}`,
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          }}
        >
          <div
            style={{
              width: "12px",
              height: "12px",
              backgroundColor: datum.color,
              marginRight: "8px",
              borderRadius: "2px",
            }}
          />
          <span style={{ color: tooltipText, fontWeight: 500 }}>
            {datum.id} ({datum.value.toFixed(1)}%)
          </span>
        </div>
      )}
      theme={{
        labels: {
          text: {
            fill: textColor,
          },
        },
        legends: {
          text: {
            fill: textColor,
            fontSize: 12,
            fontWeight: 500,
          },
        },
      }}
    />
  )
}

// We don't need this component anymore as we're using inline tooltips
export function ChartTooltip() {
  return null
}
