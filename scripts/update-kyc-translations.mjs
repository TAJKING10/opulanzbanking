import { readFileSync, writeFileSync } from 'fs';

const en = JSON.parse(readFileSync('messages/en.json', 'utf8'));
const fr = JSON.parse(readFileSync('messages/fr.json', 'utf8'));

// Add missing keys to investmentAdvisory.review
Object.assign(en.investmentAdvisory.review, {
  completeSectionTitle: "Complete Application Details",
  clientTypeLabel: "Client Type",
  emailLabel: "Email",
  mobileLabel: "Mobile",
  preferredLanguageLabel: "Preferred Language",
  fullNameLabel: "Full Name",
  statusLabel: "Status",
  employerLabel: "Employer",
  positionLabel: "Position",
  additionalDetails: "Additional Details:",
  individualType: "Individual",
  companyType: "Company",
  grantedLabel: "Granted",
  notGrantedLabel: "Not granted",
  dataProcessingConsentLabel: "Data Processing Consent",
  kycComplianceLabel: "KYC/AML Compliance",
  electronicSignatureLabel: "Electronic Signature",
  marketingLabel: "Marketing Communications",
  errorTitle: "Submission Failed",
  submittingTitle: "Submitting Application...",
  submittingDescription: "Generating documents and preparing signature request",
  companyIdentitySection: "Company Identity",
  registeredAddressSection: "Registered Address",
  legalRepresentativeSection: "Legal Representative",
  uboSection: "Ultimate Beneficial Owner (UBO)",
  fatcaCrsSection: "FATCA & CRS",
  usPersonLabel: "US Person",
  taxResidentCountriesLabel: "Tax Resident Countries",
  financialInfoSection: "Financial Information",
  investmentProfileSection: "Investment Profile",
  serviceDetailsSection: "Service Details",
  consentsSection: "Consents & Authorizations",
  yesLabel: "Yes",
  noLabel: "No",
  annualRevenueLabel: "Annual Revenue",
  sourceOfRevenueLabel: "Source of Revenue",
  uboNameLabel: "UBO Name",
  ownershipLabel: "Ownership %",
  serviceTypeLabel: "Service Type",
  investmentExperienceLabel: "Investment Experience",
  riskToleranceLabel: "Risk Tolerance",
  investmentHorizonLabel: "Investment Horizon",
  investmentObjectiveLabel: "Investment Objective",
  expectedReturnLabel: "Expected Annual Return",
  maxLossLabel: "Max Acceptable Loss",
  initialInvestmentLabel: "Initial Investment",
  processingLabel: "Processing..."
});

Object.assign(fr.investmentAdvisory.review, {
  completeSectionTitle: "Détails complets de la demande",
  clientTypeLabel: "Type de client",
  emailLabel: "E-mail",
  mobileLabel: "Téléphone mobile",
  preferredLanguageLabel: "Langue préférée",
  fullNameLabel: "Nom complet",
  statusLabel: "Statut",
  employerLabel: "Employeur",
  positionLabel: "Poste",
  additionalDetails: "Détails supplémentaires :",
  individualType: "Particulier",
  companyType: "Entreprise",
  grantedLabel: "Accordé",
  notGrantedLabel: "Non accordé",
  dataProcessingConsentLabel: "Consentement au traitement des données",
  kycComplianceLabel: "Conformité KYC/LBC",
  electronicSignatureLabel: "Signature électronique",
  marketingLabel: "Communications marketing",
  errorTitle: "Échec de la soumission",
  submittingTitle: "Soumission de la demande...",
  submittingDescription: "Génération des documents et préparation de la demande de signature",
  companyIdentitySection: "Identité de l'entreprise",
  registeredAddressSection: "Adresse enregistrée",
  legalRepresentativeSection: "Représentant légal",
  uboSection: "Bénéficiaire effectif (UBO)",
  fatcaCrsSection: "FATCA et CRS",
  usPersonLabel: "Personne américaine",
  taxResidentCountriesLabel: "Pays de résidence fiscale",
  financialInfoSection: "Informations financières",
  investmentProfileSection: "Profil d'investissement",
  serviceDetailsSection: "Détails du service",
  consentsSection: "Consentements et autorisations",
  yesLabel: "Oui",
  noLabel: "Non",
  annualRevenueLabel: "Chiffre d'affaires annuel",
  sourceOfRevenueLabel: "Source des revenus",
  uboNameLabel: "Nom de l'UBO",
  ownershipLabel: "Participation %",
  serviceTypeLabel: "Type de service",
  investmentExperienceLabel: "Expérience d'investissement",
  riskToleranceLabel: "Tolérance au risque",
  investmentHorizonLabel: "Horizon d'investissement",
  investmentObjectiveLabel: "Objectif d'investissement",
  expectedReturnLabel: "Rendement annuel attendu",
  maxLossLabel: "Perte maximale acceptable",
  initialInvestmentLabel: "Investissement initial",
  processingLabel: "En cours..."
});

// Add missing keys to investmentAdvisory.success
Object.assign(en.investmentAdvisory.success, {
  nextSteps: {
    title: "What Happens Next?",
    step1: { title: "Document Generation", description: "We'll automatically generate your regulatory documents (Lettre de mission, Déclaration d'adéquation, etc.)" },
    step2: { title: "Compliance Review", description: "Our team will review your application within 2-3 business days" },
    step3: { title: "DocuSign Signature", description: "You'll receive an email with documents to sign electronically via DocuSign" },
    step4: { title: "Account Activation", description: "Once signed, your investment account will be activated" }
  },
  reference: {
    title: "Application Reference",
    processing: "Processing...",
    envelopeId: "DocuSign Envelope ID:",
    checkEmail: "📧 Check your email for the signature request"
  },
  contactSupport: "Questions? Contact us at support@opulanz.com"
});

Object.assign(fr.investmentAdvisory.success, {
  nextSteps: {
    title: "Et maintenant ?",
    step1: { title: "Génération de documents", description: "Nous générerons automatiquement vos documents réglementaires (Lettre de mission, Déclaration d'adéquation, etc.)" },
    step2: { title: "Révision de conformité", description: "Notre équipe examinera votre demande dans les 2-3 jours ouvrables" },
    step3: { title: "Signature DocuSign", description: "Vous recevrez un e-mail avec les documents à signer électroniquement via DocuSign" },
    step4: { title: "Activation du compte", description: "Une fois signé, votre compte d'investissement sera activé" }
  },
  reference: {
    title: "Référence de la demande",
    processing: "En cours...",
    envelopeId: "ID d'enveloppe DocuSign :",
    checkEmail: "📧 Vérifiez votre e-mail pour la demande de signature"
  },
  contactSupport: "Des questions ? Contactez-nous à support@opulanz.com"
});

writeFileSync('messages/en.json', JSON.stringify(en, null, 2), 'utf8');
writeFileSync('messages/fr.json', JSON.stringify(fr, null, 2), 'utf8');
console.log('Done!');
