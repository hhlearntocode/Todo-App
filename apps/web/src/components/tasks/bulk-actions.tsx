import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Trash2, Flag, Tag, X, CheckSquare, Square } from 'lucide-react'
import { useSelection } from '@/store'
import { useBulkAction, useTasks } from '@/hooks/use-tasks'

export function BulkActions() {
  const { selectedTasks, clearSelection, setSelectedTasks } = useSelection()
  const bulkAction = useBulkAction()
  const { data: tasksResponse } = useTasks()

  const selectedCount = selectedTasks.length
  const allTasks = tasksResponse?.data || []
  const allTaskIds = allTasks.map(task => task.id)
  const isAllSelected = allTasks.length > 0 && selectedTasks.length === allTasks.length

  const handleBulkAction = async (action: 'complete' | 'incomplete' | 'delete' | 'setPriority') => {
    await bulkAction.mutateAsync({
      action,
      ids: selectedTasks,
      ...(action === 'setPriority' && { priority: 1 })
    })
    clearSelection()
  }

  const handleSelectAll = () => {
    if (isAllSelected) {
      clearSelection()
    } else {
      setSelectedTasks(allTaskIds)
    }
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {selectedCount} task{selectedCount !== 1 ? 's' : ''} selected
          </Badge>
          
          {/* Select All / Deselect All */}
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSelectAll}
            className="h-8 px-2"
          >
            {isAllSelected ? (
              <>
                <CheckSquare className="h-4 w-4 mr-1" />
                Deselect All
              </>
            ) : (
              <>
                <Square className="h-4 w-4 mr-1" />
                Select All ({allTasks.length})
              </>
            )}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleBulkAction('complete')}
            disabled={bulkAction.isPending}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Complete
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => handleBulkAction('incomplete')}
            disabled={bulkAction.isPending}
          >
            <XCircle className="h-4 w-4 mr-1" />
            Incomplete
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => handleBulkAction('setPriority')}
            disabled={bulkAction.isPending}
          >
            <Flag className="h-4 w-4 mr-1" />
            High Priority
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => handleBulkAction('delete')}
            disabled={bulkAction.isPending}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={clearSelection}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
