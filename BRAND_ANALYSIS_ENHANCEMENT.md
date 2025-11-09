# Brand Analysis Enhancement Summary

## Overview
Enhanced the `enrichClient.ts` workflow to capture brand visual identity (colors, design style, tone) from client websites using Playwright and GPT-4o Vision.

## What Was Added

### 1. Database Schema Updates
**File:** `/app/prisma/schema.prisma`

Added brand analysis fields to Client model:
- `primaryColors` (String array) - Main brand colors in hex format
- `secondaryColors` (String array) - Accent colors in hex format  
- `designStyle` (String) - Visual style (minimal, corporate, playful, etc.)
- `layoutType` (String) - Homepage layout structure
- `visualTone` (String) - Overall visual impression
- `toneOfVoice` (String) - Writing style and personality
- `brandPersonality` (String array) - Key personality traits

### 2. Dependencies Installed
```bash
npm install playwright
npx playwright install chromium
```

### 3. Enhanced enrichClient.ts Workflow

**File:** `/app/trigger/enrichClient.ts`

#### New Phase 3.5: Website Visual and Brand Analysis

Added between Phase 3 (Marketing Research) and Phase 4 (Structured Extraction):

**What it does:**
1. **Browser Automation** - Launches headless Chromium via Playwright
2. **Screenshot Capture** - Takes full-page screenshot of client's homepage
3. **Text Extraction** - Scrapes text content from the page
4. **Visual Analysis** - Uses GPT-4o Vision API to analyze:
   - Primary brand colors (hex values)
   - Secondary/accent colors (hex values)
   - Design style (minimal, corporate, playful, etc.)
   - Layout type (hero-centered, grid-based, etc.)
   - Visual tone (professional, friendly, bold, etc.)
5. **Text Analysis** - Uses GPT-4o to analyze text for:
   - Tone of voice (professional, casual, technical, etc.)
   - Brand personality traits (innovative, trustworthy, etc.)
6. **Database Save** - Stores all brand analysis data in Client record

#### Error Handling
- If website is inaccessible or screenshot fails, the phase logs error but continues
- Enrichment completes without brand analysis data (graceful degradation)
- Visual and text analysis fields remain null/empty if capture fails

### 4. Updated Email Notifications
**File:** `/app/trigger/enrichClient.ts` (Phase 6)

Email now includes:
- Brand Colors count (primary + secondary)
- Brand Analysis status (Complete/Incomplete)

### 5. Enhanced Return Stats
Task now returns:
```typescript
{
  success: true,
  clientId: string,
  stats: {
    features: number,
    testimonials: number,
    brandingAssets: number,
    marketingMaterials: number,
    brandColors: number,              // NEW
    brandAnalysisComplete: boolean    // NEW
  }
}
```

## Technical Implementation

### Zod Schemas Added
```typescript
VisualAnalysisSchema - {
  primaryColors: string[]
  secondaryColors: string[]
  designStyle: string
  layoutType: string
  visualTone: string
}

TextAnalysisSchema - {
  toneOfVoice: string
  brandPersonality: string[]
}
```

### AI Models Used
- **GPT-4o Vision** - Screenshot analysis for colors and design
- **GPT-4o** - Text analysis for tone and personality
- Both use OpenAI SDK with your OPENAI_API_KEY

### Playwright Configuration
- Browser: Chromium (headless)
- Viewport: 1920x1080
- Screenshot: JPEG, 80% quality, above-the-fold
- Timeout: 30 seconds
- Wait: networkidle (waits for network to be idle)

## Environment Setup Required

### Add to your `.env.local` file:
```bash
# OpenAI API Key (for GPT-4o Vision and text analysis)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Existing keys (keep these)
PERPLEXITY_API_KEY=your-perplexity-key
ANTHROPIC_API_KEY=your-anthropic-key
RESEND_API_KEY=your-resend-key
NEXT_PUBLIC_APP_URL=your-app-url
```

## Next Steps for You

### 1. Add OpenAI API Key
Create or update `/app/.env.local` with your OpenAI API key:
```bash
OPENAI_API_KEY=sk-your-actual-key-here
```

### 2. Run Database Migration
Update your database schema with the new fields:
```bash
cd /app
npx prisma db push
```

Or create a migration:
```bash
npx prisma migrate dev --name add_brand_analysis_fields
```

### 3. Regenerate Prisma Client
```bash
npx prisma generate
```

### 4. Test the Enhancement
1. Start your development server
2. Go to `/clients` page
3. Click the ⚡ lightning bolt to enrich a client
4. Enter a company name and website URL
5. Watch the enrichment process complete
6. Check the client detail page for brand analysis data

## How It Works - Example Flow

### Input:
- Company: "Stripe"
- Domain: "stripe.com"

### Phase 3.5 Process:
1. Browser visits https://stripe.com
2. Takes screenshot of homepage
3. Scrapes text content
4. GPT-4o Vision analyzes screenshot → 
   - Primary Colors: ["#635BFF", "#FFFFFF"]
   - Secondary Colors: ["#0A2540", "#00D4FF"]
   - Design Style: "Modern, minimalist, tech-forward"
   - Layout Type: "Hero-centered with gradient background"
   - Visual Tone: "Professional, innovative, trustworthy"
5. GPT-4o analyzes text →
   - Tone of Voice: "Confident and authoritative with developer-focused clarity"
   - Brand Personality: ["innovative", "reliable", "developer-first", "modern", "trustworthy"]

### Output:
All data saved to Client record and available for landing page generation!

## Usage in Landing Page Generation

The `generateLandingPage.ts` task can now access these brand fields:
```typescript
const client = await db.client.findUnique({
  where: { id: clientId },
  include: { /* ... */ }
});

// Now available:
client.primaryColors      // ["#635BFF", "#FFFFFF"]
client.secondaryColors    // ["#0A2540", "#00D4FF"]
client.designStyle        // "Modern, minimalist"
client.visualTone         // "Professional, innovative"
client.toneOfVoice        // "Confident and authoritative"
client.brandPersonality   // ["innovative", "reliable", ...]
```

You can use these to:
- Match color schemes in generated landing pages
- Adapt design style to client's brand
- Mirror their tone of voice in copy
- Align personality traits in messaging

## Files Modified

### Modified:
- `/app/prisma/schema.prisma` - Added brand analysis fields
- `/app/trigger/enrichClient.ts` - Added Phase 3.5 with Playwright + GPT-4o Vision
- `/app/package.json` - Added Playwright dependency (via npm)

### Created:
- `/app/BRAND_ANALYSIS_ENHANCEMENT.md` - This documentation

## Important Notes

- ⚠️ **Database migration required** - Run `npx prisma db push` or `npx prisma migrate dev`
- ⚠️ **OpenAI API key required** - Add to `.env.local` before testing
- ⚠️ **Chromium installed** - Already installed via `npx playwright install chromium`
- ✅ **Graceful degradation** - If website analysis fails, enrichment still completes
- ✅ **New clients only** - Only affects newly enriched clients (as requested)
- ✅ **10-minute timeout** - Entire enrichment process including brand analysis

## Testing Checklist

- [ ] Add OPENAI_API_KEY to `.env.local`
- [ ] Run `npx prisma db push` to update database schema
- [ ] Run `npx prisma generate` to regenerate Prisma client
- [ ] Test enrichment with a public website (e.g., stripe.com)
- [ ] Verify brand colors are captured in hex format
- [ ] Check that design style and tone are descriptive
- [ ] Confirm email notification includes brand analysis stats
- [ ] Test with a website that fails to load (verify graceful handling)
- [ ] Check client detail page displays new brand fields

## Example Output

### Successful Brand Analysis:
```json
{
  "primaryColors": ["#FF6B6B", "#4ECDC4"],
  "secondaryColors": ["#1A535C", "#FFE66D"],
  "designStyle": "Playful and modern with bold color usage",
  "layoutType": "Hero-centered with card-based sections",
  "visualTone": "Friendly, approachable, energetic",
  "toneOfVoice": "Casual and conversational with enthusiasm",
  "brandPersonality": ["friendly", "innovative", "approachable", "energetic", "modern"]
}
```

### Failed Analysis (website inaccessible):
```json
{
  "primaryColors": [],
  "secondaryColors": [],
  "designStyle": null,
  "layoutType": null,
  "visualTone": null,
  "toneOfVoice": null,
  "brandPersonality": []
}
```

## Support

If you encounter issues:
1. Check that OPENAI_API_KEY is set correctly
2. Verify Chromium is installed (`npx playwright install chromium`)
3. Ensure website URL is accessible (try visiting manually)
4. Check Trigger.dev logs for detailed error messages
5. Verify database migration completed successfully

## Future Enhancements (Optional)

Consider adding:
- Logo extraction and storage from screenshot
- Font family detection
- Animation/interaction style analysis
- Mobile vs desktop design comparison
- Accessibility score
- Re-enrichment capability for existing clients
