import { createRouter } from "../context";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTransactionValidator } from "../../../validators/transaction";

export const transactionRouter = createRouter()
  .middleware(async ({ ctx, next }) => {
    if (!ctx.session) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next();
  })
  .query("getAll", {
    async resolve({ ctx }) {
      return await ctx.prisma.transaction.findMany({
        orderBy: {
          transactedAt: "desc",
        },
      });
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
  .query("getByAuthedUser", {
    async resolve({ ctx }) {
      const user = ctx.session?.user;
      const dbUser = await ctx.prisma.user.findFirst({
        where: {
          email: user?.email,
        },
      });

      if (!user || !dbUser) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const transactions = await ctx.prisma.transaction.findMany({
        where: {
          userId: dbUser?.id,
        },
      });
      return transactions;
    },
  })
  .mutation("create", {
    input: createTransactionValidator,
    async resolve({ input, ctx }) {
      const user = ctx.session?.user;
      const dbUser = await ctx.prisma.user.findFirst({
        where: {
          email: user?.email,
        },
      });

      return await ctx.prisma.transaction.create({
        data: {
          ...input,
          transactedBy: {
            connect: {
              id: dbUser?.id,
            },
          },
        },
      });
    },
  })
  .mutation("delete", {
    input: z.object({
      id: z.string().uuid(),
    }),
    async resolve({ input, ctx }) {
      return await ctx.prisma.transaction.delete({
        where: {
          ...input,
        },
      });
    },
  });
