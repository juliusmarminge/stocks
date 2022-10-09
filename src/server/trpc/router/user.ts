import { authedProcedure, createRouter } from "../trpc";

export const userRouter = createRouter({
  me: authedProcedure.query(async ({ ctx }) => {
    const user = ctx.session.user;
    return await ctx.prisma.user.findFirst({
      where: {
        id: user.id,
      },
    });
  }),
});
