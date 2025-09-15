import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | null): string {
  if (!date) return ''
  
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function isToday(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  return d.toDateString() === today.toDateString()
}

export function isOverdue(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  d.setHours(0, 0, 0, 0)
  return d < today
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function getPriorityLabel(priority: number): string {
  switch (priority) {
    case 1: return 'High'
    case 2: return 'Medium'
    case 3: return 'Low'
    default: return 'Medium'
  }
}

export function getPriorityColor(priority: number): string {
  switch (priority) {
    case 1: return 'red'
    case 2: return 'yellow'
    case 3: return 'green'
    default: return 'yellow'
  }
}

export function getTagColor(color: string): string {
  const colorMap: Record<string, string> = {
    red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    amber: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    lime: 'bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200',
    green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    emerald: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    teal: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
    cyan: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
    sky: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200',
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    indigo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    violet: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200',
    purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    fuchsia: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900 dark:text-fuchsia-200',
    pink: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    rose: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200',
    slate: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200',
  }
  
  return colorMap[color] || colorMap.slate
}

// Deadline Pressure Mode: Calculate urgency level based on due date
export function getDeadlinePressure(dueDate?: string) {
  if (!dueDate) return 0
  
  const now = new Date()
  const due = new Date(dueDate)
  const diffHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60)
  
  // Return pressure level (0-4)
  if (diffHours < 0) return 4 // Overdue - maximum pressure
  if (diffHours < 2) return 3 // Less than 2 hours - high pressure
  if (diffHours < 24) return 2 // Less than 1 day - medium pressure  
  if (diffHours < 72) return 1 // Less than 3 days - low pressure
  return 0 // More than 3 days - no pressure
}

// Get deadline pressure styling
export function getDeadlinePressureStyles(pressureLevel: number, isCompleted: boolean = false) {
  if (isCompleted) return ''
  
  const pressureStyles = {
    0: '', // No pressure
    1: 'border-l-4 border-l-yellow-400 bg-yellow-50/50 dark:border-l-yellow-500 dark:bg-yellow-900/20', // Low pressure - yellow accent
    2: 'border-l-4 border-l-orange-400 bg-orange-50/50 dark:border-l-orange-500 dark:bg-orange-900/20', // Medium pressure - orange accent
    3: 'border-l-4 border-l-red-400 bg-red-50/50 shadow-red-100 dark:border-l-red-500 dark:bg-red-900/20 dark:shadow-red-900/20', // High pressure - red accent
    4: 'border-l-4 border-l-red-600 bg-red-100/80 shadow-lg shadow-red-200 animate-pulse dark:border-l-red-400 dark:bg-red-900/40 dark:shadow-red-900/30' // Overdue - intense red
  }
  
  return pressureStyles[pressureLevel as keyof typeof pressureStyles] || ''
}

// Get time remaining text with urgency
export function getTimeRemainingText(dueDate?: string) {
  if (!dueDate) return ''
  
  const now = new Date()
  const due = new Date(dueDate)
  const diffMs = due.getTime() - now.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  
  if (diffMs < 0) {
    const overdueDays = Math.abs(Math.floor(diffDays))
    const overdueHours = Math.abs(Math.floor(diffHours % 24))
    if (overdueDays > 0) {
      return `${overdueDays}d overdue`
    } else {
      return `${overdueHours}h overdue`
    }
  }
  
  if (diffHours < 1) {
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    return `${minutes}m left`
  } else if (diffHours < 24) {
    return `${Math.floor(diffHours)}h left`
  } else {
    return `${Math.floor(diffDays)}d left`
  }
}