# Financial Portfolio Dashboard with AI Insights

Track and analyze your portfolio performance, enhanced with AI-powered market news analysis.

## Overview

**FinVision** is a comprehensive financial dashboard built to help investors monitor their portfolios with precision and gain AI-enhanced market insights. The application delivers real-time visualization of portfolio performance, stock comparisons, and intelligent news analysis to inform investment decisions.

Developed as a submission for the **Frontend UI Hackathon 2025 #2**, on the topic of "Build a financial portfolio dashboard with stock performance charts."

## Key Features

- **Portfolio Overview & Analytics**  
  Interactive visualization of portfolio value, asset allocation, and performance metrics with comparison against market benchmarks.

- **Stock Performance Visualization**  
  Dynamic, responsive charts for tracking historical price movements of portfolio holdings and watchlist stocks.

- **AI-Powered News Analysis**  
  Intelligent classification of financial news using Google's Gemini AI, with sentiment analysis tailored to your portfolio holdings.

- **Customizable Watchlist**  
  Track and compare multiple stocks side-by-side with color-coded performance indicators and seamless Yahoo Finance integration.

- **Detailed Transaction History**  
  Comprehensive log of buy/sell activities with filtering options and performance impact indicators.

- **Responsive Design**  
  Fully responsive interface optimized for both desktop and mobile experiences, with dark mode support.

## Live Demo

Experience the dashboard:  
[https://outlier-finvision.netlify.app](https://outlier-finvision.netlify.app)

## Technical Implementation

### Architecture
- **Frontend:** React 19, Next.js 14, TypeScript
- **UI Framework:** Tailwind CSS with shadcn/ui components
- **State Management:** React Context API with custom hooks
- **Data Visualization:** Custom SVG-based charts with theme awareness
- **API Integration:** Server-side API routes with error handling and fallbacks

### Data Sources
- **Market Data:** Yahoo Finance API integration for real-time stock prices and historical data
- **News Analysis:** Google Gemini AI for sentiment analysis and topic classification of financial news
- **Portfolio Data:** Simulated portfolio data with realistic market behavior

## Development

```bash
# Install dependencies
pnpm install

# Start the development server
pnpm dev

# Build for production
pnpm build
```

## Technical Highlights

- **Optimized Performance:** Client-side caching and lazy-loading for responsive data visualization
- **Fallback Mechanisms:** Graceful degradation with simulated data when API limits are reached
- **Color-Blind Accessible:** Carefully selected color palettes that work in both light and dark modes
- **Progressive Enhancement:** Core functionality works even with limited JavaScript support

## Hackathon Submission

Submitted for the **Frontend UI Hackathon 2025 #2**, focused on creating an intuitive and insightful financial dashboard experience.

---

*Developed by Istvan (Steven) Nagy*

*© 2025 FinVision*
