import { logger, task, tasks } from "@trigger.dev/sdk/v3";
import db from "@/db/client";

export const orchestrateLeadTask = task({
  id: "orchestrate-lead",
  maxDuration: 900, // 15 minutes for full pipeline
  run: async (payload: { 
    leadId: string; 
    linkedinUrl: string;
    generateEmails?: boolean;
    generateOnePager?: boolean;
    perplexityModel?: string;
    anthropicModel?: string;
  }) => {
    const { 
      leadId, 
      linkedinUrl, 
      generateEmails = true, 
      generateOnePager = true,
      perplexityModel = 'sonar-pro',
      anthropicModel = 'claude-sonnet-4-5'
    } = payload;

    try {
      logger.log("Starting lead orchestration", { leadId, linkedinUrl });

      // Helper function to fetch fresh status from DB
      const fetchLastStatus = async () => {
        const lead = await db.lead.findUnique({
          where: { id: leadId },
          select: {
            id: true,
            lastStep: true,
            enrichmentData: true,
          },
        });

        if (!lead) {
          throw new Error(`Lead not found: ${leadId}`);
        }

        return lead;
      };

      let enrichmentRan = false;
      let researchRan = false;
      let emailsGenerated = false;
      let landingPageGenerated = false;

      // STEP 1: Check if we need to run enrichment
      let currentStatus = await fetchLastStatus();
      logger.log("Checking enrichment status", {
        leadId,
        lastStep: currentStatus.lastStep,
        hasEnrichmentData: !!currentStatus.enrichmentData,
      });

      const needsEnrichment =
        !currentStatus.lastStep ||
        currentStatus.lastStep === "enrichment_failed" ||
        currentStatus.lastStep === "enrichment_started" ||
        (!currentStatus.enrichmentData && currentStatus.lastStep !== "enrichment_completed");

      if (needsEnrichment) {
        logger.log("Running enrichment task", { leadId });
        const { enrichLeadTask } = await import("@/trigger/enrichLead");

        const enrichResult = await tasks.triggerAndWait(enrichLeadTask.id, {
          leadId,
          linkedinUrl,
        });

        if (!enrichResult.ok) {
          logger.error("Enrichment task failed", { leadId });
          throw new Error("Enrichment task failed");
        }

        logger.log("Enrichment task completed successfully", {
          leadId,
          result: enrichResult.output,
        });
        enrichmentRan = true;
      } else {
        logger.log("Skipping enrichment - already completed", { leadId });
      }

      // STEP 2: Fetch fresh status and check if we need to run research
      currentStatus = await fetchLastStatus();
      logger.log("Checking research status", {
        leadId,
        lastStep: currentStatus.lastStep,
        hasEnrichmentData: !!currentStatus.enrichmentData,
      });

      const needsResearch =
        currentStatus.lastStep === "enrichment_completed" ||
        currentStatus.lastStep === "research_failed" ||
        currentStatus.lastStep === "research_started";

      if (needsResearch) {
        logger.log("Running research task", { leadId });
        const { researchLeadTask } = await import("@/trigger/researchLead");

        const researchResult = await tasks.triggerAndWait(researchLeadTask.id, {
          leadId,
        });

        if (!researchResult.ok) {
          logger.error("Research task failed", { leadId });
          throw new Error("Research task failed");
        }

        logger.log("Research task completed successfully", {
          leadId,
          result: researchResult.output,
        });
        researchRan = true;
      } else if (currentStatus.lastStep === "research_completed") {
        logger.log("Skipping research - already completed", { leadId });
      } else {
        logger.log("Skipping research - enrichment not ready", {
          leadId,
          lastStep: currentStatus.lastStep,
        });
      }

      // STEP 3: Generate email assets if research is completed
      currentStatus = await fetchLastStatus();
      logger.log("Checking asset generation status", {
        leadId,
        lastStep: currentStatus.lastStep,
        generateEmails,
        generateOnePager,
      });

      if (currentStatus.lastStep === "research_completed") {
        // Generate emails if requested
        if (generateEmails) {
          // Check if emails already generated
          const existingEmailAssets = await db.leadAsset.count({
            where: {
              leadId,
              type: "message",
            },
          });

          if (existingEmailAssets === 0) {
            logger.log("Running email generation task", { leadId });
            
            // Update status to emails_started
            await db.lead.update({
              where: { id: leadId },
              data: { lastStep: "emails_started" },
            });
            
            const { generateEmailsTask } = await import("@/trigger/generateEmails");

            const emailResult = await tasks.triggerAndWait(generateEmailsTask.id, {
              leadId,
            });

            if (!emailResult.ok) {
              logger.error("Email generation task failed", { leadId });
              // Update status to emails_failed
              await db.lead.update({
                where: { id: leadId },
                data: { lastStep: "emails_failed" },
              });
              throw new Error("Email generation task failed");
            }

            // Update status to emails_completed
            await db.lead.update({
              where: { id: leadId },
              data: { lastStep: "emails_completed" },
            });

            logger.log("Email generation task completed successfully", {
              leadId,
              result: emailResult.output,
            });
            emailsGenerated = true;
          } else {
            logger.log("Skipping email generation - already generated", {
              leadId,
              existingAssets: existingEmailAssets,
            });
          }
        } else {
          logger.log("Skipping email generation - not requested by user", { leadId });
        }

        // Generate landing page if requested
        if (generateOnePager) {
          // Check if landing page already generated
          const existingLandingPage = await db.leadAsset.count({
            where: {
              leadId,
              type: "landing_page",
            },
          });

          if (existingLandingPage === 0) {
            logger.log("Running landing page generation task", { leadId });
            
            // Update status to landing_page_started
            await db.lead.update({
              where: { id: leadId },
              data: { lastStep: "landing_page_started" },
            });
            
            const { generateLandingPageTask } = await import(
              "@/trigger/generateLandingPage"
            );

            const landingPageResult = await tasks.triggerAndWait(
              generateLandingPageTask.id,
              {
                leadId,
              }
            );

            if (!landingPageResult.ok) {
              logger.error("Landing page generation task failed", { leadId });
              // Update status to landing_page_failed
              await db.lead.update({
                where: { id: leadId },
                data: { lastStep: "landing_page_failed" },
              });
              throw new Error("Landing page generation task failed");
            }

            // Update status to landing_page_completed
            await db.lead.update({
              where: { id: leadId },
              data: { lastStep: "landing_page_completed" },
            });

            logger.log("Landing page generation task completed successfully", {
              leadId,
              result: landingPageResult.output,
            });
            landingPageGenerated = true;
          } else {
            logger.log("Skipping landing page generation - already generated", {
              leadId,
              existingAssets: existingLandingPage,
            });
          }
        } else {
          logger.log("Skipping landing page generation - not requested by user", { leadId });
        }
      } else {
        logger.log("Skipping asset generation - research not completed", {
          leadId,
          lastStep: currentStatus.lastStep,
        });
      }

      logger.log("Lead orchestration completed successfully", { leadId });

      return {
        success: true,
        leadId,
        enrichmentRan,
        researchRan,
        emailsGenerated,
        landingPageGenerated,
      };
    } catch (error) {
      logger.error("Lead orchestration failed", { error, leadId, linkedinUrl });
      throw error;
    }
  },
});
