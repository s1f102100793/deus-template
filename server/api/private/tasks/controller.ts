import { taskIdParser } from '$/service/idParsers';
import { taskUseCase } from '$/useCase/taskUseCase';
import type { MultipartFile } from '@fastify/multipart';
import { Readable } from 'stream';
import { z } from 'zod';
import { defineController } from './$relay';

const multipartFileValidator = (): z.ZodType<MultipartFile> =>
  z
    .object({
      type: z.literal('file'),
      toBuffer: z.function().returns(z.any()),
      file: z.instanceof(Readable).and(z.object({ truncated: z.boolean(), bytesRead: z.number() })),
      fieldname: z.string(),
      filename: z.string(),
      encoding: z.string(),
      mimetype: z.string(),
      fields: z.record(z.any()),
    })
    .passthrough();

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
