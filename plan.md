# Client Dashboard - Development Plan

## Objectives
- Build a clients dashboard using Next.js (App Router), tRPC, Prisma, and Radix UI Themes.
- Deliver: Clients list page (name, website, createdAt), individual client detail pages, and full CRUD for Client plus related MarketingMaterial and LogoAndBranding.
- UI must use Radix Themes with teal accent and slate gray scale, follow provided design_guidelines.md, include proper loading/empty/error states, and data-testid attributes.

## Phases Overview
- Phase 1: V1 App Development (Core list + detail + update; relational read)
- Phase 2: Feature Expansion (Complete CRUD, related records management, search/sort/pagination)
- Phase 3: Testing & Polish (Automated E2E checks, accessibility, UX refinements)

---
## Phase 1: V1 App Development (Status: In Progress)
Scope
- Implement read flows end-to-end and safe update for Client. Include relational reads for MarketingMaterial and LogoAndBranding on detail page.
- Apply Radix Themes (accentColor="teal", grayColor="slate") and tokens from design_guidelines.md.

Implementation Steps
1) Prisma
   - Ensure prisma generate runs (output at app/generated/prisma) and DB connected via DATABASE_URL.
2) tRPC Backend
   - Create router: /app/trpc/routers/client.ts with procedures:
     - clients.list: returns id, name, website, createdAt (sortable by name/createdAt later).
     - clients.byId: returns full Client with marketingMaterials and logosAndBranding included.
     - clients.update: partial update for editable Client fields.
   - Register in _app router.
3) Frontend Pages
   - app/clients/page.tsx: Radix Table (Name, Website, Created). Link rows to /clients/[id]. Data states: loading skeleton, empty message, error retry.
   - app/clients/[id]/page.tsx: Show all Client fields with TextField/TextArea and Save action calling clients.update. Two tables below: Marketing Materials and Branding Assets (read-only in Phase 1).
   - Add data-testid to all interactive elements and key info blocks.
4) Theming & Tokens
   - Confirm Theme already mounted in layout with teal/slate.
   - Append token CSS from design_guidelines.md to globals if missing (colors, ring, etc.).

User Stories
1. As a user, I can view a table of all clients with name, website, and created date.
2. As a user, I can click a client row to open its detail page.
3. As a user, I see all client fields populated in inputs/text areas for review.
4. As a user, I can edit client info and save changes successfully.
5. As a user, I can view related MarketingMaterial and LogoAndBranding items in separate tables on the detail page.

Exit Criteria
- List page loads data from tRPC and renders correctly; detail page fetches by ID with relations; update mutation persists changes; UI adheres to Radix + tokens; all interactive elements have data-testid; initial lint/build succeed.

---
## Phase 2: Feature Expansion (Status: Not Started)
Scope
- Complete CRUD for Client and related records; add basic search, sort, and pagination.

Implementation Steps
1) tRPC Backend
   - clients.create, clients.delete (soft delete optional), clients.list enhancements: search by name/website, sort (name/createdAt), pagination (cursor/limit).
   - marketing.create, marketing.update, marketing.delete.
   - branding.create, branding.update, branding.delete.
2) Frontend
   - Clients page: "New Client" button → create form/dialog; delete row action with confirm dialog; client-side search field wired to list procedure; sortable headers; pagination controls.
   - Detail page: Add sections/forms to create/edit/delete MarketingMaterial and LogoAndBranding entries; optimistic update with invalidation.
   - Toast notifications (success/error) via Sonner; maintain data-testid coverage.

User Stories
1. As a user, I can create a new client from the clients list page and see it appear immediately.
2. As a user, I can delete a client with a confirmation step and see the table refresh.
3. As a user, I can search clients by name to narrow results quickly.
4. As a user, I can add/edit/remove a marketing material record from the client’s detail page.
5. As a user, I can add/edit/remove a branding asset from the client’s detail page.

Exit Criteria
- All CRUD operations work for Client, MarketingMaterial, and LogoAndBranding; list supports search/sort/pagination; optimistic UI and toasts implemented; no major UX or data bugs.

---
## Phase 3: Testing & Polish (Status: Not Started)
Scope
- Comprehensive testing, accessibility, UX refinements, and performance hygiene.

Implementation Steps
1) Automated Testing
   - Run testing agent for E2E: list render, open detail, update client, create/delete entities, error handling.
2) A11y & States
   - Verify focus-visible states, labels, aria attributes; ensure clear loading/empty/error states across pages.
3) Code Quality
   - ESLint/type checks; React Query cache correctness; query invalidation paths; avoid unnecessary re-renders.
4) Visual Polish
   - Consistent spacing, borders, and tokens; confirm teal/slate usage; ensure no transition: all; ensure data-testid coverage.

User Stories
1. As a user, I receive clear feedback (toast) after saves and deletions.
2. As a keyboard user, I can navigate lists and forms with visible focus states.
3. As a user on slow networks, I see skeletons and helpful loading indicators.
4. As a user, I see helpful empty states when lists have no data.
5. As a user, I experience reliable performance and no UI jitter during list updates.

Exit Criteria
- Testing agent report passes core flows; accessibility checks ok; no P0/P1 bugs outstanding; UI consistent with design guidelines.

---
## Next Actions (Immediate)
- Implement tRPC client router (list/byId/update), register in _app.
- Build app/clients/page.tsx and app/clients/[id]/page.tsx using Radix components and tokens.
- Verify prisma generate and sample data path; run basic manual E2E.
- Call testing agent for Phase 1 verification, then iterate.

## Success Criteria
- Clients list and detail pages fully functional with tRPC-backed data.
- Related MarketingMaterial and LogoAndBranding display correctly on detail view.
- Update works; create/delete added in Phase 2; toasts and states implemented.
- Radix Themes with teal/slate applied; data-testid present; tests pass without critical issues.
