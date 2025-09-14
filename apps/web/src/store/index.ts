import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { FilterState, ViewMode } from '@/types'

interface AppState {
  // Theme
  theme: 'light' | 'dark' | 'system'
  setTheme: (theme: 'light' | 'dark' | 'system') => void

  // UI State
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void

  // Current view mode
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void

  // Filters
  filters: FilterState
  setFilters: (filters: Partial<FilterState>) => void
  resetFilters: () => void

  // Selected tasks for bulk actions
  selectedTasks: string[]
  setSelectedTasks: (ids: string[]) => void
  toggleTaskSelection: (id: string) => void
  clearSelection: () => void

  // Task creation modal
  isCreateModalOpen: boolean
  setCreateModalOpen: (open: boolean) => void

  // Task edit modal
  editingTaskId: string | null
  setEditingTaskId: (id: string | null) => void

  // Bulk action modal
  isBulkActionModalOpen: boolean
  setBulkActionModalOpen: (open: boolean) => void
}

const defaultFilters: FilterState = {
  search: '',
  completed: null,
  priority: null,
  tag: null,
  sortBy: 'createdAt',
  order: 'desc',
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Theme
      theme: 'system',
      setTheme: (theme) => set({ theme }),

      // UI State
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      // Current view mode
      viewMode: 'all',
      setViewMode: (mode) => {
        const filters = { ...defaultFilters }
        
        switch (mode) {
          case 'today':
            filters.completed = false
            // Note: We'll handle the date filtering in the query
            break
          case 'upcoming':
            filters.completed = false
            break
          case 'completed':
            filters.completed = true
            break
          case 'high-priority':
            filters.priority = 1
            filters.completed = false
            break
          default:
            // 'all' - no additional filters
            break
        }
        
        set({ viewMode: mode, filters })
      },

      // Filters
      filters: defaultFilters,
      setFilters: (newFilters) => 
        set((state) => ({ 
          filters: { ...state.filters, ...newFilters } 
        })),
      resetFilters: () => set({ filters: defaultFilters }),

      // Selected tasks for bulk actions
      selectedTasks: [],
      setSelectedTasks: (ids) => set({ selectedTasks: ids }),
      toggleTaskSelection: (id) => 
        set((state) => ({
          selectedTasks: state.selectedTasks.includes(id)
            ? state.selectedTasks.filter(taskId => taskId !== id)
            : [...state.selectedTasks, id]
        })),
      clearSelection: () => set({ selectedTasks: [] }),

      // Task creation modal
      isCreateModalOpen: false,
      setCreateModalOpen: (open) => set({ isCreateModalOpen: open }),

      // Task edit modal
      editingTaskId: null,
      setEditingTaskId: (id) => set({ editingTaskId: id }),

      // Bulk action modal
      isBulkActionModalOpen: false,
      setBulkActionModalOpen: (open) => set({ isBulkActionModalOpen: open }),
    }),
    {
      name: 'todo-app-store',
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
        viewMode: state.viewMode,
        filters: state.filters,
      }),
    }
  )
)

// Selector hooks for better performance
export const useTheme = () => useAppStore((state) => state.theme)
export const useSidebar = () => useAppStore((state) => ({
  isOpen: state.sidebarOpen,
  setOpen: state.setSidebarOpen,
}))
export const useViewMode = () => useAppStore((state) => ({
  mode: state.viewMode,
  setMode: state.setViewMode,
}))
export const useFilters = () => useAppStore((state) => ({
  filters: state.filters,
  setFilters: state.setFilters,
  resetFilters: state.resetFilters,
}))
export const useSelection = () => useAppStore((state) => ({
  selectedTasks: state.selectedTasks,
  setSelectedTasks: state.setSelectedTasks,
  toggleTaskSelection: state.toggleTaskSelection,
  clearSelection: state.clearSelection,
}))
export const useModals = () => useAppStore((state) => ({
  isCreateModalOpen: state.isCreateModalOpen,
  setCreateModalOpen: state.setCreateModalOpen,
  editingTaskId: state.editingTaskId,
  setEditingTaskId: state.setEditingTaskId,
  isBulkActionModalOpen: state.isBulkActionModalOpen,
  setBulkActionModalOpen: state.setBulkActionModalOpen,
}))
