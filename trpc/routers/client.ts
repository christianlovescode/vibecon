import { z } from 'zod';
import { publicProcedure, router } from '../init';
import db from '@/db/client';
import { tasks } from "@trigger.dev/sdk/v3";

export const clientRouter = router({
  // Get all clients with basic info
  list: publicProcedure.query(async () => {
    const clients = await db.client.findMany({
      select: {
        id: true,
        name: true,
        website: true,
        createdAt: true,
        enrichmentStatus: true,
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

  // Create a new client
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, 'Name is required'),
        website: z.string().optional(),
        industry: z.string().optional(),
        companySummary: z.string().optional(),
        targetCustomer: z.string().optional(),
        valueProposition: z.string().optional(),
        location: z.string().optional(),
        headcount: z.number().optional(),
        linkedinUrl: z.string().optional(),
        twitterUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const client = await db.client.create({
        data: input,
      });

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

  // Delete a client (cascade deletes relations)
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await db.client.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Add marketing material
  addMarketingMaterial: publicProcedure
    .input(
      z.object({
        clientId: z.string(),
        url: z.string().url('Must be a valid URL'),
        title: z.string().min(1, 'Title is required'),
        description: z.string().optional(),
        assetType: z.string().min(1, 'Asset type is required'),
        previewImageUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const material = await db.marketingMaterial.create({
        data: input,
      });

      return { material };
    }),

  // Delete marketing material
  deleteMarketingMaterial: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await db.marketingMaterial.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Add branding asset
  addBrandingAsset: publicProcedure
    .input(
      z.object({
        clientId: z.string(),
        url: z.string().url('Must be a valid URL'),
        assetType: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const asset = await db.logoAndBranding.create({
        data: input,
      });

      return { asset };
    }),

  // Delete branding asset
  deleteBrandingAsset: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await db.logoAndBranding.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Enrich client with automated workflow
  enrichClient: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, 'Name is required'),
        domain: z.string().min(1, 'Domain is required'),
      })
    )
    .mutation(async ({ input }) => {
      // Create client with minimal data and enriching status
      const client = await db.client.create({
        data: {
          name: input.name,
          website: input.domain,
          enrichmentStatus: "pending",
        },
      });

      // Trigger enrichment workflow
      const { enrichClientTask } = await import("@/trigger/enrichClient");
      await tasks.trigger(enrichClientTask.id, {
        clientId: client.id,
        name: input.name,
        domain: input.domain,
      });

      return { client };
    }),
});
