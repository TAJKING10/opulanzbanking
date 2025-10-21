# Features Directory

## Overview
This directory contains all feature-specific code organized by business domain. Each feature folder is self-contained with its own components, utilities, and documentation.

## Feature Structure

```
features/
├── home/                    # Homepage (Implemented ✅)
├── account-opening/         # Account opening flows (Implemented ✅)
├── company-formation/       # Luxembourg entity creation (Implemented ✅)
├── dashboard/               # User dashboard (Implemented ✅)
├── accounting/              # Lot 2: Accounting & Invoicing (Planned 🚧)
├── tax-advisory/            # Lot 3: Tax Advisory (Planned 🚧)
├── life-insurance/          # Lot 4: Life Insurance (Planned 🚧)
├── investment-advisory/     # Lot 5: Investment Advisory (Planned 🚧)
└── mortgage/                # Lot 6: Mortgage (Planned 🚧)
```

## Implementation Status

### ✅ Implemented (Phase 1)
1. **[Home](./home/)** - Landing page with hero and service cards
2. **[Account Opening](./account-opening/)** - Individual/Company KYC/KYB, Warm Referral
3. **[Company Formation](./company-formation/)** - Luxembourg entity creation wizard
4. **[Dashboard](./dashboard/)** - User account dashboard with timeline

### 🚧 Planned (Phase 2+)
5. **[Accounting](./accounting/)** - Accounting & invoicing integration
6. **[Tax Advisory](./tax-advisory/)** - Tax professional booking system
7. **[Life Insurance](./life-insurance/)** - Utmost partnership products
8. **[Investment Advisory](./investment-advisory/)** - MiFID II compliant advisory
9. **[Mortgage](./mortgage/)** - Mortgage pre-qualification and application

## Feature Organization Principles

Each feature folder should contain:

### Required
- **README.md** - Feature documentation with purpose, components, and routes
- **components/** - Feature-specific React components
- **types.ts** - TypeScript types specific to this feature

### Optional (as needed)
- **hooks/** - Custom React hooks
- **utils/** - Feature-specific utility functions
- **constants.ts** - Feature-specific constants
- **api/** - API client functions for this feature
- **validators/** - Feature-specific Zod schemas

## Naming Conventions

### Files
- Components: PascalCase (e.g., `HeroSection.tsx`)
- Utilities: camelCase (e.g., `formatAccountNumber.ts`)
- Types: PascalCase (e.g., `AccountTypes.ts`)
- Constants: UPPER_SNAKE_CASE or camelCase (e.g., `ACCOUNT_TYPES.ts` or `accountDefaults.ts`)

### Folders
- Use kebab-case (e.g., `account-opening/`, `company-formation/`)
- Descriptive names matching business domain

## Import Patterns

### From Features
```tsx
// Importing from the same feature
import { KYCForm } from "./components/KYCForm"

// Importing from another feature
import { Timeline } from "@/features/dashboard/timeline"
```

### From Shared
```tsx
import { Button } from "@/shared/components/ui/button"
import { formatDate } from "@/shared/lib/utils"
import type { User } from "@/shared/types"
```

## Adding a New Feature

1. Create folder in `/features` with kebab-case name
2. Add README.md documenting purpose and planned components
3. Create subdirectories: `components/`, `types.ts`
4. Add feature to this master README
5. Create route in `/app/[locale]/[feature-name]`
6. Build components using shared UI library
7. Add translations to `/messages/en.json` and `/messages/fr.json`

## Best Practices

1. **Keep features isolated** - Minimize dependencies between features
2. **Use shared components** - Don't duplicate UI components
3. **Document everything** - Keep READMEs up to date
4. **Follow routing conventions** - Match feature name to route path
5. **Type everything** - Use TypeScript for all code
6. **Internationalize** - Use next-intl for all user-facing text
7. **Test independently** - Each feature should be testable in isolation

## Related Documentation

- [Project Structure](../README.md#project-structure)
- [Shared Components](../shared/README.md)
- [Design System](../DESIGN_SYSTEM.md)
- [Implementation Guide](../IMPLEMENTATION_GUIDE.md)
