"use client";

import {
  Table,
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Card,
  TextArea,
  Select,
  Badge,
} from "@radix-ui/themes";
import { trpc } from "@/trpc/client";
import { useState } from "react";

export default function LeadsPage() {
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [linkedinUrls, setLinkedinUrls] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch clients for dropdown
  const { data: clientsData } = trpc.client.list.useQuery();

  // Fetch leads with auto-refresh when processing
  const {
    data: leadsData,
    isLoading,
    error,
    refetch,
  } = trpc.lead.list.useQuery(undefined, {
    refetchInterval: (query) => {
      // Auto-refetch every 5 seconds if any lead is still processing
      const hasProcessing = query.state.data?.leads.some(
        (lead) =>
          !lead.lastStep ||
          lead.lastStep === "enrichment_started" ||
          lead.lastStep === "research_started"
      );
      return hasProcessing ? 5000 : false;
    },
  });

  const createBulkMutation = trpc.lead.createBulk.useMutation();

  const handleSubmit = async () => {
    if (!selectedClientId) {
      alert("Please select a client");
      return;
    }

    if (!linkedinUrls.trim()) {
      alert("Please paste LinkedIn URLs");
      return;
    }

    setIsSubmitting(true);

    try {
      // Parse CSV/newline-separated URLs
      const urls = linkedinUrls
        .split("\n")
        .map((url) => url.trim())
        .filter((url) => url.length > 0);

      if (urls.length === 0) {
        alert("No valid URLs found");
        setIsSubmitting(false);
        return;
      }

      // Validate URLs are LinkedIn URLs
      const invalidUrls = urls.filter(
        (url) => !url.includes("linkedin.com/in/")
      );
      if (invalidUrls.length > 0) {
        alert(`Invalid LinkedIn URLs found:\n${invalidUrls.join("\n")}`);
        setIsSubmitting(false);
        return;
      }

      await createBulkMutation.mutateAsync({
        clientId: selectedClientId,
        linkedinUrls: urls,
      });

      // Clear form and refetch
      setLinkedinUrls("");
      refetch();
      alert(`Successfully queued ${urls.length} lead(s) for enrichment!`);
    } catch (err) {
      console.error(err);
      alert("Failed to create leads. Please check the URLs and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (lastStep: string | null) => {
    if (!lastStep) {
      return (
        <Badge color="gray" size="1" data-testid="status-pending">
          PENDING
        </Badge>
      );
    }

    switch (lastStep) {
      case "enrichment_started":
        return (
          <Badge color="blue" size="1" data-testid="status-enriching">
            ENRICHING
          </Badge>
        );
      case "enrichment_completed":
        return (
          <Badge color="cyan" size="1" data-testid="status-enriched">
            ENRICHED
          </Badge>
        );
      case "enrichment_failed":
        return (
          <Badge color="red" size="1" data-testid="status-enrich-failed">
            ENRICH FAILED
          </Badge>
        );
      case "research_started":
        return (
          <Badge color="blue" size="1" data-testid="status-researching">
            RESEARCHING
          </Badge>
        );
      case "research_completed":
        return (
          <Badge color="green" size="1" data-testid="status-completed">
            COMPLETED
          </Badge>
        );
      case "research_failed":
        return (
          <Badge color="red" size="1" data-testid="status-research-failed">
            RESEARCH FAILED
          </Badge>
        );
      default:
        return (
          <Badge color="gray" size="1" data-testid="status-unknown">
            {lastStep.toUpperCase()}
          </Badge>
        );
    }
  };

  return (
    <Box className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <Flex
        align="center"
        justify="between"
        className="py-6"
        wrap="wrap"
        gap="4"
      >
        <div>
          <Heading size="8" data-testid="leads-page-heading">
            Leads
          </Heading>
          <Text size="2" color="gray" className="mt-2">
            Upload and enrich LinkedIn leads
          </Text>
        </div>
      </Flex>

      {/* Upload Section */}
      <Card className="mb-6" data-testid="leads-upload-card">
        <Heading size="5" mb="4">
          Upload Leads
        </Heading>

        <div className="space-y-4">
          <Box>
            <Text size="2" weight="medium" className="block mb-2">
              Select Client <Text color="red">*</Text>
            </Text>
            <Select.Root
              value={selectedClientId}
              onValueChange={setSelectedClientId}
              size="2"
            >
              <Select.Trigger
                placeholder="Choose a client..."
                data-testid="client-select"
                className="w-full"
              />
              <Select.Content>
                {clientsData?.clients.map((client) => (
                  <Select.Item
                    key={client.id}
                    value={client.id}
                    data-testid={`client-option-${client.id}`}
                  >
                    {client.name}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Box>

          <Box>
            <Text size="2" weight="medium" className="block mb-2">
              LinkedIn URLs <Text color="red">*</Text>
            </Text>
            <Text size="1" color="gray" className="block mb-2">
              Paste one LinkedIn profile URL per line (e.g.,
              https://linkedin.com/in/john-doe)
            </Text>
            <TextArea
              data-testid="linkedin-urls-textarea"
              placeholder="https://linkedin.com/in/john-doe&#10;https://linkedin.com/in/jane-smith&#10;https://linkedin.com/in/alex-johnson"
              value={linkedinUrls}
              onChange={(e) => setLinkedinUrls(e.target.value)}
              rows={8}
              className="font-mono text-sm"
            />
          </Box>

          <Flex gap="3" justify="end">
            <Button
              onClick={handleSubmit}
              disabled={
                isSubmitting || !selectedClientId || !linkedinUrls.trim()
              }
              data-testid="submit-leads-button"
              size="3"
            >
              {isSubmitting ? "Uploading..." : "Upload & Enrich Leads"}
            </Button>
          </Flex>
        </div>
      </Card>

      {/* Leads Table */}
      <Card data-testid="leads-table-card">
        <Heading size="5" mb="4">
          All Leads
        </Heading>

        {isLoading && (
          <Box className="p-8 text-center" data-testid="leads-loading">
            <Text color="gray">Loading leads...</Text>
          </Box>
        )}

        {error && (
          <Box className="p-8 text-center" data-testid="leads-error">
            <Text color="red">Error loading leads: {error.message}</Text>
          </Box>
        )}

        {leadsData && leadsData.leads.length === 0 && (
          <Box className="p-8 text-center" data-testid="leads-empty">
            <Text color="gray">
              No leads found. Upload some LinkedIn URLs to get started.
            </Text>
          </Box>
        )}

        {leadsData && leadsData.leads.length > 0 && (
          <Table.Root variant="surface">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Client</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>LinkedIn URL</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Created At</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {leadsData.leads.map((lead) => (
                <Table.Row
                  key={lead.id}
                  data-testid={`lead-row-${lead.id}`}
                  className="hover:bg-[var(--muted-bg)] transition-colors"
                >
                  <Table.Cell>
                    <Text size="2" weight="medium">
                      {lead.client.name}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <a
                      href={lead.linkedinSlug}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--accent)] hover:underline"
                      data-testid="lead-linkedin-link"
                    >
                      {lead.linkedinSlug}
                    </a>
                  </Table.Cell>
                  <Table.Cell>
                    {getStatusBadge(lead.enrichmentStatus ?? "completed")}
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="2" color="gray">
                      {new Date(lead.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        )}
      </Card>
    </Box>
  );
}
