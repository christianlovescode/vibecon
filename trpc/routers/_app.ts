import { router } from '../init';
import { fooRouter } from './foo';
import { barRouter } from './bar';
import { clientRouter } from './client';
import { leadRouter } from './lead';
import { instantlyRouter } from './instantly';

/**
 * Main app router - combines all sub-routers
 */
export const appRouter = router({
  foo: fooRouter,
  bar: barRouter,
  client: clientRouter,
  lead: leadRouter,
  instantly: instantlyRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;

