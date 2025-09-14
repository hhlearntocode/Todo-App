import { useRef, useCallback, useEffect } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { tasksApi } from '@/lib/api'
import { TaskQuery } from '@/types'
import { useViewMode } from '@/store'
import { isToday, addDays } from 'date-fns'

export function useInfiniteTasks(query: TaskQuery = {}) {
  const { mode } = useViewMode()
  
  // Modify query based on view mode
  const enhancedQuery = { ...query }
  
  switch (mode) {
    case 'today':
      enhancedQuery.completed = false
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

  const result = useInfiniteQuery({
    queryKey: ['tasks', 'infinite', enhancedQuery],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await tasksApi.getTasks({
        ...enhancedQuery,
        page: pageParam,
        pageSize: 20,
      })
      return response
    },
    getNextPageParam: (lastPage) => {
      const { page, totalPages, hasNext } = lastPage.meta?.pagination || {}
      return hasNext && page ? page + 1 : undefined
    },
    initialPageParam: 1,
    select: (data) => {
      // Flatten pages and apply client-side filtering for date-based views
      const allTasks = data.pages.flatMap(page => page.data)
      
      let filteredTasks = allTasks
      
      if (mode === 'today') {
        filteredTasks = allTasks.filter(task => {
          if (!task.dueDate) return false
          return isToday(new Date(task.dueDate)) || new Date(task.dueDate) < new Date()
        })
      }
      
      if (mode === 'upcoming') {
        filteredTasks = allTasks.filter(task => {
          if (!task.dueDate) return true
          return new Date(task.dueDate) > addDays(new Date(), 1)
        })
      }
      
      return {
        ...data,
        tasks: filteredTasks,
        totalCount: data.pages[0]?.meta?.pagination?.total || 0,
      }
    },
  })

  return {
    ...result,
    tasks: result.data?.tasks || [],
    totalCount: result.data?.totalCount || 0,
  }
}

// Hook for infinite scroll with intersection observer
export function useInfiniteScroll(
  fetchNextPage: () => void,
  hasNextPage: boolean,
  isFetchingNextPage: boolean,
  threshold = 0.1
) {
  const observerRef = useRef<IntersectionObserver>()
  
  const lastElementRef = useCallback((node: HTMLElement | null) => {
    if (isFetchingNextPage) return
    
    if (observerRef.current) {
      observerRef.current.disconnect()
    }
    
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage()
        }
      },
      { threshold }
    )
    
    if (node) {
      observerRef.current.observe(node)
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, threshold])
  
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])
  
  return lastElementRef
}
