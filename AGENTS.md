# Agency Workflow Automation Platform

## Overview

Transform Moonshot from a self-service warm intro tool into an agency platform where you build and run automated lead gen workflows on behalf of customers. The system will feature a visual workflow builder with drag-and-drop primitives, customer profile management, deep AI research, and human approval checkpoints.

## Architecture Vision

### Core Components

1. **Customer Management System** - Manage multiple agency customers with their brand profiles
2. **Workflow Builder** - Visual canvas to build workflows from primitives (no-code)
3. **Workflow Engine** - Executes workflows with state management and error handling
4. **Research Pipeline** - Combines enrichment APIs + AI for deep lead analysis
5. **Human-in-the-Loop System** - Approval queues and review interfaces
6. **Integration Layer** - Pluggable sending services for cold outreach

## Phase 1: Data Model & Foundation

### Database Schema Extensions

Create new tables in `/db/models/`:

**agency-customer.ts** - Customers the agency serves

```typescript
- id, name, domain, industry, companySize
- status: 'active' | 'paused' | 'churned'
- onboardedAt, lastCampaignAt
```

**customer-profile.ts** - Brand, tone, value props

```typescript
- customerId (FK)
- websiteUrl, brandGuidelines, toneOfVoice
- companyDescription, elevator_pitch
- targetPersonas (JSON array)
- painPoints (JSON array) - what problems they solve
- valueProps (JSON array) - key differentiators
- productsServices (JSON array)
- competitiveAdvantages (JSON array)
- caseStudies (JSON array)
- assetsLibrary (JSON) - links to decks, one-pagers, etc.
```

**workflow-template.ts** - Reusable workflow definitions

```typescript
- id, customerId (nullable for global templates)
- name, description, category
- definition (JSON) - nodes + edges
- isTemplate (boolean) - true for library templates
- status: 'draft' | 'published' | 'archived'
- tags, estimatedDuration
```

**workflow-execution.ts** - Instances of running workflows

```typescript
- id, workflowTemplateId, customerId
- name, status: 'running' | 'paused' | 'completed' | 'failed'
- startedAt, completedAt, progress (%)
- currentStepId, errorMessage
- inputParams (JSON), outputResults (JSON)
- totalLeadsProcessed, successCount, failureCount
```

**workflow-node.ts** - Individual step instances

```typescript
- id, workflowExecutionId, nodeType (enum)
- config (JSON) - node-specific configuration
- status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
- startedAt, completedAt, retryCount
- input (JSON), output (JSON), errorMessage
```

**lead-enrichment.ts** - Basic enrichment data

```typescript
- leadId (FK), source: 'apollo' | 'proapis' | 'manual'
- emailAddress, verified (boolean)
- phoneNumber, companyDomain
- socialProfiles (JSON)
- employeeCount, companyRevenue, technologies (JSON)
- enrichedAt, dataQualityScore
```

**lead-research.ts** - Deep AI research results

```typescript
- leadId (FK), customerId (FK)
- researchSummary (text)
- keyInsights (JSON array)
- recentActivities (JSON array)
- companyIntel (text)
- industryTrends (text)
- personalBackground (text)
- potentialPainPoints (JSON array)
- confidenceScore, sourcesUsed (JSON array)
- researchedAt, researcherType: 'perplexity' | 'claude'
```

**lead-match-report.ts** - Why lead matches customer value prop

```typescript
- leadId (FK), customerId (FK), leadResearchId (FK)
- matchScore (0-100)
- matchReasons (JSON array) - specific alignment points
- suggestedApproach (text) - recommended messaging angle
- relevantPainPoints (JSON) - which customer pain points apply
- relevantValueProps (JSON) - which value props to emphasize
- personalizationTokens (JSON) - data points for messages
- generatedAt
```

**approval-queue.ts** - Human-in-the-loop checkpoints

```typescript
- id, workflowExecutionId, nodeId
- queueType: 'lead_list' | 'research_report' | 'message_approval' | 'cold_outreach'
- status: 'pending' | 'approved' | 'rejected' | 'skipped'
- itemsToReview (JSON array)
- reviewedBy (userId), reviewedAt
- reviewNotes (text)
- autoApprovalRules (JSON) - conditions for auto-approval
```

### Workflow Node Types (Primitives)

Define enum in `/db/models/workflow-node.ts`:

```typescript
enum WorkflowNodeType {
  // Lead Generation
  FIND_LEADS = 'find_leads',              // Apollo search
  IMPORT_LEADS = 'import_leads',          // CSV/manual upload
  FILTER_LEADS = 'filter_leads',          // Conditional logic
  
  // Enrichment & Research  
  ENRICH_LEAD = 'enrich_lead',            // Basic data enrichment
  RESEARCH_LEAD = 'research_lead',        // Deep AI research
  GENERATE_MATCH_REPORT = 'match_report', // Value prop alignment
  
  // Warm Intro Flow
  FIND_MUTUALS = 'find_mutuals',          // Current functionality
  RESEARCH_MUTUAL = 'research_mutual',    // Research mutual strength
  GENERATE_INTRO_MESSAGE = 'gen_intro',   // AI message generation
  SEND_WARM_INTRO = 'send_warm_intro',    // Send via LinkedIn
  TRACK_WARM_RESPONSE = 'track_warm',     // Monitor replies
  
  // Cold Outreach Flow
  GENERATE_COLD_SEQUENCE = 'gen_cold',    // Multi-step email sequence
  SEND_COLD_EMAIL = 'send_cold_email',    // Send via email service
  TRACK_COLD_RESPONSE = 'track_cold',     // Monitor opens/replies
  
  // Human Checkpoints
  HUMAN_REVIEW = 'human_review',          // Approval gate
  MANUAL_ACTION = 'manual_action',        // Task for human
  
  // Logic & Control
  CONDITIONAL = 'conditional',            // If/then branching
  WAIT_DELAY = 'wait_delay',              // Time delay
  WEBHOOK = 'webhook',                    // External integration
  
  // Completion
  BOOK_MEETING = 'book_meeting',          // Calendar integration
  MARK_SUCCESS = 'mark_success',          // End workflow
  MARK_FAILURE = 'mark_failure',          // End workflow (failed)
}
```

## Phase 2: Customer Profile System

### UI Components (`/app/agency/`)

Create new route structure:

- `/agency/customers` - List all customers
- `/agency/customers/[id]` - Customer detail
- `/agency/customers/[id]/profile` - Edit brand profile
- `/agency/customers/[id]/workflows` - Workflows for customer
- `/agency/customers/[id]/leads` - Lead database
- `/agency/customers/[id]/results` - Metrics dashboard

### Customer Profile Builder

**Component:** `/app/agency/customers/[id]/profile/page.tsx`

Form sections:

1. **Basic Info** - Name, domain, industry, contact
2. **Company Overview** - Description, elevator pitch, target audience
3. **Pain Points & Solutions** - Problems they solve (structured input)
4. **Value Propositions** - Key differentiators, competitive advantages
5. **Products/Services** - Feature list, pricing, case studies
6. **Brand Voice** - Tone (formal/casual), writing samples, do's/don'ts
7. **Assets Library** - Upload/link to pitch decks, one-pagers, demo videos

**Implementation approach:**

- Rich text editor for descriptions
- Dynamic array fields for pain points, value props
- File upload for assets (store in cloud storage)
- "Test Your Profile" feature - generates sample message to validate

### tRPC Controllers

**`/trpc/controllers/agency/`**

- `create-customer.ts` - Onboard new customer
- `get-customer.ts` - Fetch customer details
- `update-customer-profile.ts` - Save profile changes
- `list-customers.ts` - All customers with stats
- `archive-customer.ts` - Soft delete

## Phase 3: Workflow Builder UI

### Visual Canvas

**Technology:** Use **React Flow** library (already Node.js standard)

**Location:** `/app/agency/workflows/builder/[id]/page.tsx`

**Features:**

- Drag primitives from sidebar onto canvas
- Connect nodes with edges (defines flow)
- Click node to configure parameters
- Validation: ensure nodes are properly connected
- Save as template or deploy as execution
- Duplicate/clone workflows
- Version history

**Sidebar Categories:**

1. **Lead Generation** - Find, import, filter
2. **Research** - Enrich, deep research, match reports  
3. **Warm Intros** - Find mutuals, send requests, track
4. **Cold Outreach** - Generate sequences, send emails, track
5. **Reviews** - Human approval gates
6. **Logic** - Conditionals, delays, webhooks
7. **Completion** - Book meeting, mark complete

### Node Configuration Panels

Each node type has a config panel (right sidebar):

**Example: FIND_LEADS node config**

```typescript
{
  searchCriteria: {
    titles: string[],
    locations: string[],
    industries: string[],
    companySize: string[],
  },
  maxResults: number,
  filters: {
    hasEmail: boolean,
    hasLinkedIn: boolean,
  }
}
```

**Example: HUMAN_REVIEW node config**

```typescript
{
  reviewType: 'lead_list' | 'messages' | 'reports',
  autoApprovalRules: {
    enabled: boolean,
    minScore: number,
    maxCount: number,
  },
  notifyReviewer: boolean,
  timeoutAction: 'block' | 'auto_approve' | 'skip',
  timeoutHours: number,
}
```

**Example: CONDITIONAL node config**

```typescript
{
  condition: {
    field: string, // e.g., 'matchScore', 'hasEmail', 'mutualsFound'
    operator: '>' | '<' | '==' | 'contains',
    value: any,
  },
  thenPath: nodeId,
  elsePath: nodeId,
}
```

### Workflow Templates Library

**Location:** `/app/agency/workflows/templates`

Pre-built templates:

1. **Warm-Only Workflow** - Current functionality
2. **Warm-to-Cold Cascade** - Try warm intros, fallback to cold email
3. **Cold-First High Volume** - Skip warm intros, go straight to cold
4. **Research-Heavy Consultative** - Deep research, manual review, personalized outreach
5. **Apollo → Research → Cold** - Full automated pipeline

Users can:

- Clone template
- Customize for customer
- Save as new template
- Share templates (future: template marketplace)

## Phase 4: Workflow Execution Engine

### Orchestration Service

**Location:** `/services/workflow-engine.service.ts`

**Key Methods:**

```typescript
class WorkflowEngineService {
  async startExecution(workflowTemplateId, customerId, params): Promise<executionId>
  async processNode(executionId, nodeId): Promise<result>
  async pauseExecution(executionId): Promise<void>
  async resumeExecution(executionId): Promise<void>
  async handleNodeFailure(executionId, nodeId, error): Promise<void>
  async evaluateConditional(nodeId, data): Promise<nextNodeId>
  async checkApprovalStatus(approvalQueueId): Promise<status>
}
```

**Trigger.dev Tasks** (`/trigger/agency/`)

Each primitive becomes a Trigger.dev task:

- `execute-find-leads.ts` - Calls Apollo API, saves leads
- `execute-enrich-lead.ts` - Calls enrichment APIs
- `execute-research-lead.ts` - Calls Perplexity/Claude
- `execute-generate-match-report.ts` - AI match analysis
- `execute-find-mutuals.ts` - Reuse existing `find-mutuals.ts`
- `execute-generate-intro.ts` - Reuse `generate-messages.ts`
- `execute-send-warm-intro.ts` - Reuse `send-initial-request.ts`
- `execute-generate-cold-sequence.ts` - New cold email generation
- `execute-send-cold-email.ts` - Integrate with sending service
- `execute-human-review.ts` - Create approval queue entry
- `execute-conditional.ts` - Evaluate condition, route to next node

**Master Orchestrator:** `/trigger/agency/execute-workflow.ts`

```typescript
// Recursive workflow executor
export const executeWorkflow = task({
  id: "execute-workflow",
  maxDuration: 3600,
  run: async ({ executionId, currentNodeId }) => {
    // 1. Load node config
    // 2. Execute node task
    // 3. Handle success/failure
    // 4. If human review, pause and wait
    // 5. Find next node(s) via edges
    // 6. Trigger next node execution
    // 7. Update execution progress
  }
});
```

### State Management

- Store execution state in `workflow-execution` and `workflow-node` tables
- Use Trigger.dev's `wait.for()` for delays
- Use Trigger.dev's pausing for human reviews
- Implement retry logic with exponential backoff
- Store intermediate results in `workflow-node.output` JSON field

## Phase 5: Research Pipeline

### Lead Enrichment Service

**Location:** `/services/lead-enrichment.service.ts`

```typescript
class LeadEnrichmentService {
  async enrichWithApollo(leadId): Promise<enrichmentData>
  async enrichWithProAPIs(leadId): Promise<enrichmentData>
  async findEmail(leadId): Promise<email>
  async verifyEmail(email): Promise<valid>
  async saveEnrichment(leadId, data): Promise<void>
}
```

**Integration points:**

- Apollo API (already exists)
- ProAPIs (you have integration started)
- Hunter.io / RocketReach for email finding
- ZeroBounce / NeverBounce for email verification

### Deep Research Service

**Location:** `/services/lead-research.service.ts`

**Extends existing:** `/services/perplexity.service.ts`

```typescript
class LeadResearchService {
  async researchWithPerplexity(leadId, customerProfile): Promise<research>
  async researchWithClaude(leadId, customerProfile): Promise<research>
  async analyzeCompany(companyDomain): Promise<analysis>
  async findRecentNews(personName, companyName): Promise<news[]>
  async extractPainPoints(research): Promise<painPoints[]>
  async saveResearch(leadId, customerId, data): Promise<void>
}
```

**Research prompt strategy:**

Pass customer profile context to AI:

```
You are researching {lead.name} at {lead.company} on behalf of our customer: {customer.name}.

Customer profile:
- What they do: {customer.description}
- Problems they solve: {customer.painPoints}
- Value propositions: {customer.valueProps}
- Target personas: {customer.targetPersonas}

Research objectives:
1. Understand the lead's role, responsibilities, and current initiatives
2. Identify challenges they face that align with our customer's solutions
3. Find recent company developments, funding, hiring, product launches
4. Assess fit: does this lead match our target persona?
5. Generate personalization hooks for outreach

Output a structured analysis with match scoring.
```

### Match Report Generator

**Location:** `/services/match-report.service.ts`

```typescript
class MatchReportService {
  async generateReport(leadId, customerId, leadResearchId): Promise<report>
  async scoreMatch(lead, customer, research): Promise<score>
  async findRelevantPainPoints(research, customerProfile): Promise<matches[]>
  async suggestMessagingAngle(lead, customer, research): Promise<suggestion>
  async extractPersonalizationTokens(research): Promise<tokens>
}
```

**Output structure:**

```typescript
{
  matchScore: 85, // 0-100
  fit: 'high' | 'medium' | 'low',
  matchReasons: [
    "Lead is VP Sales, matches target persona",
    "Company recently raised Series B, likely scaling sales team",
    "Pain point alignment: struggling with manual lead gen"
  ],
  relevantPainPoints: [
    { painPoint: "Manual lead gen", confidence: 0.9 }
  ],
  relevantValueProps: [
    { valueProp: "Automate with AI", relevance: 0.95 }
  ],
  suggestedApproach: "Lead with automation angle...",
  personalizationTokens: {
    recentFunding: "$20M Series B",
    companyInitiative: "Expanding to Europe",
    personalInterest: "Podcasts about AI"
  }
}
```

## Phase 6: Human-in-the-Loop System

### Approval Queue UI

**Location:** `/app/agency/approvals/page.tsx`

**Views:**

- **Pending Reviews** - List of items awaiting approval
- **By Type** - Tabs for lead lists, reports, messages, cold campaigns
- **By Customer** - Filter by which customer workflow
- **By Workflow** - Filter by which workflow execution

**Review Interfaces:**

1. **Lead List Review** (`/app/agency/approvals/lead-list/[queueId]`)

   - Table of leads found
   - Checkboxes to approve/reject individual leads
   - Bulk actions: approve all, reject low scores
   - Sort by match score, enrichment quality

2. **Research Report Review** (`/app/agency/approvals/reports/[queueId]`)

   - Lead profile + research summary
   - Match report visualization
   - Approve to continue, reject to skip lead
   - Add manual notes for context

3. **Message Review** (`/app/agency/approvals/messages/[queueId]`)

   - Similar to current `/app/workflow/approvals`
   - Show generated messages for warm/cold outreach
   - Edit before approval
   - Bulk approve with variations

4. **Cold Campaign Review** (`/app/agency/approvals/cold-campaigns/[queueId]`)

   - Review full email sequence (4-6 emails)
   - Preview rendering with variables
   - Test send to yourself
   - Approve to launch

### Auto-Approval Rules

**Configuration UI:** Node settings in workflow builder

```typescript
{
  autoApprove: {
    enabled: true,
    rules: [
      { field: 'matchScore', operator: '>=', value: 80 },
      { field: 'emailVerified', operator: '==', value: true },
      { field: 'hasLinkedIn', operator: '==', value: true }
    ],
    logic: 'AND' | 'OR',
    maxAutoApprove: 50, // stop auto-approving after X items
  }
}
```

**Implementation:** `/services/auto-approval.service.ts`

Before creating approval queue entry, check rules. If all pass, mark as auto-approved and continue workflow.

### Notifications

**Slack Integration:**

- Send notification when approval queue has pending items
- Include link to review interface
- Daily digest of pending approvals

**Email Notifications:**

- Configurable per workflow
- Include summary + CTA link

## Phase 7: Cold Outreach Integration

### Sequence Generator Service

**Location:** `/services/cold-sequence-generator.service.ts`

```typescript
class ColdSequenceGeneratorService {
  async generateSequence(
    leadId,
    customerId, 
    matchReport
  ): Promise<sequence>
  
  // Generate 4-6 email sequence with:
  // - Email 1: Pattern interrupt, specific observation
  // - Email 2: New angle, social proof
  // - Email 3: Direct value prop, case study
  // - Email 4: Breakup email
  
  async personalizeEmail(template, lead, customer, matchReport): Promise<email>
  async generateSubjectLines(count): Promise<subjects[]>
  async generatePreviewText(body): Promise<preview>
}
```

**AI Prompt Engineering:**

Use match report data for hyper-personalization:

```
Generate a cold email sequence for {lead.name} at {lead.company}.

Context:
- Our customer: {customer.name} - {customer.description}
- Why this lead is a fit: {matchReport.matchReasons}
- Lead insights: {matchReport.personalizationTokens}
- Relevant pain points: {matchReport.relevantPainPoints}
- Value props to emphasize: {matchReport.relevantValueProps}

Tone: {customer.toneOfVoice}

Generate 4 emails following best practices...
```

### Sending Service Integrations

**Location:** `/services/cold-outreach/`

**Adapter pattern:**

```typescript
interface ColdOutreachProvider {
  authenticate(): Promise<void>
  createCampaign(sequence, leads): Promise<campaignId>
  sendEmail(email): Promise<messageId>
  trackOpens(campaignId): Promise<opens[]>
  trackReplies(campaignId): Promise<replies[]>
  pauseCampaign(campaignId): Promise<void>
}

// Implementations:
class InstantlyProvider implements ColdOutreachProvider { ... }
class SmartleadProvider implements ColdOutreachProvider { ... }
class LemlistProvider implements ColdOutreachProvider { ... }
class InternalProvider implements ColdOutreachProvider { ... } // Your own
```

**For Phase 1:** Start with Instantly.ai integration

- Use their API to create campaigns
- Push leads + sequences
- Webhook to receive replies
- Update workflow execution on reply

**Future:** Build your own sending infrastructure

- Use your existing cold email models
- Integrate with Resend/SendGrid/Mailgun
- Manage IP reputation, warming, deliverability
- Full control over sending logic

### Reply Handling

**Webhook:** `/app/api/webhooks/cold-email-reply/route.ts`

When reply received:

1. Parse reply sentiment (positive/negative/neutral)
2. Update workflow execution status
3. If positive: trigger `BOOK_MEETING` node
4. If negative: mark lead as unqualified
5. Notify agency team via Slack

## Phase 8: Dashboard & Monitoring

### Workflow Execution Dashboard

**Location:** `/app/agency/workflows/[executionId]/page.tsx`

**Sections:**

1. **Progress Bar** - Overall % complete
2. **Visual Flow** - Workflow canvas with node statuses (green/yellow/red)
3. **Timeline** - Chronological log of node executions
4. **Stats** - Leads processed, approvals pending, messages sent, replies
5. **Errors** - Failed nodes with retry options
6. **Actions** - Pause, resume, cancel workflow

### Customer Results Dashboard

**Location:** `/app/agency/customers/[id]/results/page.tsx`

**Metrics:**

- Leads found vs enriched vs researched vs contacted
- Warm intro success rate
- Cold email open/reply rates
- Meetings booked (the ultimate metric)
- Cost per lead, cost per meeting
- ROI calculation

**Charts:**

- Funnel visualization (leads → research → outreach → meetings)
- Time series: meetings booked over time
- Comparison: warm vs cold success rates
- Lead quality distribution (match scores)

### Agency Overview Dashboard

**Location:** `/app/agency/page.tsx`

**Aggregate metrics across all customers:**

- Total active workflows
- Leads processed this month
- Meetings booked this month
- Revenue generated (if tracking)
- Customer health scores
- Pending approvals count

## Phase 9: Message Generation Enhancements

### Warm Intro Message Generator

**Enhance:** `/services/message-generation.service.ts`

**New input: Customer profile + Match report**

```typescript
async generateWarmIntroMessage(
  lead,
  mutual,
  customer, // NEW
  matchReport // NEW
): Promise<message>
```

**Prompt improvements:**

- Include customer pain points that lead experiences
- Reference match report insights
- Use customer's brand voice
- Inject personalization tokens from research

### Cold Email Message Generator

Already planned in cold sequence generator above.

### A/B Testing Support

**Future enhancement:**

- Generate multiple message variations
- Track performance by variation
- Auto-optimize based on reply rates

## Implementation Roadmap

### Sprint 1-2: Foundation (2-3 weeks)

- Create database schema (agency-customer, customer-profile, workflow tables)
- Build customer management UI (list, detail, profile editor)
- Create customer profile tRPC controllers
- Set up `/agency` route structure

### Sprint 3-4: Workflow Builder UI (3-4 weeks)

- Integrate React Flow library
- Build workflow canvas component
- Create node configuration panels for each primitive
- Implement save/load workflow templates
- Build workflow templates library

### Sprint 5-6: Workflow Engine (3-4 weeks)

- Build WorkflowEngineService orchestrator
- Create Trigger.dev tasks for each primitive
- Implement state management and error handling
- Build workflow execution dashboard
- Test end-to-end execution

### Sprint 7-8: Research Pipeline (2-3 weeks)

- Enhance LeadEnrichmentService with multi-provider support
- Build LeadResearchService with customer context
- Create MatchReportService with AI scoring
- Build research result UI components
- Database schema for enrichment, research, reports

### Sprint 9-10: Human-in-the-Loop (2-3 weeks)

- Create approval queue system
- Build review interfaces for each approval type
- Implement auto-approval rules engine
- Add notifications (Slack, email)
- Test approval workflow pausing/resuming

### Sprint 11-12: Cold Outreach (2-3 weeks)

- Build ColdSequenceGeneratorService
- Integrate with Instantly.ai (or chosen provider)
- Create sequence review UI
- Implement reply webhook handling
- Test cold outreach workflows

### Sprint 13-14: Dashboards & Polish (2 weeks)

- Build customer results dashboard
- Create agency overview dashboard
- Add monitoring and alerting
- Performance optimization
- Bug fixes and UX polish

### Sprint 15+: Advanced Features

- Meeting booking automation (Calendly integration)
- Advanced conditional logic (branching)
- Workflow versioning and rollback
- Template marketplace
- Multi-channel outreach (LinkedIn + Email)
- Build internal sending infrastructure
- Analytics and reporting enhancements

## Key Technical Decisions

### Workflow Builder Library

**Recommendation: React Flow**

- Industry standard for node-based UIs
- Excellent documentation, active community
- Supports custom nodes, edges, controls
- Built-in minimap, zoom, pan
- Good performance with large graphs

### AI Provider Strategy

**Perplexity** for research (you already have)

- Great for real-time web data
- Good for company/person research

**Claude 3.5 Sonnet** for message generation (you already use)

- Better at following brand voice
- Excellent at structured output
- Good for match report analysis

### State Management

Use Trigger.dev's native features:

- `triggerAndWait` for sequential steps
- `wait.for` for delays
- `metadata.set` for tracking
- Pause/resume for human reviews
- Database as source of truth for state

### Cold Email Provider

**Phase 1: Instantly.ai**

- Easy integration
- Good deliverability
- Reasonable pricing
- Lets you ship faster

**Phase 2: Build your own**

- Full control
- Lower cost at scale
- Use existing cold email models
- Integrate with Resend/SendGrid

## Files to Create

### Database Models (`/db/models/agency/`)

**All agency models in separate directory to maintain isolation:**

- `agency-customer.ts`
- `customer-profile.ts`  
- `workflow-template.ts`
- `workflow-execution.ts`
- `workflow-node.ts`
- `lead-enrichment.ts`
- `lead-research.ts`
- `lead-match-report.ts`
- `approval-queue.ts`
- `index.ts` - Export all agency models

**Update `/db/models/index.ts` to export agency models:**

```typescript
export * from './agency'
```

### Services (`/services/agency/`)

**All agency services in separate directory:**

- `workflow-engine.service.ts`
- `lead-enrichment.service.ts`
- `lead-research.service.ts`
- `match-report.service.ts`
- `cold-sequence-generator.service.ts`
- `auto-approval.service.ts`
- `cold-outreach/instantly-provider.ts`
- `cold-outreach/internal-provider.ts`
- `index.ts` - Export all agency services

**Can still import/reuse existing services as needed:**

- Import from `@/services/perplexity.service`
- Import from `@/services/apollo.service`
- Import from `@/services/message-generation.service`

### Trigger Tasks (`/trigger/agency/`)

**All agency tasks in separate directory:**

- `execute-workflow.ts`
- `execute-find-leads.ts`
- `execute-enrich-lead.ts`
- `execute-research-lead.ts`
- `execute-generate-match-report.ts`
- `execute-generate-cold-sequence.ts`
- `execute-send-cold-email.ts`
- `execute-human-review.ts`
- `execute-conditional.ts`

**Can call existing trigger tasks via `tasks.trigger()`:**

- Reuse `find-mutuals.ts` by calling it from agency tasks
- Reuse `send-initial-request.ts` for warm intros
- Keep existing workflows untouched

### UI Routes (`/app/agency/`)

- `page.tsx` - Agency dashboard
- `customers/page.tsx` - Customer list
- `customers/[id]/page.tsx` - Customer detail
- `customers/[id]/profile/page.tsx` - Profile editor
- `customers/[id]/workflows/page.tsx` - Workflows
- `customers/[id]/results/page.tsx` - Results dashboard
- `workflows/page.tsx` - All workflows
- `workflows/templates/page.tsx` - Template library
- `workflows/builder/[id]/page.tsx` - Workflow builder
- `workflows/[executionId]/page.tsx` - Execution detail
- `approvals/page.tsx` - Approval queue
- `approvals/lead-list/[queueId]/page.tsx`
- `approvals/reports/[queueId]/page.tsx`
- `approvals/messages/[queueId]/page.tsx`

### tRPC Controllers (`/trpc/controllers/agency/`)

- `create-customer.ts`
- `get-customer.ts`
- `list-customers.ts`
- `update-customer-profile.ts`
- `create-workflow-template.ts`
- `update-workflow-template.ts`
- `start-workflow-execution.ts`
- `pause-workflow-execution.ts`
- `resume-workflow-execution.ts`
- `get-workflow-execution.ts`
- `list-approvals.ts`
- `approve-item.ts`
- `reject-item.ts`

## Success Metrics

### Product Metrics

- Workflows created per month
- Workflows executed per month
- Leads processed per workflow
- Average match score quality
- Meetings booked per customer
- Time from lead found → meeting booked

### Business Metrics

- Customer acquisition cost
- Cost per meeting booked
- Customer LTV
- Churn rate
- NPS score

## Risk Mitigation

### Technical Risks

- **Workflow complexity** - Start simple, add primitives incrementally
- **AI reliability** - Implement fallbacks, human review checkpoints
- **API rate limits** - Queue management, retry logic
- **Data quality** - Multiple enrichment sources, validation

### Product Risks

- **Over-engineering** - Build MVP, validate with real campaigns first
- **Scope creep** - Focus on core workflow first, advanced features later
- **User adoption** - Make builder intuitive, provide templates

## Next Steps

1. **Validate with manual test** - Run a full campaign manually (find leads → research → warm → cold → meeting) to understand the full process
2. **Design data model** - Finalize table schemas
3. **Build customer profile system** - Start with the foundation
4. **Prototype workflow builder** - React Flow proof of concept
5. **Implement 1-2 primitives** - Get execution engine working
6. **Iterate and expand** - Add more primitives, build out UI

---

This is a multi-month project, but breaking it into these phases makes it manageable. Start with customer profiles and the workflow builder UI, then build out the execution engine, and finally add the research pipeline and cold outreach integrations.

The key insight is that everything becomes a reusable primitive that you can compose visually. This gives you infinite flexibility without hardcoding campaigns.