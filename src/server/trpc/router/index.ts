// src/server/router/index.ts
import { t } from "../utils";
import { possesionRouter } from "./possesion";
import { stockRouter } from "./stock";
import { transactionRouter } from "./transaction";
import { userRouter } from "./user";

export const appRouter = t.router({
  transactions: transactionRouter,
  stocks: stockRouter,
  user: userRouter,
  possesion: possesionRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
