import { logger, task } from "@trigger.dev/sdk/v3";
import { anthropic } from "@ai-sdk/anthropic";
import { generateText, generateObject } from "ai";
import { z } from "zod";
import db from "@/db/client";
import { perplexity } from "@ai-sdk/perplexity";

// Schema for extracting structured data from enrichment
const LeadStructuredDataSchema = z.object({
  name: z.string().nullable(),
  title: z.string().nullable(),
  linkedinProfileUrl: z.string().nullable(),
  currentCompany: z.string().nullable(),
  currentCompanyLinkedin: z.string().nullable(),
  currentCompanyUrl: z.string().nullable(),
  location: z.string().nullable(),
  education: z.string().nullable(),
});

export const researchLeadTask = task({
  id: "research-lead",
  maxDuration: 600, // 10 minutes for comprehensive research
  run: async (payload: { leadId: string }) => {
    const { leadId } = payload;

    try {
      logger.log("Starting lead research", { leadId });

      // Update status to research_started
      await db.lead.update({
        where: { id: leadId },
        data: { lastStep: "research_started" },
      });

      // Fetch lead with client data
      const lead = await db.lead.findUnique({
        where: { id: leadId },
        include: {
          client: {
            include: {
              featureOrServices: true,
              marketingMaterials: true,
              testimonials: true,
            },
          },
        },
      });

      if (!lead) {
        throw new Error(`Lead not found: ${leadId}`);
      }

      if (!lead.enrichmentData) {
        throw new Error(`Lead has no enrichment data: ${leadId}`);
      }

      logger.log("Phase 1: Extracting structured data from enrichment");

      // Step 1: Extract structured data from unstructured enrichmentData
      const structuredData = await generateObject({
        model: anthropic("claude-sonnet-4-5"),
        schema: LeadStructuredDataSchema,
        prompt: `You are analyzing enriched LinkedIn profile data. Extract the following information in a structured format:

- name: Full name of the person
- title: Current job title
- linkedinProfileUrl: Their LinkedIn profile URL
- currentCompany: Name of their current company
- currentCompanyLinkedin: LinkedIn URL of their current company (if available)
- currentCompanyUrl: Website URL of their current company (if available)
- location: Their location/city
- education: Summary of their education background

Here is the unstructured enrichment data:
${JSON.stringify(lead.enrichmentData, null, 2)}

Extract as much information as possible. If a field is not available, return null.`,
      });

      logger.log("Structured data extracted", {
        leadId,
        data: structuredData.object,
      });

      logger.log("Phase 2: Researching current company");

      // Step 2: Research the current company
      let companyResearch = "";
      if (structuredData.object.currentCompany) {
        const companyPrompt = `Research the company "${structuredData.object.currentCompany}"${
          structuredData.object.currentCompanyUrl
            ? ` (${structuredData.object.currentCompanyUrl})`
            : ""
        }. 

Provide comprehensive information about:
1. What they do (products/services)
2. Who their customers are (target market and notable clients)
3. Where they are based (headquarters location)
4. How big they are (employee count, revenue if available)
5. Any recent news or announcements (last 6 months)
6. Recent LinkedIn posts or updates
7. Recent Twitter/X posts or updates
8. Recent YouTube videos or content
9. Recent blog posts or thought leadership

Be thorough and detailed in your research.`;

        const companyResponse = await generateText({
          model: perplexity("sonar-pro"),
          prompt: companyPrompt,
        });

        companyResearch = companyResponse.text;
        logger.log("Company research completed", {
          leadId,
          researchLength: companyResearch.length,
        });
      } else {
        companyResearch =
          "Unable to research company - company name not found in enrichment data.";
        logger.log("Skipping company research - no company name");
      }

      logger.log("Phase 3: Analyzing lead relevance and generating report");

      // Step 3: Analyze and generate research report
      const client = lead.client;

      // Prepare client context
      const clientContext = `
CLIENT INFORMATION:
- Name: ${client.name}
- Website: ${client.website || "N/A"}
- Industry: ${client.industry || "N/A"}
- Company Summary: ${client.companySummary || "N/A"}
- Target Customer: ${client.targetCustomer || "N/A"}
- Value Proposition: ${client.valueProposition || "N/A"}
- Location: ${client.location || "N/A"}
- Headcount: ${client.headcount || "N/A"}

FEATURES/SERVICES OFFERED:
${
  client.featureOrServices.length > 0
    ? client.featureOrServices
        .map((f) => `- ${f.title}: ${f.description || ""}`)
        .join("\n")
    : "No features/services documented yet."
}

TESTIMONIALS:
${
  client.testimonials.length > 0
    ? client.testimonials
        .map((t) => `- ${t.name} (${t.title}): "${t.quote}"`)
        .join("\n")
    : "No testimonials available yet."
}

MARKETING MATERIALS:
${
  client.marketingMaterials.length > 0
    ? client.marketingMaterials
        .map(
          (m) =>
            `- ${m.title} (${m.assetType}): ${m.description || ""} - ${m.url}`
        )
        .join("\n")
    : "No marketing materials available yet."
}
`;

      const analysisPrompt = `You are a sales research analyst. Your job is to analyze a LEAD and determine why they would be interested in the CLIENT's offering. The goal is to create hyper-relevant, personalized cold outreach that doesn't feel personalized - it should just feel RELEVANT.

LEAD PROFILE:
${JSON.stringify(structuredData.object, null, 2)}

LEAD'S CURRENT COMPANY RESEARCH:
${companyResearch}

${clientContext}

Based on this information, generate a comprehensive research report in the following markdown format:

# Lead Research: [Lead Name]

## Lead Profile
- Name: [Name]
- Title: [Title]
- Company: [Current Company]
- LinkedIn: [LinkedIn URL]
- Company LinkedIn: [Company LinkedIn if available]
- Company Website: [Company URL if available]
- Location: [Location]
- Education: [Education summary]

## Company Analysis
[Detailed analysis of what the lead's company does, their customers, size, recent activities, challenges they might face in their industry]

## Why They'd Be Interested
[Analyze the lead's role, their company's situation, and explain specifically why the CLIENT's solution would be relevant to them. Focus on pain points, challenges, and how the CLIENT addresses them. Be specific and thoughtful.]

## Recommended Talking Points
[List 3-5 specific talking points that connect the CLIENT's value proposition to the LEAD's likely challenges and interests. These should be concrete and actionable for a sales conversation.]

## Recommended Assets to Share
[Based on the CLIENT's marketing materials, recommend which specific assets would be most relevant to this lead and why. If no materials are available, suggest "No specific assets documented yet - consider sharing general company overview."]

## Recommended Testimonials to Share
[Based on the CLIENT's testimonials, recommend which testimonials would resonate most with this lead based on industry, role, or use case similarity. If no testimonials are available, suggest "No testimonials documented yet - consider sharing case study or success metrics."]

Generate a thorough, insightful report that would help a salesperson have a highly relevant conversation with this lead.`;

      const reportResponse = await generateText({
        model: anthropic("claude-sonnet-4-5"),
        prompt: analysisPrompt,
      });

      const researchReport = reportResponse.text;
      logger.log("Research report generated", {
        leadId,
        reportLength: researchReport.length,
      });

      logger.log("Phase 4: Saving research result to database");

      // Step 4: Save research result to database
      await db.lead.update({
        where: { id: leadId },
        data: {
          researchResult: researchReport,
          lastStep: "research_completed",
        },
      });

      logger.log("Lead research completed successfully", { leadId });

      return {
        success: true,
        leadId,
        reportLength: researchReport.length,
      };
    } catch (error) {
      logger.error("Lead research failed", { error, leadId });

      // Update status to research_failed
      await db.lead.update({
        where: { id: leadId },
        data: {
          lastStep: "research_failed",
        },
      });

      throw error;
    }
  },
});
