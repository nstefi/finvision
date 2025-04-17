"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWatchlist } from "@/lib/context/watchlist-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

export function WatchlistCard() {
    const { watchlistStocks, removeStock, addStock } = useWatchlist();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [symbol, setSymbol] = useState("");

    // Debug mount
    useEffect(() => {
        console.log("WatchlistCard mounted");
        return () => console.log("WatchlistCard unmounted");
    }, []);

    // Debug state changes
    useEffect(() => {
        console.log("Modal state changed:", isModalOpen);
    }, [isModalOpen]);

    const handleAddClick = () => {
        console.log("Add button clicked - current modal state:", isModalOpen);
        setIsModalOpen(true);
        console.log("Modal state after setting:", true);
    };

    const handleCloseModal = () => {
        console.log("Closing modal");
        setIsModalOpen(false);
        setSymbol("");
    };

    const handleAddStock = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Adding stock:", symbol);
        if (symbol.trim()) {
            addStock(symbol.trim());
            setSymbol("");
            setIsModalOpen(false);
        }
    };

    return (
        <Card className="col-span-3 relative">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Watchlist</CardTitle>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddClick}
                >
                    Add
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {watchlistStocks.map((symbol) => (
                        <div
                            key={symbol}
                            className="flex items-center justify-between rounded-lg border p-3"
                        >
                            <div className="font-medium">{symbol}</div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeStock(symbol)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    {watchlistStocks.length === 0 && (
                        <div className="text-sm text-muted-foreground">
                            No stocks in watchlist. Click Add to add stocks.
                        </div>
                    )}
                </div>
            </CardContent>

            {/* Modal with portal-like positioning */}
            {isModalOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 z-50"
                        onClick={handleCloseModal}
                    />
                    {/* Modal */}
                    <div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-full max-w-md z-50">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Add Stock to Watchlist</h3>
                            <Button variant="ghost" size="icon" onClick={handleCloseModal}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <form onSubmit={handleAddStock}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1" htmlFor="symbol">
                                    Symbol
                                </label>
                                <Input
                                    id="symbol"
                                    value={symbol}
                                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                                    placeholder="e.g. AAPL"
                                    className="w-full"
                                    autoFocus
                                />
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit">Add Stock</Button>
                            </div>
                        </form>
                    </div>
                </>
            )}
        </Card>
    );
} 