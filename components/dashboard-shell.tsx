"use client"

import type React from "react"

import { Sidebar, SidebarContent, SidebarHeader, SidebarFooter } from "@/components/ui/sidebar"
import { MainNav } from "@/components/main-nav"
import { DashboardNav } from "@/components/dashboard-nav"
import { UserNav } from "@/components/user-nav"
import { ModeToggle } from "@/components/mode-toggle"
import { ReactVersion } from "@/components/react-version"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/hooks/use-sidebar"

interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  const { toggleSidebar } = useSidebar()

  return (
    <div className="flex min-h-screen">
      <Sidebar>
        <SidebarHeader className="border-b border-border/40 pb-2">
          <div className="flex items-center px-2">
            <span className="text-xl font-bold text-primary">FinVision</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <DashboardNav />
        </SidebarContent>
        <SidebarFooter className="border-t border-border/40 pt-2">
          <UserNav />
        </SidebarFooter>
      </Sidebar>
      <div className="flex flex-1 flex-col">
        <div className="flex h-16 items-center justify-between border-b px-4">
          <MainNav />
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleSidebar}
              aria-label="Toggle Menu"
              className="md:hidden"
            >
              <Menu className="h-[1.2rem] w-[1.2rem]" />
            </Button>
            <ModeToggle />
          </div>
        </div>
        <main className="flex-1 space-y-4 p-4 pt-6 md:p-8">{children}</main>
        <footer className="border-t p-4 text-center">
          <ReactVersion />
        </footer>
      </div>
    </div>
  )
}
