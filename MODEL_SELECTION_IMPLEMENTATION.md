# Model Selection Feature Implementation

## Overview
Added a model selection step to the workflow allowing users to choose between Production and Development AI models for faster YC demos.

## Changes Made

### 1. Workflow UI (`app/workflow/page.tsx`)
- Added "Model Selection" as Step 4 in the workflow
- Added state variable: `modelTier` with default value `"production"`
- Created new step UI with two selection cards:
  - **Production**: Perplexity `sonar-pro` + Anthropic `claude-sonnet-4-5`
  - **Development**: Perplexity `sonar` + Anthropic `claude-haiku-4-5`
- Updated `canProceed()` to handle the new step
- Updated submit handler to pass `modelTier` to the backend

### 2. tRPC Router (`trpc/routers/lead.ts`)
- Added `modelTier` to input schema with enum validation `['production', 'development']`
- Added logic to map model tier to specific model names:
  ```typescript
  const models = modelTier === 'production'
    ? {
        perplexityModel: 'sonar-pro',
        anthropicModel: 'claude-sonnet-4-5',
      }
    : {
        perplexityModel: 'sonar',
        anthropicModel: 'claude-haiku-4-5',
      };
  ```
- Pass `perplexityModel` and `anthropicModel` to orchestrator task

### 3. Orchestrator (`trigger/orchestrateLead.ts`)
- Added `perplexityModel` and `anthropicModel` to payload interface
- Set defaults to production models (`sonar-pro` and `claude-sonnet-4-5`)
- Pass models to `researchLeadTask` and `generateEmailsTask`

### 4. Research Task (`trigger/researchLead.ts`)
- Added `perplexityModel` and `anthropicModel` to payload interface
- Updated 3 model calls to use dynamic models:
  - Line 63: Extract structured data using `anthropic(anthropicModel)`
  - Line 118: Company research using `perplexity(perplexityModel)`
  - Line 223: Generate report using `anthropic(anthropicModel)`

### 5. Email Generation Task (`trigger/generateEmails.ts`)
- Added `anthropicModel` to payload interface
- Updated 4 model calls to use dynamic model:
  - Line 36: Initial subject using `anthropic(anthropicModel)`
  - Line 58: Initial body using `anthropic(anthropicModel)`
  - Line 88: Followup subject using `anthropic(anthropicModel)`
  - Line 112: Followup body using `anthropic(anthropicModel)`

## User Flow
1. **Step 1**: Select Client
2. **Step 2**: Choose Assets (Email, Landing Page)
3. **Step 3**: Paste LinkedIn URLs
4. **Step 4**: Select Model Tier (Production/Development) - **NEW**
5. Click "Run Workflow"

## Model Mappings

| Tier | Perplexity Model | Anthropic Model |
|------|------------------|-----------------|
| **Production** | `sonar-pro` | `claude-sonnet-4-5` |
| **Development** | `sonar` | `claude-haiku-4-5` |

## Default Behavior
- **Production** tier is pre-selected by default
- If no model tier is specified, defaults to Production models
- All existing functionality remains unchanged

## Testing Notes
- No linting errors in modified files
- TypeScript compilation successful (pre-existing type warnings unrelated to changes)
- All code follows existing patterns and conventions
- Added data-testid attributes for testing: `production-model-button` and `development-model-button`

## Files Modified
1. `/app/app/workflow/page.tsx` - Added UI step for model selection
2. `/app/trpc/routers/lead.ts` - Added model tier parameter and mapping
3. `/app/trigger/orchestrateLead.ts` - Pass models to tasks
4. `/app/trigger/researchLead.ts` - Use dynamic models
5. `/app/trigger/generateEmails.ts` - Use dynamic model
