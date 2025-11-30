/**
 * TanStack Store Hooks
 *
 * React hooks for using TanStack Store in components
 */

import { useStore } from "@tanstack/react-store"
import { uiStore, uiSelectors, type UIState } from "./ui-store"
import { filterStore, filterSelectors, type FilterState } from "./filter-store"
import { userPreferencesStore, userPreferencesSelectors, type UserPreferences } from "./user-preferences-store"

// UI Store Hooks
export function useUIStore<T>(selector: (state: UIState) => T): T {
  return useStore(uiStore, selector)
}

export function useSidebarOpen() {
  return useStore(uiStore, uiSelectors.sidebarOpen)
}

export function useTheme() {
  return useStore(uiStore, uiSelectors.theme)
}

export function useActiveModal() {
  return useStore(uiStore, uiSelectors.activeModal)
}

export function useGlobalLoading() {
  return useStore(uiStore, uiSelectors.globalLoading)
}

// Filter Store Hooks
export function useFilterStore<T>(selector: (state: FilterState) => T): T {
  return useStore(filterStore, selector)
}

export function useGlobalSearch() {
  return useStore(filterStore, filterSelectors.globalSearch)
}

export function usePageFilters(page: string) {
  return useStore(filterStore, filterSelectors.pageFilters(page))
}

// User Preferences Hooks
export function useUserPreferencesStore<T>(selector: (state: UserPreferences) => T): T {
  return useStore(userPreferencesStore, selector)
}

export function useLanguage() {
  return useStore(userPreferencesStore, userPreferencesSelectors.language)
}

export function useLocale() {
  return useStore(userPreferencesStore, userPreferencesSelectors.locale)
}

export function useCurrency() {
  return useStore(userPreferencesStore, userPreferencesSelectors.currency)
}

export function useDateFormat() {
  return useStore(userPreferencesStore, userPreferencesSelectors.dateFormat)
}

export function useTimeFormat() {
  return useStore(userPreferencesStore, userPreferencesSelectors.timeFormat)
}

export function usePageSize() {
  return useStore(userPreferencesStore, userPreferencesSelectors.pageSize)
}

export function useViewMode() {
  return useStore(userPreferencesStore, userPreferencesSelectors.viewMode)
}

export function useColumnVisibility(page: string) {
  return useStore(userPreferencesStore, userPreferencesSelectors.columnVisibility(page))
}
