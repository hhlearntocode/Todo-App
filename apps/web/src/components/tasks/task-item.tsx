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
  GripVertical 
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
import { useSelection, useModals } from '@/store'
import { cn, formatDate, isToday, isOverdue, getPriorityColor, getTagColor } from '@/lib/utils'

interface TaskItemProps {
  task: Task
  isDragging?: boolean
}

export function TaskItem({ task, isDragging }: TaskItemProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { selectedTasks, toggleTaskSelection } = useSelection()
  const { setEditingTaskId } = useModals()
  const toggleTask = useToggleTask()
  const deleteTask = useDeleteTask()

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
  const computedValues = useMemo(() => ({
    isSelected: selectedTasks.includes(task.id),
    isTaskOverdue: task.dueDate && !task.completed && isOverdue(task.dueDate),
    isTaskDueToday: task.dueDate && !task.completed && isToday(task.dueDate),
    formattedDate: task.dueDate ? formatDate(task.dueDate) : null,
    priorityColor: getPriorityColor(task.priority),
  }), [task.id, task.dueDate, task.completed, task.priority, selectedTasks])

  // Memoized handlers to prevent unnecessary re-renders
  const handleToggleComplete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    toggleTask.mutate(task.id)
  }, [toggleTask, task.id])

  const handleSelectTask = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
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

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative transition-all duration-200 hover:shadow-md",
        isDragging || isSortableDragging && "opacity-50 rotate-2 shadow-lg",
        task.completed && "task-completed",
        computedValues.isTaskOverdue && "task-overdue",
        computedValues.isTaskDueToday && "task-due-today",
        computedValues.isSelected && "ring-2 ring-primary",
        `task-priority-${task.priority}`
      )}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        {/* Selection checkbox */}
        <Checkbox
          checked={computedValues.isSelected}
          onCheckedChange={handleSelectTask}
          className="mt-1"
        />

        {/* Task completion checkbox */}
        <Checkbox
          checked={task.completed}
          onCheckedChange={handleToggleComplete}
          className="mt-1"
        />

        {/* Task content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3
                className={cn(
                  "font-medium text-sm leading-5 break-words",
                  task.completed && "line-through text-muted-foreground"
                )}
              >
                {task.title}
              </h3>
              
              {task.description && (
                <p
                  className={cn(
                    "text-sm text-muted-foreground mt-1 line-clamp-2",
                    task.completed && "line-through"
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

                {/* Due date */}
                {task.dueDate && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span
                      className={cn(
                        computedValues.isTaskOverdue && "text-red-600 font-medium",
                        computedValues.isTaskDueToday && "text-yellow-600 font-medium"
                      )}
                    >
                      {computedValues.formattedDate}
                    </span>
                  </div>
                )}

                {/* Tags */}
                {task.tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="secondary"
                    className={cn("text-xs h-5", getTagColor(tag.color))}
                  >
                    {tag.name}
                  </Badge>
                ))}
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
