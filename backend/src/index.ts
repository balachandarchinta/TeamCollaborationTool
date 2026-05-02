import Fastify from 'fastify';
import cors from '@fastify/cors';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { extractTaskDetails, generateExecutionSummary } from './ai';

const prisma = new PrismaClient();
const fastify = Fastify({ logger: true });

fastify.register(cors, { origin: '*' });

let io: Server;

fastify.ready((err) => {
  if (err) throw err;
  io = new Server(fastify.server, {
    cors: { origin: '*' }
  });

  io.on('connection', (socket) => {
    fastify.log.info('Client connected');
    socket.on('disconnect', () => {
      fastify.log.info('Client disconnected');
    });
  });
});

fastify.post('/api/tasks', async (request, reply) => {
  try {
    const { message } = request.body as { message: string };
    
    // Stage 1
    const stage1Output = await extractTaskDetails(message);
    
    // Stage 2
    const stage2Output = await generateExecutionSummary(stage1Output);
    
    // Save to DB (mapping fields)
    const task = await prisma.task.create({
      data: {
        originalMessage: message,
        action: stage1Output.action,
        priority: stage1Output.priority,
        taskName: stage1Output.details?.task_name || 'Unknown',
        dueDate: stage1Output.details?.due_date || null,
        assignee: stage1Output.details?.assignee || null,
        dependency: stage1Output.details?.dependency || null,
        status: stage1Output.details?.status || 'Pending',
        userNotification: stage2Output.user_notification,
        auditSummary: stage2Output.audit_summary,
        systemActions: stage2Output.system_action.join(', ')
      }
    });

    // Notify clients in real-time
    if (io) {
      io.emit('task_update', task);
    }

    return { success: true, task, stage1Output, stage2Output };
  } catch (error: any) {
    fastify.log.error(error);
    reply.status(500).send({ error: error.message });
  }
});

fastify.get('/api/tasks', async (request, reply) => {
  const tasks = await prisma.task.findMany({
    orderBy: { createdAt: 'desc' }
  });
  return tasks;
});

const start = async () => {
  try {
    await fastify.listen({ port: 3001, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
