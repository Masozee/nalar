'use client'

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Bell, Moon, Sun, Search } from "lucide-react"
import React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [darkMode, setDarkMode] = React.useState(false)

  return (
    <div className={`admin-layout font-sans min-h-screen ${darkMode ? 'dark bg-background' : 'bg-gray-50'}`}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          {/* Modern shadcn-like Topbar */}
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 bg-background/95 backdrop-blur border-b border-border px-8">
            {/* Left: Sidebar Trigger + Breadcrumb */}
            <SidebarTrigger className="mr-2 px-6" />
            <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-muted-foreground">
              <span className="font-semibold text-primary">Admin</span>
              <Separator orientation="vertical" className="mx-2 h-5" />
              <span className="text-muted-foreground">Dashboard</span>
            </nav>
            {/* Right: Search, Notification, Dark mode toggle */}
            <div className="ml-auto flex items-center gap-2">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search..."
                  className="pl-8 pr-2 py-1 h-9 w-40 text-sm"
                />
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Notifications">
                      <Bell className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Notifications</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Toggle dark mode"
                      onClick={() => setDarkMode((v) => !v)}
                    >
                      {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Toggle dark mode</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </header>
          <main className="p-6 md:p-10 max-w-7xl mx-auto w-full">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}