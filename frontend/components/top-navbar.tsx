"use client"

import * as React from "react"

import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Icon } from "@/components/ui/icon"
import { TenantSwitcher } from "@/components/tenant-switcher"

export function TopNavbar() {
  const [open, setOpen] = React.useState(false)
  const { setTheme, theme } = useTheme()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <div className="flex items-center gap-2">
      {/* Tenant Switcher */}
      <TenantSwitcher />
      {/* Command Search */}
      <Button
        variant="outline"
        className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2"
        onClick={() => setOpen(true)}
      >
        <Icon name="Search" size={16} className="xl:mr-2" />
        <span className="hidden xl:inline-flex">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={() => setOpen(false)}>
              <span>Go to Dashboard</span>
            </CommandItem>
            <CommandItem onSelect={() => setOpen(false)}>
              <span>Create New Document</span>
            </CommandItem>
            <CommandItem onSelect={() => setOpen(false)}>
              <span>Submit Leave Request</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => setOpen(false)}>
              <span>HR - Attendance</span>
            </CommandItem>
            <CommandItem onSelect={() => setOpen(false)}>
              <span>Finance - Expense Requests</span>
            </CommandItem>
            <CommandItem onSelect={() => setOpen(false)}>
              <span>Documents - My Documents</span>
            </CommandItem>
            <CommandItem onSelect={() => setOpen(false)}>
              <span>Ticketing - My Tickets</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem onSelect={() => setOpen(false)}>
              <span>Profile Settings</span>
            </CommandItem>
            <CommandItem onSelect={() => setOpen(false)}>
              <span>System Configuration</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      {/* Notification Icon */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Icon name="Bell" size={20} />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
              3
            </Badge>
            <span className="sr-only">Notifications</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <span className="font-semibold">Notifications</span>
            <Button variant="ghost" size="sm" className="text-xs">
              Mark all as read
            </Button>
          </div>
          <DropdownMenuItem className="flex flex-col items-start gap-1 p-4">
            <span className="font-medium">Leave Request Approved</span>
            <span className="text-sm text-muted-foreground">Your leave request for Dec 25-26 has been approved.</span>
            <span className="text-xs text-muted-foreground">2 hours ago</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex flex-col items-start gap-1 p-4">
            <span className="font-medium">New Ticket Assigned</span>
            <span className="text-sm text-muted-foreground">Ticket #1234 has been assigned to you.</span>
            <span className="text-xs text-muted-foreground">5 hours ago</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex flex-col items-start gap-1 p-4">
            <span className="font-medium">Document Shared</span>
            <span className="text-sm text-muted-foreground">John shared "Q4 Report" with you.</span>
            <span className="text-xs text-muted-foreground">1 day ago</span>
          </DropdownMenuItem>
          <div className="p-2 border-t">
            <Button variant="ghost" className="w-full text-sm">
              View all notifications
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dark Mode Toggle */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Icon name="Sun" size={20} className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Icon name="Moon" size={20} className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setTheme("light")}>
            Light
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark")}>
            Dark
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("system")}>
            System
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
