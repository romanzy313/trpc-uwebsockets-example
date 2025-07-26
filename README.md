# trpc-uwebsockets-example

Example of how to use [trpc-uwebsockets](https://github.com/romanzy313/trpc-uwebsockets). The code closely follows the readme.

- Run the server with `pnpm start-server`
- Run node client with `pnpm run-node`
- Run web client with `pnpm run-browser`

In order for browser to work, go to `./react` and install dependencies `pnpm i`.

## Issue #38

first go to `react` directory and and install dependencies `cd react & pnpm i`

`pnpm vite` works in dev mode.

`pnpm vite build` builds application correctly.

`pnpm tsc -b` fails with the following error:

```
LazyLoader<import("/home/user/projects/trpc-uwebsockets-example/react/node_modules/.pnpm/@trpc+server@11.4.3_typescript@5.8.3/node_modules/@trpc/server/dist/unstable-core-do-not-import.d-ClFRzVsT").AnyRouter>'

is not assignable to type

'LazyLoader<import("/home/user/projects/trpc-uwebsockets-example/node_modules/.pnpm/@trpc+server@11.4.3_typescript@5.8.3/node_modules/@trpc/server/dist/unstable-core-do-not-import.d-C6mFWtNG").AnyRouter>.
```

The react project imports from
`trpc-uwebsockets-example/react/node_modules/@trpc/server/dist/unstable-core-do-not-import.d-ClFRzVsT.d.mts` (module), meanwhile the server implementation uses `trpc-uwebsockets-example/node_modules/@trpc/server/dist/unstable-core-do-not-import.d-C6mFWtNG.d.cts` (commonjs)

To fix, ensure that module resolution in the monorepo is set to the same value.
