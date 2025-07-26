import type { AppRouter } from "./server";
import {
  createTRPCClient,
  httpBatchStreamLink,
  httpSubscriptionLink,
  splitLink,
  wsLink,
} from "@trpc/client";
import { EventSourcePolyfill } from "event-source-polyfill";

const port = 4000;

/* Configure TRPCClient to use SSE subscriptions and BatchStreaming transport */
export function makeClient() {
  return createTRPCClient<AppRouter>({
    links: [
      splitLink({
        condition(op) {
          return op.type === "subscription";
        },
        true: httpSubscriptionLink({
          url: `http://localhost:${port}/trpc`,
          EventSource: EventSourcePolyfill,
        }),
        false: httpBatchStreamLink({
          url: `http://localhost:${port}/trpc`,
        }),
      }),
    ],
  });
}

async function run() {
  const client = makeClient();
  const hello = await client.hello.query();

  console.log("hello.query:", hello);

  const sub = client.count.subscribe(
    { from: 3, to: 7 },
    {
      onData(value) {
        console.log("count.subscribe:", value);
      },
      onStopped() {
        console.log("count.stopped");
      },
    },
  );
}

run().catch(console.error);
