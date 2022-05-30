import * as trpcNext from "@trpc/server/adapters/next";
import { appRouter } from "@stocks/api";
import { createContext } from "@stocks/api/src/create-context";

export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext,
});
