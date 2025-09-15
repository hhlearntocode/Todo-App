import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tasksApi } from '@/lib/api'
import { 
  TaskQuery, 
  CreateTaskInput, 
  UpdateTaskInput, 
  BulkActionInput, 
  ReorderTasksInput 
} from '@/types'
import { useToast } from '@/components/ui/use-toast'
import { useViewMode, useFilters } from '@/store'
import { isToday, addDays } from 'date-fns'
import { getDeadlinePressure } from '@/lib/utils'

// Helper function to invalidate all task-related queries
function invalidateTaskQueries(queryClient: any) {
  queryClient.invalidateQueries({ queryKey: ['tasks'] })
  queryClient.invalidateQueries({ queryKey: ['tasks-stats'] })
  queryClient.invalidateQueries({ queryKey: ['tasks-all-for-clear'] })
  queryClient.invalidateQueries({ queryKey: ['tags'] })
}

export function useTasks(query: TaskQuery = {}) {
  const { mode } = useViewMode()
  const { filters } = useFilters()
  
  // Modify query based on view mode and filters
  const enhancedQuery = { ...query }
  
  switch (mode) {
    case 'today':
      enhancedQuery.completed = false
      // Note: We could add date filtering here, but it's complex with the current API
      // Instead, we'll filter on the client side for now
      break
    case 'upcoming':
      enhancedQuery.completed = false
      break
    case 'completed':
      enhancedQuery.completed = true
      break
    case 'high-priority':
      enhancedQuery.priority = 1
      enhancedQuery.completed = false
      break
    case 'tag':
      if (filters.tag) {
        enhancedQuery.tag = filters.tag
      }
      break
  }

  return useQuery({
    queryKey: ['tasks', enhancedQuery, mode, filters],
    queryFn: () => tasksApi.getTasks(enhancedQuery),
    select: (data) => {
      // Client-side filtering for date-based views
      if (mode === 'today' && data.data) {
        const todayTasks = data.data.filter(task => {
          if (!task.dueDate) return false
          return isToday(new Date(task.dueDate)) || new Date(task.dueDate) < new Date()
        })
        return { ...data, data: todayTasks }
      }
      
      if (mode === 'upcoming' && data.data) {
        const upcomingTasks = data.data.filter(task => {
          if (!task.dueDate) return true // Tasks without due date are considered upcoming
          return new Date(task.dueDate) > addDays(new Date(), 1)
        })
        return { ...data, data: upcomingTasks }
      }

      if (mode === 'do-now' && data.data) {
        // Sort by urgency: deadline pressure + priority
        const sortedTasks = [...data.data].sort((a, b) => {
          // First sort by deadline pressure (higher pressure = more urgent)
          const pressureA = getDeadlinePressure(a.dueDate)
          const pressureB = getDeadlinePressure(b.dueDate)
          
          if (pressureB !== pressureA) {
            return pressureB - pressureA
          }
          
          // Then by priority (1 = high, 3 = low)
          if (a.priority !== b.priority) {
            return a.priority - b.priority
          }
          
          // Finally by due date (earliest first)
          if (a.dueDate && b.dueDate) {
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          }
          if (a.dueDate && !b.dueDate) return -1
          if (!a.dueDate && b.dueDate) return 1
          
          // Last resort: creation date (newest first)
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
        
        return { ...data, data: sortedTasks }
      }
      
      return data
    },
  })
}

export function useTask(id: string) {
  return useQuery({
    queryKey: ['tasks', id],
    queryFn: () => tasksApi.getTask(id),
    enabled: !!id,
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: CreateTaskInput) => tasksApi.createTask(data),
    onSuccess: (response) => {
      invalidateTaskQueries(queryClient)
      toast({
        title: "Task created",
        description: `"${response.data.title}" has been created successfully.`,
      })
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error creating task",
        description: error.message || "Failed to create task. Please try again.",
      })
    },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskInput }) => 
      tasksApi.updateTask(id, data),
    onSuccess: (response) => {
      invalidateTaskQueries(queryClient)
      queryClient.invalidateQueries({ queryKey: ['tasks', response.data.id] })
      toast({
        title: "Task updated",
        description: `"${response.data.title}" has been updated successfully.`,
      })
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error updating task",
        description: error.message || "Failed to update task. Please try again.",
      })
    },
  })
}

export function useToggleTask() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => tasksApi.toggleTask(id),
    onSuccess: (response) => {
      invalidateTaskQueries(queryClient)
      queryClient.invalidateQueries({ queryKey: ['tasks', response.data.id] })
      
      const action = response.data.completed ? 'completed' : 'reopened'
      toast({
        title: response.data.completed ? '🎉 Task completed!' : '↩️ Task reopened',
        description: `"${response.data.title}" has been ${action}.`,
        duration: response.data.completed ? 3000 : 2000,
      })
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error updating task",
        description: error.message || "Failed to update task. Please try again.",
      })
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => tasksApi.deleteTask(id),
    onSuccess: () => {
      invalidateTaskQueries(queryClient)
      toast({
        title: "Task deleted",
        description: "Task has been deleted successfully.",
      })
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error deleting task",
        description: error.message || "Failed to delete task. Please try again.",
      })
    },
  })
}

export function useReorderTasks() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (tasks: ReorderTasksInput[]) => tasksApi.reorderTasks(tasks),
    onMutate: async (newTaskOrder) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['tasks'] })

      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData(['tasks'])

      // Optimistically update to the new value
      queryClient.setQueryData(['tasks'], (old: any) => {
        if (!old?.data) return old

        const updatedTasks = [...old.data]
        
        // Create a map of new order indices
        const orderMap = new Map(newTaskOrder.map(item => [item.id, item.orderIndex]))
        
        // Sort tasks by new order
        updatedTasks.sort((a, b) => {
          const orderA = orderMap.get(a.id) ?? a.orderIndex
          const orderB = orderMap.get(b.id) ?? b.orderIndex
          return orderA - orderB
        })

        return { ...old, data: updatedTasks }
      })

      return { previousTasks }
    },
    onError: (error: any, newTaskOrder, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks)
      }
      
      toast({
        variant: "destructive",
        title: "Error reordering tasks",
        description: error.message || "Failed to reorder tasks. Please try again.",
      })
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

export function useBulkAction() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: BulkActionInput) => tasksApi.bulkAction(data),
    onSuccess: (response, variables) => {
      invalidateTaskQueries(queryClient)
      
      const { action, ids } = variables
      const count = response.data.updatedCount || response.data.deletedCount || ids.length
      
      let message = ''
      switch (action) {
        case 'complete':
          message = `${count} task(s) marked as completed`
          break
        case 'incomplete':
          message = `${count} task(s) marked as incomplete`
          break
        case 'delete':
          message = `${count} task(s) deleted`
          break
        case 'setPriority':
          message = `Priority updated for ${count} task(s)`
          break
        case 'setTags':
          message = `Tags updated for ${count} task(s)`
          break
      }
      
      toast({
        title: "Bulk action completed",
        description: message,
      })
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error performing bulk action",
        description: error.message || "Failed to perform bulk action. Please try again.",
      })
    },
  })
}

export function useClearCompleted() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: () => tasksApi.clearCompleted(),
    onSuccess: (response) => {
      invalidateTaskQueries(queryClient)
      
      const { deletedCount } = response.data
      toast({
        title: "Completed tasks cleared",
        description: `${deletedCount} completed task(s) have been deleted.`,
      })
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error clearing completed tasks",
        description: error.message || "Failed to clear completed tasks. Please try again.",
      })
    },
  })
}