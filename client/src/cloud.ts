import { httpBatchLink } from "@trpc/client";
import { createTRPCProxyClient } from "@trpc/client";
import superjson from "superjson";
import type { AppRouter } from "../../server/routers";

/** Cliente tRPC do Letter Play. Todas as operações persistentes passam por aqui. */
export const cloudClient = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      fetch(input, init) {
        return globalThis.fetch(input, { ...(init ?? {}), credentials: "include" });
      },
    }),
  ],
});
