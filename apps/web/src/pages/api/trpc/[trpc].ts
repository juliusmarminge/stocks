import * as trpcNext from "@trpc/server/adapters/next";
import { appRouter } from "api";
import { createContext } from "api/src/create-context";

export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext,
});
