import bcrypt from "bcryptjs";
import { prisma } from "../prisma";
import { issueSession, clearSession, requireAuth, AuthContext } from "../middleware/auth";

export const resolvers = {
  Query: {
    me: (_: unknown, __: unknown, ctx: AuthContext) => {
      if (!ctx.userId) return null;
      return prisma.user.findUnique({ where: { id: ctx.userId } });
    },

    parts: () => prisma.part.findMany(),

    part: (_: unknown, { id }: { id: string }) =>
      prisma.part.findUnique({ where: { id } }),
  },

  Mutation: {
    register: async (
      _: unknown,
      { email, password }: { email: string; password: string },
      ctx: AuthContext
    ) => {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        throw new Error("EMAIL_TAKEN: an account with this email already exists");
      }
      const passwordHash = bcrypt.hashSync(password, 10);
      const user = await prisma.user.create({ data: { email, passwordHash } });
      issueSession(ctx.res, user.id);
      return { user };
    },

    login: async (
      _: unknown,
      { email, password }: { email: string; password: string },
      ctx: AuthContext
    ) => {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
        throw new Error("INVALID_CREDENTIALS");
      }
      issueSession(ctx.res, user.id);
      return { user };
    },

    logout: (_: unknown, __: unknown, ctx: AuthContext) => {
      clearSession(ctx.res);
      return true;
    },

    createPart: async (
      _: unknown,
      args: { name: string; sku: string; price: number; quantity: number },
      ctx: AuthContext
    ) => {
      requireAuth(ctx.userId);
      const existing = await prisma.part.findUnique({ where: { sku: args.sku } });
      if (existing) {
        throw new Error("SKU_TAKEN: a part with this SKU already exists");
      }
      return prisma.part.create({ data: { ...args, ownerId: ctx.userId } });
    },

    updatePart: async (
      _: unknown,
      args: { id: string; name?: string; price?: number; quantity?: number },
      ctx: AuthContext
    ) => {
      requireAuth(ctx.userId);
      const part = await prisma.part.findUnique({ where: { id: args.id } });
      if (!part) throw new Error("NOT_FOUND: part does not exist");
      if (part.ownerId !== ctx.userId) throw new Error("FORBIDDEN: not your part");

      return prisma.part.update({
        where: { id: args.id },
        data: {
          name: args.name ?? undefined,
          price: args.price ?? undefined,
          quantity: args.quantity ?? undefined,
        },
      });
    },

    deletePart: async (_: unknown, { id }: { id: string }, ctx: AuthContext) => {
      requireAuth(ctx.userId);
      const part = await prisma.part.findUnique({ where: { id } });
      if (!part) throw new Error("NOT_FOUND: part does not exist");
      if (part.ownerId !== ctx.userId) throw new Error("FORBIDDEN: not your part");

      await prisma.part.delete({ where: { id } });
      return true;
    },
  },
};