import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Clock, Tag, Calendar, Plus, Search } from 'lucide-react'
import { 
  taskTemplates, 
  getTemplatesByCategory, 
  getTemplateCategories,
  type TaskTemplate 
} from '@/data/task-templates'
import { useCreateTask } from '@/hooks/use-tasks'
import { addDays } from 'date-fns'

interface TaskTemplatesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TaskTemplatesModal({ open, onOpenChange }: TaskTemplatesModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const createTask = useCreateTask()

  const categories = getTemplateCategories()
  
  const filteredTemplates = taskTemplates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    const matchesSearch = searchTerm === '' || 
      template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.suggestedTags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const handleUseTemplate = async (template: TaskTemplate) => {
    const dueDate = template.dueInDays !== undefined 
      ? addDays(new Date(), template.dueInDays).toISOString()
      : new Date().toISOString() // Default to today if no specific date

    await createTask.mutateAsync({
      title: template.title,
      description: template.description,
      priority: template.priority,
      dueDate,
      tags: template.suggestedTags,
    })
    
    onOpenChange(false)
  }

  const getCategoryIcon = (category: TaskTemplate['category']) => {
    switch (category) {
      case 'work': return '💼'
      case 'personal': return '👤'
      case 'health': return '🏥'
      case 'learning': return '📚'
      case 'home': return '🏠'
      default: return '📋'
    }
  }

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'destructive'
      case 2: return 'default'
      case 3: return 'secondary'
      default: return 'secondary'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Task Templates</DialogTitle>
        </DialogHeader>
        
        <div className="flex gap-4 mb-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Category filters */}
          <div className="flex gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              All
            </Button>
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="capitalize"
              >
                {getCategoryIcon(category)} {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Templates grid */}
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTemplates.map(template => (
              <Card key={template.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{getCategoryIcon(template.category)}</span>
                      <h3 className="font-medium text-sm leading-tight">{template.title}</h3>
                      <Badge variant={getPriorityColor(template.priority) as any} className="text-xs">
                        P{template.priority}
                      </Badge>
                    </div>
                    
                    {template.description && (
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {template.description}
                      </p>
                    )}
                    
                    {/* Metadata */}
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-3">
                      {template.estimatedDuration && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {template.estimatedDuration}
                        </div>
                      )}
                      {template.dueInDays !== undefined && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {template.dueInDays === 0 ? 'Today' : 
                           template.dueInDays === 1 ? 'Tomorrow' : 
                           `In ${template.dueInDays} days`}
                        </div>
                      )}
                    </div>
                    
                    {/* Tags */}
                    {template.suggestedTags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {template.suggestedTags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
                            <Tag className="h-2 w-2 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                        {template.suggestedTags.length > 3 && (
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            +{template.suggestedTags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => handleUseTemplate(template)}
                  disabled={createTask.isPending}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Use Template
                </Button>
              </Card>
            ))}
          </div>
          
          {filteredTemplates.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No templates found matching your criteria.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
