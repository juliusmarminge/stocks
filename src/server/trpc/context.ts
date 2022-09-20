// src/server/router/context.ts
import * as trpc from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";
import { prisma } from "~/server/db/client";
import { getServerSession } from "~/server/common/getServerSession";

export const createContext = async (opts: trpcNext.CreateNextContextOptions) => {
  const session = await getServerSession(opts);
  return {
    prisma,
    session,
  };
};

export type Context = trpc.inferAsyncReturnType<typeof createContext>;
