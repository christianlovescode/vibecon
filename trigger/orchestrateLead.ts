import { logger, task, tasks } from "@trigger.dev/sdk/v3";
import db from "@/db/client";

export const orchestrateLeadTask = task({
  id: "orchestrate-lead",
  maxDuration: 900, // 15 minutes for full pipeline
  run: async (payload: { leadId: string; linkedinUrl: string }) => {
    const { leadId, linkedinUrl } = payload;

    try {
      logger.log("Starting lead orchestration", { leadId, linkedinUrl });

      // Check current status to determine where to start/resume
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

      logger.log("Current lead status", {
        leadId,
        lastStep: lead.lastStep,
        hasEnrichmentData: !!lead.enrichmentData,
      });

      // Determine which step to run based on lastStep
      let shouldRunEnrichment = false;
      let shouldRunResearch = false;

      if (!lead.lastStep) {
        // No step has run yet - start from enrichment
        shouldRunEnrichment = true;
        shouldRunResearch = true;
        logger.log("No previous step - will run enrichment and research");
      } else if (lead.lastStep === "enrichment_failed") {
        // Enrichment failed - retry enrichment and then research
        shouldRunEnrichment = true;
        shouldRunResearch = true;
        logger.log("Enrichment failed - will retry enrichment and research");
      } else if (lead.lastStep === "enrichment_completed") {
        // Enrichment done, need to run research
        shouldRunEnrichment = false;
        shouldRunResearch = true;
        logger.log("Enrichment completed - will run research only");
      } else if (lead.lastStep === "research_failed") {
        // Research failed - retry research only
        shouldRunEnrichment = false;
        shouldRunResearch = true;
        logger.log("Research failed - will retry research only");
      } else if (lead.lastStep === "research_completed") {
        // Everything is done
        logger.log("Pipeline already completed - nothing to do");
        return {
          success: true,
          leadId,
          message: "Pipeline already completed",
        };
      } else if (
        lead.lastStep === "enrichment_started" ||
        lead.lastStep === "research_started"
      ) {
        // A step is currently running or was interrupted
        // For safety, we'll retry based on what data exists
        if (!lead.enrichmentData) {
          shouldRunEnrichment = true;
          shouldRunResearch = true;
          logger.log("Step in progress but no data - will run from enrichment");
        } else {
          shouldRunEnrichment = false;
          shouldRunResearch = true;
          logger.log("Step in progress with data - will run research only");
        }
      }

      // Execute enrichment if needed
      if (shouldRunEnrichment) {
        logger.log("Triggering enrichment task", { leadId });
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
      }

      // Execute research if needed
      if (shouldRunResearch) {
        logger.log("Triggering research task", { leadId });
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
      }

      logger.log("Lead orchestration completed successfully", { leadId });

      return {
        success: true,
        leadId,
        enrichmentRan: shouldRunEnrichment,
        researchRan: shouldRunResearch,
      };
    } catch (error) {
      logger.error("Lead orchestration failed", { error, leadId, linkedinUrl });
      throw error;
    }
  },
});
