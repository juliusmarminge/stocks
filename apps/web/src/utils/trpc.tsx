import type { AppRouter } from "@stocks/api";
import { createReactQueryHooks } from "@trpc/react";

export const trpc = createReactQueryHooks<AppRouter>();

export * from "@stocks/api/src/inferance-helpers";
