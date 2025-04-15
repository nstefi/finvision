import { Handler } from '@netlify/functions';
import yahoo from 'yahoo-finance2';

export const handler: Handler = async (event) => {
    try {
        console.log("Yahoo test function invoked");

        // Try to get a simple quote for AAPL
        const quote = await yahoo.quote('AAPL');

        // Try to get historical data for AAPL
        const historical = await yahoo.historical('AAPL', {
            period1: new Date(new Date().setMonth(new Date().getMonth() - 1)), // 1 month ago
            interval: "1d" as const
        });

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                quote: {
                    symbol: quote.symbol,
                    price: quote.regularMarketPrice,
                    change: quote.regularMarketChange,
                    changePercent: quote.regularMarketChangePercent
                },
                historical: {
                    count: historical.length,
                    first: historical[0],
                    last: historical[historical.length - 1]
                },
                message: "Yahoo Finance API is working correctly"
            })
        };
    } catch (error: any) {
        console.error("Error in yahoo-test function:", error);

        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                error: `Failed to fetch Yahoo Finance data: ${error.message || "Unknown error"}`,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            })
        };
    }
}; 