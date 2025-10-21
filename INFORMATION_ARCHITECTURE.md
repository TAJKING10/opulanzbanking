# Opulanz Information Architecture

## Site Structure

```
/ (Root - redirects to /en or /fr based on locale)
├── /[locale]/ (en | fr)
│   ├── / (Home / Marketing)
│   ├── /open-account
│   │   ├── / (Account type selection)
│   │   ├── /warm-referral (Lot 0.1)
│   │   ├── /individual (Lot 0.2 - KYC)
│   │   └── /company (Lot 0.2 - KYB)
│   ├── /company-formation (Lot 1)
│   │   ├── / (Form selection)
│   │   └── /wizard (Multi-step formation)
│   ├── /invoicing-accounting (Lot 2)
│   ├── /tax-advisory (Lot 3)
│   ├── /life-insurance (Lot 4)
│   ├── /investment-advisory (Lot 5)
│   ├── /mortgage (Lot 6)
│   ├── /dashboard
│   │   ├── / (Overview)
│   │   ├── /transactions
│   │   ├── /applications
│   │   └── /statements
│   ├── /legal
│   │   ├── /terms
│   │   ├── /privacy
│   │   ├── /disclaimers
│   │   └── /regulatory
│   └── /support
│       ├── / (Contact form)
│       └── /callback (Book callback)
```

## Page Details

### Home (/)
**Purpose**: Marketing landing, value proposition, service overview

**Sections**:
1. Hero
   - Title: "Professional Banking for Modern Business"
   - Subtitle: Value proposition
   - CTA: "Open Account" (primary), "Learn More" (secondary)

2. Services Grid
   - 6 service cards with images
   - Brief description
   - Link to service page

3. Trust/Regulatory
   - CSSF, ACPR, AMF badges
   - Compliance messaging

4. CTA Section
   - Dark gradient background
   - "Ready to get started?"
   - CTAs to open account or contact

**Target Metrics**:
- Bounce rate: <40%
- Time on page: >90s
- Click-through to open-account: >15%

---

### Open Account Hub (/open-account)
**Purpose**: Account type selection and routing

**Options**:
1. Individual Account Card
   - Features list
   - CTA to /open-account/individual

2. Company Account Card
   - Features list
   - CTA to /open-account/company

3. Company Formation Callout
   - Link to /company-formation

4. Warm Referral Alternative
   - "Not sure?" messaging
   - Link to /open-account/warm-referral

**Routing Logic**:
- User needs company? → /company-formation
- Individual account? → /individual
- Company account? → /company
- Need guidance? → /warm-referral

---

### Warm Referral Flow (/open-account/warm-referral)
**Purpose**: Lot 0.1 - Prequalification and partner matching

**Steps**:
1. **Form Step**
   - Email
   - Client type (individual/company)
   - Country (FR/LU)
   - Legal form (if company)
   - Expected volume
   - Consents (3 checkboxes)
   - Submit → API call to match partner

2. **Handoff Step**
   - Partner recommendation
   - Reassurance messaging
   - Process explanation (3-step visual)
   - CTA: "Proceed to [Partner]"

3. **Thank You Step**
   - Confirmation message
   - Email notification note
   - CTA: "Book 15-min callback"

**Tracking**:
- Status: CLICKED, STARTED, APPROVED, DECLINED
- Logged in backend for dashboard view

---

### Individual Account Opening (/open-account/individual)
**Purpose**: Lot 0.2 - Full KYC for individuals

**Sections**:
1. **Personal Information**
   - Name, DOB, nationality, phone
   - Address (street, city, postal, country)

2. **Document Upload**
   - ID document
   - Selfie
   - Proof of address
   - FileDropzone component (15MB max)

3. **Activity Information**
   - PEP declaration (radio)
   - Expected monthly volume (select)
   - Source of funds (textarea)

4. **Consents**
   - KYC verification consent
   - Terms & Privacy (linked)

**States**:
- **Form**: Data entry
- **Submitted**: "Under review" message, spinner
- **Approved**: Success screen with IBAN, next steps

**Validations**:
- Required fields enforced
- Email format
- File type & size
- Zod schema validation

**API Integration Points**:
- POST /api/kyc/individual
- GET /api/application/{id}/status
- Webhook for status updates

---

### Company Account Opening (/open-account/company)
**Purpose**: Lot 0.2 - Full KYB for companies

**Sections**:
1. **Company Information**
   - Name, registration number, incorporation date
   - Legal form, address

2. **Document Upload**
   - Company statutes
   - Register extract
   - UBO declaration

3. **Business Activity**
   - Description (textarea)
   - Activity countries (multi-select)
   - Expected monthly volume

4. **Consents**
   - KYB verification consent
   - Terms & Privacy

**Similar States/Validations** as Individual

---

### Company Formation (/company-formation)
**Purpose**: Lot 1 - Luxembourg company formation wizard

**Page 1: Form Selection**
- 4 cards: SARL, SARL-S, SA, SCSp
- Details: min capital, shareholders, liability
- Feature lists
- Select → /company-formation/wizard

**Page 2: Wizard (5 steps)**

1. **Company Details**
   - Company name
   - Business activity (textarea)
   - Share capital (number input)

2. **Shareholders**
   - Add shareholder form (name, nationality, email, ownership %)
   - Repeatable
   - Validation: total ownership = 100%

3. **Capital Deposit**
   - Informational step
   - Process explanation:
     1. Deposit to partner bank
     2. Notary certificate
     3. RCS registration

4. **Payment**
   - Fee breakdown:
     - Formation fees
     - Notary fees
     - Registration fees
   - Total displayed
   - CTA: "Proceed to Payment"

5. **Confirmation**
   - Success message
   - Timeline: 2-3 weeks
   - Next steps
   - CTA: "Go to Dashboard"

**Features**:
- Save & resume progress (localStorage or backend)
- Progress indicator at top
- Back/Next navigation
- Validation per step

---

### Dashboard (/dashboard)
**Purpose**: Post-login hub for account management

**Layout**:
- **Header**: Balance card (gradient, CTA buttons)
- **Quick Actions**: 4 cards (Open Account, Form Company, Book Advisory, Statements)
- **Recent Transactions**: List with icons, amounts, status chips
- **Application Status**: Timeline component showing all applications

**Sidebar**:
- Application progress
- Services promo
- Help/support CTA

**Data Sources**:
- GET /api/user/balance
- GET /api/transactions?limit=10
- GET /api/applications

---

### Service Pages (Lots 2-6)

#### Invoicing & Accounting (/invoicing-accounting)
- Hero
- Feature overview
- Partner info (Horus/FALCO)
- Whitelabel handoff link
- CTA: "Get Started"

#### Tax Advisory (/tax-advisory)
- Hero
- Service description
- Calendly embed for booking
- Intake form (country, topic, budget)
- Payment step (prepaid)
- ICS confirmation download
- Reschedule policy

#### Investment Advisory (/investment-advisory)
- Hero
- Service description
- MiFID compliance notice
- Booking form
- Risk questionnaire (separate step)
- Document upload (financial docs)
- CTA: "Schedule Consultation"

#### Life Insurance (/life-insurance)
- Hero
- Utmost partnership info
- Country eligibility check
- Investor profile (MiFID/IDD)
- KYC + Source of funds
- Fund selection with PRIIPs/KID delivery
- eIDAS signature placeholder

#### Mortgage (/mortgage)
- Hero
- Prequalification form:
  - Purpose, price, down payment
  - Income/expenses
  - Nationality, residence, employment
- Document upload
- Consent to share with lenders
- Case tracking timeline
- Status updates

---

### Legal Pages (/legal/*)

#### Terms & Conditions (/legal/terms)
- Standard T&Cs
- Section navigation
- Print/download option
- Last updated date

#### Privacy Policy (/legal/privacy)
- GDPR-compliant privacy policy
- Data processing details
- User rights
- Contact info

#### Disclaimers (/legal/disclaimers)
- Investment risk disclaimers
- No guarantee statements
- Regulatory context

#### Regulatory (/legal/regulatory)
- CSSF license info
- ACPR/AMF authorizations
- Compliance statements
- Audit trail info

---

### Support (/support)
**Purpose**: Contact and callback requests

**Sections**:
1. Contact form
   - Name, email, subject, message
   - Submit → email to support team

2. Callback booking
   - Calendly embed or custom scheduler
   - 15-minute slots
   - Phone number capture

3. FAQ (accordion)

---

## Navigation Structure

### Header (Desktop)
- Logo (left, links to home)
- Nav links: Open Account, Company Formation, Services, Support
- Language switcher (FR/EN)
- "Get Started" CTA button

### Header (Mobile)
- Logo (left)
- Hamburger menu (right)
- Mobile drawer with:
  - Nav links
  - Language switcher
  - "Get Started" CTA

### Footer
- **Column 1**: Brand, tagline, social icons (gold)
- **Column 2**: Services links
- **Column 3**: Products links
- **Column 4**: Company links
- **Column 5**: Legal links
- **Bottom Bar**: Copyright, regulatory badges

---

## User Flows

### Flow 1: Individual Account Opening (Direct)
1. Home → "Open Account" CTA
2. /open-account → "Individual Account" card
3. /open-account/individual → Fill form → Submit
4. Status: Submitted → (wait) → Approved
5. Dashboard with IBAN
6. Download app / Set up banking

### Flow 2: Company Account via Formation
1. Home → "Company Formation" CTA
2. /company-formation → Select SARL
3. Wizard (5 steps) → Submit → Pay
4. Confirmation → "Need banking account?"
5. /open-account/company → Fill KYB → Submit
6. Dashboard

### Flow 3: Warm Referral
1. Home → "Open Account" CTA
2. /open-account → "Not sure?" link
3. /open-account/warm-referral → Prequalification form
4. Partner match → Handoff screen
5. Redirect to partner (external)
6. Callback booked if needed

### Flow 4: Tax Advisory Booking
1. Home → "Tax Advisory" service card
2. /tax-advisory → Intake form
3. Calendly booking
4. Payment (prepaid)
5. Confirmation email
6. Meeting reminder

---

## Locale Handling

### Supported Locales
- **en**: English (default)
- **fr**: Français

### URL Structure
- Always prefixed: /en/... or /fr/...
- Middleware redirects root to /en or /fr based on Accept-Language header

### Content Strategy
- All UI strings in messages/{locale}.json
- Legal docs have locale-specific versions
- Compliance notices adapt to market (FR/LU) and locale

---

## Market-Specific Adjustments

### France (FR)
- ACPR/AMF badges prominent
- French language default
- IDD/MiFID II notices
- IBAN format: FR76...
- Date format: DD/MM/YYYY

### Luxembourg (LU)
- CSSF badge prominent
- Bilingual (FR/EN)
- Luxembourg company forms (SARL, SA, SCSp)
- IBAN format: LU28...
- Date format: DD/MM/YYYY

### UI Indicators
- Market badge in header (optional)
- Compliance banners adapt to market
- Service availability filters by market
