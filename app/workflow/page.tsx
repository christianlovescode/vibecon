"use client";

import { Box, TextArea, Select } from "@radix-ui/themes";
import { trpc } from "@/trpc/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Play,
  MailCheck,
  PanelsTopLeft,
  GalleryHorizontal,
  Video,
  ImagePlay,
  UserPlus,
  Check,
} from "lucide-react";

const steps = [
  { id: 1, name: "Client Selection" },
  { id: 2, name: "Asset Selection" },
  { id: 3, name: "Prospect URLs" },
  { id: 4, name: "Model Selection" },
];

export default function WorkflowPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [linkedinUrls, setLinkedinUrls] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generateEmails, setGenerateEmails] = useState<boolean>(false);
  const [generateOnePager, setGenerateOnePager] = useState<boolean>(false);
  const [modelTier, setModelTier] = useState<"production" | "development">("production");

  // Fetch clients for dropdown
  const { data: clientsData } = trpc.client.list.useQuery();

  const createBulkMutation = trpc.lead.createBulk.useMutation();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return selectedClientId !== "";
      case 1:
        return generateEmails || generateOnePager;
      case 2:
        return linkedinUrls.trim() !== "";
      case 3:
        return true; // Model tier always has a selection (default: production)
      default:
        return false;
    }
  };

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

      const result = await createBulkMutation.mutateAsync({
        clientId: selectedClientId,
        linkedinUrls: urls,
        generateEmails,
        generateOnePager,
        modelTier,
      });

      // Clear form
      setLinkedinUrls("");

      // Redirect to leads page to see the workflow in action
      alert(
        `Successfully started workflow for ${urls.length} lead(s)! Redirecting to leads page...`
      );

      // If single lead, go to detail page, otherwise go to leads list
      if (result.leads.length === 1) {
        router.push(`/leads/${result.leads[0].id}`);
      } else {
        router.push("/leads");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to create leads. Please check the URLs and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push("/dashboard")}
            className="v2-button-secondary"
          >
            Cancel
          </button>

          {/* Stepper */}
          <div className="flex items-center gap-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index < currentStep
                      ? "bg-black text-white"
                      : index === currentStep
                      ? "bg-black text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {index < currentStep ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    step.id
                  )}
                </div>
                <span
                  className={`text-sm ${
                    index <= currentStep
                      ? "text-gray-900 font-medium"
                      : "text-gray-400"
                  }`}
                >
                  {step.name}
                </span>
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className="v2-button-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>
            {currentStep < steps.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="v2-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !canProceed()}
                className="v2-button-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                {isSubmitting ? "Starting..." : "Run Workflow"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-2xl mx-auto px-8 py-12">
        {/* Step 0: Client Selection */}
        {currentStep === 0 && (
          <div className="v2-card">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">
                  What client is this for?
                </h2>
                <p className="text-gray-500 text-sm">
                  Select the client you want to run this workflow for
                </p>
              </div>

              <div className="w-full">
                <Select.Root
                  value={selectedClientId}
                  onValueChange={setSelectedClientId}
                  size="3"
                >
                  <Select.Trigger
                    placeholder="Choose a client..."
                    data-testid="client-select"
                    style={{ width: '100%' }}
                    radius="none"
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
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Asset Selection */}
        {currentStep === 1 && (
          <div className="v2-card">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">
                  Which assets do you want to generate?
                </h2>
                <p className="text-gray-500 text-sm">
                  Select the assets you want to create for your prospects
                </p>
              </div>

              <div className="flex items-center justify-center gap-4 flex-wrap">
              <button
                onClick={() => setGenerateEmails(!generateEmails)}
                className="hover:scale-105 transition-all duration-300"
              >
                <div
                  className="v2-card h-32 w-32 flex items-center justify-center flex-col"
                  style={{
                    border: generateEmails
                      ? "2px solid rgb(0, 0, 0)"
                      : "2px solid #e0e0e0",
                  }}
                >
                  <MailCheck className="w-6 h-6 text-gray-700 mb-2" />
                  <div className="text-sm font-medium">Email</div>
                </div>
              </button>

              <button
                onClick={() => setGenerateOnePager(!generateOnePager)}
                className="hover:scale-105 transition-all duration-300"
              >
                <div
                  className="v2-card h-32 w-32 flex items-center justify-center flex-col"
                  style={{
                    border: generateOnePager
                      ? "2px solid rgb(0, 0, 0)"
                      : "2px solid #e0e0e0",
                  }}
                >
                  <PanelsTopLeft className="w-6 h-6 text-gray-700 mb-2" />
                  <div className="text-sm font-medium">Landing</div>
                </div>
              </button>

              <button className="opacity-50" disabled={true}>
                <div className="v2-card h-32 w-32 flex items-center justify-center flex-col border-2 border-gray-200">
                  <UserPlus className="w-6 h-6 text-gray-400 mb-2" />
                  <div className="text-sm font-medium text-gray-400">
                    Connection
                  </div>
                </div>
              </button>

              <button className="opacity-50" disabled={true}>
                <div className="v2-card h-32 w-32 flex items-center justify-center flex-col border-2 border-gray-200">
                  <GalleryHorizontal className="w-6 h-6 text-gray-400 mb-2" />
                  <div className="text-sm font-medium text-gray-400">
                    Slides
                  </div>
                </div>
              </button>

              <button className="opacity-50" disabled={true}>
                <div className="v2-card h-32 w-32 flex items-center justify-center flex-col border-2 border-gray-200">
                  <ImagePlay className="w-6 h-6 text-gray-400 mb-2" />
                  <div className="text-sm font-medium text-gray-400">GIF</div>
                </div>
              </button>

              <button className="opacity-50" disabled={true}>
                <div className="v2-card h-32 w-32 flex items-center justify-center flex-col border-2 border-gray-200">
                  <Video className="w-6 h-6 text-gray-400 mb-2" />
                  <div className="text-sm font-medium text-gray-400">
                    Video
                  </div>
                </div>
              </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Prospect URLs */}
        {currentStep === 2 && (
          <div className="v2-card">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">
                  Paste prospect LinkedIn URLs
                </h2>
                <p className="text-gray-500 text-sm">
                  Add LinkedIn profile URLs, one per line
                </p>
              </div>

            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 bg-white hover:border-gray-400 transition-colors"
              style={{
                minHeight: "400px",
              }}
            >
              <TextArea
                data-testid="linkedin-urls-textarea"
                value={linkedinUrls}
                onChange={(e) => setLinkedinUrls(e.target.value)}
                placeholder="https://www.linkedin.com/in/example-profile&#10;https://www.linkedin.com/in/another-profile"
                className="font-mono text-sm border-0 w-full h-full resize-none"
                radius="none"
                size="3"
                style={{
                  minHeight: "350px",
                }}
              />
            </div>

              <div className="text-sm text-gray-500 text-center">
                <p className="font-medium mb-1">Supported format: CSV</p>
                <p>Paste one LinkedIn URL per line</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Model Selection */}
        {currentStep === 3 && (
          <div className="v2-card">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">
                  Select AI Models
                </h2>
                <p className="text-gray-500 text-sm">
                  Choose which models to use for research and content generation
                </p>
              </div>

              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={() => setModelTier("production")}
                  className="hover:scale-105 transition-all duration-300"
                  data-testid="production-model-button"
                >
                  <div
                    className="v2-card p-6 w-72"
                    style={{
                      border: modelTier === "production"
                        ? "2px solid rgb(0, 0, 0)"
                        : "2px solid #e0e0e0",
                    }}
                  >
                    <div className="text-center space-y-3">
                      <div className="text-lg font-semibold">Production</div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p className="font-medium">Models:</p>
                        <p>• Perplexity: <span className="font-mono text-xs">sonar-pro</span></p>
                        <p>• Anthropic: <span className="font-mono text-xs">claude-sonnet-4-5</span></p>
                      </div>
                      <div className="text-xs text-gray-500 pt-2">
                        Best quality and performance
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setModelTier("development")}
                  className="hover:scale-105 transition-all duration-300"
                  data-testid="development-model-button"
                >
                  <div
                    className="v2-card p-6 w-72"
                    style={{
                      border: modelTier === "development"
                        ? "2px solid rgb(0, 0, 0)"
                        : "2px solid #e0e0e0",
                    }}
                  >
                    <div className="text-center space-y-3">
                      <div className="text-lg font-semibold">Development</div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p className="font-medium">Models:</p>
                        <p>• Perplexity: <span className="font-mono text-xs">sonar</span></p>
                        <p>• Anthropic: <span className="font-mono text-xs">claude-haiku-4-5</span></p>
                      </div>
                      <div className="text-xs text-gray-500 pt-2">
                        Faster and more cost-effective
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Box>
  );
}
