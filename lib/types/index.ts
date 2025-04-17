// Common type definitions used throughout the application

export interface NewsItem {
    title: string
    url: string
    timePublished: string
    topics: string[]
    sentiment: string
    source: string
    relatedSymbols?: string[]
    summary?: string
}

export interface StockData {
    price: number
    change: number
}

// Color themes for charts and visualizations
export const darkThemePalette = [
    "#f1c40f", // Bright Yellow
    "#2ecc71", // Bright Green
    "#e74c3c", // Bright Red
    "#3498db", // Bright Blue
    "#9b59b6", // Bright Purple
    "#00d2d3", // Bright Cyan
    "#fd79a8", // Bright Pink
    "#f39c12", // Bright Orange
    "#6c5ce7", // Bright Indigo
    "#1abc9c", // Bright Teal
    "#e67e22", // Bright Amber
    "#a29bfe", // Bright Lavender
]

export const lightThemePalette = [
    "#d35400", // Dark Orange
    "#2980b9", // Dark Blue
    "#c0392b", // Dark Red
    "#27ae60", // Dark Green
    "#8e44ad", // Dark Purple
    "#16a085", // Dark Teal
    "#d81b60", // Dark Pink
    "#7f8c8d", // Dark Gray
    "#2c3e50", // Navy Blue
    "#006064", // Dark Cyan
    "#5d4037", // Brown
    "#616161", // Medium Gray
]

// Default watchlist stocks
export const DEFAULT_WATCHLIST_STOCKS = ["AAPL", "MSFT", "GOOGL", "AMZN"] 