import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Filter, X } from 'lucide-react'
import { useFilters } from '@/store'

export function TaskFilters() {
  const { filters, setFilters, resetFilters } = useFilters()

  const hasActiveFilters = filters.completed !== null || filters.priority !== null || filters.tag !== null

  const handleClearFilters = () => {
    resetFilters()
  }

  const handleToggleCompleted = () => {
    setFilters({
      completed: filters.completed === true ? null : true
    })
  }

  const handleSetPriority = (priority: number | null) => {
    setFilters({ priority })
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <Filter className="h-4 w-4" />
        <span>Filters:</span>
      </div>

      {/* Completed filter */}
      <Button
        variant={filters.completed === true ? "default" : "outline"}
        size="sm"
        onClick={handleToggleCompleted}
      >
        Completed Only
      </Button>

      {/* Priority filters */}
      <Button
        variant={filters.priority === 1 ? "default" : "outline"}
        size="sm"
        onClick={() => handleSetPriority(filters.priority === 1 ? null : 1)}
      >
        High Priority
      </Button>

      <Button
        variant={filters.priority === 2 ? "default" : "outline"}
        size="sm"
        onClick={() => handleSetPriority(filters.priority === 2 ? null : 2)}
      >
        Medium Priority
      </Button>

      <Button
        variant={filters.priority === 3 ? "default" : "outline"}
        size="sm"
        onClick={() => handleSetPriority(filters.priority === 3 ? null : 3)}
      >
        Low Priority
      </Button>

      {/* Clear filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearFilters}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4 mr-1" />
          Clear Filters
        </Button>
      )}
    </div>
  )
}
