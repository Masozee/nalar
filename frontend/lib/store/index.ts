/**
 * TanStack Store - Centralized State Management
 *
 * Export all stores, actions, selectors, and hooks
 */

// Stores
export { uiStore, uiActions, uiSelectors } from "./ui-store"
export type { UIState } from "./ui-store"

export { filterStore, filterActions, filterSelectors } from "./filter-store"
export type { FilterState } from "./filter-store"

export { userPreferencesStore, userPreferencesActions, userPreferencesSelectors } from "./user-preferences-store"
export type { UserPreferences } from "./user-preferences-store"

// Hooks
export {
  useUIStore,
  useSidebarOpen,
  useTheme,
  useActiveModal,
  useGlobalLoading,
  useFilterStore,
  useGlobalSearch,
  usePageFilters,
  useUserPreferencesStore,
  useLanguage,
  useLocale,
  useCurrency,
  useDateFormat,
  useTimeFormat,
  usePageSize,
  useViewMode,
  useColumnVisibility,
} from "./hooks"
