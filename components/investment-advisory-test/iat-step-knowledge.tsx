"use client";
import * as React from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import type { IATFormData, ProductKnowledge, ProductEntry, TrueFalseNS, OpsPerYear, VolumeOps } from "./iat-types";

interface Props {
  formData: IATFormData;
  onChange: (data: Partial<IATFormData>) => void;
  onNext: () => void;
  error: string;
  setError: (e: string) => void;
}

type ProductKey = keyof Omit<
  ProductKnowledge,
  "managedPortfolio" | "selfManaged" | "advisedPortfolio" | "financialSectorExp" | "readsPress" | "followsMarkets" | "checksMonthly"
>;

interface ProductConfig {
  key: ProductKey;
  label: string;
  holdingOptions: [string, string][];
  q1: string;
  q2: string;
}

function TFNGroup({
  name,
  question,
  value,
  onChange,
  trueLabel,
  falseLabel,
  dontKnow,
}: {
  name: string;
  question: string;
  value: TrueFalseNS;
  onChange: (v: TrueFalseNS) => void;
  trueLabel: string;
  falseLabel: string;
  dontKnow: string;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold text-brand-dark italic">{question} <span className="text-red-500">*</span></p>
      <div className="flex gap-4">
        {(["vrai", "faux", "ne_sais_pas"] as TrueFalseNS[]).map((v) => (
          <label key={v} className="flex items-center gap-1.5 cursor-pointer text-xs">
            <input
              type="radio"
              name={name}
              checked={value === v}
              onChange={() => onChange(v)}
              className="accent-brand-gold"
            />
            {v === "vrai" ? trueLabel : v === "faux" ? falseLabel : dontKnow}
          </label>
        ))}
      </div>
    </div>
  );
}

function ProductCard({
  config,
  entry,
  onChange,
  t,
}: {
  config: ProductConfig;
  entry: ProductEntry;
  onChange: (d: Partial<ProductEntry>) => void;
  t: ReturnType<typeof useTranslations>;
}) {
  const [open, setOpen] = React.useState(false);
  const up = (field: keyof ProductEntry, val: unknown) =>
    onChange({ [field]: val } as Partial<ProductEntry>);

  return (
    <div className="rounded-xl border border-brand-grayLight overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${entry.held !== null ? "bg-brand-gold" : "bg-gray-300"}`} />
          <span className="text-sm font-semibold text-brand-dark">{config.label}</span>
        </div>
        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 text-brand-gold transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="border-t border-brand-grayLight px-4 py-4 space-y-4 bg-gray-50/50">
          {/* Held */}
          <div>
            <p className="text-xs font-semibold text-brand-dark mb-2">{t("knowledge.heldQuestion")}</p>
            <div className="flex gap-4">
              {([true, false] as const).map((v) => (
                <label key={String(v)} className="flex items-center gap-1.5 cursor-pointer text-sm">
                  <input
                    type="radio"
                    name={`held-${config.key}`}
                    checked={entry.held === v}
                    onChange={() => up("held", v)}
                    className="accent-brand-gold"
                  />
                  {v ? t("review.yes") : t("review.no")}
                </label>
              ))}
            </div>
          </div>

          {entry.held && (
            <>
              {/* Holding period */}
              <div>
                <p className="text-xs font-semibold text-brand-dark mb-2">{t("knowledge.holdingPeriod")}</p>
                <div className="flex gap-4">
                  {config.holdingOptions.map(([val, lbl]) => (
                    <label key={val} className="flex items-center gap-1.5 cursor-pointer text-sm">
                      <input
                        type="radio"
                        name={`holding-${config.key}`}
                        checked={entry.holdingPeriod === val}
                        onChange={() => up("holdingPeriod", val)}
                        className="accent-brand-gold"
                      />
                      {lbl}
                    </label>
                  ))}
                </div>
              </div>

              {/* Operations per year */}
              <div>
                <p className="text-xs font-semibold text-brand-dark mb-2">{t("knowledge.opsPerYear")}</p>
                <div className="flex gap-4">
                  {([["<1", t("knowledge.ops1")], ["1-5", t("knowledge.ops1to5")], ["6+", t("knowledge.ops6plus")]] as [OpsPerYear, string][]).map(([val, lbl]) => (
                    <label key={val} className="flex items-center gap-1.5 cursor-pointer text-sm">
                      <input
                        type="radio"
                        name={`ops-${config.key}`}
                        checked={entry.opsPerYear === val}
                        onChange={() => up("opsPerYear", val)}
                        className="accent-brand-gold"
                      />
                      {lbl}
                    </label>
                  ))}
                </div>
              </div>

              {/* Volume */}
              <div>
                <p className="text-xs font-semibold text-brand-dark mb-2">{t("knowledge.volume")}</p>
                <div className="flex flex-wrap gap-3">
                  {([["<5k", t("knowledge.volBelow5k")], ["5-10k", t("knowledge.vol5to10k")], ["10-50k", t("knowledge.vol10to50k")], [">50k", t("knowledge.volAbove50k")]] as [VolumeOps, string][]).map(([val, lbl]) => (
                    <label key={val} className="flex items-center gap-1.5 cursor-pointer text-sm">
                      <input
                        type="radio"
                        name={`vol-${config.key}`}
                        checked={entry.volume === val}
                        onChange={() => up("volume", val)}
                        className="accent-brand-gold"
                      />
                      {lbl}
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Knowledge questions */}
          <div className="space-y-3 pt-2 border-t border-brand-grayLight">
            <TFNGroup
              name={`q1-${config.key}`}
              question={config.q1}
              value={entry.q1}
              onChange={(v) => up("q1", v)}
              trueLabel={t("knowledge.trueLabel")}
              falseLabel={t("knowledge.falseLabel")}
              dontKnow={t("knowledge.dontKnow")}
            />
            <TFNGroup
              name={`q2-${config.key}`}
              question={config.q2}
              value={entry.q2}
              onChange={(v) => up("q2", v)}
              trueLabel={t("knowledge.trueLabel")}
              falseLabel={t("knowledge.falseLabel")}
              dontKnow={t("knowledge.dontKnow")}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function YNRow({
  label,
  name,
  value,
  onChange,
  yesLabel,
  noLabel,
}: {
  label: string;
  name: string;
  value: boolean | null;
  onChange: (v: boolean) => void;
  yesLabel: string;
  noLabel: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-brand-grayLight last:border-0">
      <span className="text-sm font-semibold text-brand-dark">{label} <span className="text-red-500">*</span></span>
      <div className="flex gap-4">
        {([true, false] as const).map((v) => (
          <label key={String(v)} className="flex items-center gap-1.5 cursor-pointer text-sm">
            <input
              type="radio"
              name={name}
              checked={value === v}
              onChange={() => onChange(v)}
              className="accent-brand-gold"
            />
            {v ? yesLabel : noLabel}
          </label>
        ))}
      </div>
    </div>
  );
}

export function IATStepKnowledge({ formData, onChange, onNext, error, setError }: Props) {
  const t = useTranslations("iat");
  const pk = formData.productKnowledge;

  const PRODUCTS: ProductConfig[] = [
    {
      key: "monetary",
      label: t("knowledge.productMonetary"),
      holdingOptions: [["<4", t("knowledge.holdingLt4")], ["+4", t("knowledge.holdingGt4")]],
      q1: t("knowledge.q1Monetary"),
      q2: t("knowledge.q2Monetary"),
    },
    {
      key: "bonds",
      label: t("knowledge.productBonds"),
      holdingOptions: [["<4", t("knowledge.holdingLt4")], ["+4", t("knowledge.holdingGt4")]],
      q1: t("knowledge.q1Bonds"),
      q2: t("knowledge.q2Bonds"),
    },
    {
      key: "stocks",
      label: t("knowledge.productStocks"),
      holdingOptions: [["<4", t("knowledge.holdingLt4")], ["+4", t("knowledge.holdingGt4")]],
      q1: t("knowledge.q1Stocks"),
      q2: t("knowledge.q2Stocks"),
    },
    {
      key: "scpi",
      label: t("knowledge.productScpi"),
      holdingOptions: [["<10", t("knowledge.holdingLt10")], ["+10", t("knowledge.holdingGt10")]],
      q1: t("knowledge.q1Scpi"),
      q2: t("knowledge.q2Scpi"),
    },
    {
      key: "privateEquity",
      label: t("knowledge.productPrivateEquity"),
      holdingOptions: [["<8", t("knowledge.holdingLt8")], ["+8", t("knowledge.holdingGt8")]],
      q1: t("knowledge.q1Pe"),
      q2: t("knowledge.q2Pe"),
    },
    {
      key: "etf",
      label: t("knowledge.productEtf"),
      holdingOptions: [["<4", t("knowledge.holdingLt4")], ["+4", t("knowledge.holdingGt4")]],
      q1: t("knowledge.q1Etf"),
      q2: t("knowledge.q2Etf"),
    },
    {
      key: "derivatives",
      label: t("knowledge.productDerivatives"),
      holdingOptions: [["<4", t("knowledge.holdingLt4")], ["+4", t("knowledge.holdingGt4")]],
      q1: t("knowledge.q1Derivatives"),
      q2: t("knowledge.q2Derivatives"),
    },
    {
      key: "structured",
      label: t("knowledge.productStructured"),
      holdingOptions: [["<4", t("knowledge.holdingLt4")], ["+4", t("knowledge.holdingGt4")]],
      q1: t("knowledge.q1Structured"),
      q2: t("knowledge.q2Structured"),
    },
  ];

  const updateProduct = (key: ProductKey, d: Partial<ProductEntry>) => {
    onChange({
      productKnowledge: {
        ...pk,
        [key]: { ...(pk[key] as ProductEntry), ...d },
      },
    });
  };

  const upPK = (field: keyof ProductKnowledge, val: unknown) =>
    onChange({ productKnowledge: { ...pk, [field]: val } });

  const handleNext = () => {
    for (const config of PRODUCTS) {
      const entry = pk[config.key] as ProductEntry;
      if (entry.held === null) {
        setError(t("knowledge.errProduct", { label: config.label }));
        return;
      }
    }
    if (pk.managedPortfolio === null) { setError(t("knowledge.errManagedPortfolio")); return; }
    if (pk.selfManaged === null) { setError(t("knowledge.errSelfManaged")); return; }
    if (pk.advisedPortfolio === null) { setError(t("knowledge.errAdvisedPortfolio")); return; }
    if (pk.financialSectorExp === null) { setError(t("knowledge.errFinancialSectorExp")); return; }
    if (pk.readsPress === null) { setError(t("knowledge.errReadsPress")); return; }
    if (pk.followsMarkets === null) { setError(t("knowledge.errFollowsMarkets")); return; }
    if (pk.checksMonthly === null) { setError(t("knowledge.errChecksMonthly")); return; }
    setError("");
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-brand-grayMed">
          {t("knowledge.intro")}
        </p>
      </div>

      {/* Product cards */}
      <div className="space-y-2">
        {PRODUCTS.map((config) => (
          <ProductCard
            key={config.key}
            config={config}
            entry={pk[config.key] as ProductEntry}
            onChange={(d) => updateProduct(config.key, d)}
            t={t}
          />
        ))}
      </div>

      {/* Portfolio management */}
      <div className="rounded-xl border border-brand-grayLight overflow-hidden">
        <div className="bg-brand-dark/5 px-4 py-2.5">
          <p className="text-xs font-bold text-brand-dark uppercase tracking-wide">{t("knowledge.portfolioSection")}</p>
        </div>
        <div className="px-4 py-3">
          <YNRow label={t("knowledge.managedPortfolio")} name="managed" value={pk.managedPortfolio} onChange={(v) => upPK("managedPortfolio", v)} yesLabel={t("review.yes")} noLabel={t("review.no")} />
          <YNRow label={t("knowledge.selfManaged")} name="self-managed" value={pk.selfManaged} onChange={(v) => upPK("selfManaged", v)} yesLabel={t("review.yes")} noLabel={t("review.no")} />
          <YNRow label={t("knowledge.advisedPortfolio")} name="advised" value={pk.advisedPortfolio} onChange={(v) => upPK("advisedPortfolio", v)} yesLabel={t("review.yes")} noLabel={t("review.no")} />
          <YNRow label={t("knowledge.financialSectorExp")} name="fin-sector" value={pk.financialSectorExp} onChange={(v) => upPK("financialSectorExp", v)} yesLabel={t("review.yes")} noLabel={t("review.no")} />
        </div>
      </div>

      {/* Financial culture */}
      <div className="rounded-xl border border-brand-grayLight overflow-hidden">
        <div className="bg-brand-dark/5 px-4 py-2.5">
          <p className="text-xs font-bold text-brand-dark uppercase tracking-wide">{t("knowledge.cultureSection")}</p>
        </div>
        <div className="px-4 py-3">
          <YNRow label={t("knowledge.readsPress")} name="reads-press" value={pk.readsPress} onChange={(v) => upPK("readsPress", v)} yesLabel={t("review.yes")} noLabel={t("review.no")} />
          <YNRow label={t("knowledge.followsMarkets")} name="follows-markets" value={pk.followsMarkets} onChange={(v) => upPK("followsMarkets", v)} yesLabel={t("review.yes")} noLabel={t("review.no")} />
          <YNRow label={t("knowledge.checksMonthly")} name="checks-monthly" value={pk.checksMonthly} onChange={(v) => upPK("checksMonthly", v)} yesLabel={t("review.yes")} noLabel={t("review.no")} />
        </div>
      </div>

      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
      <Button variant="primary" size="lg" className="w-full" onClick={handleNext}>
        {t("knowledge.nextBtn")}
      </Button>
    </div>
  );
}
