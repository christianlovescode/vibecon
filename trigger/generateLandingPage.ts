import { logger, task } from "@trigger.dev/sdk/v3";
import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import db from "@/db/client";
import { v0 } from "v0-sdk";

export const generateLandingPageTask = task({
  id: "generate-landing-page",
  maxDuration: 300, // 5 minutes
  run: async (payload: { leadId: string }) => {
    const { leadId } = payload;

    try {
      logger.log("Starting landing page generation", { leadId });

      // Fetch lead with client and research data
      const lead = await db.lead.findUnique({
        where: { id: leadId },
        include: {
          client: {
            include: {
              featureOrServices: true,
              testimonials: true,
              marketingMaterials: true,
            },
          },
        },
      });

      if (!lead) {
        throw new Error(`Lead not found: ${leadId}`);
      }

      if (!lead.researchResult) {
        throw new Error(`Lead has no research result: ${leadId}`);
      }

      const client = lead.client;

      // First, generate a contextualized prompt for the landing page
      logger.log("Generating landing page prompt");
      const promptResponse = await generateText({
        model: anthropic("claude-sonnet-4-5"),
        prompt: `You are creating a V0 prompt to generate a hyper-relevant landing page for a lead.

RESEARCH REPORT:
${lead.researchResult}

CLIENT INFO:
- Name: ${client.name}
- Website: ${client.website || "N/A"}
- Industry: ${client.industry || "N/A"}
- Company Summary: ${client.companySummary || "N/A"}
- Target Customer: ${client.targetCustomer || "N/A"}
- Value Proposition: ${client.valueProposition || "N/A"}

FEATURES/SERVICES:
${
  client.featureOrServices.length > 0
    ? client.featureOrServices
        .map((f) => `- ${f.title}: ${f.description || ""}`)
        .join("\n")
    : "No features documented"
}

TESTIMONIALS:
${
  client.testimonials.length > 0
    ? client.testimonials
        .map((t) => `- ${t.name} (${t.title}): "${t.quote}"`)
        .join("\n")
    : "No testimonials available"
}

Write a detailed V0 prompt to generate a landing page that:
1. Speaks directly to the lead's pain points and interests (from the research)
2. Highlights how ${client.name} solves their specific challenges
3. Uses the talking points from the research
4. Features the client's services/features that are most relevant
5. Includes relevant testimonials if available
6. Has a clear, simple call to action
7. Feels personalized without being creepy

The landing page should be clean, modern, and conversion-focused. Include sections for:
- Hero section (with personalized headline addressing their specific challenge)
- Problem/solution fit (why this is relevant to them)
- Key features/benefits (only the most relevant ones)
- Social proof (testimonials if available)
- Clear CTA

Write a comprehensive V0 prompt that will generate this landing page. Be specific about the messaging and structure.`,
      });

      const v0Prompt = promptResponse.text;
      logger.log("Landing page prompt generated", {
        promptLength: v0Prompt.length,
      });

      // Call V0 SDK to generate the landing page from GitHub template
      logger.log("Initializing V0 chat from GitHub template");

      const v0ApiKey = process.env.V0_API_KEY;
      if (!v0ApiKey) {
        throw new Error("V0_API_KEY not found in environment variables");
      }

      // Get project ID from environment (optional)
      const projectId = process.env.V0_PROJECT_ID;

      // Initialize chat from GitHub repository template
      const chat = await v0.chats.init({
        type: 'repo',
        repo: {
          url: 'https://github.com/christianlovescode/v0-customizable-sales-one-pager',
          branch: 'main',
        },
        projectId: projectId || undefined,
        name: `Landing Page for ${lead.company || lead.name || 'Lead'}`,
      });

      logger.log("V0 chat initialized from template", {
        chatId: chat.id,
        templateRepo: 'v0-customizable-sales-one-pager',
      });

      // Send customization message to personalize the template
      logger.log("Sending customization message to V0");
      const customizationResponse = await v0.chats.sendMessage({
        chatId: chat.id,
        message: v0Prompt,
        responseMode: "sync",
      });

      // Type assertion since we're using sync mode
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updatedChat = customizationResponse as any;

      logger.log("V0 chat customized successfully", {
        chatId: updatedChat.id,
        url: updatedChat.url,
        hasVersion: !!updatedChat.version,
        versionStatus: updatedChat.version?.status,
      });

      // Get the preview URL from the version or fallback to chat URL
      const landingPageUrl =
        updatedChat.version?.previewUrl ||
        updatedChat.url ||
        `https://v0.dev/chat/${updatedChat.id}`;

      // publish the landing page

      const result = await v0.deployments.create({
        projectId: updatedChat.projectId,
        chatId: updatedChat.id,
        versionId: updatedChat.version?.id,
      });

      console.log("DEPLOYMENT RESULT", result);

      logger.log("Landing page generated", { landingPageUrl });

      // Save the landing page asset to database
      logger.log("Saving landing page asset to database");

      await db.leadAsset.create({
        data: {
          leadId,
          type: "landing_page",
          content: result.webUrl,
          name: "landing_page_url",
        },
      });

      logger.log("Landing page generation completed successfully", { leadId });

      return {
        success: true,
        leadId,
        landingPageUrl,
      };
    } catch (error) {
      logger.error("Landing page generation failed", { error, leadId });
      throw error;
    }
  },
});
