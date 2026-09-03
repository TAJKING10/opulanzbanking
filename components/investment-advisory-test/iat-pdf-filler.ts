/**
 * QCC PDF Filler — overlays form data onto the official regulatory template PDFs.
 *
 * Calibrated Coordinate System:
 *   pdf2json uses a standard 16.0 pt grid (A4: 595.304 × 841.890 pt, 37.206 × 52.618 units):
 *   x_pts = x_unit × 16.0
 *   y_pts = pageH − (y_unit × 16.0)
 *
 * Empirical Calibration:
 *   check(): baseline at py(y) - 11.5 (centers X inside checkbox square)
 *   text():  baseline at py(y) - 12.0 (aligns text directly on underline/dotted baseline)
 */
import type { IATFormData } from "./iat-types";

type RGB = [number, number, number];
const BLUE: RGB  = [0.05, 0.18, 0.48];
const DARK: RGB  = [0.12, 0.12, 0.12];

export async function fillTemplatePdf(
  clientType: "personal" | "company",
  formData: IATFormData
): Promise<{ base64: string; pageCount: number }> {
  const url = clientType === "personal" ? "/templates/qcc-pp.pdf" : "/templates/qcc-pm.pdf";
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Cannot load ${url}`);
  const arrayBuf = await resp.arrayBuffer();

  const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib");
  const pdfDoc = await PDFDocument.load(arrayBuf, { ignoreEncryption: true });
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pageCount = pdfDoc.getPageCount();

  const { width: pageW, height: pageH } = pdfDoc.getPage(0).getSize();
  const SCALE = 16.0;

  function page(idx: number) { return pdfDoc.getPage(idx); }
  function px(x: number) { return x * SCALE; }
  function py(y: number) { return pageH - y * SCALE; }

  function sanitize(s: string): string {
    return s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // decompose and remove accents for standard Helvetica
      .replace(/[^\x00-\xFF]/g, "");
  }

  function formatDateFr(isoOrStr?: string): string {
    if (!isoOrStr) return "";
    const clean = isoOrStr.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
      const [y, m, d] = clean.split("-");
      return `${d} / ${m} / ${y}`;
    }
    return clean;
  }

  /**
   * Mark a checkbox with an 'X' centered inside the box.
   */
  function check(pg: ReturnType<typeof page>, x: number, y: number) {
    pg.drawText("X", {
      x: px(x) + 0.5,
      y: py(y) - 11.5,
      size: 7.5,
      font: fontBold,
      color: rgb(BLUE[0], BLUE[1], BLUE[2]),
    });
  }

  /**
   * Write text overlaying an underline/dotted field line.
   */
  function text(
    pg: ReturnType<typeof page>,
    value: string | null | undefined | number,
    x: number,
    y: number,
    size = 8.5,
    color: RGB = BLUE,
    maxW?: number,
    clearUnderline = true
  ) {
    if (value === null || value === undefined || value === "") return;
    let str = sanitize(String(value));
    const defaultMax = x < 18.0
      ? px(18.0) - px(x) - 4
      : pageW - 20 - px(x);
    const maxPts = maxW ?? defaultMax;

    while (str.length > 1 && font.widthOfTextAtSize(str, size) > maxPts) {
      str = str.slice(0, -1);
    }
    const strW = font.widthOfTextAtSize(str, size);
    const baselineY = py(y) - 12.0;

    if (clearUnderline) {
      pg.drawRectangle({
        x: px(x) - 1,
        y: baselineY - 1.5,
        width: strW + 2,
        height: size + 2,
        color: rgb(1, 1, 1),
      });
    }

    pg.drawText(str, {
      x: px(x),
      y: baselineY,
      size,
      font,
      color: rgb(color[0], color[1], color[2]),
    });
  }

  const now = new Date();
  const dateStr = now.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
  const [nowD, nowM, nowY] = dateStr.split("/");

  // ════════════════════════════════════════════════════════════════════════
  // PP — Personne Physique
  // ════════════════════════════════════════════════════════════════════════
  if (clientType === "personal") {
    const {
      titulaire1: t1,
      titulaire2: t2,
      hasTitulaire2,
      maritalStatus: ms,
      personalFinancial: fin,
      productKnowledge: pk,
      objectives: obj,
      esg,
    } = formData;

    const clientFullName = `${t1.firstName || ""} ${t1.lastName || ""}`.trim().toUpperCase() || "CLIENT";

    // ── Page 1 (idx 0): Cover Page ──────────────────────────────────────
    const p1 = page(0);
    p1.drawRectangle({
      x: px(2.344) - 2,
      y: py(9.306) - 17,
      width: 280,
      height: 18,
      color: rgb(1, 1, 1),
    });
    p1.drawText(clientFullName, {
      x: px(2.344),
      y: py(9.306) - 13,
      size: 13,
      font: fontBold,
      color: rgb(BLUE[0], BLUE[1], BLUE[2]),
    });
    p1.drawText(`Date de saisie : ${dateStr}`, {
      x: px(2.344),
      y: py(9.306) - 26,
      size: 8.5,
      font,
      color: rgb(0.35, 0.35, 0.35),
    });

    // ── Page 2 (idx 1): Identification ──────────────────────────────────
    const p2 = page(1);

    // Titulaire 1
    if (t1.civility === "M")   check(p2, 2.344, 11.206);
    if (t1.civility === "Mme") check(p2, 10.500, 11.206);

    text(p2, t1.lastName, 4.200, 11.844, 9);
    text(p2, t1.maidenName, 6.400, 13.063, 8.5);
    text(p2, t1.firstName, 4.800, 13.675, 9);
    text(p2, formatDateFr(t1.birthDate), 4.300, 14.894, 8.5);
    text(p2, t1.birthPlace, 11.500, 14.894, 8.5);
    text(p2, t1.nationality, 5.000, 15.500, 8.5);
    text(p2, t1.address, 4.300, 16.113, 8.5);
    text(p2, t1.email, 3.800, 18.550, 8.5);
    text(p2, t1.phone, 4.900, 19.769, 8.5);

    // Régime protection juridique
    if (t1.legalProtection === true)  check(p2, 9.031, 20.988);
    if (t1.legalProtection === false) check(p2, 11.206, 20.988);

    // Résidence fiscale
    if (t1.fiscalResidence === "France") check(p2, 6.231, 22.813);
    if (t1.fiscalResidence === "Other")  {
      check(p2, 8.994, 22.813);
      text(p2, t1.fiscalResidenceOther, 11.200, 22.813, 8.5);
    }

    text(p2, t1.profession, 4.800, 24.031, 8.5);
    if (t1.isRetired) check(p2, 2.344, 25.250);
    if (t1.isBusinessOwner) check(p2, 2.344, 26.469);

    // US Person FATCA
    if (t1.isUSPerson === true)  check(p2, 2.344, 34.394);
    if (t1.isUSPerson === false) check(p2, 4.563, 34.394);

    // Titulaire 2 (if present)
    if (hasTitulaire2) {
      if (t2.civility === "M")   check(p2, 18.938, 11.206);
      if (t2.civility === "Mme") check(p2, 27.000, 11.206);
      text(p2, t2.lastName, 20.800, 11.844, 9);
      text(p2, t2.maidenName, 23.000, 13.063, 8.5);
      text(p2, t2.firstName, 21.400, 13.675, 9);
      text(p2, formatDateFr(t2.birthDate), 20.800, 14.894, 8.5);
      text(p2, t2.nationality, 21.800, 16.113, 8.5);
      text(p2, t2.address, 20.800, 17.331, 8.5);
      text(p2, t2.email, 20.400, 19.769, 8.5);
      text(p2, t2.phone, 21.400, 20.988, 8.5);
      text(p2, t2.profession, 21.400, 25.250, 8.5);
      if (t2.fiscalResidence === "France") check(p2, 22.825, 24.031);
      if (t2.fiscalResidence === "Other")  {
        check(p2, 25.587, 24.031);
        text(p2, t2.fiscalResidenceOther, 27.600, 24.031, 8.5);
      }
      if (t2.isUSPerson === true)  check(p2, 18.938, 34.394);
      if (t2.isUSPerson === false) check(p2, 21.156, 34.394);
    }

    // Situation matrimoniale
    const maritalMap: Record<string, [number, number]> = {
      married:   [2.344, 36.094],
      pacs:      [6.775, 36.094],
      single:    [11.206, 36.094],
      widowed:   [15.637, 36.094],
      divorced:  [20.069, 36.094],
      freeUnion: [24.500, 36.094],
    };
    if (ms.status && maritalMap[ms.status]) check(p2, ...maritalMap[ms.status]);
    text(p2, formatDateFr(ms.marriageDate), 5.800, 36.706, 8);
    text(p2, formatDateFr(ms.pacsDate), 5.200, 37.313, 8);
    text(p2, formatDateFr(ms.divorceDate), 5.600, 37.925, 8);
    text(p2, ms.numberOfChildren, 6.800, 42.431, 8.5);
    text(p2, ms.childrenAtCharge, 13.200, 42.431, 8.5);

    // ── Page 3 (idx 2): Financial ───────────────────────────────────────
    const p3 = page(2);

    // Revenus T1
    const incomeT1Map: Record<string, [number, number]> = {
      "<50k":    [2.344, 14.013],
      "50-100k": [10.306, 14.013],
      "100-150k":[2.344, 15.081],
      "150-500k":[2.344, 16.150],
      ">500k":   [10.306, 16.150],
    };
    if (fin.t1Income && incomeT1Map[fin.t1Income]) check(p3, ...incomeT1Map[fin.t1Income]);

    // Revenus T2
    const incomeT2Map: Record<string, [number, number]> = {
      "<50k":    [17.837, 14.013],
      "50-100k": [26.694, 14.013],
      "100-150k":[17.837, 15.081],
      "150-500k":[17.837, 16.150],
      ">500k":   [26.694, 16.150],
    };
    if (fin.t2Income && incomeT2Map[fin.t2Income]) check(p3, ...incomeT2Map[fin.t2Income]);

    // Patrimoine T1
    const patriT1Map: Record<string, [number, number]> = {
      "<100k":   [2.344,  17.856],
      "100-300k":[10.306, 17.550],
      "300-500k":[2.344,  19.106],
      "500k-1m": [10.306, 18.800],
      "1-5m":    [2.344,  20.050],
      ">5m":     [10.306, 20.356],
    };
    if (fin.t1Patrimony && patriT1Map[fin.t1Patrimony]) check(p3, ...patriT1Map[fin.t1Patrimony]);

    // Patrimoine T2
    const patriT2Map: Record<string, [number, number]> = {
      "<100k":   [17.837, 17.856],
      "100-300k":[26.694, 17.856],
      "300-500k":[17.837, 19.106],
      "500k-1m": [26.694, 19.106],
      "1-5m":    [17.837, 20.356],
      ">5m":     [26.694, 20.356],
    };
    if (fin.t2Patrimony && patriT2Map[fin.t2Patrimony]) check(p3, ...patriT2Map[fin.t2Patrimony]);

    // Engagements financiers
    text(p3, fin.t1Commitments ? `${fin.t1Commitments}` : "", 2.344, 22.188, 8.5);
    text(p3, fin.t2Commitments ? `${fin.t2Commitments}` : "", 17.844, 22.188, 8.5);

    // IR & IFI
    if (fin.t1IR === true)  check(p3, 3.100, 27.613);
    if (fin.t1IR === false) check(p3, 5.388, 27.613);
    if (fin.t1IFI === true)  check(p3, 11.144, 27.613);
    if (fin.t1IFI === false) check(p3, 13.431, 27.613);

    // Capacité d'épargne
    text(p3, fin.t1SavingsCapacity ? `${fin.t1SavingsCapacity} EUR` : "", 2.344, 29.138, 8.5);
    text(p3, fin.t2SavingsCapacity ? `${fin.t2SavingsCapacity} EUR` : "", 17.844, 29.138, 8.5);

    // Nature des avoirs
    if (fin.fundNature === "liquidities" || fin.fundNature === "both") {
      check(p3, 2.344, 32.194);
    }
    if (fin.fundNature === "financial_instruments" || fin.fundNature === "both") {
      check(p3, 10.037, 32.194);
    }

    // Montant prévu
    text(p3, fin.amountToInvest ? `${fin.amountToInvest} EUR` : "", 17.844, 32.194, 8.5);

    // Origine des fonds
    const originMap: Record<string, [number, number]> = {
      revenus_pro:        [2.344, 33.613],
      salaries:           [2.344, 33.613],
      cession_actifs_pro: [12.075, 33.613],
      professional_sale:  [12.075, 33.613],
      cession_immo:       [21.819, 33.613],
      real_estate_sale:   [21.819, 33.613],
      epargne:            [2.344, 34.319],
      savings:            [2.344, 34.319],
      jeux:               [12.075, 34.319],
      gambling:           [12.075, 34.319],
      cession_mob:        [21.819, 34.319],
      securities_sale:    [21.819, 34.319],
      heritage:           [2.344, 35.031],
      inheritance:        [2.344, 35.031],
      assurance_vie:      [12.075, 35.031],
      life_insurance:     [12.075, 35.031],
      autre:              [21.819, 35.031],
      other:              [21.819, 35.031],
    };
    (fin.fundOrigins || []).forEach((o) => {
      if (originMap[o]) check(p3, ...originMap[o]);
    });
    text(p3, fin.fundOriginOther, 28.019, 35.031, 8);

    // Établissement bancaire d'origine
    text(p3, fin.bankOrigin, 11.200, 36.450, 8.5);

    // ── Page 6 (idx 5): Products Part 1 ─────────────────────────────────
    const p6 = page(5);
    type ProdRow = { heldY: number; durationY: number; q1Y: number; q2Y: number };
    const p6Rows: Record<string, ProdRow> = {
      monetary: { heldY: 5.863,  durationY: 7.140,  q1Y: 7.788,  q2Y: 9.644  },
      bonds:    { heldY: 13.206, durationY: 14.490, q1Y: 15.131, q2Y: 16.988 },
      stocks:   { heldY: 20.550, durationY: 21.830, q1Y: 22.475, q2Y: 24.331 },
      scpi:     { heldY: 27.894, durationY: 29.180, q1Y: 29.819, q2Y: 31.675 },
    };

    function fillProductRow(pg: ReturnType<typeof page>, key: keyof typeof pk, rows: ProdRow, isScpi = false) {
      const e = pk[key] as typeof pk["monetary"];
      if (!e) return;
      if (e.held === true)  check(pg, 2.794, rows.heldY);
      if (e.held === false) check(pg, 6.781, rows.heldY);

      if (e.opsPerYear === "<1")  check(pg, 11.010, rows.heldY);
      if (e.opsPerYear === "1-5") check(pg, 18.680, rows.heldY);
      if (e.opsPerYear === "6+")  check(pg, 28.270, rows.heldY);

      const shortDur = isScpi ? "-10 ans" : "-4 ans";
      if (e.holdingPeriod === shortDur || e.holdingPeriod === "<4") check(pg, 2.344, rows.durationY);
      else if (e.holdingPeriod) check(pg, 6.540, rows.durationY);

      if (e.volume === "<5k")   check(pg, 11.060, rows.durationY);
      if (e.volume === "5-10k") check(pg, 15.640, rows.durationY);
      if (e.volume === "10-50k") check(pg, 23.050, rows.durationY);
      if (e.volume === ">50k")  check(pg, 29.040, rows.durationY);

      if (e.q1 === "vrai")        check(pg, 28.040, rows.q1Y);
      if (e.q1 === "faux")        check(pg, 28.040, rows.q1Y + 0.606);
      if (e.q1 === "ne_sais_pas") check(pg, 28.040, rows.q1Y + 1.218);

      if (e.q2 === "vrai")        check(pg, 28.040, rows.q2Y);
      if (e.q2 === "faux")        check(pg, 28.040, rows.q2Y + 0.612);
      if (e.q2 === "ne_sais_pas") check(pg, 28.040, rows.q2Y + 1.219);
    }

    fillProductRow(p6, "monetary", p6Rows.monetary);
    fillProductRow(p6, "bonds",    p6Rows.bonds);
    fillProductRow(p6, "stocks",   p6Rows.stocks);
    fillProductRow(p6, "scpi",     p6Rows.scpi, true);

    // ── Page 7 (idx 6): Products Part 2 & Management ────────────────────
    const p7 = page(6);
    const p7Rows: Record<string, ProdRow> = {
      privateEquity: { heldY: 3.720,  durationY: 5.000,  q1Y: 5.640,  q2Y: 7.500  },
      etf:           { heldY: 11.060, durationY: 12.340, q1Y: 12.990, q2Y: 14.840 },
      derivatives:   { heldY: 18.410, durationY: 19.690, q1Y: 20.330, q2Y: 22.190 },
      structured:    { heldY: 25.780, durationY: 27.070, q1Y: 27.710, q2Y: 29.570 },
    };

    fillProductRow(p7, "privateEquity", p7Rows.privateEquity);
    fillProductRow(p7, "etf",           p7Rows.etf);
    fillProductRow(p7, "derivatives",   p7Rows.derivatives);
    fillProductRow(p7, "structured",    p7Rows.structured);

    // Gestion du portefeuille
    if (pk.managedPortfolio === true)  check(p7, 24.475, 33.700);
    if (pk.managedPortfolio === false) check(p7, 29.563, 33.700);

    if (pk.selfManaged === true)  check(p7, 24.475, 35.025);
    if (pk.selfManaged === false) check(p7, 29.563, 35.025);

    if (pk.advisedPortfolio === true)  check(p7, 24.475, 36.319);
    if (pk.advisedPortfolio === false) check(p7, 29.563, 36.319);

    if (pk.financialSectorExp === true)  check(p7, 24.475, 37.925);
    if (pk.financialSectorExp === false) check(p7, 29.563, 37.925);

    // Culture financière
    if (pk.readsPress === true)  check(p7, 24.475, 41.438);
    if (pk.readsPress === false) check(p7, 29.563, 41.438);

    if (pk.followsMarkets === true)  check(p7, 24.475, 42.763);
    if (pk.followsMarkets === false) check(p7, 29.563, 42.763);

    if (pk.checksMonthly === true)  check(p7, 24.475, 44.056);
    if (pk.checksMonthly === false) check(p7, 29.563, 44.056);

    // ── Page 8 (idx 7): Objectives & Risk Profile ───────────────────────
    const p8 = page(7);

    // Objectives checkboxes/rankings at top of Page 8
    let rank = 1;
    if (obj.capitalPreservation) { text(p8, String(rank++), 9.600, 2.200, 8.5); }
    if (obj.capitalGrowth)       { text(p8, String(rank++), 20.000, 2.200, 8.5); }
    if (obj.diversification)     { text(p8, String(rank++), 31.000, 2.200, 8.5); }
    if (obj.incomeSearch)        { text(p8, String(rank++), 9.600, 3.075, 8.5); }
    if (obj.transmission)        { text(p8, String(rank++), 20.000, 3.075, 8.5); }
    if (obj.taxOptimization)     { text(p8, String(rank++), 31.000, 3.075, 8.5); }
    if (obj.other)               { text(p8, obj.other, 7.500, 3.969, 8.5); }

    // Risk profile placement curve
    if (obj.riskProfile === "A") check(p8, 2.344, 12.888);
    if (obj.riskProfile === "B") check(p8, 2.344, 14.106);
    if (obj.riskProfile === "C") check(p8, 2.344, 15.325);

    // Baisse de valeur passée
    if (obj.pastLoss === "none")  check(p8, 2.344, 18.325);
    if (obj.pastLoss === "<10")   check(p8, 18.738, 17.681);
    if (obj.pastLoss === "10-20") check(p8, 18.738, 18.325);
    if (obj.pastLoss === ">20")   check(p8, 18.738, 18.963);

    // Réaction face à une baisse
    if (obj.pastLoss === "none") {
      if (obj.reactionToDrop === "reinvest")    check(p8, 2.344, 20.650);
      if (obj.reactionToDrop === "sell-all")    check(p8, 2.344, 22.244);
      if (obj.reactionToDrop === "sell-part")   check(p8, 2.344, 23.838);
      if (obj.reactionToDrop === "hold")        check(p8, 2.344, 25.294);
    } else {
      if (obj.reactionToDrop === "reinvest")    check(p8, 18.738, 20.650);
      if (obj.reactionToDrop === "sell-all")    check(p8, 18.738, 22.244);
      if (obj.reactionToDrop === "sell-part")   check(p8, 18.738, 23.838);
      if (obj.reactionToDrop === "hold")        check(p8, 18.738, 25.294);
    }

    // Réaction face à une hausse (+20%)
    if (obj.reactionToGain === "hold")           check(p8, 2.344, 27.106);
    if (obj.reactionToGain === "reinvest-less")   check(p8, 9.850, 27.106);
    if (obj.reactionToGain === "reinvest-more")   check(p8, 22.275, 27.119);

    // Horizon
    const horizonMap: Record<string, [number, number]> = {
      "<1":  [2.344, 29.719],
      "1-3": [9.850, 29.719],
      "3-5": [16.962, 29.719],
      ">5":  [26.006, 29.719],
    };
    if (obj.horizon && horizonMap[obj.horizon]) check(p8, ...horizonMap[obj.horizon]);

    // Liquidité
    if (obj.liquidityNeeded === true)  check(p8, 2.344, 31.931);
    if (obj.liquidityNeeded === false) check(p8, 18.738, 31.931);

    // Perte maximale acceptable
    const maxLossMap: Record<string, [number, number]> = {
      "10":   [2.344, 34.144],
      "25":   [8.887, 34.144],
      "50":   [15.431, 34.144],
      "100":  [21.969, 34.144],
      "none": [28.512, 34.144],
    };
    if (obj.maxLoss && maxLossMap[obj.maxLoss]) check(p8, ...maxLossMap[obj.maxLoss]);

    // % patrimoine à investir
    const patPctMap: Record<string, [number, number]> = {
      "<10":   [2.344, 36.425],
      "10-25": [8.887, 36.125],
      "25-50": [15.431, 36.125],
      "50-75": [21.969, 36.425],
      ">75":   [28.512, 36.425],
    };
    if (obj.percentOfPatrimony && patPctMap[obj.percentOfPatrimony]) check(p8, ...patPctMap[obj.percentOfPatrimony]);

    // ── Page 9 (idx 8): ESG & Déclarations ──────────────────────────────
    const p9 = page(8);

    if (esg.wantsESG === true)  check(p9, 2.344, 4.638);
    if (esg.wantsESG === false) check(p9, 12.037, 4.638);

    if (esg.wantsESG) {
      // 1. Taxonomie
      const taxMap: Record<string, [number, number]> = {
        "5":    [2.344, 9.594],
        "25":   [6.300, 9.594],
        "50":   [10.250, 9.594],
        "none": [13.412, 9.594],
      };
      if (esg.taxonomyPct && taxMap[esg.taxonomyPct]) check(p9, ...taxMap[esg.taxonomyPct]);

      // 2. Investissements durables
      const sustMap: Record<string, [number, number]> = {
        "5":    [2.344, 16.875],
        "25":   [6.537, 16.875],
        "50":   [10.650, 16.875],
        "none": [13.806, 16.875],
      };
      if (esg.sustainablePct && sustMap[esg.sustainablePct]) check(p9, ...sustMap[esg.sustainablePct]);

      // 3. Impact factors
      if (esg.impactFactors === true)  check(p9, 2.344, 19.506);
      if (esg.impactFactors === false) check(p9, 12.037, 19.506);

      // PAI negative impacts
      const paiMap: Record<string, [number, number]> = {
        ghg:                   [2.344, 22.806],
        greenhouse_gas:        [2.344, 22.806],
        biodiversity:          [2.344, 23.825],
        water_pollution:       [2.344, 24.844],
        hazardous_waste:       [2.344, 25.863],
        real_estate_energy:    [2.344, 26.881],
        intl_norms:            [2.344, 27.900],
        intl_norms_process:    [2.344, 28.919],
        pay_equality:          [2.344, 29.938],
        board_diversity:       [2.344, 30.956],
        controversial_weapons: [2.344, 31.975],
      };
      (esg.negativeImpacts || []).forEach((pai) => {
        if (paiMap[pai]) check(p9, ...paiMap[pai]);
      });
    }

    // Conclusion conseiller (auto-aligned to client's risk profile)
    if (obj.riskProfile === "A") check(p9, 3.131, 39.431); // Sécuritaire
    if (obj.riskProfile === "B") check(p9, 3.131, 41.331); // Équilibré
    if (obj.riskProfile === "C") check(p9, 3.131, 42.281); // Dynamique

    // Déclaration client Page 9
    check(p9, 3.469, 47.250);

    // ── Page 10 (idx 9): Déclarations Finales & Lieu/Date ────────────────
    const p10 = page(9);

    // Checkboxes déclarations Page 10
    // Checkbox 1 is on page 9 sur 10 / top of page 10 (informer de toute modification)
    check(p10, 3.469, 2.200); // Informer de toute modification
    check(p10, 3.469, 3.075); // Avoir reçu le document préalable
    check(p10, 3.469, 3.950); // Pleinement informé LCB-FT

    // Date & Lieu
    const city = t1.birthPlace || (t1.address ? t1.address.split(",").pop()?.trim() : "") || "PARIS";
    text(p10, city.toUpperCase(), 4.000, 11.544, 8.5);
    text(p10, `${nowD} / ${nowM} / ${nowY}`, 15.000, 11.544, 8.5);
    text(p10, "2", 21.800, 11.544, 8.5);
  }

  // ════════════════════════════════════════════════════════════════════════
  // PM — Personne Morale
  // ════════════════════════════════════════════════════════════════════════
  if (clientType === "company") {
    const { companyIdentity: ci, companyFinancial: fin, productKnowledge: pk, objectives: obj, esg } = formData;
    const rep = ci.representative;

    // ── Page 1 (idx 0): Cover Page ──────────────────────────────────────
    const p1 = page(0);
    p1.drawRectangle({
      x: px(2.344) - 2,
      y: py(9.306) - 17,
      width: 280,
      height: 18,
      color: rgb(1, 1, 1),
    });
    p1.drawText((ci.companyName || "SOCIÉTÉ").toUpperCase(), {
      x: px(2.344),
      y: py(9.306) - 13,
      size: 13,
      font: fontBold,
      color: rgb(BLUE[0], BLUE[1], BLUE[2]),
    });
    p1.drawText(`Date de saisie : ${dateStr}`, {
      x: px(2.344),
      y: py(9.306) - 26,
      size: 8.5,
      font,
      color: rgb(0.35, 0.35, 0.35),
    });

    // ── Page 2 (idx 1): Company Identity ────────────────────────────────
    const p2 = page(1);

    text(p2, ci.companyName, 5.360, 6.410);
    text(p2, ci.legalForm, 22.400, 6.410);
    text(p2, ci.address, 2.344, 8.400);
    text(p2, ci.country, 20.070, 7.780);
    text(p2, ci.rcs, 24.010, 9.000);

    const sectorMap: Record<string, [number, number]> = {
      agriculture:   [3.810, 10.800],
      industry:      [3.810, 11.410],
      construction:  [3.810, 12.020],
      retail:        [3.810, 12.630],
      art_luxury:    [3.810, 13.240],
      finance:       [3.810, 13.850],
      energy:        [3.810, 14.460],
      public_admin:  [20.380, 10.800],
      trading:       [20.380, 11.410],
      import_export: [20.380, 12.020],
      hospitality:   [20.380, 12.630],
      liberal_prof:  [20.380, 13.240],
      religious:     [20.380, 13.850],
      other:         [20.380, 14.460],
    };
    (ci.sectors || []).forEach((s) => {
      if (sectorMap[s]) check(p2, ...sectorMap[s]);
    });

    if (ci.geoZone === "EU")  check(p2, 9.220, 16.430);
    if (ci.geoZone !== "EU" && ci.geoZone) {
      check(p2, 14.280, 16.430);
      text(p2, ci.geoZoneOther || ci.geoZone, 21.570, 16.270);
    }

    if (ci.isRegulated === true)  check(p2, 9.170, 17.970);
    if (ci.isRegulated === false) check(p2, 11.010, 17.970);
    if (ci.isRegulated && ci.regulator) text(p2, ci.regulator, 10.160, 18.410);

    if (ci.isListed === true)  check(p2, 7.900, 20.090);
    if (ci.isListed === false) check(p2, 9.740, 20.090);

    // Legal representative
    text(p2, rep.lastName, 2.344, 25.100);
    text(p2, rep.firstName, 18.938, 25.100);
    text(p2, rep.function, 2.344, 26.320);
    text(p2, rep.email, 2.344, 28.770);
    text(p2, rep.phone, 18.938, 28.770);

    if (rep.isPEP === true)  check(p2, 2.344, 31.850);
    if (rep.isPEP === false) check(p2, 4.560, 31.850);

    if (ci.hasUSPerson === true)  check(p2, 2.344, 34.394);
    if (ci.hasUSPerson === false) check(p2, 4.563, 34.394);

    // ── Page 3 (idx 2): Company Financial ───────────────────────────────
    const p3 = page(2);
    text(p3, fin.totalBalance, 2.344, 7.640);
    text(p3, fin.revenue, 18.938, 7.640);
    text(p3, fin.equity, 2.344, 8.870);
    text(p3, fin.financialCommitments ? `${fin.financialCommitments} %` : "", 18.938, 8.870);

    if (fin.taxType === "IS") check(p3, 2.344, 10.100);
    if (fin.taxType === "IR") check(p3, 5.500, 10.100);

    text(p3, fin.amountToInvest ? `${fin.amountToInvest} EUR` : "", 17.844, 32.194, 8.5);
    text(p3, fin.bankOrigin, 11.200, 36.450, 8.5);

    // ── Page 8 (idx 7): PM Declarations & Signatures ────────────────────
    if (pageCount >= 8) {
      const p8pm = page(pageCount - 1);
      check(p8pm, 3.469, 2.200);
      check(p8pm, 3.469, 3.075);
      check(p8pm, 3.469, 3.950);

      const city = ci.address ? ci.address.split(",").pop()?.trim() : "Luxembourg";
      text(p8pm, (city || "LUXEMBOURG").toUpperCase(), 4.000, 11.544, 8.5);
      text(p8pm, `${nowD} / ${nowM} / ${nowY}`, 15.000, 11.544, 8.5);
      text(p8pm, "2", 21.800, 11.544, 8.5);
    }
  }

  // ── Serialize (browser-safe, no Buffer) ─────────────────────────────────
  const pdfBytes = await pdfDoc.save();
  let binary = "";
  const chunk = 8192;
  for (let i = 0; i < pdfBytes.byteLength; i += chunk) {
    binary += String.fromCharCode(...pdfBytes.subarray(i, i + chunk));
  }
  const base64 = btoa(binary);
  return { base64, pageCount };
}
