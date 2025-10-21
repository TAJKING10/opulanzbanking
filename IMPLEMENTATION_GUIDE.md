# Opulanz Implementation Guide

## Quick Start

### Prerequisites
```bash
Node.js 18+
npm or yarn
```

### Installation
```bash
# Clone repository
cd opulanzbanking

# Install dependencies
npm install

# Run development server
npm run dev

# Open browser
# http://localhost:3000/en
```

### Build for Production
```bash
npm run build
npm start
```

---

## Project Structure

```
opulanzbanking/
├── app/
│   ├── [locale]/              # Locale-based routing
│   │   ├── layout.tsx         # Root layout with header/footer
│   │   ├── page.tsx           # Home page
│   │   ├── open-account/
│   │   │   ├── page.tsx       # Account selection
│   │   │   ├── warm-referral/
│   │   │   │   └── page.tsx   # Lot 0.1
│   │   │   ├── individual/
│   │   │   │   └── page.tsx   # Lot 0.2 KYC
│   │   │   └── company/
│   │   │       └── page.tsx   # Lot 0.2 KYB
│   │   ├── company-formation/
│   │   │   └── page.tsx       # Lot 1
│   │   ├── dashboard/
│   │   │   └── page.tsx       # User dashboard
│   │   └── ...other routes
│   └── globals.css            # Global styles + Tailwind
├── components/
│   ├── ui/                    # shadcn/ui primitives
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── checkbox.tsx
│   │   └── label.tsx
│   ├── form/                  # Custom form components
│   │   ├── file-dropzone.tsx
│   │   └── consent-checkbox.tsx
│   ├── hero.tsx               # Hero component
│   ├── section-heading.tsx    # Section heading with gold underline
│   ├── header.tsx             # Site header
│   ├── footer.tsx             # Site footer
│   ├── service-card.tsx       # Service cards
│   ├── status-chip.tsx        # Status badges
│   ├── timeline.tsx           # Application timeline
│   └── compliance-banner.tsx  # Regulatory notices
├── lib/
│   ├── utils.ts               # Utility functions (cn, formatDate, etc.)
│   └── validators/            # Zod schemas
│       ├── warm-referral.ts
│       └── whitelabel.ts
├── messages/
│   ├── en.json                # English translations
│   └── fr.json                # French translations
├── i18n.ts                    # i18n configuration
├── middleware.ts              # Locale routing middleware
├── tailwind.config.ts         # Tailwind theme
├── next.config.js             # Next.js config
├── package.json
└── tsconfig.json
```

---

## Key Technologies

### Core Stack
- **Next.js 14**: App Router, server components, image optimization
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Component primitives (Radix UI based)

### Form Handling
- **React Hook Form**: Form state management
- **Zod**: Schema validation
- **@hookform/resolvers**: RHF + Zod integration

### Internationalization
- **next-intl**: i18n for Next.js App Router
- Locale routing via middleware
- Translation files in `/messages/{locale}.json`

### Animation
- **Framer Motion**: Micro-interactions, page transitions

### Icons
- **Lucide React**: Icon library

---

## Configuration

### Tailwind Theme
Located in `tailwind.config.ts`. Brand colors are defined under `theme.extend.colors.brand`:

```ts
colors: {
  brand: {
    gold: "#b59354",
    goldDark: "#886844",
    goldLight: "#dac5a4",
    dark: "#252623",
    off: "#f6f8f8",
    grayLight: "#c2c9cd",
    grayMed: "#949ea3",
  },
  accent: {
    teal: "#629daf",
    beige: "#c0aa9a",
  },
}
```

CSS variables are defined in `app/globals.css` for semantic tokens and are compatible with shadcn/ui conventions.

### i18n Configuration
- **Supported locales**: `en`, `fr`
- **Default locale**: `en`
- **Locale prefix**: Always (e.g., `/en/...`, `/fr/...`)

Middleware (`middleware.ts`) automatically redirects root requests to the appropriate locale based on `Accept-Language` header.

### Next.js Config
- **next-intl plugin**: Applied via `withNextIntl()`
- **Image optimization**: Remote patterns enabled (update hostnames for production images)
- **Experimental**: `optimizePackageImports` for lucide-react

---

## Component Usage

### Hero Component
```tsx
import { Hero } from "@/components/hero";

<Hero
  title="Your Hero Title"
  subtitle="Supporting text"
  primaryCta={{ label: "Get Started", href: "/open-account" }}
  secondaryCta={{ label: "Learn More", href: "#about" }}
/>
```

### SectionHeading with Gold Underline
```tsx
import { SectionHeading } from "@/components/section-heading";

<SectionHeading
  overline="OPTIONAL OVERLINE"
  title="Section Title"
  description="Optional description"
  align="center" // or "left"
/>
```

### ServiceCard
```tsx
import { ServiceCard } from "@/components/service-card";

<ServiceCard
  title="Service Name"
  description="Brief description"
  image="https://images.unsplash.com/..."
  href="/service-page"
  ctaLabel="Learn More"
/>
```

### StatusChip
```tsx
import { StatusChip } from "@/components/status-chip";

<StatusChip status="approved" />
<StatusChip status="pending" label="Custom Label" />
```

Available statuses: `pending`, `started`, `in_progress`, `submitted`, `approved`, `active`, `declined`, `clicked`, `completed`

### Timeline
```tsx
import { Timeline } from "@/components/timeline";

const items = [
  {
    id: "1",
    title: "Step Title",
    description: "Optional description",
    status: "completed",
    date: "2025-10-15",
  },
  // ...more items
];

<Timeline items={items} />
```

### FileDropzone
```tsx
import { FileDropzone } from "@/components/form/file-dropzone";

<FileDropzone
  maxSize={15} // MB
  acceptedTypes={[".pdf", ".jpg", ".jpeg", ".png"]}
  multiple={true}
  onFilesChange={(files) => {
    // Handle files
  }}
  error={errors.documents?.message}
/>
```

### ConsentCheckbox
```tsx
import { ConsentCheckbox } from "@/components/form/consent-checkbox";

<ConsentCheckbox
  id="consent-terms"
  checked={consentTerms}
  onCheckedChange={(checked) => setValue("consentTerms", checked)}
  label="I agree to the terms"
  required={true}
  error={errors.consentTerms?.message}
  links={[
    { text: "Terms & Conditions", href: "/legal/terms" },
    { text: "Privacy Policy", href: "/legal/privacy" },
  ]}
/>
```

### ComplianceBanner
```tsx
import { ComplianceBanner } from "@/components/compliance-banner";

<ComplianceBanner
  market="LU" // or "FR"
  productType="banking" // or "investment", "insurance", "mortgage"
  dismissible={true}
/>
```

---

## Form Validation

### Zod Schemas
All form schemas are located in `lib/validators/`. Example:

```ts
import { z } from 'zod';

export const exampleSchema = z.object({
  email: z.string().email('Invalid email address'),
  age: z.number().min(18, 'Must be 18 or older'),
  consent: z.boolean().refine((val) => val === true, {
    message: 'You must agree to continue',
  }),
});

export type ExampleFormData = z.infer<typeof exampleSchema>;
```

### React Hook Form Integration
```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { exampleSchema, type ExampleFormData } from "@/lib/validators/example";

const {
  register,
  handleSubmit,
  watch,
  setValue,
  formState: { errors, isSubmitting },
} = useForm<ExampleFormData>({
  resolver: zodResolver(exampleSchema),
  defaultValues: {
    email: "",
    age: 18,
    consent: false,
  },
});

const onSubmit = async (data: ExampleFormData) => {
  // Handle submission
};

<form onSubmit={handleSubmit(onSubmit)}>
  <input {...register("email")} />
  {errors.email && <p>{errors.email.message}</p>}
  <button type="submit" disabled={isSubmitting}>Submit</button>
</form>
```

---

## Internationalization

### Adding Translations
Update `messages/en.json` and `messages/fr.json`:

```json
{
  "common": {
    "submit": "Submit"
  },
  "page": {
    "title": "Page Title",
    "description": "Description"
  }
}
```

### Using Translations
```tsx
import { useTranslations } from "next-intl";

export default function Page() {
  const t = useTranslations();

  return (
    <div>
      <h1>{t("page.title")}</h1>
      <p>{t("page.description")}</p>
      <button>{t("common.submit")}</button>
    </div>
  );
}
```

### Locale Switching
The header component includes a language switcher. Users can toggle between EN and FR. The current locale is persisted in the URL path.

---

## API Integration (Backend TODOs)

The UI is designed to integrate with backend APIs. Below are the expected endpoints:

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/2fa/verify` - 2FA verification
- `POST /api/auth/logout` - Logout

### KYC/KYB (Lot 0.2)
- `POST /api/kyc/individual` - Submit individual KYC
- `POST /api/kyb/company` - Submit company KYB
- `GET /api/application/{id}` - Get application status
- `POST /api/documents/upload` - Upload documents (multipart)

### Warm Referral (Lot 0.1)
- `POST /api/referral/prequal` - Submit prequalification
- `POST /api/referral/redirect` - Generate signed redirect URL

### Company Formation (Lot 1)
- `POST /api/company-formation` - Submit formation request
- `PUT /api/company-formation/{id}` - Update draft
- `POST /api/company-formation/{id}/payment` - Process payment

### Dashboard
- `GET /api/user/balance` - Get account balance
- `GET /api/transactions` - List transactions
- `GET /api/applications` - List all applications

### Services (Lots 2-6)
- `POST /api/services/tax-advisory/book` - Book tax advisory
- `POST /api/services/investment-advisory/book` - Book investment advisory
- `POST /api/services/mortgage/prequal` - Submit mortgage prequalification

---

## State Management

### Local State
- **React useState**: For simple component state
- **React Hook Form**: For form state

### Global State (Future)
Consider adding:
- **Zustand** or **Redux Toolkit** for global app state
- **React Query** for server state & caching

### Persistence
- **localStorage**: For draft forms, dismissed banners
- **Cookies**: For auth tokens, locale preference

---

## Styling Guidelines

### Utility-First with Tailwind
Prefer Tailwind utilities over custom CSS:

```tsx
// Good
<div className="rounded-2xl bg-white p-6 shadow-elevated">

// Avoid
<div style={{ borderRadius: "1rem", background: "white", padding: "1.5rem" }}>
```

### Custom Utilities
Defined in `app/globals.css` under `@layer components` and `@layer utilities`:

```css
.hero-gradient {
  background: linear-gradient(135deg, #252623 0%, #3d3428 50%, #886844 100%);
}

.gold-underline::after {
  content: '';
  display: block;
  width: 64px;
  height: 5px;
  background-color: var(--gold);
  margin-top: 0.75rem;
}
```

### Responsive Design
Use Tailwind responsive prefixes:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
```

Breakpoints:
- `sm:` 640px
- `md:` 768px
- `lg:` 1024px
- `xl:` 1280px
- `2xl:` 1536px

---

## Accessibility Checklist

- [ ] All images have alt text
- [ ] All form fields have labels
- [ ] Focus states visible (gold ring)
- [ ] Keyboard navigation works
- [ ] ARIA attributes on custom components
- [ ] Color contrast meets WCAG AA (use tools like Axe, Lighthouse)
- [ ] Error messages announced to screen readers (`role="alert"`)
- [ ] Status changes use `aria-live`
- [ ] Semantic HTML (`<header>`, `<nav>`, `<main>`, `<footer>`)

---

## Performance Optimization

### Image Optimization
Always use `next/image`:

```tsx
import Image from "next/image";

<Image
  src="/path/to/image.jpg"
  alt="Description"
  width={800}
  height={500}
  className="object-cover"
/>
```

For external images, add domains to `next.config.js`:

```js
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'images.unsplash.com',
    },
  ],
},
```

### Code Splitting
Next.js App Router automatically code-splits by route. For heavy components, use dynamic imports:

```tsx
import dynamic from "next/dynamic";

const HeavyComponent = dynamic(() => import("@/components/heavy-component"), {
  loading: () => <p>Loading...</p>,
});
```

### Font Optimization
Fonts are loaded via `next/font/google`:

```tsx
import { Poppins } from "next/font/google";

const poppins = Poppins({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

<html className={poppins.className}>
```

### Lighthouse Testing
Run Lighthouse in Chrome DevTools or via CLI:

```bash
npm install -g lighthouse
lighthouse https://your-site.com --view
```

Target scores: ≥95 for all categories.

---

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables (if any)
4. Deploy

### Other Platforms
- **Netlify**: Works with Next.js via adapter
- **AWS Amplify**: Supports SSR
- **Self-hosted**: Use `npm run build && npm start`, behind Nginx/Caddy

### Environment Variables
Create `.env.local` for local development:

```
NEXT_PUBLIC_API_URL=https://api.opulanz.com
NEXT_PUBLIC_STRIPE_KEY=pk_test_...
```

For production, set these in your hosting platform's environment settings.

---

## Testing Strategy

### Unit Tests
- **Vitest** or **Jest** for component logic
- Test utilities, validators, pure functions

### Integration Tests
- **React Testing Library**: Test component interactions
- Example: Form submission, validation errors

### E2E Tests
- **Playwright** or **Cypress**: Full user flows
- Test critical paths: account opening, company formation

### Accessibility Tests
- **axe-core**: Automated a11y testing
- **Pa11y**: CI-integrated accessibility checks

---

## Future Enhancements

### Phase 2
- **Authentication**: Full auth flow with 2FA
- **Payment Integration**: Stripe for company formation fees
- **Document Management**: S3/Cloudinary for uploads
- **Email Notifications**: Transactional emails (SendGrid, Postmark)

### Phase 3
- **Mobile App**: React Native or Flutter
- **Advanced Dashboard**: Charts (Chart.js, Recharts)
- **AI Chatbot**: Customer support assistant

### Phase 4
- **Multi-tenancy**: Whitelabel for partners
- **Analytics**: Mixpanel, Amplitude
- **A/B Testing**: Optimizely, VWO

---

## Troubleshooting

### Common Issues

**Issue**: `Module not found: Can't resolve '@/...'`
- **Fix**: Check `tsconfig.json` paths config, ensure imports use `@/` prefix

**Issue**: Translations not working
- **Fix**: Ensure you're using `useTranslations()` in client components and passing correct keys

**Issue**: Tailwind styles not applied
- **Fix**: Check `tailwind.config.ts` content paths include your files, restart dev server

**Issue**: Images not loading
- **Fix**: Add image hostname to `next.config.js` remotePatterns

---

## Support & Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com
- **next-intl**: https://next-intl-docs.vercel.app
- **Framer Motion**: https://www.framer.com/motion

For project-specific questions, consult the README or contact the development team.
