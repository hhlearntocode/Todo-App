import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Filter, X, Trash2, CheckSquare, Square, Layout } from 'lucide-react'
import { useFilters, useSelection } from '@/store'
import { useClearCompleted, useTasks } from '@/hooks/use-tasks'
import { TaskTemplatesModal } from '@/components/templates/task-templates-modal'
import { useQuery } from '@tanstack/react-query'
import { tasksApi } from '@/lib/api'

export function TaskFilters() {
  const { filters, setFilters, resetFilters } = useFilters()
  const { bulkSelectionMode, setBulkSelectionMode, selectedTasks, clearSelection } = useSelection()
  const clearCompleted = useClearCompleted()
  const { data: tasksResponse } = useTasks()
  const [templatesModalOpen, setTemplatesModalOpen] = useState(false)

  // Get all tasks for completed count (not filtered by current view)
  const { data: allTasksResponse } = useQuery({
    queryKey: ['tasks-all-for-clear'],
    queryFn: () => tasksApi.getTasks({}),
  })

  const hasActiveFilters = filters.completed !== null || filters.priority !== null || filters.tag !== null
  const completedTasksCount = allTasksResponse?.data?.filter(task => task.completed).length || 0

  const handleClearFilters = () => {
    resetFilters()
  }

  const handleToggleCompleted = () => {
    setFilters({
      completed: filters.completed === true ? null : true
    })
  }

  const handleSetPriority = (priority: number | null) => {
    setFilters({ priority })
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <Filter className="h-4 w-4" />
        <span>Filters:</span>
      </div>

      {/* Bulk selection toggle */}
      <Button
        variant={bulkSelectionMode ? "default" : "outline"}
        size="sm"
        onClick={() => {
          setBulkSelectionMode(!bulkSelectionMode)
          if (bulkSelectionMode) {
            clearSelection()
          }
        }}
        className="gap-1"
      >
        {bulkSelectionMode ? (
          <>
            <CheckSquare className="h-4 w-4" />
            Exit Select ({selectedTasks.length})
          </>
        ) : (
          <>
            <Square className="h-4 w-4" />
            Select Tasks
          </>
        )}
      </Button>

      {/* Task Templates */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setTemplatesModalOpen(true)}
        className="gap-1"
      >
        <Layout className="h-4 w-4" />
        Templates
      </Button>

      {/* Completed filter */}
      <Button
        variant={filters.completed === true ? "default" : "outline"}
        size="sm"
        onClick={handleToggleCompleted}
      >
        Completed Only
      </Button>

      {/* Priority filters */}
      <Button
        variant={filters.priority === 1 ? "default" : "outline"}
        size="sm"
        onClick={() => handleSetPriority(filters.priority === 1 ? null : 1)}
      >
        High Priority
      </Button>

      <Button
        variant={filters.priority === 2 ? "default" : "outline"}
        size="sm"
        onClick={() => handleSetPriority(filters.priority === 2 ? null : 2)}
      >
        Medium Priority
      </Button>

      <Button
        variant={filters.priority === 3 ? "default" : "outline"}
        size="sm"
        onClick={() => handleSetPriority(filters.priority === 3 ? null : 3)}
      >
        Low Priority
      </Button>

      {/* Clear completed tasks */}
      {completedTasksCount > 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => clearCompleted.mutate()}
          disabled={clearCompleted.isPending}
          className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Clear Completed ({completedTasksCount})
        </Button>
      )}

      {/* Clear filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearFilters}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4 mr-1" />
          Clear Filters
        </Button>
      )}
      
      {/* Task Templates Modal */}
      <TaskTemplatesModal 
        open={templatesModalOpen}
        onOpenChange={setTemplatesModalOpen}
      />
    </div>
  )
}
