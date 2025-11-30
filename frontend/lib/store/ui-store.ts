/**
 * UI Store - Global UI state management
 *
 * Manages application-wide UI state like:
 * - Sidebar open/closed
 * - Theme
 * - Modal states
 * - Loading states
 */

import { Store } from "@tanstack/react-store"

export interface UIState {
  sidebarOpen: boolean
  theme: "light" | "dark" | "system"
  activeModal: string | null
  globalLoading: boolean
}

const initialState: UIState = {
  sidebarOpen: true,
  theme: "system",
  activeModal: null,
  globalLoading: false,
}

export const uiStore = new Store<UIState>(initialState)

// Actions
export const uiActions = {
  toggleSidebar: () => {
    uiStore.setState((state) => ({
      ...state,
      sidebarOpen: !state.sidebarOpen,
    }))
  },

  setSidebarOpen: (open: boolean) => {
    uiStore.setState((state) => ({
      ...state,
      sidebarOpen: open,
    }))
  },

  setTheme: (theme: UIState["theme"]) => {
    uiStore.setState((state) => ({
      ...state,
      theme,
    }))
  },

  openModal: (modalId: string) => {
    uiStore.setState((state) => ({
      ...state,
      activeModal: modalId,
    }))
  },

  closeModal: () => {
    uiStore.setState((state) => ({
      ...state,
      activeModal: null,
    }))
  },

  setGlobalLoading: (loading: boolean) => {
    uiStore.setState((state) => ({
      ...state,
      globalLoading: loading,
    }))
  },
}

// Selectors
export const uiSelectors = {
  sidebarOpen: (state: UIState) => state.sidebarOpen,
  theme: (state: UIState) => state.theme,
  activeModal: (state: UIState) => state.activeModal,
  globalLoading: (state: UIState) => state.globalLoading,
}
