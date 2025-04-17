"use client"

import { ArrowRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import Link from "next/link"

export function InsightsPrompt() {
    return (
        <Card className="relative overflow-hidden border-2 border-primary bg-primary/5 hover:bg-primary/10 transition-colors">
            <Link href="/insights" className="block p-6">
                <div className="flex flex-col items-center sm:flex-row sm:justify-between">
                    <div className="mb-4 sm:mb-0">
                        <h3 className="text-xl font-bold text-primary">Discover AI-Powered Insights</h3>
                        <p className="text-muted-foreground mt-1">
                            Visit our Insights page for advanced AI analysis of your portfolio and market trends
                        </p>
                    </div>
                    <div className="flex items-center justify-center bg-primary text-primary-foreground rounded-full h-10 w-10">
                        <ArrowRight className="h-5 w-5" />
                    </div>
                </div>
            </Link>
        </Card>
    )
} 