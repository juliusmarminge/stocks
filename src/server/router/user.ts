import { createRouter } from "./context";
import { z } from "zod";

export const userRouter = createRouter()
  .query("getAll", {
    async resolve({ ctx }) {
      return await ctx.prisma.user.findMany();
    },
  })
  .query("getById", {
    input: z.object({
      id: z.string().uuid(),
    }),
    async resolve({ input, ctx }) {
      return await ctx.prisma.user.findFirst({
        where: { id: input.id },
      });
    },
  })
  .query("getByName", {
    input: z.object({
      name: z.string(),
    }),
    async resolve({ input, ctx }) {
      return await ctx.prisma.user.findFirst({
        where: { name: input.name },
      });
    },
  })
  .query("getByNameWithTransactions", {
    input: z.object({
      name: z.string(),
    }),
    async resolve({ input, ctx }) {
      return await ctx.prisma.user.findFirst({
        where: { name: input.name },
        include: { transactions: true },
      });
    },
  })
  .mutation("create", {
    input: z.object({
      name: z.string(),
    }),
    async resolve({ input, ctx }) {
      return await ctx.prisma.user.create({
        data: {
          ...input,
        },
      });
    },
  });
