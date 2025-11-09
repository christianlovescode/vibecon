"use client";

import { trpc } from "@/trpc/client";
import { useRouter } from "next/navigation";
import {
  Building2,
  Users,
  TrendingUp,
  Calendar,
  Play,
  Plus,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  Dialog,
  TextField,
  TextArea,
  Button,
  Box,
  Text,
  Flex,
} from "@radix-ui/themes";
import { useState, useMemo } from "react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

import Shell from "@/components/Shell";

export default function DashboardPage() {
  const router = useRouter();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEnrichDialogOpen, setIsEnrichDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    website: "",
    industry: "",
    companySummary: "",
    targetCustomer: "",
    valueProposition: "",
    location: "",
    headcount: "",
    linkedinUrl: "",
    twitterUrl: "",
    calendarUrl: "",
  });
  const [enrichFormData, setEnrichFormData] = useState({
    name: "",
    domain: "",
  });

  // Fetch clients
  const {
    data: clientsData,
    isLoading: clientsLoading,
    refetch,
  } = trpc.client.list.useQuery(undefined, {
    refetchInterval: (query) => {
      const hasEnriching = query.state.data?.clients.some(
        (c) =>
          c.enrichmentStatus === "enriching" || c.enrichmentStatus === "pending"
      );
      return hasEnriching ? 5000 : false;
    },
  });

  // Fetch leads
  const { data: leadsData, isLoading: leadsLoading } =
    trpc.lead.list.useQuery();

  // Mutations
  const createMutation = trpc.client.create.useMutation();
  const enrichMutation = trpc.client.enrichClient.useMutation();

  const resetForm = () => {
    setFormData({
      name: "",
      website: "",
      industry: "",
      companySummary: "",
      targetCustomer: "",
      valueProposition: "",
      location: "",
      headcount: "",
      linkedinUrl: "",
      twitterUrl: "",
      calendarUrl: "",
    });
  };

  const resetEnrichForm = () => {
    setEnrichFormData({
      name: "",
      domain: "",
    });
  };

  const handleEnrich = async () => {
    try {
      const result = await enrichMutation.mutateAsync({
        name: enrichFormData.name,
        domain: enrichFormData.domain,
      });

      setIsEnrichDialogOpen(false);
      resetEnrichForm();
      refetch();

      // Navigate to the newly created client
      router.push(`/clients/${result.client.id}`);
    } catch (err) {
      alert("Failed to start enrichment");
      console.error(err);
    }
  };

  const handleCreate = async () => {
    try {
      const result = await createMutation.mutateAsync({
        name: formData.name,
        website: formData.website || undefined,
        industry: formData.industry || undefined,
        companySummary: formData.companySummary || undefined,
        targetCustomer: formData.targetCustomer || undefined,
        valueProposition: formData.valueProposition || undefined,
        location: formData.location || undefined,
        headcount: formData.headcount
          ? parseInt(formData.headcount)
          : undefined,
        linkedinUrl: formData.linkedinUrl || undefined,
        twitterUrl: formData.twitterUrl || undefined,
        calendarUrl: formData.calendarUrl,
      });

      setIsCreateDialogOpen(false);
      resetForm();
      refetch();

      // Navigate to the newly created client
      router.push(`/clients/${result.client.id}`);
    } catch (err) {
      alert("Failed to create client");
      console.error(err);
    }
  };

  const totalClients = clientsData?.clients.length || 0;
  const totalLeads = leadsData?.leads.length || 0;
  const completedLeads =
    leadsData?.leads.filter((lead) => lead.lastStep === "research_completed")
      .length || 0;
  const processingLeads =
    leadsData?.leads.filter((lead) => lead.lastStep?.includes("started"))
      .length || 0;

  return (
    <Shell>
      <div className="min-h-screen bg-white">
        <div className="v2-container">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="v2-heading-1">Welcome back, Christian!</h1>
              </div>
            </div>
            <button
              onClick={() => router.push("/workflow")}
              className="v2-button-primary flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Run Workflow
            </button>
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
                {/* AI Enrichment Dialog */}
                <Dialog.Root
                  open={isEnrichDialogOpen}
                  onOpenChange={setIsEnrichDialogOpen}
                >
                  <Dialog.Trigger>
                    <button className="v2-button-primary flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Add New
                    </button>
                  </Dialog.Trigger>

                  <Dialog.Content maxWidth="500px">
                    <Dialog.Title>Add new client</Dialog.Title>
                    <Dialog.Description size="2" mb="4">
                      Add basic info and let AI research and enrich the client
                      profile automatically.
                    </Dialog.Description>

                    <div className="space-y-4">
                      <Box>
                        <Text size="2" weight="medium" className="block mb-2">
                          Company Name <Text color="red">*</Text>
                        </Text>
                        <TextField.Root
                          radius="none"
                          placeholder="e.g., Acme Corp"
                          value={enrichFormData.name}
                          onChange={(e) =>
                            setEnrichFormData({
                              ...enrichFormData,
                              name: e.target.value,
                            })
                          }
                        />
                      </Box>

                      <Box>
                        <Text size="2" weight="medium" className="block mb-2">
                          Domain <Text color="red">*</Text>
                        </Text>
                        <TextField.Root
                          placeholder="e.g., acme.com"
                          radius="none"
                          value={enrichFormData.domain}
                          onChange={(e) =>
                            setEnrichFormData({
                              ...enrichFormData,
                              domain: e.target.value,
                            })
                          }
                        />
                      </Box>

                      <Box className="bg-gray-50 border border-gray-200 p-3">
                        <Text size="1" color="gray">
                          <strong>AI will research:</strong> Industry, summary,
                          target customers, value proposition, location,
                          headcount, social links, branding assets, marketing
                          materials, and testimonials.
                        </Text>
                      </Box>
                    </div>

                    <Flex gap="3" mt="4" justify="end">
                      <Dialog.Close>
                        <Button variant="soft" color="gray">
                          Cancel
                        </Button>
                      </Dialog.Close>
                      <Button
                        onClick={handleEnrich}
                        disabled={
                          !enrichFormData.name ||
                          !enrichFormData.domain ||
                          enrichMutation.isPending
                        }
                        color="violet"
                      >
                        {enrichMutation.isPending
                          ? "Starting..."
                          : "Start Enrichment"}
                      </Button>
                    </Flex>
                  </Dialog.Content>
                </Dialog.Root>

                <button
                  onClick={() => router.push("/clients")}
                  className="v2-button-secondary"
                >
                  View All
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
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="v2-button-primary"
                >
                  Add Your First Client
                </button>
              </div>
            )}

            {!clientsLoading &&
              clientsData &&
              clientsData.clients.length > 0 && (
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
                              <span className="v2-text-small text-gray-400">
                                —
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <span className="v2-text-small text-gray-600 line-clamp-1">
                              {client.industry || "—"}
                            </span>
                          </td>

                          <td className="py-4 px-4">
                            <span className="v2-text-small text-gray-900 font-medium">
                              {client._count.leads || 0}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <button
                              onClick={() =>
                                router.push(`/clients/${client.id}`)
                              }
                              className="v2-button-secondary"
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
    </Shell>
  );
}
