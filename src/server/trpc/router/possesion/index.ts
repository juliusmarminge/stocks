import { authedProcedure, createRouter } from "../../trpc";

export const possesionRouter = createRouter({
  getByAuthedUser: authedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.possesion.findMany({
      where: { userId: ctx.session.user.id },
    });
  }),
});
