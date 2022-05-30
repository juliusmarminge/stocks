import superjson from "superjson";
import { createRouter } from "../create-router";
import { userRouter } from "./user";
import { transactionRouter } from "./transaction";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("user.", userRouter)
  .merge("transaction.", transactionRouter);

export type AppRouter = typeof appRouter;
