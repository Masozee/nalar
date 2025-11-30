# CLAUDE.md - Frontend

This file provides guidance to Claude Code when working with the Next.js frontend.

## Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Architecture

This is a Next.js 16 (App Router) frontend for an enterprise resource planning (ERP) system, using TypeScript and Tailwind CSS.

### Tech Stack
- **Framework**: Next.js 16 with App Router and Turbopack
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: HugeIcons React (not Lucide)
- **State Management**:
  - TanStack Query (React Query) for server state
  - TanStack Store for global client state
  - React hooks for local component state
- **Tables**: TanStack Table v8
- **API Client**: Custom API client with fetch

## Project Structure

```
frontend/
├── app/                    # App Router pages
│   ├── (main)/            # Main site routes
│   ├── (admin)/           # Admin dashboard
│   ├── hr/                # HR module
│   │   ├── attendance/
│   │   ├── leave/
│   │   ├── payroll/
│   │   └── policies/
│   ├── organization/      # Organization module
│   ├── tools/             # Utility tools
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Custom components
├── lib/                   # Utilities
│   ├── api/              # API clients
│   └── utils.ts          # Helper functions
└── public/               # Static assets
```

## Design Standards

### Layout & Spacing
- **Page padding**: `p-6` (1.5rem)
- **Gap between sections**: `gap-6` (1.5rem)
- **Card padding**: Default from shadcn/ui
- **No shadows**: Cards should NOT have shadows (removed `shadow-sm`)

### Typography
- **Page title**: `text-2xl font-bold tracking-tight`
- **Section subtitle**: `text-muted-foreground`
- **Card title**: `CardTitle` component
- **Labels**: `text-sm text-muted-foreground`

### Layout Pattern
```tsx
<div className="flex flex-1 flex-col gap-6 p-6">
  {/* Page header */}
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Page Title</h1>
      <p className="text-muted-foreground">Description</p>
    </div>
    <div className="flex gap-2">
      {/* Action buttons */}
    </div>
  </div>

  {/* Stats cards */}
  <div className="grid gap-4 md:grid-cols-3">
    <Card>...</Card>
  </div>

  {/* Filters - LEFT aligned */}
  <div className="flex items-center justify-between gap-4">
    <div className="flex items-center gap-2">
      {/* Search, filters on left */}
    </div>
    <div className="flex items-center gap-2">
      {/* Action buttons on right */}
    </div>
  </div>

  {/* Table */}
  <div className="rounded-lg border bg-card">
    <Table>...</Table>
  </div>
</div>
```

### Table Standards

**IMPORTANT**: All tables MUST use TanStack Table via the DataTable component.

#### TanStack Table Pattern
```tsx
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"

// In component
<DataTable
  columns={columns}
  data={data}
  pageCount={Math.ceil(total / pagination.pageSize)}
  pagination={pagination}
  onPaginationChange={setPagination}
  sorting={sorting}
  onSortingChange={setSorting}
  manualPagination
  manualSorting
  isLoading={isLoading}
  emptyMessage="No data found"
  loadingMessage="Loading..."
/>
```

#### Column Definitions
```tsx
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"

export const columns: ColumnDef<ResourceType>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Title
        <Icon
          name={column.getIsSorted() === "asc" ? "ChevronUp" : "ChevronDown"}
          size={16}
          className="ml-2"
        />
      </Button>
    ),
    cell: ({ row }) => {
      const item = row.original
      return (
        <div className="min-w-0 max-w-md">
          <Link href={`/path/${item.id}`} className="font-medium hover:underline">
            {item.title}
          </Link>
          {item.description && (
            <div className="text-sm text-muted-foreground line-clamp-2">
              {item.description}
            </div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant="outline" className={getStatusColor(row.original.status)}>
        {row.original.status_display}
      </Badge>
    ),
  },
]
```

#### Styling
- **Table wrapper**: DataTable component handles this automatically
- **Column widths**: Use `max-w-md`, `max-w-sm` for responsive widths, or set in column definition
- **Text handling**:
  - Use `line-clamp-2` for multi-line truncation
  - Use `truncate` for single-line cells
  - Use `min-w-0` to prevent flex container overflow
- **Actions column**: Use `accessorKey: "actions"` with custom cell renderer
- **Loading/Empty states**: Handled by DataTable component via props

### Filters & Search
- **Position**: Left side of page
- **Search box**: `w-[300px]` with Search icon
- **Dropdowns**: `w-[180px]` for Select components
- **Action buttons**: Right side, aligned with filters

### Buttons
- **Primary action**: `<Button>Text</Button>`
- **Secondary action**: `<Button variant="outline">Text</Button>`
- **Icon + text**: `<Icon className="h-4 w-4 mr-2" />Text`
- **Icon only**: `<Button variant="ghost" size="sm"><Icon /></Button>`
- **Button groups**: Place buttons side-by-side with `gap-2`

### Cards
- **No shadows**: Remove `shadow-sm` class
- **Stats cards**: Use icons, large numbers, small descriptions
- **Content cards**: Standard CardHeader + CardContent

### Navigation
- **Breadcrumbs**: Use Breadcrumb component in header
- **Sidebar**: Use AppSidebar with SidebarProvider
  - **Standard sidebar width**: Default (around 250px)
  - **Wide sidebar (for HR module)**: `<SidebarProvider style={{ "--sidebar-width": "350px" } as React.CSSProperties}>`
- **Links**: Use Next.js `<Link>` component
- **Hover states**: Add `hover:underline` for text links

## API Integration

### API Client Pattern
```tsx
import { apiClient, type ApiListResponse } from '@/lib/api/client'

// Define interface
export interface Resource {
  id: string
  name: string
  created_at: string
}

// Define API methods
export const resourceApi = {
  list: (params?: Record<string, any>) =>
    apiClient.get<ApiListResponse<Resource>>('/resources/', params),

  retrieve: (id: string) =>
    apiClient.get<Resource>(`/resources/${id}/`),

  create: (data: Partial<Resource>) =>
    apiClient.post<Resource>('/resources/', data),

  update: (id: string, data: Partial<Resource>) =>
    apiClient.patch<Resource>(`/resources/${id}/`, data),

  delete: (id: string) =>
    apiClient.delete(`/resources/${id}/`),
}
```

### Component Data Fetching with TanStack Query

**IMPORTANT**: Use TanStack Query for all server state management, NOT useState/useEffect.

```tsx
import { useQuery } from "@tanstack/react-query"
import { PaginationState, SortingState } from "@tanstack/react-table"

const [pagination, setPagination] = useState<PaginationState>({
  pageIndex: 0,
  pageSize: 10,
})
const [sorting, setSorting] = useState<SortingState>([])
const [searchQuery, setSearchQuery] = useState("")

// Build query params for server-side pagination/sorting
const queryParams = {
  page: pagination.pageIndex + 1,
  page_size: pagination.pageSize,
  ...(searchQuery && { search: searchQuery }),
  ...(sorting.length > 0 && {
    ordering: sorting[0].desc ? `-${sorting[0].id}` : sorting[0].id,
  }),
}

// Use TanStack Query
const { data, isLoading } = useQuery({
  queryKey: ["resources", queryParams],
  queryFn: () => resourceApi.list(queryParams),
})

const resources = data?.results || []
const total = data?.count || 0
```

## State Management

### TanStack Store for Global State

**IMPORTANT**: Use TanStack Store for global client state that needs to persist or be shared across components.

#### Available Stores

1. **UI Store** - Global UI state (sidebar, theme, modals, loading)
2. **Filter Store** - Persistent filter states across pages
3. **User Preferences Store** - User settings (persisted to localStorage)

#### Usage Pattern

```tsx
import { useSidebarOpen, useTheme, usePageSize } from "@/lib/store"
import { uiActions, filterActions, userPreferencesActions } from "@/lib/store"

function MyComponent() {
  // Read state using hooks
  const sidebarOpen = useSidebarOpen()
  const theme = useTheme()
  const pageSize = usePageSize()

  // Update state using actions
  const handleToggle = () => {
    uiActions.toggleSidebar()
  }

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    uiActions.setTheme(newTheme)
  }

  const handlePageSizeChange = (size: number) => {
    userPreferencesActions.setPageSize(size)
  }

  return (
    <div>
      <p>Sidebar: {sidebarOpen ? "Open" : "Closed"}</p>
      <button onClick={handleToggle}>Toggle</button>
    </div>
  )
}
```

#### When to Use TanStack Store

- **Global UI State**: Sidebar open/closed, active modal, theme
- **Persistent Filters**: Search queries, status filters that persist across navigation
- **User Preferences**: Language, locale, pagination settings, view modes
- **Shared State**: State that multiple components need to access

#### When NOT to Use TanStack Store

- **Server Data**: Use TanStack Query instead
- **Form State**: Use React Hook Form or local useState
- **Ephemeral UI**: Temporary state like hover effects, local toggles
- **Component-specific State**: State only used within a single component

#### Creating a New Store

```tsx
// lib/store/my-feature-store.ts
import { Store } from "@tanstack/react-store"

export interface MyFeatureState {
  setting1: string
  setting2: number
}

const initialState: MyFeatureState = {
  setting1: "default",
  setting2: 0,
}

export const myFeatureStore = new Store<MyFeatureState>(initialState)

// Actions
export const myFeatureActions = {
  setSetting1: (value: string) => {
    myFeatureStore.setState((state) => ({
      ...state,
      setting1: value,
    }))
  },
}

// Selectors
export const myFeatureSelectors = {
  setting1: (state: MyFeatureState) => state.setting1,
}
```

#### Custom Hook

```tsx
// lib/store/hooks.ts
import { useStore } from "@tanstack/react-store"
import { myFeatureStore, myFeatureSelectors } from "./my-feature-store"

export function useSetting1() {
  return useStore(myFeatureStore, myFeatureSelectors.setting1)
}
```

## Component Patterns

### List Page Pattern
1. **Header** with title and action buttons
2. **Stats cards** (3-4 columns) - fetch summary data with separate TanStack Query
3. **Filters** (search + dropdowns on left, buttons on right)
4. **TanStack Table** via DataTable component with:
   - Server-side pagination (`manualPagination={true}`)
   - Server-side sorting (`manualSorting={true}`)
   - Column definitions in separate `columns.tsx` file
5. **Loading** and **empty states** handled by DataTable component

### Detail Page Pattern
1. **Back button** at top
2. **Header** with title and action buttons (as button group)
3. **Two-column layout** (2/3 main content, 1/3 sidebar)
4. **Main content**: Details cards, full content
5. **Sidebar**: Status, metadata, related items

### Form Pattern
1. Use shadcn/ui form components
2. **Labels**: Above inputs
3. **Required fields**: Mark with asterisk
4. **Validation**: Show errors below fields
5. **Actions**: Save on right, Cancel on left

## Helper Functions

### Get Initials
```tsx
const getInitials = (name?: string) => {
  if (!name) return '??'
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}
```

### Format Date
```tsx
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
```

### Status Badge
```tsx
const getStatusBadge = (status: string) => {
  const config: Record<string, { className: string }> = {
    active: { className: "bg-green-500" },
    pending: { className: "bg-yellow-500" },
    inactive: { className: "bg-gray-500" },
  }
  return <Badge className={config[status]?.className}>{status}</Badge>
}
```

## Best Practices

### Performance
- Use `"use client"` only when needed (state, effects, browser APIs, TanStack Query)
- Use TanStack Query for server state - it handles caching, refetching, and deduplication
- Avoid unnecessary re-renders with proper dependency arrays
- Use server-side pagination/sorting for large datasets
- Handle errors gracefully with TanStack Query error states

### Accessibility
- Use semantic HTML elements
- Include alt text for images
- Use proper ARIA labels when needed
- Ensure keyboard navigation works

### Code Quality
- Use TypeScript interfaces for all data structures
- Handle loading and error states
- Show empty states with helpful messages
- Use consistent naming conventions
- Keep components focused and small

### Error Handling
```tsx
try {
  const response = await api.method()
  setData(response.results)
} catch (error) {
  console.error("Error:", error)
  setData([])  // Set to empty instead of crashing
}
```

### Link Components
```tsx
// For internal navigation
import Link from "next/link"
<Link href="/path" className="hover:underline">Text</Link>

// For buttons that navigate
import { useRouter } from "next/navigation"
const router = useRouter()
<Button onClick={() => router.push('/path')}>Go</Button>
```

## Common Components

### Avatar with Initials
```tsx
<Avatar className="h-8 w-8">
  <AvatarFallback className="text-xs">
    {getInitials(name)}
  </AvatarFallback>
</Avatar>
```

### Table Row with Link
```tsx
<TableCell>
  <Link
    href={`/path/${item.id}`}
    className="font-medium hover:underline"
  >
    {item.title}
  </Link>
</TableCell>
```

### Stats Card
```tsx
<Card>
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-sm font-medium">Label</CardTitle>
    <Icon className="h-4 w-4 text-muted-foreground" />
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">{value}</div>
    <p className="text-xs text-muted-foreground">Description</p>
  </CardContent>
</Card>
```

## Important Notes

- **No shadows on cards**: Always remove `shadow-sm` class
- **Consistent spacing**: Use `gap-6 p-6` for main containers
- **Filters on left**: Search and filters always on left side
- **Action buttons on right**: Primary actions on right side
- **Use TanStack Table**: ALL tables must use TanStack Table via DataTable component
- **Use TanStack Query**: ALL server data fetching must use TanStack Query (useQuery, useMutation)
- **Use TanStack Store**: Use for global client state, user preferences, and persistent filters
- **Icons**: Use HugeIcons, NOT Lucide (`import { Icon } from "@/components/ui/icon"`)
- **Server-side operations**: Use manual pagination/sorting for better performance
- **Proper links**: Use Next.js Link component with hover states
- **Button consistency**: Status should be displayed as disabled outline buttons, not badges, when grouped with action buttons
- **Next.js 15+ params**: Dynamic route params are Promises - unwrap with `React.use(params)`
- **State Management Hierarchy**:
  1. Server state → TanStack Query
  2. Global client state → TanStack Store
  3. Local component state → React useState
