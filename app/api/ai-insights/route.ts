import { NextResponse } from 'next/server'
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'

// --- Type Definition (should match frontend) ---
interface NewsItem {
    title: string
    url: string
    timePublished: string
    topics: string[]
    sentiment: string
    source: string
    relatedSymbols: string[]
}

// --- Google AI Setup ---
let genAI: GoogleGenerativeAI | null = null
let model: any | null = null

function initializeAI() {
    if (!genAI) {
        if (!process.env.GOOGLE_API_KEY) {
            console.error('GOOGLE_API_KEY not set. Cannot generate AI insights.')
            return false
        }
        try {
            genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY)
            model = genAI.getGenerativeModel({
                // Using the same model as news analysis for consistency
                model: "gemini-2.0-flash-lite",
                safetySettings: [
                    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                ]
            })
            console.log('AI Insights: Google AI Client Initialized.')
            return true
        } catch (error) {
            console.error('AI Insights: Failed to initialize Google AI Client:', error)
            genAI = null
            model = null
            return false
        }
    }
    return true
}

// --- API Handler ---
export async function POST(request: Request) {
    if (!initializeAI() || !model) {
        return NextResponse.json({ error: 'AI Service not available' }, { status: 503 })
    }

    try {
        const { news, relevantSymbols } = await request.json() as { news: NewsItem[], relevantSymbols: string[] };

        if (!news || !Array.isArray(news) || news.length === 0) {
            return NextResponse.json({ error: 'Missing or invalid news data' }, { status: 400 });
        }
        if (!relevantSymbols || !Array.isArray(relevantSymbols)) {
            return NextResponse.json({ error: 'Missing or invalid symbols data' }, { status: 400 });
        }

        // --- Prepare Data for Prompt ---
        const formattedNews = news.map(item =>
            `- "${item.title}" (Source: ${item.source}, Sentiment: ${item.sentiment}, Topic: ${item.topics.join(', ') || 'N/A'}, Published: ${new Date(item.timePublished).toLocaleDateString()})`
        ).join('\\n');

        const symbolsString = relevantSymbols.join(', ') || 'various';

        // --- Construct the Prompt ---
        const prompt = `
        Analyze the following recent news headlines provided for the stock symbols: ${symbolsString}. 
        Focus *only* on the information presented in these headlines. Do not use external knowledge.

        News Headlines:
        ${formattedNews}

        Based *only* on these news items, provide an analysis in JSON format. The JSON object should have the following keys:
        - "news_summary": (String) A brief 1-2 sentence overview summarizing the tone and scope of the provided news.
        - "key_themes": (Array of Strings) List the 2-4 most prominent themes or topics that emerge *directly* from the headlines provided.
        - "sentiment_trend": (String) Describe the overall sentiment trend observed *in these specific headlines* (e.g., "Mostly Bullish for Tech mentioned", "Bearish sentiment noted for AAPL", "Mixed signals across sectors").
        - "notable_stocks": (Array of Objects) List stocks mentioned frequently (if any) or those associated with particularly strong sentiment headlines *in this list*. Each object should have "ticker" (string, if identifiable from headline or symbols list), "mentions" (number), and "dominant_sentiment" (string, e.g., "Bullish", "Bearish", "Mixed", "Neutral"). Only include stocks explicitly mentioned or clearly referenced in the headlines.
        - "potential_focus_areas": (Array of Strings) List 1-3 actionable focus areas or questions raised *directly* by these headlines (e.g., "Monitor [Ticker]'s upcoming earnings based on recent speculation", "Track [Sector] news closely given recent volatility", "Investigate reasons behind [Ticker]'s mixed sentiment").

        Example JSON structure:
        {
          "news_summary": "Recent news shows strong positive sentiment for tech stocks, particularly GOOGL, while AAPL faces some negative press.",
          "key_themes": ["AI development momentum", "Company earnings reports", "Market volatility concerns"],
          "sentiment_trend": "Generally Bullish for GOOGL and MSFT headlines, Bearish for AAPL headlines.",
          "notable_stocks": [{"ticker": "AAPL", "mentions": 3, "dominant_sentiment": "Bearish"}, {"ticker": "GOOGL", "mentions": 2, "dominant_sentiment": "Bullish"}],
          "potential_focus_areas": ["Watch upcoming AAPL announcements closely", "Follow GOOGL's AI project news"]
        }
        
        Ensure the output is valid JSON.
        `.trim()

        // --- Generate Content ---
        console.log('AI Insights: Generating analysis...')
        // Add slight delay and retry logic similar to news analysis if needed, but start simple
        const result = await model.generateContent(prompt)
        const response = result.response
        let text = response.text()

        console.log('AI Insights: Raw response received.')

        // Clean the response to extract JSON
        const jsonMatch = text.match(/\\{.*\\}/s)
        if (jsonMatch && jsonMatch[0]) {
            text = jsonMatch[0]
        } else {
            // Attempt to find JSON even without backticks
            if (text.indexOf('{') > -1 && text.lastIndexOf('}') > -1) {
                text = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
            } else {
                console.error("AI Insights: No valid JSON found in response:", text)
                throw new Error("AI failed to return valid JSON analysis")
            }
        }

        try {
            const analysisResult = JSON.parse(text);
            console.log('AI Insights: Analysis generated successfully.')
            return NextResponse.json(analysisResult);
        } catch (parseError) {
            console.error("AI Insights: Failed to parse JSON response:", text, parseError)
            throw new Error("AI returned malformed JSON analysis")
        }

    } catch (error) {
        console.error('AI Insights: Error generating insights:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
        // Check for specific Google AI errors (e.g., rate limits) if needed
        if (errorMessage.includes("429")) {
            return NextResponse.json({ error: 'AI Rate Limit Exceeded. Please try again later.' }, { status: 429 })
        }
        return NextResponse.json({ error: 'Failed to generate AI insights', details: errorMessage }, { status: 500 })
    }
} 