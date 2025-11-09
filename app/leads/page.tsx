"use client";

import { Select } from "@radix-ui/themes";
import { trpc } from "@/trpc/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Users } from "lucide-react";
import Shell from "@/components/Shell";

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
        <span
          className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200"
          data-testid="status-pending"
        >
          PENDING
        </span>
      );
    }

    switch (lastStep) {
      case "enrichment_started":
        return (
          <span
            className="px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
            data-testid="status-enriching"
          >
            ENRICHING
          </span>
        );
      case "enrichment_completed":
        return (
          <span
            className="px-2 py-1 text-xs font-medium bg-cyan-50 text-cyan-700 border border-cyan-200"
            data-testid="status-enriched"
          >
            ENRICHED
          </span>
        );
      case "enrichment_failed":
        return (
          <span
            className="px-2 py-1 text-xs font-medium bg-red-50 text-red-700 border border-red-200"
            data-testid="status-enrich-failed"
          >
            ENRICH FAILED
          </span>
        );
      case "research_started":
        return (
          <span
            className="px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
            data-testid="status-researching"
          >
            RESEARCHING
          </span>
        );
      case "research_completed":
        return (
          <span
            className="px-2 py-1 text-xs font-medium bg-green-50 text-green-700 border border-green-200"
            data-testid="status-completed"
          >
            COMPLETED
          </span>
        );
      case "research_failed":
        return (
          <span
            className="px-2 py-1 text-xs font-medium bg-red-50 text-red-700 border border-red-200"
            data-testid="status-research-failed"
          >
            RESEARCH FAILED
          </span>
        );
      default:
        return (
          <span
            className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200"
            data-testid="status-unknown"
          >
            {lastStep.toUpperCase()}
          </span>
        );
    }
  };

  return (
    <Shell>
      <div className="min-h-screen bg-white">
        <div className="v2-container">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-50 border border-gray-200">
                <Users className="w-6 h-6 text-gray-700" />
              </div>
              <div>
                <h1 className="v2-heading-1" data-testid="leads-page-heading">
                  Leads
                </h1>
                <p className="v2-text-small mt-1">
                  View and manage all your leads
                </p>
              </div>
            </div>

            {/* Export Section */}
            <div className="flex items-center gap-3">
              <Select.Root
                value={exportClientId}
                onValueChange={setExportClientId}
                size="3"
              >
                <Select.Trigger
                  placeholder="Select client..."
                  className="min-w-[200px]"
                  radius="none"
                />
                <Select.Content>
                  {clientsData?.clients.map((client) => (
                    <Select.Item key={client.id} value={client.id}>
                      {client.name}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
              <button
                onClick={handleExport}
                disabled={!exportClientId || isExporting}
                className="v2-button-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                {isExporting ? "Exporting..." : "Export CSV"}
              </button>
            </div>
          </div>

          {/* Leads Table */}
          <div className="v2-card">
            {isLoading && (
              <div className="space-y-3" data-testid="leads-loading">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 v2-skeleton" />
                ))}
              </div>
            )}

            {error && (
              <div className="text-center py-12" data-testid="leads-error">
                <p className="text-red-600">Error loading leads: {error.message}</p>
              </div>
            )}

            {!isLoading && leadsData && leadsData.leads.length === 0 && (
              <div className="text-center py-12" data-testid="leads-empty">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="v2-text-small mb-4">
                  No leads found. Run a workflow to get started.
                </p>
                <button
                  onClick={() => router.push("/workflow")}
                  className="v2-button-primary"
                >
                  Run Workflow
                </button>
              </div>
            )}

            {!isLoading && leadsData && leadsData.leads.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 v2-text-small font-semibold">
                        Client
                      </th>
                      <th className="text-left py-3 px-4 v2-text-small font-semibold">
                        LinkedIn URL
                      </th>
                      <th className="text-left py-3 px-4 v2-text-small font-semibold">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 v2-text-small font-semibold">
                        Assets
                      </th>
                      <th className="text-left py-3 px-4 v2-text-small font-semibold">
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {leadsData.leads.map((lead) => (
                      <tr
                        key={lead.id}
                        data-testid={`lead-row-${lead.id}`}
                        onClick={() => router.push(`/leads/${lead.id}`)}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <td className="py-4 px-4">
                          <span className="font-medium text-gray-900">
                            {lead.client.name}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <a
                            href={lead.linkedinSlug}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="v2-text-small text-gray-600 hover:text-gray-900 hover:underline"
                            data-testid="lead-linkedin-link"
                          >
                            {lead.linkedinSlug.length > 60
                              ? lead.linkedinSlug.substring(0, 60) + "..."
                              : lead.linkedinSlug}
                          </a>
                        </td>
                        <td className="py-4 px-4">
                          {getStatusBadge(lead.lastStep)}
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-2 py-1 text-xs font-medium border ${
                              lead._count.assets > 0
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-gray-100 text-gray-700 border-gray-200"
                            }`}
                          >
                            {lead._count.assets} asset
                            {lead._count.assets !== 1 ? "s" : ""}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="v2-text-small text-gray-600">
                            {new Date(lead.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </Shell>
  );
}
