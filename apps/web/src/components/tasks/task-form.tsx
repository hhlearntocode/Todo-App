import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { CalendarIcon, Plus, X } from 'lucide-react'
import { useCreateTask, useUpdateTask, useTask } from '@/hooks/use-tasks'
import { useTags } from '@/hooks/use-tags'
import { Task, CreateTaskInput } from '@/types'

interface TaskFormProps {
  taskId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function TaskForm({ taskId, onSuccess, onCancel }: TaskFormProps) {
  const isEditing = !!taskId
  const [formData, setFormData] = useState<CreateTaskInput>({
    title: '',
    description: '',
    priority: 2,
    dueDate: '',
    tags: [],
  })
  const [newTag, setNewTag] = useState('')

  const createTask = useCreateTask()
  const updateTask = useUpdateTask()
  const { data: taskResponse } = useTask(taskId || '')
  const { data: tagsResponse } = useTags()

  const task = taskResponse?.data
  const availableTags = tagsResponse?.data || []

  // Load task data for editing
  useEffect(() => {
    if (task && isEditing) {
      setFormData({
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        tags: task.tags.map(tag => tag.name),
      })
    }
  }, [task, isEditing])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const submitData = {
      ...formData,
      dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
    }

    try {
      if (isEditing && taskId) {
        await updateTask.mutateAsync({ id: taskId, data: submitData })
      } else {
        await createTask.mutateAsync(submitData)
      }
      onSuccess?.()
    } catch (error) {
      // Error is handled in the mutation
    }
  }

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }))
  }

  const handleTagFromSuggestion = (tagName: string) => {
    if (!formData.tags?.includes(tagName)) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagName]
      }))
    }
  }

  const suggestedTags = availableTags.filter(tag => 
    !formData.tags?.includes(tag.name) && 
    tag.name.toLowerCase().includes(newTag.toLowerCase())
  ).slice(0, 5)

  const isLoading = createTask.isPending || updateTask.isPending

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Enter task title..."
          required
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Enter task description..."
          rows={3}
        />
      </div>

      {/* Priority and Due Date */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <select
            id="priority"
            value={formData.priority}
            onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
          >
            <option value={1}>High</option>
            <option value={2}>Medium</option>
            <option value={3}>Low</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dueDate">Due Date</Label>
          <Input
            id="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
          />
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label>Tags</Label>
        
        {/* Selected tags */}
        {formData.tags && formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1">
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Add new tag */}
        <div className="flex gap-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Add a tag..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddTag()
              }
            }}
          />
          <Button type="button" onClick={handleAddTag} size="icon" variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Tag suggestions */}
        {suggestedTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {suggestedTags.map((tag) => (
              <Button
                key={tag.id}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleTagFromSuggestion(tag.name)}
                className="h-6 text-xs"
              >
                {tag.name}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || !formData.title.trim()}>
          {isLoading ? 'Saving...' : isEditing ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  )
}
