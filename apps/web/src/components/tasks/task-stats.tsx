import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import { useTasks } from '@/hooks/use-tasks'

export function TaskStats() {
  const { data: tasksResponse } = useTasks()
  const tasks = tasksResponse?.data || []

  const totalTasks = tasks.length
  const completedTasks = tasks.filter(task => task.completed).length
  const pendingTasks = totalTasks - completedTasks
  const highPriorityTasks = tasks.filter(task => task.priority === 1 && !task.completed).length

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

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
