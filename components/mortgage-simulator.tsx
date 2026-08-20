"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Calculator, Home, CreditCard, TrendingUp, AlertCircle } from "lucide-react";

function compute(income: number, existing: number, durationYears: number, rate: number, contribution: number) {
  const maxMonthly = income * 0.33 - existing;
  if (maxMonthly <= 0 || income <= 0) return null;

  const r = rate / 100 / 12;
  const n = durationYears * 12;
  const pow = r === 0 ? 1 : Math.pow(1 + r, n);
  const maxLoan = r === 0 ? maxMonthly * n : maxMonthly * (pow - 1) / (r * pow);

  return {
    maxLoan,
    propertyBudget: maxLoan + contribution,
    monthlyPayment: maxMonthly,
    debtRatio: Math.round(((maxMonthly + existing) / income) * 100),
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
  return (
    <div>
      <label className="text-sm font-semibold text-brand-dark block mb-1.5">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-grayMed text-sm font-semibold">€</span>
        <input
          type="number"
          min={0}
          step={1000}
          value={value}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
          className="w-full pl-8 pr-3 py-2.5 border border-brand-grayLight rounded-xl text-sm font-semibold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold transition-colors"
        />
      </div>
    </div>
  );
}

export function MortgageSimulator({ locale }: { locale: string }) {
  const t = useTranslations("mortgage.simulator");

  const [income, setIncome] = React.useState(5000);
  const [existing, setExisting] = React.useState(0);
  const [duration, setDuration] = React.useState(20);
  const [rate, setRate] = React.useState(4.0);
  const [contribution, setContribution] = React.useState(50000);

  const result = compute(income, existing, duration, rate, contribution);

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

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Inputs */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-brand-grayLight/50">
            <h3 className="text-base font-bold text-brand-dark mb-6 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand-gold/10 flex items-center justify-center">
                <Calculator className="h-4 w-4 text-brand-gold" />
              </div>
              {t("inputs.title")}
            </h3>

            <SliderField
              label={t("inputs.income")}
              value={income}
              displayValue={`€${income.toLocaleString()}`}
              min={1000}
              max={20000}
              step={500}
              minLabel="€1,000"
              maxLabel="€20,000"
              onChange={setIncome}
            />

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

            <div className="grid grid-cols-2 gap-4 mt-2">
              <NumberField
                label={t("inputs.contribution")}
                value={contribution}
                onChange={setContribution}
              />
              <NumberField
                label={t("inputs.existing")}
                value={existing}
                onChange={setExisting}
              />
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            {result ? (
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
                      {t("results.budgetSub")} {fmt(contribution)}
                    </p>
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
                    <span
                      className={`text-sm font-bold ${
                        result.debtRatio <= 33 ? "text-emerald-600" : "text-amber-600"
                      }`}
                    >
                      {result.debtRatio}%
                    </span>
                  </div>
                  <div className="h-2 bg-brand-grayLight rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        result.debtRatio <= 33 ? "bg-emerald-500" : "bg-amber-500"
                      }`}
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
              <div className="bg-white rounded-2xl shadow-lg p-10 border border-brand-grayLight/50 flex flex-col items-center text-center gap-4">
                <div className="w-14 h-14 rounded-full bg-brand-gold/10 flex items-center justify-center">
                  <AlertCircle className="h-7 w-7 text-brand-gold" />
                </div>
                <p className="text-brand-grayMed text-sm leading-relaxed max-w-xs">
                  {income <= 0
                    ? t("results.emptyIncome")
                    : t("results.emptyDTI")}
                </p>
              </div>
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
