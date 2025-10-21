# Migration Guide: New Folder Structure

## Overview
This guide explains the new organized folder structure and how to work with it going forward.

## What Changed?

### Before (Old Structure)
```
opulanzbanking/
├── app/
├── components/        # All components mixed together
│   ├── hero.tsx
│   ├── service-card.tsx
│   ├── timeline.tsx
│   ├── status-chip.tsx
│   ├── form/
│   └── ui/
├── lib/              # All utilities mixed together
│   ├── utils.ts
│   └── validators/
└── ...
```

**Problems:**
- Hard to find components for specific features
- No clear organization by business domain
- Difficult to understand what belongs where
- Scaling issues as project grows

### After (New Structure)
```
opulanzbanking/
├── app/              # Routing only
├── features/         # Feature-based organization
│   ├── home/
│   ├── account-opening/
│   ├── company-formation/
│   ├── dashboard/
│   ├── accounting/
│   ├── tax-advisory/
│   ├── life-insurance/
│   ├── investment-advisory/
│   └── mortgage/
├── shared/           # Shared across features
│   ├── components/
│   └── lib/
└── ...
```

**Benefits:**
- ✅ Easy to find everything related to a feature
- ✅ Clear separation of concerns
- ✅ Better scalability
- ✅ Easier onboarding for new developers
- ✅ Feature folders can be worked on independently

## Component Migration Map

### Original Location → New Location

#### Feature Components
```
components/hero.tsx              → features/home/hero.tsx
components/service-card.tsx      → features/home/service-card.tsx
components/timeline.tsx          → features/dashboard/timeline.tsx
components/status-chip.tsx       → features/dashboard/status-chip.tsx
```

#### Shared Components
```
components/ui/                   → shared/components/ui/
components/form/                 → shared/components/form/
components/header.tsx            → shared/components/header.tsx
components/footer.tsx            → shared/components/footer.tsx
components/section-heading.tsx   → shared/components/section-heading.tsx
components/compliance-banner.tsx → shared/components/compliance-banner.tsx
```

#### Utilities
```
lib/utils.ts                     → shared/lib/utils.ts
lib/validators/                  → shared/lib/validators/
```

## Working with the New Structure

### 1. Finding Components

**Old way:**
"Where is the timeline component?" → Look through all components folder

**New way:**
"Where is the timeline component?" → Check [features/dashboard/](./features/dashboard/)

### 2. Adding New Features

**Example: Adding Accounting Feature**

1. Navigate to feature folder:
   ```bash
   cd features/accounting
   ```

2. Check README for structure:
   ```bash
   cat README.md
   ```

3. Create components:
   ```bash
   mkdir components
   touch components/InvoiceList.tsx
   ```

4. Add route:
   ```bash
   # Already exists: app/[locale]/accounting/
   ```

### 3. Import Paths

**Always use path aliases:**

```tsx
// ✅ Correct
import { Button } from "@/shared/components/ui/button"
import { Timeline } from "@/features/dashboard/timeline"

// ❌ Avoid
import { Button } from "../../shared/components/ui/button"
import { Timeline } from "../dashboard/timeline"
```

### 4. Creating Shared Components

If a component is used in **2+ features**, move it to `shared/`:

```bash
# Move to shared
mv features/feature1/components/MyComponent.tsx shared/components/MyComponent.tsx

# Update imports in both features
# feature1: import { MyComponent } from "@/shared/components/MyComponent"
# feature2: import { MyComponent } from "@/shared/components/MyComponent"
```

## Feature Checklist

Each feature folder should have:

- [ ] **README.md** - Documentation
- [ ] **components/** - Feature components (if any)
- [ ] **types.ts** - TypeScript types (if needed)
- [ ] Route in **app/[locale]/[feature-name]/**
- [ ] Translations in **messages/en.json** and **messages/fr.json**

## Current Status

### ✅ Implemented Features
These features have UI components ready:

1. **Home** ([features/home/](./features/home/))
   - Hero section
   - Service cards

2. **Account Opening** ([features/account-opening/](./features/account-opening/))
   - Individual KYC
   - Company KYB
   - Warm referral

3. **Company Formation** ([features/company-formation/](./features/company-formation/))
   - Entity creation wizard

4. **Dashboard** ([features/dashboard/](./features/dashboard/))
   - Timeline
   - Status chips

### 🚧 Placeholder Features
These features have folders and READMEs, awaiting implementation:

5. **Accounting** ([features/accounting/](./features/accounting/))
6. **Tax Advisory** ([features/tax-advisory/](./features/tax-advisory/))
7. **Life Insurance** ([features/life-insurance/](./features/life-insurance/))
8. **Investment Advisory** ([features/investment-advisory/](./features/investment-advisory/))
9. **Mortgage** ([features/mortgage/](./features/mortgage/))

## Backward Compatibility

The **original folders are preserved** for now:
- `components/` - Original components (still exists)
- `lib/` - Original utilities (still exists)

**Next Steps:**
1. Update import paths in existing pages to use new structure
2. Test that everything works
3. Gradually deprecate old folders

## Quick Reference

### Documentation
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Detailed structure guide
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Quick lookup guide
- [features/README.md](./features/README.md) - Feature organization
- [shared/README.md](./shared/README.md) - Shared resources

### Where to Put New Code

| Type | Location | Example |
|------|----------|---------|
| Feature component | `features/[feature]/components/` | `features/accounting/components/InvoiceForm.tsx` |
| Shared component | `shared/components/` | `shared/components/DataTable.tsx` |
| Feature utility | `features/[feature]/utils.ts` | `features/mortgage/utils.ts` |
| Shared utility | `shared/lib/` | `shared/lib/formatters.ts` |
| Feature type | `features/[feature]/types.ts` | `features/accounting/types.ts` |
| Shared type | `shared/types/` | `shared/types/user.ts` |

## FAQs

### Q: Should I update existing files to use new imports?
**A:** Yes, gradually update imports to use the new structure. The old folders will be deprecated over time.

### Q: Where do I put a component used in multiple features?
**A:** Move it to `shared/components/` and import from there.

### Q: How do I know if something belongs in a feature or shared?
**A:** If it's specific to one business domain → feature folder. If used across domains → shared folder.

### Q: Do I need to update routes?
**A:** No, routes in `app/[locale]/` remain the same. Just update what they import.

### Q: What about tests?
**A:** Create a `__tests__/` folder next to components in each feature.

## Summary

### Key Changes
1. ✅ Created `features/` directory with 9 feature folders
2. ✅ Created `shared/` directory for common code
3. ✅ Added README to each feature folder
4. ✅ Copied components to appropriate locations
5. ✅ Maintained backward compatibility

### Benefits
- 🎯 Clear organization by business domain
- 📁 Easy to find feature-specific code
- 🔧 Better scalability
- 📖 Self-documenting structure
- 👥 Easier team collaboration

### Next Steps for Developers
1. Read feature READMEs before starting work
2. Use new import paths for new code
3. Gradually update old imports
4. Keep feature folders self-contained
5. Document new components

---

**Questions?** Check the README in each feature folder or consult [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)
