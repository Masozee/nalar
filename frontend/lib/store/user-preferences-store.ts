/**
 * User Preferences Store - User-specific settings
 *
 * Manages user preferences:
 * - Language
 * - Locale
 * - Pagination defaults
 * - View preferences (table/grid)
 * - Column visibility
 */

import { Store } from "@tanstack/react-store"

export interface UserPreferences {
  language: "en" | "id"
  locale: string
  currency: string
  dateFormat: string
  timeFormat: "12h" | "24h"
  pageSize: number
  viewMode: "table" | "grid" | "list"
  columnVisibility: Record<string, Record<string, boolean>>
}

const initialState: UserPreferences = {
  language: "id",
  locale: "id-ID",
  currency: "IDR",
  dateFormat: "DD MMMM YYYY",
  timeFormat: "24h",
  pageSize: 10,
  viewMode: "table",
  columnVisibility: {},
}

// Load from localStorage if available
const loadFromLocalStorage = (): UserPreferences => {
  if (typeof window === "undefined") return initialState

  try {
    const stored = localStorage.getItem("userPreferences")
    if (stored) {
      return { ...initialState, ...JSON.parse(stored) }
    }
  } catch (error) {
    console.error("Failed to load user preferences:", error)
  }

  return initialState
}

export const userPreferencesStore = new Store<UserPreferences>(loadFromLocalStorage())

// Save to localStorage on state change
userPreferencesStore.subscribe((state) => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("userPreferences", JSON.stringify(state))
    } catch (error) {
      console.error("Failed to save user preferences:", error)
    }
  }
})

// Actions
export const userPreferencesActions = {
  setLanguage: (language: UserPreferences["language"]) => {
    userPreferencesStore.setState((state) => ({
      ...state,
      language,
      locale: language === "id" ? "id-ID" : "en-US",
    }))
  },

  setCurrency: (currency: string) => {
    userPreferencesStore.setState((state) => ({
      ...state,
      currency,
    }))
  },

  setDateFormat: (dateFormat: string) => {
    userPreferencesStore.setState((state) => ({
      ...state,
      dateFormat,
    }))
  },

  setTimeFormat: (timeFormat: UserPreferences["timeFormat"]) => {
    userPreferencesStore.setState((state) => ({
      ...state,
      timeFormat,
    }))
  },

  setPageSize: (pageSize: number) => {
    userPreferencesStore.setState((state) => ({
      ...state,
      pageSize,
    }))
  },

  setViewMode: (viewMode: UserPreferences["viewMode"]) => {
    userPreferencesStore.setState((state) => ({
      ...state,
      viewMode,
    }))
  },

  setColumnVisibility: (page: string, columns: Record<string, boolean>) => {
    userPreferencesStore.setState((state) => ({
      ...state,
      columnVisibility: {
        ...state.columnVisibility,
        [page]: columns,
      },
    }))
  },

  resetToDefaults: () => {
    userPreferencesStore.setState(initialState)
  },
}

// Selectors
export const userPreferencesSelectors = {
  language: (state: UserPreferences) => state.language,
  locale: (state: UserPreferences) => state.locale,
  currency: (state: UserPreferences) => state.currency,
  dateFormat: (state: UserPreferences) => state.dateFormat,
  timeFormat: (state: UserPreferences) => state.timeFormat,
  pageSize: (state: UserPreferences) => state.pageSize,
  viewMode: (state: UserPreferences) => state.viewMode,
  columnVisibility: (page: string) => (state: UserPreferences) =>
    state.columnVisibility[page] || {},
}
