/**
 * Company Formation Wizard Types - Lot 1
 *
 * TypeScript interfaces for Luxembourg company formation wizard
 */

export type CompanyFormType = "SARL" | "SARL-S" | "SA" | "SCSp" | "SOLE";

export type PersonRole = "DIRECTOR" | "MANAGER" | "UBO" | "FOUNDER" | "SHAREHOLDER";

export type ContributionType = "CASH" | "INKIND";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED";

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  dob: string;
  nationality: string;
  address: string;
  email?: string;
  phone?: string;
  roles: PersonRole[];
  sharePercent?: number;
  isPep?: boolean;
}

export interface Contribution {
  id: string;
  type: ContributionType;
  description: string;
  amount: number;
}

export interface UploadedFile {
  id: string;
  filename: string;
  size: number;
  type: string;
  uploadedAt: string;
}

export interface CompanyFormationDossier {
  // Step 1: Company type
  formType: CompanyFormType;

  // Step 2: General info
  proposedNames: string[];
  purpose: string;
  registeredOffice: string;
  duration: string;
  country: "LU";

  // Step 3: People
  shareholders: Person[];
  directors: Person[];
  managers?: Person[]; // For SARL
  ubos: Person[];

  // Step 4: Capital
  capitalAmount: number;
  capitalCurrency: "EUR";
  capitalPaidUpPercent?: number; // For SA
  contributions: Contribution[];

  // Step 5: Activity
  naceCode?: string;
  expectedTurnover?: number;
  numberOfEmployees?: number;

  // Step 6: Notary & domiciliation
  notaryPreferences?: {
    name?: string;
    city?: string;
    language?: "FR" | "EN" | "DE";
  };
  domiciliationNeeded: boolean;

  // Step 7: Documents
  uploads: {
    ids: UploadedFile[];
    leaseOrDomiciliation: UploadedFile[];
    capitalCertificate: UploadedFile | null;
  };

  // Step 8: Review & submit
  consents: {
    termsAccepted: boolean;
    privacyAccepted: boolean;
    accuracyConfirmed: boolean;
  };

  // Metadata
  createdAt: string;
  updatedAt: string;
  userRef: string;
  paymentStatus: PaymentStatus;
  setupFeeAmount?: number;
  paypalOrderId?: string;
  paypalPaymentDetails?: any;
}

/**
 * Company form validation rules
 */
export const COMPANY_FORM_RULES = {
  SARL: {
    minCapital: 12000,
    maxCapital: Infinity,
    requiresDirectors: false,
    requiresManagers: true,
    minManagers: 1,
  },
  "SARL-S": {
    minCapital: 1,
    maxCapital: 100000,
    requiresDirectors: false,
    requiresManagers: true,
    minManagers: 1,
  },
  SA: {
    minCapital: 30000,
    maxCapital: Infinity,
    requiresDirectors: true,
    requiresManagers: false,
    minDirectors: 3,
    requiresPaidUpPercent: true,
  },
  SCSp: {
    minCapital: 0,
    maxCapital: Infinity,
    requiresDirectors: false,
    requiresManagers: true,
    minManagers: 1,
  },
  SOLE: {
    minCapital: 0,
    maxCapital: Infinity,
    requiresDirectors: false,
    requiresManagers: false,
  },
} as const;

/**
 * Step labels for the wizard
 */
export const WIZARD_STEPS = [
  "Company Type",
  "General Info",
  "People",
  "Capital",
  "Activity",
  "Notary & Domiciliation",
  "Documents",
  "Review & Submit",
] as const;

export type WizardStep = typeof WIZARD_STEPS[number];
