/**
 * TanStack Store Usage Example
 *
 * This file demonstrates how to use TanStack Store in components
 */

"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  useSidebarOpen,
  useTheme,
  useLanguage,
  usePageSize,
  useGlobalSearch,
  usePageFilters,
} from "@/lib/store"
import {
  uiActions,
  filterActions,
  userPreferencesActions,
} from "@/lib/store"

export function StoreExample() {
  // Using hooks to access store state
  const sidebarOpen = useSidebarOpen()
  const theme = useTheme()
  const language = useLanguage()
  const pageSize = usePageSize()
  const globalSearch = useGlobalSearch()
  const examplePageFilters = usePageFilters("example")

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">TanStack Store Examples</h1>

      {/* UI Store Example */}
      <Card>
        <CardHeader>
          <CardTitle>UI Store</CardTitle>
          <CardDescription>Global UI state management</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Sidebar: {sidebarOpen ? "Open" : "Closed"}</span>
            <Button onClick={() => uiActions.toggleSidebar()}>
              Toggle Sidebar
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <span>Theme: {theme}</span>
            <Select value={theme} onValueChange={uiActions.setTheme}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Button onClick={() => uiActions.openModal("example-modal")}>
              Open Modal
            </Button>
            <Button
              variant="outline"
              onClick={() => uiActions.setGlobalLoading(true)}
            >
              Set Loading
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filter Store Example */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Store</CardTitle>
          <CardDescription>Persistent filter state</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Global Search</label>
            <Input
              value={globalSearch}
              onChange={(e) => filterActions.setGlobalSearch(e.target.value)}
              placeholder="Search..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Page-specific Filter</label>
            <Input
              value={examplePageFilters.search || ""}
              onChange={(e) =>
                filterActions.setPageFilter("example", { search: e.target.value })
              }
              placeholder="Page search..."
            />
            <p className="text-xs text-muted-foreground">
              Filters: {JSON.stringify(examplePageFilters)}
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => filterActions.clearAllFilters()}
          >
            Clear All Filters
          </Button>
        </CardContent>
      </Card>

      {/* User Preferences Store Example */}
      <Card>
        <CardHeader>
          <CardTitle>User Preferences Store</CardTitle>
          <CardDescription>Persistent user settings (saved to localStorage)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Language: {language}</span>
            <Select
              value={language}
              onValueChange={(value) =>
                userPreferencesActions.setLanguage(value as "en" | "id")
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="id">Indonesian</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <span>Page Size: {pageSize}</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) =>
                userPreferencesActions.setPageSize(parseInt(value))
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            onClick={() => userPreferencesActions.resetToDefaults()}
          >
            Reset to Defaults
          </Button>
        </CardContent>
      </Card>

      {/* Code Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Examples</CardTitle>
          <CardDescription>How to use TanStack Store in your components</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 font-mono text-sm">
            <pre>{`// Import hooks and actions
import { useSidebarOpen } from "@/lib/store"
import { uiActions } from "@/lib/store"

// Use in component
const sidebarOpen = useSidebarOpen()
<Button onClick={() => uiActions.toggleSidebar()}>
  Toggle
</Button>`}</pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
