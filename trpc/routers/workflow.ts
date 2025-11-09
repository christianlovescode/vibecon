import { z } from 'zod';
import { publicProcedure, router } from '../init';
import db from '@/db/client';

const workflowStepSchema = z.object({
  id: z.string(),
  type: z.enum(['lead_list', 'enrichment', 'research', 'llm', 'warm_intro', 'asset_picker']),
  name: z.string(),
  config: z.record(z.any()),
  position: z.number(),
});

export const workflowRouter = router({
  get: publicProcedure.query(async () => {
    // Get the active workflow or create a default one
    let workflow = await db.workflow.findFirst({
      where: { isActive: true },
    });

    if (!workflow) {
      // Create default workflow based on current orchestrateLead.ts
      workflow = await db.workflow.create({
        data: {
          name: 'Lead Enrichment Workflow',
          isActive: true,
          steps: [
            {
              id: 'step-1',
              type: 'lead_list',
              name: 'Lead List Input',
              config: {
                description: 'Paste LinkedIn profile URLs to begin enrichment',
              },
              position: 0,
            },
            {
              id: 'step-2',
              type: 'enrichment',
              name: 'Lead Enrichment',
              config: {
                provider: 'ProxyCurl',
                description: 'Enrich LinkedIn profiles with detailed data',
              },
              position: 1,
            },
            {
              id: 'step-3',
              type: 'research',
              name: 'Lead Research',
              config: {
                provider: 'Perplexity',
                description: 'Deep research on lead background and company',
              },
              position: 2,
            },
            {
              id: 'step-4',
              type: 'llm',
              name: 'Generate Personalized Emails',
              config: {
                model: 'claude-opus-4',
                prompt: 'Write a personalized outreach email for @lead.name at @lead.company. Use insights from @lead.research to craft a compelling message about how @client.valueProposition can help them. Keep it under 150 words and include a clear call-to-action.',
                structuredOutput: false,
                outputField: 'emails',
              },
              position: 3,
            },
            {
              id: 'step-5',
              type: 'llm',
              name: 'Generate Landing Page',
              config: {
                model: 'gpt-5',
                prompt: 'Create a personalized one-pager for @lead.name showcasing @client.product. Highlight relevant case studies from @client.materials and emphasize ROI. Include: hero section, 3 key benefits, social proof, and clear CTA with @client.calendarUrl.',
                structuredOutput: true,
                outputField: 'landing_page',
              },
              position: 4,
            },
          ],
        },
      });
    }

    return { workflow };
  }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        steps: z.array(workflowStepSchema),
      })
    )
    .mutation(async ({ input }) => {
      const workflow = await db.workflow.update({
        where: { id: input.id },
        data: {
          steps: input.steps,
        },
      });

      return { workflow };
    }),
});
