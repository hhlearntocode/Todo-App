import React, { useMemo, useState, useCallback } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { TaskItem } from './task-item'
import { Card } from '@/components/ui/card'
import { useTasks, useReorderTasks } from '@/hooks/use-tasks'
import { useFilters } from '@/store'
import { Loader2, AlertCircle } from 'lucide-react'
import { Task } from '@/types'

const ITEM_HEIGHT = 120 // Estimated height of each task item
const OVERSCAN = 5 // Number of items to render outside visible area

export function VirtualTaskList() {
  const { filters } = useFilters()
  const { data: tasksResponse, isLoading, error } = useTasks(filters)
  const reorderTasks = useReorderTasks()
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)

  const tasks = useMemo(() => tasksResponse?.data || [], [tasksResponse?.data])

  // Memoized filtered and sorted tasks
  const processedTasks = useMemo(() => {
    let result = [...tasks]

    // Client-side search if needed for better performance
    if (filters.search && filters.search.length > 0) {
      const searchLower = filters.search.toLowerCase()
      result = result.filter(task => 
        task.title.toLowerCase().includes(searchLower) ||
        (task.description && task.description.toLowerCase().includes(searchLower)) ||
        task.tags.some(tag => tag.name.toLowerCase().includes(searchLower))
      )
    }

    return result
  }, [tasks, filters.search])

  // Virtual list setup
  const parentRef = React.useRef<HTMLDivElement>(null)
  
  const virtualizer = useVirtualizer({
    count: processedTasks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ITEM_HEIGHT,
    overscan: OVERSCAN,
    measureElement: (element) => element?.getBoundingClientRect().height ?? ITEM_HEIGHT,
  })

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    setDraggedTaskId(null)

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = processedTasks.findIndex((task) => task.id === active.id)
    const newIndex = processedTasks.findIndex((task) => task.id === over.id)

    if (oldIndex === -1 || newIndex === -1) {
      return
    }

    // Create a new array with reordered tasks
    const reorderedTasks = [...processedTasks]
    const [movedTask] = reorderedTasks.splice(oldIndex, 1)
    reorderedTasks.splice(newIndex, 0, movedTask)

    // Update order indices
    const reorderData = reorderedTasks.map((task, index) => ({
      id: task.id,
      orderIndex: index,
    }))

    reorderTasks.mutate(reorderData)
  }, [processedTasks, reorderTasks])

  const handleDragStart = useCallback((event: any) => {
    setDraggedTaskId(event.active.id)
  }, [])

  if (isLoading) {
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

  if (processedTasks.length === 0) {
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

  return (
    <div className="h-full">
      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext items={processedTasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
          <div
            ref={parentRef}
            className="h-full overflow-auto scrollbar-thin"
            style={{
              contain: 'strict',
            }}
          >
            <div
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {virtualizer.getVirtualItems().map((virtualItem) => {
                const task = processedTasks[virtualItem.index]
                if (!task) return null

                return (
                  <div
                    key={virtualItem.key}
                    data-index={virtualItem.index}
                    ref={virtualizer.measureElement}
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
        </SortableContext>
      </DndContext>
    </div>
  )
}

// Memoized TaskItem to prevent unnecessary re-renders
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
