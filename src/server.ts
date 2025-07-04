import * as uWs from "uWebSockets.js";
import { initTRPC } from "@trpc/server";
import z from "zod";

import {
  applyRequestHandler,
  applyWebsocketHandler,
  CreateContextOptions,
} from "trpc-uwebsockets";

export const port = 4000;

/* Define context. During websocket connection do not use `res`, use `client` instead */
function createContext({ req, res, info, client }: CreateContextOptions) {
  const user = { name: req.headers.get("username") || "anonymous" };
  return { req, res, user, info, client };
}
type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create();

/* Define app router */
const appRouter = t.router({
  hello: t.procedure
    .input(
      z
        .object({
          username: z.string().nullish(),
        })
        .nullish(),
    )
    .query(({ input, ctx }) => {
      console.log("doing a query");
      return `hello ${input?.username ?? ctx.user?.name ?? "world"}`;
    }),
  count: t.procedure
    .input(
      z
        .object({
          from: z.number().positive(),
          to: z.number().positive(),
        })
        .superRefine(({ from, to }, ctx) => {
          if (to < from) {
            ctx.addIssue({
              code: "custom",
              message: "'to' must be bigger then 'from'",
            });
          }
        }),
    )
    .subscription(async function* ({ input, signal }) {
      console.log("started subscription");
      for (let i = input.from; i <= input.to; i++) {
        await new Promise((resolve) => setTimeout(resolve, 20));
        if (signal?.aborted) {
          return;
        }
        yield i;
      }
      console.log("ended subscription");
    }),
});
export type AppRouter = typeof appRouter;

/* Create uWebSockets server */
const app = uWs.App();

app.get("/", (res) => {
  res.end("OK");
});

/* Handle CORS */
app.options("/*", (res) => {
  res.writeHeader("Access-Control-Allow-Origin", "*");
  res.endWithoutBody();
});

/* Attach main tRPC event handler */
applyRequestHandler(app, {
  prefix: "/trpc",
  ssl: false /* set to true if your application is served over HTTPS */,
  trpcOptions: {
    router: appRouter,
    createContext,
    onError(data) {
      console.error("trpc error:", data);
    },
    responseMeta() {
      return {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      };
    },
  },
});

/* Don't crash on undefined requests */
app.any("/*", (res) => {
  res.writeStatus("404 NOT FOUND");
  res.end();
});

type Server = {
  stop: () => void;
  port: number;
};

export async function startServer(port: number): Promise<Server> {
  return new Promise<Server>((resolve, reject) => {
    app.listen("0.0.0.0", port, (socket) => {
      if (socket === false) {
        return reject(new Error(`Server failed to listen on port ${port}`));
      }
      resolve({
        stop: () => uWs.us_listen_socket_close(socket),
        port: uWs.us_socket_local_port(socket),
      });
    });
  });
}

async function run() {
  const { stop } = await startServer(port);
  console.log("server running on port", port);
}

run().catch(console.error);
