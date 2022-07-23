import { t, authedProcedure } from "../../utils";
import { z } from "zod";
import { createTransactionValidator } from "~/pages/transactions";

export const transactionRouter = t.router({
  getByAuthedUser: authedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.transaction.findMany({
      orderBy: {
        transactedAt: "desc",
      },
    });
  }),
  delete: authedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.prisma.transaction.delete({
        where: {
          id: input.id,
        },
      });
    }),
  create: authedProcedure
    .input(createTransactionValidator)
    .mutation(async ({ input, ctx }) => {
      return await ctx.prisma.transaction.create({
        data: { ...input, userId: ctx.session.user.id },
      });
    }),
});
