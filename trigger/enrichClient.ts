import { logger, task } from "@trigger.dev/sdk/v3";
import { anthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText, generateObject } from "ai";
import { z } from "zod";
import { Resend } from "resend";
import db from "@/db/client";

// Initialize Perplexity via OpenAI SDK
const perplexity = createOpenAI({
  apiKey: process.env.PERPLEXITY_API_KEY!,
  baseURL: "https://api.perplexity.ai/",
});

const resend = new Resend(process.env.RESEND_API_KEY);

// Zod schemas for structured extraction
const CompanyInfoSchema = z.object({
  industry: z.string().nullable(),
  companySummary: z.string().nullable(),
  targetCustomer: z.string().nullable(),
  valueProposition: z.string().nullable(),
  location: z.string().nullable(),
  headcount: z.number().nullable(),
  linkedinUrl: z.string().nullable(),
  twitterUrl: z.string().nullable(),
});

const FeatureSchema = z.object({
  title: z.string(),
  description: z.string().nullable(),
});

const TestimonialSchema = z.object({
  name: z.string(),
  title: z.string(),
  quote: z.string(),
});

const BrandingAssetSchema = z.object({
  url: z.string(),
  assetType: z.string().nullable(),
});

const MarketingMaterialSchema = z.object({
  url: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  assetType: z.string(),
  previewImageUrl: z.string().nullable(),
});

const CompanyResearchSchema = z.object({
  companyInfo: CompanyInfoSchema,
  features: z.array(FeatureSchema),
  testimonials: z.array(TestimonialSchema),
});

const BrandingResearchSchema = z.object({
  brandingAssets: z.array(BrandingAssetSchema),
});

const MarketingResearchSchema = z.object({
  marketingMaterials: z.array(MarketingMaterialSchema),
});

export const enrichClientTask = task({
  id: "enrich-client",
  maxDuration: 600, // 10 minutes for comprehensive research
  run: async (payload: { clientId: string; name: string; domain: string }) => {
    const { clientId, name, domain } = payload;

    try {
      logger.log("Starting client enrichment", { clientId, name, domain });

      // Update status to enriching
      await db.client.update({
        where: { id: clientId },
        data: { enrichmentStatus: "enriching" },
      });

      logger.log("Phase 1: Fetching company meta information from Perplexity");

      // Phase 1: Get company meta information
      const companyInfoPrompt = `You are tasked with researching ${name} (${domain}). Please research them thoroughly and generate a report answering the following questions:

- industry
- company summary (ie high level what they do)
- target customer (who do they sell to, who have they sold to, notable customers)
- value proposition (why should customers care about them, what makes them special?)
- head quarter location
- estimated head count
- features or services offered
- testimonials
- linkedin url
- twitter url

Format your response as structured as possible. Every field here is important to capture, but if you're unable to just return "I couldn't find anything for <field name>".`;

      const companyInfoResponse = await generateText({
        model: perplexity("llama-3.1-sonar-large-128k-online"),
        prompt: companyInfoPrompt,
      });

      logger.log("Phase 1 complete", {
        responseLength: companyInfoResponse.text.length,
      });

      logger.log("Phase 2: Fetching branding assets from Perplexity");

      // Phase 2: Get branding assets
      const brandingPrompt = `You are tasked with finding public links/urls to branding assets for ${name} (${domain}). Please research thoroughly and a list of links that point to their branding assets. You should capture the asset type (logo, wordmark, etc) and give a url of where it lives.`;

      const brandingResponse = await generateText({
        model: perplexity("llama-3.1-sonar-large-128k-online"),
        prompt: brandingPrompt,
      });

      logger.log("Phase 2 complete", {
        responseLength: brandingResponse.text.length,
      });

      logger.log("Phase 3: Fetching marketing materials from Perplexity");

      // Phase 3: Get marketing material
      const marketingPrompt = `You are tasked with finding public marketing material for ${name} (${domain}). Please research thoroughly and provide a list of links that point to their marketing assets. You should capture the url, title, description, preview image url, and asset type (ie blog post, podcast, video, tweet, white paper, etc.)`;

      const marketingResponse = await generateText({
        model: perplexity("llama-3.1-sonar-large-128k-online"),
        prompt: marketingPrompt,
      });

      logger.log("Phase 3 complete", {
        responseLength: marketingResponse.text.length,
      });

      logger.log("Phase 4: Extracting structured data with Anthropic");

      // Phase 4: Extract structured data using Anthropic
      const structuredPrompt = `Extract structured data from the following research about ${name}:

COMPANY INFO RESEARCH:
${companyInfoResponse.text}

BRANDING RESEARCH:
${brandingResponse.text}

MARKETING RESEARCH:
${marketingResponse.text}

Extract all the information in a structured format. For fields you can't find, return null. For lists, return empty arrays if nothing is found.`;

      // Extract company info and features/testimonials
      const companyData = await generateObject({
        model: anthropic("claude-3-5-sonnet-20241022"),
        schema: CompanyResearchSchema,
        prompt: structuredPrompt,
      });

      logger.log("Company data extracted", {
        featuresCount: companyData.object.features.length,
        testimonialsCount: companyData.object.testimonials.length,
      });

      // Extract branding assets
      const brandingData = await generateObject({
        model: anthropic("claude-3-5-sonnet-20241022"),
        schema: BrandingResearchSchema,
        prompt: structuredPrompt,
      });

      logger.log("Branding data extracted", {
        assetsCount: brandingData.object.brandingAssets.length,
      });

      // Extract marketing materials
      const marketingData = await generateObject({
        model: anthropic("claude-3-5-sonnet-20241022"),
        schema: MarketingResearchSchema,
        prompt: structuredPrompt,
      });

      logger.log("Marketing data extracted", {
        materialsCount: marketingData.object.marketingMaterials.length,
      });

      logger.log("Phase 5: Saving data to database");

      // Phase 5: Save to database
      await db.client.update({
        where: { id: clientId },
        data: {
          industry: companyData.object.companyInfo.industry,
          companySummary: companyData.object.companyInfo.companySummary,
          targetCustomer: companyData.object.companyInfo.targetCustomer,
          valueProposition: companyData.object.companyInfo.valueProposition,
          location: companyData.object.companyInfo.location,
          headcount: companyData.object.companyInfo.headcount,
          linkedinUrl: companyData.object.companyInfo.linkedinUrl,
          twitterUrl: companyData.object.companyInfo.twitterUrl,
          enrichmentStatus: "completed",
        },
      });

      // Save features/services
      if (companyData.object.features.length > 0) {
        await db.featureOrService.createMany({
          data: companyData.object.features.map((feature) => ({
            clientId,
            title: feature.title,
            description: feature.description,
          })),
        });
      }

      // Save testimonials
      if (companyData.object.testimonials.length > 0) {
        await db.testimonial.createMany({
          data: companyData.object.testimonials.map((testimonial) => ({
            clientId,
            name: testimonial.name,
            title: testimonial.title,
            quote: testimonial.quote,
          })),
        });
      }

      // Save branding assets
      if (brandingData.object.brandingAssets.length > 0) {
        await db.logoAndBranding.createMany({
          data: brandingData.object.brandingAssets.map((asset) => ({
            clientId,
            url: asset.url,
            assetType: asset.assetType,
          })),
        });
      }

      // Save marketing materials
      if (marketingData.object.marketingMaterials.length > 0) {
        await db.marketingMaterial.createMany({
          data: marketingData.object.marketingMaterials.map((material) => ({
            clientId,
            url: material.url,
            title: material.title,
            description: material.description,
            assetType: material.assetType,
            previewImageUrl: material.previewImageUrl,
          })),
        });
      }

      logger.log("Database save complete");

      logger.log("Phase 6: Sending email notification");

      // Phase 6: Send email notification
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const clientUrl = `${appUrl}/clients/${clientId}`;

      await resend.emails.send({
        from: "christian@dunbarbeta.com",
        to: "christian@dunbarbeta.com",
        subject: `Client Enrichment Complete: ${name}`,
        html: `
          <h2>Client Enrichment Complete</h2>
          <p>The automated enrichment process has completed for <strong>${name}</strong>.</p>
          <p><strong>Human review required.</strong></p>
          <p>
            <a href="${clientUrl}" style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 6px; margin-top: 16px;">
              Review Client →
            </a>
          </p>
          <hr style="margin: 24px 0; border: none; border-top: 1px solid #eaeaea;" />
          <p style="color: #666; font-size: 14px;">
            <strong>Summary:</strong><br/>
            • Features/Services: ${companyData.object.features.length}<br/>
            • Testimonials: ${companyData.object.testimonials.length}<br/>
            • Branding Assets: ${brandingData.object.brandingAssets.length}<br/>
            • Marketing Materials: ${marketingData.object.marketingMaterials.length}
          </p>
        `,
      });

      logger.log("Email sent successfully");

      return {
        success: true,
        clientId,
        stats: {
          features: companyData.object.features.length,
          testimonials: companyData.object.testimonials.length,
          brandingAssets: brandingData.object.brandingAssets.length,
          marketingMaterials: marketingData.object.marketingMaterials.length,
        },
      };
    } catch (error) {
      logger.error("Enrichment failed", { error, clientId });

      // Update status to failed
      await db.client.update({
        where: { id: clientId },
        data: {
          enrichmentStatus: "failed",
          enrichmentError: error instanceof Error ? error.message : "Unknown error",
        },
      });

      throw error;
    }
  },
});
