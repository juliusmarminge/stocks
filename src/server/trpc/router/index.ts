// src/server/router/index.ts
import { createRouter } from "../trpc";
import { possesionRouter } from "./possesion";
import { stockRouter } from "./stock";
import { transactionRouter } from "./transaction";
import { userRouter } from "./user";

export const appRouter = createRouter({
  transactions: transactionRouter,
  stocks: stockRouter,
  user: userRouter,
  possesion: possesionRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
