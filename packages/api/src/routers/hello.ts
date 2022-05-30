import { createRouter } from "../create-router";
import { z } from "zod";

export const helloRouter = createRouter().query("hello", {
  input: z.object({
    name: z.string(),
  }),
  async resolve({ input, ctx }) {
    const user = await ctx.prisma.user.findFirst({
      where: {
        name: input.name,
      },
    });
    if (user) {
      return `Hello ${user.name}!`;
    }
    return `Hello stranger!`;
  },
});
