/**
 * Filter Store - Persistent filter state
 *
 * Manages filter states across different pages:
 * - Search queries
 * - Status filters
 * - Date ranges
 * - Custom filters per page
 */

import { Store } from "@tanstack/react-store"

export interface FilterState {
  // Global search
  globalSearch: string

  // Page-specific filters
  pageFilters: Record<string, {
    search?: string
    status?: string
    dateFrom?: string
    dateTo?: string
    [key: string]: any
  }>
}

const initialState: FilterState = {
  globalSearch: "",
  pageFilters: {},
}

export const filterStore = new Store<FilterState>(initialState)

// Actions
export const filterActions = {
  setGlobalSearch: (query: string) => {
    filterStore.setState((state) => ({
      ...state,
      globalSearch: query,
    }))
  },

  setPageFilter: (page: string, filters: Record<string, any>) => {
    filterStore.setState((state) => ({
      ...state,
      pageFilters: {
        ...state.pageFilters,
        [page]: {
          ...state.pageFilters[page],
          ...filters,
        },
      },
    }))
  },

  clearPageFilters: (page: string) => {
    filterStore.setState((state) => {
      const newPageFilters = { ...state.pageFilters }
      delete newPageFilters[page]
      return {
        ...state,
        pageFilters: newPageFilters,
      }
    })
  },

  clearAllFilters: () => {
    filterStore.setState(initialState)
  },
}

// Selectors
export const filterSelectors = {
  globalSearch: (state: FilterState) => state.globalSearch,
  pageFilters: (page: string) => (state: FilterState) => state.pageFilters[page] || {},
}
