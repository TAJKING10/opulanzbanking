/**
 * Account Opening Funnel Types
 * Provider-neutral banking application types
 */

export type AccountMode = "personal" | "business";

export type CompanyStatus = "existing" | "new";

export type AccountType = "current" | "private_banking" | "investment";

export type SourceOfFunds =
  | "salary"
  | "dividends"
  | "business_income"
  | "asset_sale"
  | "savings"
  | "other";

export type Jurisdiction = "luxembourg" | "france" | "finland" | "other_eea";

export type Currency = "EUR" | "USD" | "GBP" | "other";

export type LegalForm =
  | "sarl"
  | "sa"
  | "scs"
  | "llc"
  | "ltd"
  | "oy"
  | "ab"
  | "other";

// Personal Application Interfaces

export interface TaxResidency {
  country: string;
  tin?: string;
}

export interface PersonalIdentity {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  countryOfResidence: string;
  taxResidencies: TaxResidency[];
  dateOfBirth: string;
  nationality: string;
}

export interface PersonalIntent {
  accountType: AccountType;
  preferredJurisdictions: Jurisdiction[];
  currencies: Currency[];
  estimatedMonthlyIncoming: number;
  sourceOfFunds: SourceOfFunds;
  sourceOfFundsDetails?: string;
  isPEP: boolean;
}

export interface PersonalConsents {
  dataProcessing: boolean;
  dataSharing: boolean;
  marketingOptIn: boolean;
}

export interface PersonalApplication {
  userRef: string;
  mode: "personal";
  identity: PersonalIdentity;
  intent: PersonalIntent;
  consents: PersonalConsents;
  createdAt: string;
}

// Business Application Interfaces

export interface CompanyInfo {
  status: CompanyStatus;
  countryOfIncorporation?: string;
  companyName?: string;
  registrationNumber?: string;
  legalForm?: LegalForm;
  website?: string;
}

export interface BusinessIntent {
  jurisdictions: Jurisdiction[];
  businessActivity: string;
  expectedMonthlyVolume: number;
  averageTicketSize: number;
  primaryCurrencies: Currency[];
}

export interface DirectorOrUBO {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  residencyCountry: string;
  role: "director" | "ubo" | "both";
  ownershipPercentage?: number;
}

export interface BusinessConsents {
  dataProcessing: boolean;
  dataSharing: boolean;
  authorizedRepresentative: boolean;
  marketingOptIn: boolean;
}

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

// Union type for any application
export type Application = PersonalApplication | BusinessApplication;

// Referral Routing Types

export type PartnerName = "narvi" | "olky" | "manual_review";

export interface ReferralConfig {
  narviKey: string;
  olkyKey: string;
  narviBaseUrl: string;
  olkyBaseUrl: string;
}

export interface ReferralRouting {
  partner: PartnerName;
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

export interface ReferralEntry {
  userRef: string;
  partner: PartnerName;
  mode: AccountMode;
  status: "CLICKED" | "COMPLETED" | "FAILED";
  timestamp: string;
  application: Application;
}

// Form Step State

export interface FunnelState {
  mode: AccountMode;
  currentStep: number;
  totalSteps: number;
  data: Partial<Application>;
}

// Eligibility Documents

export interface EligibilityRequirement {
  id: string;
  label: string;
  required: boolean;
  description?: string;
}
