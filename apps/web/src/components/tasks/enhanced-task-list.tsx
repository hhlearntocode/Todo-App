import React, { useMemo, useState, useCallback, useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { TaskItem } from './task-item'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTasks, useReorderTasks } from '@/hooks/use-tasks'
import { useInfiniteTasks, useInfiniteScroll } from '@/hooks/use-infinite-tasks'
import { useOptimizedSearch } from '@/hooks/use-optimized-search'
import { useFilters } from '@/store'
import { Loader2, AlertCircle, ChevronDown } from 'lucide-react'
// no-op

const ITEM_HEIGHT = 120
const OVERSCAN = 5
const LOAD_MORE_THRESHOLD = 200 // Load more when 200px from bottom

interface EnhancedTaskListProps {
  enableVirtualization?: boolean
  enableInfiniteScroll?: boolean
  pageSize?: number
}

export function EnhancedTaskList({ 
  enableVirtualization = true,
  enableInfiniteScroll = false,
  pageSize = 20 
}: EnhancedTaskListProps) {
  const { filters } = useFilters()
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)
  
  // Choose between infinite query and regular query
  const normalizedFilters = {
    ...filters,
    q: filters.search || undefined, // Map 'search' to 'q' for backend
    completed: filters.completed === null ? undefined : filters.completed,
    priority: filters.priority === null ? undefined : filters.priority,
    tag: filters.tag === null ? undefined : filters.tag,
  }
  // Remove 'search' since we mapped it to 'q'
  delete (normalizedFilters as any).search
  const infiniteQuery = useInfiniteTasks({ ...normalizedFilters, pageSize })
  const regularQuery = useTasks(normalizedFilters)
  
  const {
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = enableInfiniteScroll ? infiniteQuery : { 
    ...regularQuery, 
    fetchNextPage: () => {},
    hasNextPage: false as boolean,
    isFetchingNextPage: false as boolean,
  }

  const reorderTasks = useReorderTasks()

  // Get tasks array
  const tasks = useMemo(() => {
    if (enableInfiniteScroll) {
      return infiniteQuery.tasks || []
    }
    return regularQuery.data?.data || []
  }, [enableInfiniteScroll, infiniteQuery.tasks, regularQuery.data?.data])

  // Optimized search
  const { filteredTasks } = useOptimizedSearch({
    tasks,
    searchTerm: filters.search || '',
  })

  // Virtual list setup
  const parentRef = useRef<HTMLDivElement>(null)
  
  const virtualizer = useVirtualizer({
    count: filteredTasks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ITEM_HEIGHT,
    overscan: OVERSCAN,
    measureElement: (element) => element?.getBoundingClientRect().height ?? ITEM_HEIGHT,
  })

  // Infinite scroll setup
  const lastElementRef = useInfiniteScroll(
    fetchNextPage,
    Boolean(hasNextPage),
    isFetchingNextPage
  )

  // Scroll event handler for infinite scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (!enableInfiniteScroll || !hasNextPage || isFetchingNextPage) return
    
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    const threshold = scrollHeight - clientHeight - LOAD_MORE_THRESHOLD
    
    if (scrollTop >= threshold) {
      fetchNextPage()
    }
  }, [enableInfiniteScroll, hasNextPage, isFetchingNextPage, fetchNextPage])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    setDraggedTaskId(null)

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = filteredTasks.findIndex((task) => task.id === active.id)
    const newIndex = filteredTasks.findIndex((task) => task.id === over.id)

    if (oldIndex === -1 || newIndex === -1) {
      return
    }

    const reorderedTasks = [...filteredTasks]
    const [movedTask] = reorderedTasks.splice(oldIndex, 1)
    reorderedTasks.splice(newIndex, 0, movedTask)

    const reorderData = reorderedTasks.map((task, index) => ({
      id: task.id,
      orderIndex: index,
    }))

    reorderTasks.mutate(reorderData)
  }, [filteredTasks, reorderTasks])

  const handleDragStart = useCallback((event: any) => {
    setDraggedTaskId(event.active.id)
  }, [])

  if (isLoading && filteredTasks.length === 0) {
    return (
      <Card className="flex items-center justify-center p-12">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading tasks...
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="flex items-center justify-center p-12">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-4 w-4" />
          Failed to load tasks. Please try again.
        </div>
      </Card>
    )
  }

  if (filteredTasks.length === 0) {
    return (
      <Card className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
          <p className="text-muted-foreground">
            {filters.search || filters.completed !== null || filters.priority || filters.tag
              ? "Try adjusting your filters or create a new task."
              : "Get started by creating your first task!"}
          </p>
        </div>
      </Card>
    )
  }

  const renderTaskList = () => {
    if (enableVirtualization && filteredTasks.length > 50) {
      // Virtual scrolling for large lists
      return (
        <div
          ref={parentRef}
          className="h-full overflow-auto scrollbar-thin"
          onScroll={handleScroll}
          style={{ contain: 'strict' }}
        >
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const task = filteredTasks[virtualItem.index]
              if (!task) return null

              const isLast = virtualItem.index === filteredTasks.length - 1

              return (
                <div
                  key={virtualItem.key}
                  data-index={virtualItem.index}
                  ref={(node) => {
                    virtualizer.measureElement(node)
                    if (isLast && enableInfiniteScroll) {
                      lastElementRef(node)
                    }
                  }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  <div className="p-1">
                    <MemoizedTaskItem
                      task={task}
                      isDragging={draggedTaskId === task.id}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )
    } else {
      // Regular scrolling for smaller lists
      return (
        <div 
          className="space-y-2 overflow-auto scrollbar-thin h-full"
          onScroll={handleScroll}
        >
          {filteredTasks.map((task, index) => {
            const isLast = index === filteredTasks.length - 1
            
            return (
              <div
                key={task.id}
                ref={isLast && enableInfiniteScroll ? lastElementRef : undefined}
                data-task-item
              >
                <MemoizedTaskItem
                  task={task}
                  isDragging={draggedTaskId === task.id}
                />
              </div>
            )
          })}
        </div>
      )
    }
  }

  return (
    <div className="h-full flex flex-col">
      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext items={filteredTasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
          <div className="flex-1 overflow-hidden">
            {renderTaskList()}
          </div>
        </SortableContext>
      </DndContext>

      {/* Load more button for infinite scroll */}
      {enableInfiniteScroll && Boolean(hasNextPage) && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="gap-2"
          >
            {isFetchingNextPage ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            {isFetchingNextPage ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}

      {/* Loading indicator for infinite scroll */}
      {enableInfiniteScroll && isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading more tasks...</span>
          </div>
        </div>
      )}
    </div>
  )
}

// Memoized TaskItem component
const MemoizedTaskItem = React.memo(TaskItem, (prevProps, nextProps) => {
  return (
    prevProps.task.id === nextProps.task.id &&
    prevProps.task.title === nextProps.task.title &&
    prevProps.task.description === nextProps.task.description &&
    prevProps.task.completed === nextProps.task.completed &&
    prevProps.task.priority === nextProps.task.priority &&
    prevProps.task.dueDate === nextProps.task.dueDate &&
    prevProps.task.updatedAt === nextProps.task.updatedAt &&
    prevProps.task.tags.length === nextProps.task.tags.length &&
    prevProps.task.tags.every((tag, index) => tag.id === nextProps.task.tags[index]?.id) &&
    prevProps.isDragging === nextProps.isDragging
  )
})
