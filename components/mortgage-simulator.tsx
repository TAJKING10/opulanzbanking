"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Calculator, Home, CreditCard, TrendingUp, AlertCircle, AlertTriangle, User, Users } from "lucide-react";

const DEPENDENT_COST = 350;
const MIN_INCOME_SOLO = 900;
const MIN_INCOME_JOINT = 1200;
const MIN_LOAN = 20000;

function computeResult(
  income: number,
  coIncome: number,
  hasCoApplicant: boolean,
  dependents: number,
  existing: number,
  durationYears: number,
  rate: number,
  contribAmount: number,
  contribMode: "amount" | "percent",
  contribPct: number,
) {
  const totalIncome = hasCoApplicant ? income + coIncome : income;
  if (totalIncome <= 0) return { result: null, totalIncome, maxMonthly: 0 };

  // Deduct dependent living costs first, then apply 33% DTI cap
  // This ensures each additional dependent reduces the borrowing capacity
  const effectiveIncome = totalIncome - dependents * DEPENDENT_COST;
  if (effectiveIncome <= 0) return { result: null, totalIncome, maxMonthly: 0 };

  // France (HCSF 2021-R-01) / Luxembourg (CSSF 23/837): DTI ≤ 33% of effective income
  const maxMonthly = effectiveIncome * 0.33 - existing;

  if (maxMonthly <= 0) {
    return { result: null, totalIncome, maxMonthly };
  }

  const r = rate / 100 / 12;
  const n = durationYears * 12;
  const pow = r === 0 ? 1 : Math.pow(1 + r, n);
  const maxLoan = r === 0 ? maxMonthly * n : (maxMonthly * (pow - 1)) / (r * pow);

  let contribution: number;
  let propertyBudget: number;
  if (contribMode === "percent") {
    const pct = Math.min(contribPct, 95) / 100;
    propertyBudget = maxLoan / (1 - pct);
    contribution = propertyBudget * pct;
  } else {
    contribution = contribAmount;
    propertyBudget = maxLoan + contribution;
  }

  return {
    result: {
      maxLoan,
      propertyBudget,
      monthlyPayment: maxMonthly,
      debtRatio: Math.round(((maxMonthly + existing) / effectiveIncome) * 100),
      contribution,
    },
    totalIncome,
    maxMonthly,
  };
}

function fmt(n: number): string {
  return "€" + Math.round(n).toLocaleString("de-CH");
}

function SliderField({
  label,
  value,
  displayValue,
  min,
  max,
  step,
  minLabel,
  maxLabel,
  onChange,
}: {
  label: string;
  value: number;
  displayValue: string;
  min: number;
  max: number;
  step: number;
  minLabel: string;
  maxLabel: string;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-semibold text-brand-dark">{label}</label>
        <span className="text-sm font-bold text-brand-gold">{displayValue}</span>
      </div>
      <div className="relative h-2">
        <div className="absolute inset-0 bg-brand-grayLight rounded-full" />
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-brand-gold to-brand-goldDark"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-2 border-brand-gold shadow-md pointer-events-none"
          style={{ left: `calc(${pct}% - 10px)` }}
        />
      </div>
      <div className="flex justify-between text-xs text-brand-grayMed mt-2">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const [raw, setRaw] = React.useState(String(value));

  // Keep raw in sync if the parent resets the value externally
  React.useEffect(() => {
    if (Number(raw) !== value) setRaw(String(value));
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <label className="text-sm font-semibold text-brand-dark block mb-1.5">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-grayMed text-sm font-semibold">€</span>
        <input
          type="text"
          inputMode="numeric"
          value={raw}
          onChange={(e) => {
            const v = e.target.value;
            if (v === "" || /^\d+$/.test(v)) {
              // Strip leading zeros so typing "7" into "0" gives "7", not "07"
              const normalized = v === "" ? "" : v.replace(/^0+(\d)/, "$1");
              setRaw(normalized);
              onChange(Math.max(0, Number(normalized) || 0));
            }
          }}
          onBlur={() => {
            const n = Math.max(0, Number(raw) || 0);
            setRaw(String(n));
            onChange(n);
          }}
          className="w-full pl-8 pr-3 py-2.5 border border-brand-grayLight rounded-xl text-sm font-semibold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold transition-colors"
        />
      </div>
    </div>
  );
}

export function MortgageSimulator({ locale }: { locale: string }) {
  const t = useTranslations("mortgage.simulator");

  // Applicant
  const [hasCoApplicant, setHasCoApplicant] = React.useState(false);
  const [income, setIncome] = React.useState(5000);
  const [dependents, setDependents] = React.useState(0);

  // Loan
  const [duration, setDuration] = React.useState(20);
  const [rate, setRate] = React.useState(4.0);
  const [contribAmount, setContribAmount] = React.useState(50000);
  const [existing, setExisting] = React.useState(0);

  const { result, totalIncome, maxMonthly } = computeResult(
    income, 0, hasCoApplicant, dependents,
    existing, duration, rate, contribAmount, "amount", 20,
  );

  // Derived % = contribution / (contribution + maxLoan) * 100
  const maxLoan = result?.maxLoan ?? 0;
  const derivedPct = maxLoan > 0
    ? Math.round((contribAmount / (contribAmount + maxLoan)) * 100)
    : 0;

  function handlePctChange(pct: number) {
    const clamped = Math.min(95, Math.max(0, pct));
    if (maxLoan > 0) {
      // contribution = maxLoan * pct / (1 - pct)
      const newContrib = Math.round(maxLoan * (clamped / 100) / (1 - clamped / 100));
      setContribAmount(Math.max(0, newContrib));
    }
  }

  // Minimum income warning — shown as a full-width banner; suppresses results panel
  const minRequired = hasCoApplicant ? MIN_INCOME_JOINT : MIN_INCOME_SOLO;
  const incomeWarning = income > 0 && income < minRequired
    ? (hasCoApplicant ? t("warnings.minIncomeJoint") : t("warnings.minIncomeSolo"))
    : null;

  // Other contextual warnings shown inside the results column
  const warnings: string[] = [];
  if (!incomeWarning && result && result.maxLoan < MIN_LOAN) {
    warnings.push(t("warnings.minLoan"));
  }
  if (!incomeWarning && maxMonthly <= 0 && totalIncome > 0) {
    warnings.push(t("warnings.negativeDTI"));
  }

  const depOptions = [
    { value: 0, label: t("inputs.dep0") },
    { value: 1, label: t("inputs.dep1") },
    { value: 2, label: t("inputs.dep2") },
    { value: 3, label: t("inputs.dep3") },
  ];

  return (
    <section
      id="simulator"
      className="relative bg-gradient-to-b from-gray-50 via-white to-gray-50 py-12 md:py-16 overflow-hidden"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-16 -right-24 w-80 h-80 bg-brand-gold/6 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -left-24 w-80 h-80 bg-brand-gold/4 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto max-w-6xl px-6 relative z-10">
        {/* Heading */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-brand-gold/10 px-4 py-1.5 rounded-full mb-4">
            <Calculator className="h-3.5 w-3.5 text-brand-gold" />
            <span className="text-xs font-bold uppercase tracking-widest text-brand-gold">{t("overline")}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-brand-dark mb-3">{t("title")}</h2>
          <p className="text-brand-grayMed max-w-xl mx-auto text-base leading-relaxed">{t("description")}</p>
        </div>

        {/* Full-width income warning — suppresses the results panel */}
        {incomeWarning && (
          <div className="mb-8 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 leading-relaxed">{incomeWarning}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* ── Inputs ── */}
          <div className="bg-white rounded-2xl shadow-xl border border-brand-grayLight/50 overflow-hidden">

            {/* Section: Applicant */}
            <div className="p-6 border-b border-brand-grayLight/60">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-grayMed mb-4">{t("inputs.sectionApplicant")}</p>

              {/* Solo / Co-applicant toggle */}
              <div className="flex rounded-xl border border-brand-grayLight overflow-hidden mb-5">
                <button
                  type="button"
                  onClick={() => setHasCoApplicant(false)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-colors ${
                    !hasCoApplicant
                      ? "bg-brand-gold text-white"
                      : "bg-white text-brand-grayMed hover:bg-gray-50"
                  }`}
                >
                  <User className="h-4 w-4" />
                  {t("inputs.solo")}
                </button>
                <button
                  type="button"
                  onClick={() => setHasCoApplicant(true)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-colors ${
                    hasCoApplicant
                      ? "bg-brand-gold text-white"
                      : "bg-white text-brand-grayMed hover:bg-gray-50"
                  }`}
                >
                  <Users className="h-4 w-4" />
                  {t("inputs.withCoApplicant")}
                </button>
              </div>

              {/* Income — single field, label changes based on applicant type */}
              <SliderField
                label={hasCoApplicant ? t("inputs.incomeCombined") : t("inputs.income")}
                value={income}
                displayValue={`€${income.toLocaleString()}`}
                min={0}
                max={30000}
                step={100}
                minLabel="€0"
                maxLabel="€30,000"
                onChange={setIncome}
              />

              {/* Dependents */}
              <div>
                <label className="text-sm font-semibold text-brand-dark block mb-2">{t("inputs.dependents")}</label>
                <div className="flex gap-2">
                  {depOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setDependents(opt.value)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                        dependents === opt.value
                          ? "bg-brand-gold border-brand-gold text-white"
                          : "bg-white border-brand-grayLight text-brand-grayMed hover:border-brand-gold/50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {dependents > 0 && (
                  <p className="text-xs text-brand-grayMed mt-2">
                    {t("inputs.dependentNote", { amount: dependents * DEPENDENT_COST })}
                  </p>
                )}
              </div>
            </div>

            {/* Section: Loan details */}
            <div className="p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-grayMed mb-4">{t("inputs.sectionLoan")}</p>

              <SliderField
                label={t("inputs.duration")}
                value={duration}
                displayValue={`${duration} ${t("inputs.years")}`}
                min={5}
                max={30}
                step={1}
                minLabel={`5 ${t("inputs.years")}`}
                maxLabel={`30 ${t("inputs.years")}`}
                onChange={setDuration}
              />

              <SliderField
                label={t("inputs.rate")}
                value={rate}
                displayValue={`${rate.toFixed(1)}%`}
                min={1.5}
                max={6}
                step={0.1}
                minLabel="1.5%"
                maxLabel="6.0%"
                onChange={setRate}
              />

              {/* Down payment — linked € and % inputs */}
              <div className="mb-5">
                <label className="text-sm font-semibold text-brand-dark block mb-2">{t("inputs.downPayment")}</label>
                <div className="grid grid-cols-2 gap-3">
                  {/* € amount */}
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-grayMed text-sm font-semibold">€</span>
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      value={contribAmount}
                      onChange={(e) => setContribAmount(Math.max(0, Number(e.target.value) || 0))}
                      className="w-full pl-8 pr-3 py-2.5 border border-brand-grayLight rounded-xl text-sm font-semibold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold transition-colors"
                    />
                  </div>
                  {/* % amount — auto-calculated, also editable; disabled when no valid loan result */}
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={95}
                      step={1}
                      value={derivedPct}
                      onChange={(e) => handlePctChange(Number(e.target.value) || 0)}
                      disabled={maxLoan < MIN_LOAN}
                      className="w-full pl-3 pr-8 py-2.5 border border-brand-grayLight rounded-xl text-sm font-semibold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold transition-colors disabled:bg-gray-100 disabled:text-brand-grayMed disabled:cursor-not-allowed disabled:opacity-60"
                    />
                    <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold transition-opacity ${maxLoan < MIN_LOAN ? "text-brand-grayMed opacity-40" : "text-brand-grayMed"}`}>%</span>
                  </div>
                </div>
                {/* Info notes */}
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-gold mt-1.5 flex-shrink-0" />
                    <p className="text-xs text-brand-grayMed leading-relaxed">{t("inputs.downPaymentNote1")}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-gold mt-1.5 flex-shrink-0" />
                    <p className="text-xs text-brand-grayMed leading-relaxed">{t("inputs.downPaymentNote2")}</p>
                  </div>
                </div>
              </div>

              <NumberField
                label={t("inputs.existing")}
                value={existing}
                onChange={setExisting}
              />
            </div>
          </div>

          {/* ── Results ── hidden when income is below minimum threshold */}
          <div className="space-y-4">
            {/* Contextual warnings (minLoan, negativeDTI) */}
            {!incomeWarning && warnings.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
                {warnings.map((w, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800 leading-relaxed">{w}</p>
                  </div>
                ))}
              </div>
            )}

            {!incomeWarning && result && result.maxLoan >= MIN_LOAN ? (
              <>
                {/* Property budget — hero card */}
                <div className="relative overflow-hidden bg-gradient-to-br from-brand-gold via-brand-gold to-brand-goldDark rounded-2xl shadow-xl p-8">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-1">
                      <Home className="h-4 w-4 text-white/70" />
                      <p className="text-white/70 text-xs font-bold uppercase tracking-widest">{t("results.budget")}</p>
                    </div>
                    <p className="text-5xl font-extrabold text-white tracking-tight leading-none mt-2">
                      {fmt(result.propertyBudget)}
                    </p>
                    <p className="text-white/70 text-sm mt-3">
                      {t("results.budgetSub")} {fmt(result.contribution)}
                    </p>
                    {hasCoApplicant && (
                      <div className="mt-3 inline-flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1">
                        <Users className="h-3 w-3 text-white/80" />
                        <span className="text-white/80 text-xs font-semibold">{t("results.jointApplication")}</span>
                      </div>
                    )}
                  </div>
                  <div className="absolute right-6 bottom-4 w-24 h-24 bg-white/5 rounded-full" />
                  <div className="absolute right-10 bottom-8 w-12 h-12 bg-white/5 rounded-full" />
                </div>

                {/* Max loan + Monthly payment */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl shadow-lg p-5 border border-brand-grayLight/50">
                    <div className="flex items-center gap-1.5 mb-2">
                      <CreditCard className="h-3.5 w-3.5 text-brand-gold" />
                      <p className="text-xs font-bold text-brand-grayMed uppercase tracking-wider">{t("results.maxLoan")}</p>
                    </div>
                    <p className="text-2xl font-extrabold text-brand-dark">{fmt(result.maxLoan)}</p>
                  </div>
                  <div className="bg-white rounded-2xl shadow-lg p-5 border border-brand-grayLight/50">
                    <div className="flex items-center gap-1.5 mb-2">
                      <TrendingUp className="h-3.5 w-3.5 text-brand-gold" />
                      <p className="text-xs font-bold text-brand-grayMed uppercase tracking-wider">{t("results.monthly")}</p>
                    </div>
                    <p className="text-2xl font-extrabold text-brand-dark">{fmt(result.monthlyPayment)}</p>
                    <p className="text-xs text-brand-grayMed mt-0.5">{t("results.perMonth")}</p>
                  </div>
                </div>

                {/* DTI bar */}
                <div className="bg-white rounded-2xl shadow-lg p-5 border border-brand-grayLight/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-brand-dark">{t("results.dti")}</span>
                    <span className={`text-sm font-bold ${result.debtRatio <= 33 ? "text-emerald-600" : "text-amber-600"}`}>
                      {result.debtRatio}%
                    </span>
                  </div>
                  <div className="h-2 bg-brand-grayLight rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${result.debtRatio <= 33 ? "bg-emerald-500" : "bg-amber-500"}`}
                      style={{ width: `${Math.min(result.debtRatio, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <p className="text-xs text-brand-grayMed">{t("results.dtiNote")}</p>
                    <span className="text-xs font-bold text-brand-grayMed">33%</span>
                  </div>
                </div>

                {/* CTA */}
                <div className="bg-brand-dark rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-white/80 text-sm leading-snug">{t("results.ctaText")}</p>
                  <Link
                    href={`/${locale}/mortgage/apply`}
                    className="flex-shrink-0 inline-flex items-center justify-center h-11 px-6 rounded-xl bg-gradient-to-r from-brand-gold to-brand-goldDark text-white font-semibold text-sm hover:opacity-90 transition-opacity whitespace-nowrap"
                  >
                    {t("results.ctaButton")} →
                  </Link>
                </div>
              </>
            ) : (
              !warnings.length && (
                <div className="bg-white rounded-2xl shadow-lg p-10 border border-brand-grayLight/50 flex flex-col items-center text-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-brand-gold/10 flex items-center justify-center">
                    <AlertCircle className="h-7 w-7 text-brand-gold" />
                  </div>
                  <p className="text-brand-grayMed text-sm leading-relaxed max-w-xs">
                    {income <= 0 ? t("results.emptyIncome") : t("results.emptyDTI")}
                  </p>
                </div>
              )
            )}

            <p className="text-xs text-brand-grayMed leading-relaxed px-1">
              * {t("disclaimer")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
