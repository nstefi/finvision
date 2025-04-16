"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, Terminal, Lightbulb } from "lucide-react" // Icons

// --- Types (should match API) ---
interface NewsItem {
    title: string
    url: string
    timePublished: string
    topics: string[]
    sentiment: string
    source: string
    relatedSymbols: string[]
}

interface NotableStock {
    ticker: string
    mentions: number
    dominant_sentiment: string
}

interface AIAnalysisResult {
    news_summary: string
    key_themes: string[]
    sentiment_trend: string
    notable_stocks: NotableStock[]
    potential_focus_areas: string[]
}

interface AiInsightsCardProps {
    news: NewsItem[]
    relevantSymbols: string[]
    isLoadingNews: boolean // To disable button while parent is loading
}

export function AiInsightsCard({ news, relevantSymbols, isLoadingNews }: AiInsightsCardProps) {
    const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleGenerateInsights = async () => {
        setLoading(true)
        setError(null)
        setAnalysis(null) // Clear previous analysis

        try {
            const response = await fetch('/api/ai-insights', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ news, relevantSymbols }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }

            setAnalysis(data)
        } catch (err) {
            console.error("Error fetching AI insights:", err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setLoading(false)
        }
    }

    const canGenerate = news.length > 0 && !isLoadingNews;

    return (
        <Card className="mt-6">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-yellow-500" />
                        AI Investment Insights
                    </CardTitle>
                    <Button
                        onClick={handleGenerateInsights}
                        disabled={!canGenerate || loading}
                        size="sm"
                    >
                        {loading ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                        ) : (
                            'Generate from Current News'
                        )}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {error && (
                    <Alert variant="destructive">
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>Error Generating Insights</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {!analysis && !loading && !error && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                        {canGenerate
                            ? 'Click the button above to generate AI-powered insights based on the current news displayed.'
                            : 'Add stocks to your watchlist or select \'All Stocks\' news to enable AI insights generation.'
                        }
                    </p>
                )}

                {analysis && (
                    <div className="space-y-4 text-sm">
                        <div>
                            <h4 className="font-semibold mb-1">News Summary:</h4>
                            <p className="text-muted-foreground">{analysis.news_summary}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-1">Key Themes:</h4>
                            <ul className="list-disc list-inside text-muted-foreground space-y-1">
                                {analysis.key_themes?.map((theme, index) => <li key={index}>{theme}</li>)}
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-1">Sentiment Trend:</h4>
                            <p className="text-muted-foreground">{analysis.sentiment_trend}</p>
                        </div>
                        {analysis.notable_stocks?.length > 0 && (
                            <div>
                                <h4 className="font-semibold mb-1">Notable Stocks in Headlines:</h4>
                                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                                    {analysis.notable_stocks.map((stock, index) => (
                                        <li key={index}>
                                            <span className="font-medium">{stock.ticker || 'Unknown'}:</span> {stock.mentions} mention(s), Dominant Sentiment: {stock.dominant_sentiment}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <div>
                            <h4 className="font-semibold mb-1">Potential Focus Areas:</h4>
                            <ul className="list-disc list-inside text-muted-foreground space-y-1">
                                {analysis.potential_focus_areas?.map((area, index) => <li key={index}>{area}</li>)}
                            </ul>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
} 