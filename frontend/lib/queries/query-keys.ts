/**
 * Centralized Query Keys Factory
 *
 * This provides a type-safe way to create consistent query keys across your app.
 * Query keys are used by TanStack Query for caching and invalidation.
 *
 * @see https://tanstack.com/query/latest/docs/react/guides/query-keys
 */

export const queryKeys = {
  // Users domain
  users: {
    all: ["users"] as const,
    lists: () => [...queryKeys.users.all, "list"] as const,
    list: (filters: Record<string, any>) => [...queryKeys.users.lists(), filters] as const,
    details: () => [...queryKeys.users.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
    profile: (id: string) => [...queryKeys.users.all, "profile", id] as const,
  },

  // Finance domain
  finance: {
    all: ["finance"] as const,
    expenses: {
      all: ["finance", "expenses"] as const,
      lists: () => [...queryKeys.finance.expenses.all, "list"] as const,
      list: (filters?: Record<string, any>) => [...queryKeys.finance.expenses.lists(), filters ?? {}] as const,
      details: () => [...queryKeys.finance.expenses.all, "detail"] as const,
      detail: (id: string) => [...queryKeys.finance.expenses.details(), id] as const,
      summary: () => [...queryKeys.finance.expenses.all, "summary"] as const,
    },
    advances: {
      all: ["finance", "advances"] as const,
      lists: () => [...queryKeys.finance.advances.all, "list"] as const,
      list: (filters?: Record<string, any>) => [...queryKeys.finance.advances.lists(), filters ?? {}] as const,
      details: () => [...queryKeys.finance.advances.all, "detail"] as const,
      detail: (id: string) => [...queryKeys.finance.advances.details(), id] as const,
    },
  },

  // HR domain
  hr: {
    all: ["hr"] as const,
    attendance: {
      all: ["hr", "attendance"] as const,
      daily: (date?: string) => [...queryKeys.hr.attendance.all, "daily", date ?? ""] as const,
      report: (filters?: Record<string, any>) => [...queryKeys.hr.attendance.all, "report", filters ?? {}] as const,
    },
    leave: {
      all: ["hr", "leave"] as const,
      requests: () => [...queryKeys.hr.leave.all, "requests"] as const,
      balance: (userId: string) => [...queryKeys.hr.leave.all, "balance", userId] as const,
    },
    policies: {
      all: ["hr", "policies"] as const,
      lists: () => [...queryKeys.hr.policies.all, "list"] as const,
      list: (filters?: Record<string, any>) => [...queryKeys.hr.policies.lists(), filters ?? {}] as const,
      details: () => [...queryKeys.hr.policies.all, "detail"] as const,
      detail: (id: string) => [...queryKeys.hr.policies.details(), id] as const,
    },
  },

  // Procurement domain
  procurement: {
    all: ["procurement"] as const,
    vendors: {
      all: ["procurement", "vendors"] as const,
      lists: () => [...queryKeys.procurement.vendors.all, "list"] as const,
      list: (filters?: Record<string, any>) => [...queryKeys.procurement.vendors.lists(), filters ?? {}] as const,
      details: () => [...queryKeys.procurement.vendors.all, "detail"] as const,
      detail: (id: string) => [...queryKeys.procurement.vendors.details(), id] as const,
    },
    purchaseOrders: {
      all: ["procurement", "purchase-orders"] as const,
      lists: () => [...queryKeys.procurement.purchaseOrders.all, "list"] as const,
      list: (filters?: Record<string, any>) => [...queryKeys.procurement.purchaseOrders.lists(), filters ?? {}] as const,
      details: () => [...queryKeys.procurement.purchaseOrders.all, "detail"] as const,
      detail: (id: string) => [...queryKeys.procurement.purchaseOrders.details(), id] as const,
    },
  },

  // Documents domain
  documents: {
    all: ["documents"] as const,
    lists: () => [...queryKeys.documents.all, "list"] as const,
    list: (filters?: Record<string, any>) => [...queryKeys.documents.lists(), filters ?? {}] as const,
    details: () => [...queryKeys.documents.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.documents.details(), id] as const,
    folders: () => [...queryKeys.documents.all, "folders"] as const,
  },

  // Ticketing domain
  ticketing: {
    all: ["ticketing"] as const,
    tickets: {
      all: ["ticketing", "tickets"] as const,
      lists: () => [...queryKeys.ticketing.tickets.all, "list"] as const,
      list: (filters?: Record<string, any>) => [...queryKeys.ticketing.tickets.lists(), filters ?? {}] as const,
      details: () => [...queryKeys.ticketing.tickets.all, "detail"] as const,
      detail: (id: string) => [...queryKeys.ticketing.tickets.details(), id] as const,
    },
    sla: {
      all: ["ticketing", "sla"] as const,
      policies: () => [...queryKeys.ticketing.sla.all, "policies"] as const,
      reports: () => [...queryKeys.ticketing.sla.all, "reports"] as const,
    },
  },
}

/**
 * Helper type to ensure query keys are readonly arrays
 */
export type QueryKey = ReturnType<typeof queryKeys[keyof typeof queryKeys][keyof any]>
