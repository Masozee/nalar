# TanStack Query Folder Structure

This folder contains all TanStack Query related code organized by feature/domain.

## Structure

```
lib/queries/
├── README.md                 # This file
├── query-keys.ts            # Centralized query keys factory
├── users/                   # Example: User domain queries
│   ├── queries.ts          # useQuery hooks
│   ├── mutations.ts        # useMutation hooks
│   └── types.ts            # TypeScript types
├── finance/                 # Finance domain queries
│   ├── queries.ts
│   ├── mutations.ts
│   └── types.ts
├── hr/                      # HR domain queries
│   ├── queries.ts
│   ├── mutations.ts
│   └── types.ts
└── [domain]/               # Add more domains as needed
    ├── queries.ts
    ├── mutations.ts
    └── types.ts
```

## Guidelines

1. **Query Keys**: Always use the centralized query keys from `query-keys.ts`
2. **Separation**: Keep queries and mutations separate
3. **Types**: Define all types in `types.ts` within each domain
4. **Hooks**: Export custom hooks (not raw queries) for reusability
5. **Naming**: Use descriptive names like `useUserProfile`, `useUpdateUser`

## Example Usage

```typescript
// In a component
import { useUserProfile } from '@/lib/queries/users/queries'
import { useUpdateUser } from '@/lib/queries/users/mutations'

function UserProfile() {
  const { data, isLoading } = useUserProfile('123')
  const updateUser = useUpdateUser()

  // ...
}
```
