import { z } from 'zod';
import { publicProcedure, router } from '../init';
import db from '@/db/client';
import { InstantlyService } from '@/services/instantly.service';

export const instantlyRouter = router({
  // Push lead to Instantly
  pushLead: publicProcedure
    .input(
      z.object({
        leadId: z.string(),
        listId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { leadId, listId } = input;

      // Fetch lead with all related data
      const lead = await db.lead.findUnique({
        where: { id: leadId },
        include: {
          client: true,
          assets: true,
        },
      });

      if (!lead) {
        throw new Error('Lead not found');
      }

      // Extract basic info from enrichmentData
      const enrichmentData = lead.enrichmentData as any;
      const email = enrichmentData?.emails?.[0] || enrichmentData?.email || '';
      const firstName = enrichmentData?.first_name || enrichmentData?.firstName || '';
      const lastName = enrichmentData?.last_name || enrichmentData?.lastName || '';
      const companyName = enrichmentData?.company || enrichmentData?.current_company || lead.client.name;
      const phone = enrichmentData?.phone || '';
      const website = enrichmentData?.website || lead.client.website || '';

      // Build custom variables from assets
      const customVariables: Record<string, any> = {};
      
      // Add all lead assets as custom variables
      if (lead.assets && lead.assets.length > 0) {
        lead.assets.forEach(asset => {
          // Use asset name as variable key
          customVariables[asset.name] = asset.content;
        });
      }

      // Add research result if available
      if (lead.researchResult) {
        customVariables['research_report'] = lead.researchResult;
      }

      // Add enrichment data as custom variable
      if (enrichmentData) {
        customVariables['enrichment_data'] = JSON.stringify(enrichmentData);
      }

      // Add client info
      customVariables['client_name'] = lead.client.name;
      customVariables['client_website'] = lead.client.website || '';
      customVariables['client_industry'] = lead.client.industry || '';
      customVariables['linkedin_url'] = lead.linkedinSlug;

      // Initialize Instantly service
      const instantlyService = new InstantlyService();

      // Push lead to Instantly
      const result = await instantlyService.pushLead({
        email,
        first_name: firstName,
        last_name: lastName,
        company_name: companyName,
        phone,
        website,
        list_id: listId,
        skip_if_in_workspace: true,
        skip_if_in_list: true,
        custom_variables: customVariables,
      });

      if (!result.success) {
        throw new Error(result.message || 'Failed to push lead to Instantly');
      }

      return {
        success: true,
        message: result.message,
        data: result.data,
      };
    }),

  // Get available lists (for future use)
  getLists: publicProcedure.query(async () => {
    // For now, return hardcoded list
    return {
      lists: [
        {
          id: 'cda07afa-9e2b-4b80-8e66-dcf47d3fdf53',
          name: 'Default List',
        },
      ],
    };
  }),
});
