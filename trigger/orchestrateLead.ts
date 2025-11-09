import { logger, task, tasks } from "@trigger.dev/sdk/v3";
import db from "@/db/client";

export const orchestrateLeadTask = task({
  id: "orchestrate-lead",
  maxDuration: 900, // 15 minutes for full pipeline
  run: async (payload: { leadId: string; linkedinUrl: string }) => {
    const { leadId, linkedinUrl } = payload;

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

      logger.log("Lead orchestration completed successfully", { leadId });

      return {
        success: true,
        leadId,
        enrichmentRan,
        researchRan,
      };
    } catch (error) {
      logger.error("Lead orchestration failed", { error, leadId, linkedinUrl });
      throw error;
    }
  },
});
