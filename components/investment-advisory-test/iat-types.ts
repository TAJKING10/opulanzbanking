// ============================================================
// Investment Advisory Test — Shared Types
// Questionnaire de Connaissance du Client (QCC)
// Physical Person (PP) + Company/Legal Entity (PM)
// ============================================================

export type ClientType = "personal" | "company";

// ----- Product Knowledge -----
export type TrueFalseNS = "vrai" | "faux" | "ne_sais_pas" | "";
export type OpsPerYear = "<1" | "1-5" | "6+" | "";
export type VolumeOps = "<5k" | "5-10k" | "10-50k" | ">50k" | "";

export interface ProductEntry {
  held: boolean | null;
  holdingPeriod: string;
  opsPerYear: OpsPerYear;
  volume: VolumeOps;
  q1: TrueFalseNS;
  q2: TrueFalseNS;
}

export const defaultProductEntry: ProductEntry = {
  held: null,
  holdingPeriod: "",
  opsPerYear: "",
  volume: "",
  q1: "",
  q2: "",
};

export interface ProductKnowledge {
  monetary: ProductEntry;
  bonds: ProductEntry;
  stocks: ProductEntry;
  scpi: ProductEntry;
  privateEquity: ProductEntry;
  etf: ProductEntry;
  derivatives: ProductEntry;
  structured: ProductEntry;
  managedPortfolio: boolean | null;
  selfManaged: boolean | null;
  advisedPortfolio: boolean | null;
  financialSectorExp: boolean | null;
  readsPress: boolean | null;
  followsMarkets: boolean | null;
  checksMonthly: boolean | null;
}

// ----- Investment Objectives & Risk -----
export type RiskProfile = "A" | "B" | "C" | "";
export type Horizon = "<1" | "1-3" | "3-5" | ">5" | "";
export type MaxLoss = "none" | "10" | "25" | "50" | "100" | "";
export type PatrimonyPct = "<10" | "10-25" | "25-50" | "50-75" | ">75" | "";
export type PastLoss = "none" | "<10" | "10-20" | ">20" | "";

export interface ObjectivesData {
  capitalPreservation: boolean;
  capitalGrowth: boolean;
  diversification: boolean;
  incomeSearch: boolean;
  transmission: boolean;
  taxOptimization: boolean;
  other: string;
  riskProfile: RiskProfile;
  pastLoss: PastLoss;
  reactionNoPriorLoss: string;
  reactionPriorLoss: string;
  reactionToGain: "hold" | "reinvest-less" | "reinvest-more" | "";
  horizon: Horizon;
  liquidityNeeded: boolean | null;
  maxLoss: MaxLoss;
  percentOfPatrimony: PatrimonyPct;
}

// ----- ESG / Sustainable Investments -----
export const ESG_IMPACT_FACTORS = [
  { id: "ghg", label: "Gaz à effet de serre" },
  { id: "biodiversity", label: "Niveau d'impact sur la biodiversité" },
  { id: "water_pollution", label: "Émissions polluantes dans l'eau" },
  { id: "hazardous_waste", label: "Génération des déchets dangereux" },
  { id: "real_estate_energy", label: "Inefficacité énergétique (immobilier)" },
  { id: "intl_norms", label: "Respect des normes internationales (OCDE, Nations unies)" },
  { id: "intl_norms_process", label: "Processus de contrôle des normes internationales" },
  { id: "pay_equality", label: "Égalité de rémunération (Homme/Femme)" },
  { id: "board_diversity", label: "Diversité des genres au sein des conseils d'administration" },
  { id: "controversial_weapons", label: "Exposition aux armes controversées" },
];

export interface ESGData {
  wantsESG: boolean | null;
  taxonomyPct: "5" | "25" | "50" | "none" | "";
  sustainablePct: "5" | "25" | "50" | "none" | "";
  impactFactors: boolean | null;
  negativeImpacts: string[];
}

// ----- Appointment -----
export interface AppointmentData {
  booked: boolean;
}

// ============================================================
// PERSONAL (PP) Types
// ============================================================
export interface Titulaire {
  civility: "M" | "Mme" | "";
  lastName: string;
  maidenName: string;
  firstName: string;
  birthDate: string;
  birthPlace: string;
  nationality: string;
  address: string;
  email: string;
  phone: string;
  legalProtection: boolean | null;
  legalProtectionForm: string;
  legalProtectionRep: string;
  fiscalResidence: "France" | "Other" | "";
  fiscalResidenceOther: string;
  profession: string;
  isRetired: boolean;
  retiredSince: string;
  formerProfession: string;
  isBusinessOwner: boolean;
  companyName: string;
  companyLegalForm: string;
  companySiege: string;
  isUSPerson: boolean | null;
}

export interface MaritalStatus {
  status: "married" | "pacs" | "divorced" | "widowed" | "single" | "freeUnion" | "";
  marriageDate: string;
  marriageContract: boolean | null;
  marriageRegime: string;
  pacsDate: string;
  pacsConvention: boolean | null;
  pacsRegime: string;
  divorceDate: string;
  donationToSpouse: boolean;
  donationSpouseDate: string;
  donationSpouseAmount: string;
  donationToChildren: boolean;
  donationChildrenDate: string;
  donationChildrenAmount: string;
  numberOfChildren: string;
  childrenAtCharge: string;
}

export type IncomeRange = "" | "<50k" | "50-100k" | "100-150k" | "150-500k" | ">500k";
export type PatrimonyRange = "" | "<100k" | "100-300k" | "300-500k" | "500k-1m" | "1-5m" | ">5m";

export interface PersonalFinancial {
  t1Income: IncomeRange;
  t2Income: IncomeRange;
  t1Patrimony: PatrimonyRange;
  t2Patrimony: PatrimonyRange;
  t1Commitments: string;
  t2Commitments: string;
  t1FinancialAssets: string;
  t1SavingsCapacity: string;
  t2FinancialAssets: string;
  t2SavingsCapacity: string;
  t1FinancialPct: string;
  t1RealEstatePct: string;
  t1ProfessionalPct: string;
  t1OtherPct: string;
  t2FinancialPct: string;
  t2RealEstatePct: string;
  t2ProfessionalPct: string;
  t2OtherPct: string;
  t1IR: boolean | null;
  t1IFI: boolean | null;
  t2IR: boolean | null;
  t2IFI: boolean | null;
  fundNature: "liquidities" | "financial_instruments" | "both" | "";
  amountToInvest: string;
  fundOrigins: string[];
  fundOriginOther: string;
  bankOrigin: string;
  additionalInfo: string;
}

export interface PersonalDocuments {
  idCard: boolean;
  spouseId: boolean;
  marriageContract: boolean;
  familyRecord: boolean;
  donationActs: boolean;
  testament: boolean;
  proofOfAddress: boolean;
  lastTaxReturn: boolean;
  lastIFIReturn: boolean;
  loanAmortization: boolean;
  payslips: boolean;
}

// ============================================================
// COMPANY (PM) Types
// ============================================================
export interface LegalRepresentative {
  lastName: string;
  firstName: string;
  function: string;
  phone: string;
  email: string;
  isPEP: boolean | null;
}

export type CompanySector =
  | "agriculture_peche"
  | "industrie_transport"
  | "batiment_immobilier"
  | "commerce_detail"
  | "commerce_art_luxe"
  | "assurance_banque_finance"
  | "energie_armement"
  | "administration_publique"
  | "negoce"
  | "restauration_jeux"
  | "professions_liberales"
  | "religion_associatif"
  | "autre";

export const SECTOR_LABELS: Record<CompanySector, string> = {
  agriculture_peche: "Agriculture, Pêche",
  industrie_transport: "Industrie, Transports",
  batiment_immobilier: "Bâtiment, Immobilier",
  commerce_detail: "Commerce de détail",
  commerce_art_luxe: "Commerce d'art, Produits de luxe",
  assurance_banque_finance: "Assurance, Banque, Finance",
  energie_armement: "Énergie, Armement, Marchés publics",
  administration_publique: "Administration publique, Enseignement",
  negoce: "Négoce (énergie, matières premières), Import/Export",
  restauration_jeux: "Restauration, Hébergement, Jeux, Spectacles",
  professions_liberales: "Professions libérales juridiques/médicales",
  religion_associatif: "Religion, Activité associative",
  autre: "Autre",
};

export interface CompanyIdentity {
  companyName: string;
  legalForm: string;
  address: string;
  country: string;
  rcs: string;
  sectors: CompanySector[];
  sectorOther: string;
  geoZone: "EU" | "Non-EU" | "Both" | "";
  geoZoneOther: string;
  isRegulated: boolean | null;
  regulator: string;
  isListed: boolean | null;
  markets: string;
  representative: LegalRepresentative;
  associate2: LegalRepresentative;
  hasUSPerson: boolean | null;
}

export interface CompanyFinancial {
  fiscalYearEnd: string;
  totalBalance: string;
  revenue: string;
  equity: string;
  financialCommitments: string;
  taxType: "IS" | "IR" | "";
  bankingSavings: string;
  bankingSavingsPct: string;
  financialSavings: string;
  financialSavingsPct: string;
  capitalizationContracts: string;
  capitalizationContractsPct: string;
  realEstate: string;
  realEstatePct: string;
  professional: string;
  professionalPct: string;
  otherDesc: string;
  otherAmount: string;
  otherPct: string;
  fundNature: "liquidities" | "financial_instruments" | "both" | "";
  amountToInvest: string;
  fundOrigins: string[];
  fundOriginOther: string;
  bankOrigin: string;
  fundingModality: "portfolio_transfer" | "check" | "wire" | "";
}

export interface CompanyDocuments {
  kbis: boolean;
  signatoryList: boolean;
  financialStatements: boolean;
  shareholdersList: boolean;
  uboList: boolean;
  statutes: boolean;
  representativeId: boolean;
  fundsOriginDeclaration: boolean;
}

// ============================================================
// Consents
// ============================================================
export interface Consents {
  answersAccurate: boolean;
  receivedInfo: boolean;
  amlConsent: boolean;
  gdprConsent: boolean;
}

// ============================================================
// Master form data
// ============================================================
export interface IATFormData {
  clientType: ClientType | null;

  // Personal
  titulaire1: Titulaire;
  hasTitulaire2: boolean;
  titulaire2: Titulaire;
  maritalStatus: MaritalStatus;
  personalFinancial: PersonalFinancial;
  personalDocuments: PersonalDocuments;

  // Company
  companyIdentity: CompanyIdentity;
  companyFinancial: CompanyFinancial;
  companyDocuments: CompanyDocuments;

  // Shared
  productKnowledge: ProductKnowledge;
  objectives: ObjectivesData;
  esg: ESGData;
  appointment: AppointmentData;
  consents: Consents;
}

// ============================================================
// Defaults
// ============================================================
const defaultTitulaire: Titulaire = {
  civility: "", lastName: "", maidenName: "", firstName: "",
  birthDate: "", birthPlace: "", nationality: "", address: "",
  email: "", phone: "",
  legalProtection: null, legalProtectionForm: "", legalProtectionRep: "",
  fiscalResidence: "", fiscalResidenceOther: "",
  profession: "", isRetired: false, retiredSince: "", formerProfession: "",
  isBusinessOwner: false, companyName: "", companyLegalForm: "", companySiege: "",
  isUSPerson: null,
};

const defaultLegalRep: LegalRepresentative = {
  lastName: "", firstName: "", function: "", phone: "", email: "", isPEP: null,
};

export const defaultFormData: IATFormData = {
  clientType: null,

  titulaire1: { ...defaultTitulaire },
  hasTitulaire2: false,
  titulaire2: { ...defaultTitulaire },
  maritalStatus: {
    status: "", marriageDate: "", marriageContract: null, marriageRegime: "",
    pacsDate: "", pacsConvention: null, pacsRegime: "", divorceDate: "",
    donationToSpouse: false, donationSpouseDate: "", donationSpouseAmount: "",
    donationToChildren: false, donationChildrenDate: "", donationChildrenAmount: "",
    numberOfChildren: "", childrenAtCharge: "",
  },
  personalFinancial: {
    t1Income: "", t2Income: "", t1Patrimony: "", t2Patrimony: "",
    t1Commitments: "", t2Commitments: "",
    t1FinancialAssets: "", t1SavingsCapacity: "",
    t2FinancialAssets: "", t2SavingsCapacity: "",
    t1FinancialPct: "", t1RealEstatePct: "", t1ProfessionalPct: "", t1OtherPct: "",
    t2FinancialPct: "", t2RealEstatePct: "", t2ProfessionalPct: "", t2OtherPct: "",
    t1IR: null, t1IFI: null, t2IR: null, t2IFI: null,
    fundNature: "", amountToInvest: "", fundOrigins: [], fundOriginOther: "",
    bankOrigin: "", additionalInfo: "",
  },
  personalDocuments: {
    idCard: false, spouseId: false, marriageContract: false, familyRecord: false,
    donationActs: false, testament: false, proofOfAddress: false,
    lastTaxReturn: false, lastIFIReturn: false, loanAmortization: false, payslips: false,
  },

  companyIdentity: {
    companyName: "", legalForm: "", address: "", country: "", rcs: "",
    sectors: [], sectorOther: "", geoZone: "", geoZoneOther: "",
    isRegulated: null, regulator: "", isListed: null, markets: "",
    representative: { ...defaultLegalRep },
    associate2: { ...defaultLegalRep },
    hasUSPerson: null,
  },
  companyFinancial: {
    fiscalYearEnd: "", totalBalance: "", revenue: "", equity: "",
    financialCommitments: "", taxType: "",
    bankingSavings: "", bankingSavingsPct: "",
    financialSavings: "", financialSavingsPct: "",
    capitalizationContracts: "", capitalizationContractsPct: "",
    realEstate: "", realEstatePct: "",
    professional: "", professionalPct: "",
    otherDesc: "", otherAmount: "", otherPct: "",
    fundNature: "", amountToInvest: "", fundOrigins: [], fundOriginOther: "",
    bankOrigin: "", fundingModality: "",
  },
  companyDocuments: {
    kbis: false, signatoryList: false, financialStatements: false,
    shareholdersList: false, uboList: false, statutes: false,
    representativeId: false, fundsOriginDeclaration: false,
  },

  productKnowledge: {
    monetary: { ...defaultProductEntry },
    bonds: { ...defaultProductEntry },
    stocks: { ...defaultProductEntry },
    scpi: { ...defaultProductEntry },
    privateEquity: { ...defaultProductEntry },
    etf: { ...defaultProductEntry },
    derivatives: { ...defaultProductEntry },
    structured: { ...defaultProductEntry },
    managedPortfolio: null, selfManaged: null, advisedPortfolio: null,
    financialSectorExp: null, readsPress: null, followsMarkets: null, checksMonthly: null,
  },

  objectives: {
    capitalPreservation: false, capitalGrowth: false, diversification: false,
    incomeSearch: false, transmission: false, taxOptimization: false, other: "",
    riskProfile: "", pastLoss: "", reactionNoPriorLoss: "", reactionPriorLoss: "",
    reactionToGain: "", horizon: "", liquidityNeeded: null, maxLoss: "",
    percentOfPatrimony: "",
  },

  esg: {
    wantsESG: null, taxonomyPct: "", sustainablePct: "",
    impactFactors: null, negativeImpacts: [],
  },

  appointment: { booked: false },

  consents: {
    answersAccurate: false, receivedInfo: false,
    amlConsent: false, gdprConsent: false,
  },
};

export const PP_STEP_LABELS = [
  "Votre identité",
  "Situation financière",
  "Documents",
  "Connaissance produits",
  "Objectifs & risque",
  "Investissements durables",
  "Rendez-vous",
  "Récapitulatif & Signature",
];

export const PM_STEP_LABELS = [
  "Identification société",
  "Situation financière",
  "Documents",
  "Connaissance produits",
  "Objectifs & risque",
  "Investissements durables",
  "Rendez-vous",
  "Récapitulatif & Signature",
];
