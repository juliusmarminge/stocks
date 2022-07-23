import { authedProcedure, t } from "../utils";

export const userRouter = t.router({
  me: authedProcedure.query(async ({ ctx }) => {
    const user = ctx.session.user;
    return await ctx.prisma.user.findFirst({
      where: {
        id: user.id,
      },
    });
  }),
});
