import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';
export const maxDuration = 10; // Set maximum execution time to 10 seconds

interface HistoricalData {
    date: string;
    price: number;
    symbol: string;
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const symbols = searchParams.get('symbols');
        const timeframe = searchParams.get('timeframe') || '1W';

        if (!symbols) {
            return NextResponse.json({ error: 'No symbols provided' }, { status: 400 });
        }

        const symbolArray = symbols.split(',');
        if (symbolArray.length === 0) {
            return NextResponse.json({ error: 'No valid symbols provided' }, { status: 400 });
        }

        // Get period based on timeframe
        const interval = getIntervalFromTimeframe(timeframe);
        const range = getRangeFromTimeframe(timeframe);

        // Fetch data for each symbol in parallel
        const requests = symbolArray.map(symbol => fetchHistoricalData(symbol, interval, range));
        const results = await Promise.all(requests);

        // Flatten the results and combine
        const combinedData = results.flat();

        return NextResponse.json(combinedData);
    } catch (error) {
        console.error('Error fetching historical prices:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to fetch historical prices' },
            { status: 500 }
        );
    }
}

async function fetchHistoricalData(symbol: string, interval: string, range: string): Promise<HistoricalData[]> {
    try {
        // Yahoo Finance API
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch data for ${symbol}: ${response.statusText}`);
        }

        const data = await response.json();

        // Check if we have valid data
        if (
            !data.chart ||
            !data.chart.result ||
            data.chart.result.length === 0 ||
            !data.chart.result[0].timestamp ||
            !data.chart.result[0].indicators ||
            !data.chart.result[0].indicators.quote ||
            !data.chart.result[0].indicators.quote[0].close
        ) {
            console.error(`Invalid data structure for ${symbol}:`, data);
            return [];
        }

        const timestamps = data.chart.result[0].timestamp;
        const closePrices = data.chart.result[0].indicators.quote[0].close;

        // Map timestamps and prices to our data format
        return timestamps.map((timestamp: number, index: number) => {
            const price = closePrices[index];
            if (price === null || price === undefined) return null;

            return {
                date: new Date(timestamp * 1000).toISOString().split('T')[0],
                price: parseFloat(price.toFixed(2)),
                symbol
            };
        }).filter(Boolean);
    } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error);
        return [];
    }
}

function getIntervalFromTimeframe(timeframe: string): string {
    switch (timeframe) {
        case '1D':
            return '5m';
        case '1W':
            return '1d';
        case '1M':
            return '1d';
        case '1Y':
            return '1wk';
        default:
            return '1d';
    }
}

function getRangeFromTimeframe(timeframe: string): string {
    switch (timeframe) {
        case '1D':
            return '1d';
        case '1W':
            return '5d';
        case '1M':
            return '1mo';
        case '1Y':
            return '1y';
        default:
            return '5d';
    }
} 