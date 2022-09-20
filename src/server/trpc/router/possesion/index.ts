import { authedProcedure, t } from "../../utils";

export const possesionRouter = t.router({
  getByAuthedUser: authedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.possesion.findMany({
      where: { userId: ctx.session.user.id },
    });
  }),
});
