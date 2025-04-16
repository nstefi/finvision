"use server"

import { format, subDays, subMonths, subYears } from "date-fns"
import yahooFinance from "yahoo-finance2"

// Helper function to fetch with timeout and retry
async function fetchWithRetry(url: string, retries = 3, timeout = 10000) {
    for (let i = 0; i < retries; i++) {
        try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), timeout)

            const response = await fetch(url, { signal: controller.signal })
            clearTimeout(timeoutId)

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = await response.json()
            return data
        } catch (error) {
            if (i === retries - 1) throw error
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
        }
    }
}

// This server action fetches stock data using Yahoo Finance
export async function fetchStockData(symbols: string[], period: string) {
    try {
        console.log("Fetching historical stock data from Yahoo Finance...")
        const historicalData: Record<string, any[]> = {}

        // Determine the time range based on period
        const endDate = new Date()
        let startDate: Date
        switch (period) {
            case "1w":
                startDate = subDays(endDate, 7)
                break
            case "1m":
                startDate = subMonths(endDate, 1)
                break
            case "3m":
                startDate = subMonths(endDate, 3)
                break
            case "1y":
                startDate = subYears(endDate, 1)
                break
            default:
                startDate = subMonths(endDate, 1)
        }

        // Fetch data for each symbol
        for (const symbol of symbols) {
            try {
                const queryOptions = {
                    period1: startDate,
                    period2: endDate,
                    interval: period === "1w" ? "1wk" : "1d" as "1d" | "1wk" | "1mo"
                }

                const data = await yahooFinance.historical(symbol, queryOptions)

                if (data && data.length > 0) {
                    historicalData[symbol] = data.map(item => ({
                        date: format(new Date(item.date), "yyyy-MM-dd"),
                        price: item.close
                    }))
                }
            } catch (error) {
                console.error(`Error fetching historical data for ${symbol}:`, error)
                // Generate simulated data as fallback
                const simulatedData = generateHistoricalData(
                    [symbol],
                    startDate,
                    endDate,
                    period,
                    { [symbol]: generateSimulatedStockPrice(symbol) }
                )
                historicalData[symbol] = simulatedData.map(item => ({
                    date: item.date,
                    price: item[symbol]
                }))
            }
        }

        // Convert historical data to the format expected by the chart
        const result: any[] = []
        const allDates = new Set<string>()

        // Collect all unique dates
        Object.values(historicalData).forEach(symbolData => {
            symbolData.forEach(dataPoint => {
                allDates.add(dataPoint.date)
            })
        })

        // Sort dates
        const sortedDates = Array.from(allDates).sort()

        // Create data points for each date
        sortedDates.forEach(date => {
            const dataPoint: Record<string, any> = {
                date,
                formattedDate: format(new Date(date), period === "1y" ? "MMM yyyy" : "MMM dd")
            }

            symbols.forEach(symbol => {
                const symbolData = historicalData[symbol]
                const dateData = symbolData?.find(d => d.date === date)
                dataPoint[symbol] = dateData?.price || null
            })

            result.push(dataPoint)
        })

        return result
    } catch (error) {
        console.error("Error fetching historical stock data:", error)
        // Fall back to simulated data
        return generateHistoricalData(symbols, startDate, endDate, period, generateSimulatedStockPrices(symbols))
    }
}

// Function to generate historical data based on current prices
function generateHistoricalData(
    symbols: string[],
    startDate: Date,
    endDate: Date,
    period: string,
    currentPrices: Record<string, { price: number; change: number }>,
) {
    console.log("Generating historical data based on current prices")

    // Generate dates between start and end based on period
    const dates: Date[] = []
    const currentDate = new Date(startDate)
    let increment: number

    switch (period) {
        case "1w":
            increment = 2 * 60 * 60 * 1000 // 2 hours in milliseconds
            break
        case "1m":
            increment = 24 * 60 * 60 * 1000 // 1 day in milliseconds
            break
        case "3m":
            increment = 3 * 24 * 60 * 60 * 1000 // 3 days in milliseconds
            break
        case "1y":
            increment = 7 * 24 * 60 * 60 * 1000 // 1 week in milliseconds
            break
        default:
            increment = 24 * 60 * 60 * 1000 // 1 day in milliseconds
    }

    while (currentDate <= endDate) {
        // Skip weekends for realistic market data
        const day = currentDate.getDay()
        if (day !== 0 && day !== 6) {
            dates.push(new Date(currentDate))
        }
        currentDate.setTime(currentDate.getTime() + increment)
    }

    // Generate price data for each date
    const result: Record<string, any>[] = []

    dates.forEach((date, index) => {
        const dataPoint: Record<string, any> = {
            date: format(date, "yyyy-MM-dd"),
            formattedDate: format(date, period === "1y" ? "MMM yyyy" : "MMM dd"),
        }

        symbols.forEach((symbol) => {
            // If we have current price data for this symbol
            if (currentPrices[symbol]) {
                const currentPrice = currentPrices[symbol].price
                const percentChange = currentPrices[symbol].change / 100 // Convert percentage to decimal

                // Calculate what the starting price would have been to achieve the current percentage change
                // This ensures our generated data is consistent with the real current price and change
                const totalDays = dates.length
                const dayIndex = index
                const dayRatio = totalDays > 1 ? dayIndex / (totalDays - 1) : 0

                // Create a price path that ends at the current price and reflects the current change percentage
                // For the starting price, we work backwards from the current price and change
                const estimatedStartPrice = currentPrice / (1 + percentChange)

                // Add some randomness to make the chart look realistic
                const seed = date.getTime() + symbol.charCodeAt(0) * 1000
                const random = Math.sin(seed) * 10000 - Math.floor(Math.sin(seed) * 10000)
                const randomFactor = (random * 2 - 1) * 0.005 // Small random factor for realism

                // Linear interpolation between start and current price with some randomness
                const price = estimatedStartPrice + (currentPrice - estimatedStartPrice) * dayRatio
                const adjustedPrice = price * (1 + randomFactor)

                dataPoint[symbol] = Number.parseFloat(adjustedPrice.toFixed(2))
            } else {
                // If we don't have current price data, generate completely simulated data
                const basePrice = 100 // Default base price
                const seed = date.getTime() + symbol.charCodeAt(0) * 1000
                const random = Math.sin(seed) * 10000 - Math.floor(Math.sin(seed) * 10000)
                const randomFactor = (random * 2 - 1) * 0.02 // ±2%
                dataPoint[symbol] = Number.parseFloat((basePrice * (1 + randomFactor)).toFixed(2))
            }
        })

        result.push(dataPoint)
    })

    return result
}

// Function to get the latest stock prices using Yahoo Finance
export async function fetchLatestStockPrices(symbols: string[]) {
    try {
        console.log("Fetching stock prices from Yahoo Finance...")
        const result: Record<string, { price: number; change: number }> & { _simulated?: boolean } = {}

        // Fetch current price for each symbol
        const fetchPromises = symbols.map(async (symbol) => {
            try {
                const quote = await yahooFinance.quote(symbol)

                if (quote && quote.regularMarketPrice) {
                    result[symbol] = {
                        price: quote.regularMarketPrice,
                        change: quote.regularMarketChangePercent || 0,
                    }
                    console.log(`Got price for ${symbol}: ${quote.regularMarketPrice} (${quote.regularMarketChangePercent}%)`)
                } else {
                    console.warn(`No price data available for ${symbol}, using simulated data`)
                    result[symbol] = generateSimulatedStockPrice(symbol)
                    result._simulated = true
                }
            } catch (error) {
                console.error(`Error fetching quote for ${symbol}:`, error)
                // Fall back to simulated data for this symbol
                result[symbol] = generateSimulatedStockPrice(symbol)
                result._simulated = true
            }
        })

        // Wait for all fetches to complete (or fail)
        await Promise.allSettled(fetchPromises)

        // If we didn't get any real data, log a warning
        if (Object.keys(result).length === 0) {
            console.warn("No stock data received from Yahoo Finance API, using all simulated data")
            const data = generateSimulatedStockPrices(symbols)
            data._simulated = true
            return data
        }

        // Fill in any missing symbols with simulated data
        symbols.forEach((symbol) => {
            if (!result[symbol]) {
                result[symbol] = generateSimulatedStockPrice(symbol)
                result._simulated = true
            }
        })

        return result
    } catch (error) {
        console.error("Error fetching latest stock prices from Yahoo Finance:", error)
        // Fall back to simulated data on error
        const data = generateSimulatedStockPrices(symbols)
        data._simulated = true
        return data
    }
}

// Function to generate a simulated stock price for a single symbol
function generateSimulatedStockPrice(symbol: string) {
    const stockProfiles: Record<string, { basePrice: number; volatility: number }> = {
        AAPL: { basePrice: 185.92, volatility: 1.5 },
        MSFT: { basePrice: 408.35, volatility: 2.2 },
        GOOGL: { basePrice: 161.25, volatility: 1.8 },
        AMZN: { basePrice: 182.4, volatility: 2.0 },
        TSLA: { basePrice: 235.45, volatility: 3.5 },
        NVDA: { basePrice: 950.02, volatility: 4.2 },
        META: { basePrice: 480.0, volatility: 2.8 },
        JPM: { basePrice: 198.75, volatility: 1.2 },
        V: { basePrice: 275.35, volatility: 0.9 },
        JNJ: { basePrice: 158.22, volatility: 0.7 },
    }

    const profile = stockProfiles[symbol] || { basePrice: 100, volatility: 2.0 }
    const seed = Date.now() + symbol.charCodeAt(0) * 1000
    const random = Math.sin(seed) * 10000 - Math.floor(Math.sin(seed) * 10000)
    const changePercent = (random * 2 - 1) * profile.volatility
    const price = profile.basePrice * (1 + changePercent / 100)

    return {
        price: Number.parseFloat(price.toFixed(2)),
        change: Number.parseFloat(changePercent.toFixed(2)),
    }
}

// Function to generate simulated stock prices as a fallback
function generateSimulatedStockPrices(symbols: string[]): Record<string, { price: number; change: number }> & { _simulated?: boolean } {
    console.log("Generating simulated stock prices as fallback")
    const result: Record<string, { price: number; change: number }> & { _simulated?: boolean } = {}

    symbols.forEach((symbol) => {
        result[symbol] = generateSimulatedStockPrice(symbol)
    })

    return result
}
