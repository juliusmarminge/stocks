/**
 * This file contains the root router of your tRPC-backend
 */
import { createRouter } from "../create-router";
import { helloRouter } from "./hello";

export const appRouter = createRouter()
  //.transformer(superjson)
  .merge("", helloRouter);

export type AppRouter = typeof appRouter;
