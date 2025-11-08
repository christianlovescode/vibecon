import { z } from 'zod';
import { publicProcedure, router } from '../init';
import db from '@/db/client';

export const clientRouter = router({
  // Get all clients with basic info
  list: publicProcedure.query(async () => {
    const clients = await db.client.findMany({
      select: {
        id: true,
        name: true,
        website: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return { clients };
  }),

  // Get a single client by ID with all relations
  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const client = await db.client.findUnique({
        where: { id: input.id },
        include: {
          marketingMaterials: {
            orderBy: {
              createdAt: 'desc',
            },
          },
          logosAndBranding: {
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });

      if (!client) {
        throw new Error('Client not found');
      }

      return { client };
    }),

  // Update a client
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.object({
          name: z.string().optional(),
          website: z.string().optional(),
          industry: z.string().optional(),
          companySummary: z.string().optional(),
          targetCustomer: z.string().optional(),
          valueProposition: z.string().optional(),
          location: z.string().optional(),
          headcount: z.number().optional(),
          linkedinUrl: z.string().optional(),
          twitterUrl: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      const client = await db.client.update({
        where: { id: input.id },
        data: input.data,
      });

      return { client };
    }),
});
