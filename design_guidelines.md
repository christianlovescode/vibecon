{
  "meta": {
    "app_name": "Client Dashboard",
    "stack": ["Next.js App Router (JS)", "tRPC", "Prisma", "PostgreSQL", "Radix UI Themes", "Tailwind"],
    "brand_attributes": ["professional", "trustworthy", "clear", "efficient"],
    "audience": "Internal business users and account managers handling client records",
    "key_tasks": [
      "Browse, search, and sort clients",
      "Open a client to view all fields",
      "Edit client info inline or in forms",
      "Manage Marketing Materials and Branding Assets tables"
    ]
  },
  "design_tokens": {
    "colors": {
      "rationale": "Use Radix Colors with an enterprise-neutral base and a teal/blue accent for clarity and trust.",
      "radix_scales": {
        "gray": "slate",
        "accent_primary": "teal",
        "accent_secondary": "blue",
        "semantic": ["red", "amber", "green"]
      },
      "css_vars": ":root{ --bg: var(--color-background, white); --fg: var(--color-foreground, #161616); --accent: var(--teal-9, #12a594); --accent-contrast: var(--teal-12, #0b4f4a); --muted-bg: var(--slate-2, #f8f9fb); --border: var(--slate-6, #d0d7e1); --card: var(--slate-1, #ffffff); --success: var(--green-9, #30a46c); --warning: var(--amber-9, #ffb224); --danger: var(--red-9, #e5484d); --ring: var(--teal-8, #0eb39e); } .dark:root{ --bg: #0b0e11; --fg: #e6e7eb; --muted-bg: var(--slate-3, #111418); --border: var(--slate-6, #2a2f36); --card: var(--slate-2, #0f1216); }",
      "usage": {
        "content_background": "--card",
        "page_background": "--bg",
        "text_primary": "--fg",
        "text_muted": "var(--slate-11)",
        "interactive_primary": "--accent",
        "borders": "--border",
        "focus_ring": "--ring"
      },
      "gradient_policy": {
        "allowed": "Decorative section backgrounds or top page header bar only (<=20% viewport).",
        "sample": "background: linear-gradient(135deg, rgba(14,179,158,0.08) 0%, rgba(99,179,237,0.08) 100%);",
        "fallback": "Use solid muted background --muted-bg if gradient risks readability."
      }
    },
    "typography": {
      "fonts": {
        "heading": "Chivo, ui-sans-serif, system-ui",
        "body": "Karla, ui-sans-serif, system-ui",
        "mono": "Roboto Mono, ui-monospace, SFMono-Regular"
      },
      "weights": {"regular": 400, "medium": 500, "semibold": 600},
      "scale": {
        "h1": "text-4xl sm:text-5xl lg:text-6xl",
        "h2": "text-base sm:text-lg",
        "body": "text-sm sm:text-base",
        "small": "text-xs sm:text-sm"
      },
      "tracking_leading": {
        "headings_tracking": "-tracking-[0.01em]",
        "body_leading": "leading-6 sm:leading-7"
      }
    },
    "spacing": {
      "scale": [4, 6, 8, 12, 16, 20, 24, 32],
      "content_padding": "px-4 sm:px-6 lg:px-8",
      "section_gap": "gap-6 sm:gap-8 lg:gap-10"
    },
    "radius": {"sm": "4px", "md": "8px", "lg": "12px"},
    "shadows": {
      "card": "0 1px 2px rgba(16,24,40,0.04), 0 1px 3px rgba(16,24,40,0.08)",
      "elevated": "0 8px 24px rgba(16,24,40,0.12)"
    },
    "motion": {
      "durations": {"fast": "120ms", "base": "200ms", "slow": "320ms"},
      "easings": {"standard": "cubic-bezier(0.2, 0, 0, 1)", "emphasized": "cubic-bezier(0.3, 0.7, 0.4, 1)"}
    }
  },
  "theme_setup": {
    "radix_theme_provider": {
      "file": "app/layout.js",
      "snippet": "import { Theme } from '@radix-ui/themes';\nimport '@radix-ui/themes/styles.css';\n\nexport default function RootLayout({ children }) {\n  return (\n    <html lang=\"en\">\n      <body>\n        <Theme appearance=\"light\" accentColor=\"teal\" grayColor=\"slate\" radius=\"medium\" scaling=\"100%\">\n          {children}\n        </Theme>\n      </body>\n    </html>\n  );\n}",
      "notes": [
        "Use accentColor=teal; switch to blue only for specific contexts where links/metrics benefit from blue.",
        "Do not globally center the app container; keep left-aligned content flow."
      ]
    },
    "globals_css": {
      "file": "app/globals.css",
      "append": "/* Enterprise dashboard tokens */\n:root{ --btn-radius: 8px; --btn-shadow: 0 1px 2px rgba(16,24,40,.06); --focus-ring: 2px solid var(--ring); }\n/* Subtle noise overlay utility */\n.noise-contrast::before{ content:''; position:absolute; inset:0; pointer-events:none; opacity:.04; background-image:url('data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'100\\' height=\\'100\\'><filter id=\\'n\\'><feTurbulence type=\\'fractalNoise\\' baseFrequency=\\'.8\\' numOctaves=\\'2\\' stitchTiles=\\'stitch\\'/></filter><rect width=\\'100\\' height=\\'100\\' filter=\\'url(%23n)\\' opacity=\\'1\\'/></svg>'); background-size: 100px 100px;}"
    }
  },
  "layout": {
    "shell": {
      "pattern": "Header top bar with product name and global search on desktop; below, content area with max-w-7xl and generous whitespace.",
      "container": "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",
      "sections": ["Top bar (title + global search)", "Content area (table or details form)", "Toaster region"]
    },
    "grid_system": {
      "base": "12-col fluid grid on >=768px, single column on mobile",
      "detail_page": "Left: primary form (8/12), Right: side meta (4/12) on >=1024px; stack on mobile"
    }
  },
  "pages": {
    "clients_list": {
      "route": "/clients",
      "hero": "Title + description row; optional mild gradient header bar occupying less than 20% viewport.",
      "components": ["Search input", "Table with Name, Website, Created", "Row affordance (chevron)", "Pagination"],
      "interactions": [
        "Row hover elevates background and reveals chevron",
        "Sortable columns (Name, Created)",
        "Keyboard nav: Up/Down focuses rows, Enter opens details"
      ],
      "table_columns": [
        {"key": "name", "label": "Name"},
        {"key": "website", "label": "Website"},
        {"key": "createdAt", "label": "Created"}
      ],
      "example_js": "// app/clients/page.js\n'use client';\nimport { Table, Box, Flex, TextField, Button } from '@radix-ui/themes';\nimport Link from 'next/link';\n\nexport default function ClientsPage() {\n  return (\n    <Box className=\"mx-auto max-w-7xl px-4 sm:px-6 lg:px-8\">\n      <Flex align=\"center\" justify=\"between\" className=\"py-6\">\n        <h1 className=\"text-2xl sm:text-3xl font-semibold\">Clients</h1>\n        <div className=\"w-full max-w-md\">\n          <TextField.Root data-testid=\"clients-search-input\" placeholder=\"Search clients\" />\n        </div>\n      </Flex>\n      <Box className=\"rounded-lg border\" style={{borderColor:'var(--border)'}} data-testid=\"clients-table\">\n        <Table.Root variant=\"surface\">\n          <Table.Header>\n            <Table.Row>\n              <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>\n              <Table.ColumnHeaderCell>Website</Table.ColumnHeaderCell>\n              <Table.ColumnHeaderCell>Created</Table.ColumnHeaderCell>\n              <Table.ColumnHeaderCell></Table.ColumnHeaderCell>\n            </Table.Row>\n          </Table.Header>\n          <Table.Body>\n            {[{id:'1',name:'Acme Co',website:'acme.com',createdAt:'2025-01-04'}].map((c)=> (\n              <Table.Row key={c.id} className=\"group hover:bg-[var(--muted-bg)] transition-colors\">\n                <Table.RowHeaderCell>\n                  <Link data-testid=\"client-row-link\" href={\`/clients/${c.id}\`} className=\"text-[var(--accent)]\">{c.name}</Link>\n                </Table.RowHeaderCell>\n                <Table.Cell><a href={\`https://${c.website}\`} target=\"_blank\" rel=\"noreferrer\">{c.website}</a></Table.Cell>\n                <Table.Cell>{c.createdAt}</Table.Cell>\n                <Table.Cell className=\"text-right opacity-0 group-hover:opacity-100 transition-opacity\">→</Table.Cell>\n              </Table.Row>\n            ))}\n          </Table.Body>\n        </Table.Root>\n      </Box>\n    </Box>\n  );\n}",
      "tailwind_notes": [
        "Use transition on color/opacity only; never transition all.",
        "Ensure table container supports horizontal scroll on small screens"
      ]
    },
    "client_detail": {
      "route": "/clients/[id]",
      "sections": [
        "Header: Client name, quick actions (Edit, Save)",
        "About: Name, Website, Industry, Summary",
        "Profile: Target customer, Value proposition, Location, Headcount, Social URLs",
        "Tables: Marketing Materials, Branding Assets"
      ],
      "form_pattern": "Inline edit with clear Save/Cancel; use Dialog for destructive actions.",
      "example_js": "// app/clients/[id]/page.js\n'use client';\nimport { Box, Flex, Grid, TextArea, TextField, Button, Table, Separator } from '@radix-ui/themes';\n\nexport default function ClientDetailPage() {\n  return (\n    <Box className=\"mx-auto max-w-7xl px-4 sm:px-6 lg:px-8\">\n      <Flex align=\"center\" justify=\"between\" className=\"py-6\">\n        <h1 className=\"text-2xl sm:text-3xl font-semibold\" data-testid=\"client-name-heading\">Acme Co</h1>\n        <Flex gap=\"3\">\n          <Button data-testid=\"client-edit-button\" variant=\"surface\">Edit</Button>\n          <Button data-testid=\"client-save-button\" color=\"teal\">Save</Button>\n        </Flex>\n      </Flex>\n      <Grid columns=\"1\" gap=\"4\" className=\"lg:grid lg:grid-cols-12 lg:gap-6\">\n        <Box className=\"lg:col-span-8 space-y-6\">\n          <section className=\"rounded-lg border p-4\" style={{borderColor:'var(--border)'}} data-testid=\"about-section\">\n            <h2 className=\"text-base sm:text-lg font-medium\">About</h2>\n            <div className=\"mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4\">\n              <TextField.Root data-testid=\"field-name\" defaultValue=\"Acme Co\" />\n              <TextField.Root data-testid=\"field-website\" defaultValue=\"acme.com\" />\n              <TextField.Root data-testid=\"field-industry\" placeholder=\"Industry\" />\n              <TextArea data-testid=\"field-summary\" placeholder=\"Company summary\" />\n            </div>\n          </section>\n          <section className=\"rounded-lg border p-4\" style={{borderColor:'var(--border)'}} data-testid=\"profile-section\">\n            <h2 className=\"text-base sm:text-lg font-medium\">Profile</h2>\n            <div className=\"mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4\">\n              <TextField.Root data-testid=\"field-target\" placeholder=\"Target customer\" />\n              <TextField.Root data-testid=\"field-value\" placeholder=\"Value proposition\" />\n              <TextField.Root data-testid=\"field-location\" placeholder=\"Location\" />\n              <TextField.Root data-testid=\"field-headcount\" placeholder=\"Headcount\" />\n              <TextField.Root data-testid=\"field-twitter\" placeholder=\"Twitter URL\" />\n              <TextField.Root data-testid=\"field-linkedin\" placeholder=\"LinkedIn URL\" />\n            </div>\n          </section>\n          <section className=\"rounded-lg border p-4\" style={{borderColor:'var(--border)'}} data-testid=\"materials-table\">\n            <h2 className=\"text-base sm:text-lg font-medium\">Marketing Materials</h2>\n            <Table.Root variant=\"surface\" className=\"mt-3\">\n              <Table.Header>\n                <Table.Row>\n                  <Table.ColumnHeaderCell>Title</Table.ColumnHeaderCell>\n                  <Table.ColumnHeaderCell>Type</Table.ColumnHeaderCell>\n                  <Table.ColumnHeaderCell>Updated</Table.ColumnHeaderCell>\n                </Table.Row>\n              </Table.Header>\n              <Table.Body>\n                <Table.Row>\n                  <Table.RowHeaderCell>Brand Overview PDF</Table.RowHeaderCell>\n                  <Table.Cell>PDF</Table.Cell>\n                  <Table.Cell>2025-02-18</Table.Cell>\n                </Table.Row>\n              </Table.Body>\n            </Table.Root>\n          </section>\n          <section className=\"rounded-lg border p-4\" style={{borderColor:'var(--border)'}} data-testid=\"assets-table\">\n            <h2 className=\"text-base sm:text-lg font-medium\">Branding Assets</h2>\n            <Table.Root variant=\"surface\" className=\"mt-3\">\n              <Table.Header>\n                <Table.Row>\n                  <Table.ColumnHeaderCell>Asset</Table.ColumnHeaderCell>\n                  <Table.ColumnHeaderCell>Format</Table.ColumnHeaderCell>\n                  <Table.ColumnHeaderCell>Updated</Table.ColumnHeaderCell>\n                </Table.Row>\n              </Table.Header>\n              <Table.Body>\n                <Table.Row>\n                  <Table.RowHeaderCell>Logo Mark</Table.RowHeaderCell>\n                  <Table.Cell>SVG</Table.Cell>\n                  <Table.Cell>2025-02-20</Table.Cell>\n                </Table.Row>\n              </Table.Body>\n            </Table.Root>\n          </section>\n        </Box>\n        <Box className=\"lg:col-span-4 space-y-6\">\n          <section className=\"rounded-lg border p-4\" style={{borderColor:'var(--border)'}} data-testid=\"meta-section\">\n            <h2 className=\"text-base sm:text-lg font-medium\">Meta</h2>\n            <div className=\"mt-2 text-sm text-[var(--slate-11)]\">Created: 2025-01-04</div>\n            <Separator className=\"my-3\" />\n            <Button variant=\"soft\" color=\"red\" data-testid=\"danger-archive-button\">Archive client</Button>\n          </section>\n        </Box>\n      </Grid>\n    </Box>\n  );\n}",
      "micro_interactions": [
        "Save button shows success toast (sonner)",
        "Editing a field adds focus ring and slight elevation",
        "Tables: row hover color only; no scale transforms"
      ]
    }
  },
  "components": {
    "paths": {
      "radix_themes": ["@radix-ui/themes (Theme, Box, Flex, Grid, Table, TextField, TextArea, Button, Separator, ScrollArea)"],
      "shadcn_ui": [
        "./components/ui/dialog",
        "./components/ui/dropdown-menu",
        "./components/ui/input",
        "./components/ui/label",
        "./components/ui/select",
        "./components/ui/calendar",
        "./components/ui/sonner",
        "./components/ui/skeleton"
      ]
    },
    "behaviors": {
      "button": {
        "shape": "Medium radius 8px, flat tonal fill",
        "motion": "color/background transitions only (200ms standard)",
        "states": "hover: shade shift; focus: 2px ring using --ring; disabled: 40% opacity"
      },
      "inputs": {
        "focus": "outline: none; box-shadow: 0 0 0 2px var(--ring)",
        "error": "border-color: var(--danger)"
      },
      "tables": {
        "density": "56px row height desktop; 48px mobile",
        "hover": "muted background change; chevron affordance fades in"
      }
    }
  },
  "accessibility": {
    "contrast": "Ensure WCAG AA: text on --card uses --fg with >= 4.5:1 contrast.",
    "keyboard": ["All focusable controls have visible focus state", "Table rows focusable via role=button or link"],
    "aria": ["Form controls include aria-label or associated Label component", "Editable sections have aria-live polite for save confirmations"],
    "testing_ids": "All interactive or key informational elements MUST include data-testid using kebab-case, e.g., data-testid=\"client-save-button\"."
  },
  "motion": {
    "principles": [
      "Prefer opacity/colour transitions over transform for data-dense UIs",
      "Entrance animations: subtle fade-in and upward translate-y-1 (12px) on main sections",
      "No universal transition: avoid transition: all"
    ],
    "examples": {
      "css": ".entrance{ opacity:0; transform: translateY(12px); transition: opacity 200ms var(--ease, cubic-bezier(0.2,0,0,1)), transform 200ms var(--ease, cubic-bezier(0.2,0,0,1)); } .entrance[data-ready='true']{ opacity:1; transform: translateY(0);}"
    }
  },
  "libraries": {
    "install": [
      "npm i @radix-ui/themes @radix-ui/react-icons",
      "npm i sonner",
      "npm i framer-motion"
    ],
    "usage_notes": [
      "Use Radix Themes components for layout, tables, inputs, and buttons.",
      "Use shadcn/ui components where primitives are needed (Dialog, DropdownMenu, Calendar).",
      "Use Sonner for toasts; mount <Toaster /> once at root."
    ]
  },
  "example_utilities": {
    "toast_js": "// components/ui/sonner.js\n'use client';\nexport { Toaster, toast } from 'sonner';\n// Usage: import { Toaster, toast } from './components/ui/sonner';",
    "save_action_js": "import { toast } from './components/ui/sonner';\nasync function onSave(){ try{ /* mutation */ toast.success('Client saved'); } catch(e){ toast.error('Save failed'); } }"
  },
  "image_urls": [
    {
      "url": "https://images.unsplash.com/photo-1638664110765-3432ec7959c6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsJTIwYWJzdHJhY3QlMjBnZW9tZXRyaWMlMjBiYWNrZ3JvdW5kJTIwbGlnaHQlMjBuZXV0cmFsJTIwcHJvZmVzc2lvbmFsfGVufDB8fHx8MTc2MjYzMzcwMXww&ixlib=rb-4.1.0&q=85",
      "category": "header-accent",
      "description": "Minimal geometric accent for page header banner"
    },
    {
      "url": "https://images.unsplash.com/photo-1604796248266-ea1ddb3faaf6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwyfHxtaW5pbWFsJTIwYWJzdHJhY3QlMjBnZW9tZXRyaWMlMjBiYWNrZ3JvdW5kJTIwbGlnaHQlMjBuZXV0cmFsJTIwcHJvZmVzc2lvbmFsfGVufDB8fHx8MTc2MjYzMzcwMXww&ixlib=rb-4.1.0&q=85",
      "category": "empty-state",
      "description": "Neutral abstract image for empty tables"
    },
    {
      "url": "https://images.pexels.com/photos/7976210/pexels-photo-7976210.jpeg",
      "category": "login-or-landing",
      "description": "Soft white objects on neutral background for intro/placeholder"
    }
  ],
  "component_path": {
    "primary": "Use Radix Themes components via @radix-ui/themes",
    "shadcn": {
      "base_path": "./components/ui",
      "components": {
        "Dialog": "./components/ui/dialog",
        "DropdownMenu": "./components/ui/dropdown-menu",
        "Input": "./components/ui/input",
        "Label": "./components/ui/label",
        "Select": "./components/ui/select",
        "Calendar": "./components/ui/calendar",
        "Toaster": "./components/ui/sonner",
        "Skeleton": "./components/ui/skeleton"
      }
    }
  },
  "instructions_to_main_agent": [
    "Create routes: app/clients/page.js and app/clients/[id]/page.js using the provided scaffolds.",
    "Wrap the app with <Theme> in app/layout.js; set accentColor='teal' and grayColor='slate'.",
    "Extend app/globals.css with provided tokens and the .noise-contrast utility.",
    "Ensure every interactive element has a data-testid in kebab-case describing its role.",
    "Tables: keep density comfortable, enable horizontal scroll on small screens.",
    "Editing flows: inline inputs with Save/Cancel; surface success/failure using Sonner toasts.",
    "Respect gradient restrictions; prefer solid muted backgrounds for content cards.",
    "Follow export conventions: named exports for components; default exports for pages (as shown).",
    "Do not center align the app container; keep content left-aligned for readability.",
    "Avoid transition: all. Only transition color, opacity, and box-shadow where relevant."
  ]
}


<General UI UX Design Guidelines>  
    - You must **not** apply universal transition. Eg: `transition: all`. This results in breaking transforms. Always add transitions for specific interactive elements like button, input excluding transforms
    - You must **not** center align the app container, ie do not add `.App { text-align: center; }` in the css file. This disrupts the human natural reading flow of text
   - NEVER: use AI assistant Emoji characters like`🤖🧠💭💡🔮🎯📚🎭🎬🎪🎉🎊🎁🎀🎂🍰🎈🎨🎰💰💵💳🏦💎🪙💸🤑📊📈📉💹🔢🏆🥇 etc for icons. Always use **FontAwesome cdn** or **lucid-react** library already installed in the package.json

 **GRADIENT RESTRICTION RULE**
NEVER use dark/saturated gradient combos (e.g., purple/pink) on any UI element.  Prohibited gradients: blue-500 to purple 600, purple 500 to pink-500, green-500 to blue-500, red to pink etc
NEVER use dark gradients for logo, testimonial, footer etc
NEVER let gradients cover more than 20% of the viewport.
NEVER apply gradients to text-heavy content or reading areas.
NEVER use gradients on small UI elements (<100px width).
NEVER stack multiple gradient layers in the same viewport.

**ENFORCEMENT RULE:**
    • Id gradient area exceeds 20% of viewport OR affects readability, **THEN** use solid colors

**How and where to use:**
   • Section backgrounds (not content backgrounds)
   • Hero section header content. Eg: dark to light to dark color
   • Decorative overlays and accent elements only
   • Hero section with 2-3 mild color
   • Gradients creation can be done for any angle say horizontal, vertical or diagonal

- For AI chat, voice application, **do not use purple color. Use color like light green, ocean blue, peach orange etc**

</Font Guidelines>

- Every interaction needs micro-animations - hover states, transitions, parallax effects, and entrance animations. Static = dead. 
   
- Use 2-3x more spacing than feels comfortable. Cramped designs look cheap.

- Subtle grain textures, noise overlays, custom cursors, selection states, and loading animations: separates good from extraordinary.
   
- Before generating UI, infer the visual style from the problem statement (palette, contrast, mood, motion) and immediately instantiate it by setting global design tokens (primary, secondary/accent, background, foreground, ring, state colors), rather than relying on any library defaults. Don't make the background dark as a default step, always understand problem first and define colors accordingly
    Eg: - if it implies playful/energetic, choose a colorful scheme
           - if it implies monochrome/minimal, choose a black–white/neutral scheme

**Component Reuse:**
	- Prioritize using pre-existing components from src/components/ui when applicable
	- Create new components that match the style and conventions of existing components when needed
	- Examine existing components to understand the project's component patterns before creating new ones

**IMPORTANT**: Do not use HTML based component like dropdown, calendar, toast etc. You **MUST** always use `/app/frontend/src/components/ui/ ` only as a primary components as these are modern and stylish component

**Best Practices:**
	- Use Shadcn/UI as the primary component library for consistency and accessibility
	- Import path: ./components/[component-name]

**Export Conventions:**
	- Components MUST use named exports (export const ComponentName = ...)
	- Pages MUST use default exports (export default function PageName() {...})

**Toasts:**
  - Use `sonner` for toasts" 
  - Sonner component are located in `/app/src/components/ui/sonner.tsx`

Use 2–4 color gradients, subtle textures/noise overlays, or CSS-based noise to avoid flat visuals.
</General UI UX Design Guidelines>
