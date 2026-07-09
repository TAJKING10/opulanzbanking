# 01 — Project Overview

## What is Opulanz?

Opulanz is a **financial services platform** targeting French and Luxembourgish markets. It offers:

| Service | Description |
|---------|-------------|
| Account Opening | Individual (KYC) and Company (KYB) bank account applications |
| Company Formation | Business registration wizard |
| Accounting & Invoicing | Financial management tools |
| Tax Advisory | Tax consultation booking + payment |
| Life Insurance | Insurance consultation booking |
| Investment Advisory | Full KYC profile + PayPal payment + Calendly booking |
| SPV Investment Portal | Investment administration portal |

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 14.2.x | React framework with App Router |
| TypeScript | 5.3.x | Type safety |
| Tailwind CSS | 3.4.x | Styling |
| shadcn/ui | Latest | UI component library |
| next-intl | 3.11.x | English/French internationalization |
| React Hook Form | 7.51.x | Form handling |
| Zod | 3.22.x | Form validation |
| Capacitor | 6.2.x | Mobile app wrapper (Android/iOS) |
| Lucide React | 0.363.x | Icons |
| Framer Motion | 11.x | Animations |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 18+ | Runtime |
| Express.js | 4.18.x | Web framework |
| PostgreSQL (pg) | 8.11.x | Database client |
| Nodemailer | 8.0.x | Email sending |
| DocuSign eSign SDK | 8.5.x | Document signing |
| multer | 2.1.x | File uploads |
| jsonwebtoken | 9.0.x | JWT auth |
| bcryptjs | 3.0.x | Password hashing |
| helmet | 7.1.x | Security headers |
| morgan | 1.10.x | HTTP logging |

### Infrastructure
| Service | Purpose |
|---------|---------|
| Azure App Service | Hosting (frontend + backend) |
| Azure PostgreSQL | Database |
| Azure Blob Storage | Document/file storage |
| Azure DevOps | CI/CD pipelines |
| PayPal Sandbox/Live | Payment processing |
| Calendly | Appointment scheduling |
| DocuSign | Electronic signatures |
| Gmail SMTP | Email sending |

---

## Project Folder Structure

```
azuree/                              ← Root project folder
│
├── app/                             ← Next.js pages (App Router)
│   └── [locale]/                    ← en/ and fr/ routes
│       ├── page.tsx                 ← Homepage
│       ├── open-account/            ← Account opening
│       ├── company-formation/       ← Company formation wizard
│       ├── tax-advisory/            ← Tax advisory + schedule
│       ├── life-insurance/          ← Life insurance + schedule
│       ├── investment-advisory/     ← Investment advisory + schedule
│       ├── invoicing-accounting/    ← Accounting
│       ├── spv-investment/          ← Investment portal
│       ├── dashboard/               ← User dashboard
│       ├── auth/                    ← Login/signup
│       └── admin/                   ← Admin panel
│
├── components/                      ← Reusable React components
│   ├── ui/                          ← shadcn/ui primitives
│   ├── kyc/                         ← KYC wizard components
│   ├── header.tsx                   ← Site header
│   ├── footer.tsx                   ← Site footer
│   ├── hero.tsx                     ← Hero section
│   └── paypal-buttons.tsx           ← PayPal payment button
│
├── backend/                         ← Express.js API server
│   ├── src/
│   │   ├── index.js                 ← Entry point (port 5000)
│   │   ├── config/db.js             ← PostgreSQL connection
│   │   ├── routes/                  ← All API routes
│   │   ├── services/                ← Business logic services
│   │   └── migrations/              ← SQL migration files
│   └── package.json
│
├── messages/                        ← i18n translation files
│   ├── en.json                      ← English strings
│   └── fr.json                      ← French strings
│
├── public/                          ← Static assets (images, etc.)
├── types/                           ← TypeScript type definitions
├── contexts/                        ← React context providers
├── lib/                             ← Utility functions
├── documentation/                   ← THIS FOLDER ← You are here
│
├── .env                             ← Development environment variables
├── .env.local                       ← Local overrides (production URLs)
├── .env.production                  ← Production environment variables
├── next.config.js                   ← Next.js config
├── tailwind.config.ts               ← Tailwind config + brand colors
└── package.json                     ← Frontend dependencies
```

---

## Brand Colors (Design Tokens)

| Token | Hex | Usage |
|-------|-----|-------|
| `brand-gold` | `#b59354` | Primary accent, buttons |
| `brand-goldDark` | `#886844` | Hover states |
| `brand-goldLight` | `#dac5a4` | Backgrounds, badges |
| `brand-dark` | `#252623` | Text, headings |
| `brand-grayMed` | `#6b7280` | Subtitle text |
| `brand-off` | `#f6f8f8` | Section backgrounds |

---

## Languages

The platform fully supports **English (en)** and **French (fr)**:
- URLs: `/en/...` and `/fr/...`
- All text comes from `messages/en.json` and `messages/fr.json`
- Language switcher in the header
- Calendly widgets switch language based on locale
