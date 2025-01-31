import type { UserId } from '$/commonTypesWithClient/ids';
import type { UserModel } from '$/commonTypesWithClient/models';
import { userIdParser } from '$/service/idParsers';
import type { Prisma, User } from '@prisma/client';

const toModel = (prismaUser: User): UserModel => ({
  id: userIdParser.parse(prismaUser.id),
  email: prismaUser.email,
  name: prismaUser.name,
  createdTime: prismaUser.createdAt.getTime(),
});

export const userRepo = {
  save: async (tx: Prisma.TransactionClient, user: UserModel) => {
    return tx.user.upsert({
      where: { id: user.id },
      update: { email: user.email, name: user.name },
      create: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: new Date(user.createdTime),
      },
    });
  },
  findById: (tx: Prisma.TransactionClient, id: UserId): Promise<UserModel | null> =>
    tx.user.findUnique({ where: { id } }).then((user) => (user !== null ? toModel(user) : null)),
};
