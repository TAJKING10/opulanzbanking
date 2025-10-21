# Opulanz Banking - Project Structure Guide

## Overview
This document describes the organized folder structure for the Opulanz Digital Banking Platform. The project is organized by **features** (business domains) rather than by technical layers, making it easier to understand, maintain, and scale.

## Directory Tree

```
opulanzbanking/
│
├── app/                          # Next.js App Router (minimal routing logic)
│   └── [locale]/                 # Internationalized routes (en/fr)
│       ├── layout.tsx            # Root layout with header/footer
│       ├── page.tsx              # Homepage (imports from features/home)
│       ├── open-account/         # Account opening routes
│       │   ├── page.tsx
│       │   ├── individual/
│       │   ├── company/
│       │   └── warm-referral/
│       ├── company-formation/    # Company formation routes
│       ├── dashboard/            # Dashboard routes
│       ├── accounting/           # Accounting routes (Phase 2)
│       ├── tax-advisory/         # Tax advisory routes (Phase 2)
│       ├── life-insurance/       # Insurance routes (Phase 2)
│       ├── investment-advisory/  # Investment routes (Phase 2)
│       └── mortgage/             # Mortgage routes (Phase 2)
│
├── features/                     # Feature modules (business domains)
│   ├── README.md                 # Feature organization guide
│   │
│   ├── home/                     # ✅ Homepage feature
│   │   ├── README.md
│   │   ├── hero.tsx
│   │   └── service-card.tsx
│   │
│   ├── account-opening/          # ✅ Account opening (Lot 0.1 & 0.2)
│   │   ├── README.md
│   │   ├── individual/           # Individual KYC
│   │   ├── company/              # Company KYB
│   │   └── warm-referral/        # Warm referral flow
│   │
│   ├── company-formation/        # ✅ Company formation (Lot 1)
│   │   └── README.md
│   │
│   ├── dashboard/                # ✅ User dashboard
│   │   ├── README.md
│   │   ├── timeline.tsx
│   │   └── status-chip.tsx
│   │
│   ├── accounting/               # 🚧 Accounting & Invoicing (Lot 2)
│   │   └── README.md
│   │
│   ├── tax-advisory/             # 🚧 Tax Advisory (Lot 3)
│   │   └── README.md
│   │
│   ├── life-insurance/           # 🚧 Life Insurance (Lot 4)
│   │   └── README.md
│   │
│   ├── investment-advisory/      # 🚧 Investment Advisory (Lot 5)
│   │   └── README.md
│   │
│   └── mortgage/                 # 🚧 Mortgage (Lot 6)
│       └── README.md
│
├── shared/                       # Shared resources across all features
│   ├── README.md
│   │
│   ├── components/               # Reusable UI components
│   │   ├── ui/                   # shadcn/ui primitives
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   └── checkbox.tsx
│   │   ├── form/                 # Form components
│   │   │   ├── file-dropzone.tsx
│   │   │   └── consent-checkbox.tsx
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   ├── section-heading.tsx
│   │   └── compliance-banner.tsx
│   │
│   ├── lib/                      # Shared utilities
│   │   ├── utils.ts
│   │   └── validators/           # Zod schemas
│   │
│   └── types/                    # Shared TypeScript types
│       └── (to be organized)
│
├── messages/                     # Internationalization
│   ├── en.json                   # English translations
│   └── fr.json                   # French translations
│
├── public/                       # Static assets
│   ├── images/
│   └── fonts/
│
├── docs/                         # Documentation
│   ├── DESIGN_SYSTEM.md
│   ├── INFORMATION_ARCHITECTURE.md
│   ├── IMPLEMENTATION_GUIDE.md
│   └── COPY_DECK.md
│
├── .next/                        # Next.js build output (gitignored)
├── node_modules/                 # Dependencies (gitignored)
│
├── i18n.ts                       # i18n configuration
├── middleware.ts                 # Locale routing middleware
├── next.config.js                # Next.js configuration
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Dependencies and scripts
│
├── PROJECT_STRUCTURE.md          # This file
└── README.md                     # Project overview
```

## Key Concepts

### 🎯 Feature-Based Organization
Each business feature (e.g., "account-opening", "mortgage") has its own folder containing:
- Components specific to that feature
- Feature-specific utilities
- Documentation (README)
- Types and constants

**Benefits:**
- Easy to find all code related to a feature
- Clear ownership and boundaries
- Easier to onboard new developers
- Better code organization as the project scales

### 🔄 Shared Resources
Common components, utilities, and types used across multiple features are in `/shared`:
- **UI components** - Buttons, cards, forms (shadcn/ui)
- **Layout components** - Header, footer, section headings
- **Utilities** - Date formatting, validation, API clients
- **Types** - Shared TypeScript interfaces

### 🗺️ App Router (Routing Only)
The `/app` directory contains **only routing logic**. Page components should be thin wrappers that import from `/features`:

```tsx
// app/[locale]/dashboard/page.tsx
import { DashboardView } from "@/features/dashboard/DashboardView"

export default function DashboardPage() {
  return <DashboardView />
}
```

## Feature Status Legend

- ✅ **Implemented** - Feature is built and functional (Phase 1)
- 🚧 **Planned** - Feature folder created, awaiting implementation (Phase 2+)

## Import Path Aliases

TypeScript path aliases are configured in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "@/features/*": ["./features/*"],
      "@/shared/*": ["./shared/*"],
      "@/app/*": ["./app/*"]
    }
  }
}
```

### Example Imports

```tsx
// From a feature to shared components
import { Button } from "@/shared/components/ui/button"
import { SectionHeading } from "@/shared/components/section-heading"

// From a feature to shared utilities
import { formatDate, formatIBAN } from "@/shared/lib/utils"

// From one feature to another (use sparingly)
import { Timeline } from "@/features/dashboard/timeline"

// From app router to feature
import { HeroSection } from "@/features/home/hero"
```

## Adding New Features

### Step-by-Step Process

1. **Create feature folder**
   ```bash
   mkdir features/new-feature
   ```

2. **Add README.md**
   Document the feature's purpose, components, and routes

3. **Create component structure**
   ```bash
   mkdir features/new-feature/components
   touch features/new-feature/types.ts
   ```

4. **Add route in app**
   ```bash
   mkdir app/[locale]/new-feature
   touch app/[locale]/new-feature/page.tsx
   ```

5. **Add translations**
   Update `messages/en.json` and `messages/fr.json`

6. **Build components**
   Use shared UI components from `/shared/components/ui`

7. **Update feature README**
   Keep `features/README.md` up to date

## Best Practices

### ✅ Do's
- Keep features isolated and self-contained
- Use shared components for common UI elements
- Document each feature with a README
- Use TypeScript for type safety
- Follow naming conventions (kebab-case for folders)
- Import from `@/shared` for common utilities
- Add translations for all user-facing text

### ❌ Don'ts
- Don't create tight coupling between features
- Don't duplicate shared components
- Don't put business logic in `/app` routes
- Don't skip documentation
- Don't use relative imports across features (use aliases)
- Don't hardcode strings (use i18n)

## File Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `HeroSection.tsx` |
| Utilities | camelCase | `formatDate.ts` |
| Types | PascalCase | `UserTypes.ts` |
| Constants | UPPER_SNAKE_CASE | `API_ENDPOINTS.ts` |
| Folders | kebab-case | `account-opening/` |

## Development Workflow

### Working on a Feature

1. Navigate to feature folder: `cd features/account-opening`
2. Create/modify components in `components/`
3. Update types in `types.ts`
4. Test component in isolation
5. Import into app route: `app/[locale]/account-opening/page.tsx`
6. Add translations if needed
7. Update feature README

### Adding Shared Component

1. Create component in `shared/components/`
2. Export from appropriate index file
3. Document usage in `shared/README.md`
4. Use across multiple features

## Migration Notes

### Old Structure → New Structure

```
OLD:                          NEW:
components/hero.tsx     →    features/home/hero.tsx
components/timeline.tsx →    features/dashboard/timeline.tsx
components/ui/          →    shared/components/ui/
lib/utils.ts           →    shared/lib/utils.ts
```

The original `components/` and `lib/` folders are preserved but will eventually be deprecated in favor of the organized structure.

## Related Documentation

- [README.md](./README.md) - Project overview
- [features/README.md](./features/README.md) - Feature organization guide
- [shared/README.md](./shared/README.md) - Shared resources guide
- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) - Design system specification
- [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) - Implementation details

## Questions?

For questions about the project structure:
1. Check feature-specific README files
2. Review this document
3. Contact the development team

---

**Last Updated:** October 2025
**Maintained By:** Opulanz Development Team
