import superjson from "superjson";
import { createRouter } from "../create-router";
import { userRouter } from "./user";
import { transactionRouter } from "./transaction";
import { stockRouter } from "./stock";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("user.", userRouter)
  .merge("stock.", stockRouter)
  .merge("transaction.", transactionRouter);

export type AppRouter = typeof appRouter;
