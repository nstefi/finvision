import { NextRequest, NextResponse } from 'next/server';
// Import yahoo-finance2 properly to handle ESM modules
import yahooFinance from 'yahoo-finance2';

// Helper function to determine start date based on period
function getStartDateFromPeriod(period: string): Date {
    const now = new Date();
    switch (period) {
        case "1w":
            return new Date(now.setDate(now.getDate() - 7));
        case "1m":
            return new Date(now.setMonth(now.getMonth() - 1));
        case "3m":
            return new Date(now.setMonth(now.getMonth() - 3));
        case "1y":
            return new Date(now.setFullYear(now.getFullYear() - 1));
        default:
            return new Date(now.setMonth(now.getMonth() - 1));
    }
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const symbols = searchParams.get('symbols');
        const period = searchParams.get('period') || '1m';

        if (!symbols) {
            console.error("API Error: No symbols provided in request");
            return NextResponse.json({
                error: "No symbols provided",
                message: "Please provide at least one stock symbol"
            }, { status: 400 });
        }

        const symbolList = symbols.split(',');
        console.log(`API route fetching data for: ${symbolList.join(', ')}, period: ${period}`);

        const queryOptions = {
            period1: getStartDateFromPeriod(period),
            interval: "1d" as const
        };

        // Get historical data for all symbols
        const results = await Promise.all(
            symbolList.map(async (symbol) => {
                try {
                    const data = await yahooFinance.historical(symbol, queryOptions);
                    console.log(`Received ${data.length} data points for ${symbol}`);

                    return {
                        symbol,
                        data: data.map(item => ({
                            date: item.date instanceof Date
                                ? item.date.toISOString().split('T')[0]
                                : new Date(item.date).toISOString().split('T')[0],
                            price: item.close,
                            formattedDate: new Date(item.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                            })
                        }))
                    };
                } catch (error) {
                    console.error(`Error fetching data for ${symbol}:`, error);
                    return {
                        symbol,
                        data: [],
                        error: true
                    };
                }
            })
        );

        // Check if all symbols failed
        const allFailed = results.every(result => result.data.length === 0);
        if (allFailed) {
            console.error("API Error: No data available for any of the requested symbols");
            return NextResponse.json({
                error: "No historical data available",
                message: "Could not retrieve data for any of the selected symbols",
                symbols: symbolList
            }, { status: 404 });
        }

        // Check if we got any data
        const hasData = results.some(result => result.data.length > 0);
        if (!hasData) {
            console.error("API Error: No historical data available");
            return NextResponse.json({
                error: "No historical data available for the selected symbols",
                message: "Please try a different time period or different symbols"
            }, { status: 404 });
        }

        // Transform the data into the format expected by the chart
        const transformedData = [];
        const allDates = new Set<string>();

        // Collect all unique dates
        results.forEach(result => {
            result.data.forEach(item => {
                allDates.add(item.date);
            });
        });

        // Sort dates
        const sortedDates = Array.from(allDates).sort();

        // Create data points for each date
        sortedDates.forEach(date => {
            const dataPoint: Record<string, any> = {
                date,
                formattedDate: new Date(date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                })
            };

            // Add price for each symbol
            results.forEach(result => {
                const priceData = result.data.find(item => item.date === date);
                dataPoint[result.symbol] = priceData ? priceData.price : null;
            });

            transformedData.push(dataPoint);
        });

        return NextResponse.json(transformedData);
    } catch (error: any) {
        console.error('Error fetching stock data:', error);
        return NextResponse.json({
            error: "Failed to fetch stock data",
            message: error.message || "An unexpected error occurred",
            status: "error"
        }, { status: 500 });
    }
} 