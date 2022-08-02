import { t, authedProcedure } from "../../utils";
import { z } from "zod";
import { createTransactionValidator } from "~/pages/transactions";
import { TRPCError } from "@trpc/server";

export const possesionRouter = t.router({
  getByAuthedUser: authedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.possesion.findMany({
      where: { userId: ctx.session.user.id },
    });
  }),
});
