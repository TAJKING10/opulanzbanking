# Company Formation Wizard - Lot 1

## Overview

This implementation provides a complete 8-step wizard for Luxembourg company formation. It supports **SARL**, **SARL-S**, **SA**, **SCSp**, and **Sole Proprietor** company structures with comprehensive form validation, document upload simulation, payment processing, and data persistence.

## Features

### ✅ Complete 8-Step Wizard
1. **Company Type** - Select and confirm legal structure
2. **General Info** - Company name, purpose, registered office
3. **People** - Add shareholders, directors, managers, and UBOs
4. **Capital** - Define share capital and contributions
5. **Activity** - Business activity, NACE code, turnover
6. **Notary & Domiciliation** - Notary preferences and registered address service
7. **Documents** - Upload ID/passport, lease, capital certificate
8. **Review & Submit** - Payment, consents, and final submission

### ✅ Company Type Specific Rules
- **SARL**: Min €12,000 capital, requires managers
- **SARL-S**: Min €1, max €100,000 capital, simplified structure
- **SA**: Min €30,000 capital, requires 3+ directors, 25% paid-up
- **SCSp**: No minimum capital, flexible partnership structure
- **Sole Proprietor**: No minimum capital, individual enterprise

### ✅ Data Management
- **localStorage persistence**: All form data saved automatically
- **Resume capability**: Users can save and resume later
- **Validation**: Step-by-step validation before proceeding
- **UUID tracking**: Each dossier has unique identifier

### ✅ Payment Simulation
- Demo payment flow (€1,500 setup fee)
- 2-second processing simulation
- Payment status tracking in dossier

### ✅ Document Upload (Simulated)
- ID/passport for all directors/managers/UBOs
- Lease agreement or domiciliation proof
- Capital deposit certificate (optional initially)
- File metadata storage (filename, size, type)

## File Structure

```
├── types/
│   └── company-formation.ts              # TypeScript interfaces
├── components/
│   └── company-formation/
│       ├── company-formation-wizard.tsx  # Main wizard component + Steps 1-2
│       ├── wizard-steps.tsx             # Steps 3-4 (People, Capital)
│       └── wizard-steps-final.tsx       # Steps 5-8 (Activity, Notary, Docs, Submit)
└── app/[locale]/
    └── company-formation/
        └── page.tsx                     # Landing page with type selection
```

## TypeScript Interfaces

### Main Dossier Structure

```typescript
interface CompanyFormationDossier {
  // Step 1
  formType: "SARL" | "SARL-S" | "SA" | "SCSp" | "SOLE";

  // Step 2
  proposedNames: string[];
  purpose: string;
  registeredOffice: string;
  duration: string;
  country: "LU";

  // Step 3
  shareholders: Person[];
  directors: Person[];
  managers?: Person[];
  ubos: Person[];

  // Step 4
  capitalAmount: number;
  capitalCurrency: "EUR";
  capitalPaidUpPercent?: number;
  contributions: Contribution[];

  // Step 5
  naceCode?: string;
  expectedTurnover?: number;
  numberOfEmployees?: number;

  // Step 6
  notaryPreferences?: {
    name?: string;
    city?: string;
    language?: "FR" | "EN" | "DE";
  };
  domiciliationNeeded: boolean;

  // Step 7
  uploads: {
    ids: UploadedFile[];
    leaseOrDomiciliation: UploadedFile[];
    capitalCertificate: UploadedFile | null;
  };

  // Step 8
  consents: {
    termsAccepted: boolean;
    privacyAccepted: boolean;
    accuracyConfirmed: boolean;
  };

  // Metadata
  userRef: string;
  createdAt: string;
  updatedAt: string;
  paymentStatus: "PENDING" | "PAID" | "FAILED";
  setupFeeAmount?: number;
}
```

### Person Structure

```typescript
interface Person {
  id: string;
  firstName: string;
  lastName: string;
  dob: string;
  nationality: string;
  address: string;
  email?: string;
  phone?: string;
  roles: PersonRole[];
  sharePercent?: number;  // For shareholders
  isPep?: boolean;        // For UBOs
}
```

### Validation Rules

```typescript
const COMPANY_FORM_RULES = {
  SARL: {
    minCapital: 12000,
    maxCapital: Infinity,
    requiresManagers: true,
    minManagers: 1,
  },
  "SARL-S": {
    minCapital: 1,
    maxCapital: 100000,
    requiresManagers: true,
    minManagers: 1,
  },
  SA: {
    minCapital: 30000,
    maxCapital: Infinity,
    requiresDirectors: true,
    minDirectors: 3,
    requiresPaidUpPercent: true,
  },
  SCSp: {
    minCapital: 0,
    maxCapital: Infinity,
    requiresManagers: true,
    minManagers: 1,
  },
  SOLE: {
    minCapital: 0,
    maxCapital: Infinity,
  },
};
```

## Usage

### Starting the Wizard

1. Navigate to `/en/company-formation`
2. Click on any company type card (SARL, SARL-S, SA, SCSp, or Sole Proprietor)
3. The wizard automatically opens with the selected type

### Testing Each Step

#### Step 1: Company Type
- Displays selected company type
- Shows requirements (capital, directors/managers needed)
- No form input required
- Click "Next" to proceed

#### Step 2: General Info
- **Required fields:**
  - Proposed legal name (e.g., "Acme Luxembourg S.à r.l.")
  - Company purpose/activities (textarea)
  - Registered office address in Luxembourg
- **Optional fields:**
  - Alternate name
  - Duration (defaults to "unlimited")

#### Step 3: People
- Add shareholders (required for all types except SOLE)
  - Must total 100% ownership
  - Each shareholder: name, DOB, nationality, address, share %
- Add directors (required for SA, minimum 3)
  - Full personal details
  - Contact information
- Add managers (required for SARL/SARL-S, minimum 1)
  - Similar to directors
- Add UBOs (Ultimate Beneficial Owners)
  - Individuals with >25% ownership
  - PEP checkbox for politically exposed persons

#### Step 4: Capital & Contributions
- **Capital amount:**
  - Validates against company type minimums/maximums
  - For SA: paid-up percentage field (min 25%)
- **Contributions:**
  - Add multiple contributions
  - Type: Cash or In-Kind
  - Description and amount for each
  - Total contributions should equal capital amount

#### Step 5: Activity & Scale
- **NACE code:** Statistical classification code
- **Expected annual turnover:** First-year revenue estimate
- **Number of employees:** Expected headcount at launch

#### Step 6: Notary & Domiciliation
- **Notary preferences** (all optional):
  - Preferred notary name
  - Preferred city
  - Language for deeds (EN/FR/DE)
- **Domiciliation service:**
  - Checkbox to request registered address service
  - Shows €600/year pricing if selected
  - If not selected, must upload lease in Step 7

#### Step 7: Documents
- **ID/Passport copies** (required):
  - Upload for all directors, managers, and UBOs
  - Accepts PDF, JPG, PNG
- **Lease/Property title** (required if domiciliation not selected):
  - Proof of registered office
- **Capital certificate** (optional):
  - Can be uploaded later after payment

**Note:** Uploads are simulated - file metadata stored but not actually uploaded

#### Step 8: Review & Submit
- **Summary:** Review all entered data
- **Payment:** Demo payment of €1,500 setup fee
  - Click "Pay Setup Fee (Demo)"
  - 2-second simulation
  - Payment marked as complete
- **Consents** (all required):
  - ✅ Information accuracy confirmation
  - ✅ Terms & Conditions
  - ✅ Privacy Policy
- **Submit:**
  - Saves complete dossier to localStorage
  - Logs to console for demo purposes
  - Shows success message with reference number

### Example Dossier Output

```json
{
  "userRef": "abc123-def456-ghi789",
  "formType": "SARL",
  "proposedNames": ["Acme Luxembourg S.à r.l.", "Acme Lux S.à r.l."],
  "purpose": "Technology consulting and software development services",
  "registeredOffice": "5 Rue Guillaume Kroll, L-1882 Luxembourg",
  "duration": "unlimited",
  "country": "LU",
  "shareholders": [
    {
      "id": "person-1",
      "firstName": "John",
      "lastName": "Doe",
      "dob": "1985-06-15",
      "nationality": "Luxembourg",
      "address": "10 Avenue de la Liberté, L-1931 Luxembourg",
      "email": "john.doe@example.com",
      "roles": ["SHAREHOLDER"],
      "sharePercent": 60
    },
    {
      "id": "person-2",
      "firstName": "Jane",
      "lastName": "Smith",
      "dob": "1990-03-22",
      "nationality": "France",
      "address": "25 Rue de la Gare, F-57100 Thionville",
      "email": "jane.smith@example.com",
      "roles": ["SHAREHOLDER"],
      "sharePercent": 40
    }
  ],
  "managers": [
    {
      "id": "person-1",
      "firstName": "John",
      "lastName": "Doe",
      "roles": ["MANAGER"]
    }
  ],
  "ubos": [
    {
      "id": "person-1",
      "firstName": "John",
      "lastName": "Doe",
      "roles": ["UBO"],
      "sharePercent": 60,
      "isPep": false
    }
  ],
  "capitalAmount": 12000,
  "capitalCurrency": "EUR",
  "contributions": [
    {
      "id": "contrib-1",
      "type": "CASH",
      "description": "Initial capital contribution by John Doe",
      "amount": 7200
    },
    {
      "id": "contrib-2",
      "type": "CASH",
      "description": "Initial capital contribution by Jane Smith",
      "amount": 4800
    }
  ],
  "naceCode": "62.01 - Computer programming activities",
  "expectedTurnover": 500000,
  "numberOfEmployees": 5,
  "notaryPreferences": {
    "city": "Luxembourg",
    "language": "EN"
  },
  "domiciliationNeeded": false,
  "uploads": {
    "ids": [
      {
        "id": "file-1",
        "filename": "john-doe-passport.pdf",
        "size": 245678,
        "type": "application/pdf",
        "uploadedAt": "2025-11-21T12:00:00.000Z"
      },
      {
        "id": "file-2",
        "filename": "jane-smith-id.pdf",
        "size": 198234,
        "type": "application/pdf",
        "uploadedAt": "2025-11-21T12:01:00.000Z"
      }
    ],
    "leaseOrDomiciliation": [
      {
        "id": "file-3",
        "filename": "office-lease-agreement.pdf",
        "size": 512345,
        "type": "application/pdf",
        "uploadedAt": "2025-11-21T12:02:00.000Z"
      }
    ],
    "capitalCertificate": null
  },
  "consents": {
    "termsAccepted": true,
    "privacyAccepted": true,
    "accuracyConfirmed": true
  },
  "paymentStatus": "PAID",
  "setupFeeAmount": 1500,
  "createdAt": "2025-11-21T11:30:00.000Z",
  "updatedAt": "2025-11-21T12:05:00.000Z"
}
```

## localStorage Structure

### Key: `opulanz_company_formation_{userRef}`
Stores individual dossier while in progress (auto-saves on each step)

### Key: `opulanz_company_formations`
Array of all submitted dossiers:

```javascript
[
  {
    userRef: "abc123-def456-ghi789",
    formType: "SARL",
    status: "SUBMITTED",
    createdAt: "2025-11-21T12:05:00.000Z",
    // ... full dossier data
  }
]
```

## Security & Production Considerations

⚠️ **IMPORTANT: This is a demonstration implementation**

### Current Limitations
1. **File uploads:** Simulated client-side only
2. **Payment:** Demo flow with no real payment processing
3. **Data storage:** localStorage only (not secure for production)
4. **Validation:** Client-side only

### Production Requirements

#### 1. Backend API
```typescript
POST /api/company-formation/dossiers
- Create new dossier
- Server-side validation
- Database persistence (PostgreSQL/MongoDB)
- Return dossier ID

PUT /api/company-formation/dossiers/:id
- Update existing dossier
- Resume capability

POST /api/company-formation/dossiers/:id/documents
- Upload files to S3/Azure Blob
- Virus scanning
- File type/size validation
- Generate presigned URLs

POST /api/company-formation/dossiers/:id/submit
- Final validation
- Payment processing integration
- Email notifications
- Notary workflow initiation
```

#### 2. File Upload Service
- AWS S3 or Azure Blob Storage
- Presigned URLs for secure uploads
- Virus/malware scanning
- File encryption at rest
- Access control and expiration

#### 3. Payment Integration
- Stripe, PayPal, or local PSP
- PCI DSS compliance
- Webhook handlers for payment confirmation
- Refund capability
- Invoice generation

#### 4. Database Schema
```sql
CREATE TABLE company_formation_dossiers (
  id UUID PRIMARY KEY,
  user_ref UUID NOT NULL,
  form_type VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL,
  data JSONB NOT NULL,
  payment_status VARCHAR(20),
  payment_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE dossier_documents (
  id UUID PRIMARY KEY,
  dossier_id UUID REFERENCES company_formation_dossiers(id),
  document_type VARCHAR(50),
  filename VARCHAR(255),
  storage_path VARCHAR(500),
  uploaded_at TIMESTAMP DEFAULT NOW()
);
```

#### 5. Validation & Compliance
- Company name availability check (Luxembourg RCS API)
- Sanctions screening (OFAC, EU sanctions lists)
- PEP screening for UBOs
- KYC/AML compliance
- Document verification

#### 6. Notifications
- Email confirmation on submission
- Status updates (notary appointed, documents signed, etc.)
- SMS notifications option
- In-app notifications

#### 7. Admin Dashboard
- View all dossiers
- Status management
- Document review
- Communication with applicants
- Notary assignment
- RCS registration tracking

## Testing

### Quick Test Flow - SARL

1. Go to http://localhost:3002/en/company-formation
2. Click "SARL" card
3. **Step 1:** Click "Next"
4. **Step 2:**
   - Name: "Test Company S.à r.l."
   - Purpose: "Testing purposes"
   - Address: "1 Rue Test, L-1234 Luxembourg"
   - Click "Next"
5. **Step 3:**
   - Add shareholder: Fill all fields, 100% ownership
   - Add manager: Same or different person
   - Add UBO: Usually same as shareholder if >25%
   - Click "Next"
6. **Step 4:**
   - Capital: 12000
   - Add contribution: Cash, 12000
   - Click "Next"
7. **Step 5:**
   - NACE: "62.01"
   - Turnover: 100000
   - Employees: 2
   - Click "Next"
8. **Step 6:**
   - Select language: "EN"
   - Check domiciliation if you want
   - Click "Next"
9. **Step 7:**
   - Upload simulated ID files (any file works)
   - If no domiciliation, upload lease
   - Click "Next"
10. **Step 8:**
    - Click "Pay Setup Fee (Demo)" and wait
    - Check all three consent boxes
    - Click "Submit Formation Dossier"
    - See success message

11. **Verify:**
    - Open browser console
    - Check logged dossier object
    - Check localStorage: `opulanz_company_formations`

## Future Enhancements

### Phase 2
- Real-time company name availability check
- Integration with Luxembourg RCS API
- Email verification for applicants
- Phone/SMS verification
- Multi-language support (FR, DE)

### Phase 3
- Integration with partner banks for capital deposit
- Electronic signature for documents
- Notary portal integration
- Real-time status tracking dashboard
- Mobile app

### Phase 4
- AI-powered document extraction
- Automated compliance checking
- Instant company formation (where applicable)
- Blockchain certificate of incorporation
- API for third-party integrations

## Support

For questions or issues:
- Check console logs for debugging
- Review localStorage data
- Verify all required fields are filled
- Ensure capital meets minimum requirements
- Check that contributions total equals capital

---

**Generated:** 2025-11-21
**Version:** 1.0.0
**Author:** Claude Code
