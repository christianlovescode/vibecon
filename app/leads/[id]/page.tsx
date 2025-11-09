"use client";

import { trpc } from "@/trpc/client";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, XCircle, Circle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params.id as string;
  
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  // Fetch lead data
  const { data: leadData, isLoading } = trpc.lead.getById.useQuery(
    { id: leadId },
    {
      refetchInterval: 3000, // Poll every 3 seconds for updates
    }
  );

  // Log run ID for debugging (will be replaced with Trigger.dev realtime subscription)
  useEffect(() => {
    if (leadData?.lead?.triggerRunId) {
      console.log("Run ID:", leadData.lead.triggerRunId);
      // TODO: Subscribe to Trigger.dev realtime updates using the run ID
    }
  }, [leadData?.lead?.triggerRunId]);

  const toggleStep = (step: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(step)) {
      newExpanded.delete(step);
    } else {
      newExpanded.add(step);
    }
    setExpandedSteps(newExpanded);
  };

  if (isLoading) {
    return (
      <div className="v2-container">
        <div className="flex justify-center items-center min-h-96">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (!leadData?.lead) {
    return (
      <div className="v2-container">
        <div className="v2-card">
          <p className="v2-text-body">Lead not found</p>
        </div>
      </div>
    );
  }

  const { lead } = leadData;

  // Map workflow steps
  const workflowSteps = [
    {
      id: "enrichment",
      name: "Lead Enrichment",
      description: "Fetching professional profile data",
      status: getStepStatus("enrichment", lead.lastStep),
    },
    {
      id: "research",
      name: "AI Research",
      description: "Deep research on lead and company",
      status: getStepStatus("research", lead.lastStep),
    },
    {
      id: "emails",
      name: "Email Generation",
      description: "Creating personalized email sequences",
      status: getStepStatus("emails", lead.lastStep),
    },
    {
      id: "landing_page",
      name: "Landing Page",
      description: "Generating custom landing page",
      status: getStepStatus("landing_page", lead.lastStep),
    },
  ];

  function getStepStatus(step: string, lastStep: string | null) {
    if (!lastStep) return "pending";
    
    const stepOrder = ["enrichment", "research", "emails", "landing_page"];
    const currentStepIndex = stepOrder.findIndex((s) =>
      lastStep.includes(s)
    );
    const targetStepIndex = stepOrder.findIndex((s) => s === step);

    if (lastStep.includes(step)) {
      if (lastStep.includes("_started")) return "in_progress";
      if (lastStep.includes("_completed")) return "completed";
      if (lastStep.includes("_failed")) return "failed";
    }

    if (currentStepIndex > targetStepIndex) return "completed";
    if (currentStepIndex === targetStepIndex) return "in_progress";
    return "pending";
  }

  function getStepIcon(status: string) {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-6 h-6 text-green-500" />;
      case "failed":
        return <XCircle className="w-6 h-6 text-red-500" />;
      case "in_progress":
        return <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />;
      default:
        return <Circle className="w-6 h-6 text-gray-300" />;
    }
  }

  return (
    <div className="v2-container">
      {/* Header */}
      <div className="flex items-center justify-between py-6 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/leads")}
            className="v2-button-secondary flex items-center gap-2"
            data-testid="back-to-leads-button"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-3">
            <Image src="/workflow.png" alt="logo" width={64} height={64} />
            <div className="flex flex-col">
              <h1 className="v2-heading-1">Workflow Details</h1>
              <p className="v2-text-small mt-1">
                Real-time workflow execution
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lead Info Card */}
      <div className="v2-card mb-6" data-testid="lead-info-card">
        <h2 className="v2-heading-2 mb-4">
          Lead Information
        </h2>
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="v2-text-body font-medium">
              Client:
            </span>
            <span className="v2-text-body">{lead.client.name}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="v2-text-body font-medium">
              LinkedIn:
            </span>
            <a
              href={lead.linkedinSlug}
              target="_blank"
              rel="noopener noreferrer"
              className="v2-text-small text-black hover:underline transition-all"
            >
              {lead.linkedinSlug}
            </a>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="v2-text-body font-medium">
              Status:
            </span>
            <span
              className={`v2-badge ${
                lead.lastStep?.includes("completed")
                  ? "v2-badge-success"
                  : lead.lastStep?.includes("failed")
                  ? "v2-badge-danger"
                  : "v2-badge-default"
              }`}
              data-testid="lead-status-badge"
            >
              {lead.lastStep || "PENDING"}
            </span>
          </div>
          {lead.triggerRunId && (
            <div className="flex justify-between items-center py-2">
              <span className="v2-text-body font-medium">
                Run ID:
              </span>
              <span className="v2-text-small font-mono text-gray-500">
                {lead.triggerRunId}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Workflow Timeline */}
      <div className="v2-card" data-testid="workflow-timeline">
        <h2 className="v2-heading-2 mb-6">
          Workflow Timeline
        </h2>
        <div className="space-y-0">
          {workflowSteps.map((step, index) => (
            <div key={step.id}>
              <button
                onClick={() => toggleStep(step.id)}
                className="w-full text-left hover:bg-gray-50 p-4 transition-colors"
                data-testid={`workflow-step-${step.id}`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getStepIcon(step.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="v2-heading-3">{step.name}</h3>
                      <span
                        className={`v2-badge ${
                          step.status === "completed"
                            ? "v2-badge-success"
                            : step.status === "failed"
                            ? "v2-badge-danger"
                            : step.status === "in_progress"
                            ? "v2-badge-warning"
                            : "v2-badge-default"
                        }`}
                      >
                        {step.status.replace("_", " ").toUpperCase()}
                      </span>
                    </div>
                    <p className="v2-text-small">
                      {step.description}
                    </p>
                    
                    {/* Expandable details */}
                    {expandedSteps.has(step.id) && (
                      <div className="mt-4 p-4 bg-gray-50 border border-gray-200">
                        <p className="v2-text-body font-medium mb-3">
                          Step Details
                        </p>
                        <div className="space-y-3">
                          {step.status === "in_progress" && (
                            <p className="v2-text-small">
                              This step is currently executing...
                            </p>
                          )}
                          {step.status === "completed" && step.id === "enrichment" && lead.enrichmentData && (
                            <pre className="text-xs overflow-auto max-h-64 bg-black text-white p-3 border border-gray-300">
                              {JSON.stringify(lead.enrichmentData, null, 2)}
                            </pre>
                          )}
                          {step.status === "completed" && step.id === "research" && lead.researchResult && (
                            <div className="prose prose-sm max-w-none">
                              <p className="v2-text-small">{lead.researchResult.substring(0, 500)}...</p>
                            </div>
                          )}
                          {step.status === "completed" && step.id === "emails" && (
                            <div className="space-y-4 mt-4">
                              {lead.assets
                                ?.filter((asset) => asset.type === "message")
                                .map((asset) => (
                                  <div
                                    key={asset.id}
                                    className="v2-card bg-white"
                                  >
                                    <div className="flex justify-between items-center mb-3">
                                      <span className="v2-text-body font-bold">
                                        {asset.name}
                                      </span>
                                      <span className="v2-badge v2-badge-default">
                                        Email
                                      </span>
                                    </div>
                                    <div className="prose prose-sm max-w-none">
                                      <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-3 border border-gray-200">
                                        {asset.content}
                                      </pre>
                                    </div>
                                  </div>
                                ))}
                              {(!lead.assets || lead.assets.filter((a) => a.type === "message").length === 0) && (
                                <p className="v2-text-small">
                                  No emails generated yet
                                </p>
                              )}
                            </div>
                          )}
                          {step.status === "completed" && step.id === "landing_page" && (
                            <div className="space-y-4 mt-4">
                              {lead.assets
                                ?.filter((asset) => asset.type === "landing_page")
                                .map((asset) => (
                                  <div
                                    key={asset.id}
                                    className="v2-card bg-white"
                                  >
                                    <div className="flex justify-between items-center p-3 border-b border-gray-200">
                                      <span className="v2-text-body font-bold">
                                        {asset.name}
                                      </span>
                                      <div className="flex gap-3 items-center">
                                        <span className="v2-badge v2-badge-default">
                                          Landing Page
                                        </span>
                                        <a
                                          href={asset.content}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="v2-text-small text-black hover:underline"
                                        >
                                          Open in new tab ↗
                                        </a>
                                      </div>
                                    </div>
                                    <div className="p-2">
                                      <div className="relative w-full overflow-hidden border border-gray-200">
                                        <div className="aspect-[16/10] w-full">
                                          <iframe
                                            src={asset.content}
                                            className="w-full h-full"
                                            title={asset.name}
                                            sandbox="allow-scripts allow-same-origin"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              {(!lead.assets || lead.assets.filter((a) => a.type === "landing_page").length === 0) && (
                                <p className="v2-text-small">
                                  No landing pages generated yet
                                </p>
                              )}
                            </div>
                          )}
                          {step.status === "failed" && (
                            <p className="v2-text-small text-red-500">
                              This step failed. Please try again.
                            </p>
                          )}
                          {step.status === "pending" && (
                            <p className="v2-text-small">
                              Waiting for previous steps to complete...
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </button>
              {index < workflowSteps.length - 1 && (
                <div className="ml-7 h-8 w-0.5 bg-gray-200" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Assets */}
      {lead.assets && lead.assets.length > 0 && (
        <Card className="mt-6">
          <Heading size="5" mb="4">
            Generated Assets
          </Heading>
          <div className="space-y-3">
            {lead.assets.map((asset) => (
              <Box key={asset.id} className="p-3 bg-gray-50 rounded-md">
                <Flex justify="between" align="center">
                  <div>
                    <Text size="2" weight="medium">
                      {asset.name}
                    </Text>
                    <Text size="1" color="gray">
                      {asset.type}
                    </Text>
                  </div>
                  <Badge>{asset.type}</Badge>
                </Flex>
              </Box>
            ))}
          </div>
        </Card>
      )}
    </Box>
  );
}

