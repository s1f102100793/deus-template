import type { DeletableTaskId, Maybe, TaskId } from '$/commonTypesWithClient/ids';
import type { Prisma, Task, User } from '@prisma/client';
import type { TaskModel } from 'commonTypesWithClient/models';
import { taskIdParser, userIdParser } from '../service/idParsers';
import { S3_PREFIX } from './s3Repo';

const toModel = (task: Task & { User: User }): TaskModel => ({
  id: taskIdParser.parse(task.id),
  label: task.label,
  done: task.done,
  createdTime: task.createdAt.getTime(),
  image:
    task.imageKey === null
      ? undefined
      : { url: `${S3_PREFIX}${task.imageKey}`, s3Key: task.imageKey },
  author: { userId: userIdParser.parse(task.userId), name: task.User.name },
});

export const taskRepo = {
  save: async (tx: Prisma.TransactionClient, task: TaskModel) => {
    await tx.task.upsert({
      where: { id: task.id },
      update: { done: task.done, label: task.label, imageKey: task.image?.s3Key },
      create: {
        id: task.id,
        userId: task.author.userId,
        done: task.done,
        label: task.label,
        imageKey: task.image?.s3Key,
        createdAt: new Date(task.createdTime),
      },
    });
  },
  delete: async (tx: Prisma.TransactionClient, deletableTaskId: DeletableTaskId) => {
    await tx.task.delete({ where: { id: deletableTaskId } });
  },
  findAll: (tx: Prisma.TransactionClient, limit?: number): Promise<TaskModel[]> =>
    tx.task
      .findMany({ take: limit, include: { User: true }, orderBy: { createdAt: 'desc' } })
      .then((tasks) => tasks.map(toModel)),
  findByIdOrThrow: (tx: Prisma.TransactionClient, id: Maybe<TaskId>): Promise<TaskModel> =>
    tx.task.findUniqueOrThrow({ where: { id }, include: { User: true } }).then(toModel),
};
