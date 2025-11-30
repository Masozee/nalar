# TanStack Query Quick Start Guide

## Installation

First, install the required dependencies:

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
# or
yarn add @tanstack/react-query @tanstack/react-query-devtools
# or
pnpm add @tanstack/react-query @tanstack/react-query-devtools
```

## Setup (Already Done ✓)

The following files have been created and configured:

1. ✓ `providers/query-provider.tsx` - Query Client Provider
2. ✓ `app/layout.tsx` - Updated with QueryProvider
3. ✓ `lib/query-api.ts` - Fetch wrapper
4. ✓ `lib/queries/query-keys.ts` - Centralized query keys
5. ✓ `lib/queries/users/*` - Example queries and mutations

## Usage in Your Components

### 1. Using Queries (Fetching Data)

```typescript
"use client"

import { useUsers } from "@/lib/queries/users/queries"

export function MyComponent() {
  const { data, isLoading, error } = useUsers({ search: "john" })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      {data?.results.map(user => (
        <div key={user.id}>{user.full_name}</div>
      ))}
    </div>
  )
}
```

### 2. Using Mutations (Updating Data)

```typescript
"use client"

import { useUpdateUser } from "@/lib/queries/users/mutations"
import { Button } from "@/components/ui/button"

export function UpdateButton({ userId }: { userId: string }) {
  const updateUser = useUpdateUser({
    onSuccess: () => {
      alert("Updated successfully!")
    },
    onError: (error) => {
      alert("Update failed: " + error.message)
    },
  })

  const handleClick = () => {
    updateUser.mutate({
      id: userId,
      data: { full_name: "New Name" },
    })
  }

  return (
    <Button
      onClick={handleClick}
      disabled={updateUser.isPending}
    >
      {updateUser.isPending ? "Updating..." : "Update User"}
    </Button>
  )
}
```

### 3. Creating New Domain Queries

When adding queries for a new domain (e.g., "inventory"), follow this pattern:

**Step 1: Add query keys** to `lib/queries/query-keys.ts`:

```typescript
export const queryKeys = {
  // ... existing keys
  inventory: {
    all: ["inventory"] as const,
    items: {
      all: ["inventory", "items"] as const,
      lists: () => [...queryKeys.inventory.items.all, "list"] as const,
      list: (filters?: Record<string, any>) =>
        [...queryKeys.inventory.items.lists(), filters ?? {}] as const,
      details: () => [...queryKeys.inventory.items.all, "detail"] as const,
      detail: (id: string) => [...queryKeys.inventory.items.details(), id] as const,
    },
  },
}
```

**Step 2: Create domain folder** `lib/queries/inventory/`:

```
lib/queries/inventory/
├── types.ts       # TypeScript interfaces
├── queries.ts     # useQuery hooks
└── mutations.ts   # useMutation hooks
```

**Step 3: Define types** in `types.ts`:

```typescript
export interface InventoryItem {
  id: string
  name: string
  sku: string
  quantity: number
  // ... other fields
}

export interface InventoryItemListResponse {
  count: number
  results: InventoryItem[]
}
```

**Step 4: Create queries** in `queries.ts`:

```typescript
import { useQuery } from "@tanstack/react-query"
import { queryApi } from "@/lib/query-api"
import { queryKeys } from "@/lib/queries/query-keys"
import { InventoryItemListResponse } from "./types"

export function useInventoryItems(filters?: Record<string, any>) {
  return useQuery({
    queryKey: queryKeys.inventory.items.list(filters),
    queryFn: () => queryApi.get<InventoryItemListResponse>("/inventory/items/", { params: filters }),
  })
}
```

**Step 5: Create mutations** in `mutations.ts`:

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryApi } from "@/lib/query-api"
import { queryKeys } from "@/lib/queries/query-keys"
import { InventoryItem } from "./types"

export function useUpdateInventoryItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InventoryItem> }) =>
      queryApi.patch<InventoryItem>(`/inventory/items/${id}/`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.items.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.items.lists() })
    },
  })
}
```

## Working with Existing API Client

Your existing API client (`lib/api/client.ts`) can coexist with TanStack Query:

- **Use TanStack Query** for new features and pages
- **Keep existing code** unchanged - no need to refactor immediately
- **Gradually migrate** existing code when you need to update those pages

Example of mixing both approaches:

```typescript
"use client"

import { useQuery } from "@tanstack/react-query"
import { expenseRequestApi } from "@/lib/api/finance" // Your existing API
import { queryKeys } from "@/lib/queries/query-keys"

export function MyComponent() {
  // Use TanStack Query with your existing API functions
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.finance.expenses.lists(),
    queryFn: () => expenseRequestApi.list(), // Reuse existing API client!
  })

  // ... rest of component
}
```

## Best Practices

1. **Always use query keys from the factory** - Don't create ad-hoc query keys
2. **Invalidate related queries** - When mutating, invalidate affected queries
3. **Use optimistic updates** - For better UX, update cache before server response
4. **Handle loading and error states** - Always show appropriate UI
5. **Enable/disable queries conditionally** - Use `enabled` option when needed
6. **Set appropriate staleTime** - Balance freshness vs performance

## TanStack Query DevTools

In development, you'll see the React Query DevTools in the bottom-right corner. Use it to:

- Inspect all active queries
- See query states (loading, success, error)
- Manually refetch queries
- Invalidate queries
- View cache data

## Common Patterns

### Dependent Queries

```typescript
const { data: user } = useUser(userId)
const { data: profile } = useUserProfile(userId, {
  enabled: !!user, // Only fetch profile after user is loaded
})
```

### Infinite Queries (Pagination)

```typescript
import { useInfiniteQuery } from "@tanstack/react-query"

const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: queryKeys.users.lists(),
  queryFn: ({ pageParam = 1 }) =>
    queryApi.get<UserListResponse>("/users/", { params: { page: pageParam } }),
  getNextPageParam: (lastPage) => lastPage.next ? lastPage.page + 1 : undefined,
})
```

### Polling (Auto Refetch)

```typescript
const { data } = useQuery({
  queryKey: queryKeys.ticketing.tickets.lists(),
  queryFn: () => queryApi.get("/ticketing/tickets/"),
  refetchInterval: 30000, // Refetch every 30 seconds
})
```

## Migration Strategy

For your existing project:

1. **Phase 1**: New features use TanStack Query
2. **Phase 2**: Gradually migrate high-traffic pages
3. **Phase 3**: Migrate remaining pages as needed
4. **No rush**: Your existing code continues to work fine

## Need Help?

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Query Keys Guide](https://tanstack.com/query/latest/docs/react/guides/query-keys)
- [Mutations Guide](https://tanstack.com/query/latest/docs/react/guides/mutations)
