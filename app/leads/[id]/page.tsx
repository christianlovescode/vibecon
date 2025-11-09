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
      <Box className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Flex justify="center" align="center" className="min-h-96">
          <Spinner size="3" />
        </Flex>
      </Box>
    );
  }

  if (!leadData?.lead) {
    return (
      <Box className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Text>Lead not found</Text>
      </Box>
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
    <Box className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <Flex
        align="center"
        justify="between"
        className="py-6"
        wrap="wrap"
        gap="4"
      >
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/leads")}
            className="cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Image src="/workflow.png" alt="logo" width={80} height={80} />
            <div className="flex flex-col">
              <Heading size="8">Workflow Details</Heading>
              <Text size="2" color="gray" className="mt-2">
                Real-time workflow execution
              </Text>
            </div>
          </div>
        </div>
      </Flex>

      {/* Lead Info Card */}
      <Card className="mb-6">
        <Heading size="5" mb="4">
          Lead Information
        </Heading>
        <Flex direction="column" gap="3">
          <Flex justify="between" align="center">
            <Text size="2" weight="medium">
              Client:
            </Text>
            <Text size="2">{lead.client.name}</Text>
          </Flex>
          <Flex justify="between" align="center">
            <Text size="2" weight="medium">
              LinkedIn:
            </Text>
            <a
              href={lead.linkedinSlug}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] hover:underline"
            >
              {lead.linkedinSlug}
            </a>
          </Flex>
          <Flex justify="between" align="center">
            <Text size="2" weight="medium">
              Status:
            </Text>
            <Badge
              color={
                lead.lastStep?.includes("completed")
                  ? "green"
                  : lead.lastStep?.includes("failed")
                  ? "red"
                  : "blue"
              }
            >
              {lead.lastStep || "PENDING"}
            </Badge>
          </Flex>
          {lead.triggerRunId && (
            <Flex justify="between" align="center">
              <Text size="2" weight="medium">
                Run ID:
              </Text>
              <Text size="1" className="font-mono text-gray-500">
                {lead.triggerRunId}
              </Text>
            </Flex>
          )}
        </Flex>
      </Card>

      {/* Workflow Timeline */}
      <Card>
        <Heading size="5" mb="4">
          Workflow Timeline
        </Heading>
        <div className="space-y-0">
          {workflowSteps.map((step, index) => (
            <div key={step.id}>
              <button
                onClick={() => toggleStep(step.id)}
                className="w-full text-left hover:bg-gray-50 dark:hover:bg-gray-50 p-4 rounded-lg transition-colors"
              >
                <Flex align="start" gap="4">
                  <div className="flex-shrink-0 mt-1">
                    {getStepIcon(step.status)}
                  </div>
                  <div className="flex-1">
                    <Flex justify="between" align="center" className="mb-2">
                      <Heading size="3">{step.name}</Heading>
                      <Badge
                        color={
                          step.status === "completed"
                            ? "green"
                            : step.status === "failed"
                            ? "red"
                            : step.status === "in_progress"
                            ? "blue"
                            : "gray"
                        }
                      >
                        {step.status.replace("_", " ").toUpperCase()}
                      </Badge>
                    </Flex>
                    <Text size="2" color="gray">
                      {step.description}
                    </Text>
                    
                    {/* Expandable details */}
                    {expandedSteps.has(step.id) && (
                      <Box className="mt-4 p-4 bg-gray-50 dark:bg-gray-50 rounded-md">
                        <Text size="2" weight="medium" className="mb-2">
                          Step Details
                        </Text>
                        <div className="space-y-2">
                          {step.status === "in_progress" && (
                            <Text size="2" color="gray">
                              This step is currently executing...
                            </Text>
                          )}
                          {step.status === "completed" && step.id === "enrichment" && lead.enrichmentData && (
                            <pre className="text-xs overflow-auto max-h-64 bg-black text-white  p-2 rounded">
                              {JSON.stringify(lead.enrichmentData, null, 2)}
                            </pre>
                          )}
                          {step.status === "completed" && step.id === "research" && lead.researchResult && (
                            <div className="prose prose-sm max-w-none dark:prose-invert">
                              <Text size="2">{lead.researchResult.substring(0, 500)}...</Text>
                            </div>
                          )}
                          {step.status === "completed" && step.id === "emails" && (
                            <div className="space-y-4 mt-4">
                              {lead.assets
                                ?.filter((asset) => asset.type === "message")
                                .map((asset) => (
                                  <Box
                                    key={asset.id}
                                    className="p-4 bg-white dark:bg-gray-950 rounded-md border border-gray-200 dark:border-gray-800"
                                  >
                                    <Flex justify="between" align="center" className="mb-2">
                                      <Text size="2" weight="bold">
                                        {asset.name}
                                      </Text>
                                      <Badge color="blue" size="1">
                                        Email
                                      </Badge>
                                    </Flex>
                                    <div className="prose prose-sm max-w-none dark:prose-invert">
                                      <pre className="whitespace-pre-wrap text-sm bg-gray-50 dark:bg-gray-900 p-3 rounded">
                                        {asset.content}
                                      </pre>
                                    </div>
                                  </Box>
                                ))}
                              {(!lead.assets || lead.assets.filter((a) => a.type === "message").length === 0) && (
                                <Text size="2" color="gray">
                                  No emails generated yet
                                </Text>
                              )}
                            </div>
                          )}
                          {step.status === "completed" && step.id === "landing_page" && (
                            <div className="space-y-4 mt-4">
                              {lead.assets
                                ?.filter((asset) => asset.type === "landing_page")
                                .map((asset) => (
                                  <Box
                                    key={asset.id}
                                    className="bg-white dark:bg-gray-950 rounded-md border border-gray-200 dark:border-gray-800"
                                  >
                                    <Flex justify="between" align="center" className="p-3 border-b border-gray-200 dark:border-gray-800">
                                      <Text size="2" weight="bold">
                                        {asset.name}
                                      </Text>
                                      <Flex gap="2" align="center">
                                        <Badge color="purple" size="1">
                                          Landing Page
                                        </Badge>
                                        <a
                                          href={asset.content}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-[var(--accent)] hover:underline text-sm"
                                        >
                                          Open in new tab ↗
                                        </a>
                                      </Flex>
                                    </Flex>
                                    <div className="p-2">
                                      <div className="relative w-full rounded overflow-hidden border border-gray-200 dark:border-gray-700">
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
                                  </Box>
                                ))}
                              {(!lead.assets || lead.assets.filter((a) => a.type === "landing_page").length === 0) && (
                                <Text size="2" color="gray">
                                  No landing pages generated yet
                                </Text>
                              )}
                            </div>
                          )}
                          {step.status === "failed" && (
                            <Text size="2" color="red">
                              This step failed. Please try again.
                            </Text>
                          )}
                          {step.status === "pending" && (
                            <Text size="2" color="gray">
                              Waiting for previous steps to complete...
                            </Text>
                          )}
                        </div>
                      </Box>
                    )}
                  </div>
                </Flex>
              </button>
              {index < workflowSteps.length - 1 && (
                <div className="ml-7 h-8 w-0.5 bg-gray-200 dark:bg-gray-700" />
              )}
            </div>
          ))}
        </div>
      </Card>

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

