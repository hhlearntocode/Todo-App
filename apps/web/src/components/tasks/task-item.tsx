import { useState, useCallback, useMemo } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  MoreHorizontal, 
  Calendar, 
  Flag, 
  Edit, 
  Trash2, 
  Copy,
  GripVertical,
  Clock
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Task } from '@/types'
import { useToggleTask, useDeleteTask } from '@/hooks/use-tasks'
import { useSelection, useModals, useFilters } from '@/store'
import { useConfetti } from '@/hooks/use-confetti'
import { cn, formatDate, isToday, isOverdue, getPriorityColor, getTagColor, getDeadlinePressure, getDeadlinePressureStyles, getTimeRemainingText } from '@/lib/utils'

interface TaskItemProps {
  task: Task
  isDragging?: boolean
}

export function TaskItem({ task, isDragging }: TaskItemProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { selectedTasks, toggleTaskSelection, bulkSelectionMode } = useSelection()
  const { setEditingTaskId } = useModals()
  const { setFilters } = useFilters()
  const toggleTask = useToggleTask()
  const deleteTask = useDeleteTask()
  const { triggerConfetti } = useConfetti()

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id })

  // Memoized style calculation
  const style = useMemo(() => ({
    transform: CSS.Transform.toString(transform),
    transition,
  }), [transform, transition])

  // Memoized computed values
  const computedValues = useMemo(() => {
    const deadlinePressure = getDeadlinePressure(task.dueDate)
    const deadlinePressureStyles = getDeadlinePressureStyles(deadlinePressure, task.completed)
    const timeRemaining = getTimeRemainingText(task.dueDate)
    
    return {
      isSelected: selectedTasks.includes(task.id),
      isTaskOverdue: task.dueDate && !task.completed && isOverdue(task.dueDate),
      isTaskDueToday: task.dueDate && !task.completed && isToday(task.dueDate),
      formattedDate: task.dueDate ? formatDate(task.dueDate) : null,
      priorityColor: getPriorityColor(task.priority),
      deadlinePressure,
      deadlinePressureStyles,
      timeRemaining,
    }
  }, [task.id, task.dueDate, task.completed, task.priority, selectedTasks])

  // Memoized handlers to prevent unnecessary re-renders
  const handleToggleComplete = useCallback((checked: boolean | 'indeterminate') => {
    // If task is being marked as completed, trigger confetti
    if (checked && !task.completed) {
      setTimeout(() => triggerConfetti(), 200) // Delay to let the animation start
    }
    toggleTask.mutate(task.id)
  }, [toggleTask, task.id, task.completed, triggerConfetti])

  const handleSelectTask = useCallback((checked: boolean | 'indeterminate') => {
    toggleTaskSelection(task.id)
  }, [toggleTaskSelection, task.id])

  const handleEdit = useCallback(() => {
    setEditingTaskId(task.id)
    setIsMenuOpen(false)
  }, [setEditingTaskId, task.id])

  const handleDelete = useCallback(() => {
    deleteTask.mutate(task.id)
    setIsMenuOpen(false)
  }, [deleteTask, task.id])

  const handleDuplicate = useCallback(() => {
    // TODO: Implement duplicate functionality
    setIsMenuOpen(false)
  }, [])

  const handleTagClick = useCallback((tagName: string) => {
    // Filter tasks by clicked tag
    setFilters({ tag: tagName })
  }, [setFilters])

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative transition-all duration-200 hover:shadow-md",
        (isDragging || isSortableDragging) && "opacity-70 rotate-1 shadow-lg scale-105 z-10",
        task.completed && "task-completed",
        computedValues.isTaskOverdue && "task-overdue",
        computedValues.isTaskDueToday && "task-due-today",
        computedValues.isSelected && "ring-2 ring-primary",
        `task-priority-${task.priority}`,
        computedValues.deadlinePressureStyles
      )}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Selection checkbox (only show when bulk mode is active) */}
        {bulkSelectionMode && (
          <Checkbox
            checked={computedValues.isSelected}
            onCheckedChange={handleSelectTask}
            className="mt-1"
            title="Select for bulk operations"
          />
        )}

        {/* Main task completion checkbox - larger and more prominent */}
        <Checkbox
          checked={task.completed}
          onCheckedChange={handleToggleComplete}
          className={cn(
            "mt-1 h-5 w-5 transition-all duration-300",
            task.completed && "task-checkbox-completed"
          )}
          title="Mark task as completed"
        />

        {/* Drag handle - always visible when not in bulk selection mode */}
        {!bulkSelectionMode && (
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground mt-1 opacity-50 hover:opacity-100 transition-opacity"
            title="Drag to reorder"
          >
            <GripVertical className="h-4 w-4" />
          </button>
        )}

        {/* Task content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3
                className={cn(
                  "font-medium text-sm leading-5 break-words task-title",
                  task.completed && "text-muted-foreground"
                )}
              >
                {task.title}
              </h3>
              
              {task.description && (
                <p
                  className={cn(
                    "text-sm text-muted-foreground mt-1 line-clamp-2",
                    task.completed && "opacity-70"
                  )}
                >
                  {task.description}
                </p>
              )}

              {/* Tags and metadata */}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {/* Priority indicator */}
                <div className="flex items-center gap-1">
                  <Flag 
                    className={cn(
                      "h-3 w-3",
                      task.priority === 1 && "text-red-500",
                      task.priority === 2 && "text-yellow-500",
                      task.priority === 3 && "text-green-500"
                    )} 
                  />
                </div>

                {/* Due date with deadline pressure */}
                {task.dueDate && (
                  <div className="flex items-center gap-1 text-xs">
                    <Calendar 
                      className={cn(
                        "h-3 w-3",
                        computedValues.deadlinePressure >= 3 && "text-red-500",
                        computedValues.deadlinePressure === 2 && "text-orange-500",
                        computedValues.deadlinePressure === 1 && "text-yellow-500",
                        computedValues.deadlinePressure === 0 && "text-muted-foreground"
                      )}
                    />
                    <div className="flex flex-col gap-0.5">
                      <span
                        className={cn(
                          "transition-colors",
                          computedValues.deadlinePressure >= 4 && "text-red-600 font-bold",
                          computedValues.deadlinePressure === 3 && "text-red-500 font-medium",
                          computedValues.deadlinePressure === 2 && "text-orange-500 font-medium",
                          computedValues.deadlinePressure === 1 && "text-yellow-600",
                          computedValues.deadlinePressure === 0 && "text-muted-foreground"
                        )}
                      >
                        {computedValues.formattedDate}
                      </span>
                      {computedValues.timeRemaining && (
                        <span 
                          className={cn(
                            "text-[10px] font-medium",
                            computedValues.deadlinePressure >= 4 && "text-red-600",
                            computedValues.deadlinePressure === 3 && "text-red-500",
                            computedValues.deadlinePressure === 2 && "text-orange-500",
                            computedValues.deadlinePressure === 1 && "text-yellow-600",
                            computedValues.deadlinePressure === 0 && "text-muted-foreground"
                          )}
                        >
                          {computedValues.timeRemaining}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {task.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {task.tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="outline"
                        className={cn(
                          "text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors",
                          task.completed && "opacity-60"
                        )}
                        style={{ borderColor: getTagColor(tag.color) }}
                        onClick={() => handleTagClick(tag.name)}
                        title={`Filter by ${tag.name}`}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Time Tracking */}
                {(task.estimatedMinutes || task.actualMinutes) && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>
                      {task.estimatedMinutes && `Est: ${Math.floor(task.estimatedMinutes / 60)}h ${task.estimatedMinutes % 60}m`}
                      {task.estimatedMinutes && task.actualMinutes && ' • '}
                      {task.actualMinutes && `Act: ${Math.floor(task.actualMinutes / 60)}h ${task.actualMinutes % 60}m`}
                    </span>
                    {task.estimatedMinutes && task.actualMinutes && (
                      <Badge 
                        variant={task.actualMinutes > task.estimatedMinutes ? "destructive" : "secondary"}
                        className="h-4 text-[10px]"
                      >
                        {task.actualMinutes > task.estimatedMinutes ? '+' : ''}{task.actualMinutes - task.estimatedMinutes}m
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Actions menu */}
            <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDuplicate}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </Card>
  )
}
