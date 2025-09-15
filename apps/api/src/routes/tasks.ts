import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { 
  createTaskSchema, 
  updateTaskSchema, 
  taskQuerySchema, 
  bulkActionSchema, 
  reorderTasksSchema,
  type CreateTaskInput,
  type UpdateTaskInput,
  type TaskQuery,
  type BulkActionInput,
  type ReorderTasksInput
} from '../schemas/task.js';

export async function taskRoutes(fastify: FastifyInstance) {
  // GET /api/v1/tasks - List tasks with filtering, sorting, and pagination
  fastify.get('/tasks', async (request: FastifyRequest<{ Querystring: TaskQuery }>, reply: FastifyReply) => {
    const query = taskQuerySchema.parse(request.query);
    
    const where: any = {};
    
    // Search filter (SQLite case-insensitive search)
    if (query.q) {
      where.OR = [
        { title: { contains: query.q } },
        { description: { contains: query.q } }
      ];
    }
    
    // Completed filter
    if (query.completed !== undefined) {
      where.completed = query.completed;
    }
    
    // Priority filter
    if (query.priority) {
      where.priority = query.priority;
    }
    
    // Tag filter
    if (query.tag) {
      where.tags = {
        some: {
          tag: {
            name: query.tag
          }
        }
      };
    }
    
    // Count total for pagination
    const total = await fastify.prisma.task.count({ where });
    
    // Calculate pagination
    const offset = (query.page - 1) * query.pageSize;
    const totalPages = Math.ceil(total / query.pageSize);
    
    // Sort configuration - always include orderIndex for consistent ordering
    const orderBy: any = [
      { orderIndex: 'asc' }, // Primary sort by order index for drag & drop
    ];
    
    // Add secondary sort if different from orderIndex
    if (query.sortBy !== 'orderIndex') {
      orderBy.push({ [query.sortBy]: query.order });
    }
    
    // Fetch tasks
    const tasks = await fastify.prisma.task.findMany({
      where,
      orderBy,
      skip: offset,
      take: query.pageSize,
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    });
    
    // Transform response
    const transformedTasks = tasks.map(task => ({
      ...task,
      tags: task.tags.map(tt => tt.tag)
    }));
    
    return {
      data: transformedTasks,
      meta: {
        pagination: {
          page: query.page,
          pageSize: query.pageSize,
          total,
          totalPages,
          hasNext: query.page < totalPages,
          hasPrev: query.page > 1
        }
      }
    };
  });
  
  // GET /api/v1/tasks/:id - Get single task
  fastify.get('/tasks/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const task = await fastify.prisma.task.findUnique({
      where: { id: request.params.id },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    });
    
    if (!task) {
      reply.status(404).send({ error: 'Task not found' });
      return;
    }
    
    return {
      data: {
        ...task,
        tags: task.tags.map(tt => tt.tag)
      }
    };
  });
  
  // POST /api/v1/tasks - Create new task
  fastify.post('/tasks', async (request: FastifyRequest<{ Body: CreateTaskInput }>, reply: FastifyReply) => {
    const data = createTaskSchema.parse(request.body);
    
    // Get the highest orderIndex to append to the end
    const lastTask = await fastify.prisma.task.findFirst({
      orderBy: { orderIndex: 'desc' }
    });
    
    const orderIndex = (lastTask?.orderIndex ?? 0) + 1;
    
    const task = await fastify.prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        orderIndex,
        tags: {
          create: data.tags?.map(tagName => ({
            tag: {
              connectOrCreate: {
                where: { name: tagName },
                create: { name: tagName, color: 'slate' }
              }
            }
          })) || []
        }
      },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    });
    
    reply.status(201);
    return {
      data: {
        ...task,
        tags: task.tags.map(tt => tt.tag)
      }
    };
  });
  
  // PATCH /api/v1/tasks/:id - Update task
  fastify.patch('/tasks/:id', async (request: FastifyRequest<{ Params: { id: string }, Body: UpdateTaskInput }>, reply: FastifyReply) => {
    const data = updateTaskSchema.parse(request.body);
    
    // Check if task exists
    const existingTask = await fastify.prisma.task.findUnique({
      where: { id: request.params.id }
    });
    
    if (!existingTask) {
      reply.status(404).send({ error: 'Task not found' });
      return;
    }
    
    // Update task with tags
    const task = await fastify.prisma.task.update({
      where: { id: request.params.id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.priority && { priority: data.priority }),
        ...(data.dueDate !== undefined && { dueDate: data.dueDate ? new Date(data.dueDate) : null }),
        ...(data.tags && {
          tags: {
            deleteMany: {},
            create: data.tags.map(tagName => ({
              tag: {
                connectOrCreate: {
                  where: { name: tagName },
                  create: { name: tagName, color: 'slate' }
                }
              }
            }))
          }
        })
      },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    });
    
    return {
      data: {
        ...task,
        tags: task.tags.map(tt => tt.tag)
      }
    };
  });
  
  // PATCH /api/v1/tasks/:id/toggle - Toggle task completion
  fastify.patch('/tasks/:id/toggle', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const existingTask = await fastify.prisma.task.findUnique({
      where: { id: request.params.id }
    });
    
    if (!existingTask) {
      reply.status(404).send({ error: 'Task not found' });
      return;
    }
    
    const task = await fastify.prisma.task.update({
      where: { id: request.params.id },
      data: { completed: !existingTask.completed },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    });
    
    return {
      data: {
        ...task,
        tags: task.tags.map(tt => tt.tag)
      }
    };
  });
  
  // DELETE /api/v1/tasks/:id - Delete task
  fastify.delete('/tasks/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      await fastify.prisma.task.delete({
        where: { id: request.params.id }
      });
      
      reply.status(204).send();
    } catch (error: any) {
      if (error.code === 'P2025') {
        reply.status(404).send({ error: 'Task not found' });
        return;
      }
      throw error;
    }
  });
  
  // PATCH /api/v1/tasks/reorder - Reorder tasks
  fastify.patch('/tasks/reorder', async (request: FastifyRequest<{ Body: ReorderTasksInput }>, reply: FastifyReply) => {
    const tasks = reorderTasksSchema.parse(request.body);
    
    // Update all tasks in a transaction
    await fastify.prisma.$transaction(
      tasks.map(task => 
        fastify.prisma.task.update({
          where: { id: task.id },
          data: { orderIndex: task.orderIndex }
        })
      )
    );
    
    return { data: { success: true } };
  });
  
  // POST /api/v1/tasks/bulk - Bulk actions
  fastify.post('/tasks/bulk', async (request: FastifyRequest<{ Body: BulkActionInput }>, reply: FastifyReply) => {
    const { action, ids, priority, tags } = bulkActionSchema.parse(request.body);
    
    let updateData: any = {};
    
    switch (action) {
      case 'complete':
        updateData = { completed: true };
        break;
      case 'incomplete':
        updateData = { completed: false };
        break;
      case 'setPriority':
        if (!priority) {
          reply.status(400).send({ error: 'Priority is required for setPriority action' });
          return;
        }
        updateData = { priority };
        break;
      case 'setTags':
        if (!tags) {
          reply.status(400).send({ error: 'Tags are required for setTags action' });
          return;
        }
        // This is more complex, we need to handle tags separately
        break;
      case 'delete':
        await fastify.prisma.task.deleteMany({
          where: { id: { in: ids } }
        });
        return { data: { success: true, deletedCount: ids.length } };
    }
    
    if (action === 'setTags' && tags) {
      // Handle tags update in transaction
      await fastify.prisma.$transaction(async (tx) => {
        // Remove existing tags
        await tx.taskTag.deleteMany({
          where: { taskId: { in: ids } }
        });
        
        // Add new tags
        for (const taskId of ids) {
          for (const tagName of tags) {
            const tag = await tx.tag.upsert({
              where: { name: tagName },
              create: { name: tagName, color: 'slate' },
              update: {}
            });
            
            await tx.taskTag.create({
              data: {
                taskId,
                tagId: tag.id
              }
            });
          }
        }
      });
    } else {
      // Handle other bulk updates
      await fastify.prisma.task.updateMany({
        where: { id: { in: ids } },
        data: updateData
      });
    }
    
    return { data: { success: true, updatedCount: ids.length } };
  });

  // DELETE /api/v1/tasks/completed - Delete all completed tasks
  fastify.delete('/tasks/completed', async (request: FastifyRequest, reply: FastifyReply) => {
    const result = await fastify.prisma.task.deleteMany({
      where: { completed: true }
    });
    
    return { data: { success: true, deletedCount: result.count } };
  });
}
