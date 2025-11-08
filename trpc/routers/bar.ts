import { z } from 'zod';
import { publicProcedure, router } from '../init';

export const barRouter = router({
  // Simple query that returns statistics
  getStats: publicProcedure.query(() => {
    return {
      totalUsers: 42,
      activeUsers: 28,
      totalPosts: 156,
      lastUpdated: new Date(),
    };
  }),

  // Query with input parameter
  getUserById: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(({ input }) => {
      return {
        id: input.userId,
        name: `User ${input.userId}`,
        email: `user${input.userId}@example.com`,
        createdAt: new Date(),
      };
    }),

  // Mutation that updates something
  updateStatus: publicProcedure
    .input(
      z.object({
        status: z.enum(['active', 'inactive', 'pending']),
        message: z.string().optional(),
      })
    )
    .mutation(({ input }) => {
      return {
        success: true,
        status: input.status,
        message: input.message ?? 'Status updated successfully',
        updatedAt: new Date(),
      };
    }),
});

