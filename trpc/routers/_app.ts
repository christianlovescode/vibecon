import { router } from '../init';
import { fooRouter } from './foo';
import { barRouter } from './bar';
import { clientRouter } from './client';
import { leadRouter } from './lead';
import { workflowRouter } from './workflow';

/**
 * Main app router - combines all sub-routers
 */
export const appRouter = router({
  foo: fooRouter,
  bar: barRouter,
  client: clientRouter,
  lead: leadRouter,
  workflow: workflowRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;

