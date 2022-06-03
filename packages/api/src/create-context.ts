import { PrismaClient } from "@stocks/db";
import * as trpc from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";

/**
 * setup prisma client for the context,
 * we can use this client to query the database
 *
 */
declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}
const prisma = global.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") global.prisma = prisma;

/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/context
 */
export const createContext = async ({
  req,
  res,
}: trpcNext.CreateNextContextOptions) => {
  // for API-response caching see https://trpc.io/docs/caching

  return {
    req,
    res,
    prisma,
  };
};

export type Context = trpc.inferAsyncReturnType<typeof createContext>;
