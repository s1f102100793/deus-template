import { taskIdParser } from '$/service/idParsers';
import { taskUseCase } from '$/useCase/taskUseCase';
import { z } from 'zod';
import { defineController, multipartFileValidator } from './$relay';

export default defineController(() => ({
  post: {
    validators: {
      body: z.object({ label: z.string(), image: multipartFileValidator().optional() }),
    },
    handler: async ({ user, body }) => ({
      status: 201,
      body: await taskUseCase.create(user, body.label, body.image),
    }),
  },
  patch: {
    validators: {
      body: z.object({
        taskId: taskIdParser,
        done: z.boolean(),
        label: z.string(),
      }),
    },
    handler: async ({ user, body }) => {
      const task = await taskUseCase.update(user, body.taskId, body.done, body.label);

      return { status: 204, body: task };
    },
  },
  delete: async ({ user, body }) => {
    await taskUseCase.delete(user, body.taskId);

    return { status: 204 };
  },
}));
