"use client";

import {
  Box,
  Flex,
  Heading,
  Text,
  Card,
  TextArea,
  Select,
} from "@radix-ui/themes";
import { trpc } from "@/trpc/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Play,
  Workflow,
  MailCheck,
  PanelsTopLeft,
  Newspaper,
  GalleryHorizontal,
  Video,
  ImagePlay,
  UserPlus,
} from "lucide-react";

export default function WorkflowPage() {
  const router = useRouter();
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [linkedinUrls, setLinkedinUrls] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generateEmails, setGenerateEmails] = useState<boolean>(true);
  const [generateOnePager, setGenerateOnePager] = useState<boolean>(true);

  // Fetch clients for dropdown
  const { data: clientsData } = trpc.client.list.useQuery();

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

      const result = await createBulkMutation.mutateAsync({
        clientId: selectedClientId,
        linkedinUrls: urls,
        generateEmails,
        generateOnePager,
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
    <Box className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="v2-container">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-gray-100 flex items-center justify-center w-12 h-12">
              <Workflow className="w-5 h-5 text-gray-700" />
            </div>
            <div>
              <h1 className="v2-heading-1">Welcome back, Christian!</h1>
              <p className="v2-text-small mt-1">CB Workspace / Dashboard</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <div className="bg-gray-100 flex items-center justify-center w-8 h-8">
            1
          </div>
          <Text weight={"medium"}>What client is this for?</Text>
        </div>

        <Select.Root
          value={selectedClientId}
          onValueChange={setSelectedClientId}
          size="3"
        >
          <Select.Trigger
            placeholder="Choose a client..."
            data-testid="client-select"
            className="w-full "
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

        <div className="flex items-center gap-2 mb-4 mt-8">
          <div className="bg-gray-100 flex items-center justify-center w-8 h-8">
            2
          </div>
          <Text weight={"medium"}>Which assets do you want to generate?</Text>
        </div>

        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => setGenerateEmails(!generateEmails)}
            className="hover:scale-105 transition-all duration-300"
          >
            <div
              className="v2-card h-24 w-24 flex items-center justify-center flex-col"
              style={{
                border: generateEmails
                  ? "1px solid rgb(0, 0, 0)"
                  : "1px solid #e0e0e0",
              }}
            >
              <div>
                <MailCheck className="w-5 h-5 text-gray-700 mb-1" />
              </div>
              <div className="v2-text-small">Email</div>
            </div>
          </button>

          <button
            onClick={() => setGenerateOnePager(!generateOnePager)}
            className="hover:scale-105 transition-all duration-300"
          >
            <div
              className="v2-card h-24 w-24 flex items-center justify-center flex-col"
              style={{
                border: generateOnePager
                  ? "1px solid rgb(0, 0, 0)"
                  : "1px solid #e0e0e0",
              }}
            >
              <div>
                <PanelsTopLeft className="w-5 h-5 text-gray-700 mb-1" />
              </div>
              <div className="v2-text-small">Landing</div>
            </div>
          </button>

          <button className="opacity-50" disabled={true}>
            <div className="v2-card h-24 w-24 flex items-center justify-center flex-col">
              <div>
                <UserPlus className="w-5 h-5 text-gray-700 mb-1" />
              </div>
              <div className="v2-text-small">Connection</div>
            </div>
          </button>

          <button className="opacity-50" disabled={true}>
            <div className="v2-card h-24 w-24 flex items-center justify-center flex-col">
              <div>
                <GalleryHorizontal className="w-5 h-5 text-gray-700 mb-1" />
              </div>
              <div className="v2-text-small">Slides</div>
            </div>
          </button>

          <button className="opacity-50" disabled={true}>
            <div className="v2-card h-24 w-24 flex items-center justify-center flex-col">
              <div>
                <ImagePlay className="w-5 h-5 text-gray-700 mb-1" />
              </div>
              <div className="v2-text-small">GIF</div>
            </div>
          </button>

          <button className="opacity-50" disabled={true}>
            <div className="v2-card h-24 w-24 flex items-center justify-center flex-col">
              <div>
                <Video className="w-5 h-5 text-gray-700 mb-1" />
              </div>
              <div className="v2-text-small">Video</div>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-2 mb-4 mt-8">
          <div className="bg-gray-100 flex items-center justify-center w-8 h-8">
            3
          </div>
          <Text weight={"medium"}>Paste prospect LinkedIn URLs</Text>
        </div>

        <TextArea
          data-testid="linkedin-urls-textarea"
          value={linkedinUrls}
          onChange={(e) => setLinkedinUrls(e.target.value)}
          rows={8}
          className="font-mono text-sm"
          radius="none"
          size="3"
        />

        <div className="mt-12">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedClientId || !linkedinUrls.trim()}
            className="v2-button-primary flex items-center gap-2"
          >
            <Play className="w-4 h-4" />

            {isSubmitting ? "Starting Workflow..." : "Run Workflow"}
          </button>
        </div>
      </div>{" "}
    </Box>
  );
}
