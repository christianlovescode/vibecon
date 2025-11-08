import { z } from 'zod';
import { publicProcedure, router } from '../init';

export const fooRouter = router({
  // Simple query that returns a greeting
  greeting: publicProcedure
    .input(z.object({ name: z.string().optional() }))
    .query(({ input }) => {
      return {
        message: `Hello ${input.name ?? 'World'} from Foo Router!`,
        timestamp: new Date(),
      };
    }),

  // Query that returns a list of items
  getItems: publicProcedure.query(() => {
    return {
      items: [
        { id: 1, name: 'Foo Item 1', description: 'First foo item' },
        { id: 2, name: 'Foo Item 2', description: 'Second foo item' },
        { id: 3, name: 'Foo Item 3', description: 'Third foo item' },
      ],
    };
  }),

  // Mutation example
  createItem: publicProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
      })
    )
    .mutation(({ input }) => {
      // In a real app, you'd save this to a database
      return {
        id: Math.floor(Math.random() * 1000),
        ...input,
        createdAt: new Date(),
      };
    }),
});

