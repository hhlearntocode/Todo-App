import { useState } from 'react'
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { TaskItem } from './task-item'
import { Card } from '@/components/ui/card'
import { useTasks, useReorderTasks } from '@/hooks/use-tasks'
import { useFilters } from '@/store'
import { Loader2, AlertCircle } from 'lucide-react'
// no-op

export function TaskList() {
  const { filters } = useFilters()
  // Normalize filters: convert nulls to undefined to match TaskQuery type
  const normalizedFilters = {
    ...filters,
    q: filters.search || undefined, // Map 'search' to 'q' for backend
    completed: filters.completed === null ? undefined : filters.completed,
    priority: filters.priority === null ? undefined : filters.priority,
    tag: filters.tag === null ? undefined : filters.tag,
  }
  // Remove 'search' since we mapped it to 'q'
  delete (normalizedFilters as any).search
  const { data: tasksResponse, isLoading, error } = useTasks(normalizedFilters)
  const reorderTasks = useReorderTasks()
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)

  const tasks = tasksResponse?.data || []

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setDraggedTaskId(null)

    console.log('Drag end:', { active: active.id, over: over?.id })

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = tasks.findIndex((task) => task.id === active.id)
    const newIndex = tasks.findIndex((task) => task.id === over.id)

    console.log('Reorder:', { oldIndex, newIndex, tasksLength: tasks.length })

    if (oldIndex === -1 || newIndex === -1) {
      return
    }

    // Create a new array with reordered tasks
    const reorderedTasks = [...tasks]
    const [movedTask] = reorderedTasks.splice(oldIndex, 1)
    reorderedTasks.splice(newIndex, 0, movedTask)

    // Update order indices
    const reorderData = reorderedTasks.map((task, index) => ({
      id: task.id,
      orderIndex: index,
    }))

    console.log('Sending reorder data:', reorderData)
    reorderTasks.mutate(reorderData)
  }

  const handleDragStart = (event: any) => {
    setDraggedTaskId(event.active.id)
    console.log('Drag started:', event.active.id)
  }

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

  if (tasks.length === 0) {
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
    <div className="h-full flex flex-col">
      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
          <div className="flex-1 overflow-auto space-y-2 scrollbar-thin">
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                isDragging={draggedTaskId === task.id}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
