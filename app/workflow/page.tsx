'use client';

import { useState } from 'react';
import { Card, Flex, Box, Heading, Text, Badge, Dialog, Button, TextArea, Select, Checkbox } from '@radix-ui/themes';
import { 
  Database, 
  Search, 
  Sparkles, 
  Mail, 
  FileText, 
  PlayCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Play
} from 'lucide-react';

// Workflow steps based on orchestrateLead.ts
const workflowSteps = [
  {
    id: 'start',
    title: 'Start Orchestration',
    description: 'Initialize lead processing pipeline',
    icon: PlayCircle,
    type: 'trigger',
    color: 'bg-teal-500',
    details: {
      inputs: ['leadId', 'linkedinUrl', 'generateEmails', 'generateOnePager'],
      outputs: ['Pipeline started'],
      duration: '< 1s'
    }
  },
  {
    id: 'check-enrichment',
    title: 'Check Enrichment Status',
    description: 'Verify if enrichment data exists',
    icon: Database,
    type: 'condition',
    color: 'bg-blue-500',
    details: {
      inputs: ['leadId', 'lastStep', 'enrichmentData'],
      outputs: ['needsEnrichment boolean'],
      duration: '< 1s',
      logic: 'Check if lastStep is completed or enrichmentData exists'
    }
  },
  {
    id: 'enrichment',
    title: 'Enrich Lead Data',
    description: 'Fetch and enrich lead information from LinkedIn',
    icon: Database,
    type: 'task',
    color: 'bg-purple-500',
    details: {
      inputs: ['leadId', 'linkedinUrl'],
      outputs: ['enrichmentData', 'status update'],
      duration: '30-60s',
      task: 'enrichLeadTask',
      description: 'Calls external API to fetch lead profile and company data'
    }
  },
  {
    id: 'check-research',
    title: 'Check Research Status',
    description: 'Verify if research is needed',
    icon: Search,
    type: 'condition',
    color: 'bg-blue-500',
    details: {
      inputs: ['lastStep', 'enrichmentData'],
      outputs: ['needsResearch boolean'],
      duration: '< 1s',
      logic: 'Requires enrichment_completed status'
    }
  },
  {
    id: 'research',
    title: 'Research Lead',
    description: 'Perform deep research and analysis',
    icon: Search,
    type: 'task',
    color: 'bg-orange-500',
    details: {
      inputs: ['leadId', 'enrichmentData'],
      outputs: ['researchData', 'status update'],
      duration: '60-120s',
      task: 'researchLeadTask',
      description: 'AI-powered research using enriched data'
    }
  },
  {
    id: 'check-assets',
    title: 'Check Asset Generation',
    description: 'Determine which assets to generate',
    icon: FileText,
    type: 'condition',
    color: 'bg-blue-500',
    details: {
      inputs: ['lastStep', 'generateEmails', 'generateOnePager'],
      outputs: ['Asset generation flags'],
      duration: '< 1s',
      logic: 'Check if research_completed and flags are enabled'
    }
  },
  {
    id: 'generate-emails',
    title: 'Generate Emails',
    description: 'Create personalized email content',
    icon: Mail,
    type: 'task',
    color: 'bg-green-500',
    details: {
      inputs: ['leadId', 'researchData'],
      outputs: ['Email assets (type: message)'],
      duration: '30-45s',
      task: 'generateEmailsTask',
      description: 'AI-generated personalized outreach emails'
    }
  },
  {
    id: 'generate-landing',
    title: 'Generate Landing Page',
    description: 'Create personalized one-pager',
    icon: FileText,
    type: 'task',
    color: 'bg-pink-500',
    details: {
      inputs: ['leadId', 'researchData'],
      outputs: ['Landing page asset (type: landing_page)'],
      duration: '30-45s',
      task: 'generateLandingPageTask',
      description: 'AI-generated personalized landing page'
    }
  },
  {
    id: 'complete',
    title: 'Orchestration Complete',
    description: 'All steps finished successfully',
    icon: CheckCircle2,
    type: 'end',
    color: 'bg-teal-600',
    details: {
      inputs: ['All task results'],
      outputs: ['Success summary', 'Task completion flags'],
      duration: '< 1s'
    }
  }
];

// Connection lines between steps
const connections = [
  { from: 'start', to: 'check-enrichment' },
  { from: 'check-enrichment', to: 'enrichment', label: 'needs enrichment' },
  { from: 'enrichment', to: 'check-research' },
  { from: 'check-enrichment', to: 'check-research', label: 'already enriched' },
  { from: 'check-research', to: 'research', label: 'needs research' },
  { from: 'research', to: 'check-assets' },
  { from: 'check-research', to: 'check-assets', label: 'already researched' },
  { from: 'check-assets', to: 'generate-emails', label: 'if enabled' },
  { from: 'check-assets', to: 'generate-landing', label: 'if enabled' },
  { from: 'generate-emails', to: 'complete' },
  { from: 'generate-landing', to: 'complete' },
];

export default function WorkflowPage() {
  const [selectedNode, setSelectedNode] = useState<string | null>('start');

  const selectedStep = workflowSteps.find(step => step.id === selectedNode);

  const getNodePosition = (index: number) => {
    const rows = [
      [0], // start
      [1], // check-enrichment
      [2], // enrichment
      [3], // check-research
      [4], // research
      [5], // check-assets
      [6, 7], // generate-emails, generate-landing (parallel)
      [8], // complete
    ];

    let currentRow = 0;
    let currentIndex = 0;

    for (let i = 0; i < rows.length; i++) {
      if (currentIndex + rows[i].length > index) {
        const positionInRow = index - currentIndex;
        const rowWidth = rows[i].length;
        return {
          row: i,
          col: positionInRow,
          totalInRow: rowWidth
        };
      }
      currentIndex += rows[i].length;
    }

    return { row: 0, col: 0, totalInRow: 1 };
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Dot Grid Background */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle, #cbd5e1 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Header */}
      <div className="relative z-10 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Flex align="center" gap="3">
            <Sparkles className="w-8 h-8 text-teal-600" />
            <div>
              <Heading size="6" className="text-slate-900">
                Lead Orchestration Workflow
              </Heading>
              <Text size="2" className="text-slate-600">
                Automated pipeline from LinkedIn profile to personalized outreach
              </Text>
            </div>
          </Flex>
        </div>
      </div>

      <div className="relative z-10 flex h-[calc(100vh-120px)]">
        {/* Canvas Area */}
        <div className="flex-1 overflow-auto p-8">
          <div className="min-w-[800px] max-w-4xl mx-auto space-y-6">
            {workflowSteps.map((step, index) => {
              const Icon = step.icon;
              const position = getNodePosition(index);
              const isSelected = selectedNode === step.id;

              return (
                <div
                  key={step.id}
                  className={`flex ${position.totalInRow > 1 && position.col === 1 ? 'justify-end' : 'justify-start'}`}
                  style={{
                    marginLeft: position.totalInRow > 1 && position.col === 1 ? '0' : position.col * 200,
                  }}
                >
                  <Card
                    data-testid={`workflow-node-${step.id}`}
                    onClick={() => setSelectedNode(step.id)}
                    className={`
                      cursor-pointer transition-all duration-200 
                      hover:shadow-lg hover:scale-[1.02]
                      ${isSelected ? 'ring-2 ring-teal-500 shadow-lg scale-[1.02]' : 'shadow'}
                      w-80
                    `}
                  >
                    <Flex gap="3" align="start">
                      <div className={`${step.color} p-3 rounded-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <Flex align="center" gap="2" mb="1">
                          <Text weight="bold" size="3" className="text-slate-900">
                            {step.title}
                          </Text>
                          <Badge 
                            color={
                              step.type === 'trigger' ? 'teal' :
                              step.type === 'task' ? 'purple' :
                              step.type === 'condition' ? 'blue' :
                              'green'
                            }
                            size="1"
                          >
                            {step.type}
                          </Badge>
                        </Flex>
                        <Text size="2" className="text-slate-600">
                          {step.description}
                        </Text>
                      </div>
                    </Flex>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>

        {/* Side Panel */}
        <div className="w-96 border-l border-slate-200 bg-white/80 backdrop-blur-sm overflow-auto">
          <div className="p-6 space-y-6">
            {selectedStep ? (
              <>
                <div>
                  <Flex align="center" gap="3" mb="3">
                    <div className={`${selectedStep.color} p-3 rounded-lg`}>
                      {(() => {
                        const Icon = selectedStep.icon;
                        return <Icon className="w-6 h-6 text-white" />;
                      })()}
                    </div>
                    <div>
                      <Heading size="4" className="text-slate-900">
                        {selectedStep.title}
                      </Heading>
                      <Badge 
                        color={
                          selectedStep.type === 'trigger' ? 'teal' :
                          selectedStep.type === 'task' ? 'purple' :
                          selectedStep.type === 'condition' ? 'blue' :
                          'green'
                        }
                        size="2"
                        className="mt-1"
                      >
                        {selectedStep.type}
                      </Badge>
                    </div>
                  </Flex>
                  <Text size="2" className="text-slate-600">
                    {selectedStep.description}
                  </Text>
                </div>

                <div className="space-y-4">
                  {/* Duration */}
                  <Card size="1" className="bg-slate-50">
                    <Flex align="center" gap="2">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <div>
                        <Text size="1" weight="bold" className="text-slate-700">
                          Duration
                        </Text>
                        <Text size="2" className="text-slate-600">
                          {selectedStep.details.duration}
                        </Text>
                      </div>
                    </Flex>
                  </Card>

                  {/* Inputs */}
                  <div>
                    <Text size="2" weight="bold" className="text-slate-700 mb-2 block">
                      Inputs
                    </Text>
                    <div className="space-y-1">
                      {selectedStep.details.inputs.map((input, idx) => (
                        <div 
                          key={idx}
                          className="px-3 py-2 bg-blue-50 rounded text-sm text-blue-900 border border-blue-200"
                        >
                          {input}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Outputs */}
                  <div>
                    <Text size="2" weight="bold" className="text-slate-700 mb-2 block">
                      Outputs
                    </Text>
                    <div className="space-y-1">
                      {selectedStep.details.outputs.map((output, idx) => (
                        <div 
                          key={idx}
                          className="px-3 py-2 bg-green-50 rounded text-sm text-green-900 border border-green-200"
                        >
                          {output}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Task Details */}
                  {selectedStep.details.task && (
                    <div>
                      <Text size="2" weight="bold" className="text-slate-700 mb-2 block">
                        Task Reference
                      </Text>
                      <div className="px-3 py-2 bg-purple-50 rounded text-sm text-purple-900 border border-purple-200 font-mono">
                        {selectedStep.details.task}
                      </div>
                    </div>
                  )}

                  {/* Logic Details */}
                  {selectedStep.details.logic && (
                    <div>
                      <Text size="2" weight="bold" className="text-slate-700 mb-2 block">
                        Condition Logic
                      </Text>
                      <div className="px-3 py-2 bg-amber-50 rounded text-sm text-amber-900 border border-amber-200">
                        {selectedStep.details.logic}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {selectedStep.details.description && (
                    <div>
                      <Text size="2" weight="bold" className="text-slate-700 mb-2 block">
                        Description
                      </Text>
                      <Text size="2" className="text-slate-600">
                        {selectedStep.details.description}
                      </Text>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <Text size="2" className="text-slate-500">
                  Select a node to view details
                </Text>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
