"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

export function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname()

  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)} {...props}>
      <Link
        href="/"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/" ? "text-primary" : "text-muted-foreground",
        )}
      >
        Overview
      </Link>
      <Link
        href="/portfolio"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/portfolio" ? "text-primary" : "text-muted-foreground",
        )}
      >
        Portfolio
      </Link>
      <Link
        href="/performance"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/performance" ? "text-primary" : "text-muted-foreground",
        )}
      >
        Performance
      </Link>
      <Link
        href="/market"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/market" ? "text-primary" : "text-muted-foreground",
        )}
      >
        Market
      </Link>
    </nav>
  )
}
