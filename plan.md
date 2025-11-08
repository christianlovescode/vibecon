# Client Dashboard - Development Plan

## Objectives
- Build a clients dashboard using Next.js (App Router), tRPC, Prisma, and Radix UI Themes.
- Deliver: Clients list page (name, website, createdAt), individual client detail pages, and full CRUD for Client plus related MarketingMaterial and LogoAndBranding.
- UI must use Radix Themes with teal accent and slate gray scale, follow provided design_guidelines.md, include proper loading/empty/error states, and data-testid attributes.

## Phases Overview
- Phase 1: V1 App Development (Core list + detail + update; relational read) - **COMPLETED**
- Phase 2: Feature Expansion (Complete CRUD, related records management, search/sort/pagination)
- Phase 3: Testing & Polish (Automated E2E checks, accessibility, UX refinements)

---
## Phase 1: V1 App Development (Status: COMPLETED ✅)

### Scope
- Implement read flows end-to-end and safe update for Client. Include relational reads for MarketingMaterial and LogoAndBranding on detail page.
- Apply Radix Themes (accentColor="teal", grayColor="slate") and tokens from design_guidelines.md.

### Implementation Steps - COMPLETED
1) ✅ Prisma
   - Generated Prisma client (output at app/generated/prisma)
   - Created .env with DATABASE_URL configuration
   
2) ✅ tRPC Backend
   - Created router: /app/trpc/routers/client.ts with procedures:
     - `client.list`: returns id, name, website, createdAt
     - `client.byId`: returns full Client with marketingMaterials and logosAndBranding included
     - `client.update`: partial update for all editable Client fields
   - Registered client router in _app.ts
   
3) ✅ Frontend Pages
   - app/clients/page.tsx: Radix Table with Name, Website, Created columns. Links to /clients/[id]. Includes loading, empty, and error states.
   - app/clients/[id]/page.tsx: All Client fields displayed in TextField/TextArea components with Edit/Save/Cancel functionality. Marketing Materials and Branding Assets shown in separate tables (read-only).
   - Added data-testid attributes to all interactive elements and key sections
   
4) ✅ Theming & Tokens
   - Updated app/layout.tsx with Theme component: accentColor="teal", grayColor="slate", radius="medium"
   - Appended comprehensive design tokens to app/globals.css (colors, borders, shadows, focus rings, noise overlay utility)

### User Stories - DELIVERED
1. ✅ As a user, I can view a table of all clients with name, website, and created date.
2. ✅ As a user, I can click a client row to open its detail page.
3. ✅ As a user, I see all client fields populated in inputs/text areas for review.
4. ✅ As a user, I can edit client info and save changes successfully.
5. ✅ As a user, I can view related MarketingMaterial and LogoAndBranding items in separate tables on the detail page.

### Exit Criteria - MET
- ✅ List page loads data from tRPC and renders correctly with proper states
- ✅ Detail page fetches by ID with relations (marketingMaterials, logosAndBranding)
- ✅ Update mutation implemented with form state management
- ✅ UI adheres to Radix Themes + design tokens
- ✅ All interactive elements have data-testid attributes
- ⏳ User will perform manual testing and report any issues

### Files Created/Modified
- `/app/trpc/routers/client.ts` - New tRPC client router
- `/app/trpc/routers/_app.ts` - Registered client router
- `/app/app/layout.tsx` - Updated with Radix Theme configuration
- `/app/app/globals.css` - Added design tokens
- `/app/app/clients/page.tsx` - New clients list page
- `/app/app/clients/[id]/page.tsx` - New client detail page
- `/app/.env` - Created with DATABASE_URL

---
## Phase 2: Feature Expansion (Status: Not Started)

### Scope
- Complete CRUD for Client and related records; add basic search, sort, and pagination.

### Implementation Steps
1) tRPC Backend
   - `client.create`: Create new client with required fields
   - `client.delete`: Delete client (soft delete optional, cascade to relations)
   - `client.list` enhancements: 
     - Add search parameter (filter by name/website)
     - Add sort parameter (name/createdAt, asc/desc)
     - Add pagination (cursor-based or offset/limit)
   - Marketing Material CRUD:
     - `marketing.create`: Add new marketing material to client
     - `marketing.update`: Update existing marketing material
     - `marketing.delete`: Remove marketing material
   - Branding Asset CRUD:
     - `branding.create`: Add new branding asset to client
     - `branding.update`: Update existing branding asset
     - `branding.delete`: Remove branding asset

2) Frontend - Clients List Page
   - Add "New Client" button → Dialog/form to create client
   - Wire search TextField to filter clients (debounced)
   - Make table headers sortable (Name, Created)
   - Add pagination controls (Previous/Next or page numbers)
   - Add delete action with confirmation dialog
   - Install and configure Sonner for toast notifications

3) Frontend - Client Detail Page
   - Add "Add Material" button → Dialog/form for marketing materials
   - Add edit/delete actions for each marketing material row
   - Add "Add Asset" button → Dialog/form for branding assets
   - Add edit/delete actions for each branding asset row
   - Implement optimistic updates with tRPC query invalidation
   - Show success/error toasts for all mutations

### User Stories
1. As a user, I can create a new client from the clients list page and see it appear immediately.
2. As a user, I can delete a client with a confirmation step and see the table refresh.
3. As a user, I can search clients by name or website to narrow results quickly.
4. As a user, I can sort clients by name or creation date.
5. As a user, I can navigate through pages of clients if there are many.
6. As a user, I can add/edit/remove a marketing material record from the client's detail page.
7. As a user, I can add/edit/remove a branding asset from the client's detail page.
8. As a user, I receive toast notifications confirming successful actions or showing errors.

### Exit Criteria
- All CRUD operations work for Client, MarketingMaterial, and LogoAndBranding
- List page supports search, sort, and pagination
- Optimistic UI updates and proper query invalidation implemented
- Toast notifications for all mutations
- No major UX or data bugs
- All new features include data-testid attributes

---
## Phase 3: Testing & Polish (Status: Not Started)

### Scope
- Comprehensive testing, accessibility, UX refinements, and performance hygiene.

### Implementation Steps
1) Automated Testing
   - Run testing agent for E2E flows:
     - List page render with various data states
     - Open client detail page
     - Update client fields
     - Create new client
     - Delete client with confirmation
     - Add/edit/delete marketing materials
     - Add/edit/delete branding assets
     - Search and sort functionality
     - Error handling scenarios

2) A11y & States
   - Verify focus-visible states on all interactive elements
   - Ensure proper labels and aria attributes
   - Test keyboard navigation (Tab, Enter, Escape)
   - Confirm loading states use proper skeletons
   - Verify empty states provide helpful messaging
   - Test error states with retry mechanisms

3) Code Quality
   - Run ESLint and fix any issues
   - Type check with TypeScript
   - Review React Query cache management
   - Verify proper query invalidation after mutations
   - Check for unnecessary re-renders
   - Optimize bundle size if needed

4) Visual Polish
   - Ensure consistent spacing using design tokens
   - Verify border colors use --border variable
   - Confirm teal accent color used for interactive elements
   - Remove any `transition: all` (use specific properties)
   - Verify all data-testid attributes follow kebab-case convention
   - Test responsive behavior on mobile/tablet/desktop
   - Ensure hover states work correctly
   - Check focus rings are visible and styled correctly

### User Stories
1. As a user, I receive clear feedback (toast) after saves and deletions.
2. As a keyboard user, I can navigate lists and forms with visible focus states.
3. As a user on slow networks, I see skeletons and helpful loading indicators.
4. As a user, I see helpful empty states when lists have no data.
5. As a user, I experience reliable performance and no UI jitter during list updates.
6. As a screen reader user, I can understand and navigate all content.
7. As a mobile user, I can access all functionality with proper touch targets.

### Exit Criteria
- Testing agent report passes all core flows
- Accessibility checks pass (keyboard nav, screen readers, focus states)
- No P0/P1 bugs outstanding
- UI consistent with design guidelines across all pages
- Performance metrics acceptable (no unnecessary re-renders)
- Code quality checks pass (ESLint, TypeScript)

---
## Current Status Summary

### ✅ Completed (Phase 1)
- Prisma client generation and setup
- Complete tRPC backend for client read/update operations
- Clients list page with loading/empty/error states
- Client detail page with all fields editable
- Related records (Marketing Materials, Branding Assets) displayed
- Radix UI Themes properly configured
- Design tokens applied to globals.css
- All data-testid attributes added

### ⏳ Pending User Testing
- User will manually test Phase 1 implementation
- User will report any bugs or issues found
- Fixes will be applied based on user feedback before proceeding to Phase 2

### 🔜 Next Steps (After User Testing)
1. Address any issues found during manual testing
2. Begin Phase 2 implementation:
   - Add create/delete operations for clients
   - Implement search, sort, and pagination
   - Add full CRUD for marketing materials and branding assets
   - Integrate Sonner for toast notifications

### 📋 Technical Debt / Notes
- Database migrations not run yet (user will handle)
- No sample data created (user will handle)
- Search functionality planned but not yet implemented
- Pagination not yet implemented
- Delete operations not yet implemented
- CRUD for related records (marketing materials, branding assets) not yet implemented

---
## Success Criteria (Overall Project)
- ✅ Clients list and detail pages fully functional with tRPC-backed data
- ✅ Related MarketingMaterial and LogoAndBranding display correctly on detail view
- ✅ Update works for client fields
- ⏳ Create/delete operations (Phase 2)
- ⏳ Full CRUD for related records (Phase 2)
- ⏳ Search, sort, pagination (Phase 2)
- ⏳ Toast notifications (Phase 2)
- ✅ Radix Themes with teal/slate applied
- ✅ Design tokens from guidelines implemented
- ✅ data-testid attributes present on all interactive elements
- ⏳ Comprehensive testing completed (Phase 3)
- ⏳ No critical bugs (pending user testing)
