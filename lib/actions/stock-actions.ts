"use server"

import { format, subDays, subMonths, subYears } from "date-fns"
import seedRandom from "seedrandom"

// Helper function to log API key status
function logApiKeyStatus() {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY
    if (!apiKey) {
        console.log("⚠️ ALPHA_VANTAGE_API_KEY is not set!")
        return false
    }

    // Mask the API key in logs for security
    const firstPart = apiKey.slice(0, 4)
    const lastPart = apiKey.slice(-4)
    const maskedPart = "*".repeat(Math.max(0, apiKey.length - 8))
    console.log(`ALPHA_VANTAGE_API_KEY is set: ${firstPart}${maskedPart}${lastPart} (${apiKey.length} chars)`)
    return true
}

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

// This server action fetches stock data
export async function fetchStockData(symbols: string[], period: string) {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY
    if (!apiKey) {
        throw new Error("ALPHA_VANTAGE_API_KEY environment variable is not set")
    }

    // Get historical data for all symbols
    const historicalData: Record<string, any[]> = {}

    // Fetch data for each symbol
    for (const symbol of symbols) {
        try {
            const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${symbol}&outputsize=full&apikey=${apiKey}`
            const data = await fetchWithRetry(url)

            if (data["Time Series (Daily)"]) {
                const timeSeriesData = data["Time Series (Daily)"]
                const dates = Object.keys(timeSeriesData).sort()

                // Filter dates based on period
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

                const filteredDates = dates.filter(date => {
                    const dateObj = new Date(date)
                    return dateObj >= startDate && dateObj <= endDate
                })

                historicalData[symbol] = filteredDates.map(date => ({
                    date,
                    price: parseFloat(timeSeriesData[date]["4. close"])
                }))
            }
        } catch (error) {
            console.error(`Error fetching data for ${symbol}:`, error)
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
                const random = seedRandom(seed)
                const randomFactor = (random * 2 - 1) * 0.005 // Small random factor for realism

                // Linear interpolation between start and current price with some randomness
                const price = estimatedStartPrice + (currentPrice - estimatedStartPrice) * dayRatio
                const adjustedPrice = price * (1 + randomFactor)

                dataPoint[symbol] = Number.parseFloat(adjustedPrice.toFixed(2))
            } else {
                // If we don't have current price data, generate completely simulated data
                const basePrice = 100 // Default base price
                const seed = date.getTime() + symbol.charCodeAt(0) * 1000
                const random = seedRandom(seed)
                const randomFactor = (random * 2 - 1) * 0.02 // ±2%
                dataPoint[symbol] = Number.parseFloat((basePrice * (1 + randomFactor)).toFixed(2))
            }
        })

        result.push(dataPoint)
    })

    return result
}

// Function to generate simulated stock data as a fallback
function generateSimulatedStockData(symbols: string[], startDate: Date, endDate: Date, period: string) {
    console.log("Generating fully simulated stock data as fallback")

    // Define base prices and volatility for common stocks
    const stockProfiles: Record<string, { basePrice: number; volatility: number; trend: number }> = {
        AAPL: { basePrice: 185.92, volatility: 0.015, trend: 0.0002 },
        MSFT: { basePrice: 408.35, volatility: 0.012, trend: 0.0003 },
        GOOGL: { basePrice: 161.25, volatility: 0.018, trend: 0.0001 },
        AMZN: { basePrice: 182.4, volatility: 0.02, trend: 0.0002 },
        TSLA: { basePrice: 235.45, volatility: 0.035, trend: -0.0001 },
        NVDA: { basePrice: 950.02, volatility: 0.025, trend: 0.0005 },
        META: { basePrice: 480.0, volatility: 0.022, trend: 0.0003 },
        JPM: { basePrice: 198.75, volatility: 0.01, trend: 0.0001 },
        V: { basePrice: 275.35, volatility: 0.008, trend: 0.0001 },
        JNJ: { basePrice: 158.22, volatility: 0.007, trend: 0.0 },
    }

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
            const profile = stockProfiles[symbol] || { basePrice: 100, volatility: 0.02, trend: 0.0001 }

            // Create a realistic price movement using random walk with drift
            // The seed ensures the same symbol+date always gives the same "random" result
            const seed = date.getTime() + symbol.charCodeAt(0) * 1000
            const random = seedRandom(seed)

            // Calculate price based on days from start (trend component) and random walk
            const daysSinceStart = (date.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)
            const trendComponent = profile.trend * daysSinceStart
            const randomComponent = (random * 2 - 1) * profile.volatility

            // Price is base price plus trend and random components
            const priceMultiplier = 1 + trendComponent + randomComponent
            const price = profile.basePrice * priceMultiplier

            dataPoint[symbol] = Number.parseFloat(price.toFixed(2))
        })

        result.push(dataPoint)
    })

    return result
}

// Simple seeded random number generator
function seedRandom(seed: number): number {
    const x = Math.sin(seed) * 10000
    return x - Math.floor(x)
}

// Function to get the latest stock prices
export async function fetchLatestStockPrices(symbols: string[]) {
    try {
        const apiKey = process.env.FINNHUB_API_KEY
        const hasApiKey = logApiKeyStatus()

        // Debug: Log the API key (partially masked for security)
        const maskedKey = apiKey ? `${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 5)}` : "undefined"
        console.log(`Using Finnhub API key for quotes: ${maskedKey}`)

        if (!apiKey) {
            console.warn("FINNHUB_API_KEY environment variable is not set, using simulated data")
            const data = generateSimulatedStockPrices(symbols)
            data._simulated = true
            return data
        }

        // Get current prices for all symbols
        const result: Record<string, { price: number; change: number }> = {}

        // Fetch current price for each symbol
        const fetchPromises = symbols.map(async (symbol) => {
            try {
                const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`
                console.log(`Fetching quote for ${symbol}...`)

                // Use our robust fetch helper with retry logic
                const data = await fetchWithRetry(url)

                if (data && data.c) {
                    result[symbol] = {
                        price: data.c,
                        change: data.dp || 0,
                    }
                    console.log(`Got price for ${symbol}: ${data.c} (${data.dp}%)`)
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
            console.warn("No stock data received from API, using all simulated data")
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
        console.error("Error fetching latest stock prices:", error)
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
    const random = seedRandom(seed)
    const changePercent = (random * 2 - 1) * profile.volatility
    const price = profile.basePrice * (1 + changePercent / 100)

    return {
        price: Number.parseFloat(price.toFixed(2)),
        change: Number.parseFloat(changePercent.toFixed(2)),
    }
}

// Function to generate simulated stock prices as a fallback
function generateSimulatedStockPrices(symbols: string[]) {
    console.log("Generating simulated stock prices as fallback")
    const result: Record<string, { price: number; change: number }> = {}

    symbols.forEach((symbol) => {
        result[symbol] = generateSimulatedStockPrice(symbol)
    })

    return result
}
