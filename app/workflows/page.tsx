"use client";

import {
  Box,
  Flex,
  Card,
  Heading,
  Text,
  Button,
  Badge,
  Dialog,
  TextArea,
  Select,
  Switch,
  TextField,
} from "@radix-ui/themes";
import { trpc } from "@/trpc/client";
import { useState } from "react";
import {
  Sparkles,
  Database,
  Search,
  Mail,
  FileText,
  Users,
  Image as ImageIcon,
  ChevronDown,
  Save,
  Play,
} from "lucide-react";
import Navigation from "../components/Navigation";

type WorkflowStep = {
  id: string;
  type: 'lead_list' | 'enrichment' | 'research' | 'llm' | 'warm_intro' | 'asset_picker';
  name: string;
  config: Record<string, any>;
  position: number;
};

const stepIcons = {
  lead_list: Database,
  enrichment: Search,
  research: FileText,
  llm: Sparkles,
  warm_intro: Users,
  asset_picker: ImageIcon,
};

const stepColors = {
  lead_list: 'blue',
  enrichment: 'green',
  research: 'purple',
  llm: 'orange',
  warm_intro: 'pink',
  asset_picker: 'cyan',
};

export default function WorkflowsPage() {
  const { data, isLoading, refetch } = trpc.workflow.get.useQuery();
  const updateMutation = trpc.workflow.update.useMutation();

  const [editingStep, setEditingStep] = useState<WorkflowStep | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleEditStep = (step: WorkflowStep) => {
    setEditingStep({ ...step });
    setIsDialogOpen(true);
  };

  const handleSaveStep = async () => {
    if (!editingStep || !data?.workflow) return;

    const updatedSteps = (data.workflow.steps as WorkflowStep[]).map((step) =>
      step.id === editingStep.id ? editingStep : step
    );

    setIsSaving(true);
    try {
      await updateMutation.mutateAsync({
        id: data.workflow.id,
        steps: updatedSteps,
      });
      await refetch();
      setIsDialogOpen(false);
      setEditingStep(null);
    } catch (err) {
      console.error('Failed to save workflow', err);
      alert('Failed to save workflow');
    } finally {
      setIsSaving(false);
    }
  };

  const renderStepConfig = (step: WorkflowStep) => {
    const Icon = stepIcons[step.type];
    const color = stepColors[step.type];

    return (
      <Card
        key={step.id}
        className="relative bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border-2 hover:border-[var(--accent-9)] transition-all cursor-pointer group"
        onClick={() => handleEditStep(step)}
        data-testid={`workflow-step-${step.id}`}
      >
        <Flex direction="column" gap="3" className="p-4">
          <Flex align="center" gap="3">
            <Box className={`p-2 rounded-lg bg-${color}-100 dark:bg-${color}-900/20`}>
              <Icon className={`w-5 h-5 text-${color}-600 dark:text-${color}-400`} />
            </Box>
            <Box className="flex-1">
              <Heading size="4" className="mb-1">
                {step.name}
              </Heading>
              <Badge color={color as any} size="1">
                {step.type.replace('_', ' ').toUpperCase()}
              </Badge>
            </Box>
            <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-[var(--accent-9)] transition-colors" />
          </Flex>

          {step.config.description && (
            <Text size="2" color="gray">
              {step.config.description}
            </Text>
          )}

          {step.type === 'llm' && step.config.prompt && (
            <Box className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 mt-2">
              <Text size="1" weight="medium" className="block mb-2 text-gray-600">
                PROMPT
              </Text>
              <Text size="2" className="font-mono text-sm line-clamp-3">
                {step.config.prompt}
              </Text>
              {step.config.model && (
                <Flex align="center" gap="2" className="mt-2">
                  <Badge size="1" variant="soft">
                    {step.config.model}
                  </Badge>
                  {step.config.structuredOutput && (
                    <Badge size="1" variant="soft" color="green">
                      Structured Output
                    </Badge>
                  )}
                </Flex>
              )}
            </Box>
          )}

          {step.type === 'enrichment' && step.config.provider && (
            <Flex align="center" gap="2" className="mt-2">
              <Badge size="1" variant="soft">
                {step.config.provider}
              </Badge>
            </Flex>
          )}

          {step.type === 'research' && step.config.provider && (
            <Flex align="center" gap="2" className="mt-2">
              <Badge size="1" variant="soft">
                {step.config.provider}
              </Badge>
            </Flex>
          )}
        </Flex>

        {/* Connection line to next step */}
        {step.position < (data?.workflow.steps as WorkflowStep[]).length - 1 && (
          <Box className="absolute left-1/2 -bottom-6 transform -translate-x-1/2 w-0.5 h-6 bg-gradient-to-b from-gray-300 to-transparent" />
        )}
      </Card>
    );
  };

  if (isLoading) {
    return (
      <Box className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <Text color="gray">Loading workflow...</Text>
      </Box>
    );
  }

  const workflow = data?.workflow;
  const steps = (workflow?.steps as WorkflowStep[]) || [];

  return (
    <>
      <Navigation />
      <Box className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <Flex align="center" justify="between" className="py-6" wrap="wrap" gap="4">
        <div>
          <Heading size="8" data-testid="workflows-page-heading">
            Workflow Builder
          </Heading>
          <Text size="2" color="gray" className="mt-2">
            Configure your lead enrichment pipeline
          </Text>
        </div>
        <Flex gap="2">
          <Button
            variant="outline"
            size="3"
            onClick={() => window.location.href = '/leads'}
          >
            <Play className="w-4 h-4" />
            Go to Leads
          </Button>
        </Flex>
      </Flex>

      {/* Workflow Steps */}
      <Box className="space-y-6" data-testid="workflow-steps-container">
        {steps.map((step) => renderStepConfig(step))}
      </Box>

      {/* Edit Step Dialog */}
      <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <Dialog.Content maxWidth="600px" data-testid="edit-step-dialog">
          <Dialog.Title>Edit Workflow Step</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            Configure this step in your workflow
          </Dialog.Description>

          {editingStep && (
            <div className="space-y-4">
              <Box>
                <Text size="2" weight="medium" className="block mb-2">
                  Step Name
                </Text>
                <TextField.Root
                  value={editingStep.name}
                  onChange={(e) =>
                    setEditingStep({ ...editingStep, name: e.target.value })
                  }
                  placeholder="e.g., Generate Emails"
                />
              </Box>

              <Box>
                <Text size="2" weight="medium" className="block mb-2">
                  Description
                </Text>
                <TextArea
                  value={editingStep.config.description || ''}
                  onChange={(e) =>
                    setEditingStep({
                      ...editingStep,
                      config: { ...editingStep.config, description: e.target.value },
                    })
                  }
                  placeholder="Brief description of what this step does"
                  rows={2}
                />
              </Box>

              {editingStep.type === 'llm' && (
                <>
                  <Box>
                    <Text size="2" weight="medium" className="block mb-2">
                      Prompt
                    </Text>
                    <Text size="1" color="gray" className="block mb-2">
                      Use @ to reference dynamic variables like @lead.name, @lead.company, @client.product, @client.valueProposition, @client.materials, @client.calendarUrl
                    </Text>
                    <TextArea
                      value={editingStep.config.prompt || ''}
                      onChange={(e) =>
                        setEditingStep({
                          ...editingStep,
                          config: { ...editingStep.config, prompt: e.target.value },
                        })
                      }
                      placeholder="Write your prompt here..."
                      rows={6}
                      className="font-mono text-sm"
                    />
                  </Box>

                  <Box>
                    <Text size="2" weight="medium" className="block mb-2">
                      Model
                    </Text>
                    <Select.Root
                      value={editingStep.config.model || 'claude-opus-4'}
                      onValueChange={(value) =>
                        setEditingStep({
                          ...editingStep,
                          config: { ...editingStep.config, model: value },
                        })
                      }
                    >
                      <Select.Trigger placeholder="Select model..." className="w-full" />
                      <Select.Content>
                        <Select.Item value="claude-opus-4">claude-opus-4</Select.Item>
                        <Select.Item value="gpt-5">gpt-5</Select.Item>
                        <Select.Item value="gemini-2.0-flash-exp">gemini-2.0-flash-exp</Select.Item>
                      </Select.Content>
                    </Select.Root>
                  </Box>

                  <Flex align="center" gap="2">
                    <Switch
                      checked={editingStep.config.structuredOutput || false}
                      onCheckedChange={(checked) =>
                        setEditingStep({
                          ...editingStep,
                          config: { ...editingStep.config, structuredOutput: checked },
                        })
                      }
                    />
                    <Text size="2">Use Structured Output</Text>
                  </Flex>
                </>
              )}

              {(editingStep.type === 'enrichment' || editingStep.type === 'research') && (
                <Box>
                  <Text size="2" weight="medium" className="block mb-2">
                    Provider
                  </Text>
                  <TextField.Root
                    value={editingStep.config.provider || ''}
                    onChange={(e) =>
                      setEditingStep({
                        ...editingStep,
                        config: { ...editingStep.config, provider: e.target.value },
                      })
                    }
                    placeholder="e.g., ProxyCurl, Perplexity"
                  />
                </Box>
              )}
            </div>
          )}

          <Flex gap="3" mt="5" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </Dialog.Close>
            <Button onClick={handleSaveStep} disabled={isSaving}>
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Step'}
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Box>
  );
}
