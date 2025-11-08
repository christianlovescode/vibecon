# Database Client

This directory contains the Prisma database client configuration.

## Usage

The database client is a singleton instance that can be imported and used throughout your application.

### Basic Usage

```typescript
import db from '@/db/client';

// Query examples
const allFoos = await db.foo.findMany();
const oneFoo = await db.foo.findUnique({ where: { id: 1 } });
const newFoo = await db.foo.create({ data: { name: 'Bar' } });
```

### In Services

Create services in the `/services` directory:

```typescript
import db from '@/db/client';

export class MyService {
  async getAll() {
    return await db.myModel.findMany();
  }
}

export const myService = new MyService();
```

### In API Routes (Next.js)

```typescript
import db from '@/db/client';

export async function GET() {
  const data = await db.foo.findMany();
  return Response.json(data);
}
```

### In Server Components

```typescript
import db from '@/db/client';

export default async function Page() {
  const foos = await db.foo.findMany();
  
  return (
    <div>
      {foos.map(foo => (
        <div key={foo.id}>{foo.name}</div>
      ))}
    </div>
  );
}
```

## Why Singleton?

The singleton pattern prevents creating multiple Prisma Client instances during development with Next.js hot reloading. This is important because:

1. **Connection pooling**: Prisma manages database connections efficiently
2. **Performance**: Multiple instances can exhaust database connections
3. **Development**: Hot reloading would create new instances on each change

## Logging

The client is configured to log:
- **Development**: `query`, `error`, `warn`
- **Production**: `error` only

You can modify logging in `/db/client.ts`.

## Example

See `/services/example.service.ts` for a complete example of how to create a service using the database client.

