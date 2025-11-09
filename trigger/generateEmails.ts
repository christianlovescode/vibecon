import { logger, task } from "@trigger.dev/sdk/v3";
import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import db from "@/db/client";

export const generateEmailsTask = task({
  id: "generate-emails",
  maxDuration: 300, // 5 minutes
  run: async (payload: { leadId: string }) => {
    const { leadId } = payload;

    try {
      logger.log("Starting email generation", { leadId });

      // Fetch lead with client and research data
      const lead = await db.lead.findUnique({
        where: { id: leadId },
        include: {
          client: true,
        },
      });

      if (!lead) {
        throw new Error(`Lead not found: ${leadId}`);
      }

      if (!lead.researchResult) {
        throw new Error(`Lead has no research result: ${leadId}`);
      }

      const client = lead.client;

      // Generate initial outreach subject
      logger.log("Generating initial outreach subject");
      const initialSubjectResponse = await generateText({
        model: anthropic("claude-sonnet-4-5"),
        prompt: `You are writing a cold email subject line for ${client.name} to reach out to a lead.

RESEARCH REPORT:
${lead.researchResult}

Write a subject line that:
- Is 5-8 words max
- References something specific from the research (their company, a pain point, or relevant news)
- Sounds natural, not sales-y
- Avoids phrases like "Quick question", "Touching base", "Following up"
- Makes them curious enough to open

Return ONLY the subject line, nothing else.`,
      });

      const initialSubject = initialSubjectResponse.text.trim();
      logger.log("Initial subject generated", { initialSubject });

      // Generate initial outreach body
      logger.log("Generating initial outreach body");
      const initialBodyResponse = await generateText({
        model: anthropic("claude-sonnet-4-5"),
        prompt: `You are writing a cold email body for ${client.name} to reach out to a lead.

RESEARCH REPORT:
${lead.researchResult}

CLIENT INFO:
- Name: ${client.name}
- Value Proposition: ${client.valueProposition || "N/A"}
- What they do: ${client.companySummary || "N/A"}

Write an email body that:
- Is exactly 2-3 sentences
- References a specific talking point or insight from the research
- Explains how ${client.name} can help with a relevant pain point
- Ends with a simple, low-pressure call to action (e.g., "Worth a quick chat?" or "Open to exploring this?")
- Sounds conversational and direct
- AVOIDS phrases like "Hope this finds you well", "I hope this email finds you", "Reaching out to", "I wanted to touch base"
- AVOIDS overly formal or sales-y language

Return ONLY the email body (2-3 sentences), nothing else.`,
      });

      const initialBody = initialBodyResponse.text.trim();
      logger.log("Initial body generated", { initialBody });

      // Generate followup outreach subject
      logger.log("Generating followup outreach subject");
      const followupSubjectResponse = await generateText({
        model: anthropic("claude-sonnet-4-5"),
        prompt: `You are writing a followup email subject line for ${client.name}. The lead didn't respond to the initial email.

RESEARCH REPORT:
${lead.researchResult}

INITIAL EMAIL SUBJECT: ${initialSubject}

Write a followup subject line that:
- Is 5-8 words max
- Takes a different angle than the initial subject
- References something else from the research
- Sounds natural and conversational
- Makes them want to open it

Return ONLY the subject line, nothing else.`,
      });

      const followupSubject = followupSubjectResponse.text.trim();
      logger.log("Followup subject generated", { followupSubject });

      // Generate followup outreach body
      logger.log("Generating followup outreach body");
      const followupBodyResponse = await generateText({
        model: anthropic("claude-sonnet-4-5"),
        prompt: `You are writing a followup email body for ${client.name}. The lead didn't respond to the initial email.

RESEARCH REPORT:
${lead.researchResult}

INITIAL EMAIL BODY: ${initialBody}

CLIENT INFO:
- Name: ${client.name}
- Value Proposition: ${client.valueProposition || "N/A"}

Write a followup email body that:
- Is exactly 2-3 sentences
- Takes a different angle or adds new information
- References a different talking point from the research
- Acknowledges they're busy without being apologetic
- Ends with a simple question or call to action
- Sounds conversational and direct
- AVOIDS phrases like "Just following up", "Bumping this up", "Circling back", "Did you get my last email?"

Return ONLY the email body (2-3 sentences), nothing else.`,
      });

      const followupBody = followupBodyResponse.text.trim();
      logger.log("Followup body generated", { followupBody });

      // Save all assets to database
      logger.log("Saving email assets to database");

      await db.leadAsset.createMany({
        data: [
          {
            leadId,
            type: "message",
            content: initialSubject,
            name: "initial_outreach_subject",
          },
          {
            leadId,
            type: "message",
            content: initialBody,
            name: "initial_outreach_body",
          },
          {
            leadId,
            type: "message",
            content: followupSubject,
            name: "followup_outreach_subject",
          },
          {
            leadId,
            type: "message",
            content: followupBody,
            name: "followup_outreach_body",
          },
        ],
      });

      logger.log("Email generation completed successfully", { leadId });

      return {
        success: true,
        leadId,
        assetsGenerated: 4,
        assets: {
          initialSubject,
          initialBody,
          followupSubject,
          followupBody,
        },
      };
    } catch (error) {
      logger.error("Email generation failed", { error, leadId });
      throw error;
    }
  },
});
