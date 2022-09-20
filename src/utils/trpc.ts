// src/utils/trpc.ts
import { httpBatchLink } from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import type {
  AnyProcedure,
  AnyRouter,
  inferProcedureInput,
  inferProcedureOutput,
} from "@trpc/server";
import superjson from "superjson";

import type { AppRouter } from "../server/trpc/router";

const getBaseUrl = () => {
  if (typeof window !== "undefined") return ""; // browser should use relative url
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url

  return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};

export const trpc = createTRPCNext<AppRouter>({
  config() {
    return {
      links: [httpBatchLink({ url: `${getBaseUrl()}/api/trpc` })],
      transformer: superjson,
    };
  },
  ssr: false,
});

/** Custom inference handlers to skip double imports in every file */
type HandleInferenceHelpers<
  TRouterOrProcedure extends AnyRouter | AnyProcedure,
> = TRouterOrProcedure extends AnyRouter
  ? GetInferenceHelpers<TRouterOrProcedure>
  : TRouterOrProcedure extends AnyProcedure
  ? {
      input: inferProcedureInput<TRouterOrProcedure>;
      output: inferProcedureOutput<TRouterOrProcedure>;
    }
  : never;

type GetInferenceHelpers<TRouter extends AnyRouter> = {
  [TKey in keyof TRouter["_def"]["record"]]: HandleInferenceHelpers<
    TRouter["_def"]["record"][TKey]
  >;
};

export type InferTRPC = GetInferenceHelpers<AppRouter>;
