export interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: number
  dueDate?: string
  orderIndex: number
  createdAt: string
  updatedAt: string
  tags: Tag[]
}

export interface Tag {
  id: string
  name: string
  color: string
  taskCount?: number
}

export interface CreateTaskInput {
  title: string
  description?: string
  priority?: number
  dueDate?: string
  tags?: string[]
}

export interface UpdateTaskInput {
  title?: string
  description?: string
  priority?: number
  dueDate?: string
  tags?: string[]
}

export interface TaskQuery {
  q?: string
  completed?: boolean
  priority?: number
  tag?: string
  sortBy?: 'createdAt' | 'dueDate' | 'priority' | 'orderIndex'
  order?: 'asc' | 'desc'
  page?: number
  pageSize?: number
}

export interface BulkActionInput {
  action: 'complete' | 'incomplete' | 'delete' | 'setPriority' | 'setTags'
  ids: string[]
  priority?: number
  tags?: string[]
}

export interface ReorderTasksInput {
  id: string
  orderIndex: number
}

export interface ApiResponse<T> {
  data: T
  meta?: {
    pagination?: {
      page: number
      pageSize: number
      total: number
      totalPages: number
      hasNext: boolean
      hasPrev: boolean
    }
  }
}

export interface FilterState {
  search: string
  completed: boolean | null
  priority: number | null
  tag: string | null
  sortBy: 'createdAt' | 'dueDate' | 'priority' | 'orderIndex'
  order: 'asc' | 'desc'
}

export type ViewMode = 'all' | 'today' | 'upcoming' | 'completed' | 'high-priority'
