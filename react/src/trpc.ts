import {
  createTRPCClient,
  httpBatchStreamLink,
  httpSubscriptionLink,
  splitLink,
} from "@trpc/client";
import type { AppRouter } from "../../src/server";

export function makeClient() {
  return createTRPCClient<AppRouter>({
    links: [
      splitLink({
        condition(op) {
          return op.type === "subscription";
        },
        true: httpSubscriptionLink({
          url: `/trpc`,
        }),
        false: httpBatchStreamLink({
          url: `/trpc`,
        }),
      }),
    ],
  });
}
