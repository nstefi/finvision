"use client"

import { useContext } from "react"
import { SidebarContext } from "@/components/ui/sidebar"

export function useSidebar() {
    const context = useContext(SidebarContext)
    if (context === null) {
        throw new Error("useSidebar must be used within a SidebarProvider")
    }
    return context
} 