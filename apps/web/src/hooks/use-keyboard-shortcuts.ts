import { useEffect } from 'react'
import { useSelection, useModals } from '@/store'
import { useBulkAction } from '@/hooks/use-tasks'

export function useKeyboardShortcuts() {
  const { selectedTasks, bulkSelectionMode, setBulkSelectionMode, clearSelection } = useSelection()
  const { setCreateModalOpen } = useModals()
  const bulkAction = useBulkAction()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement ||
        (event.target as HTMLElement)?.contentEditable === 'true'
      ) {
        return
      }

      // Prevent browser defaults for our shortcuts
      const shouldPreventDefault = [
        'KeyN', // New task
        'KeyS', // Bulk select mode
        'KeyA', // Select all (when in bulk mode)
        'Delete', // Delete selected
        'Enter', // Complete selected
        'Escape' // Exit bulk mode
      ].includes(event.code)

      if (shouldPreventDefault && (event.ctrlKey || event.metaKey || !event.shiftKey)) {
        event.preventDefault()
      }

      // Ctrl/Cmd + N: New task
      if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
        event.preventDefault()
        setCreateModalOpen(true)
        return
      }

      // S: Toggle bulk selection mode
      if (event.key === 's' && !event.ctrlKey && !event.metaKey) {
        event.preventDefault()
        setBulkSelectionMode(!bulkSelectionMode)
        return
      }

      // Escape: Exit bulk selection mode
      if (event.key === 'Escape' && bulkSelectionMode) {
        event.preventDefault()
        setBulkSelectionMode(false)
        clearSelection()
        return
      }

      // Only process bulk actions if in bulk selection mode and have selected tasks
      if (!bulkSelectionMode || selectedTasks.length === 0) {
        return
      }

      // Enter: Mark selected tasks as complete
      if (event.key === 'Enter') {
        event.preventDefault()
        bulkAction.mutate({
          action: 'complete',
          ids: selectedTasks
        })
        return
      }

      // Delete: Delete selected tasks
      if (event.key === 'Delete') {
        event.preventDefault()
        bulkAction.mutate({
          action: 'delete',
          ids: selectedTasks
        })
        return
      }

      // Ctrl/Cmd + A: Select all tasks (when in bulk mode)
      if ((event.ctrlKey || event.metaKey) && event.key === 'a' && bulkSelectionMode) {
        event.preventDefault()
        // This would need to be implemented in the component that has access to all tasks
        return
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [
    selectedTasks,
    bulkSelectionMode,
    setBulkSelectionMode,
    clearSelection,
    setCreateModalOpen,
    bulkAction
  ])
}
