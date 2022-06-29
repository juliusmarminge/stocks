// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { stockRouter } from "./stock";
import { transactionRouter } from "./transaction";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("transaction.", transactionRouter)
  .merge("stock.", stockRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
