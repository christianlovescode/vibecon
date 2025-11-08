import { logger, task } from "@trigger.dev/sdk/v3";
import db from "@/db/client";
import { ProAPIsService } from "@/services/proapis.service";

export const enrichLeadTask = task({
  id: "enrich-lead",
  maxDuration: 300, // 5 minutes per lead
  run: async (payload: { leadId: string; linkedinUrl: string }) => {
    const { leadId, linkedinUrl } = payload;

    try {
      logger.log("Starting lead enrichment", { leadId, linkedinUrl });

      // Call ProAPIs service to enrich the LinkedIn profile
      const proAPIsService = new ProAPIsService();
      const enrichmentData = await proAPIsService.enrichLinkedinUrl(
        linkedinUrl
      );

      logger.log("Enrichment data received", {
        leadId,
        dataKeys: Object.keys(enrichmentData),
      });

      // Update lead with enrichment data
      await db.lead.update({
        where: { id: leadId },
        data: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          enrichmentData: enrichmentData as any,
          enrichmentStatus: "completed",
        },
      });

      logger.log("Lead enrichment completed", { leadId });

      return {
        success: true,
        leadId,
      };
    } catch (error) {
      logger.error("Lead enrichment failed", { error, leadId, linkedinUrl });

      // For hackathon purposes, we just log the error and don't update status
      // The lead will remain with null enrichmentData (ENRICHING state)

      await db.lead.update({
        where: { id: leadId },
        data: {
          enrichmentStatus: "failed",
        },
      });

      throw error;
    }
  },
});
