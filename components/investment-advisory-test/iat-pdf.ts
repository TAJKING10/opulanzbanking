// PDF Generation for QCC (Questionnaire de Connaissance du Client)
// Uses jsPDF (already installed as dependency) + pdf-lib for template loading
import type { IATFormData } from "./iat-types";

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

  // Get page count via pdf-lib
  const { PDFDocument } = await import("pdf-lib");
  const pdfDoc = await PDFDocument.load(arrayBuf);
  const pageCount = pdfDoc.getPageCount();

  // Convert to base64
  const bytes = new Uint8Array(arrayBuf);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  const base64 = btoa(binary);

  return { base64, pageCount };
}
import { SECTOR_LABELS } from "./iat-types";

const GOLD = [181, 147, 84] as const;
const DARK = [37, 38, 35] as const;
const GRAY = [130, 130, 130] as const;
const LIGHT_GRAY = [245, 245, 245] as const;

const RISK_LABELS: Record<string, string> = {
  A: "Placement A — Risque faible",
  B: "Placement B — Risque moyen",
  C: "Placement C — Risque élevé",
};

const HORIZON_LABELS: Record<string, string> = {
  "<1": "Moins de 1 an",
  "1-3": "1 à 3 ans",
  "3-5": "3 à 5 ans",
  ">5": "Plus de 5 ans",
};

const LOSS_LABELS: Record<string, string> = {
  none: "Aucune perte acceptable",
  "10": "Maximum 10 %",
  "25": "Maximum 25 %",
  "50": "Maximum 50 %",
  "100": "Jusqu'à 100 %",
};

const PRODUCT_NAMES: Record<string, string> = {
  monetary: "Produits monétaires / Fonds euros",
  bonds: "Obligations et fonds obligataires",
  stocks: "Actions et fonds actions",
  scpi: "SCPI",
  privateEquity: "Private Equity (FCPI, FCPR, FIP)",
  etf: "ETF / Trackers",
  derivatives: "Produits dérivés",
  structured: "Produits structurés",
};

export async function generateQCCPdf(formData: IATFormData, signedName?: string): Promise<string> {
  const { default: jsPDF } = await import("jspdf");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210;
  const MARGIN = 15;
  const CONTENT_W = W - MARGIN * 2;
  let y = 0;

  const today = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit", month: "long", year: "numeric",
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
    // Gold header bar
    doc.setFillColor(...GOLD);
    doc.rect(0, 0, W, 28, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text("QUESTIONNAIRE DE CONNAISSANCE DU CLIENT", MARGIN, 12);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(
      isPersonal ? "Personne Physique (PP)" : "Personne Morale (PM)",
      MARGIN,
      19
    );
    doc.text(`Advensys Insurance Finance · ${today}`, W - MARGIN, 19, { align: "right" });

    // Ref
    const ref = `REF-${Date.now().toString().slice(-8)}`;
    doc.setFontSize(7);
    doc.setTextColor(220, 220, 220);
    doc.text(`Référence : ${ref}`, W - MARGIN, 25, { align: "right" });

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
    const strVal = typeof value === "boolean" ? (value ? "Oui" : "Non") : String(value);

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

    // Wrap long values
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

  // ==================== COVER / HEADER ====================
  header();

  // Warning box
  doc.setFillColor(255, 248, 220);
  doc.setDrawColor(255, 193, 7);
  doc.roundedRect(MARGIN, y, CONTENT_W, 18, 2, 2, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(120, 80, 0);
  doc.text("MISE EN GARDE", MARGIN + 3, y + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  const warningText = "Ce questionnaire a été renseigné et signé par le client. Les informations fournies sont nécessaires pour délivrer un conseil adapté conformément à la réglementation MiFID II / DDA. Le défaut de réponse peut avoir des conséquences sur la réalisation conforme des missions du cabinet.";
  const warningLines = doc.splitTextToSize(warningText, CONTENT_W - 6);
  doc.text(warningLines, MARGIN + 3, y + 10);
  y += 22;

  // ==================== SECTION 1: IDENTITY ====================
  if (isPersonal) {
    sectionTitle("I — Connaissance client / Personne physique");

    const t1 = formData.titulaire1;
    row("Civilité", t1.civility, false);
    row("Nom", t1.lastName, true);
    row("Prénom(s)", t1.firstName, false);
    row("Nom de jeune fille", t1.maidenName || "—", true);
    row("Date de naissance", t1.birthDate, false);
    row("Lieu de naissance", t1.birthPlace, true);
    row("Nationalité", t1.nationality, false);
    row("Adresse", t1.address, true);
    row("Email", t1.email, false);
    row("Téléphone", t1.phone, true);
    row("Résidence fiscale", t1.fiscalResidence === "Other" ? t1.fiscalResidenceOther : t1.fiscalResidence, false);
    row("US Person", t1.isUSPerson, true);
    row("Profession", t1.profession || "—", false);
    row("Retraite / Chômage", t1.isRetired, true);

    if (formData.hasTitulaire2) {
      divider();
      const t2 = formData.titulaire2;
      row("TITULAIRE 2 — Nom", `${t2.civility} ${t2.firstName} ${t2.lastName}`.trim(), false);
      row("Email", t2.email, true);
      row("Téléphone", t2.phone, false);
      row("Profession", t2.profession || "—", true);
    }

    divider();
    const ms = formData.maritalStatus;
    row("Situation matrimoniale", ms.status, false);
    row("Nombre d'enfants", ms.numberOfChildren, true);
    row("Dont à charge fiscalement", ms.childrenAtCharge, false);
  } else {
    sectionTitle("I — Identification de la personne morale");

    const ci = formData.companyIdentity;
    row("Dénomination", ci.companyName, false);
    row("Forme juridique", ci.legalForm, true);
    row("Adresse siège social", ci.address, false);
    row("Pays", ci.country, true);
    row("N° d'identification (RCS)", ci.rcs, false);
    row("Secteur(s) d'activité", ci.sectors.map((s) => SECTOR_LABELS[s]).join(", "), true);
    row("Zone géographique", ci.geoZone, false);
    row("Activité réglementée", ci.isRegulated, true);
    if (ci.isRegulated) row("Régulateur", ci.regulator, false);
    row("Société cotée", ci.isListed, true);
    if (ci.isListed) row("Marchés", ci.markets, false);
    divider();
    const rep = ci.representative;
    row("Représentant légal", `${rep.firstName} ${rep.lastName} — ${rep.function}`, false);
    row("Email représentant", rep.email, true);
    row("Tél représentant", rep.phone, false);
    row("PPE — représentant", rep.isPEP, true);
    row("Actionnaire US Person", ci.hasUSPerson, false);
  }

  // ==================== SECTION 2: FINANCIAL ====================
  checkPage(10);
  sectionTitle("II — Situation financière et patrimoniale");

  if (isPersonal) {
    const fin = formData.personalFinancial;
    row("Revenus annuels (T1)", fin.t1Income, false);
    row("Patrimoine estimé (T1)", fin.t1Patrimony, true);
    row("Engagements financiers (T1)", fin.t1Commitments ? fin.t1Commitments + " % des revenus" : "—", false);
    row("Capacité d'épargne (T1)", fin.t1SavingsCapacity || "—", true);
    row("IR (T1)", fin.t1IR, false);
    row("IFI (T1)", fin.t1IFI, true);
    if (formData.hasTitulaire2) {
      row("Revenus annuels (T2)", fin.t2Income, false);
      row("Patrimoine estimé (T2)", fin.t2Patrimony, true);
    }
    row("Montant à investir", fin.amountToInvest, false);
    row("Nature des avoirs", fin.fundNature, true);
    row("Origine des fonds", fin.fundOrigins.join(", "), false);
    row("Banque d'origine", fin.bankOrigin, true);
  } else {
    const fin = formData.companyFinancial;
    row("Date clôture exercice", fin.fiscalYearEnd, false);
    row("Total bilan", fin.totalBalance ? fin.totalBalance + " €" : "—", true);
    row("CA net / Résultat net", fin.revenue ? fin.revenue + " €" : "—", false);
    row("Capitaux propres", fin.equity ? fin.equity + " €" : "—", true);
    row("Engagements financiers", fin.financialCommitments ? fin.financialCommitments + " % des revenus" : "—", false);
    row("Type d'imposition", fin.taxType, true);
    row("Épargne bancaire", fin.bankingSavings ? `${fin.bankingSavings} € (${fin.bankingSavingsPct} %)` : "—", false);
    row("Épargne financière", fin.financialSavings ? `${fin.financialSavings} € (${fin.financialSavingsPct} %)` : "—", true);
    row("Patrimoine immobilier", fin.realEstate ? `${fin.realEstate} € (${fin.realEstatePct} %)` : "—", false);
    row("Montant à investir", fin.amountToInvest, true);
    row("Nature des avoirs", fin.fundNature, false);
    row("Origine des fonds", fin.fundOrigins.join(", "), true);
    row("Modalité d'alimentation", fin.fundingModality, false);
    row("Banque d'origine", fin.bankOrigin, true);
  }

  // ==================== SECTION 3: PRODUCT KNOWLEDGE ====================
  checkPage(10);
  sectionTitle("III — Connaissance et expérience des produits financiers");

  const pk = formData.productKnowledge;
  let shade = false;
  for (const [key, name] of Object.entries(PRODUCT_NAMES)) {
    const entry = (pk as unknown as Record<string, unknown>)[key] as { held: boolean | null; holdingPeriod: string; opsPerYear: string; volume: string; q1: string; q2: string };
    if (!entry) continue;
    row(name, entry.held === null ? "Non renseigné" : entry.held ? `Détenu · ${entry.holdingPeriod} · ${entry.opsPerYear} op/an · ${entry.volume}` : "Non détenu", shade);
    shade = !shade;
  }
  divider();
  row("Portefeuille sous mandat", pk.managedPortfolio, false);
  row("Gestion en direct", pk.selfManaged, true);
  row("Portefeuille conseillé", pk.advisedPortfolio, false);
  row("Expérience secteur financier", pk.financialSectorExp, true);
  row("Lit la presse financière", pk.readsPress, false);
  row("Suit les cours de Bourse", pk.followsMarkets, true);
  row("Vérifie ses relevés mensuellement", pk.checksMonthly, false);

  // ==================== SECTION 4: OBJECTIVES & RISK ====================
  checkPage(10);
  sectionTitle("IV — Objectifs, horizon et tolérance au risque");

  const obj = formData.objectives;
  const objectives = [
    obj.capitalPreservation && "Préservation du capital",
    obj.capitalGrowth && "Valorisation du capital",
    obj.diversification && "Diversification des actifs",
    obj.incomeSearch && "Recherche de revenus",
    obj.transmission && "Transmission",
    obj.taxOptimization && "Optimisation fiscale",
    obj.other,
  ].filter(Boolean).join(", ");

  row("Objectifs d'investissement", objectives || "—", false);
  row("Profil de risque", obj.riskProfile ? RISK_LABELS[obj.riskProfile] : "—", true);
  row("Perte en capital passée", obj.pastLoss || "Non renseigné", false);
  row("Horizon d'investissement", obj.horizon ? HORIZON_LABELS[obj.horizon] : "—", true);
  row("Liquidité importante", obj.liquidityNeeded, false);
  row("Perte maximale acceptable", obj.maxLoss ? LOSS_LABELS[obj.maxLoss] : "—", true);
  row("% du patrimoine à investir", obj.percentOfPatrimony || "—", false);

  // ==================== SECTION 5: ESG ====================
  checkPage(10);
  sectionTitle("V — Préférences en matière d'investissements durables");

  const esg = formData.esg;
  row("Intégration de critères durabilité", esg.wantsESG, false);
  if (esg.wantsESG) {
    row("% Taxonomie UE", esg.taxonomyPct ? `≥ ${esg.taxonomyPct} %` : "Aucun", true);
    row("% Investissements durables", esg.sustainablePct ? `≥ ${esg.sustainablePct} %` : "Aucun", false);
    row("Facteurs d'impact", esg.impactFactors, true);
    if (esg.negativeImpacts.length > 0) {
      row("Incidences négatives à minimiser", esg.negativeImpacts.join(", "), false);
    }
  }

  // ==================== SECTION 6: APPOINTMENT ====================
  checkPage(10);
  sectionTitle("VI — Rendez-vous de consultation");
  row("Consultation réservée", formData.appointment.booked, false);

  // ==================== SECTION 7: SIGNATURE ====================
  checkPage(40);
  sectionTitle("VII — Signature et déclarations du client");

  y += 2;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...DARK);

  const declarations = [
    "Le client déclare que les réponses à ce questionnaire sont exactes et sincères, qu'elles correspondent à sa situation actuelle.",
    "Le client s'engage à informer son conseiller de toute modification significative.",
    "Le client déclare avoir reçu le document d'information préalable présentant le cabinet.",
    "Le client est pleinement informé que le cabinet peut utiliser ces informations au titre de ses obligations LCB-FT.",
    "Le client a pris connaissance de la politique RGPD et consent au traitement de ses données.",
  ];

  for (const decl of declarations) {
    checkPage(8);
    const lines = doc.splitTextToSize(`✓  ${decl}`, CONTENT_W - 4);
    doc.text(lines, MARGIN + 2, y);
    y += lines.length * 4.5 + 2;
  }

  y += 6;
  checkPage(40);

  // Signature area
  const sigBoxH = 38;
  const sigName = signedName || clientName;
  const signedAt = new Date().toLocaleString("fr-FR", {
    day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  // Client signature box
  doc.setFillColor(...LIGHT_GRAY);
  doc.rect(MARGIN, y, CONTENT_W / 2 - 5, sigBoxH, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...DARK);
  doc.text("Signature du client", MARGIN + 3, y + 5);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7);
  doc.setTextColor(...GRAY);
  doc.text("Lu et approuvé —", MARGIN + 3, y + 10);

  // Render the typed name as a large cursive-style signature
  doc.setFont("helvetica", "bolditalic");
  doc.setFontSize(16);
  doc.setTextColor(...DARK);
  doc.text(sigName, MARGIN + 3, y + 22);

  // Underline
  const nameWidth = doc.getTextWidth(sigName);
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.5);
  doc.line(MARGIN + 3, y + 24, MARGIN + 3 + Math.min(nameWidth, CONTENT_W / 2 - 12), y + 24);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...GRAY);
  doc.text(`Signé électroniquement le : ${signedAt}`, MARGIN + 3, y + 30);
  if (signedName) {
    doc.setFontSize(6.5);
    doc.text("Signature électronique — Identité vérifiée", MARGIN + 3, y + 35);
  }

  // Advisor box
  doc.setFillColor(...LIGHT_GRAY);
  doc.rect(MARGIN + CONTENT_W / 2 + 5, y, CONTENT_W / 2 - 5, sigBoxH, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...DARK);
  doc.text("Votre conseiller", MARGIN + CONTENT_W / 2 + 8, y + 5);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7);
  doc.setTextColor(...GRAY);
  doc.text("Advensys Insurance Finance", MARGIN + CONTENT_W / 2 + 8, y + 15);
  doc.text("Conseil en Investissement", MARGIN + CONTENT_W / 2 + 8, y + 21);

  y += sigBoxH + 4;

  // ==================== FOOTER ====================
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(...DARK);
    doc.rect(0, 290, W, 10, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(200, 200, 200);
    doc.text(
      "Advensys Insurance Finance · Questionnaire de Connaissance du Client (QCC) · Document confidentiel",
      MARGIN,
      295
    );
    doc.text(`Page ${i} / ${pageCount}`, W - MARGIN, 295, { align: "right" });
  }

  return doc.output("datauristring").split(",")[1]; // Return base64 only
}

export function buildFormSummary(formData: IATFormData): string {
  const isPersonal = formData.clientType === "personal";
  const today = new Date().toLocaleDateString("fr-FR");
  const clientName = isPersonal
    ? `${formData.titulaire1.firstName} ${formData.titulaire1.lastName}`.trim()
    : formData.companyIdentity.companyName;

  const lines: string[] = [
    `=== QUESTIONNAIRE QCC — ${isPersonal ? "Personne Physique" : "Personne Morale"} ===`,
    `Client : ${clientName}`,
    `Date : ${today}`,
    "",
    "--- IDENTITÉ ---",
  ];

  if (isPersonal) {
    const t1 = formData.titulaire1;
    lines.push(`Nom : ${t1.civility} ${t1.firstName} ${t1.lastName}`);
    lines.push(`Email : ${t1.email} | Tél : ${t1.phone}`);
    lines.push(`Nationalité : ${t1.nationality} | Naissance : ${t1.birthDate}`);
    lines.push(`Résidence fiscale : ${t1.fiscalResidence}`);
    lines.push(`US Person : ${t1.isUSPerson === null ? "Non renseigné" : t1.isUSPerson ? "Oui" : "Non"}`);
    lines.push(`Situation : ${formData.maritalStatus.status}`);
    lines.push(`Revenus T1 : ${formData.personalFinancial.t1Income}`);
    lines.push(`Montant à investir : ${formData.personalFinancial.amountToInvest}`);
  } else {
    const ci = formData.companyIdentity;
    lines.push(`Société : ${ci.companyName} (${ci.legalForm})`);
    lines.push(`RCS : ${ci.rcs} | Pays : ${ci.country}`);
    lines.push(`Représentant : ${ci.representative.firstName} ${ci.representative.lastName}`);
    lines.push(`Email : ${ci.representative.email}`);
    lines.push(`Montant à investir : ${formData.companyFinancial.amountToInvest}`);
  }

  lines.push("");
  lines.push("--- PROFIL DE RISQUE ---");
  lines.push(`Profil : ${formData.objectives.riskProfile ? RISK_LABELS[formData.objectives.riskProfile] : "—"}`);
  lines.push(`Horizon : ${formData.objectives.horizon ? HORIZON_LABELS[formData.objectives.horizon] : "—"}`);
  lines.push(`Perte max : ${formData.objectives.maxLoss ? LOSS_LABELS[formData.objectives.maxLoss] : "—"}`);

  lines.push("");
  lines.push("--- INVESTISSEMENTS DURABLES ---");
  lines.push(`ESG souhaité : ${formData.esg.wantsESG === null ? "Non renseigné" : formData.esg.wantsESG ? "Oui" : "Non"}`);

  lines.push("");
  lines.push("--- RENDEZ-VOUS ---");
  lines.push(`Créneau confirmé : ${formData.appointment.booked ? "Oui" : "Non"}`);

  return lines.join("\n");
}
