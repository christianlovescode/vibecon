# Quick Setup Guide - Brand Analysis Enhancement

## Prerequisites
✅ Playwright installed  
✅ Code changes complete  
⏳ Need to complete these steps:

## Step-by-Step Setup

### 1. Add OpenAI API Key

Create or update `/app/.env.local`:

```bash
# Add this line to your .env.local file
OPENAI_API_KEY=sk-your-openai-api-key-here

# Keep your existing keys:
# PERPLEXITY_API_KEY=...
# ANTHROPIC_API_KEY=...
# RESEND_API_KEY=...
# NEXT_PUBLIC_APP_URL=...
# DATABASE_URL=...
```

### 2. Update Database Schema

Run this command to add the new brand analysis fields to your database:

```bash
cd /app
npx prisma db push
```

### 3. Regenerate Prisma Client

Generate the updated Prisma client with new fields:

```bash
cd /app
npx prisma generate
```

### 4. Start Your Application

```bash
cd /app
npm run dev
# or
yarn dev
```

### 5. Test Brand Analysis

1. Navigate to `/clients` page
2. Click the ⚡ lightning bolt button
3. Enter a test company:
   - **Name:** Stripe
   - **Domain:** stripe.com
4. Submit and watch enrichment process
5. Wait for completion (check email notification)
6. View client details to see brand analysis data

## Expected Results

After successful enrichment, you should see:

### In Database:
- `primary_colors`: Array of hex colors (e.g., ["#635BFF", "#FFFFFF"])
- `secondary_colors`: Array of hex colors
- `design_style`: Description of visual style
- `layout_type`: Homepage layout description
- `visual_tone`: Overall visual impression
- `tone_of_voice`: Writing style description
- `brand_personality`: Array of personality traits

### In Email Notification:
- "Brand Colors: 4" (or however many captured)
- "Brand Analysis: Complete"

### In Trigger.dev Logs:
```
Phase 3.5: Website visual and brand analysis
Launching browser to capture screenshot
Page loaded, capturing screenshot
Screenshot captured, analyzing with GPT-4o Vision
Visual analysis complete
Text analysis complete
Phase 3.5 complete
```

## Troubleshooting

### Error: "OPENAI_API_KEY not found"
**Solution:** Add your OpenAI API key to `.env.local`

### Error: "Missing environment variable: DATABASE_URL"
**Solution:** Ensure DATABASE_URL is set in your `.env.local`

### Error: "Failed to launch browser"
**Solution:** Run `npx playwright install chromium` again

### Website Analysis Returns Empty
**Possible causes:**
- Website requires authentication
- Website blocks automated browsers
- Website has aggressive rate limiting
- Network timeout

**Note:** This is expected behavior - enrichment will complete without brand data.

## Verification Commands

Check Prisma schema is updated:
```bash
cat /app/prisma/schema.prisma | grep -A 5 "Brand Analysis"
```

Check Playwright is installed:
```bash
npx playwright --version
```

Check environment variables:
```bash
cat /app/.env.local | grep OPENAI_API_KEY
```

## Test Websites

Good test candidates:
- ✅ **stripe.com** - Clean design, clear colors
- ✅ **vercel.com** - Modern, minimalist
- ✅ **notion.so** - Distinctive brand
- ✅ **linear.app** - Strong visual identity
- ✅ **github.com** - Well-known brand

Websites to avoid for testing:
- ❌ Sites with login walls
- ❌ Sites with aggressive bot detection
- ❌ Sites with heavy JavaScript requirements

## What Changed

### Files Modified:
1. `/app/prisma/schema.prisma` - 7 new fields
2. `/app/trigger/enrichClient.ts` - New Phase 3.5
3. `/app/package.json` - Playwright dependency

### New Capabilities:
- Screenshot capture with Playwright
- GPT-4o Vision analysis for colors and design
- GPT-4o text analysis for tone and personality
- Structured data storage in database
- Enhanced email notifications

## Next Steps After Testing

Once you verify it works:

1. **Update generateLandingPage.ts** to use brand data:
   ```typescript
   // Example: Use captured colors in landing page
   const prompt = `Create a landing page using these brand colors:
   Primary: ${client.primaryColors.join(', ')}
   Secondary: ${client.secondaryColors.join(', ')}
   Style: ${client.designStyle}
   Tone: ${client.toneOfVoice}
   ...`;
   ```

2. **Add brand preview** to client detail page UI

3. **Create re-enrichment** capability for existing clients

4. **Add brand matching score** to measure alignment

## Support

If you encounter issues, check:
1. All environment variables are set
2. Database migration completed
3. Prisma client regenerated
4. Chromium browser installed
5. OpenAI API key has credits

Review the full documentation: `/app/BRAND_ANALYSIS_ENHANCEMENT.md`
