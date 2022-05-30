import { createRouter } from "../create-router";
import { z } from "zod";

export const transactionRouter = createRouter()
  .query("getAll", {
    async resolve({ ctx }) {
      return await ctx.prisma.transaction.findMany();
    },
  })
  .query("getById", {
    input: z.object({
      id: z.string().uuid(),
    }),
    async resolve({ input, ctx }) {
      return await ctx.prisma.transaction.findFirst({
        where: {
          ...input,
        },
      });
    },
  })
  .query("getByUserId", {
    input: z.object({
      id: z.string().uuid(),
    }),
    async resolve({ input, ctx }) {
      return await ctx.prisma.user.findMany({
        where: {
          ...input,
        },
        include: {
          transactions: true,
        },
      });
    },
  })
  .mutation("create", {
    input: z.object({
      transactedAt: z.date().optional(),
      transactedBy: z.string().uuid(),
      stock: z.string().max(6),
      units: z.number().int().positive(),
      pricePerUnit: z.number().positive(),
      type: z.enum(["BUY", "SELL"]),
    }),
    async resolve({ input, ctx }) {
      return await ctx.prisma.transaction.create({
        data: {
          ...input,
        },
      });
    },
  });
