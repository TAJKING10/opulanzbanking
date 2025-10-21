# Shared Resources

## Purpose
Common components, utilities, and types used across all features.

## Structure

### `/components`
Reusable UI components shared across features:
- **ui/** - shadcn/ui primitives (Button, Card, Input, etc.)
- **form/** - Form components (FileDropzone, ConsentCheckbox)
- `header.tsx` - Global navigation header
- `footer.tsx` - Global footer
- `section-heading.tsx` - Section headings with gold underline
- `compliance-banner.tsx` - Regulatory notices

### `/lib`
Shared utilities and helpers:
- `utils.ts` - Common utilities (cn, formatDate, formatIBAN)
- `validators/` - Zod schemas for form validation
- API client utilities
- Helper functions

### `/types`
TypeScript type definitions:
- Common interfaces
- API response types
- Form data types
- Enums and constants

## Usage Guidelines

### Importing Shared Components
```tsx
import { Button } from "@/shared/components/ui/button"
import { SectionHeading } from "@/shared/components/section-heading"
import { FileDropzone } from "@/shared/components/form/file-dropzone"
```

### Importing Utilities
```tsx
import { cn, formatDate } from "@/shared/lib/utils"
import { individualKYCSchema } from "@/shared/lib/validators/kyc"
```

### Importing Types
```tsx
import type { User, Account } from "@/shared/types"
```

## Best Practices
1. Keep components generic and reusable
2. Document component props with TypeScript
3. Add JSDoc comments for complex utilities
4. Maintain consistent naming conventions
5. Test shared components thoroughly
