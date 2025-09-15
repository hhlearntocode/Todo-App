import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { tasksApi } from '@/lib/api'

export function TaskStats() {
  // Get all tasks for stats (not filtered by current view)
  const { data: tasksResponse, isLoading, error } = useQuery({
    queryKey: ['tasks-stats'],
    queryFn: () => tasksApi.getTasks({}),
  })
  const tasks = tasksResponse?.data || []

  const totalTasks = tasks.length
  const completedTasks = tasks.filter(task => task.completed).length
  const pendingTasks = totalTasks - completedTasks
  const highPriorityTasks = tasks.filter(task => task.priority === 1 && !task.completed).length

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  if (isLoading) {
    return (
      <div className="flex gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-3">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-muted rounded animate-pulse" />
              <div className="h-4 w-16 bg-muted rounded animate-pulse" />
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="flex gap-4">
      <Card className="p-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{pendingTasks} Pending</span>
        </div>
      </Card>

      <Card className="p-3">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium">{completedTasks} Completed</span>
        </div>
      </Card>

      <Card className="p-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <span className="text-sm font-medium">{highPriorityTasks} High Priority</span>
        </div>
      </Card>

      {totalTasks > 0 && (
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <Badge variant={completionRate >= 70 ? "default" : "secondary"}>
              {completionRate}% Complete
            </Badge>
          </div>
        </Card>
      )}
    </div>
  )
}
