# Real-time Workflow Tracking Implementation

## Overview
Implemented a real-time workflow tracking system that allows you to monitor lead enrichment, research, and asset generation workflows as they execute in Trigger.dev.

## What Was Built

### 1. Database Schema Changes
Added `triggerRunId` field to the Lead model to store the Trigger.dev run ID for real-time tracking:

```prisma
model Lead {
  // ... existing fields
  triggerRunId     String?  @map("trigger_run_id") // Stores the Trigger.dev run ID for real-time tracking
}
```

**⚠️ Note:** Run `npx prisma migrate dev --name add_trigger_run_id` or manually add the column to your database.

### 2. Updated tRPC Mutation
Modified `trpc/routers/lead.ts` - `createBulk` mutation to capture and store the Trigger.dev run ID:

```typescript
const handle = await tasks.trigger(orchestrateLeadTask.id, {
  leadId: lead.id,
  linkedinUrl: lead.linkedinSlug,
  generateEmails,
  generateOnePager,
});

// Store the run ID in the lead for real-time tracking
await db.lead.update({
  where: { id: lead.id },
  data: { triggerRunId: handle.id },
});
```

### 3. New Lead Detail Page
Created `/app/leads/[id]/page.tsx` - A comprehensive workflow tracking page that shows:

- **Lead Information Card**: Client name, LinkedIn URL, status, and Run ID
- **Workflow Timeline**: Visual timeline showing all workflow steps with status indicators
  - Lead Enrichment (ProAPIs)
  - AI Research (Perplexity)
  - Email Generation (Claude)
  - Landing Page Generation
- **Expandable Step Details**: Click any step to see:
  - Enrichment data (JSON)
  - Research results (markdown preview)
  - **Generated Emails**: Full email content with proper formatting
  - **Landing Pages**: Responsive iframe preview with "Open in new tab" link
  - Error messages
- **Generated Assets**: List of all generated emails and landing pages at the bottom

### 4. Updated Workflow Page
Modified `/app/workflow/page.tsx` to redirect to the lead detail page after submission:
- Single lead → Redirects to `/leads/{leadId}` to watch real-time progress
- Multiple leads → Redirects to `/leads` to see the list

### 5. Status Indicators
The timeline uses visual indicators:
- ✅ **Green Check** - Step completed successfully
- ❌ **Red X** - Step failed
- 🔄 **Blue Spinner** - Step currently in progress
- ⭕ **Gray Circle** - Step pending (waiting for previous steps)

## Current State: Database Polling

Currently, the lead detail page polls the database every 3 seconds to check for status updates. This works but is not as real-time as Trigger.dev's native Realtime API.

## Next Steps: Integrate Trigger.dev Realtime API

To achieve true real-time updates (like "thinking mode" in LLMs), integrate Trigger.dev's Realtime API:

### Option 1: React Hooks (Frontend)

Trigger.dev provides React hooks for real-time subscriptions. Here's how to enhance the lead detail page:

```typescript
import { useRealtimeRun } from "@trigger.dev/react";

// In your component:
const { run, error } = useRealtimeRun(lead.triggerRunId, {
  accessToken: "YOUR_PUBLIC_TOKEN", // From environment
  baseURL: "https://api.trigger.dev",
});

// The `run` object updates in real-time with:
// - run.status: "QUEUED" | "EXECUTING" | "COMPLETED" | "FAILED"
// - run.output: Final output when completed
// - run.metadata: Custom metadata you set in tasks
// - run.tasks: Array of subtasks with their statuses
```

### Option 2: Backend Streaming (Advanced)

For more control, use Trigger.dev's backend realtime API to stream updates to your frontend:

1. Create an API route that subscribes to the run
2. Use Server-Sent Events (SSE) to stream updates to the frontend
3. Display updates in real-time

### Enhancing Tasks for Better Real-time UX

Update your Trigger.dev tasks to provide richer real-time feedback:

```typescript
import { metadata } from "@trigger.dev/sdk/v3";

export const enrichLeadTask = task({
  id: "enrich-lead",
  run: async (payload) => {
    // Update progress metadata for UI
    await metadata.set("status", "Fetching LinkedIn profile...");
    await metadata.set("progress", 25);
    
    const data = await enrichLinkedin(payload.url);
    
    await metadata.set("status", "Parsing profile data...");
    await metadata.set("progress", 75);
    
    // Process data
    
    await metadata.set("status", "Complete!");
    await metadata.set("progress", 100);
    
    return data;
  }
});
```

Then in your frontend, display this metadata in real-time:

```typescript
const { run } = useRealtimeRun(runId);

// Show progress bar
<ProgressBar value={run.metadata?.progress || 0} />
<Text>{run.metadata?.status || "Starting..."}</Text>
```

### Authentication Setup

To use Trigger.dev Realtime, you need to set up authentication:

1. **Create a Public API Token** in your Trigger.dev dashboard
2. **Add to environment variables**:
   ```env
   NEXT_PUBLIC_TRIGGER_DEV_PUBLIC_TOKEN=tr_public_xxx
   NEXT_PUBLIC_TRIGGER_DEV_URL=https://api.trigger.dev
   ```
3. **Use in your React components**

See: https://trigger.dev/docs/realtime/auth

## Demo Flow for YC

Here's the recommended demo flow:

1. **Start**: Go to `/workflow` page
2. **Input**: Paste a LinkedIn URL and select a client
3. **Run**: Click "Run Workflow" button
4. **Redirect**: Automatically redirected to `/leads/{leadId}`
5. **Watch**: See the workflow timeline animate in real-time:
   - Spinner on "Lead Enrichment" step
   - After ~10s, checkmark appears, enrichment data visible
   - Spinner moves to "AI Research" step
   - After ~30s, research completes, markdown preview available
   - Continue through email and landing page generation
6. **Expand**: Click any completed step to see the output:
   - Click "Email Generation" to see full email messages
   - Click "Landing Page" to see responsive iframe preview
7. **Preview**: Click "Open in new tab" to view landing pages full-screen
8. **Assets**: Scroll down to see the complete list of generated assets

## Files Modified

- ✅ `prisma/schema.prisma` - Added triggerRunId field
- ✅ `trpc/routers/lead.ts` - Store run ID on lead creation
- ✅ `app/workflow/page.tsx` - Redirect after workflow start
- ✅ `app/leads/[id]/page.tsx` - NEW: Real-time workflow tracking page

## Benefits

1. **Transparency**: See exactly what's happening in the background
2. **Debugging**: Identify which step failed and why
3. **User Confidence**: Real-time progress builds trust
4. **Demo-Ready**: Perfect for showing the AI agent at work

## Future Enhancements

1. **Trigger.dev Realtime Integration**: Replace polling with true real-time subscriptions
2. **Step-by-Step Logs**: Show detailed logs for each step
3. **Retry Failed Steps**: Add button to retry specific failed steps
4. **Progress Estimates**: Show time remaining for each step
5. **Batch Tracking**: Track multiple leads running in parallel
6. **Notifications**: Alert when workflows complete or fail
7. **Export Timeline**: Download workflow execution report

## Resources

- [Trigger.dev Realtime Docs](https://trigger.dev/docs/realtime)
- [React Hooks Guide](https://trigger.dev/docs/realtime/react-hooks)
- [Backend Streaming Guide](https://trigger.dev/docs/realtime/backend)
- [Authentication Guide](https://trigger.dev/docs/realtime/auth)

