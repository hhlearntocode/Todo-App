import { 
  Task, 
  Tag, 
  CreateTaskInput, 
  UpdateTaskInput, 
  TaskQuery, 
  BulkActionInput, 
  ReorderTasksInput, 
  ApiResponse 
} from '@/types'

const API_BASE = '/api/v1'

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`
  
  // Only set Content-Type header if there's a body
  const headers: Record<string, string> = {
    ...options.headers,
  }
  
  if (options.body) {
    headers['Content-Type'] = 'application/json'
  }
  
  const response = await fetch(url, {
    headers,
    ...options,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
    throw new ApiError(response.status, errorData.message || `HTTP ${response.status}`)
  }

  // Handle responses with no content (like 204 No Content)
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return undefined as T
  }

  return response.json()
}

export const tasksApi = {
  // Get tasks with filtering and pagination
  getTasks: async (query: TaskQuery = {}): Promise<ApiResponse<Task[]>> => {
    const params = new URLSearchParams()
    
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value))
      }
    })

    const queryString = params.toString()
    return fetchApi<ApiResponse<Task[]>>(`/tasks${queryString ? `?${queryString}` : ''}`)
  },

  // Get single task
  getTask: async (id: string): Promise<ApiResponse<Task>> => {
    return fetchApi<ApiResponse<Task>>(`/tasks/${id}`)
  },

  // Create task
  createTask: async (data: CreateTaskInput): Promise<ApiResponse<Task>> => {
    return fetchApi<ApiResponse<Task>>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // Update task
  updateTask: async (id: string, data: UpdateTaskInput): Promise<ApiResponse<Task>> => {
    return fetchApi<ApiResponse<Task>>(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  // Toggle task completion
  toggleTask: async (id: string): Promise<ApiResponse<Task>> => {
    return fetchApi<ApiResponse<Task>>(`/tasks/${id}/toggle`, {
      method: 'PATCH',
    })
  },

  // Delete task
  deleteTask: async (id: string): Promise<void> => {
    await fetchApi(`/tasks/${id}`, {
      method: 'DELETE',
    })
  },

  // Reorder tasks
  reorderTasks: async (tasks: ReorderTasksInput[]): Promise<ApiResponse<{ success: boolean }>> => {
    return fetchApi<ApiResponse<{ success: boolean }>>('/tasks/reorder', {
      method: 'PATCH',
      body: JSON.stringify(tasks),
    })
  },

  // Bulk actions
  bulkAction: async (data: BulkActionInput): Promise<ApiResponse<{ success: boolean; updatedCount?: number; deletedCount?: number }>> => {
    return fetchApi<ApiResponse<{ success: boolean; updatedCount?: number; deletedCount?: number }>>('/tasks/bulk', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
}

export const tagsApi = {
  // Get all tags
  getTags: async (): Promise<ApiResponse<Tag[]>> => {
    return fetchApi<ApiResponse<Tag[]>>('/tags')
  },

  // Get single tag
  getTag: async (id: string): Promise<ApiResponse<Tag>> => {
    return fetchApi<ApiResponse<Tag>>(`/tags/${id}`)
  },

  // Create tag
  createTag: async (data: { name: string; color?: string }): Promise<ApiResponse<Tag>> => {
    return fetchApi<ApiResponse<Tag>>('/tags', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // Update tag
  updateTag: async (id: string, data: { name?: string; color?: string }): Promise<ApiResponse<Tag>> => {
    return fetchApi<ApiResponse<Tag>>(`/tags/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  // Delete tag
  deleteTag: async (id: string): Promise<void> => {
    await fetchApi(`/tags/${id}`, {
      method: 'DELETE',
    })
  },
}

export { ApiError }
