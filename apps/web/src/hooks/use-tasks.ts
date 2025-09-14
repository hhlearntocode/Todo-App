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
import { useViewMode } from '@/store'
import { isToday, addDays } from 'date-fns'

export function useTasks(query: TaskQuery = {}) {
  const { mode } = useViewMode()
  
  // Modify query based on view mode
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
  }

  return useQuery({
    queryKey: ['tasks', enhancedQuery],
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
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
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
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
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
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['tasks', response.data.id] })
      
      const action = response.data.completed ? 'completed' : 'reopened'
      toast({
        title: `Task ${action}`,
        description: `"${response.data.title}" has been ${action}.`,
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
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error reordering tasks",
        description: error.message || "Failed to reorder tasks. Please try again.",
      })
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
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      
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
