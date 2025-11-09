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
        _count: {
          select: {
            assets: true,
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
        generateEmails: z.boolean().optional().default(true),
        generateOnePager: z.boolean().optional().default(true),
        modelTier: z.enum(['production', 'development']).optional().default('production'),
      })
    )
    .mutation(async ({ input }) => {
      const { clientId, linkedinUrls, generateEmails, generateOnePager, modelTier } = input;

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

      // Trigger orchestrator tasks for each lead and store run IDs
      const { orchestrateLeadTask } = await import("@/trigger/orchestrateLead");
      
      await Promise.all(
        createdLeads.map(async (lead) => {
          const handle = await tasks.trigger(orchestrateLeadTask.id, {
            leadId: lead.id,
            linkedinUrl: lead.linkedinSlug,
            generateEmails,
            generateOnePager,
          });
          
          // Store the run ID in the lead for real-time tracking
          await db.lead.update({
            where: { id: lead.id },
            data: { triggerRunId: handle.id },
          });
        })
      );

      return { 
        leads: createdLeads,
        count: createdLeads.length 
      };
    }),

  // Export leads by client as CSV
  exportByClient: publicProcedure
    .input(z.object({ clientId: z.string() }))
    .mutation(async ({ input }) => {
      // Fetch all leads for this client with full relationships
      const leads = await db.lead.findMany({
        where: { clientId: input.clientId },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              website: true,
              industry: true,
              location: true,
            },
          },
          assets: {
            select: {
              name: true,
              content: true,
              type: true,
            },
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (leads.length === 0) {
        return { csv: '', count: 0 };
      }

      // Collect all unique asset names across all leads
      const assetNames = new Set<string>();
      leads.forEach(lead => {
        lead.assets.forEach(asset => {
          assetNames.add(asset.name);
        });
      });

      const sortedAssetNames = Array.from(assetNames).sort();

      // Build CSV headers
      const headers = [
        'id',
        'client_id',
        'client_name',
        'client_website',
        'client_industry',
        'client_location',
        'linkedin_url',
        'enrichment_status',
        'last_step',
        'created_at',
        'updated_at',
        ...sortedAssetNames,
      ];

      // Build CSV rows
      const rows = leads.map(lead => {
        // Create asset map: name -> content
        const assetMap = new Map<string, string>();
        lead.assets.forEach(asset => {
          assetMap.set(asset.name, asset.content);
        });

        // Build row with base fields + asset columns
        const row = [
          lead.id,
          lead.client.id,
          lead.client.name,
          lead.client.website || '',
          lead.client.industry || '',
          lead.client.location || '',
          lead.linkedinSlug,
          lead.enrichmentStatus || '',
          lead.lastStep || '',
          lead.createdAt.toISOString(),
          lead.updatedAt.toISOString(),
          ...sortedAssetNames.map(assetName => assetMap.get(assetName) || ''),
        ];

        return row;
      });

      // Convert to CSV string (proper escaping for fields with commas/quotes)
      const escapeCsvField = (field: string): string => {
        if (field.includes(',') || field.includes('"') || field.includes('\n')) {
          return `"${field.replace(/"/g, '""')}"`;
        }
        return field;
      };

      const csvLines = [
        headers.map(escapeCsvField).join(','),
        ...rows.map(row => row.map(field => escapeCsvField(String(field))).join(',')),
      ];

      const csv = csvLines.join('\n');

      return { csv, count: leads.length };
    }),
});
