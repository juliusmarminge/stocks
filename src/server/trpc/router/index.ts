// src/server/router/index.ts
import { t } from "../utils";

import { stockRouter } from "./stock";
import { transactionRouter } from "./transaction";
import { userRouter } from "./user";

export const appRouter = t.router({
  transactions: transactionRouter,
  stocks: stockRouter,
  user: userRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
