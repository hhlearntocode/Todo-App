import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tagsApi } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'

export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: () => tagsApi.getTags(),
  })
}

export function useTag(id: string) {
  return useQuery({
    queryKey: ['tags', id],
    queryFn: () => tagsApi.getTag(id),
    enabled: !!id,
  })
}

export function useCreateTag() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: { name: string; color?: string }) => tagsApi.createTag(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      toast({
        title: "Tag created",
        description: `Tag "${response.data.name}" has been created successfully.`,
      })
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error creating tag",
        description: error.message || "Failed to create tag. Please try again.",
      })
    },
  })
}

export function useUpdateTag() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; color?: string } }) => 
      tagsApi.updateTag(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      queryClient.invalidateQueries({ queryKey: ['tags', response.data.id] })
      toast({
        title: "Tag updated",
        description: `Tag "${response.data.name}" has been updated successfully.`,
      })
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error updating tag",
        description: error.message || "Failed to update tag. Please try again.",
      })
    },
  })
}

export function useDeleteTag() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => tagsApi.deleteTag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] }) // Refresh tasks as well
      toast({
        title: "Tag deleted",
        description: "Tag has been deleted successfully.",
      })
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error deleting tag",
        description: error.message || "Failed to delete tag. Please try again.",
      })
    },
  })
}
