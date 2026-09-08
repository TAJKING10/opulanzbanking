// PDF Generation for QCC (Questionnaire de Connaissance du Client / Investor Suitability Profile)
// Uses jsPDF + pdf-lib with bilingual support (English & French) and Opulanz Banking branding

import type { IATFormData } from "./iat-types";
import { SECTOR_LABELS } from "./iat-types";

/**
 * Loads the official QCC template PDF (PP or PM) and returns
 * { base64, pageCount } ready for DocuSign.
 */
export async function loadTemplatePdf(
  clientType: "personal" | "company"
): Promise<{ base64: string; pageCount: number }> {
  const url =
    clientType === "personal"
      ? "/templates/qcc-pp.pdf"
      : "/templates/qcc-pm.pdf";

  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Failed to load template PDF: ${url}`);
  const arrayBuf = await resp.arrayBuffer();

  const { PDFDocument } = await import("pdf-lib");
  const pdfDoc = await PDFDocument.load(arrayBuf);
  const pageCount = pdfDoc.getPageCount();

  const bytes = new Uint8Array(arrayBuf);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  const base64 = btoa(binary);

  return { base64, pageCount };
}

const GOLD = [181, 147, 84] as const;
const DARK = [37, 38, 35] as const;
const GRAY = [130, 130, 130] as const;
const LIGHT_GRAY = [245, 245, 245] as const;

export const RISK_LABELS: Record<string, { en: string; fr: string }> = {
  A: { en: "Profile A — Conservative / Low Risk", fr: "Placement A — Risque faible" },
  B: { en: "Profile B — Balanced / Moderate Risk", fr: "Placement B — Risque moyen" },
  C: { en: "Profile C — Dynamic / High Risk", fr: "Placement C — Risque élevé" },
};

export const HORIZON_LABELS: Record<string, { en: string; fr: string }> = {
  "<1": { en: "Less than 1 year", fr: "Moins de 1 an" },
  "1-3": { en: "1 to 3 years", fr: "1 à 3 ans" },
  "3-5": { en: "3 to 5 years", fr: "3 à 5 ans" },
  ">5": { en: "More than 5 years", fr: "Plus de 5 ans" },
};

export const LOSS_LABELS: Record<string, { en: string; fr: string }> = {
  none: { en: "No capital loss acceptable", fr: "Aucune perte acceptable" },
  "10": { en: "Maximum 10%", fr: "Maximum 10 %" },
  "25": { en: "Maximum 25%", fr: "Maximum 25 %" },
  "50": { en: "Maximum 50%", fr: "Maximum 50 %" },
  "100": { en: "Up to 100%", fr: "Jusqu'à 100 %" },
};

export const PRODUCT_NAMES: Record<string, { en: string; fr: string }> = {
  monetary: { en: "Money Market / Guaranteed Capital Funds", fr: "Produits monétaires / Fonds euros" },
  bonds: { en: "Bonds & Fixed Income Instruments", fr: "Obligations et fonds obligataires" },
  stocks: { en: "Equities & Equity Funds", fr: "Actions et fonds actions" },
  scpi: { en: "Real Estate Funds (REITs / SCPI)", fr: "SCPI" },
  privateEquity: { en: "Private Equity (Venture Capital / Unlisted)", fr: "Private Equity (FCPI, FCPR, FIP)" },
  etf: { en: "Exchange-Traded Funds (ETFs / Trackers)", fr: "ETF / Trackers" },
  derivatives: { en: "Derivatives & Futures / Options", fr: "Produits dérivés" },
  structured: { en: "Structured Products & Capital-Protected Notes", fr: "Produits structurés" },
};

export async function generateQCCPdfDoc(
  formData: IATFormData,
  signedName?: string,
  locale: string = "en"
): Promise<{ base64: string; pageCount: number }> {
  const { default: jsPDF } = await import("jspdf");

  const isFr = locale === "fr";
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210;
  const MARGIN = 15;
  const CONTENT_W = W - MARGIN * 2;
  let y = 0;

  const today = new Date().toLocaleDateString(isFr ? "fr-FR" : "en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const isPersonal = formData.clientType === "personal";
  const clientName = isPersonal
    ? `${formData.titulaire1.firstName} ${formData.titulaire1.lastName}`.trim()
    : formData.companyIdentity.companyName || "—";

  function checkPage(neededHeight: number) {
    if (y + neededHeight > 275) {
      doc.addPage();
      y = 20;
    }
  }

  function header() {
    doc.setFillColor(...GOLD);
    doc.rect(0, 0, W, 28, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.text(
      isFr
        ? "QUESTIONNAIRE DE CONNAISSANCE DU CLIENT (QCC)"
        : "INVESTOR SUITABILITY & PROFILE QUESTIONNAIRE",
      MARGIN,
      12
    );

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(
      isPersonal
        ? isFr ? "Personne Physique (PP)" : "Natural Person (Individual)"
        : isFr ? "Personne Morale (PM)" : "Legal Entity (Company)",
      MARGIN,
      19
    );
    doc.text(`Opulanz Banking · ${today}`, W - MARGIN, 19, { align: "right" });

    const ref = `OPZ-${Date.now().toString().slice(-8)}`;
    doc.setFontSize(7);
    doc.setTextColor(220, 220, 220);
    doc.text(`${isFr ? "Référence" : "Reference"}: ${ref}`, W - MARGIN, 25, { align: "right" });

    y = 36;
  }

  function sectionTitle(title: string) {
    checkPage(14);
    doc.setFillColor(...DARK);
    doc.rect(MARGIN, y, CONTENT_W, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(title.toUpperCase(), MARGIN + 3, y + 5);
    y += 10;
  }

  function row(label: string, value: string | null | undefined | boolean, shade = false) {
    if (value === null || value === undefined || value === "") return;
    const strVal =
      typeof value === "boolean"
        ? value ? (isFr ? "Oui" : "Yes") : (isFr ? "Non" : "No")
        : String(value);

    checkPage(8);
    if (shade) {
      doc.setFillColor(...LIGHT_GRAY);
      doc.rect(MARGIN, y - 1, CONTENT_W, 7, "F");
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...GRAY);
    doc.text(label, MARGIN + 2, y + 4);
    doc.setTextColor(...DARK);
    doc.setFont("helvetica", "bold");

    const maxWidth = CONTENT_W / 2 - 4;
    const lines = doc.splitTextToSize(strVal, maxWidth);
    doc.text(lines, MARGIN + CONTENT_W / 2 + 2, y + 4);
    doc.setFont("helvetica", "normal");

    const lineHeight = Math.max(7, lines.length * 4.5);
    y += lineHeight;
  }

  function divider() {
    checkPage(4);
    doc.setDrawColor(...LIGHT_GRAY);
    doc.line(MARGIN, y, MARGIN + CONTENT_W, y);
    y += 3;
  }

  // Header & Warning
  header();

  doc.setFillColor(255, 248, 220);
  doc.setDrawColor(255, 193, 7);
  doc.roundedRect(MARGIN, y, CONTENT_W, 18, 2, 2, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(120, 80, 0);
  doc.text(isFr ? "MISE EN GARDE RÉGLEMENTAIRE (MiFID II)" : "REGULATORY NOTICE (MiFID II)", MARGIN + 3, y + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  const warningText = isFr
    ? "Ce questionnaire a été renseigné et signé électroniquement par le client. Les informations fournies sont nécessaires pour délivrer un conseil adapté conformément à la directive européenne MiFID II. Le défaut de réponse peut compromettre l'évaluation de l'adéquation des investissements."
    : "This questionnaire has been completed and signed electronically by the client. The information supplied is mandatory to provide tailored investment advice pursuant to EU Directive 2014/65/EU (MiFID II). Any missing or inaccurate response may impede our ability to assess the suitability of recommended financial instruments.";
  const warningLines = doc.splitTextToSize(warningText, CONTENT_W - 6);
  doc.text(warningLines, MARGIN + 3, y + 10);
  y += 22;

  // SECTION 1: IDENTITY
  if (isPersonal) {
    sectionTitle(isFr ? "I — Connaissance client / Personne physique" : "I — Client Identification & Civil Status");

    const t1 = formData.titulaire1;
    row(isFr ? "Civilité" : "Title / Civility", t1.civility, false);
    row(isFr ? "Nom" : "Last Name", t1.lastName, true);
    row(isFr ? "Prénom(s)" : "First Name", t1.firstName, false);
    row(isFr ? "Nom de jeune fille" : "Maiden Name", t1.maidenName || "—", true);
    row(isFr ? "Date de naissance" : "Date of Birth", t1.birthDate, false);
    row(isFr ? "Lieu de naissance" : "Place of Birth", t1.birthPlace, true);
    row(isFr ? "Nationalité" : "Nationality", t1.nationality, false);
    row(isFr ? "Adresse" : "Residential Address", t1.address, true);
    row(isFr ? "Email" : "Email", t1.email, false);
    row(isFr ? "Téléphone" : "Phone Number", t1.phone, true);
    row(isFr ? "Résidence fiscale" : "Tax Residency", t1.fiscalResidence === "Other" ? t1.fiscalResidenceOther : t1.fiscalResidence, false);
    row(isFr ? "US Person" : "US Person Status", t1.isUSPerson, true);
    row(isFr ? "Profession" : "Occupation / Profession", t1.profession || "—", false);
    row(isFr ? "Retraite / Chômage" : "Retired / Unemployed", t1.isRetired, true);

    if (formData.hasTitulaire2) {
      divider();
      const t2 = formData.titulaire2;
      row(isFr ? "TITULAIRE 2 — Nom" : "CO-HOLDER — Name", `${t2.civility} ${t2.firstName} ${t2.lastName}`.trim(), false);
      row(isFr ? "Email" : "Email", t2.email, true);
      row(isFr ? "Téléphone" : "Phone", t2.phone, false);
      row(isFr ? "Profession" : "Occupation", t2.profession || "—", true);
    }

    divider();
    const ms = formData.maritalStatus;
    row(isFr ? "Situation matrimoniale" : "Marital Status", ms.status, false);
    row(isFr ? "Nombre d'enfants" : "Number of Children", ms.numberOfChildren, true);
    row(isFr ? "Dont à charge fiscalement" : "Tax Dependents", ms.childrenAtCharge, false);
  } else {
    sectionTitle(isFr ? "I — Identification de la personne morale" : "I — Legal Entity Identification");

    const ci = formData.companyIdentity;
    row(isFr ? "Dénomination" : "Company Name", ci.companyName, false);
    row(isFr ? "Forme juridique" : "Legal Form", ci.legalForm, true);
    row(isFr ? "Adresse siège social" : "Registered Office Address", ci.address, false);
    row(isFr ? "Pays" : "Country of Incorporation", ci.country, true);
    row(isFr ? "N° d'identification (RCS)" : "Registration Number (RCS)", ci.rcs, false);
    row(isFr ? "Secteur(s) d'activité" : "Industry Sectors", ci.sectors.map((s) => SECTOR_LABELS[s]).join(", "), true);
    row(isFr ? "Zone géographique" : "Geographic Market", ci.geoZone, false);
    row(isFr ? "Activité réglementée" : "Regulated Entity", ci.isRegulated, true);
    if (ci.isRegulated) row(isFr ? "Régulateur" : "Supervisory Authority", ci.regulator, false);
    row(isFr ? "Société cotée" : "Publicly Listed", ci.isListed, true);
    if (ci.isListed) row(isFr ? "Marchés" : "Listing Markets", ci.markets, false);
    divider();
    const rep = ci.representative;
    row(isFr ? "Représentant légal" : "Legal Representative", `${rep.firstName} ${rep.lastName} — ${rep.function}`, false);
    row(isFr ? "Email représentant" : "Representative Email", rep.email, true);
    row(isFr ? "Tél représentant" : "Representative Phone", rep.phone, false);
    row(isFr ? "PPE — représentant" : "PEP Status (Politically Exposed)", rep.isPEP, true);
    row(isFr ? "Actionnaire US Person" : "US Shareholder Status", ci.hasUSPerson, false);
  }

  // SECTION 2: FINANCIAL
  checkPage(10);
  sectionTitle(isFr ? "II — Situation financière et patrimoniale" : "II — Financial Situation & Wealth");

  if (isPersonal) {
    const fin = formData.personalFinancial;
    row(isFr ? "Revenus annuels" : "Annual Income", fin.t1Income, false);
    row(isFr ? "Patrimoine estimé" : "Estimated Net Worth", fin.t1Patrimony, true);
    row(isFr ? "Engagements financiers" : "Financial Commitments / Debt", fin.t1Commitments ? `${fin.t1Commitments} % of income` : "—", false);
    row(isFr ? "Capacité d'épargne" : "Monthly Savings Capacity", fin.t1SavingsCapacity || "—", true);
    row(isFr ? "IR" : "Income Tax Bracket", fin.t1IR, false);
    row(isFr ? "IFI" : "Wealth Tax (IFI)", fin.t1IFI, true);
    if (formData.hasTitulaire2) {
      row(isFr ? "Revenus annuels (T2)" : "Annual Income (Co-holder)", fin.t2Income, false);
      row(isFr ? "Patrimoine estimé (T2)" : "Estimated Net Worth (Co-holder)", fin.t2Patrimony, true);
    }
    row(isFr ? "Montant à investir" : "Target Investment Amount", fin.amountToInvest, false);
    row(isFr ? "Nature des avoirs" : "Nature of Assets", fin.fundNature, true);
    row(isFr ? "Origine des fonds" : "Source of Wealth / Funds", fin.fundOrigins.join(", "), false);
    row(isFr ? "Banque d'origine" : "Originating Financial Institution", fin.bankOrigin, true);
  } else {
    const fin = formData.companyFinancial;
    row(isFr ? "Date clôture exercice" : "Fiscal Year End", fin.fiscalYearEnd, false);
    row(isFr ? "Total bilan" : "Balance Sheet Total", fin.totalBalance ? `${fin.totalBalance} €` : "—", true);
    row(isFr ? "CA net / Résultat net" : "Net Revenue / Turnover", fin.revenue ? `${fin.revenue} €` : "—", false);
    row(isFr ? "Capitaux propres" : "Shareholders Equity", fin.equity ? `${fin.equity} €` : "—", true);
    row(isFr ? "Engagements financiers" : "Debt Commitments", fin.financialCommitments ? `${fin.financialCommitments} %` : "—", false);
    row(isFr ? "Type d'imposition" : "Corporate Tax Regime", fin.taxType, true);
    row(isFr ? "Épargne bancaire" : "Cash & Bank Balances", fin.bankingSavings ? `${fin.bankingSavings} € (${fin.bankingSavingsPct} %)` : "—", false);
    row(isFr ? "Épargne financière" : "Marketable Securities", fin.financialSavings ? `${fin.financialSavings} € (${fin.financialSavingsPct} %)` : "—", true);
    row(isFr ? "Patrimoine immobilier" : "Real Estate Assets", fin.realEstate ? `${fin.realEstate} € (${fin.realEstatePct} %)` : "—", false);
    row(isFr ? "Montant à investir" : "Target Investment Amount", fin.amountToInvest, true);
    row(isFr ? "Nature des avoirs" : "Nature of Assets", fin.fundNature, false);
    row(isFr ? "Origine des fonds" : "Source of Wealth", fin.fundOrigins.join(", "), true);
    row(isFr ? "Modalité d'alimentation" : "Funding Modality", fin.fundingModality, false);
    row(isFr ? "Banque d'origine" : "Originating Financial Institution", fin.bankOrigin, true);
  }

  // SECTION 3: PRODUCT KNOWLEDGE
  checkPage(10);
  sectionTitle(isFr ? "III — Connaissance et expérience des produits financiers" : "III — Investment Knowledge & Financial Instruments");

  const pk = formData.productKnowledge;
  let shade = false;
  for (const [key, names] of Object.entries(PRODUCT_NAMES)) {
    const entry = (pk as unknown as Record<string, unknown>)[key] as {
      held: boolean | null;
      holdingPeriod: string;
      opsPerYear: string;
      volume: string;
    };
    if (!entry) continue;
    const label = isFr ? names.fr : names.en;
    const value =
      entry.held === null
        ? (isFr ? "Non renseigné" : "Not specified")
        : entry.held
        ? (isFr ? `Détenu · ${entry.holdingPeriod} · ${entry.opsPerYear} op/an · ${entry.volume}` : `Held · ${entry.holdingPeriod} · ${entry.opsPerYear} ops/yr · ${entry.volume}`)
        : (isFr ? "Non détenu" : "Not held");
    row(label, value, shade);
    shade = !shade;
  }
  divider();
  row(isFr ? "Portefeuille sous mandat" : "Discretionary Mandate Experience", pk.managedPortfolio, false);
  row(isFr ? "Gestion en direct" : "Self-Directed Trading Experience", pk.selfManaged, true);
  row(isFr ? "Portefeuille conseillé" : "Advisory Mandate Experience", pk.advisedPortfolio, false);
  row(isFr ? "Expérience secteur financier" : "Professional Financial Sector Experience", pk.financialSectorExp, true);

  // SECTION 4: OBJECTIVES & RISK
  checkPage(10);
  sectionTitle(isFr ? "IV — Objectifs, horizon et tolérance au risque" : "IV — Investment Objectives & Risk Profile");

  const obj = formData.objectives;
  const objectivesList = [
    obj.capitalPreservation && (isFr ? "Préservation du capital" : "Capital Preservation"),
    obj.capitalGrowth && (isFr ? "Valorisation du capital" : "Capital Growth"),
    obj.diversification && (isFr ? "Diversification des actifs" : "Asset Diversification"),
    obj.incomeSearch && (isFr ? "Recherche de revenus" : "Regular Income"),
    obj.transmission && (isFr ? "Transmission" : "Estate Planning / Wealth Transfer"),
    obj.taxOptimization && (isFr ? "Optimisation fiscale" : "Tax Optimization"),
    obj.other,
  ].filter(Boolean).join(", ");

  row(isFr ? "Objectifs d'investissement" : "Investment Objectives", objectivesList || "—", false);
  row(isFr ? "Profil de risque" : "Risk Profile", obj.riskProfile ? (isFr ? RISK_LABELS[obj.riskProfile]?.fr : RISK_LABELS[obj.riskProfile]?.en) : "—", true);
  row(isFr ? "Perte en capital passée" : "Past Market Experience (Drop)", obj.pastLoss || (isFr ? "Non renseigné" : "Not specified"), false);
  row(isFr ? "Horizon d'investissement" : "Investment Horizon", obj.horizon ? (isFr ? HORIZON_LABELS[obj.horizon]?.fr : HORIZON_LABELS[obj.horizon]?.en) : "—", true);
  row(isFr ? "Liquidité importante" : "Immediate Liquidity Needed", obj.liquidityNeeded, false);
  row(isFr ? "Perte maximale acceptable" : "Maximum Tolerable Loss", obj.maxLoss ? (isFr ? LOSS_LABELS[obj.maxLoss]?.fr : LOSS_LABELS[obj.maxLoss]?.en) : "—", true);
  row(isFr ? "% du patrimoine à investir" : "% of Net Worth to Invest", obj.percentOfPatrimony || "—", false);

  // SECTION 5: ESG
  checkPage(10);
  sectionTitle(isFr ? "V — Préférences en matière d'investissements durables" : "V — Sustainability Preferences (ESG / SFDR)");

  const esg = formData.esg;
  row(isFr ? "Intégration de critères durabilité" : "Consider Sustainability (ESG)", esg.wantsESG, false);
  if (esg.wantsESG) {
    row(isFr ? "% Taxonomie UE" : "EU Taxonomy Alignment Target", esg.taxonomyPct ? `≥ ${esg.taxonomyPct} %` : (isFr ? "Aucun" : "None"), true);
    row(isFr ? "% Investissements durables" : "Sustainable Investment Allocation Target", esg.sustainablePct ? `≥ ${esg.sustainablePct} %` : (isFr ? "Aucun" : "None"), false);
    row(isFr ? "Facteurs d'impact" : "Impact Factors (E, S, G)", esg.impactFactors, true);
    if (esg.negativeImpacts.length > 0) {
      row(isFr ? "Incidences négatives à minimiser" : "Principal Adverse Impacts (PAI) to Minimize", esg.negativeImpacts.join(", "), false);
    }
  }

  // SECTION 6: CONSULTATION
  checkPage(10);
  sectionTitle(isFr ? "VI — Rendez-vous de consultation" : "VI — Consultation Appointment");
  row(isFr ? "Consultation réservée" : "Consultation Slot Confirmed", formData.appointment.booked, false);

  // SECTION 7: SIGNATURE
  checkPage(45);
  sectionTitle(isFr ? "VII — Signature et déclarations du client" : "VII — Client Declarations & Electronic Signature");

  y += 2;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...DARK);

  const declarations = isFr
    ? [
        "Le client déclare que les réponses à ce questionnaire sont exactes et sincères, qu'elles correspondent à sa situation actuelle.",
        "Le client s'engage à informer Opulanz Banking de toute modification significative de sa situation patrimoniale ou personnelle.",
        "Le client déclare avoir reçu le document d'information préalable présentant les services d'Opulanz Banking.",
        "Le client est informé que ces données sont traitées dans le respect des obligations légales de lutte contre le blanchiment (LCB-FT).",
        "Le client a pris connaissance de la politique RGPD et consent au traitement de ses données personnelles.",
      ]
    : [
        "The client certifies that the information supplied in this questionnaire is complete, sincere, and accurately reflects their current financial and personal situation.",
        "The client agrees to promptly notify Opulanz Banking of any material alteration to their financial condition, objectives, or risk tolerance.",
        "The client acknowledges receipt of the pre-contractual informational disclosure regarding Opulanz Banking and its advisory mandates.",
        "The client is informed that this information is recorded to satisfy statutory Anti-Money Laundering and Counter-Financing of Terrorism (AML/CFT) obligations.",
        "The client has reviewed and accepted the GDPR Privacy Policy and freely consents to the processing of personal data for regulatory and advisory purposes.",
      ];

  for (const decl of declarations) {
    checkPage(8);
    const lines = doc.splitTextToSize(`✓  ${decl}`, CONTENT_W - 4);
    doc.text(lines, MARGIN + 2, y);
    y += lines.length * 4.5 + 2;
  }

  y += 6;
  checkPage(40);

  // Signature box
  const sigBoxH = 38;
  const sigName = signedName || clientName;
  const signedAt = new Date().toLocaleString(isFr ? "fr-FR" : "en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Client signature area
  doc.setFillColor(...LIGHT_GRAY);
  doc.rect(MARGIN, y, CONTENT_W / 2 - 5, sigBoxH, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...DARK);
  doc.text(isFr ? "Signature du client" : "Client Signature", MARGIN + 3, y + 5);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7);
  doc.setTextColor(...GRAY);
  doc.text(isFr ? "Lu et approuvé —" : "Read and approved / Lu et approuvé —", MARGIN + 3, y + 10);

  doc.setFont("helvetica", "bolditalic");
  doc.setFontSize(16);
  doc.setTextColor(...DARK);
  doc.text(sigName, MARGIN + 3, y + 22);

  const nameWidth = doc.getTextWidth(sigName);
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.5);
  doc.line(MARGIN + 3, y + 24, MARGIN + 3 + Math.min(nameWidth, CONTENT_W / 2 - 12), y + 24);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...GRAY);
  doc.text(
    isFr ? `Signé électroniquement le : ${signedAt}` : `Signed electronically on: ${signedAt}`,
    MARGIN + 3,
    y + 30
  );
  doc.setFontSize(6.5);
  doc.text(
    isFr ? "Signature électronique via DocuSign — Identité vérifiée" : "Electronic Signature via DocuSign — Verified Identity",
    MARGIN + 3,
    y + 35
  );

  // Advisor box
  doc.setFillColor(...LIGHT_GRAY);
  doc.rect(MARGIN + CONTENT_W / 2 + 5, y, CONTENT_W / 2 - 5, sigBoxH, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...DARK);
  doc.text(isFr ? "Votre conseiller" : "Investment Advisory Desk", MARGIN + CONTENT_W / 2 + 8, y + 5);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7);
  doc.setTextColor(...GRAY);
  doc.text("Opulanz Banking", MARGIN + CONTENT_W / 2 + 8, y + 15);
  doc.text(isFr ? "Conseil en Investissement" : "Wealth & Investment Advisory", MARGIN + CONTENT_W / 2 + 8, y + 21);

  y += sigBoxH + 4;

  // Footer for each page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(...DARK);
    doc.rect(0, 290, W, 10, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(200, 200, 200);
    doc.text(
      isFr
        ? "Opulanz Banking · Questionnaire de Connaissance du Client (QCC) · Document confidentiel"
        : "Opulanz Banking · Investor Suitability & Profile (MiFID II) · Confidential Document",
      MARGIN,
      295
    );
    doc.text(`${isFr ? "Page" : "Page"} ${i} / ${pageCount}`, W - MARGIN, 295, { align: "right" });
  }

  const base64 = doc.output("datauristring").split(",")[1];
  return { base64, pageCount };
}

export async function generateQCCPdf(
  formData: IATFormData,
  signedName?: string,
  locale: string = "en"
): Promise<string> {
  const { base64 } = await generateQCCPdfDoc(formData, signedName, locale);
  return base64;
}

export function buildFormSummary(formData: IATFormData, locale: string = "en"): string {
  const isFr = locale === "fr";
  const isPersonal = formData.clientType === "personal";
  const today = new Date().toLocaleDateString(isFr ? "fr-FR" : "en-US");
  const clientName = isPersonal
    ? `${formData.titulaire1.firstName} ${formData.titulaire1.lastName}`.trim()
    : formData.companyIdentity.companyName;

  const lines: string[] = [
    isFr
      ? `=== QUESTIONNAIRE QCC — ${isPersonal ? "Personne Physique" : "Personne Morale"} ===`
      : `=== INVESTOR PROFILE — ${isPersonal ? "Individual" : "Corporate"} ===`,
    `Client : ${clientName}`,
    `Date : ${today}`,
    "",
    isFr ? "--- IDENTITÉ ---" : "--- IDENTITY ---",
  ];

  if (isPersonal) {
    const t1 = formData.titulaire1;
    lines.push(`Name : ${t1.civility} ${t1.firstName} ${t1.lastName}`);
    lines.push(`Email : ${t1.email} | Phone : ${t1.phone}`);
    lines.push(`Nationality : ${t1.nationality} | Birth : ${t1.birthDate}`);
    lines.push(`Tax Residency : ${t1.fiscalResidence}`);
    lines.push(`US Person : ${t1.isUSPerson === null ? "N/A" : t1.isUSPerson ? "Yes" : "No"}`);
    lines.push(`Marital Status : ${formData.maritalStatus.status}`);
    lines.push(`Annual Income : ${formData.personalFinancial.t1Income}`);
    lines.push(`Amount to Invest : ${formData.personalFinancial.amountToInvest}`);
  } else {
    const ci = formData.companyIdentity;
    lines.push(`Company : ${ci.companyName} (${ci.legalForm})`);
    lines.push(`Registration : ${ci.rcs} | Country : ${ci.country}`);
    lines.push(`Representative : ${ci.representative.firstName} ${ci.representative.lastName}`);
    lines.push(`Email : ${ci.representative.email}`);
    lines.push(`Amount to Invest : ${formData.companyFinancial.amountToInvest}`);
  }

  lines.push("");
  lines.push(isFr ? "--- PROFIL DE RISQUE ---" : "--- RISK PROFILE ---");
  lines.push(`Risk Profile : ${formData.objectives.riskProfile ? (isFr ? RISK_LABELS[formData.objectives.riskProfile]?.fr : RISK_LABELS[formData.objectives.riskProfile]?.en) : "—"}`);
  lines.push(`Horizon : ${formData.objectives.horizon ? (isFr ? HORIZON_LABELS[formData.objectives.horizon]?.fr : HORIZON_LABELS[formData.objectives.horizon]?.en) : "—"}`);
  lines.push(`Max Loss : ${formData.objectives.maxLoss ? (isFr ? LOSS_LABELS[formData.objectives.maxLoss]?.fr : LOSS_LABELS[formData.objectives.maxLoss]?.en) : "—"}`);

  lines.push("");
  lines.push(isFr ? "--- INVESTISSEMENTS DURABLES ---" : "--- SUSTAINABLE INVESTING (ESG) ---");
  lines.push(`ESG Preferences : ${formData.esg.wantsESG === null ? "N/A" : formData.esg.wantsESG ? "Yes" : "No"}`);

  lines.push("");
  lines.push(isFr ? "--- RENDEZ-VOUS ---" : "--- CONSULTATION ---");
  lines.push(`Booking Confirmed : ${formData.appointment.booked ? "Yes" : "No"}`);

  return lines.join("\n");
}
