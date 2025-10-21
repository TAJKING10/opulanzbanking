# Opulanz Banking - Quick Reference Guide

## 📁 Where to Find Things

### Need to work on...

#### 🏠 Homepage
- **Location:** `features/home/`
- **Components:** `hero.tsx`, `service-card.tsx`
- **Route:** `app/[locale]/page.tsx`

#### 👤 Account Opening (Individual/Company)
- **Location:** `features/account-opening/`
- **Sub-features:** `individual/`, `company/`, `warm-referral/`
- **Routes:** `app/[locale]/open-account/`

#### 🏢 Company Formation
- **Location:** `features/company-formation/`
- **Route:** `app/[locale]/company-formation/`

#### 📊 Dashboard
- **Location:** `features/dashboard/`
- **Components:** `timeline.tsx`, `status-chip.tsx`
- **Route:** `app/[locale]/dashboard/`

#### 💼 Accounting (Lot 2) - Planned
- **Location:** `features/accounting/`
- **Status:** 🚧 To be implemented

#### 📝 Tax Advisory (Lot 3) - Planned
- **Location:** `features/tax-advisory/`
- **Status:** 🚧 To be implemented

#### 🛡️ Life Insurance (Lot 4) - Planned
- **Location:** `features/life-insurance/`
- **Status:** 🚧 To be implemented

#### 📈 Investment Advisory (Lot 5) - Planned
- **Location:** `features/investment-advisory/`
- **Status:** 🚧 To be implemented

#### 🏡 Mortgage (Lot 6) - Planned
- **Location:** `features/mortgage/`
- **Status:** 🚧 To be implemented

---

## 🎨 Shared Components

### UI Primitives
**Location:** `shared/components/ui/`

| Component | File | Usage |
|-----------|------|-------|
| Button | `button.tsx` | `<Button variant="default">Click</Button>` |
| Card | `card.tsx` | `<Card><CardHeader>...</CardHeader></Card>` |
| Input | `input.tsx` | `<Input type="text" placeholder="..." />` |
| Label | `label.tsx` | `<Label htmlFor="id">Label</Label>` |
| Checkbox | `checkbox.tsx` | `<Checkbox checked={value} />` |

### Custom Components
**Location:** `shared/components/`

| Component | File | Purpose |
|-----------|------|---------|
| Header | `header.tsx` | Global navigation |
| Footer | `footer.tsx` | Global footer |
| Section Heading | `section-heading.tsx` | Headings with gold underline |
| Compliance Banner | `compliance-banner.tsx` | Regulatory notices |

### Form Components
**Location:** `shared/components/form/`

| Component | File | Purpose |
|-----------|------|---------|
| File Dropzone | `file-dropzone.tsx` | Document upload |
| Consent Checkbox | `consent-checkbox.tsx` | Consent with T&C links |

---

## 🛠️ Utilities & Helpers

**Location:** `shared/lib/`

| Function | File | Purpose |
|----------|------|---------|
| `cn()` | `utils.ts` | Merge CSS classes |
| `formatDate()` | `utils.ts` | Format dates |
| `formatIBAN()` | `utils.ts` | Format IBAN numbers |

### Validators
**Location:** `shared/lib/validators/`

Zod schemas for form validation

---

## 🌍 Translations

**Location:** `messages/`

| File | Language |
|------|----------|
| `en.json` | English |
| `fr.json` | French |

### Usage
```tsx
import { useTranslations } from "next-intl"

const t = useTranslations()
return <h1>{t("page.title")}</h1>
```

---

## 🎯 Common Tasks

### Adding a New Feature Button

1. **Create feature folder**
   ```bash
   mkdir features/my-feature
   ```

2. **Add README**
   ```bash
   touch features/my-feature/README.md
   ```

3. **Create components**
   ```bash
   mkdir features/my-feature/components
   ```

4. **Add route**
   ```bash
   mkdir app/[locale]/my-feature
   touch app/[locale]/my-feature/page.tsx
   ```

5. **Add to service cards**
   Edit homepage to add new service card pointing to your feature

6. **Add translations**
   Update `messages/en.json` and `messages/fr.json`

---

### Creating a New Component

#### Feature-Specific Component
```bash
# Create in feature folder
touch features/account-opening/components/KYCForm.tsx
```

#### Shared Component
```bash
# Create in shared folder
touch shared/components/MyComponent.tsx
```

---

### Adding a Form

1. **Create Zod schema**
   ```bash
   touch shared/lib/validators/myform.ts
   ```

2. **Create form component**
   ```tsx
   import { useForm } from "react-hook-form"
   import { zodResolver } from "@hookform/resolvers/zod"
   import { myFormSchema } from "@/shared/lib/validators/myform"
   ```

3. **Use form components**
   ```tsx
   import { Input } from "@/shared/components/ui/input"
   import { Button } from "@/shared/components/ui/button"
   ```

---

## 📋 Import Cheat Sheet

```tsx
// Shared UI Components
import { Button } from "@/shared/components/ui/button"
import { Card } from "@/shared/components/ui/card"

// Shared Custom Components
import { Header } from "@/shared/components/header"
import { SectionHeading } from "@/shared/components/section-heading"

// Shared Form Components
import { FileDropzone } from "@/shared/components/form/file-dropzone"

// Shared Utilities
import { cn, formatDate } from "@/shared/lib/utils"

// Feature Components
import { Hero } from "@/features/home/hero"
import { Timeline } from "@/features/dashboard/timeline"

// Translations
import { useTranslations } from "next-intl"
```

---

## 🎨 Design Tokens

### Colors
```tsx
// Tailwind classes
className="bg-primary text-primary-foreground"
className="bg-gold text-dark"
className="border-gold-dark"
```

| Color | CSS Variable | Tailwind |
|-------|--------------|----------|
| Primary Gold | `#b59354` | `gold` |
| Dark Gold | `#886844` | `gold-dark` |
| Light Gold | `#dac5a4` | `gold-light` |
| Dark | `#252623` | `dark` |
| Off-White | `#f6f8f8` | `off-white` |

### Typography
- **Font:** Poppins (400, 600, 700)
- **Headings:** Bold (700)
- **Body:** Regular (400)
- **Emphasis:** Semi-bold (600)

---

## 🔗 Quick Links

| Document | Purpose |
|----------|---------|
| [README.md](./README.md) | Project overview |
| [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) | Detailed structure guide |
| [features/README.md](./features/README.md) | Feature organization |
| [shared/README.md](./shared/README.md) | Shared resources |
| [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) | Design system |
| [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) | Implementation details |

---

## 🚀 Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Lint code
npm run lint
```

---

## 📱 Feature Status

| Feature | Status | Lot | Phase |
|---------|--------|-----|-------|
| Home | ✅ Implemented | - | 1 |
| Account Opening | ✅ Implemented | 0.1, 0.2 | 1 |
| Company Formation | ✅ Implemented | 1 | 1 |
| Dashboard | ✅ Implemented | - | 1 |
| Accounting | 🚧 Planned | 2 | 2 |
| Tax Advisory | 🚧 Planned | 3 | 2 |
| Life Insurance | 🚧 Planned | 4 | 2 |
| Investment Advisory | 🚧 Planned | 5 | 2 |
| Mortgage | 🚧 Planned | 6 | 2 |

---

**Need Help?** Check the README file in each feature folder for detailed documentation.
