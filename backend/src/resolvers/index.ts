import { prisma } from "../prisma";
import { requireAuth, AuthContext } from "../middleware/auth";

// Auth (signup/login/logout) is handled entirely by Supabase Auth on the
// frontend now. This server only trusts the verified access token (see
// middleware/auth.ts) and reads/writes app data.

export const resolvers = {
  Part: {
    // Resolved lazily — only runs if a query actually selects `owner`.
    owner: (part: { ownerId: string }) =>
      prisma.profile.findUnique({ where: { id: part.ownerId } }),
  },

  Query: {
    me: (_: unknown, __: unknown, ctx: AuthContext) => {
      if (!ctx.userId) return null;
      return prisma.profile.findUnique({ where: { id: ctx.userId } });
    },

    // Non-admins only see their own parts; admins see everything.
    // This mirrors the RLS policy, so behavior is consistent even if
    // this query is ever run through a different connection path.
    parts: async (_: unknown, __: unknown, ctx: AuthContext) => {
      requireAuth(ctx.userId);
      const me = await prisma.profile.findUnique({ where: { id: ctx.userId } });
      if (me?.role === "admin") return prisma.part.findMany();
      return prisma.part.findMany({ where: { ownerId: ctx.userId } });
    },

    part: (_: unknown, { id }: { id: string }) =>
      prisma.part.findUnique({ where: { id } }),
  },

  Mutation: {
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

      const me = await prisma.profile.findUnique({ where: { id: ctx.userId } });
      if (part.ownerId !== ctx.userId && me?.role !== "admin") {
        throw new Error("FORBIDDEN: not your part");
      }

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

      const me = await prisma.profile.findUnique({ where: { id: ctx.userId } });
      if (part.ownerId !== ctx.userId && me?.role !== "admin") {
        throw new Error("FORBIDDEN: not your part");
      }

      await prisma.part.delete({ where: { id } });
      return true;
    },
  },
};