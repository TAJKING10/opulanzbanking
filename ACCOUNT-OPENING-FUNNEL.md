# Account Opening Funnel Implementation

## Overview

This implementation provides a complete, provider-neutral banking account opening funnel for the Opulanz Banking platform. It supports both **Personal** and **Business** account applications with intelligent partner routing (Lot 0.1 warm referral flow).

## Features

### ✅ Provider-Neutral Design
- All UI copy references "Opulanz Partner Bank" generically
- No specific mention of "Narvi" or "Olky" in user-facing text
- Partner assignment happens behind the scenes based on jurisdiction selection

### ✅ Personal Account Flow (6 Steps)
1. **Welcome** - Introduction and mode selection
2. **Identity & Contact** - Personal details, contact info, tax residency
3. **Account Intent & Preferences** - Account type, jurisdictions, currencies, source of funds
4. **Eligibility & Documents** - Dynamic checklist based on selections
5. **Review & Consents** - Summary with required data processing consents
6. **Submission** - Success message with partner handoff or manual review notification

### ✅ Business Account Flow (7 Steps)
1. **Welcome** - Introduction and mode selection
2. **Company Status** - Existing company details or new company indication
3. **Contact Person** - Main contact details
4. **Business Intent & Activity** - Jurisdictions, activity, volumes
5. **Directors & UBOs** - Add multiple directors/beneficial owners
6. **Review & Consents** - Summary with authorized representative confirmation
7. **Submission** - Success with partner routing

### ✅ Lot 0.1 Warm Referral Logic
- **Partner Routing Rules:**
  - Jurisdiction includes Finland → Route to Narvi
  - Jurisdiction includes Luxembourg or France → Route to Olky
  - Otherwise → Manual review by Opulanz team
- **Signed Redirect URLs:** HMAC-SHA256 signed parameters
- **Data Persistence:** Application data saved to localStorage (`opulanz_applications`)
- **Console Logging:** Detailed logging for demo/debugging purposes

## File Structure

```
├── types/
│   └── account-opening.ts          # TypeScript interfaces and types
├── lib/
│   └── referral-routing.ts         # Partner routing and URL signing logic
├── components/
│   └── account-opening/
│       ├── form-stepper.tsx        # Progress indicator component
│       ├── personal-funnel.tsx     # Personal account 6-step wizard
│       ├── business-funnel.tsx     # Business account 7-step wizard
│       └── account-funnel-wrapper.tsx  # Mode switcher wrapper
└── app/[locale]/
    └── open-account/
        ├── page.tsx                # Landing page with account type cards
        └── start/
            └── page.tsx            # Funnel entry point with mode parameter
```

## Routes

| Route | Description |
|-------|-------------|
| `/en/open-account` | Landing page showing Personal and Business account cards |
| `/en/open-account/start?mode=personal` | Personal account funnel |
| `/en/open-account/start?mode=business` | Business account funnel |

## TypeScript Interfaces

### Application Types

```typescript
// Personal Application
export interface PersonalApplication {
  userRef: string;
  mode: "personal";
  identity: PersonalIdentity;
  intent: PersonalIntent;
  consents: PersonalConsents;
  createdAt: string;
}

// Business Application
export interface BusinessApplication {
  userRef: string;
  mode: "business";
  contactPerson: PersonalIdentity;
  company: CompanyInfo;
  intent: BusinessIntent;
  directorsAndUBOs: DirectorOrUBO[];
  consents: BusinessConsents;
  createdAt: string;
}
```

### Referral Routing

```typescript
export interface ReferralRouting {
  partner: "narvi" | "olky" | "manual_review";
  redirectUrl: string;
  signedPayload: {
    ref: string;
    partner: string;
    user_ref: string;
    ts: number;
    scope: string;
    sig: string;
  };
}
```

## Testing the Flows

### 1. Start the Development Server

```bash
npm run dev
```

Navigate to: `http://localhost:3000/en/open-account`

### 2. Test Personal Account Flow

**Scenario A: Finland → Narvi Partner**
1. Click "Get Started" under Individual Account
2. Complete Step 1 (Welcome) - Click "Start Personal Application"
3. Complete Step 2 (Identity):
   - First Name: John
   - Last Name: Doe
   - Email: john.doe@example.com
   - Mobile: +358 40 123 4567
   - Date of Birth: 1990-01-01
   - Nationality: Finnish
   - Country of Residence: Finland
   - Tax Residency: Finland
4. Complete Step 3 (Intent):
   - Account Type: Current Account
   - Jurisdictions: ✅ Finland
   - Currencies: ✅ EUR
   - Monthly Incoming: €10,000
   - Source of Funds: Salary
   - PEP: ☐ No
5. Review Step 4 (Eligibility) - Read-only checklist
6. Complete Step 5 (Review & Consents):
   - ✅ Data processing consent
   - ✅ Data sharing authorization
   - ☐ Marketing opt-in (optional)
7. Submit and observe:
   - Partner assigned: **Narvi** (shown as "Opulanz Partner Bank")
   - Redirect URL generated with signature
   - Data logged to console
   - localStorage entry created

**Scenario B: Luxembourg → Olky Partner**
- Repeat above but select "Luxembourg" in jurisdictions
- Partner assigned: **Olky**

**Scenario C: Other EEA → Manual Review**
- Select "Other EEA" only
- Result: Manual review notification, no redirect URL

### 3. Test Business Account Flow

**Scenario: Existing Company in Luxembourg**
1. Click "Get Started" under Company Account
2. Complete Step 1 (Welcome) - Click "Start Business Application"
3. Complete Step 2 (Company Status):
   - Status: ⚫ I already have a company
   - Company Name: Acme Corp S.à r.l.
   - Country: Luxembourg
   - Registration Number: B123456
   - Legal Form: S.à r.l.
4. Complete Step 3 (Contact Person) - Same as personal identity
5. Complete Step 4 (Business Intent):
   - Jurisdictions: ✅ Luxembourg
   - Business Activity: E-commerce
   - Monthly Volume: €100,000
   - Average Ticket: €2,500
   - Currencies: ✅ EUR, ✅ USD
6. Complete Step 5 (Directors & UBOs):
   - Click "Add Director / UBO"
   - First Name: Jane
   - Last Name: Smith
   - DOB: 1985-05-15
   - Nationality: Luxembourg
   - Residency: Luxembourg
   - Role: ⚫ Both (Director & UBO)
   - Ownership: 100%
7. Complete Step 6 (Review & Consents):
   - ✅ Data processing
   - ✅ Data sharing
   - ✅ Authorized representative
8. Submit and verify partner routing

### 4. Test Mode Switching

- Start a Personal application
- At Step 1, click "Switch to Business Account"
- Verify the funnel switches to Business mode
- Reverse test: Start Business → Switch to Personal

### 5. Verify Data Persistence

Open browser DevTools console and check:

```javascript
// View all applications
JSON.parse(localStorage.getItem('opulanz_applications'))

// Expected structure:
[
  {
    userRef: "uuid-v4",
    partner: "narvi",
    mode: "personal",
    status: "CLICKED",
    timestamp: "2025-11-21T...",
    application: { /* full application data */ }
  }
]
```

### 6. Test Signed URL Generation

In the console, you should see:

```javascript
🏦 Opulanz Referral Entry: {
  userRef: "...",
  partner: "narvi",
  mode: "personal",
  status: "CLICKED",
  timestamp: "...",
  application: { ... }
}
```

The redirect URL will look like:
```
https://narvi-demo.example.com/onboarding?ref=OPZ&partner=narvi&user_ref=xxx&ts=1234567890&scope=open_account&sig=abcdef123456...
```

## Form Validation

### Required Fields

**Personal Account:**
- ✅ All identity fields except Tax ID (optional)
- ✅ At least one jurisdiction
- ✅ At least one currency
- ✅ Source of funds
- ✅ Both consent checkboxes

**Business Account:**
- ✅ All contact person fields
- ✅ Company details (if existing company selected)
- ✅ Business activity
- ✅ At least one jurisdiction and currency
- ✅ At least one Director/UBO
- ✅ All three consent checkboxes (including authorized representative)

### Validation Rules

- **Email:** Valid email format
- **Mobile:** Minimum 10 characters
- **Date of Birth:** Required, valid date
- **Country/Nationality:** Non-empty strings
- **Numeric fields:** Non-negative numbers
- **Consents:** Required checkboxes must be checked to proceed

## Security Notes

⚠️ **IMPORTANT FOR PRODUCTION:**

1. **HMAC Signing Keys:**
   - Currently using demo keys in `lib/referral-routing.ts`
   - Move to environment variables: `NEXT_PUBLIC_NARVI_KEY`, `NEXT_PUBLIC_OLKY_KEY`
   - **Better:** Move entire signing logic to backend API

2. **Partner Routing:**
   - Currently client-side in `determinePartner()` function
   - Consider moving business rules to backend for security and flexibility

3. **Data Storage:**
   - LocalStor age is for demo only
   - Implement secure backend storage with encryption
   - Add proper session management and authentication

4. **API Integration:**
   - Replace demo URLs with actual partner onboarding endpoints
   - Implement proper OAuth/API key authentication
   - Add webhook handlers for partner callbacks

5. **Sensitive Data:**
   - Current implementation logs to console (demo only)
   - Remove console.log statements in production
   - Implement proper audit logging on backend

## Customization

### Modify Partner Routing Rules

Edit `lib/referral-routing.ts`:

```typescript
export function determinePartner(application: Application): PartnerName {
  let jurisdictions: Jurisdiction[] = [];

  if (application.mode === "personal") {
    jurisdictions = application.intent.preferredJurisdictions;
  } else {
    jurisdictions = application.intent.jurisdictions;
  }

  // Add your custom rules here
  if (jurisdictions.includes("finland")) {
    return "narvi";
  }

  if (jurisdictions.includes("luxembourg") || jurisdictions.includes("france")) {
    return "olky";
  }

  return "manual_review";
}
```

### Add New Jurisdictions

Update `types/account-opening.ts`:

```typescript
export type Jurisdiction =
  | "luxembourg"
  | "france"
  | "finland"
  | "germany"      // Add new
  | "netherlands"  // Add new
  | "other_eea";
```

Then update the UI in both funnel components to include the new options.

### Modify Form Steps

Each funnel component uses a step-based state machine. To add/remove/reorder steps:

1. Update the `STEPS` constant
2. Adjust `currentStep` logic in handlers
3. Add/remove step rendering in the component JSX

### Change Partner Display Names

Edit `lib/referral-routing.ts`:

```typescript
export function getPartnerDisplayName(partner: PartnerName): string {
  switch (partner) {
    case "narvi":
      return "Nordic Banking Partner";  // Customize
    case "olky":
      return "European Banking Partner"; // Customize
    case "manual_review":
      return "Opulanz Banking";
  }
}
```

## Troubleshooting

### TypeScript Errors

Run type checking:
```bash
npm run type-check
```

### Build Errors

```bash
npm run build
```

### Missing UI Components

Ensure all required shadcn/ui components are installed:
- Button
- Input
- Label
- Card
- Checkbox
- RadioGroup
- Select
- Slider

### Partner Not Routing Correctly

Check console for logged application data and verify:
1. Jurisdictions are being captured correctly
2. `determinePartner()` logic matches your expectations
3. Signed URL is being generated

### LocalStorage Not Saving

- Check browser privacy settings (some block localStorage)
- Verify `saveReferralEntry()` is being called
- Check console for errors

## Next Development Steps

1. **Backend API Implementation**
   - Create POST `/api/applications` endpoint
   - Implement server-side HMAC signing
   - Add database persistence (PostgreSQL/MongoDB)
   - Implement authentication/authorization

2. **Document Upload**
   - Add file upload component to eligibility step
   - Implement S3/Azure Blob storage
   - Add file type/size validation
   - Generate upload URLs with presigned tokens

3. **Email Notifications**
   - Welcome email after submission
   - Partner introduction email
   - Status update notifications
   - Document request reminders

4. **Admin Dashboard**
   - View all applications
   - Manual review queue
   - Partner assignment override
   - Application status tracking
   - Communication history

5. **Enhanced Validation**
   - Real-time email verification
   - Phone number verification (SMS)
   - Address validation
   - Company registry lookup
   - Sanctions/PEP screening API integration

6. **Multi-language Support**
   - Translate all UI text using next-intl
   - Add form labels to translation files
   - Support FR, DE, FI, EN

7. **Analytics & Monitoring**
   - Track funnel drop-off rates
   - A/B test different flows
   - Monitor partner assignment distribution
   - Error tracking (Sentry/DataDog)

## Support

For questions or issues, please contact the development team or open an issue in the project repository.

---

**Generated:** 2025-11-21
**Version:** 1.0.0
**Author:** Claude Code
