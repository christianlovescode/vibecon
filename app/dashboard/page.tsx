"use client";

import { trpc } from "@/trpc/client";
import { useRouter } from "next/navigation";
import {
  Building2,
  Users,
  TrendingUp,
  Calendar,
  LayoutDashboard,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();

  // Fetch clients
  const { data: clientsData, isLoading: clientsLoading } =
    trpc.client.list.useQuery(undefined, {
      refetchInterval: (query) => {
        const hasEnriching = query.state.data?.clients.some(
          (c) =>
            c.enrichmentStatus === "enriching" ||
            c.enrichmentStatus === "pending"
        );
        return hasEnriching ? 5000 : false;
      },
    });

  // Fetch leads
  const { data: leadsData, isLoading: leadsLoading } =
    trpc.lead.list.useQuery();

  const totalClients = clientsData?.clients.length || 0;
  const totalLeads = leadsData?.leads.length || 0;
  const completedLeads =
    leadsData?.leads.filter((lead) => lead.lastStep === "research_completed")
      .length || 0;
  const processingLeads =
    leadsData?.leads.filter((lead) => lead.lastStep?.includes("started"))
      .length || 0;

  const getStatusBadge = (status: string | null) => {
    if (!status || status === "completed") {
      return <span className="v2-badge v2-badge-success">Active</span>;
    }
    if (status === "enriching" || status === "pending") {
      return <span className="v2-badge v2-badge-warning">Enriching</span>;
    }
    if (status === "failed") {
      return <span className="v2-badge v2-badge-danger">Failed</span>;
    }
    return <span className="v2-badge v2-badge-default">{status}</span>;
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="v2-container">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-gray-100 flex items-center justify-center w-12 h-12">
              <LayoutDashboard className="w-5 h-5 text-gray-700" />
            </div>
            <div>
              <h1 className="v2-heading-1">Welcome back, Christian!</h1>
              <p className="v2-text-small mt-1">
                CB Workspace / Dashboard
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Clients */}
          <div className="v2-card">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-gray-50 border border-gray-200">
                <Building2 className="w-5 h-5 text-gray-700" />
              </div>
            </div>
            <div className="v2-text-small mb-1">Total Clients</div>
            <div className="text-3xl font-bold text-gray-900">
              {clientsLoading ? "..." : totalClients}
            </div>
          </div>

          {/* Total Leads */}
          <div className="v2-card">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-gray-50 border border-gray-200">
                <Users className="w-5 h-5 text-gray-700" />
              </div>
            </div>
            <div className="v2-text-small mb-1">Total Leads</div>
            <div className="text-3xl font-bold text-gray-900">
              {leadsLoading ? "..." : totalLeads}
            </div>
          </div>

          {/* Completed Leads */}
          <div className="v2-card">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-gray-50 border border-gray-200">
                <TrendingUp className="w-5 h-5 text-gray-700" />
              </div>
            </div>
            <div className="v2-text-small mb-1">Completed Leads</div>
            <div className="text-3xl font-bold text-gray-900">
              {leadsLoading ? "..." : completedLeads}
            </div>
          </div>

          {/* Processing */}
          <div className="v2-card">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-gray-50 border border-gray-200">
                <Calendar className="w-5 h-5 text-gray-700" />
              </div>
            </div>
            <div className="v2-text-small mb-1">Processing</div>
            <div className="text-3xl font-bold text-gray-900">
              {leadsLoading ? "..." : processingLeads}
            </div>
          </div>
        </div>

        {/* Clients Table */}
        <div className="v2-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="v2-heading-2">Clients</h2>
            <div className="flex gap-2">
              <button
                onClick={() => router.push("/clients")}
                className="v2-button-secondary"
              >
                View All
              </button>
              <button
                onClick={() => router.push("/workflow")}
                className="v2-button-primary"
              >
                Run Workflow
              </button>
            </div>
          </div>

          {clientsLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 v2-skeleton" />
              ))}
            </div>
          )}

          {!clientsLoading && clientsData?.clients.length === 0 && (
            <div className="text-center py-12">
              <p className="v2-text-small mb-4">No clients yet</p>
              <button
                onClick={() => router.push("/clients")}
                className="v2-button-primary"
              >
                Add Your First Client
              </button>
            </div>
          )}

          {!clientsLoading && clientsData && clientsData.clients.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 v2-text-small font-semibold">
                      Client
                    </th>
                    <th className="text-left py-3 px-4 v2-text-small font-semibold">
                      Website
                    </th>
                    <th className="text-left py-3 px-4 v2-text-small font-semibold">
                      Industry
                    </th>
                    <th className="text-left py-3 px-4 v2-text-small font-semibold">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 v2-text-small font-semibold">
                      Leads
                    </th>
                    <th className="text-left py-3 px-4 v2-text-small font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {clientsData.clients.slice(0, 5).map((client) => (
                    <tr
                      key={client.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 border border-gray-200 flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-gray-400" />
                          </div>
                          <span className="font-medium text-gray-900">
                            {client.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {client.website ? (
                          <a
                            href={client.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="v2-text-small text-gray-600 hover:text-gray-900 hover:underline"
                          >
                            {client.website.replace(/^https?:\/\//, "")}
                          </a>
                        ) : (
                          <span className="v2-text-small text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className="v2-text-small text-gray-600">
                          {client.industry || "—"}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(client.enrichmentStatus)}
                      </td>
                      <td className="py-4 px-4">
                        <span className="v2-text-small text-gray-900 font-medium">
                          {client._count.leads || 0}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => router.push(`/clients/${client.id}`)}
                          className="v2-button-secondary text-xs py-1.5 px-3"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Leads */}
        <div className="v2-card mt-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="v2-heading-2">Recent Leads</h2>
            <button
              onClick={() => router.push("/leads")}
              className="v2-button-secondary"
            >
              View All
            </button>
          </div>

          {leadsLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 v2-skeleton" />
              ))}
            </div>
          )}

          {!leadsLoading && leadsData?.leads.length === 0 && (
            <div className="text-center py-12">
              <p className="v2-text-small mb-4">No leads yet</p>
              <button
                onClick={() => router.push("/workflow")}
                className="v2-button-primary"
              >
                Run Your First Workflow
              </button>
            </div>
          )}

          {!leadsLoading && leadsData && leadsData.leads.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 v2-text-small font-semibold">
                      Client
                    </th>
                    <th className="text-left py-3 px-4 v2-text-small font-semibold">
                      LinkedIn
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
                    <th className="text-left py-3 px-4 v2-text-small font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leadsData.leads.slice(0, 5).map((lead) => (
                    <tr
                      key={lead.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <span className="v2-text-small text-gray-900 font-medium">
                          {lead.client.name}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <a
                          href={lead.linkedinSlug}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="v2-text-small text-gray-600 hover:text-gray-900 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {lead.linkedinSlug.split("/").pop() || "View"}
                        </a>
                      </td>
                      <td className="py-3 px-4">
                        {lead.lastStep?.includes("completed") && (
                          <span className="v2-badge v2-badge-success">
                            Completed
                          </span>
                        )}
                        {lead.lastStep?.includes("started") && (
                          <span className="v2-badge v2-badge-warning">
                            Processing
                          </span>
                        )}
                        {lead.lastStep?.includes("failed") && (
                          <span className="v2-badge v2-badge-danger">
                            Failed
                          </span>
                        )}
                        {!lead.lastStep && (
                          <span className="v2-badge v2-badge-default">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="v2-text-small text-gray-900">
                          {lead._count.assets}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="v2-text-small text-gray-600">
                          {new Date(lead.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => router.push(`/leads/${lead.id}`)}
                          className="v2-button-secondary text-xs py-1.5 px-3"
                        >
                          View
                        </button>
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
  );
}
