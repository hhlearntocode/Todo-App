import { z } from 'zod';

// Accept both string and number inputs and coerce to a number between 1 and 3
export const prioritySchema = z.coerce.number().int().min(1).max(3);

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title too long'),
  description: z.string().max(2000, 'Description too long').optional(),
  priority: prioritySchema.optional().default(2),
  dueDate: z.string().datetime().optional().or(z.date().optional()),
  tags: z.array(z.string()).optional().default([]),
});

export const updateTaskSchema = createTaskSchema.partial();

export const taskQuerySchema = z.object({
  q: z.string().optional(),
  completed: z.enum(['true', 'false']).optional().transform(val => val === 'true'),
  priority: prioritySchema.optional(),
  tag: z.string().optional(),
  sortBy: z.enum(['createdAt', 'dueDate', 'priority', 'orderIndex']).optional().default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z.coerce.number().min(1).optional().default(1),
  pageSize: z.coerce.number().min(1).max(100).optional().default(20),
});

export const bulkActionSchema = z.object({
  action: z.enum(['complete', 'incomplete', 'delete', 'setPriority', 'setTags']),
  ids: z.array(z.string()).min(1, 'At least one task ID is required'),
  priority: prioritySchema.optional(),
  tags: z.array(z.string()).optional(),
});

export const reorderTasksSchema = z.array(
  z.object({
    id: z.string(),
    orderIndex: z.number(),
  })
).min(1, 'At least one task is required');

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskQuery = z.infer<typeof taskQuerySchema>;
export type BulkActionInput = z.infer<typeof bulkActionSchema>;
export type ReorderTasksInput = z.infer<typeof reorderTasksSchema>;
