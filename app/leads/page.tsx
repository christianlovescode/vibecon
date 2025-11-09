"use client";

import {
  Table,
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Card,
  Select,
  Badge,
} from "@radix-ui/themes";
import { trpc } from "@/trpc/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LeadsPage() {
  const router = useRouter();
  const [exportClientId, setExportClientId] = useState<string>("");
  const [isExporting, setIsExporting] = useState(false);

  // Fetch clients for dropdown
  const { data: clientsData } = trpc.client.list.useQuery();

  // Fetch leads with auto-refresh when processing
  const {
    data: leadsData,
    isLoading,
    error,
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

  const exportMutation = trpc.lead.exportByClient.useMutation();

  const handleExport = async () => {
    if (!exportClientId) {
      alert("Please select a client to export");
      return;
    }

    setIsExporting(true);

    try {
      const result = await exportMutation.mutateAsync({
        clientId: exportClientId,
      });

      if (result.count === 0) {
        alert("No leads found for this client");
        setIsExporting(false);
        return;
      }

      // Create blob and download
      const blob = new Blob([result.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Get client name for filename
      const selectedClient = clientsData?.clients.find(
        (c) => c.id === exportClientId
      );
      const clientName =
        selectedClient?.name.replace(/[^a-z0-9]/gi, "_").toLowerCase() ||
        "client";
      const timestamp = new Date().toISOString().split("T")[0];

      link.download = `${clientName}_leads_${timestamp}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert(`Successfully exported ${result.count} lead(s)!`);
    } catch (err) {
      console.error(err);
      alert("Failed to export leads. Please try again.");
    } finally {
      setIsExporting(false);
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
        <div className="flex items-center gap-2">
          <Image src="/workflow.png" alt="logo" width={100} height={100} />
          <div className="flex flex-col">
            <Heading size="8" data-testid="leads-page-heading">
              Leads
            </Heading>
            <Text size="2" color="gray" className="mt-2">
              View and export your leads
            </Text>
          </div>
        </div>
      </Flex>

      {/* Leads Table */}
      <Card data-testid="leads-table-card">
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
                <Table.ColumnHeaderCell>Assets</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Created At</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {leadsData.leads.map((lead) => (
                <Table.Row
                  key={lead.id}
                  data-testid={`lead-row-${lead.id}`}
                  onClick={() => router.push(`/leads/${lead.id}`)}
                  className="hover:bg-[var(--accent-3)] transition-colors cursor-pointer"
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
                      onClick={(e) => e.stopPropagation()}
                      className="text-[var(--accent)] hover:underline"
                      data-testid="lead-linkedin-link"
                    >
                      {lead.linkedinSlug}
                    </a>
                  </Table.Cell>
                  <Table.Cell>{getStatusBadge(lead.lastStep)}</Table.Cell>
                  <Table.Cell>
                    <Badge
                      color={lead._count.assets > 0 ? "green" : "gray"}
                      size="1"
                    >
                      {lead._count.assets} asset
                      {lead._count.assets !== 1 ? "s" : ""}
                    </Badge>
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
