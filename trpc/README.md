# tRPC Setup

This project uses tRPC for end-to-end typesafe APIs.

## Structure

```
trpc/
├── init.ts              # tRPC initialization and base configuration
├── client.ts            # React client setup
├── Provider.tsx         # React Query provider for Next.js
└── routers/
    ├── _app.ts          # Main router that combines all sub-routers
    ├── foo.ts           # Example router with queries and mutations
    └── bar.ts           # Another example router
```

## Adding a New Router

1. Create a new file in `trpc/routers/`:

```typescript
// trpc/routers/myRouter.ts
import { z } from 'zod';
import { publicProcedure, router } from '../init';

export const myRouter = router({
  myQuery: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      // Your query logic here
      return { id: input.id, data: 'some data' };
    }),

  myMutation: publicProcedure
    .input(z.object({ name: z.string() }))
    .mutation(({ input }) => {
      // Your mutation logic here
      return { success: true, name: input.name };
    }),
});
```

2. Add it to `trpc/routers/_app.ts`:

```typescript
import { myRouter } from './myRouter';

export const appRouter = router({
  foo: fooRouter,
  bar: barRouter,
  my: myRouter, // Add your router here
});
```

3. Use it in your components:

```typescript
'use client';
import { trpc } from '@/trpc/client';

export default function MyComponent() {
  const { data } = trpc.my.myQuery.useQuery({ id: '123' });
  const mutation = trpc.my.myMutation.useMutation();

  return <div>{/* Your component */}</div>;
}
```

## API Endpoint

The tRPC API is available at `/api/trpc` and is handled by the route handler in `app/api/trpc/[trpc]/route.ts`.

## Type Safety

All tRPC procedures are fully type-safe. TypeScript will infer the input and output types automatically, providing autocomplete and compile-time errors if you use the wrong types.

