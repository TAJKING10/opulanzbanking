import { readFileSync, writeFileSync } from 'fs';

const en = JSON.parse(readFileSync('messages/en.json', 'utf8'));
const fr = JSON.parse(readFileSync('messages/fr.json', 'utf8'));

// Add missing keys to investmentAdvisory.individual
const enInd = en.investmentAdvisory.individual;
const frInd = fr.investmentAdvisory.individual;

enInd.subtitle = "Please provide all required information below. All sections must be completed.";
frInd.subtitle = "Veuillez fournir toutes les informations requises ci-dessous. Toutes les sections doivent être complétées.";

enInd.sectionTitles = {
  identity: "1. Personal Identity",
  family: "2. Family Situation",
  financial: "3. Financial Situation",
  origin: "4. Origin of Funds",
  investment: "5. Investment Profile",
  mission: "6. Service Type & Initial Investment",
  consents: "7. Consents & Authorizations"
};
frInd.sectionTitles = {
  identity: "1. Identité personnelle",
  family: "2. Situation familiale",
  financial: "3. Situation financière",
  origin: "4. Origine des fonds",
  investment: "5. Profil d'investissement",
  mission: "6. Type de service et investissement initial",
  consents: "7. Consentements et autorisations"
};

// Add income source options
enInd.options.incomeSource = {
  select: "Select source",
  salary: "Salary",
  business: "Business Income",
  investments: "Investment Income",
  pension: "Pension",
  inheritance: "Inheritance",
  other: "Other"
};
frInd.options.incomeSource = {
  select: "Sélectionner la source",
  salary: "Salaire",
  business: "Revenus d'entreprise",
  investments: "Revenus d'investissement",
  pension: "Retraite",
  inheritance: "Héritage",
  other: "Autre"
};

// Add missing origin of funds options
Object.assign(enInd.options.originOfFunds, {
  select: "Select origin",
  saleOfAssets: "Sale of Assets",
  businessIncome: "Business Income",
  investmentReturns: "Investment Returns"
});
Object.assign(frInd.options.originOfFunds, {
  select: "Sélectionner l'origine",
  saleOfAssets: "Vente d'actifs",
  businessIncome: "Revenus d'activité",
  investmentReturns: "Rendements d'investissement"
});

// Add select placeholders to existing option groups
enInd.options.professionalStatus.select = "Select status";
frInd.options.professionalStatus.select = "Sélectionner le statut";

enInd.options.investmentHorizon.select = "Select horizon";
frInd.options.investmentHorizon.select = "Sélectionner l'horizon";

enInd.options.investmentObjective.select = "Select objective";
frInd.options.investmentObjective.select = "Sélectionner l'objectif";

// Add helper texts
enInd.helpers = {
  placeOfBirthHint: "City, Country",
  sectorHint: "e.g., Technology, Finance, Healthcare",
  originDetailsHint: "Provide additional context about the origin of your investment funds",
  advisoryDescription: "We provide recommendations, you make the final decisions",
  managementDescription: "We manage your portfolio with discretionary authority",
  minimumInvestment: "Minimum: €10,000"
};
frInd.helpers = {
  placeOfBirthHint: "Ville, Pays",
  sectorHint: "ex. : Technologie, Finance, Santé",
  originDetailsHint: "Fournissez un contexte supplémentaire sur l'origine de vos fonds d'investissement",
  advisoryDescription: "Nous fournissons des recommandations, vous prenez les décisions finales",
  managementDescription: "Nous gérons votre portefeuille avec autorité discrétionnaire",
  minimumInvestment: "Minimum : 10 000 €"
};

enInd.continueToReview = "Continue to Review";
frInd.continueToReview = "Continuer vers la révision";

writeFileSync('messages/en.json', JSON.stringify(en, null, 2), 'utf8');
writeFileSync('messages/fr.json', JSON.stringify(fr, null, 2), 'utf8');
console.log('Done!');
