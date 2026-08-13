"use client";

import * as React from "react";
import Link from "next/link";
import {
  ClipboardList,
  FileText,
  Send,
  PenLine,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Upload,
  X,
  Home,
  Building,
  Landmark,
  ArrowRight,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { SectionHeading } from "@/components/section-heading";

type Step = 1 | 2 | 3 | 4;

const STEP_ICONS = [ClipboardList, FileText, Send, PenLine] as const;

const PROPERTY_TYPES = [
  { value: "primary", labelKey: "step1.propertyTypes.primary" },
  { value: "secondary", labelKey: "step1.propertyTypes.secondary" },
  { value: "investment", labelKey: "step1.propertyTypes.investment" },
] as const;

const EMPLOYMENT_TYPES = [
  { value: "employee", labelKey: "step1.employmentTypes.employee" },
  { value: "self_employed", labelKey: "step1.employmentTypes.selfEmployed" },
  { value: "civil_servant", labelKey: "step1.employmentTypes.civilServant" },
  { value: "retired", labelKey: "step1.employmentTypes.retired" },
] as const;

const MARKETS = [
  { value: "france", labelKey: "step1.markets.france", flag: "🇫🇷" },
  { value: "luxembourg", labelKey: "step1.markets.luxembourg", flag: "🇱🇺" },
] as const;

const DOC_SLOTS = [
  { id: "id", labelKey: "step2.docs.id", required: true },
  { id: "payslips", labelKey: "step2.docs.payslips", required: true },
  { id: "bankStatements", labelKey: "step2.docs.bankStatements", required: true },
  { id: "proofAddress", labelKey: "step2.docs.proofAddress", required: true },
  { id: "taxReturn", labelKey: "step2.docs.taxReturn", required: false },
  { id: "propertyDetails", labelKey: "step2.docs.propertyDetails", required: false },
] as const;

interface FormData {
  market: string;
  propertyType: string;
  purchasePrice: string;
  contribution: string;
  monthlyIncome: string;
  employment: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  docs: Record<string, File[]>;
  consent: boolean;
}

const empty: FormData = {
  market: "",
  propertyType: "",
  purchasePrice: "",
  contribution: "",
  monthlyIncome: "",
  employment: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  docs: {},
  consent: false,
};

function formatEur(value: string) {
  const n = parseInt(value.replace(/\D/g, ""), 10);
  if (isNaN(n)) return "";
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
}

function ltv(form: FormData) {
  const price = parseInt(form.purchasePrice.replace(/\D/g, ""), 10);
  const contrib = parseInt(form.contribution.replace(/\D/g, ""), 10);
  if (!price || !contrib || price <= 0) return null;
  return Math.round(((price - contrib) / price) * 100);
}

export default function MortgageApplyPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = useTranslations("mortgage.apply");
  const tSteps = useTranslations("mortgage.howItWorks");

  const [step, setStep] = React.useState<Step>(1);
  const [form, setForm] = React.useState<FormData>(empty);
  const [submitted, setSubmitted] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const set = (key: keyof FormData, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => { const e = { ...prev }; delete e[key]; return e; });
  };

  const addDoc = (slotId: string, files: File[]) => {
    setForm((prev) => ({
      ...prev,
      docs: { ...prev.docs, [slotId]: [...(prev.docs[slotId] || []), ...files] },
    }));
  };

  const removeDoc = (slotId: string, idx: number) => {
    setForm((prev) => {
      const updated = [...(prev.docs[slotId] || [])];
      updated.splice(idx, 1);
      return { ...prev, docs: { ...prev.docs, [slotId]: updated } };
    });
  };

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!form.market) e.market = t("errors.required");
    if (!form.propertyType) e.propertyType = t("errors.required");
    if (!form.purchasePrice) e.purchasePrice = t("errors.required");
    if (!form.contribution) e.contribution = t("errors.required");
    if (!form.monthlyIncome) e.monthlyIncome = t("errors.required");
    if (!form.employment) e.employment = t("errors.required");
    if (!form.firstName.trim()) e.firstName = t("errors.required");
    if (!form.lastName.trim()) e.lastName = t("errors.required");
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = t("errors.invalidEmail");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const missing = DOC_SLOTS.filter(
      (s) => s.required && !(form.docs[s.id]?.length > 0)
    );
    if (missing.length > 0) {
      setErrors({ docs: t("errors.requiredDocs") });
      return false;
    }
    setErrors({});
    return true;
  };

  const next = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep((s) => (s + 1) as Step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const back = () => {
    setStep((s) => (s - 1) as Step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = () => {
    if (!form.consent) {
      setErrors({ consent: t("errors.consent") });
      return;
    }
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const ltvValue = ltv(form);

  const stepDefs = [
    { num: 1 as Step, titleKey: "step1.title" as const },
    { num: 2 as Step, titleKey: "step2.title" as const },
    { num: 3 as Step, titleKey: "step3.title" as const },
    { num: 4 as Step, titleKey: "step4.title" as const },
  ];

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center px-6 py-20">
        <div className="max-w-lg w-full text-center">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-brand-gold to-brand-goldDark mb-6 shadow-xl">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-brand-dark mb-3">{t("success.title")}</h1>
          <p className="text-brand-grayMed mb-2">{t("success.line1")}</p>
          <p className="text-brand-grayMed mb-8">{t("success.line2")}</p>
          <div className="bg-brand-gold/10 border border-brand-gold/30 rounded-2xl p-5 mb-8 text-left">
            <div className="text-xs font-bold uppercase tracking-widest text-brand-gold mb-3">{t("success.summaryTitle")}</div>
            <div className="space-y-2 text-sm text-brand-dark">
              <div className="flex justify-between"><span className="text-brand-grayMed">{t("step1.name")}</span><span className="font-medium">{form.firstName} {form.lastName}</span></div>
              <div className="flex justify-between"><span className="text-brand-grayMed">{t("step1.email")}</span><span className="font-medium">{form.email}</span></div>
              {form.purchasePrice && <div className="flex justify-between"><span className="text-brand-grayMed">{t("step1.purchasePrice")}</span><span className="font-medium">{formatEur(form.purchasePrice)}</span></div>}
              {ltvValue !== null && <div className="flex justify-between"><span className="text-brand-grayMed">{t("step1.ltv")}</span><span className="font-medium">{ltvValue}%</span></div>}
            </div>
          </div>
          <Link
            href={`/${locale}/mortgage`}
            className="inline-flex items-center gap-2 text-brand-gold font-semibold hover:underline"
          >
            <ChevronLeft className="h-4 w-4" />
            {t("success.back")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50/40 to-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-brand-grayLight">
        <div className="container mx-auto max-w-4xl px-6 py-6">
          <Link href={`/${locale}/mortgage`} className="inline-flex items-center gap-2 text-sm text-brand-grayMed hover:text-brand-dark transition-colors mb-4">
            <ChevronLeft className="h-4 w-4" />
            {t("backToMortgage")}
          </Link>
          <SectionHeading
            overline={t("overline")}
            title={t("title")}
            align="left"
            className="mb-0"
          />
        </div>
      </div>

      {/* Step Indicator */}
      <div className="bg-white border-b border-brand-grayLight">
        <div className="container mx-auto max-w-4xl px-6 py-6">
          <div className="flex items-center justify-between relative">
            {/* connector line */}
            <div className="absolute left-0 right-0 top-5 h-0.5 bg-brand-grayLight" style={{ zIndex: 0 }} />
            <div
              className="absolute left-0 top-5 h-0.5 bg-gradient-to-r from-brand-gold to-brand-gold/60 transition-all duration-500"
              style={{ zIndex: 1, width: `${((step - 1) / 3) * 100}%` }}
            />

            {stepDefs.map((s, idx) => {
              const Icon = STEP_ICONS[idx];
              const active = step === s.num;
              const done = step > s.num;
              return (
                <div key={s.num} className="relative z-10 flex flex-col items-center gap-2 flex-1">
                  <div
                    className={[
                      "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300",
                      done
                        ? "bg-brand-gold border-brand-gold text-white"
                        : active
                        ? "bg-brand-gold border-brand-gold text-white shadow-lg shadow-brand-gold/30 scale-110"
                        : "bg-white border-brand-grayLight text-brand-grayMed",
                    ].join(" ")}
                  >
                    {done ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <div className="hidden sm:block text-center">
                    <div className={`text-[10px] font-bold uppercase tracking-widest ${active || done ? "text-brand-gold" : "text-brand-grayMed"}`}>
                      Step {s.num}
                    </div>
                    <div className={`text-xs font-semibold leading-tight max-w-[80px] text-center ${active ? "text-brand-dark" : "text-brand-grayMed"}`}>
                      {t(s.titleKey)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Form Body */}
      <div className="container mx-auto max-w-4xl px-6 py-10">

        {/* ─── STEP 1: Pre-Qualification ─── */}
        {step === 1 && (
          <div className="space-y-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-gold to-brand-goldDark flex items-center justify-center shadow-md">
                <ClipboardList className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-xs font-bold text-brand-gold uppercase tracking-widest">Step 1</div>
                <h2 className="text-xl font-bold text-brand-dark">{tSteps("step1.title")}</h2>
              </div>
            </div>
            <p className="text-sm text-brand-grayMed">{tSteps("step1.description")}</p>

            {/* Market */}
            <div>
              <label className="block text-sm font-semibold text-brand-dark mb-3">{t("step1.market")} <span className="text-brand-gold">*</span></label>
              <div className="grid grid-cols-2 gap-3">
                {MARKETS.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => set("market", m.value)}
                    className={[
                      "flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all",
                      form.market === m.value
                        ? "border-brand-gold bg-brand-gold/5 text-brand-dark"
                        : "border-brand-grayLight bg-white text-brand-grayMed hover:border-brand-gold/40",
                    ].join(" ")}
                  >
                    <span className="text-xl">{m.flag}</span>
                    {t(m.labelKey)}
                    {form.market === m.value && <CheckCircle className="h-4 w-4 text-brand-gold ml-auto" />}
                  </button>
                ))}
              </div>
              {errors.market && <p className="text-red-500 text-xs mt-1">{errors.market}</p>}
            </div>

            {/* Property Type */}
            <div>
              <label className="block text-sm font-semibold text-brand-dark mb-3">{t("step1.propertyType")} <span className="text-brand-gold">*</span></label>
              <div className="grid grid-cols-3 gap-3">
                {PROPERTY_TYPES.map((pt) => {
                  const Icon = pt.value === "primary" ? Home : pt.value === "secondary" ? Building : Landmark;
                  return (
                    <button
                      key={pt.value}
                      type="button"
                      onClick={() => set("propertyType", pt.value)}
                      className={[
                        "flex flex-col items-center gap-2 px-3 py-4 rounded-xl border-2 text-sm font-semibold transition-all",
                        form.propertyType === pt.value
                          ? "border-brand-gold bg-brand-gold/5 text-brand-dark"
                          : "border-brand-grayLight bg-white text-brand-grayMed hover:border-brand-gold/40",
                      ].join(" ")}
                    >
                      <Icon className={`h-6 w-6 ${form.propertyType === pt.value ? "text-brand-gold" : "text-brand-grayMed"}`} />
                      {t(pt.labelKey)}
                    </button>
                  );
                })}
              </div>
              {errors.propertyType && <p className="text-red-500 text-xs mt-1">{errors.propertyType}</p>}
            </div>

            {/* Price + Contribution */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-2">{t("step1.purchasePrice")} <span className="text-brand-gold">*</span></label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={form.purchasePrice}
                    onChange={(e) => set("purchasePrice", e.target.value.replace(/\D/g, ""))}
                    placeholder="350 000"
                    className={`w-full rounded-xl border px-4 py-3 pr-12 text-sm text-brand-dark placeholder:text-brand-grayMed focus:outline-none focus:ring-2 focus:ring-brand-gold/40 ${errors.purchasePrice ? "border-red-400" : "border-brand-grayLight"}`}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-grayMed font-bold text-sm">€</span>
                </div>
                {errors.purchasePrice && <p className="text-red-500 text-xs mt-1">{errors.purchasePrice}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-2">{t("step1.contribution")} <span className="text-brand-gold">*</span></label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={form.contribution}
                    onChange={(e) => set("contribution", e.target.value.replace(/\D/g, ""))}
                    placeholder="70 000"
                    className={`w-full rounded-xl border px-4 py-3 pr-12 text-sm text-brand-dark placeholder:text-brand-grayMed focus:outline-none focus:ring-2 focus:ring-brand-gold/40 ${errors.contribution ? "border-red-400" : "border-brand-grayLight"}`}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-grayMed font-bold text-sm">€</span>
                </div>
                {errors.contribution && <p className="text-red-500 text-xs mt-1">{errors.contribution}</p>}
              </div>
            </div>

            {/* LTV indicator */}
            {ltvValue !== null && (
              <div className="rounded-xl bg-brand-gold/5 border border-brand-gold/20 px-5 py-4 flex items-center gap-4">
                <div className="flex-1">
                  <div className="text-xs text-brand-grayMed font-medium mb-1">{t("step1.ltvLabel")}</div>
                  <div className="h-2 bg-brand-grayLight rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${ltvValue > 90 ? "bg-red-400" : ltvValue > 80 ? "bg-amber-400" : "bg-brand-gold"}`}
                      style={{ width: `${Math.min(ltvValue, 100)}%` }}
                    />
                  </div>
                </div>
                <div className={`text-xl font-extrabold ${ltvValue > 90 ? "text-red-500" : ltvValue > 80 ? "text-amber-500" : "text-brand-gold"}`}>
                  {ltvValue}%
                </div>
              </div>
            )}

            {/* Income + Employment */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-2">{t("step1.monthlyIncome")} <span className="text-brand-gold">*</span></label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={form.monthlyIncome}
                    onChange={(e) => set("monthlyIncome", e.target.value.replace(/\D/g, ""))}
                    placeholder="5 000"
                    className={`w-full rounded-xl border px-4 py-3 pr-12 text-sm text-brand-dark placeholder:text-brand-grayMed focus:outline-none focus:ring-2 focus:ring-brand-gold/40 ${errors.monthlyIncome ? "border-red-400" : "border-brand-grayLight"}`}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-grayMed font-bold text-sm">€</span>
                </div>
                {errors.monthlyIncome && <p className="text-red-500 text-xs mt-1">{errors.monthlyIncome}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-2">{t("step1.employment")} <span className="text-brand-gold">*</span></label>
                <select
                  value={form.employment}
                  onChange={(e) => set("employment", e.target.value)}
                  className={`w-full rounded-xl border px-4 py-3 text-sm text-brand-dark bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold/40 ${errors.employment ? "border-red-400" : "border-brand-grayLight"}`}
                >
                  <option value="">{t("step1.selectEmployment")}</option>
                  {EMPLOYMENT_TYPES.map((et) => (
                    <option key={et.value} value={et.value}>{t(et.labelKey)}</option>
                  ))}
                </select>
                {errors.employment && <p className="text-red-500 text-xs mt-1">{errors.employment}</p>}
              </div>
            </div>

            {/* Contact */}
            <div className="border-t border-brand-grayLight pt-6">
              <h3 className="text-sm font-bold text-brand-dark mb-4">{t("step1.contactTitle")}</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-brand-grayMed mb-2 uppercase tracking-wide">{t("step1.firstName")} <span className="text-brand-gold">*</span></label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e) => set("firstName", e.target.value)}
                    className={`w-full rounded-xl border px-4 py-3 text-sm text-brand-dark placeholder:text-brand-grayMed focus:outline-none focus:ring-2 focus:ring-brand-gold/40 ${errors.firstName ? "border-red-400" : "border-brand-grayLight"}`}
                  />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-grayMed mb-2 uppercase tracking-wide">{t("step1.lastName")} <span className="text-brand-gold">*</span></label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e) => set("lastName", e.target.value)}
                    className={`w-full rounded-xl border px-4 py-3 text-sm text-brand-dark placeholder:text-brand-grayMed focus:outline-none focus:ring-2 focus:ring-brand-gold/40 ${errors.lastName ? "border-red-400" : "border-brand-grayLight"}`}
                  />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-grayMed mb-2 uppercase tracking-wide">{t("step1.email")} <span className="text-brand-gold">*</span></label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    className={`w-full rounded-xl border px-4 py-3 text-sm text-brand-dark placeholder:text-brand-grayMed focus:outline-none focus:ring-2 focus:ring-brand-gold/40 ${errors.email ? "border-red-400" : "border-brand-grayLight"}`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-grayMed mb-2 uppercase tracking-wide">{t("step1.phone")}</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="+352 / +33"
                    className="w-full rounded-xl border border-brand-grayLight px-4 py-3 text-sm text-brand-dark placeholder:text-brand-grayMed focus:outline-none focus:ring-2 focus:ring-brand-gold/40"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── STEP 2: Document Collection ─── */}
        {step === 2 && (
          <div className="space-y-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-gold to-brand-goldDark flex items-center justify-center shadow-md">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-xs font-bold text-brand-gold uppercase tracking-widest">Step 2</div>
                <h2 className="text-xl font-bold text-brand-dark">{tSteps("step2.title")}</h2>
              </div>
            </div>
            <p className="text-sm text-brand-grayMed">{tSteps("step2.description")}</p>

            {errors.docs && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                {errors.docs}
              </div>
            )}

            <div className="grid gap-4">
              {DOC_SLOTS.map((slot) => {
                const files = form.docs[slot.id] || [];
                return (
                  <div key={slot.id} className="rounded-xl border border-brand-grayLight bg-white p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-sm font-semibold text-brand-dark">{t(slot.labelKey)}</span>
                        {slot.required ? (
                          <span className="ml-2 text-xs text-brand-gold font-bold">{t("step2.required")}</span>
                        ) : (
                          <span className="ml-2 text-xs text-brand-grayMed">{t("step2.optional")}</span>
                        )}
                      </div>
                      {files.length > 0 && <CheckCircle className="h-5 w-5 text-brand-gold" />}
                    </div>

                    {files.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {files.map((f, i) => (
                          <div key={i} className="flex items-center gap-2 bg-brand-gold/5 border border-brand-gold/20 rounded-lg px-3 py-1.5 text-xs text-brand-dark">
                            <FileText className="h-3.5 w-3.5 text-brand-gold" />
                            <span className="max-w-[140px] truncate">{f.name}</span>
                            <button onClick={() => removeDoc(slot.id, i)} className="text-brand-grayMed hover:text-red-500 transition-colors">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-brand-grayLight bg-gray-50 group-hover:border-brand-gold/40 group-hover:bg-brand-gold/5 transition-all text-sm text-brand-grayMed group-hover:text-brand-dark">
                        <Upload className="h-4 w-4" />
                        {t("step2.upload")}
                      </div>
                      <span className="text-xs text-brand-grayMed">{t("step2.fileHint")}</span>
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="sr-only"
                        onChange={(e) => {
                          if (e.target.files) addDoc(slot.id, Array.from(e.target.files));
                        }}
                      />
                    </label>
                  </div>
                );
              })}
            </div>

            <div className="rounded-xl bg-brand-gold/5 border border-brand-gold/20 px-5 py-4 flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-brand-gold flex-shrink-0 mt-0.5" />
              <p className="text-sm text-brand-grayMed">{t("step2.securityNote")}</p>
            </div>
          </div>
        )}

        {/* ─── STEP 3: Bank Submission ─── */}
        {step === 3 && (
          <div className="space-y-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-gold to-brand-goldDark flex items-center justify-center shadow-md">
                <Send className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-xs font-bold text-brand-gold uppercase tracking-widest">Step 3</div>
                <h2 className="text-xl font-bold text-brand-dark">{tSteps("step3.title")}</h2>
              </div>
            </div>
            <p className="text-sm text-brand-grayMed">{tSteps("step3.description")}</p>

            {/* Application summary */}
            <div className="rounded-2xl border border-brand-grayLight bg-white overflow-hidden">
              <div className="bg-gradient-to-r from-brand-gold/10 to-transparent px-6 py-4 border-b border-brand-grayLight">
                <h3 className="text-sm font-bold text-brand-dark">{t("step3.summaryTitle")}</h3>
              </div>
              <div className="divide-y divide-brand-grayLight">
                <div className="grid grid-cols-2 gap-4 px-6 py-4">
                  <div><div className="text-xs text-brand-grayMed mb-1">{t("step1.name")}</div><div className="text-sm font-semibold text-brand-dark">{form.firstName} {form.lastName}</div></div>
                  <div><div className="text-xs text-brand-grayMed mb-1">{t("step1.email")}</div><div className="text-sm font-semibold text-brand-dark">{form.email}</div></div>
                </div>
                <div className="grid grid-cols-2 gap-4 px-6 py-4">
                  <div><div className="text-xs text-brand-grayMed mb-1">{t("step1.market")}</div><div className="text-sm font-semibold text-brand-dark capitalize">{form.market}</div></div>
                  <div><div className="text-xs text-brand-grayMed mb-1">{t("step1.propertyType")}</div><div className="text-sm font-semibold text-brand-dark capitalize">{form.propertyType}</div></div>
                </div>
                {form.purchasePrice && (
                  <div className="grid grid-cols-2 gap-4 px-6 py-4">
                    <div><div className="text-xs text-brand-grayMed mb-1">{t("step1.purchasePrice")}</div><div className="text-sm font-semibold text-brand-dark">{formatEur(form.purchasePrice)}</div></div>
                    <div><div className="text-xs text-brand-grayMed mb-1">{t("step1.contribution")}</div><div className="text-sm font-semibold text-brand-dark">{formatEur(form.contribution)}</div></div>
                  </div>
                )}
                <div className="px-6 py-4">
                  <div className="text-xs text-brand-grayMed mb-2">{t("step2.title")}</div>
                  <div className="flex flex-wrap gap-2">
                    {DOC_SLOTS.filter((s) => form.docs[s.id]?.length > 0).map((s) => (
                      <span key={s.id} className="inline-flex items-center gap-1.5 bg-brand-gold/10 text-brand-gold text-xs font-semibold px-3 py-1 rounded-full">
                        <CheckCircle className="h-3 w-3" />
                        {t(s.labelKey)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Consent */}
            <div className="rounded-xl border border-brand-grayLight bg-white p-5">
              <label className="flex items-start gap-4 cursor-pointer">
                <div
                  onClick={() => { set("consent", !form.consent); }}
                  className={[
                    "flex-shrink-0 mt-0.5 h-5 w-5 rounded border-2 flex items-center justify-center transition-all cursor-pointer",
                    form.consent ? "bg-brand-gold border-brand-gold" : "border-brand-grayLight bg-white",
                  ].join(" ")}
                >
                  {form.consent && <CheckCircle className="h-3.5 w-3.5 text-white" />}
                </div>
                <p className="text-sm text-brand-grayMed leading-relaxed">{t("step3.consentText")}</p>
              </label>
              {errors.consent && <p className="text-red-500 text-xs mt-2 ml-9">{errors.consent}</p>}
            </div>

            <div className="rounded-xl bg-brand-gold/5 border border-brand-gold/20 px-5 py-4">
              <p className="text-xs text-brand-grayMed">{t("step3.legalNote")}</p>
            </div>
          </div>
        )}

        {/* ─── STEP 4 (placeholder / what happens next) ─── */}
        {step === 4 && (
          <div className="space-y-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-gold to-brand-goldDark flex items-center justify-center shadow-md">
                <PenLine className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-xs font-bold text-brand-gold uppercase tracking-widest">Step 4</div>
                <h2 className="text-xl font-bold text-brand-dark">{tSteps("step4.title")}</h2>
              </div>
            </div>
            <p className="text-sm text-brand-grayMed">{tSteps("step4.description")}</p>

            <div className="grid gap-4">
              {[
                { icon: CheckCircle, key: "step4.what1" },
                { icon: ArrowRight, key: "step4.what2" },
                { icon: PenLine, key: "step4.what3" },
              ].map(({ icon: Icon, key }) => (
                <div key={key} className="flex items-start gap-4 bg-white rounded-xl border border-brand-grayLight px-5 py-4">
                  <div className="h-9 w-9 rounded-lg bg-brand-gold/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5 text-brand-gold" />
                  </div>
                  <p className="text-sm text-brand-dark leading-relaxed pt-1">{t(key)}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl bg-brand-gold/5 border border-brand-gold/20 px-5 py-4">
              <p className="text-xs text-brand-grayMed">{t("step4.note")}</p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-brand-grayLight">
          {step > 1 ? (
            <button
              onClick={back}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-brand-grayLight text-sm font-semibold text-brand-dark hover:border-brand-gold/40 transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
              {t("nav.back")}
            </button>
          ) : (
            <Link
              href={`/${locale}/mortgage`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-brand-grayLight text-sm font-semibold text-brand-grayMed hover:border-brand-gold/40 transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
              {t("nav.cancel")}
            </Link>
          )}

          {step < 3 && (
            <button
              onClick={next}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-brand-gold to-brand-goldDark text-white text-sm font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all"
            >
              {t("nav.next")}
              <ChevronRight className="h-4 w-4" />
            </button>
          )}

          {step === 3 && (
            <button
              onClick={submit}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-brand-gold to-brand-goldDark text-white text-sm font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all"
            >
              {t("nav.submit")}
              <Send className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
