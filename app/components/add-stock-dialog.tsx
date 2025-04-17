"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useWatchlist } from "@/lib/context/watchlist-context"
import { Plus } from "lucide-react"

export function AddStockDialog() {
    const [symbol, setSymbol] = useState("")
    const [open, setOpen] = useState(false)
    const { addStock } = useWatchlist()

    // Debug log on mount
    useEffect(() => {
        console.log("AddStockDialog component mounted")
    }, [])

    const handleButtonClick = () => {
        console.log("Add stock button clicked")
        setOpen(true)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        console.log("Form submitted with symbol:", symbol)
        if (symbol.trim()) {
            addStock(symbol.trim())
            setSymbol("")
            setOpen(false)
        }
    }

    console.log("Rendering AddStockDialog, open state:", open)

    return (
        <div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10"
                        onClick={(e) => {
                            console.log("Button clicked inside DialogTrigger")
                            // The event will be handled by DialogTrigger
                        }}
                    >
                        <Plus className="h-4 w-4" />
                        <span className="sr-only">Add stock</span>
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Add Stock to Watchlist</DialogTitle>
                        <DialogDescription>
                            Enter a stock symbol to add it to your watchlist.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="symbol" className="text-right">
                                    Symbol
                                </Label>
                                <Input
                                    id="symbol"
                                    value={symbol}
                                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                                    className="col-span-3"
                                    placeholder="e.g. AAPL"
                                    autoFocus
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit">Add Stock</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Alternative button outside Dialog component */}
            <Button
                variant="outline"
                size="sm"
                onClick={handleButtonClick}
                className="ml-2 mt-2"
            >
                Add Stock (Alt)
            </Button>
        </div>
    )
} 