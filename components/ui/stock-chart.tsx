import React, { useEffect, useRef, useState } from 'react'
import { useTheme } from "next-themes"

interface StockChartProps {
    data: any[]
    symbols: string[]
    colors: Record<string, string>
    width?: number
    height?: number
    isLoading?: boolean
}

export function StockChart({
    data,
    symbols,
    colors,
    width = 800,
    height = 300,
    isLoading = false,
}: StockChartProps) {
    const svgRef = useRef<SVGSVGElement>(null)
    const { resolvedTheme } = useTheme()
    const isDark = resolvedTheme === "dark"

    const [tooltip, setTooltip] = useState<{
        visible: boolean
        x: number
        y: number
        symbol: string
        value: number
        date: string
    }>({
        visible: false,
        x: 0,
        y: 0,
        symbol: "",
        value: 0,
        date: ""
    })

    // Theme colors
    const gridColor = isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.1)"
    const tooltipBg = isDark ? "#1f2937" : "#ffffff"
    const tooltipBorder = isDark ? "#374151" : "#e5e7eb"
    const tooltipText = isDark ? "#f3f4f6" : "#111827"

    useEffect(() => {
        if (isLoading || !data || data.length === 0 || !svgRef.current) return
        renderChart()
    }, [data, width, height, isLoading, isDark])

    const renderChart = () => {
        if (!svgRef.current || !data || data.length === 0) return

        // Clear previous content
        while (svgRef.current.firstChild) {
            svgRef.current.removeChild(svgRef.current.firstChild)
        }

        // Calculate dimensions
        const margin = { top: 20, right: 20, bottom: 30, left: 50 }
        const chartWidth = width - margin.left - margin.right
        const chartHeight = height - margin.top - margin.bottom

        // Find min and max values across all symbols
        let minValue = Infinity
        let maxValue = -Infinity
        symbols.forEach(symbol => {
            data.forEach(point => {
                if (point[symbol] !== undefined && point[symbol] !== null) {
                    minValue = Math.min(minValue, point[symbol])
                    maxValue = Math.max(maxValue, point[symbol])
                }
            })
        })
        minValue = minValue * 0.95 // Add padding
        maxValue = maxValue * 1.05

        // Create scales
        const xScale = (index: number) => (index / (data.length - 1)) * chartWidth
        const yScale = (value: number) => chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight

        // Create group element
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
        g.setAttribute('transform', `translate(${margin.left},${margin.top})`)
        svgRef.current.appendChild(g)

        // Draw grid lines
        const gridCount = 5
        for (let i = 0; i <= gridCount; i++) {
            const y = (i / gridCount) * chartHeight
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
            line.setAttribute('x1', '0')
            line.setAttribute('y1', y.toString())
            line.setAttribute('x2', chartWidth.toString())
            line.setAttribute('y2', y.toString())
            line.setAttribute('stroke', gridColor)
            line.setAttribute('stroke-width', '0.5')
            line.setAttribute('stroke-dasharray', '3,3')
            g.appendChild(line)

            // Add price labels
            const price = minValue + ((maxValue - minValue) * (gridCount - i)) / gridCount
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
            text.setAttribute('x', '-10')
            text.setAttribute('y', y.toString())
            text.setAttribute('text-anchor', 'end')
            text.setAttribute('dominant-baseline', 'middle')
            text.setAttribute('fill', isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)')
            text.setAttribute('font-size', '10')
            text.textContent = formatCurrency(price)
            g.appendChild(text)
        }

        // Add date labels on x-axis
        const dateCount = Math.min(5, data.length) // Show up to 5 dates
        for (let i = 0; i < dateCount; i++) {
            const index = Math.floor((i / (dateCount - 1)) * (data.length - 1))
            const x = xScale(index)

            // Add vertical grid line
            const vLine = document.createElementNS('http://www.w3.org/2000/svg', 'line')
            vLine.setAttribute('x1', x.toString())
            vLine.setAttribute('y1', '0')
            vLine.setAttribute('x2', x.toString())
            vLine.setAttribute('y2', chartHeight.toString())
            vLine.setAttribute('stroke', gridColor)
            vLine.setAttribute('stroke-width', '0.5')
            vLine.setAttribute('stroke-dasharray', '3,3')
            g.appendChild(vLine)

            // Add date label
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
            text.setAttribute('x', x.toString())
            text.setAttribute('y', (chartHeight + 20).toString())
            text.setAttribute('text-anchor', 'middle')
            text.setAttribute('fill', isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)')
            text.setAttribute('font-size', '10')
            text.setAttribute('transform', `rotate(-45, ${x}, ${chartHeight + 20})`)
            text.textContent = data[index].date
            g.appendChild(text)
        }

        // Draw lines and areas for each symbol
        symbols.forEach((symbol, symbolIndex) => {
            const color = colors[symbol]
            const points = data.map((d, i) => ({
                x: xScale(i),
                y: yScale(d[symbol] || 0),
                value: d[symbol] || 0,
                date: d.date
            })).filter(p => p.value !== 0)

            if (points.length < 2) return

            // Create gradient for area
            const gradientId = `gradient-${symbol}`
            const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
            const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient')
            gradient.setAttribute('id', gradientId)
            gradient.setAttribute('x1', '0')
            gradient.setAttribute('y1', '0')
            gradient.setAttribute('x2', '0')
            gradient.setAttribute('y2', '1')

            const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop')
            stop1.setAttribute('offset', '0%')
            stop1.setAttribute('stop-color', color)
            stop1.setAttribute('stop-opacity', isDark ? '0.4' : '0.2')

            const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop')
            stop2.setAttribute('offset', '100%')
            stop2.setAttribute('stop-color', color)
            stop2.setAttribute('stop-opacity', isDark ? '0.1' : '0')

            gradient.appendChild(stop1)
            gradient.appendChild(stop2)
            defs.appendChild(gradient)
            svgRef.current.appendChild(defs)

            // Draw area
            const areaPath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
            const areaData = [
                `M ${points[0].x} ${chartHeight}`,
                `L ${points[0].x} ${points[0].y}`,
                ...points.slice(1).map(p => `L ${p.x} ${p.y}`),
                `L ${points[points.length - 1].x} ${chartHeight}`,
                'Z'
            ].join(' ')
            areaPath.setAttribute('d', areaData)
            areaPath.setAttribute('fill', `url(#${gradientId})`)
            g.appendChild(areaPath)

            // Draw line
            const linePath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
            const lineData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
            linePath.setAttribute('d', lineData)
            linePath.setAttribute('stroke', color)
            linePath.setAttribute('stroke-width', isDark ? '3' : '2')
            linePath.setAttribute('fill', 'none')
            g.appendChild(linePath)
        })

        // Add interaction layer
        const interactionLayer = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
        interactionLayer.setAttribute('x', '0')
        interactionLayer.setAttribute('y', '0')
        interactionLayer.setAttribute('width', chartWidth.toString())
        interactionLayer.setAttribute('height', chartHeight.toString())
        interactionLayer.setAttribute('fill', 'transparent')
        interactionLayer.setAttribute('pointer-events', 'all')

        // Add mouse events for tooltip
        interactionLayer.addEventListener('mousemove', (event) => {
            const svgRect = svgRef.current!.getBoundingClientRect()
            const mouseX = event.clientX - svgRect.left - margin.left

            // Find closest data point
            const index = Math.min(
                Math.max(0, Math.round((mouseX / chartWidth) * (data.length - 1))),
                data.length - 1
            )

            const dataPoint = data[index]

            // Find the closest symbol's value
            let closestSymbol = symbols[0]
            let minDistance = Infinity

            symbols.forEach(symbol => {
                if (dataPoint[symbol] !== undefined) {
                    const y = yScale(dataPoint[symbol])
                    const distance = Math.abs(y - (event.clientY - svgRect.top - margin.top))
                    if (distance < minDistance) {
                        minDistance = distance
                        closestSymbol = symbol
                    }
                }
            })

            const x = xScale(index)
            const y = yScale(dataPoint[closestSymbol])

            setTooltip({
                visible: true,
                x: x + margin.left,
                y: y + margin.top,
                symbol: closestSymbol,
                value: dataPoint[closestSymbol],
                date: dataPoint.date
            })

            // Update markers
            symbols.forEach(symbol => {
                if (dataPoint[symbol] !== undefined) {
                    const markerId = `marker-${symbol}`
                    let marker = g.querySelector(`#${markerId}`)

                    if (!marker) {
                        marker = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
                        marker.setAttribute('id', markerId)
                        marker.setAttribute('r', '4')
                        marker.setAttribute('fill', colors[symbol])
                        g.appendChild(marker)
                    }

                    marker.setAttribute('cx', x.toString())
                    marker.setAttribute('cy', yScale(dataPoint[symbol]).toString())
                }
            })
        })

        interactionLayer.addEventListener('mouseleave', () => {
            setTooltip({ ...tooltip, visible: false })
            symbols.forEach(symbol => {
                const marker = g.querySelector(`#marker-${symbol}`)
                if (marker) g.removeChild(marker)
            })
        })

        g.appendChild(interactionLayer)
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value)
    }

    return (
        <div className="relative w-full h-full">
            <svg
                ref={svgRef}
                width={width}
                height={height}
                className="overflow-visible"
            />
            {tooltip.visible && (
                <div
                    style={{
                        position: 'absolute',
                        left: `${tooltip.x}px`,
                        top: `${tooltip.y - 40}px`,
                        transform: 'translateX(-50%)',
                        background: tooltipBg,
                        border: `1px solid ${tooltipBorder}`,
                        borderRadius: '4px',
                        padding: '8px',
                        pointerEvents: 'none',
                        zIndex: 10,
                        color: tooltipText,
                        fontSize: '12px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        whiteSpace: 'nowrap'
                    }}
                >
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{tooltip.symbol}</div>
                    <div>{formatCurrency(tooltip.value)}</div>
                    <div style={{ opacity: 0.7, marginTop: '4px' }}>{tooltip.date}</div>
                </div>
            )}
        </div>
    )
} 