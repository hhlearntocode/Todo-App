import { useMemo, useCallback, useRef, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { debounce } from '@/lib/utils'
import { Task } from '@/types'

interface UseOptimizedSearchProps {
  tasks: Task[]
  searchTerm: string
  debounceMs?: number
}

interface SearchCache {
  [key: string]: Task[]
}

// Global search cache to persist across component remounts
const searchCache: SearchCache = {}

export function useOptimizedSearch({ 
  tasks, 
  searchTerm, 
  debounceMs = 250 
}: UseOptimizedSearchProps) {
  const queryClient = useQueryClient()
  const cacheRef = useRef<SearchCache>(searchCache)
  
  // Memoized search function
  const performSearch = useCallback((term: string, taskList: Task[]): Task[] => {
    // Check cache first
    const cacheKey = `${term}-${taskList.length}-${taskList[0]?.updatedAt || ''}`
    if (cacheRef.current[cacheKey]) {
      return cacheRef.current[cacheKey]
    }

    if (!term.trim()) {
      return taskList
    }

    const searchLower = term.toLowerCase()
    const results = taskList.filter(task => {
      // Search in title
      if (task.title.toLowerCase().includes(searchLower)) {
        return true
      }
      
      // Search in description
      if (task.description && task.description.toLowerCase().includes(searchLower)) {
        return true
      }
      
      // Search in tags
      if (task.tags.some(tag => tag.name.toLowerCase().includes(searchLower))) {
        return true
      }
      
      return false
    })

    // Cache the results
    cacheRef.current[cacheKey] = results
    
    // Limit cache size to prevent memory leaks
    const cacheKeys = Object.keys(cacheRef.current)
    if (cacheKeys.length > 50) {
      // Remove oldest entries
      const oldestKeys = cacheKeys.slice(0, 25)
      oldestKeys.forEach(key => delete cacheRef.current[key])
    }

    return results
  }, [])

  // Debounced search function
  const debouncedSearch = useMemo(
    () => debounce((term: string, taskList: Task[]) => {
      return performSearch(term, taskList)
    }, debounceMs),
    [performSearch, debounceMs]
  )

  // Memoized filtered results
  const filteredTasks = useMemo(() => {
    if (!searchTerm.trim()) {
      return tasks
    }
    
    // For immediate feedback, perform synchronous search for short terms
    if (searchTerm.length <= 2) {
      return performSearch(searchTerm, tasks)
    }
    
    // For longer terms, use cached results or perform search
    return performSearch(searchTerm, tasks)
  }, [tasks, searchTerm, performSearch])

  // Prefetch related queries for better UX
  useEffect(() => {
    if (searchTerm.length >= 2) {
      // Prefetch common variations
      const variations = [
        searchTerm + ' ',
        searchTerm.slice(0, -1),
      ]
      
      variations.forEach(variation => {
        if (variation.trim() && variation !== searchTerm) {
          setTimeout(() => {
            performSearch(variation, tasks)
          }, 100)
        }
      })
    }
  }, [searchTerm, tasks, performSearch])

  // Clear cache when tasks change significantly
  useEffect(() => {
    const cacheKeys = Object.keys(cacheRef.current)
    if (cacheKeys.length > 0 && tasks.length !== parseInt(cacheKeys[0]?.split('-')[1] || '0')) {
      cacheRef.current = {}
    }
  }, [tasks.length])

  return {
    filteredTasks,
    isSearching: searchTerm.length > 0,
    resultCount: filteredTasks.length,
    totalCount: tasks.length,
  }
}

// Hook for search suggestions
export function useSearchSuggestions(tasks: Task[], currentSearch: string) {
  return useMemo(() => {
    if (!currentSearch.trim() || currentSearch.length < 2) {
      return []
    }

    const suggestions = new Set<string>()
    const searchLower = currentSearch.toLowerCase()

    tasks.forEach(task => {
      // Extract words from title
      const titleWords = task.title.toLowerCase().split(/\s+/)
      titleWords.forEach(word => {
        if (word.includes(searchLower) && word !== searchLower) {
          suggestions.add(word)
        }
      })

      // Add tag names
      task.tags.forEach(tag => {
        if (tag.name.toLowerCase().includes(searchLower) && tag.name.toLowerCase() !== searchLower) {
          suggestions.add(tag.name.toLowerCase())
        }
      })
    })

    return Array.from(suggestions).slice(0, 5)
  }, [tasks, currentSearch])
}
