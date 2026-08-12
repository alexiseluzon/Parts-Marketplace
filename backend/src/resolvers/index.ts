import bcrypt from "bcryptjs";
import { users, parts, nextUserId, nextPartId, User, Part } from "../store/store";
import { issueSession, clearSession, requireAuth, AuthContext } from "../middleware/auth";

export const resolvers = {
  Query: {
    me: (_: unknown, __: unknown, ctx: AuthContext): User | null => {
      if (!ctx.userId) return null;
      return users.find((u) => u.id === ctx.userId) ?? null;
    },

    parts: (): Part[] => parts,

    part: (_: unknown, { id }: { id: string }): Part | undefined =>
      parts.find((p) => p.id === id),
  },

  Mutation: {
    register: (
      _: unknown,
      { email, password }: { email: string; password: string },
      ctx: AuthContext
    ) => {
      if (users.some((u) => u.email === email)) {
        throw new Error("EMAIL_TAKEN: an account with this email already exists");
      }
      const passwordHash = bcrypt.hashSync(password, 10);
      const user: User = { id: nextUserId(), email, passwordHash };
      users.push(user);
      issueSession(ctx.res, user.id);
      return { user };
    },

    login: (
      _: unknown,
      { email, password }: { email: string; password: string },
      ctx: AuthContext
    ) => {
      const user = users.find((u) => u.email === email);
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

    createPart: (
      _: unknown,
      args: { name: string; sku: string; price: number; quantity: number },
      ctx: AuthContext
    ): Part => {
      requireAuth(ctx.userId);
      const part: Part = { id: nextPartId(), ownerId: ctx.userId, ...args };
      parts.push(part);
      return part;
    },

    updatePart: (
      _: unknown,
      args: { id: string; name?: string; price?: number; quantity?: number },
      ctx: AuthContext
    ): Part => {
      requireAuth(ctx.userId);
      const part = parts.find((p) => p.id === args.id);
      if (!part) throw new Error("NOT_FOUND: part does not exist");
      if (part.ownerId !== ctx.userId) throw new Error("FORBIDDEN: not your part");

      if (args.name !== undefined) part.name = args.name;
      if (args.price !== undefined) part.price = args.price;
      if (args.quantity !== undefined) part.quantity = args.quantity;
      return part;
    },

    deletePart: (_: unknown, { id }: { id: string }, ctx: AuthContext): boolean => {
      requireAuth(ctx.userId);
      const idx = parts.findIndex((p) => p.id === id);
      if (idx === -1) throw new Error("NOT_FOUND: part does not exist");
      if (parts[idx].ownerId !== ctx.userId) throw new Error("FORBIDDEN: not your part");

      parts.splice(idx, 1);
      return true;
    },
  },
};
