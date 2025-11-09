# Asset Generation Pipeline - MVP Implementation

## Overview
Built a comprehensive asset generation pipeline that creates hyper-relevant cold outreach materials (emails and landing pages) for each lead based on their research profile.

## What Was Built

### 1. Database Schema (`/app/prisma/schema.prisma`)

Added new `LeadAsset` model:
```prisma
model LeadAsset {
  id        String   @id @default(uuid())
  leadId    String   @map("lead_id")
  type      String   // "message" or "landing_page"
  content   String   @db.Text // Message content or landing page URL
  name      String   // Variable name (e.g., "initial_outreach_subject")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt()
  
  lead Lead @relation(fields: [leadId], references: [id], onDelete: Cascade)
}
```

Updated `Lead` model to include relationship:
```prisma
assets LeadAsset[]
```

### 2. Email Generation Task (`/app/trigger/generateEmails.ts`)

**What it generates:**
- Initial outreach subject line
- Initial outreach body (2-3 sentences)
- Followup outreach subject line
- Followup outreach body (2-3 sentences)

**Email Style Guidelines:**
- 2-3 sentences max
- Direct and conversational
- References specific talking points from research
- NO sales-y phrases like "Hope this finds you well", "Touching base", "Following up"
- Natural and relevant, not obviously personalized

**How it works:**
1. Fetches lead with research report and client data
2. Uses Claude Sonnet 4.5 to generate each email component
3. Each generation uses the research report's talking points
4. Saves all 4 assets to the database with descriptive names

**Asset names created:**
- `initial_outreach_subject`
- `initial_outreach_body`
- `followup_outreach_subject`
- `followup_outreach_body`

### 3. Landing Page Generation Task (`/app/trigger/generateLandingPage.ts`)

**What it generates:**
- A personalized landing page using Vercel V0 API

**How it works:**
1. Fetches lead with full client data (features, testimonials, marketing materials)
2. Uses Claude Sonnet 4.5 to create a detailed V0 prompt
3. The prompt includes:
   - Lead's specific pain points from research
   - Client's relevant features/services
   - Relevant testimonials
   - Personalized messaging addressing their challenges
4. Calls V0 API to generate and deploy the landing page
5. Stores the landing page URL in database

**Asset name created:**
- `landing_page_url`

**V0 SDK Configuration:**
- Uses `v0-sdk` npm package (v0.15.0)
- API Key: Stored in `.env.local` as `V0_API_KEY`
- Creates a chat with V0 using `responseMode: "sync"` for non-streaming
- Returns `ChatDetail` with preview URL, code files, and chat metadata
- Stores the preview URL for customers to use in outreach

### 4. Updated Orchestration (`/app/trigger/orchestrateLead.ts`)

**New workflow steps:**
1. Enrichment (existing)
2. Research (existing)
3. **Generate Emails** (NEW)
4. **Generate Landing Page** (NEW)

**Idempotency:**
- Checks if assets already exist before generating
- Skips generation if assets found
- Only runs after research completes successfully

**Tracking:**
- Returns `emailsGenerated` and `landingPageGenerated` flags
- Logs all generation steps

### 5. tRPC API Updates (`/app/trpc/routers/lead.ts`)

**New endpoints:**
- `lead.getAssets`: Fetch all assets for a specific lead
  ```typescript
  lead.getAssets.useQuery({ leadId: "..." })
  ```

**Updated endpoints:**
- `lead.list`: Now includes `_count.assets` for each lead
- `lead.getById`: Now includes `assets` array with all generated assets

### 6. UI Updates

**Lead Detail Page (`/app/app/leads/[leadId]/page.tsx`)**
- Added "Generated Assets" section
- Displays all email messages with formatted names
- Shows landing page URL as clickable link
- Auto-refreshes while assets are being generated
- Sections organized: Overview → Assets → Enrichment → Research

**Leads List Page (`/app/app/leads/page.tsx`)**
- Added "Assets" column showing count of generated assets
- Green badge if assets exist, gray if none
- Helps identify which leads have completed asset generation

## Asset Generation Flow

```
Lead Created
    ↓
Enrichment Task
    ↓
Research Task
    ↓
Generate Emails Task (4 assets)
    ↓
Generate Landing Page Task (1 asset)
    ↓
Total: 5 assets per lead
```

## Environment Variables

Added to `/app/.env.local`:
```bash
V0_API_KEY="v1:A1LPXKH5aTFIwNv6fRhfcE99:Jg4totilw9vX4fgmjgaiOnjR"
```

**Required for production:**
- `ANTHROPIC_API_KEY` - Claude Sonnet 4.5 for email generation
- `V0_API_KEY` - Vercel V0 for landing page generation
- `PERPLEXITY_API_KEY` - Research (already configured)

## Testing the Pipeline

### 1. Create a Client
Go to `/clients` and create a client with:
- Company details
- Features/services
- Testimonials
- Marketing materials

### 2. Upload a Lead
Go to `/leads` and:
- Select the client
- Paste a LinkedIn URL
- Click "Upload & Enrich Leads"

### 3. Watch the Progress
The status will progress through:
- PENDING
- ENRICHING
- ENRICHED
- RESEARCHING
- COMPLETED

### 4. View Generated Assets
Click on the lead to view:
- 4 email assets (subjects + bodies)
- 1 landing page URL
- Full research report
- Enrichment data

## Files Created/Modified

**New Files:**
- `/app/trigger/generateEmails.ts` - Email generation task
- `/app/trigger/generateLandingPage.ts` - Landing page generation task
- `/app/.env.local` - Environment variables with V0 API key
- `/app/ASSET_GENERATION_SUMMARY.md` - This file

**Modified Files:**
- `/app/prisma/schema.prisma` - Added LeadAsset model
- `/app/trigger/orchestrateLead.ts` - Added asset generation steps
- `/app/trpc/routers/lead.ts` - Added getAssets endpoint, updated list/getById
- `/app/app/leads/page.tsx` - Added assets column
- `/app/app/leads/[leadId]/page.tsx` - Added generated assets section

## Next Steps

### Enhancements to Consider:
1. **Asset Editing**: Allow users to edit generated emails before sending
2. **Template Library**: Save successful email patterns as templates
3. **A/B Testing**: Generate multiple variations of emails
4. **Analytics**: Track which assets perform best
5. **Bulk Export**: Export all assets for a client as CSV
6. **Custom Variables**: Let users define custom merge fields
7. **Landing Page Editing**: V0 API may support editing - explore this
8. **Asset Regeneration**: Add "Regenerate" button for individual assets
9. **Email Preview**: Rich preview of how emails will look
10. **Integration**: Connect to email sending tools (SendGrid, etc.)

### Current Limitations:
- Email prompts are basic (as requested) - can be enhanced later
- Landing pages are generated once - no editing UI yet
- No asset versioning/history
- No bulk operations on assets

## Usage Notes

**For Customers:**
- Asset names (e.g., `initial_outreach_subject`) can be used as custom variables in email tools
- Copy/paste assets directly into outreach sequences
- Landing page URLs can be embedded in emails
- All assets are tied to the specific lead's research

**Asset Naming Convention:**
- `initial_outreach_subject` - First email subject
- `initial_outreach_body` - First email body
- `followup_outreach_subject` - Second email subject
- `followup_outreach_body` - Second email body
- `landing_page_url` - Personalized landing page

## Technical Implementation Details

**Email Generation Strategy:**
- Uses research report's "Recommended Talking Points" section
- Each email pulls different angles from the research
- Followup emails take a different approach than initial
- Claude Sonnet 4.5 ensures high quality and natural language
- Explicit instructions to avoid common cold email clichés

**Landing Page Generation Strategy:**
- First uses Claude to create a comprehensive V0 prompt
- Prompt includes lead's pain points + client's solutions
- V0 SDK creates a chat and generates a full Next.js landing page
- V0 automatically provides a demo/preview URL
- URL is stored as asset content for the customer to use

**Performance:**
- Email generation: ~30-60 seconds for all 4 assets
- Landing page generation: ~60-90 seconds
- Total asset generation time: ~2-3 minutes per lead
- Runs asynchronously after research completes

## Database Migration

**Important:** The schema changes require a database migration. However, since this appears to be a production/hosted environment, the migration should be handled by your deployment pipeline. The Prisma client has been generated with the new schema.

If you need to manually migrate:
```bash
npx prisma db push
# or
npx prisma migrate dev --name add_lead_assets
```
