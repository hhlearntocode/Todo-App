import React, { useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  Clock, 
  Target, 
  TrendingUp, 
  AlertCircle,
  Calendar,
  Zap,
  Brain,
  Bell,
  Lightbulb,
  Timer,
  Filter,
  TrendingDown
} from 'lucide-react'
import { useTasks } from '@/hooks/use-tasks'
import { useQuery } from '@tanstack/react-query'
import { tasksApi } from '@/lib/api'
import { Task } from '@/types'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isWithinInterval, parseISO, differenceInDays, addDays, subDays } from 'date-fns'

type TimeRange = '7d' | '30d' | '90d'

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')
  
  // Get all tasks for comprehensive analytics
  const { data: allTasksResponse } = useQuery({
    queryKey: ['tasks-analytics'],
    queryFn: () => tasksApi.getTasks({}),
  })
  
  const allTasks = useMemo(() => allTasksResponse?.data || [], [allTasksResponse?.data])
  
  // Dummy chart data - sẵn sàng để thay thế bằng real data
  const dummyData = useMemo(() => {
    const getTimeRangeLabel = () => {
      switch(timeRange) {
        case '7d': return 'Past 7 days'
        case '30d': return 'Past 30 days' 
        case '90d': return 'Past 90 days'
        default: return 'Past 30 days'
      }
    }
    
    return {
      timeRangeLabel: getTimeRangeLabel(),
      dailyCompletions: timeRange === '7d' 
        ? [3, 5, 2, 8, 4, 6, 7]
        : timeRange === '30d'
        ? [4, 6, 3, 8, 5, 7, 9, 4, 6, 3, 8, 5, 7, 9, 4, 6, 3, 8, 5, 7, 9, 4, 6, 3, 8, 5, 7, 9, 4, 6]
        : Array.from({length: 90}, (_, i) => Math.floor(Math.random() * 10) + 1),
      
      hourlyProductivity: [
        { hour: '6AM', tasks: 1 },
        { hour: '7AM', tasks: 2 },
        { hour: '8AM', tasks: 3 },
        { hour: '9AM', tasks: 7 },
        { hour: '10AM', tasks: 9 },
        { hour: '11AM', tasks: 8 },
        { hour: '12PM', tasks: 5 },
        { hour: '1PM', tasks: 4 },
        { hour: '2PM', tasks: 6 },
        { hour: '3PM', tasks: 8 },
        { hour: '4PM', tasks: 7 },
        { hour: '5PM', tasks: 3 },
        { hour: '6PM', tasks: 2 },
        { hour: '7PM', tasks: 1 },
      ]
    }
  }, [timeRange])
  
  // Enhanced analytics calculations
  const analytics = useMemo(() => {
    const now = new Date()
    const weekStart = startOfWeek(now)
    const weekEnd = endOfWeek(now)
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })
    
    // Completion analytics
    const completedTasks = allTasks.filter(task => task.completed)
    const pendingTasks = allTasks.filter(task => !task.completed)
    const overdueTasks = pendingTasks.filter(task => 
      task.dueDate && new Date(task.dueDate) < now
    )
    
    // Time tracking analytics
    const tasksWithTimeTracking = allTasks.filter(task => 
      task.estimatedMinutes && task.actualMinutes
    )
    
    const timeAccuracy = tasksWithTimeTracking.length > 0 
      ? tasksWithTimeTracking.reduce((acc, task) => {
          const accuracy = 1 - Math.abs(task.actualMinutes! - task.estimatedMinutes!) / task.estimatedMinutes!
          return acc + Math.max(0, accuracy)
        }, 0) / tasksWithTimeTracking.length
      : 0
    
    // Weekly completion pattern
    const weeklyPattern = weekDays.map(day => {
      const dayTasks = completedTasks.filter(task => {
        if (!task.completedAt) return false
        const completedDate = parseISO(task.completedAt)
        return format(completedDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      })
      return {
        day: format(day, 'EEE'),
        count: dayTasks.length,
        isToday: format(day, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd')
      }
    })
    
    // Priority distribution
    const priorityStats = {
      high: allTasks.filter(task => task.priority === 1).length,
      medium: allTasks.filter(task => task.priority === 2).length,
      low: allTasks.filter(task => task.priority === 3).length,
    }
    
    // Enhanced procrastination analysis
    const procrastinationScore = overdueTasks.length / Math.max(pendingTasks.length, 1)
    const averageCompletionDelay = completedTasks
      .filter(task => task.dueDate && task.completedAt)
      .reduce((acc, task) => {
        const due = new Date(task.dueDate!)
        const completed = new Date(task.completedAt!)
        const delay = differenceInDays(completed, due)
        return acc + delay
      }, 0) / Math.max(completedTasks.filter(t => t.dueDate && t.completedAt).length, 1)

    // Procrastination patterns analysis
    const procrastinationPatterns = {
      lateStartPattern: completedTasks.filter(task => {
        if (!task.dueDate || !task.startedAt) return false
        const due = new Date(task.dueDate)
        const started = new Date(task.startedAt)
        return differenceInDays(due, started) <= 1 // Started within 1 day of deadline
      }).length,
      
      lastMinuteRush: completedTasks.filter(task => {
        if (!task.dueDate || !task.completedAt || !task.startedAt) return false
        const due = new Date(task.dueDate)
        const started = new Date(task.startedAt)
        const completed = new Date(task.completedAt)
        const totalTime = differenceInDays(due, started)
        const workTime = differenceInDays(completed, started)
        return totalTime > 3 && workTime <= 1 // Had >3 days but worked only 1 day
      }).length,
      
      consistentDelays: completedTasks.filter(task => {
        if (!task.dueDate || !task.completedAt) return false
        const due = new Date(task.dueDate)
        const completed = new Date(task.completedAt)
        return differenceInDays(completed, due) > 0 // Completed after deadline
      }).length
    }
    
    // Productivity time analysis based on completion times
    const productivityTimes = completedTasks
      .filter(task => task.completedAt)
      .reduce((acc, task) => {
        const hour = new Date(task.completedAt!).getHours()
        acc[hour] = (acc[hour] || 0) + 1
        return acc
      }, {} as Record<number, number>)
    
    const bestWorkTimes = Object.entries(productivityTimes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 4)
      .map(([hour, count]) => ({
        time: `${hour}:00-${parseInt(hour) + 1}:00`,
        productivity: Math.min(100, (count / Math.max(...Object.values(productivityTimes), 1)) * 100),
        taskCount: count
      }))
    
    // Smart deadline suggestions based on historical data
    const averageTaskDuration = tasksWithTimeTracking.length > 0
      ? tasksWithTimeTracking.reduce((acc, task) => acc + (task.actualMinutes || 0), 0) / tasksWithTimeTracking.length
      : 120 // Default 2 hours
    
    const bufferMultiplier = 1 + (procrastinationScore * 0.5) // Add buffer based on procrastination
    const suggestedBuffer = Math.ceil(averageTaskDuration * bufferMultiplier / 60 / 24) // Convert to days
    
    // Smart notifications based on completion history
    const notificationInsights = {
      optimalReminderTime: Math.max(1, Math.ceil(suggestedBuffer * 0.6)), // 60% of buffer time
      urgentThreshold: Math.max(1, Math.ceil(suggestedBuffer * 0.3)), // 30% of buffer time
      riskFactors: {
        highProcrastination: procrastinationScore > 0.3,
        poorTimeEstimation: timeAccuracy < 0.5,
        frequentOverdue: overdueTasks.length > 3
      }
    }
    
    return {
      totalTasks: allTasks.length,
      completedTasks: completedTasks.length,
      pendingTasks: pendingTasks.length,
      overdueTasks: overdueTasks.length,
      completionRate: allTasks.length > 0 ? (completedTasks.length / allTasks.length) * 100 : 0,
      timeAccuracy: timeAccuracy * 100,
      procrastinationScore: procrastinationScore * 100,
      averageCompletionDelay,
      weeklyPattern,
      priorityStats,
      bestWorkTimes,
      tasksWithTimeTracking: tasksWithTimeTracking.length,
      procrastinationPatterns,
      suggestedBuffer,
      notificationInsights,
      averageTaskDuration
    }
  }, [allTasks])
  
  return (
    <div className="space-y-6">
      {/* Header with Time Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Track your productivity patterns and insights</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <div className="flex bg-muted rounded-lg p-1">
            {(['7d', '30d', '90d'] as TimeRange[]).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "ghost"}
                size="sm"
                onClick={() => setTimeRange(range)}
                className="h-8"
              >
                {range === '7d' && 'Past 7 days'}
                {range === '30d' && 'Past 30 days'}
                {range === '90d' && 'Past 90 days'}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-600" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Completion Rate</p>
              <p className="text-2xl font-bold">{analytics.completionRate.toFixed(1)}%</p>
            </div>
          </div>
          <Progress value={analytics.completionRate} className="mt-2" />
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-green-600" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Time Accuracy</p>
              <p className="text-2xl font-bold">{analytics.timeAccuracy.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">
                {analytics.tasksWithTimeTracking} tasks tracked
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Procrastination</p>
              <p className="text-2xl font-bold">{analytics.procrastinationScore.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">
                {analytics.overdueTasks} overdue tasks
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-purple-600" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Avg Delay</p>
              <p className="text-2xl font-bold">
                {analytics.averageCompletionDelay > 0 ? '+' : ''}
                {analytics.averageCompletionDelay.toFixed(1)}d
              </p>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Task Completions Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Daily Completions</h3>
            </div>
            <Badge variant="outline">{dummyData.timeRangeLabel}</Badge>
          </div>
          <div className="h-64 flex items-end justify-between gap-1">
            {dummyData.dailyCompletions.slice(0, timeRange === '7d' ? 7 : timeRange === '30d' ? 15 : 30).map((count, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-1">
                <div 
                  className="w-full bg-primary rounded-t transition-all hover:bg-primary/80"
                  style={{ 
                    height: `${Math.max((count / Math.max(...dummyData.dailyCompletions)) * 100, 8)}%`,
                    minHeight: '8px'
                  }}
                />
                <span className="text-xs text-muted-foreground">
                  {timeRange === '7d' ? ['S', 'M', 'T', 'W', 'T', 'F', 'S'][index] : index + 1}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>Tasks completed over time</span>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-green-600">+12% vs last period</span>
            </div>
          </div>
        </Card>

        {/* Hourly Productivity Chart */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Hourly Productivity</h3>
          </div>
          <div className="h-64 flex items-end justify-between gap-1">
            {dummyData.hourlyProductivity.map((hour, index) => (
              <div key={hour.hour} className="flex-1 flex flex-col items-center gap-1">
                <div 
                  className={`w-full rounded-t transition-all ${
                    hour.tasks >= 7 ? 'bg-green-500' : 
                    hour.tasks >= 4 ? 'bg-yellow-500' : 'bg-muted'
                  }`}
                  style={{ 
                    height: `${Math.max((hour.tasks / 10) * 100, 8)}%`,
                    minHeight: '8px'
                  }}
                />
                <span className="text-xs text-muted-foreground transform -rotate-45 origin-center">
                  {hour.hour}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            <span>Peak hours: 9-11 AM, 2-4 PM</span>
          </div>
        </Card>
      </div>
      
      {/* Weekly Pattern */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Weekly Completion Pattern</h3>
        </div>
        <div className="flex justify-between items-end h-32 gap-2">
          {analytics.weeklyPattern.map((day, index) => (
            <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
              <div 
                className={`w-full rounded-t transition-all ${
                  day.isToday ? 'bg-primary' : 'bg-muted'
                }`}
                style={{ 
                  height: `${Math.max((day.count / Math.max(...analytics.weeklyPattern.map(d => d.count), 1)) * 100, 8)}%` 
                }}
              />
              <span className="text-xs text-muted-foreground">{day.day}</span>
              <span className="text-xs font-medium">{day.count}</span>
            </div>
          ))}
        </div>
      </Card>
      
      {/* Priority Distribution & Best Work Times */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Priority Distribution</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded" />
                <span className="text-sm">High Priority</span>
              </div>
              <Badge variant="destructive">{analytics.priorityStats.high}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded" />
                <span className="text-sm">Medium Priority</span>
              </div>
              <Badge variant="secondary">{analytics.priorityStats.medium}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded" />
                <span className="text-sm">Low Priority</span>
              </div>
              <Badge variant="outline">{analytics.priorityStats.low}</Badge>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Productivity Hours</h3>
          </div>
          <div className="space-y-3">
            {analytics.bestWorkTimes.map((time, index) => (
              <div key={time.time} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{time.time}</span>
                  <span className="font-medium">{time.productivity}%</span>
                </div>
                <Progress value={time.productivity} className="h-2" />
              </div>
            ))}
          </div>
        </Card>
      </div>
      
      {/* Procrastination Learning & Smart Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Procrastination Patterns</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Late Start Pattern</span>
              <Badge variant="secondary">{analytics.procrastinationPatterns.lateStartPattern} tasks</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Last Minute Rush</span>
              <Badge variant="secondary">{analytics.procrastinationPatterns.lastMinuteRush} tasks</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Consistent Delays</span>
              <Badge variant="destructive">{analytics.procrastinationPatterns.consistentDelays} tasks</Badge>
            </div>
            {analytics.procrastinationPatterns.consistentDelays > 3 && (
              <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-800">
                  💡 You tend to miss deadlines. Consider setting personal deadlines 2-3 days earlier.
                </p>
              </div>
            )}
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Smart Notifications</h3>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Based on your completion history:</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800 font-medium">
                  📅 Optimal reminder: {analytics.notificationInsights.optimalReminderTime} days before deadline
                </p>
                <p className="text-sm text-blue-700">
                  ⚠️ Urgent threshold: {analytics.notificationInsights.urgentThreshold} days before deadline
                </p>
              </div>
            </div>
            
            {analytics.notificationInsights.riskFactors.highProcrastination && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">🚨 High procrastination risk detected - extra reminders recommended</p>
              </div>
            )}
            
            {analytics.notificationInsights.riskFactors.poorTimeEstimation && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">⏱️ Time estimation needs improvement - add 50% buffer</p>
              </div>
            )}
          </div>
        </Card>
      </div>
      
      {/* Deadline Suggestions */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Smart Deadline Suggestions</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium text-blue-600">📋 For New Tasks</h4>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Average task duration:</span> {Math.round(analytics.averageTaskDuration)} minutes
                </p>
                <p className="text-sm">
                  <span className="font-medium">Recommended buffer:</span> {analytics.suggestedBuffer} days
                </p>
                <p className="text-xs text-blue-700 mt-2">
                  💡 Set personal deadlines {analytics.suggestedBuffer} days before official deadlines
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-green-600">🎯 Realistic vs Official</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Official deadline:</span>
                <span className="font-mono">Dec 25, 2024</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Personal deadline:</span>
                <span className="font-mono text-green-600">Dec {25 - analytics.suggestedBuffer}, 2024</span>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Based on your procrastination score: {analytics.procrastinationScore.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Insights & Recommendations */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">📊 Insights & Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-green-600">✅ Strengths</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {analytics.completionRate > 70 && (
                <li>• High completion rate - you're consistent!</li>
              )}
              {analytics.timeAccuracy > 60 && (
                <li>• Good time estimation skills</li>
              )}
              {analytics.procrastinationScore < 20 && (
                <li>• Low procrastination - great discipline!</li>
              )}
              {analytics.bestWorkTimes.length > 0 && (
                <li>• Peak productivity: {analytics.bestWorkTimes[0]?.time}</li>
              )}
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-orange-600">🎯 Areas to Improve</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {analytics.procrastinationScore > 30 && (
                <li>• Consider breaking large tasks into smaller ones</li>
              )}
              {analytics.timeAccuracy < 50 && (
                <li>• Improve time estimation with more tracking</li>
              )}
              {analytics.overdueTasks > 5 && (
                <li>• Schedule buffer time for unexpected delays</li>
              )}
              {analytics.priorityStats.high > analytics.priorityStats.medium + analytics.priorityStats.low && (
                <li>• Balance high-priority tasks to avoid burnout</li>
              )}
              {analytics.procrastinationPatterns.lastMinuteRush > 3 && (
                <li>• Start tasks earlier to avoid last-minute stress</li>
              )}
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}
