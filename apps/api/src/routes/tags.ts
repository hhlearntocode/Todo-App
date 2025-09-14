import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { 
  createTagSchema, 
  updateTagSchema,
  type CreateTagInput,
  type UpdateTagInput
} from '../schemas/tag.js';

export async function tagRoutes(fastify: FastifyInstance) {
  // GET /api/v1/tags - List all tags
  fastify.get('/tags', async () => {
    const tags = await fastify.prisma.tag.findMany({
      include: {
        _count: {
          select: {
            tasks: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    return {
      data: tags.map(tag => ({
        ...tag,
        taskCount: tag._count.tasks
      }))
    };
  });
  
  // GET /api/v1/tags/:id - Get single tag
  fastify.get('/tags/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const tag = await fastify.prisma.tag.findUnique({
      where: { id: request.params.id },
      include: {
        _count: {
          select: {
            tasks: true
          }
        }
      }
    });
    
    if (!tag) {
      reply.status(404).send({ error: 'Tag not found' });
      return;
    }
    
    return {
      data: {
        ...tag,
        taskCount: tag._count.tasks
      }
    };
  });
  
  // POST /api/v1/tags - Create new tag
  fastify.post('/tags', async (request: FastifyRequest<{ Body: CreateTagInput }>, reply: FastifyReply) => {
    const data = createTagSchema.parse(request.body);
    
    try {
      const tag = await fastify.prisma.tag.create({
        data,
        include: {
          _count: {
            select: {
              tasks: true
            }
          }
        }
      });
      
      reply.status(201);
      return {
        data: {
          ...tag,
          taskCount: tag._count.tasks
        }
      };
    } catch (error: any) {
      if (error.code === 'P2002') {
        reply.status(409).send({ error: 'Tag name already exists' });
        return;
      }
      throw error;
    }
  });
  
  // PATCH /api/v1/tags/:id - Update tag
  fastify.patch('/tags/:id', async (request: FastifyRequest<{ Params: { id: string }, Body: UpdateTagInput }>, reply: FastifyReply) => {
    const data = updateTagSchema.parse(request.body);
    
    try {
      const tag = await fastify.prisma.tag.update({
        where: { id: request.params.id },
        data,
        include: {
          _count: {
            select: {
              tasks: true
            }
          }
        }
      });
      
      return {
        data: {
          ...tag,
          taskCount: tag._count.tasks
        }
      };
    } catch (error: any) {
      if (error.code === 'P2025') {
        reply.status(404).send({ error: 'Tag not found' });
        return;
      }
      if (error.code === 'P2002') {
        reply.status(409).send({ error: 'Tag name already exists' });
        return;
      }
      throw error;
    }
  });
  
  // DELETE /api/v1/tags/:id - Delete tag
  fastify.delete('/tags/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      await fastify.prisma.tag.delete({
        where: { id: request.params.id }
      });
      
      reply.status(204).send();
    } catch (error: any) {
      if (error.code === 'P2025') {
        reply.status(404).send({ error: 'Tag not found' });
        return;
      }
      throw error;
    }
  });
}
