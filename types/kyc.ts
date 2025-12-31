/**
 * KYC/Onboarding Data Model
 * For Opulanz CIF - Complete data structure for all regulatory documents
 */

export type ClientType = "PP" | "PM";
export type Language = "fr" | "en";

// Common types
export type Title = "M." | "Mme";
export type MaritalStatus = "married" | "pacs" | "single" | "widowed" | "divorced" | "cohabitation";
export type ProfessionalStatus = "employed" | "self-employed" | "retired" | "unemployed" | "student" | "other";
export type PropertyType = "main_residence" | "secondary_residence" | "rental" | "professional" | "land" | "other";
export type IncomeRange = "<50k" | "50-100k" | "100-150k" | "150-500k" | ">500k";
export type NetWorthRange = "<100k" | "100-300k" | "300-500k" | "500k-1M" | "1-5M" | ">5M";
export type InvestmentHorizon = "<1y" | "1-3y" | "3-5y" | ">5y";
export type RiskProfileLabel = "Sécuritaire" | "Prudent" | "Équilibré" | "Dynamique";
export type TransactionFrequency = "none" | "<1" | "1-5" | ">5";
export type HoldingPeriod = "<1y" | "1-4y" | ">4y";
export type VolumeRange = "<5k" | "5-10k" | "10-50k" | ">50k";
export type KnowledgeLevel = "none" | "basic" | "good" | "expert";

// Individual (PP) types
export interface Donation {
  date: string;
  amount: number;
  beneficiary?: string;
  comments?: string;
}

export interface Child {
  lastName: string;
  firstName: string;
  dateOfBirth: string;
  relationship: string;
  fiscallyDependent: boolean;
  hasChildren: boolean;
}

export interface IndividualHolder {
  title: Title;
  lastName: string;
  maidenName?: string;
  firstName: string;
  dateOfBirth: string;
  placeOfBirth: string;
  nationality: string;
  address: {
    street: string;
    postalCode: string;
    city: string;
    country: string;
  };
  email: string;
  phone: string;
  taxResidenceCountry: string;
  USPerson: boolean;
  professionalSituation: {
    status: ProfessionalStatus;
    profession?: string;
    jobTitle?: string;
    companyName?: string;
    legalForm?: string;
    companyRegisteredAddress?: string;
  };
  legalProtection: {
    underProtectionRegime: boolean;
    regimeType?: string;
    legalRepresentativeName?: string;
    legalRepresentativeContact?: string;
  };
}

export interface FamilySituation {
  maritalStatus: MaritalStatus;
  dateOfMarriageOrPACS?: string;
  marriageContractOrPACSConventionExists: boolean;
  regimeDetails?: string;
  priorDonations: {
    donationsBetweenSpouses: Donation[];
    donationsToChildrenOrGrandchildren: Donation[];
  };
  children: Child[];
  upcomingProjects?: string;
}

export interface FinancialAsset {
  institution: string;
  accountType: string;
  holders: string;
  currentValue: number;
  openingDate: string;
  comments?: string;
}

export interface RealEstateAsset {
  address: string;
  propertyType: PropertyType;
  ownershipShare: number;
  acquisitionDate: string;
  acquisitionPrice: number;
  currentEstimatedValue: number;
  monthlyRentalIncome?: number;
  monthlyCharges?: number;
  remainingLoanCapital?: number;
  monthlyLoanInstalment?: number;
  interestRate?: number;
  comments?: string;
}

export interface ProfessionalAsset {
  name: string;
  description: string;
  estimatedValue: number;
  ownershipShare: number;
  comments?: string;
}

export interface DebtAndLoan {
  creditorName: string;
  type: string;
  initialCapital: number;
  outstandingCapital: number;
  monthlyInstalment: number;
  interestRate: number;
  maturityDate: string;
  comments?: string;
}

export interface RetirementScheme {
  type: string;
  annualContribution: number;
}

export interface ProtectionInsurance {
  type: string;
  insuredPerson: string;
  benefitsDescription: string;
}

export interface RetirementInfo {
  targetRetirementDateKnown: boolean;
  targetRetirementDate?: string;
  hasRetirementAssessmentDocument: boolean;
  retirementSchemes: RetirementScheme[];
  protectionInsurance: ProtectionInsurance[];
}

export interface ProductKnowledge {
  holdsThisType: boolean;
  avgTransactionsPerYear: TransactionFrequency;
  typicalHoldingPeriod: HoldingPeriod;
  annualVolumeRange: VolumeRange;
  selfAssessedKnowledgeLevel: KnowledgeLevel;
}

export interface InvestmentKnowledge {
  monetary: ProductKnowledge;
  bonds: ProductKnowledge;
  convertibles: ProductKnowledge;
  equities: ProductKnowledge;
  realEstateFunds: ProductKnowledge;
  privateEquity: ProductKnowledge;
  etf: ProductKnowledge;
  derivatives: ProductKnowledge;
  structuredProducts: ProductKnowledge;
}

export interface InvestmentObjectives {
  capitalPreservation: number;
  capitalGrowth: number;
  diversification: number;
  regularIncome: number;
  transmission: number;
  taxOptimisation: number;
  otherObjective?: string;
  otherObjectivePriority?: number;
}

export interface RiskProfile {
  riskPreferenceCurve: "A" | "B" | "C";
  riskToleranceDescription: "noRisk" | "reasonableRisk" | "higherRisk" | "veryHighRisk";
  pastLossExperience: {
    hasExperiencedLoss: boolean;
    lossMagnitude?: number;
    reactionDescription?: string;
  };
  reactionTo20PercentGain?: string;
  investmentHorizon: InvestmentHorizon;
  liquidityNeeds: boolean;
  ESGPreference: boolean;
  maxAcceptableLossPercent: number;
  shareOfTotalWealthThisInvestmentRepresents: number;
  riskProfileLabel: RiskProfileLabel;
  maxHighRiskAssetsPercent: number;
}

// Company (PM) types
export interface CompanyIdentity {
  legalName: string;
  tradeName?: string;
  legalForm: string;
  registeredAddress: {
    street: string;
    postalCode: string;
    city: string;
    country: string;
  };
  countryOfIncorporation: string;
  registrationNumber: string;
  businessSector: string;
  geographicAreaOfActivity: string;
  regulatedActivity: boolean;
  regulatoryAuthority?: string;
  listedCompany: boolean;
  listingMarkets?: string;
}

export interface Representative {
  title?: Title;
  lastName: string;
  firstName: string;
  position: string;
  phone: string;
  email: string;
  dateOfBirth?: string;
  nationality?: string;
  isPEP: boolean;
}

export interface Shareholder {
  lastNameOrCorporateName: string;
  firstName?: string;
  rolePosition: string;
  phone: string;
  email: string;
  ownershipPercent: number;
  isPEP: boolean;
}

export interface UBO {
  name: string;
  firstName?: string;
  nationality: string;
  address: string;
  ownershipPercent: number;
  isPEP: boolean;
}

export interface CompanyFinancialSituation {
  lastFYBalanceSheetTotal: number;
  lastFYNetTurnoverOrResult: number;
  equityAmount: number;
  financialCommitmentsAsPercentOfRevenues: number;
  patrimonyBreakdownPercent: {
    bankSavingsPercent: number;
    financialInvestmentsPercent: number;
    capitalisationContractsPercent: number;
    realEstatePercent: number;
    professionalAssetsPercent: number;
    otherAssetsPercent: number;
  };
}

export interface CompanyPortfolioManagement {
  hasManagedPortfolio: boolean;
  managesPortfolioInternally: boolean;
  managesPortfolioWithAdvisor: boolean;
  staffHasProfessionalInvestmentRole: boolean;
  followsFinancialPress: boolean;
  followsMarkets: boolean;
  checksStatementsMonthly: boolean;
}

// Common relationship & mission
export interface MissionObjectives {
  structurationPatrimoniale: number;
  protectionPatrimoine: number;
  aideInvestissement: number;
  rechercheFinancement: number;
}

export interface MissionInfo {
  missionObjectivesPrioritised: MissionObjectives;
  missionsAccepted: {
    diagnosticAndGlobalPatrimonialAdvice: boolean;
    assistanceAndPatrimonialFollowUp: boolean;
    assistanceChoosingFinancialInstruments: boolean;
    financingAudit: boolean;
    realEstateInvestmentAdvice: boolean;
  };
  financingTypeDescription?: string;
  realEstateInvestmentRole?: "promoter" | "company" | "buyer";
  investmentProjectDescription?: string;
  remunerationUnderstanding: {
    understandsFixedFeeStudy: boolean;
    understandsFollowUpFeePercent: boolean;
    followUpFeePercent?: number;
    understandsOtherAnnexActivities: boolean;
  };
}

export interface RecommendedProduct {
  productName: string;
  providerName: string;
  ISIN?: string;
  allocationPercent: number;
  rationale: {
    objectiveMatch: string;
    horizonMatch: string;
    knowledgeExperienceMatch: string;
    riskToleranceMatch: string;
    otherArguments?: string;
  };
  productAdvantages: string;
  productRisks: string;
  costsExAnte: {
    investmentAmountScenario: number;
    investmentDurationYears: number;
    serviceFeesEuroPerYear: number;
    serviceFeesPercentPerYear: number;
    retrocessionsEuroPerYear: number;
    retrocessionsPercentPerYear: number;
    productCostsEuroPerYear: number;
    productCostsPercentPerYear: number;
    totalAnnualCostsEuro: number;
    totalAnnualCostsPercent: number;
    recommendedHoldingPeriodYears: number;
    entryFeesImpactPercent: number;
    managementFeesPercent: number;
  };
}

export interface DocumentMetadata {
  documentType: string;
  description: string;
  fileName: string;
  uploadedAt: string;
}

export interface PPConsents {
  confirmsInformationIsTruthful: boolean;
  undertakesToInformOfChanges: boolean;
  confirmsDERReceived: boolean;
  acceptsNonIndependentAdviceAndRetrocessions: boolean;
  understandsRemunerationModel: boolean;
  consentToPersonalDataProcessing: boolean;
  consentsToEmailAsDurableMedium: boolean;
  consentAMLDeclarations: boolean;
}

export interface PMConsents {
  informationIsTruthful: boolean;
  willInformOfChanges: boolean;
  DERReceived: boolean;
  acceptsNonIndependentAdviceAndRetrocessions: boolean;
  understandsRemunerationModel: boolean;
  consentToPersonalDataProcessing: boolean;
  consentsToEmailAsDurableMedium: boolean;
  consentAMLDeclarations: boolean;
}

export interface SignatureMetadata {
  signingPlace: string;
  signingDate: string;
  numberOfCopies?: number;
  clientName?: string;
  representativeName?: string;
  representativePosition?: string;
  companyName?: string;
  advisorName: string;
}

// Main data structure
export interface IndividualClientData {
  clientType: "PP";
  preferredLanguage: Language;
  applicationId?: string;
  envelopeId?: string;
  basicContact: {
    email: string;
    mobile: string;
  };
  holders: {
    holder1: IndividualHolder;
    holder2?: IndividualHolder;
  };
  familySituation: FamilySituation;
  financialSituation: {
    incomeRange: IncomeRange;
    estimatedNetWorthRange: NetWorthRange;
    financialCommitments: {
      commitmentsAsPercentOfIncome: number;
      totalCommitmentsAmount: number;
    };
    assetAllocationPercentages: {
      financialAssetsPercent: number;
      realEstatePercent: number;
      professionalAssetsPercent: number;
      otherAssetsPercent: number;
    };
    taxSituation: {
      paysIncomeTax: boolean;
      subjectToIFI: boolean;
    };
    estimatedSavingsCapacityPerYear: number;
  };
  originOfFunds: {
    plannedInvestmentAmount: number;
    natureOfAssetsToInvest: string[];
    economicOriginOfFunds: string[];
    economicOriginDescription?: string;
    originBankName: string;
    originBankCountry: string;
  };
  patrimony: {
    financialAssets: FinancialAsset[];
    realEstateAssets: RealEstateAsset[];
    professionalAssets: ProfessionalAsset[];
    debtsAndLoans: DebtAndLoan[];
  };
  retirementAndInsurance: {
    holder1: RetirementInfo;
    holder2?: RetirementInfo;
  };
  investmentKnowledge: InvestmentKnowledge;
  investmentObjectives: InvestmentObjectives;
  riskProfile: RiskProfile;
  consents: PPConsents;
  signature: SignatureMetadata;
}

export interface CorporateClientData {
  clientType: "PM";
  preferredLanguage: Language;
  applicationId?: string;
  envelopeId?: string;
  basicContact: {
    email: string;
    mobile: string;
  };
  companyIdentity: CompanyIdentity;
  representatives: Representative[];
  shareholdersAbove25Percent: Shareholder[];
  fatcaAndUBO: {
    hasUSPersonShareholder: boolean;
    FATCAComments?: string;
    UBOs: UBO[];
  };
  financialSituation: CompanyFinancialSituation;
  originOfFunds: {
    assetsToInvestType: string[];
    plannedInvestmentAmount: number;
    economicOriginOfFunds: string[];
    economicOriginDescription?: string;
    originBankName: string;
    originBankCountry: string;
  };
  investmentKnowledge: InvestmentKnowledge;
  portfolioManagement: CompanyPortfolioManagement;
  investmentObjectives: InvestmentObjectives;
  riskProfile: RiskProfile;
  consents: PMConsents;
  signature: SignatureMetadata;
}

export interface CommonData {
  missionInfo: MissionInfo;
  recommendedProducts: RecommendedProduct[];
  documents: DocumentMetadata[];
}

export type ClientFile = {
  common: CommonData;
} & (IndividualClientData | CorporateClientData);
