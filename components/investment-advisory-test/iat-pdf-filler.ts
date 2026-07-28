/**
 * QCC PDF Filler — overlays form data onto the official template PDFs.
 *
 * Coordinate system (from pdf2json extraction):
 *   x_pts = x_unit × 17.688
 *   y_pts = 841.89 − (y_unit × 16.477)   ← pdf-lib Y is from BOTTOM
 *
 * All positions below are in pdf2json units (x, y).
 */
import type { IATFormData } from "./iat-types";

type RGB = [number, number, number];
const BLUE: RGB   = [0.05, 0.18, 0.48];
const BLACK: RGB  = [0, 0, 0];

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
  const font   = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pageCount = pdfDoc.getPageCount();

  // ── Dynamic scale factors from actual page size ──────────────────────────
  // (pdf2json calibration assumed standard A4: 595.28 × 841.89 pts)
  const { width: pageW, height: pageH } = pdfDoc.getPage(0).getSize();
  const dxs = 17.688 * (pageW / 595.28);
  const dys = 16.477 * (pageH / 841.89);
  const dph = pageH;

  // ── helpers ─────────────────────────────────────────────────────────────
  function page(idx: number) { return pdfDoc.getPage(idx); }

  function px(x: number) { return x * dxs; }
  function py(y: number) { return dph - y * dys; }

  /** Strip chars unsupported by WinAnsi (Helvetica): decompose accents, drop combining marks */
  function sanitize(s: string): string {
    return s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // remove combining diacritics (ē→e, ā→a, etc.)
      .replace(/[^\x00-\xFF]/g, "?");  // fallback for anything else
  }

  /** Write text at pdf2json (x, y) coordinates */
  function text(
    pg: ReturnType<typeof page>,
    value: string | null | undefined,
    x: number,
    y: number,
    size = 8.5,
    color: RGB = BLUE
  ) {
    if (!value) return;
    const str = sanitize(String(value));
    // Blank lines are 0.16 units below the label y positions in pdf2json
    const ty = y + 0.16;
    // White background to cover underscores
    pg.drawRectangle({
      x: px(x) - 1,
      y: py(ty) - 1,
      width: Math.min(str.length * (size * 0.55) + 4, 580 - px(x)),
      height: size + 2,
      color: rgb(1, 1, 1),
      opacity: 0.92,
    });
    pg.drawText(str, {
      x: px(x),
      y: py(ty),
      size,
      font,
      color: rgb(color[0], color[1], color[2]),
    });
  }

  /** Mark a checkbox (□) at pdf2json (x, y) */
  function check(pg: ReturnType<typeof page>, x: number, y: number) {
    pg.drawText("X", { x: px(x) + 0.5, y: py(y), size: 8, font, color: rgb(BLUE[0], BLUE[1], BLUE[2]) });
  }

  // ════════════════════════════════════════════════════════════════════════
  // PP — Personne Physique
  // ════════════════════════════════════════════════════════════════════════
  if (clientType === "personal") {
    const { titulaire1: t1, titulaire2: t2, hasTitulaire2, maritalStatus: ms, personalFinancial: fin, productKnowledge: pk, objectives: obj, esg } = formData;

    // ── Page 2 (idx 1): Identity ──────────────────────────────────────────
    const p2 = page(1);

    // Civility T1
    if (t1.civility === "M")   check(p2, 2.34, 11.21);
    if (t1.civility === "Mme") check(p2, 10.50, 11.21);

    text(p2, t1.lastName,    2.34, 12.30);
    text(p2, t1.maidenName,  6.30, 12.90);
    text(p2, t1.firstName,   2.34, 14.10);
    text(p2, t1.birthDate,   4.09, 14.73);
    text(p2, t1.birthPlace,  10.50, 14.73);
    text(p2, t1.nationality, 4.78, 15.34);
    text(p2, t1.address,     4.11, 15.95);
    text(p2, t1.email,       2.34, 19.00);
    text(p2, t1.phone,       2.34, 20.22);

    // Fiscal residence T1
    if (t1.fiscalResidence === "France") check(p2, 6.23,  22.81);
    if (t1.fiscalResidence === "Other")  { check(p2, 9.03, 22.81); text(p2, t1.fiscalResidenceOther, 11.00, 22.65); }

    text(p2, t1.profession,  2.34, 24.48);
    if (t1.isRetired) check(p2, 2.34, 25.25);

    // US Person T1
    if (t1.isUSPerson === true)  check(p2, 2.34, 34.39);
    if (t1.isUSPerson === false) check(p2, 4.56, 34.39);

    // Titulaire 2
    if (hasTitulaire2) {
      if (t2.civility === "M")   check(p2, 18.94, 11.21);
      if (t2.civility === "Mme") check(p2, 27.00, 11.21);
      text(p2, t2.lastName,    18.94, 12.30);
      text(p2, t2.maidenName,  22.89, 12.90);
      text(p2, t2.firstName,   18.94, 14.10);
      text(p2, t2.birthDate,   20.68, 14.73);
      text(p2, t2.nationality, 21.38, 15.34);
      text(p2, t2.address,     20.70, 17.17);
      text(p2, t2.email,       18.94, 20.22);
      text(p2, t2.phone,       18.94, 21.43);
      if (t2.fiscalResidence === "France") check(p2, 22.82, 24.03);
      if (t2.fiscalResidence === "Other")  { check(p2, 26.03, 24.03); text(p2, t2.fiscalResidenceOther, 27.59, 23.87); }
      text(p2, t2.profession,  18.94, 25.70);
      if (t2.isUSPerson === true)  check(p2, 18.94, 34.39);
      if (t2.isUSPerson === false) check(p2, 21.16, 34.39);
    }

    // Marital status
    const maritalMap: Record<string, [number, number]> = {
      married:   [2.34,  36.09],
      pacs:      [6.78,  36.09],
      single:    [11.21, 36.09],
      widowed:   [15.64, 36.09],
      divorced:  [20.07, 36.09],
      freeUnion: [24.50, 36.09],
    };
    if (ms.status && maritalMap[ms.status]) check(p2, ...maritalMap[ms.status]);
    text(p2, ms.marriageDate,    5.83, 36.55);
    text(p2, ms.pacsDate,        5.22, 37.15);
    text(p2, ms.divorceDate,     5.67, 37.76);
    text(p2, ms.numberOfChildren, 6.55, 42.27);
    text(p2, ms.childrenAtCharge, 12.94, 42.27);

    // ── Page 3 (idx 2): Financial ─────────────────────────────────────────
    const p3 = page(2);

    // Income ranges T1
    const incomeT1Map: Record<string, [number, number]> = {
      "<50k":    [2.34,  14.01],
      "50-100k": [10.31, 14.01],
      "100-150k":[2.34,  15.08],
      "150-500k":[2.34,  16.15],
      ">500k":   [10.31, 16.15],
    };
    if (fin.t1Income && incomeT1Map[fin.t1Income]) check(p3, ...incomeT1Map[fin.t1Income]);

    // Income ranges T2
    const incomeT2Map: Record<string, [number, number]> = {
      "<50k":    [17.84, 14.01],
      "50-100k": [26.69, 14.01],
      "100-150k":[17.84, 15.08],
      "150-500k":[17.84, 16.15],
      ">500k":   [26.69, 16.15],
    };
    if (fin.t2Income && incomeT2Map[fin.t2Income]) check(p3, ...incomeT2Map[fin.t2Income]);

    // Patrimony T1
    const patriT1Map: Record<string, [number, number]> = {
      "<100k":   [2.34,  17.86],
      "100-300k":[10.31, 17.55],
      "300-500k":[2.34,  19.11],
      "500k-1m": [10.31, 18.80],
      "1-5m":    [2.34,  20.05],
      ">5m":     [10.31, 20.36],
    };
    if (fin.t1Patrimony && patriT1Map[fin.t1Patrimony]) check(p3, ...patriT1Map[fin.t1Patrimony]);

    // Patrimony T2
    const patriT2Map: Record<string, [number, number]> = {
      "<100k":   [17.84, 17.86],
      "100-300k":[26.69, 17.86],
      "300-500k":[17.84, 19.11],
      "500k-1m": [26.69, 19.11],
      "1-5m":    [17.84, 20.36],
      ">5m":     [26.69, 20.36],
    };
    if (fin.t2Patrimony && patriT2Map[fin.t2Patrimony]) check(p3, ...patriT2Map[fin.t2Patrimony]);

    // Commitments
    text(p3, fin.t1Commitments, 2.34,  22.91);
    text(p3, fin.t2Commitments, 17.84, 22.91);

    // IR / IFI
    if (fin.t1IR === true)  check(p3, 3.10,  27.61);
    if (fin.t1IR === false) check(p3, 5.39,  27.61);
    if (fin.t1IFI === true)  check(p3, 11.14, 27.61);
    if (fin.t1IFI === false) check(p3, 13.43, 27.61);
    if (fin.t2IR === true)  check(p3, 18.59, 27.61);
    if (fin.t2IR === false) check(p3, 20.88, 27.61);
    if (fin.t2IFI === true)  check(p3, 27.53, 27.61);
    if (fin.t2IFI === false) check(p3, 29.82, 27.61);

    // Savings capacity
    text(p3, fin.t1SavingsCapacity, 2.34,  28.98);
    text(p3, fin.t2SavingsCapacity, 17.84, 28.98);

    // Fund nature
    if (fin.fundNature === "liquidities")         check(p3, 2.34,  32.19);
    if (fin.fundNature === "financial_instruments") check(p3, 10.04, 32.19);
    if (fin.fundNature === "both") { check(p3, 2.34, 32.19); check(p3, 10.04, 32.19); }

    // Amount to invest
    text(p3, fin.amountToInvest, 18.00, 32.03);

    // Fund origins
    const originMap: Record<string, [number, number]> = {
      salaries:          [2.34,  33.61],
      professional_sale: [12.07, 33.61],
      real_estate_sale:  [21.82, 33.61],
      savings:           [2.34,  34.32],
      gambling:          [12.07, 34.32],
      securities_sale:   [21.82, 34.32],
      inheritance:       [2.34,  35.03],
      life_insurance:    [12.07, 35.03],
      other:             [21.82, 35.03],
    };
    fin.fundOrigins.forEach(o => {
      if (originMap[o]) check(p3, ...originMap[o]);
    });
    text(p3, fin.fundOriginOther, 28.02, 34.87);

    // Bank origin
    text(p3, fin.bankOrigin, 11.20, 36.29);

    // ── Page 6 (idx 5): Product knowledge — monetary, bonds, stocks, SCPI ─
    const p6 = page(5);

    type ProductRow = { heldY: number; durationY: number; q1Y: number; q2Y: number };
    const p6Products: Record<string, ProductRow> = {
      monetary:     { heldY: 5.86,  durationY: 7.14,  q1Y: 7.79,  q2Y: 9.64  },
      bonds:        { heldY: 13.21, durationY: 14.49, q1Y: 15.13, q2Y: 16.99 },
      stocks:       { heldY: 20.55, durationY: 21.83, q1Y: 22.48, q2Y: 24.33 },
      scpi:         { heldY: 27.89, durationY: 29.18, q1Y: 29.82, q2Y: 31.67 },
    };

    function fillProduct(
      pg: ReturnType<typeof page>,
      key: keyof typeof pk,
      rows: ProductRow,
      isScpi = false
    ) {
      const e = pk[key] as typeof pk["monetary"];
      if (!e) return;
      // Held
      if (e.held === true)  check(pg, 2.34, rows.heldY);
      if (e.held === false) check(pg, 6.33, rows.heldY);
      // Ops per year
      if (e.opsPerYear === "<1")  check(pg, 11.01, rows.heldY);
      if (e.opsPerYear === "1-5") check(pg, 18.68, rows.heldY);
      if (e.opsPerYear === "6+")  check(pg, 28.27, rows.heldY);
      // Duration
      const shortDur = isScpi ? "-10 ans" : "-4 ans";
      if (e.holdingPeriod === shortDur || e.holdingPeriod === "<4") check(pg, 2.34, rows.durationY);
      else if (e.holdingPeriod)                                      check(pg, 6.54, rows.durationY);
      // Volume
      if (e.volume === "<5k")   check(pg, 11.06, rows.durationY);
      if (e.volume === "5-10k") check(pg, 15.64, rows.durationY);
      if (e.volume === "10-50k") check(pg, 23.05, rows.durationY);
      if (e.volume === ">50k")  check(pg, 29.04, rows.durationY);
      // Q1
      if (e.q1 === "vrai")        check(pg, 28.04, rows.q1Y);
      if (e.q1 === "faux")        check(pg, 28.04, rows.q1Y + 0.61);
      if (e.q1 === "ne_sais_pas") check(pg, 28.04, rows.q1Y + 1.22);
      // Q2
      if (e.q2 === "vrai")        check(pg, 28.04, rows.q2Y);
      if (e.q2 === "faux")        check(pg, 28.04, rows.q2Y + 0.61);
      if (e.q2 === "ne_sais_pas") check(pg, 28.04, rows.q2Y + 1.22);
    }

    fillProduct(p6, "monetary", p6Products.monetary);
    fillProduct(p6, "bonds",    p6Products.bonds);
    fillProduct(p6, "stocks",   p6Products.stocks);
    fillProduct(p6, "scpi",     p6Products.scpi, true);

    // ── Page 7 (idx 6): privateEquity, ETF, derivatives, structured + mgmt ─
    const p7 = page(6);

    type ProductRow7 = { heldY: number; durationY: number; q1Y: number; q2Y: number; heldXOui?: number; heldXNon?: number };
    const p7Products: Record<string, ProductRow7> = {
      privateEquity: { heldY: 3.72,  durationY: 5.00,  q1Y: 5.64,  q2Y: 7.50  },
      etf:           { heldY: 11.06, durationY: 12.34, q1Y: 12.99, q2Y: 14.84 },
      derivatives:   { heldY: 18.41, durationY: 19.69, q1Y: 20.33, q2Y: 22.19 },
      structured:    { heldY: 25.78, durationY: 27.07, q1Y: 27.71, q2Y: 29.57, heldXOui: 2.68, heldXNon: 6.11 },
    };

    function fillProduct7(
      pg: ReturnType<typeof page>,
      key: keyof typeof pk,
      rows: ProductRow7
    ) {
      const e = pk[key] as typeof pk["monetary"];
      if (!e) return;
      const xOui = rows.heldXOui ?? 2.34;
      const xNon = rows.heldXNon ?? 6.33;
      if (e.held === true)  check(pg, xOui, rows.heldY);
      if (e.held === false) check(pg, xNon, rows.heldY);
      if (e.opsPerYear === "<1")  check(pg, 10.83, rows.heldY);
      if (e.opsPerYear === "1-5") check(pg, 18.56, rows.heldY);
      if (e.opsPerYear === "6+")  check(pg, 28.22, rows.heldY);
      if (e.holdingPeriod && e.holdingPeriod.includes("-")) check(pg, 2.34, rows.durationY);
      else if (e.holdingPeriod)                              check(pg, 6.33, rows.durationY);
      if (e.volume === "<5k")    check(pg, 10.89, rows.durationY);
      if (e.volume === "5-10k")  check(pg, 15.50, rows.durationY);
      if (e.volume === "10-50k") check(pg, 22.96, rows.durationY);
      if (e.volume === ">50k")   check(pg, 29.01, rows.durationY);
      const qX = key === "structured" ? 27.93 : 27.99;
      if (e.q1 === "vrai")        check(pg, qX, rows.q1Y);
      if (e.q1 === "faux")        check(pg, qX, rows.q1Y + 0.61);
      if (e.q1 === "ne_sais_pas") check(pg, qX, rows.q1Y + 1.22);
      if (e.q2 === "vrai")        check(pg, qX, rows.q2Y);
      if (e.q2 === "faux")        check(pg, qX, rows.q2Y + 0.61);
      if (e.q2 === "ne_sais_pas") check(pg, qX, rows.q2Y + 1.22);
    }

    fillProduct7(p7, "privateEquity", p7Products.privateEquity);
    fillProduct7(p7, "etf",           p7Products.etf);
    fillProduct7(p7, "derivatives",   p7Products.derivatives);
    fillProduct7(p7, "structured",    p7Products.structured);

    // Portfolio management & culture
    const boolCheck = (pg: ReturnType<typeof page>, val: boolean | null, xOui: number, xNon: number, y: number) => {
      if (val === true)  check(pg, xOui, y);
      if (val === false) check(pg, xNon, y);
    };
    boolCheck(p7, pk.managedPortfolio,   24.48, 29.56, 33.70);
    boolCheck(p7, pk.selfManaged,        24.48, 29.56, 35.02);
    boolCheck(p7, pk.advisedPortfolio,   24.48, 29.56, 36.32);
    boolCheck(p7, pk.financialSectorExp, 24.48, 29.56, 37.92);
    boolCheck(p7, pk.readsPress,         24.48, 29.56, 41.44);
    boolCheck(p7, pk.followsMarkets,     24.48, 29.56, 42.76);
    boolCheck(p7, pk.checksMonthly,      24.48, 29.56, 44.06);

    // ── Page 8 (idx 7): Objectives & Risk ────────────────────────────────
    const p8 = page(7);

    // Risk profile
    if (obj.riskProfile === "A") check(p8, 2.34, 12.89);
    if (obj.riskProfile === "B") check(p8, 2.34, 14.11);
    if (obj.riskProfile === "C") check(p8, 2.34, 15.32);

    // Past loss (rows: Non / <10% / 10-20% / >20%)
    if (obj.pastLoss === "none") check(p8, 2.34, 18.32);
    if (obj.pastLoss === "<10")  check(p8, 18.74, 17.68);
    if (obj.pastLoss === "10-20") check(p8, 18.74, 18.32);
    if (obj.pastLoss === ">20")  check(p8, 18.74, 18.96);

    // Reaction to gain
    if (obj.reactionToGain === "hold")         check(p8, 2.34,  27.11);
    if (obj.reactionToGain === "reinvest-less") check(p8, 9.85,  27.11);
    if (obj.reactionToGain === "reinvest-more") check(p8, 22.27, 27.12);

    // Horizon
    const horizonMap: Record<string, [number, number]> = {
      "<1":  [2.34,  29.72],
      "1-3": [9.85,  29.72],
      "3-5": [16.96, 29.72],
      ">5":  [26.01, 29.72],
    };
    if (obj.horizon && horizonMap[obj.horizon]) check(p8, ...horizonMap[obj.horizon]);

    // Liquidity
    if (obj.liquidityNeeded === true)  check(p8, 2.34,  31.93);
    if (obj.liquidityNeeded === false) check(p8, 18.74, 31.93);

    // Max loss (5 checkboxes: 10%, 25%, 50%, 100%, Aucune)
    const maxLossMap: Record<string, [number, number]> = {
      "10":   [2.34,  34.14],
      "25":   [8.89,  34.14],
      "50":   [15.43, 34.14],
      "100":  [21.97, 34.14],
      "none": [28.51, 34.14],
    };
    if (obj.maxLoss && maxLossMap[obj.maxLoss]) check(p8, ...maxLossMap[obj.maxLoss]);

    // % patrimony
    const patPctMap: Record<string, [number, number]> = {
      "<10":   [2.34,  36.42],
      "10-25": [8.89,  36.13],
      "25-50": [15.43, 36.13],
      "50-75": [21.97, 36.42],
      ">75":   [28.51, 36.42],
    };
    if (obj.percentOfPatrimony && patPctMap[obj.percentOfPatrimony]) check(p8, ...patPctMap[obj.percentOfPatrimony]);

    // ── Page 9 (idx 8): ESG ───────────────────────────────────────────────
    if (pageCount >= 9) {
      const p9 = page(8);
      if (esg.wantsESG === true)  check(p9, 2.34,  4.64);
      if (esg.wantsESG === false) check(p9, 12.04, 4.64);

      if (esg.wantsESG) {
        // Taxonomy %
        const taxMap: Record<string, [number, number]> = {
          "5":    [2.34,  9.59],
          "25":   [6.30,  9.59],
          "50":   [10.25, 9.59],
          "none": [13.41, 9.59],
        };
        if (esg.taxonomyPct && taxMap[esg.taxonomyPct]) check(p9, ...taxMap[esg.taxonomyPct]);
      }
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  // PM — Personne Morale
  // ════════════════════════════════════════════════════════════════════════
  if (clientType === "company") {
    const { companyIdentity: ci, companyFinancial: fin, productKnowledge: pk, objectives: obj, esg } = formData;
    const rep = ci.representative;

    // ── Page 2 (idx 1): Company identity ─────────────────────────────────
    const p2 = page(1);

    text(p2, ci.companyName, 5.36,  6.41);
    text(p2, ci.legalForm,   22.40, 6.41);
    text(p2, ci.address,     2.34,  8.40);
    text(p2, ci.country,     20.07, 7.78);
    text(p2, ci.rcs,         24.01, 9.00);

    // Sectors
    const sectorMap: Record<string, [number, number]> = {
      agriculture:   [3.81, 10.80],
      industry:      [3.81, 11.41],
      construction:  [3.81, 12.02],
      retail:        [3.81, 12.63],
      art_luxury:    [3.81, 13.24],
      finance:       [3.81, 13.85],
      energy:        [3.81, 14.46],
      public_admin:  [20.38, 10.80],
      trading:       [20.38, 11.41],
      import_export: [20.38, 12.02],
      hospitality:   [20.38, 12.63],
      liberal_prof:  [20.38, 13.24],
      religious:     [20.38, 13.85],
      other:         [20.38, 14.46],
    };
    ci.sectors.forEach(s => { if (sectorMap[s]) check(p2, ...sectorMap[s]); });

    // Geo zone
    if (ci.geoZone === "EU")  check(p2, 9.22, 16.43);
    if (ci.geoZone !== "EU" && ci.geoZone) {
      check(p2, 14.28, 16.43);
      text(p2, ci.geoZoneOther || ci.geoZone, 21.57, 16.27);
    }

    // Regulated
    if (ci.isRegulated === true)  check(p2, 9.17,  17.97);
    if (ci.isRegulated === false) check(p2, 11.01, 17.97);
    if (ci.isRegulated && ci.regulator) text(p2, ci.regulator, 10.16, 18.41);

    // Listed
    if (ci.isListed === true)  check(p2, 7.90, 20.09);
    if (ci.isListed === false) check(p2, 9.74, 20.09);
    if (ci.isListed && ci.markets) text(p2, ci.markets, 8.26, 20.54);

    // Representative row (table: Nom | Prénom | Fonction | Tel | Mail | PPE)
    // Headers at y=24.39; data row is below the header (~y=25.50)
    text(p2, rep.lastName,  2.34,  25.50, 8, BLACK);
    text(p2, rep.firstName, 7.91,  25.50, 8, BLACK);
    text(p2, rep.function,  13.47, 25.50, 8, BLACK);
    text(p2, rep.phone,     19.04, 25.50, 8, BLACK);
    text(p2, rep.email,     24.60, 25.50, 8, BLACK);
    text(p2, rep.isPEP === true ? "Oui" : rep.isPEP === false ? "Non" : "", 30.68, 25.50, 8, BLACK);

    // FATCA
    if (ci.hasUSPerson === true)  check(p2, 16.38, 33.64);
    if (ci.hasUSPerson === false) check(p2, 18.28, 33.64);

    // Financial data (blanks at y≈38.18, 39.24, 40.31, 41.37)
    text(p2, fin.fiscalYearEnd, 2.34,  38.02, 8, BLACK);
    text(p2, fin.totalBalance ? fin.totalBalance + " €" : "", 18.91, 39.08, 8, BLACK);
    text(p2, fin.revenue ? fin.revenue + " €" : "",      18.91, 40.15, 8, BLACK);
    text(p2, fin.equity ? fin.equity + " €" : "",        18.91, 41.21, 8, BLACK);

    // ── Page 3 (idx 2): Tax + Fund origins ───────────────────────────────
    const p3 = page(2);

    if (fin.taxType === "IS") check(p3, 13.39, 3.29);
    if (fin.taxType === "IR") check(p3, 24.44, 3.29);

    // Fund nature
    if (fin.fundNature === "liquidities")           check(p3, 3.47,  16.01);
    if (fin.fundNature === "financial_instruments") check(p3, 11.75, 16.01);
    if (fin.fundNature === "both") { check(p3, 3.47, 16.01); check(p3, 11.75, 16.01); }
    text(p3, fin.amountToInvest, 18.91, 15.85);

    // Fund origins PM
    const originPM: Record<string, [number, number]> = {
      professional_income: [3.47,  18.14],
      professional_sale:   [14.51, 18.14],
      real_estate_sale:    [25.56, 18.14],
      savings:             [3.47,  19.20],
      securities_sale:     [14.51, 19.20],
      life_insurance:      [25.56, 19.20],
      inheritance:         [3.47,  20.26],
      other:               [14.51, 20.26],
    };
    fin.fundOrigins.forEach(o => { if (originPM[o]) check(p3, ...originPM[o]); });
    text(p3, fin.fundOriginOther, 19.49, 20.10);
    text(p3, fin.bankOrigin, 11.07, 22.23);

    // Funding modality
    if (fin.fundingModality === "portfolio_transfer") check(p3, 3.47,  24.51);
    if (fin.fundingModality === "check")              check(p3, 14.51, 24.51);
    if (fin.fundingModality === "wire")               check(p3, 25.56, 24.51);

    // ── Page 4 (idx 3): Risk profiles (info only) + Product knowledge start
    const p4 = page(3);
    // Monetary on page 4
    const monPM = { heldY: 44.85, durationY: 46.13, q1Y: 46.77, q2Y: 48.63 };
    const ePM_mon = pk.monetary;
    if (ePM_mon.held === true)  check(p4, 2.34, monPM.heldY);
    if (ePM_mon.held === false) check(p4, 6.33, monPM.heldY);
    if (ePM_mon.opsPerYear === "<1")  check(p4, 13.27, monPM.heldY);
    if (ePM_mon.opsPerYear === "1-5") check(p4, 21.34, monPM.heldY);
    if (ePM_mon.opsPerYear === "6+")  check(p4, 29.43, monPM.heldY);
    if (ePM_mon.volume === "<5k")    check(p4, 11.86, monPM.durationY);
    if (ePM_mon.volume === "5-10k")  check(p4, 16.23, monPM.durationY);
    if (ePM_mon.volume === "10-50k") check(p4, 24.49, monPM.durationY);
    if (ePM_mon.volume === ">50k")   check(p4, 30.49, monPM.durationY);
    if (ePM_mon.q1 === "vrai")        check(p4, 28.04, monPM.q1Y);
    if (ePM_mon.q1 === "faux")        check(p4, 28.04, monPM.q1Y + 0.61);
    if (ePM_mon.q1 === "ne_sais_pas") check(p4, 28.04, monPM.q1Y + 1.22);

    // ── Page 5 (idx 4): bonds, stocks, SCPI ─────────────────────────────
    const p5 = page(4);
    type PMProductRow = { heldY: number; durationY: number; q1Y: number; q2Y: number };
    const pmProducts: Record<string, PMProductRow> = {
      bonds:  { heldY: 4.97,  durationY: 6.25,  q1Y: 6.89,  q2Y: 8.75  },
      stocks: { heldY: 12.31, durationY: 13.59, q1Y: 14.24, q2Y: 16.09 },
      scpi:   { heldY: 19.66, durationY: 20.94, q1Y: 21.59, q2Y: 23.44 },
    };
    function fillPMProduct(pg: ReturnType<typeof page>, key: keyof typeof pk, rows: PMProductRow) {
      const e = pk[key] as typeof pk["monetary"];
      if (!e) return;
      if (e.held === true)  check(pg, 2.34, rows.heldY);
      if (e.held === false) check(pg, 6.33, rows.heldY);
      if (e.opsPerYear === "<1")  check(pg, 13.27, rows.heldY);
      if (e.opsPerYear === "1-5") check(pg, 21.34, rows.heldY);
      if (e.opsPerYear === "6+")  check(pg, 29.43, rows.heldY);
      if (e.volume === "<5k")    check(pg, 11.86, rows.durationY);
      if (e.volume === "5-10k")  check(pg, 16.23, rows.durationY);
      if (e.volume === "10-50k") check(pg, 24.49, rows.durationY);
      if (e.volume === ">50k")   check(pg, 30.49, rows.durationY);
      if (e.q1 === "vrai")        check(pg, 28.04, rows.q1Y);
      if (e.q1 === "faux")        check(pg, 28.04, rows.q1Y + 0.61);
      if (e.q1 === "ne_sais_pas") check(pg, 28.04, rows.q1Y + 1.22);
      if (e.q2 === "vrai")        check(pg, 28.04, rows.q2Y);
      if (e.q2 === "faux")        check(pg, 28.04, rows.q2Y + 0.61);
      if (e.q2 === "ne_sais_pas") check(pg, 28.04, rows.q2Y + 1.22);
    }
    fillPMProduct(p5, "bonds",  pmProducts.bonds);
    fillPMProduct(p5, "stocks", pmProducts.stocks);
    fillPMProduct(p5, "scpi",   pmProducts.scpi);

    // ── Pages 6-7 for PM: privateEquity, ETF, derivatives, structured + objectives ─
    // (PM pages 6-8 mirror PP structure with similar but shifted coordinates)
    // Objectives & ESG shared below
    if (pageCount >= 7) {
      const pObj = page(6); // Page 7
      if (obj.riskProfile === "A") check(pObj, 2.34, 12.89);
      if (obj.riskProfile === "B") check(pObj, 2.34, 14.11);
      if (obj.riskProfile === "C") check(pObj, 2.34, 15.32);

      const horizonMap: Record<string, [number, number]> = {
        "<1":  [2.34,  29.72],
        "1-3": [9.85,  29.72],
        "3-5": [16.96, 29.72],
        ">5":  [26.01, 29.72],
      };
      if (obj.horizon && horizonMap[obj.horizon]) check(pObj, ...horizonMap[obj.horizon]);

      const maxLossMap: Record<string, [number, number]> = {
        "10":   [2.34,  34.14],
        "25":   [8.89,  34.14],
        "50":   [15.43, 34.14],
        "100":  [21.97, 34.14],
        "none": [28.51, 34.14],
      };
      if (obj.maxLoss && maxLossMap[obj.maxLoss]) check(pObj, ...maxLossMap[obj.maxLoss]);
    }

    if (pageCount >= 8) {
      const pEsg = page(7); // Page 8
      if (esg.wantsESG === true)  check(pEsg, 2.34,  4.64);
      if (esg.wantsESG === false) check(pEsg, 12.04, 4.64);
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
