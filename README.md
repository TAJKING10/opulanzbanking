# Opulanz Digital Banking Platform

**Professional Next.js UI/UX for Digital Banking & Financial Services**

Opulanz is a complete, production-ready digital banking platform UI built with Next.js 14, TypeScript, Tailwind CSS, and shadcn/ui. Designed for entrepreneurs and businesses in France and Luxembourg, it provides a modern, accessible, and compliance-focused banking experience.

---

## Features

### Core Banking Services
- **Lot 0.1**: Warm Referral Flow - Prequalification and partner matching
- **Lot 0.2**: Whitelabel Account Opening - Full KYC/KYB with document upload
- **Lot 1**: Company Formation - Luxembourg entity creation wizard (SARL, SA, SCSp)
- **Lot 2**: Accounting & Invoicing integration
- **Lot 3**: Tax Advisory booking system
- **Lot 4**: Life Insurance (Utmost partnership)
- **Lot 5**: Investment Advisory with MiFID II compliance
- **Lot 6**: Mortgage pre-qualification

### Technical Highlights
- **Next.js 14 App Router**: Server components, optimized routing
- **TypeScript**: Full type safety
- **Tailwind CSS**: Utility-first styling with custom brand theme
- **shadcn/ui**: Accessible component primitives
- **Internationalization**: next-intl with FR/EN support
- **Form Management**: React Hook Form + Zod validation
- **Animations**: Framer Motion for smooth interactions
- **Accessibility**: WCAG 2.2 AA compliant

---

## Brand Theme

### Colors
- **Primary Gold**: `#b59354` - CTAs, accents, underlines
- **Darker Gold**: `#886844` - Secondary accents
- **Light Gold**: `#dac5a4` - Subtle tints
- **Dark**: `#252623` - Text, backgrounds
- **Off-White**: `#f6f8f8` - Primary background

### Typography
- **Font**: Poppins (400, 600, 700)
- **Style**: Bold headings, clean body, uppercase brand name

### Design Features
- Hero gradient: Dark → Gold
- Gold underline (64px × 5px) on section headings
- Alternating section backgrounds (Off-White → Light Gray)
- Generous whitespace, 12-column responsive grid
- Card-based design with hover effects

---

## Project Structure

```
opulanzbanking/
├── app/
│   ├── [locale]/              # Locale-based routes (en/fr)
│   │   ├── layout.tsx         # Root layout with header/footer
│   │   ├── page.tsx           # Homepage
│   │   ├── open-account/      # Account opening flows
│   │   ├── company-formation/ # Company formation wizard
│   │   ├── dashboard/         # User dashboard
│   │   └── ...
│   └── globals.css            # Global styles + Tailwind
├── components/
│   ├── ui/                    # shadcn/ui primitives
│   ├── form/                  # Custom form components
│   ├── hero.tsx
│   ├── section-heading.tsx
│   ├── service-card.tsx
│   ├── status-chip.tsx
│   ├── timeline.tsx
│   └── ...
├── lib/
│   ├── utils.ts
│   └── validators/            # Zod schemas
├── messages/
│   ├── en.json                # English translations
│   └── fr.json                # French translations
├── tailwind.config.ts         # Custom Tailwind theme
├── i18n.ts                    # i18n configuration
├── middleware.ts              # Locale routing
└── package.json
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```
Open [http://localhost:3000/en](http://localhost:3000/en)

### Build for Production
```bash
npm run build
npm start
```

### Type Checking
```bash
npm run type-check
```

---

## Key Pages

### Home (`/[locale]/`)
- Hero with gradient background
- Services grid (6 cards)
- Trust/regulatory section
- CTA section

### Open Account (`/[locale]/open-account`)
- Account type selection (Individual / Company)
- Warm referral option
- Company formation callout

### Warm Referral (`/[locale]/open-account/warm-referral`)
- 3-step flow: Form → Handoff → Thank You
- Partner matching logic
- Consent capture

### Individual KYC (`/[locale]/open-account/individual`)
- Personal information form
- Document upload (ID, selfie, proof of address)
- PEP declaration
- States: Form → Submitted → Approved

### Company Formation (`/[locale]/company-formation`)
- Form selection (SARL, SA, etc.)
- 5-step wizard: Details → Shareholders → Capital → Payment → Confirmation
- Save & resume feature

### Dashboard (`/[locale]/dashboard`)
- Account balance card
- Quick actions
- Recent transactions
- Application timeline

---

## Component Library

### Core Components

#### Hero
```tsx
<Hero
  title="Professional Banking"
  subtitle="Trusted services"
  primaryCta={{ label: "Get Started", href: "/open-account" }}
  secondaryCta={{ label: "Learn More", href: "#about" }}
/>
```

#### SectionHeading (with gold underline)
```tsx
<SectionHeading
  overline="OVERLINE"
  title="Section Title"
  description="Description text"
  align="center"
/>
```

#### ServiceCard
```tsx
<ServiceCard
  title="Service Name"
  description="Brief description"
  image="https://..."
  href="/service"
/>
```

#### StatusChip
```tsx
<StatusChip status="approved" />
```

#### Timeline
```tsx
<Timeline items={[
  { id, title, description, status, date },
  ...
]} />
```

#### FileDropzone
```tsx
<FileDropzone
  maxSize={15}
  acceptedTypes={['.pdf', '.jpg']}
  onFilesChange={(files) => {...}}
/>
```

#### ConsentCheckbox
```tsx
<ConsentCheckbox
  id="consent"
  checked={value}
  onCheckedChange={setValue}
  label="I agree..."
  required
  links={[{ text: "T&Cs", href: "/legal/terms" }]}
/>
```

---

## Internationalization

### Supported Locales
- `en` (English)
- `fr` (Français)

### Usage
```tsx
import { useTranslations } from "next-intl";

const t = useTranslations();

<h1>{t("page.title")}</h1>
```

### Translation Files
- `messages/en.json`
- `messages/fr.json`

All UI strings, error messages, and CTAs are localized.

---

## Form Validation

Forms use **React Hook Form** + **Zod** for schema validation.

Example:
```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { exampleSchema } from "@/lib/validators/example";

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(exampleSchema),
});
```

Validators are located in `lib/validators/`.

---

## Accessibility

- **WCAG 2.2 AA** compliant
- Focus states with gold rings
- Semantic HTML
- ARIA labels and roles
- Keyboard navigation
- Screen reader friendly
- Color contrast tested

---

## Compliance

### Regulatory Notices
- **France**: ACPR, AMF
- **Luxembourg**: CSSF
- MiFID II, IDD compliance
- Dismissible banners with locale/market variants

### Consent Capture
- KYC/KYB consent
- Data sharing consent
- Partner handoff acknowledgment
- Terms & Privacy links

---

## Performance

### Targets
- Lighthouse scores: ≥95 (all categories)
- Core Web Vitals:
  - LCP: <2.5s
  - FID: <100ms
  - CLS: <0.1

### Optimizations
- Next.js Image optimization
- Route-level code splitting
- Font preloading (Poppins)
- Lazy loading images
- Prefetch critical routes

---

## Documentation

- **[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)**: Complete design system spec (colors, typography, components, layout)
- **[INFORMATION_ARCHITECTURE.md](./INFORMATION_ARCHITECTURE.md)**: Site structure, page details, user flows
- **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)**: Setup, component usage, API integration, deployment
- **[COPY_DECK.md](./COPY_DECK.md)**: FR/EN copy for consents, disclaimers, CTAs, emails

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Components | shadcn/ui (Radix UI) |
| Forms | React Hook Form + Zod |
| i18n | next-intl |
| Animation | Framer Motion |
| Icons | Lucide React |
| Fonts | Google Fonts (Poppins) |

---

## Folder Structure Highlights

### `/app/[locale]`
Locale-based routing. Each locale (en/fr) has its own route tree.

### `/components`
- **ui/**: shadcn/ui primitives (Button, Card, Input, etc.)
- **form/**: Custom form components (FileDropzone, ConsentCheckbox)
- **Reusable**: Hero, SectionHeading, ServiceCard, Timeline, etc.

### `/lib`
- **utils.ts**: Utility functions (cn, formatDate, formatIBAN)
- **validators/**: Zod schemas for form validation

### `/messages`
- **en.json**: English translations
- **fr.json**: French translations

---

## API Integration (Backend TODOs)

The UI is ready for backend integration. Expected endpoints:

- `POST /api/auth/signup`, `/login`, `/2fa/verify`
- `POST /api/kyc/individual`, `/kyb/company`
- `POST /api/referral/prequal`, `/redirect`
- `POST /api/company-formation`
- `GET /api/user/balance`, `/transactions`, `/applications`

See [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) for full API spec.

---

## Deployment

### Recommended: Vercel
1. Push to GitHub
2. Import in Vercel
3. Deploy

### Alternatives
- Netlify
- AWS Amplify
- Self-hosted (Node.js)

### Environment Variables
Create `.env.local`:
```
NEXT_PUBLIC_API_URL=https://api.opulanz.com
```

---

## Testing (Future)

### Unit Tests
- Vitest or Jest
- Test utilities, validators

### Integration Tests
- React Testing Library
- Test forms, validation

### E2E Tests
- Playwright or Cypress
- Test critical flows

### Accessibility Tests
- axe-core
- Pa11y

---

## Roadmap

### Phase 1 (Current)
- ✅ Core UI/UX
- ✅ All Lot 0-6 screens
- ✅ i18n (EN/FR)
- ✅ Component library
- ✅ Compliance notices

### Phase 2
- [ ] Backend API integration
- [ ] Authentication (2FA)
- [ ] Payment processing (Stripe)
- [ ] Email notifications
- [ ] Document management (S3)

### Phase 3
- [ ] Mobile app (React Native)
- [ ] Advanced dashboard charts
- [ ] AI chatbot support

### Phase 4
- [ ] Multi-tenancy/whitelabel
- [ ] Analytics integration
- [ ] A/B testing

---

## Contributing

This is a proprietary project. Internal team members: see CONTRIBUTING.md for guidelines.

---

## License

Proprietary. © 2025 Opulanz. All rights reserved.

---

## Support

For questions or issues:
- **Email**: dev@opulanz.com
- **Docs**: See `/docs` folder
- **Slack**: #opulanz-dev

---

## Credits

**Design & Development**: Opulanz Product & Engineering Team
**UI Library**: shadcn/ui (https://ui.shadcn.com)
**Icons**: Lucide React (https://lucide.dev)
**Framework**: Next.js by Vercel (https://nextjs.org)

---

**Built with care for modern entrepreneurs in France & Luxembourg.**
