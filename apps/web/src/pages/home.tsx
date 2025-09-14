import React from 'react'
import { TaskList } from '@/components/tasks/task-list'
import { EnhancedTaskList } from '@/components/tasks/enhanced-task-list'
import { TaskForm } from '@/components/tasks/task-form'
import { BulkActions } from '@/components/tasks/bulk-actions'
import { TaskFilters } from '@/components/tasks/task-filters'
import { TaskStats } from '@/components/tasks/task-stats'
import { PerformanceMonitor, useRenderTime, useMemoryMonitor } from '@/components/performance/performance-monitor'
import { useModals, useSelection, useViewMode } from '@/store'
import { useTasks } from '@/hooks/use-tasks'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export function HomePage() {
  useRenderTime('HomePage')
  useMemoryMonitor()
  
  const { mode } = useViewMode()
  const { selectedTasks } = useSelection()
  const { isCreateModalOpen, setCreateModalOpen, editingTaskId, setEditingTaskId } = useModals()
  const { data: tasksResponse } = useTasks()
  
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

      {/* Task List */}
      <div className="flex-1 overflow-hidden">
        {useEnhancedList ? (
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
