# 04 — Frontend (Next.js)

## Overview

The frontend is a **Next.js 14** app using the App Router, TypeScript, and Tailwind CSS. It supports English and French via `next-intl`.

---

## All Pages & Routes

| URL Path | File Location | Description |
|----------|--------------|-------------|
| `/[locale]` | `app/[locale]/page.tsx` | Homepage |
| `/[locale]/open-account` | `app/[locale]/open-account/page.tsx` | Account opening choice |
| `/[locale]/open-account/individual` | `app/[locale]/open-account/individual/page.tsx` | Individual KYC form |
| `/[locale]/open-account/company` | `app/[locale]/open-account/company/page.tsx` | Company KYB form |
| `/[locale]/company-formation` | `app/[locale]/company-formation/page.tsx` | Company formation wizard |
| `/[locale]/tax-advisory` | `app/[locale]/tax-advisory/page.tsx` | Tax advisory landing |
| `/[locale]/tax-advisory/schedule` | `app/[locale]/tax-advisory/schedule/page.tsx` | Tax advisory booking (Calendly) |
| `/[locale]/life-insurance` | `app/[locale]/life-insurance/page.tsx` | Life insurance landing |
| `/[locale]/life-insurance/schedule` | `app/[locale]/life-insurance/schedule/page.tsx` | Life insurance booking (Contact → Calendly) |
| `/[locale]/investment-advisory` | `app/[locale]/investment-advisory/page.tsx` | Investment advisory landing |
| `/[locale]/investment-advisory/schedule` | `app/[locale]/investment-advisory/schedule/page.tsx` | Investment booking (KYC form → PayPal → Calendly) |
| `/[locale]/invoicing-accounting` | `app/[locale]/invoicing-accounting/page.tsx` | Accounting & invoicing |
| `/[locale]/spv-investment` | `app/[locale]/spv-investment/page.tsx` | SPV investment portal |
| `/[locale]/dashboard` | `app/[locale]/dashboard/page.tsx` | User dashboard |
| `/[locale]/admin` | `app/[locale]/admin/page.tsx` | Admin panel |
| `/[locale]/auth` | `app/[locale]/auth/page.tsx` | Auth flows |
| `/[locale]/login` | `app/[locale]/login/page.tsx` | Login page |
| `/[locale]/signup` | `app/[locale]/signup/page.tsx` | Signup page |
| `/[locale]/kyc` | `app/[locale]/kyc/page.tsx` | KYC wizard |
| `/[locale]/about` | `app/[locale]/about/page.tsx` | About page |
| `/[locale]/services` | `app/[locale]/services/page.tsx` | Services overview |
| `/[locale]/support` | `app/[locale]/support/page.tsx` | Support / help |
| `/[locale]/legal` | `app/[locale]/legal/page.tsx` | Legal pages |

---

## Key Components

### `components/header.tsx`
- Site-wide navigation header
- Language switcher (EN/FR)
- Logo with image + OPULANZ text
- Mobile hamburger menu

### `components/footer.tsx`
- Site-wide footer with links

### `components/hero.tsx`
- Full-width hero banner used on landing pages

### `components/paypal-buttons.tsx`
- Loads PayPal v6 Web SDK
- Creates order via backend API
- Captures payment on approval
- Props: `amount`, `description`, `currency`, `onSuccess`, `onError`

### `components/section-heading.tsx`
- Reusable section title with overline and description

### `components/kyc/KYCWizard.tsx`
- Multi-step KYC onboarding wizard
- Manages step navigation and state
- Context: `contexts/KYCWizardContext.tsx`

### `components/ui/`
- All shadcn/ui primitives: `Button`, `Card`, `Input`, `Label`, `Select`, `Checkbox`, `Dialog`, etc.

---

## Investment Advisory Schedule Page (Key Page)

**File:** `app/[locale]/investment-advisory/schedule/page.tsx`

### 3-Step Flow:
1. **Step 1 — Complete Profile** — 12-section KYC form (all fields required)
2. **Step 2 — Payment** — PayPal payment button
3. **Step 3 — Book Meeting** — Calendly calendar
4. **Confirmation** — Success screen with confirmation number

### 12 Sections in Profile Form:
1. Personal Identity (title, name, DOB, place of birth, nationality, marital status)
2. Contact (email, phone)
3. Residential Address (address line 1 & 2, city, postal code, country)
4. Identity Document (type, number, expiry, issuing country)
5. Tax Residency (tax country, TIN, US person FATCA)
6. Professional Situation (status, employer, position, sector)
7. Family (number of dependants)
8. Financial Situation (income, source, assets, liquid assets, real estate, debts)
9. Origin of Funds (primary origin, details)
10. Investment Knowledge (experience, risk, horizon, objective, return, max loss)
11. Service Type & Amount (advisory/management, initial investment min €10,000)
12. Consents (GDPR, KYC/AML, electronic signature, marketing)

---

## Calendly URLs Used

| Page | English URL | French URL |
|------|------------|-----------|
| Tax Advisory | `https://calendly.com/opulanz-banking/tax-advisory` | `https://calendly.com/opulanz-banking/conseil-fiscal` |
| Life Insurance | `https://calendly.com/opulanz-banking/investment-advisory-clone` | `https://calendly.com/opulanz-banking/assurance-vie` |
| Investment Advisory | `https://calendly.com/opulanz-banking/tax-advisory-clone` | `https://calendly.com/opulanz-banking/conseil-en-investissement` |

---

## Internationalization (i18n)

- Translation files: `messages/en.json` and `messages/fr.json`
- Language detection: URL prefix (`/en/`, `/fr/`)
- Middleware: `middleware.ts` redirects `/` to `/en` automatically
- In components: `const t = useTranslations("namespace")`
- Locale detection: `const locale = useLocale()`

### Adding a New Translation
1. Add key to `messages/en.json`
2. Add same key with French text to `messages/fr.json`
3. Use in component: `t("your.key")`

---

## How the PayPal Flow Works (Frontend)

```
User clicks "Continue to Payment"
    → PayPalButtons component loads PayPal SDK
    → SDK init: paypal.createInstance(clientId)
    → User clicks yellow "Pay with PayPal" button
    → PayPal popup opens
    → User logs in and approves payment
    → onApprove fires
    → Frontend calls backend: POST /api/paypal/capture-order/:orderId
    → Backend captures payment with PayPal
    → onSuccess fires in parent component
    → User moved to Step 3 (Calendly)
```

---

## How Calendly Booking Works (Frontend)

```
Calendly widget loaded via <script src="https://assets.calendly.com/assets/external/widget.js">
Widget renders inline in a div with class "calendly-inline-widget"
Data URL includes: name, email, hide_event_type_details, primary_color

When user books a slot:
    → Calendly posts a message to window: event = "calendly.event_scheduled"
    → Frontend listens: window.addEventListener("message", handler)
    → Handler reads: event URI, invitee URI, start time, end time
    → Booking saved to backend: POST /api/appointments
    → User moved to Confirmation screen
```

---

## Build for Production

```bash
# Build
npm run build

# Start production server
npm start
```

The production build is served on port 3000 by default.
