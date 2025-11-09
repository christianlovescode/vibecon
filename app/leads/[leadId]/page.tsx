"use client";

import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Card,
  Badge,
  Separator,
} from "@radix-ui/themes";
import { trpc } from "@/trpc/client";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function LeadDetailPage() {
  const router = useRouter();
  const params = useParams();
  const leadId = params.leadId as string;

  const { data, isLoading, error } = trpc.lead.getById.useQuery(
    { id: leadId },
    {
      refetchInterval: (query) => {
        // Auto-refetch every 5 seconds if lead is still processing
        const lastStep = query.state.data?.lead?.lastStep;
        const isProcessing =
          !lastStep ||
          lastStep === "enrichment_started" ||
          lastStep === "research_started";
        return isProcessing ? 5000 : false;
      },
    }
  );

  const getStatusBadge = (lastStep: string | null) => {
    if (!lastStep) {
      return (
        <Badge color="gray" size="2">
          PENDING
        </Badge>
      );
    }

    switch (lastStep) {
      case "enrichment_started":
        return (
          <Badge color="blue" size="2">
            ENRICHING
          </Badge>
        );
      case "enrichment_completed":
        return (
          <Badge color="cyan" size="2">
            ENRICHED
          </Badge>
        );
      case "enrichment_failed":
        return (
          <Badge color="red" size="2">
            ENRICH FAILED
          </Badge>
        );
      case "research_started":
        return (
          <Badge color="blue" size="2">
            RESEARCHING
          </Badge>
        );
      case "research_completed":
        return (
          <Badge color="green" size="2">
            COMPLETED
          </Badge>
        );
      case "research_failed":
        return (
          <Badge color="red" size="2">
            RESEARCH FAILED
          </Badge>
        );
      default:
        return (
          <Badge color="gray" size="2">
            {lastStep.toUpperCase()}
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <Box className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Text>Loading lead details...</Text>
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Text color="red">Error loading lead: {error?.message}</Text>
      </Box>
    );
  }

  const { lead } = data;

  return (
    <Box className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <Flex align="center" gap="4" className="py-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/leads")}
          data-testid="back-to-leads-button"
        >
          <ArrowLeft size={20} />
          Back to Leads
        </Button>
      </Flex>

      {/* Lead Overview */}
      <Card className="mb-6" data-testid="lead-overview-card">
        <Flex justify="between" align="start" className="mb-4">
          <div>
            <Heading size="6" className="mb-2">
              Lead Details
            </Heading>
            <Text size="2" color="gray">
              Client: {lead.client.name}
            </Text>
          </div>
          {getStatusBadge(lead.lastStep)}
        </Flex>

        <Separator size="4" className="my-4" />

        <div className="space-y-3">
          <div>
            <Text size="2" weight="bold" className="block mb-1">
              LinkedIn Profile
            </Text>
            <a
              href={lead.linkedinSlug}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] hover:underline"
              data-testid="lead-linkedin-url"
            >
              {lead.linkedinSlug}
            </a>
          </div>

          <div>
            <Text size="2" weight="bold" className="block mb-1">
              Created At
            </Text>
            <Text size="2" color="gray">
              {new Date(lead.createdAt).toLocaleString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </div>

          <div>
            <Text size="2" weight="bold" className="block mb-1">
              Last Updated
            </Text>
            <Text size="2" color="gray">
              {new Date(lead.updatedAt).toLocaleString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </div>
        </div>
      </Card>

      {/* Enrichment Data */}
      <Card className="mb-6" data-testid="enrichment-data-card">
        <Heading size="5" className="mb-4">
          Enrichment Data
        </Heading>

        {!lead.enrichmentData && (
          <Text size="2" color="gray">
            Enrichment data not available yet. Please wait for the enrichment
            process to complete.
          </Text>
        )}

        {lead.enrichmentData && (
          <div className="bg-[var(--gray-2)] rounded-lg p-4 overflow-auto">
            <pre className="text-sm font-mono whitespace-pre-wrap break-words">
              {JSON.stringify(lead.enrichmentData, null, 2)}
            </pre>
          </div>
        )}
      </Card>

      {/* Research Report */}
      <Card data-testid="research-report-card">
        <Heading size="5" className="mb-4">
          Research Report
        </Heading>

        {!lead.researchResult && lead.lastStep !== "research_completed" && (
          <Text size="2" color="gray">
            {lead.lastStep === "research_started"
              ? "Research is in progress. Please wait..."
              : lead.lastStep === "research_failed"
              ? "Research failed. Please retry or contact support."
              : "Research report not available yet. Waiting for enrichment to complete."}
          </Text>
        )}

        {lead.researchResult && (
          <div
            className="prose prose-sm max-w-none dark:prose-invert"
            data-testid="research-markdown"
          >
            <ReactMarkdown>{lead.researchResult}</ReactMarkdown>
          </div>
        )}
      </Card>
    </Box>
  );
}
