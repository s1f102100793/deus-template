import type { DeletableTaskId } from '$/commonTypesWithClient/ids';
import type { TaskModel, UserModel } from '$/commonTypesWithClient/models';
import { S3_PREFIX } from '$/repository/s3Repo';
import { deletableTaskIdParser, taskIdParser } from '$/service/idParsers';
import type { MultipartFile } from '@fastify/multipart';
import { randomUUID } from 'crypto';

const dataToUrl = (data: MultipartFile) => {
  const s3Key = `tasks/images/${randomUUID()}.${data.filename.split('.').at(-1)}`;

  return { url: `${S3_PREFIX}${s3Key}`, s3Key };
};

export const taskModel = {
  create: (user: UserModel, label: string, data: MultipartFile | undefined): TaskModel => ({
    id: taskIdParser.parse(randomUUID()),
    done: false,
    label,
    image: data === undefined ? undefined : dataToUrl(data),
    createdTime: Date.now(),
    author: {
      userId: user.id,
      githubId: user.githubId,
      name: user.displayName ?? user.githubId,
      photoURL: user.photoURL ?? undefined,
    },
  }),
  deleteOrThrow: (user: UserModel, task: TaskModel): DeletableTaskId => {
    if (user.id !== task.author.userId) throw new Error('cannot delete');

    return deletableTaskIdParser.parse(task.id);
  },
  updateOrThrow: (
    user: UserModel,
    task: TaskModel,
    updateData: { done: boolean; label: string }
  ): TaskModel => {
    if (user.id !== task.author.userId) throw new Error('cannot update task');

    return { ...task, ...updateData };
  },
};
