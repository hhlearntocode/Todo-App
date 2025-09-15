import React from 'react'
import { TaskList } from '@/components/tasks/task-list'
import { EnhancedTaskList } from '@/components/tasks/enhanced-task-list'
import { TaskForm } from '@/components/tasks/task-form'
import { BulkActions } from '@/components/tasks/bulk-actions'
import { TaskFilters } from '@/components/tasks/task-filters'
import { TaskStats } from '@/components/tasks/task-stats'
import { CalendarView } from '@/components/calendar/calendar-view'
import { PerformanceMonitor, useRenderTime, useMemoryMonitor } from '@/components/performance/performance-monitor'
import { useModals, useSelection, useViewMode, useFilters } from '@/store'
import { useTasks } from '@/hooks/use-tasks'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useQuery } from '@tanstack/react-query'
import { tagsApi } from '@/lib/api'

export function HomePage() {
  useRenderTime('HomePage')
  useMemoryMonitor()
  useKeyboardShortcuts()
  
  const { mode } = useViewMode()
  const { filters } = useFilters()
  const { selectedTasks } = useSelection()
  
  // Debug logging
  console.log('🔍 HomePage render:', { mode, filters })
  const { isCreateModalOpen, setCreateModalOpen, editingTaskId, setEditingTaskId } = useModals()
  const { data: tasksResponse } = useTasks()
  
  // Get tags for tag-based view
  const { data: tagsResponse } = useQuery({
    queryKey: ['tags'],
    queryFn: () => tagsApi.getTags(),
  })
  
  // Determine which list component to use based on task count
  const taskCount = tasksResponse?.data?.length || 0
  const useEnhancedList = taskCount > 100

  const getPageTitle = () => {
    switch (mode) {
      case 'today':
        return 'Today\'s Tasks'
      case 'upcoming':
        return 'Upcoming Tasks'
      case 'completed':
        return 'Completed Tasks'
      case 'high-priority':
        return 'High Priority Tasks'
      case 'do-now':
        return '⚡ Do Now'
      case 'calendar':
        return '📅 Calendar View'
      case 'tag':
        const tag = tagsResponse?.data?.find(t => t.name === filters.tag)
        return tag ? `#${tag.name}` : 'Tagged Tasks'
      default:
        return 'All Tasks'
    }
  }

  const getPageDescription = () => {
    switch (mode) {
      case 'today':
        return 'Tasks due today and overdue items'
      case 'upcoming':
        return 'Tasks scheduled for the future'
      case 'completed':
        return 'Tasks you\'ve completed'
      case 'high-priority':
        return 'Your most important tasks'
      case 'do-now':
        return 'Most urgent tasks sorted by deadline pressure and priority'
      case 'calendar':
        return 'Visualize deadlines and detect scheduling conflicts'
      case 'tag':
        const tag = tagsResponse?.data?.find(t => t.name === filters.tag)
        return tag ? `All tasks tagged with ${tag.name}` : 'Tasks filtered by tag'
      default:
        return 'Manage all your tasks in one place'
    }
  }

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{getPageTitle()}</h1>
          <p className="text-muted-foreground">{getPageDescription()}</p>
        </div>
        <TaskStats />
      </div>

      {/* Filters */}
      <TaskFilters />

      {/* Bulk Actions */}
      {selectedTasks.length > 0 && (
        <BulkActions />
      )}

      {/* Task List or Calendar View */}
      <div className="flex-1 overflow-hidden">
        {mode === 'calendar' ? (
          <div className="h-full pt-2">
            <CalendarView onTaskClick={(task) => setEditingTaskId(task.id)} />
          </div>
        ) : useEnhancedList ? (
          <EnhancedTaskList 
            enableVirtualization={taskCount > 200}
            enableInfiniteScroll={taskCount > 500}
            pageSize={50}
          />
        ) : (
          <TaskList />
        )}
      </div>

      {/* Create Task Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <TaskForm 
            onSuccess={() => setCreateModalOpen(false)}
            onCancel={() => setCreateModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Task Modal */}
      <Dialog open={!!editingTaskId} onOpenChange={(open) => !open && setEditingTaskId(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          {editingTaskId && (
            <TaskForm 
              taskId={editingTaskId}
              onSuccess={() => setEditingTaskId(null)}
              onCancel={() => setEditingTaskId(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Performance Monitor - only in development */}
      {process.env.NODE_ENV === 'development' && <PerformanceMonitor />}
    </div>
  )
}
