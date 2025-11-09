import { z } from 'zod';
import { publicProcedure, router } from '../init';
import db from '@/db/client';
import { tasks } from "@trigger.dev/sdk/v3";

export const leadRouter = router({
  // Get all leads with client info
  list: publicProcedure.query(async () => {
    const leads = await db.lead.findMany({
      select: {
        id: true,
        linkedinSlug: true,
        enrichmentData: true,
        enrichmentStatus: true,
        lastStep: true,
        researchResult: true,
        createdAt: true,
        updatedAt: true,
        client: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return { leads };
  }),

  // Get individual lead by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const lead = await db.lead.findUnique({
        where: { id: input.id },
        include: {
          client: {
            select: {
              id: true,
              name: true,
            },
          },
          assets: {
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      });

      if (!lead) {
        throw new Error('Lead not found');
      }

      return { lead };
    }),

  // Get assets for a lead
  getAssets: publicProcedure
    .input(z.object({ leadId: z.string() }))
    .query(async ({ input }) => {
      const assets = await db.leadAsset.findMany({
        where: { leadId: input.leadId },
        orderBy: {
          createdAt: 'asc',
        },
      });

      return { assets };
    }),

  // Create multiple leads from CSV input
  createBulk: publicProcedure
    .input(
      z.object({
        clientId: z.string().min(1, 'Client is required'),
        linkedinUrls: z.array(z.string().url('Must be valid URLs')).min(1, 'At least one LinkedIn URL is required'),
      })
    )
    .mutation(async ({ input }) => {
      const { clientId, linkedinUrls } = input;

      // Verify client exists
      const client = await db.client.findUnique({
        where: { id: clientId },
      });

      if (!client) {
        throw new Error('Client not found');
      }

      // Create all leads in database first
      const createdLeads = await Promise.all(
        linkedinUrls.map(async (url) => {
          const lead = await db.lead.create({
            data: {
              clientId,
              linkedinSlug: url, // Store full URL as per user requirement
              enrichmentData: undefined, // null indicates enriching
              lastStep: null, // Will be set by orchestrator
            },
          });
          return lead;
        })
      );

      // Trigger orchestrator tasks for each lead
      const { orchestrateLeadTask } = await import("@/trigger/orchestrateLead");
      
      await Promise.all(
        createdLeads.map(async (lead) => {
          await tasks.trigger(orchestrateLeadTask.id, {
            leadId: lead.id,
            linkedinUrl: lead.linkedinSlug,
          });
        })
      );

      return { 
        leads: createdLeads,
        count: createdLeads.length 
      };
    }),
});
