import { Handler } from '@netlify/functions';
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

export const handler: Handler = async (event) => {
    try {
        console.log("Stock data function invoked with params:", event.queryStringParameters);

        const { symbols, period } = event.queryStringParameters || {};

        // Debugging: Log the input parameters
        console.log(`Fetching data for symbols: ${symbols}, period: ${period}`);

        if (!symbols) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*' // For local development CORS
                },
                body: JSON.stringify({ error: "No symbols provided" })
            };
        }

        const symbolList = symbols.split(',');
        const queryOptions = {
            period1: getStartDateFromPeriod(period || "1m"),
            interval: "1d" as const
        };

        // Debugging: Log the query options
        console.log("Yahoo Finance query options:", JSON.stringify(queryOptions));

        // Get historical data for all symbols
        const results = await Promise.all(
            symbolList.map(async (symbol) => {
                try {
                    console.log(`Fetching historical data for ${symbol}...`);
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
                        data: []
                    };
                }
            })
        );

        // Check if we got any data
        const hasData = results.some(result => result.data.length > 0);
        if (!hasData) {
            console.log("No historical data received for any symbol");
            return {
                statusCode: 404,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    error: "No historical data available for the selected symbols"
                })
            };
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
        console.log(`Processing ${sortedDates.length} unique dates`);

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

        console.log(`Returning ${transformedData.length} data points`);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(transformedData)
        };
    } catch (error: any) {
        console.error('Error in stock-data function:', error);

        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                error: `Failed to fetch stock data: ${error.message || "Unknown error"}`,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            })
        };
    }
}; 