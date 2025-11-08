import { router } from '../init';
import { fooRouter } from './foo';
import { barRouter } from './bar';

/**
 * Main app router - combines all sub-routers
 */
export const appRouter = router({
  foo: fooRouter,
  bar: barRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;

