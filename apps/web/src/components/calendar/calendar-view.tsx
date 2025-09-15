import React, { useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, AlertTriangle } from 'lucide-react'
import { useTasks } from '@/hooks/use-tasks'
import { cn, getDeadlinePressure } from '@/lib/utils'
import { Task } from '@/types'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns'

interface CalendarViewProps {
  onTaskClick?: (task: Task) => void
}

export function CalendarView({ onTaskClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const { data: tasksResponse } = useTasks({ completed: false })
  
  const tasks = useMemo(() => tasksResponse?.data || [], [tasksResponse?.data])
  
  // Group tasks by date
  const tasksByDate = useMemo(() => {
    const grouped: Record<string, Task[]> = {}
    
    tasks.forEach(task => {
      if (task.dueDate && task.title?.trim()) { // Only include tasks with valid title
        const dateKey = format(new Date(task.dueDate), 'yyyy-MM-dd')
        if (!grouped[dateKey]) {
          grouped[dateKey] = []
        }
        grouped[dateKey].push(task)
      }
    })
    
    return grouped
  }, [tasks])
  
  // Detect deadline collisions (multiple tasks on same day)
  const collisions = useMemo(() => {
    const collisionDates: Record<string, Task[]> = {}
    
    Object.entries(tasksByDate).forEach(([date, dateTasks]) => {
      // Only consider it a collision if there are genuinely multiple different tasks
      const validTasks = dateTasks.filter(task => task.title?.trim())
      // Remove duplicate tasks by ID to avoid false collisions
      const uniqueTasks = validTasks.filter((task, index, arr) => 
        arr.findIndex(t => t.id === task.id) === index
      )
      
      if (uniqueTasks.length > 1) {
        collisionDates[date] = uniqueTasks
      }
    })
    return collisionDates
  }, [tasksByDate])
  
  // Calendar grid
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)
  
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  })
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1))
  }
  
  const renderDayTasks = (dayTasks: Task[], hasCollision: boolean) => {
    if (dayTasks.length === 0) return null
    
    return (
      <div className="mt-1 space-y-1 max-h-20 overflow-y-auto">
        {hasCollision && (
          <div className="flex items-center gap-1 text-xs text-red-600">
            <AlertTriangle className="h-3 w-3" />
            <span className="font-medium">Collision!</span>
          </div>
        )}
        {dayTasks.slice(0, 3).map(task => {
          const pressure = getDeadlinePressure(task.dueDate)
          return (
            <div
              key={task.id}
              onClick={() => onTaskClick?.(task)}
              className={cn(
                "text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity truncate",
                pressure >= 3 && "bg-red-100 text-red-800 border border-red-200",
                pressure === 2 && "bg-orange-100 text-orange-800 border border-orange-200",
                pressure === 1 && "bg-yellow-100 text-yellow-800 border border-yellow-200",
                pressure === 0 && "bg-blue-100 text-blue-800 border border-blue-200"
              )}
              title={task.title}
            >
              {task.title}
            </div>
          )
        })}
        {dayTasks.length > 3 && (
          <div className="text-xs text-muted-foreground">
            +{dayTasks.length - 3} more
          </div>
        )}
      </div>
    )
  }
  
  return (
    <div className="h-full flex flex-col pt-4">
      <Card className="p-6 flex-1 flex flex-col min-h-0 mt-2">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            <h2 className="text-lg font-semibold">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Collision Summary */}
        {Object.keys(collisions).length > 0 && Object.values(collisions).some(tasks => tasks.length > 1) && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex-shrink-0">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">
                {Object.keys(collisions).length} deadline collision(s) detected
              </span>
            </div>
            <div className="mt-2 text-sm text-red-700">
              Multiple tasks due on the same day. Consider rescheduling some tasks.
            </div>
          </div>
        )}
        
        {/* Scrollable Calendar Container */}
        <div className="flex-1 overflow-auto min-h-0">
          <div className="grid grid-cols-7 gap-1 min-h-full">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div
                key={day}
                className="p-2 text-center text-sm font-medium text-muted-foreground sticky top-0 bg-background border-b border-border z-10"
              >
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {calendarDays.map(day => {
              const dateKey = format(day, 'yyyy-MM-dd')
              const isCurrentMonth = day.getMonth() === currentDate.getMonth()
              const dayTasks = tasksByDate[dateKey] || []
              const hasCollision = !!collisions[dateKey]
              
              return (
                <div
                  key={day.toString()}
                  className={cn(
                    "min-h-[120px] p-2 border border-border transition-colors",
                    !isCurrentMonth && "bg-muted/50 text-muted-foreground",
                    isToday(day) && "bg-primary/10 border-primary",
                    hasCollision && "bg-red-50 border-red-200"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={cn(
                        "text-sm",
                        isToday(day) && "font-bold text-primary",
                        hasCollision && "text-red-600"
                      )}
                    >
                      {format(day, 'd')}
                    </span>
                    {dayTasks.length > 0 && (
                      <Badge
                        variant={hasCollision ? "destructive" : "secondary"}
                        className="h-5 text-xs"
                      >
                        {dayTasks.length}
                      </Badge>
                    )}
                  </div>
                  {renderDayTasks(dayTasks, hasCollision)}
                </div>
              )
            })}
          </div>
        </div>
      </Card>
    </div>
  )
}
