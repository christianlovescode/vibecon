## Stack

### Frontend 

- This is a NEXTJS site using Typescript.
- All UI should be built using [Radix Themes](https://www.radix-ui.com/themes/docs/overview/getting-started).
- For global state management we use [Zustand](https://zustand.docs.pmnd.rs/integrations/persisting-store-data#typescript-simple-example) - a lightweight state management for workflow state.


## Database 
- Planetscale hosted Postgres 
- Prisma ORM 

To generate db types, run `npx prisma generate`
Pushing db changes run `npx prisma db push`
To view data run `npx prisma studio`


## Data fetching 

We use tRPC.

trpc/
├── init.ts              # tRPC initialization with superjson transformer
├── client.ts            # React client setup
├── Provider.tsx         # React Query provider for Next.js App Router
├── README.md            # Documentation for adding new routers
└── routers/
    ├── _app.ts          # Main router combining all sub-routers
    ├── foo.ts           # Example router with greeting, items, and create mutation
    └── bar.ts           # Example router with stats, user lookup, and status update

app/api/trpc/[trpc]/
└── route.ts             # API route handler


## Background workers 

We use trigger.dev. 


## Asset generation

https://v0.app/docs/api/platform/quickstart

