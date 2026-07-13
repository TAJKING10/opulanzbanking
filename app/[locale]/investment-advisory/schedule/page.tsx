"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { Hero } from "@/components/hero";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { CheckCircle, ArrowRight, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function fetchSafe(url: string, options: RequestInit) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), 6000);
  return fetch(url, { ...options, signal: ctrl.signal }).finally(() => clearTimeout(id));
}

type Step = "info" | "confirmation";

// ── Full client profile ──────────────────────────────────────────────────────
interface ClientProfile {
  // Personal identity
  title: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  placeOfBirth: string;
  nationality: string;
  maritalStatus: string;
  // Contact
  email: string;
  phone: string;
  // Residential address
  addressLine1: string;
  addressLine2: string;
  city: string;
  postalCode: string;
  country: string;
  // Identity document
  docType: string;
  docNumber: string;
  docExpiry: string;
  docIssuingCountry: string;
  // Tax residency
  taxCountry: string;
  taxId: string;
  usPerson: boolean;
  // Professional situation
  professionalStatus: string;
  employerName: string;
  position: string;
  sector: string;
  // Family
  numberOfDependents: string;
  // Financial situation
  annualIncome: string;
  incomeSource: string;
  totalAssets: string;
  liquidAssets: string;
  realEstateValue: string;
  outstandingDebts: string;
  // Origin of funds
  originOfFunds: string;
  originDetails: string;
  // Investment profile
  investmentExperience: string;
  riskTolerance: string;
  investmentHorizon: string;
  investmentObjective: string;
  expectedReturn: string;
  maxLossAcceptable: string;
  // Service
  missionType: string;
  initialInvestment: string;
  // Consents
  consentData: boolean;
  consentKyc: boolean;
  consentElectronic: boolean;
  consentMarketing: boolean;
}

const EMPTY: ClientProfile = {
  title: "Mr.", firstName: "", lastName: "", dateOfBirth: "", placeOfBirth: "",
  nationality: "", maritalStatus: "single",
  email: "", phone: "",
  addressLine1: "", addressLine2: "", city: "", postalCode: "", country: "",
  docType: "passport", docNumber: "", docExpiry: "", docIssuingCountry: "",
  taxCountry: "", taxId: "", usPerson: false,
  professionalStatus: "", employerName: "", position: "", sector: "",
  numberOfDependents: "0",
  annualIncome: "", incomeSource: "", totalAssets: "", liquidAssets: "",
  realEstateValue: "", outstandingDebts: "",
  originOfFunds: "", originDetails: "",
  investmentExperience: "beginner", riskTolerance: "moderate",
  investmentHorizon: "", investmentObjective: "", expectedReturn: "", maxLossAcceptable: "",
  missionType: "advisory", initialInvestment: "",
  consentData: false, consentKyc: false, consentElectronic: false, consentMarketing: false,
};

// ── Reusable field components ────────────────────────────────────────────────
const F = ({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) => (
  <div>
    <Label className="block text-sm font-medium text-brand-dark mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </Label>
    {children}
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

const inp = "w-full px-3 py-2 border border-brand-grayLight rounded-lg text-sm focus:ring-2 focus:ring-brand-gold focus:border-transparent";
const sel = "w-full px-3 py-2 border border-brand-grayLight rounded-lg text-sm focus:ring-2 focus:ring-brand-gold focus:border-transparent bg-white";

// ── Section header ───────────────────────────────────────────────────────────
function SectionHeader({ title, open, onToggle }: { title: string; open: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle}
      className="w-full flex items-center justify-between p-4 bg-brand-gold/10 rounded-lg mb-4 hover:bg-brand-gold/20 transition-colors">
      <h3 className="text-base font-semibold text-brand-dark">{title}</h3>
      {open ? <ChevronUp className="w-5 h-5 text-brand-dark" /> : <ChevronDown className="w-5 h-5 text-brand-dark" />}
    </button>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function ScheduleInvestmentMeetingPage() {
  const t = useTranslations("investmentAdvisory.schedule");
  const locale = useLocale();

  const [step, setStep] = useState<Step>("info");
  const [profile, setProfile] = useState<ClientProfile>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof ClientProfile, string>>>({});
  const [loading, setLoading] = useState(false);

  // Collapsed sections
  const [open, setOpen] = useState({
    identity: true, contact: true, address: true, document: true,
    tax: false, professional: false, family: false,
    financial: false, origin: false, investment: false, service: false, consents: false,
  });
  const toggle = (k: keyof typeof open) => setOpen(p => ({ ...p, [k]: !p[k] }));

  const set = (field: keyof ClientProfile, value: any) =>
    setProfile(p => ({ ...p, [field]: value }));

  const handleDocTypeChange = (value: string) => {
    setProfile(p => ({ ...p, docType: value, docNumber: "", docExpiry: "", docIssuingCountry: "" }));
    setErrors(p => { const e = { ...p }; delete e.docNumber; delete e.docExpiry; delete e.docIssuingCountry; return e; });
  };

  const validateEmailInline = (email: string) => {
    if (!email.trim()) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors(p => ({ ...p, email: "Please enter a valid email address" }));
    } else {
      setErrors(p => { const e = { ...p }; delete e.email; return e; });
    }
  };

  const validatePhoneInline = (phone: string) => {
    if (!phone.trim()) return;
    const digits = phone.replace(/[\s\-().]/g, "");
    if (!/^\+[1-9]\d{6,14}$/.test(digits)) {
      setErrors(p => ({ ...p, phone: "Enter a valid international phone number starting with + (e.g. +352 26 12 34 56)" }));
    } else {
      setErrors(p => { const e = { ...p }; delete e.phone; return e; });
    }
  };

  const fullName = `${profile.firstName} ${profile.lastName}`.trim();

  // ── Validation ──────────────────────────────────────────────────────────────
  function validate(): boolean {
    const e: Partial<Record<keyof ClientProfile, string>> = {};
    if (!profile.firstName.trim())    e.firstName    = "Required";
    if (!profile.lastName.trim())     e.lastName     = "Required";
    if (!profile.dateOfBirth)         e.dateOfBirth  = "Required";
    if (!profile.placeOfBirth.trim()) e.placeOfBirth = "Required";
    if (!profile.nationality.trim())  e.nationality  = "Required";
    if (!profile.email.trim())        e.email        = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) e.email = "Invalid email";
    if (!profile.phone.trim())        e.phone        = "Required";
    if (!profile.addressLine1.trim()) e.addressLine1 = "Required";
    if (!profile.city.trim())         e.city         = "Required";
    if (!profile.postalCode.trim())   e.postalCode   = "Required";
    if (!profile.country.trim())      e.country      = "Required";
    if (!profile.docNumber.trim())    e.docNumber    = "Required";
    if (!profile.docExpiry)           e.docExpiry    = "Required";
    if (!profile.docIssuingCountry.trim()) e.docIssuingCountry = "Required";
    if (!profile.taxCountry.trim())   e.taxCountry   = "Required";
    if (!profile.professionalStatus)  e.professionalStatus = "Required";
    if (!profile.annualIncome)        e.annualIncome = "Required";
    if (!profile.incomeSource)        e.incomeSource = "Required";
    if (!profile.originOfFunds)       e.originOfFunds = "Required";
    if (!profile.investmentHorizon)   e.investmentHorizon = "Required";
    if (!profile.investmentObjective) e.investmentObjective = "Required";
    if (!profile.initialInvestment)   e.initialInvestment = "Required";
    if (!profile.consentData)         e.consentData  = "Required";
    if (!profile.consentKyc)          e.consentKyc   = "Required";
    if (!profile.consentElectronic)   e.consentElectronic = "Required";
    setErrors(e);
    if (Object.keys(e).length > 0) {
      // Auto-open sections that have errors
      const errFields = Object.keys(e) as (keyof ClientProfile)[];
      if (errFields.some(f => ["firstName","lastName","dateOfBirth","placeOfBirth","nationality","maritalStatus"].includes(f))) setOpen(p=>({...p,identity:true}));
      if (errFields.some(f => ["email","phone"].includes(f))) setOpen(p=>({...p,contact:true}));
      if (errFields.some(f => ["addressLine1","city","postalCode","country"].includes(f))) setOpen(p=>({...p,address:true}));
      if (errFields.some(f => ["docNumber","docExpiry","docIssuingCountry"].includes(f))) setOpen(p=>({...p,document:true}));
      if (errFields.some(f => ["taxCountry"].includes(f))) setOpen(p=>({...p,tax:true}));
      if (errFields.some(f => ["professionalStatus"].includes(f))) setOpen(p=>({...p,professional:true}));
      if (errFields.some(f => ["annualIncome","incomeSource"].includes(f))) setOpen(p=>({...p,financial:true}));
      if (errFields.some(f => ["originOfFunds"].includes(f))) setOpen(p=>({...p,origin:true}));
      if (errFields.some(f => ["investmentHorizon","investmentObjective"].includes(f))) setOpen(p=>({...p,investment:true}));
      if (errFields.some(f => ["initialInvestment"].includes(f))) setOpen(p=>({...p,service:true}));
      if (errFields.some(f => ["consentData","consentKyc","consentElectronic"].includes(f))) setOpen(p=>({...p,consents:true}));
      return false;
    }
    return true;
  }

  async function handleInfoSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      // Save appointment to backend
      await fetchSafe(`${API}/api/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          email: profile.email,
          meeting_type: "Investment Advisory",
          status: "pending",
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          notes: JSON.stringify(profile),
        }),
      }).catch(() => null);

      // Send confirmation email to client + admin notification to invest-ad@opulanz.com (non-fatal)
      await fetchSafe(`${API}/api/notifications/investment-advisory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile }),
      }).catch((err) => console.warn("Email notification failed (non-fatal):", err));
    } finally {
      setLoading(false);
      setStep("confirmation");
    }
  }

  return (
    <>
      <Hero title={t("heroTitle")} subtitle={t("heroSubtitle")} />

      <section className="bg-white py-12">
        <div className="container mx-auto max-w-4xl px-6">


          {/* ═══════════════════════════════════════════════════════════
              STEP 1 — Complete Client Profile
          ═══════════════════════════════════════════════════════════ */}
          {step === "info" && (
            <>
              <div className="mb-8 text-center">
                <h2 className="mb-2 text-2xl font-bold text-brand-dark md:text-3xl">Complete Your Profile</h2>
                <p className="text-brand-grayMed text-sm">All information is required for regulatory compliance (KYC/AML). Fields marked * are mandatory.</p>
              </div>

              <form onSubmit={handleInfoSubmit} className="space-y-4">

                {/* ── 1. Personal Identity ── */}
                <Card className="border border-gray-100 shadow-sm">
                  <CardContent className="p-0">
                    <SectionHeader title="1. Personal Identity" open={open.identity} onToggle={() => toggle("identity")} />
                    {open.identity && (
                      <div className="px-6 pb-6 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <F label="Title" required>
                            <select value={profile.title} onChange={e => set("title", e.target.value)} className={sel}>
                              <option>Mr.</option><option>Mrs.</option><option>Ms.</option><option>Dr.</option>
                            </select>
                          </F>
                          <F label="First Name" required error={errors.firstName}>
                            <Input placeholder="Enter your first name" value={profile.firstName} onChange={e => set("firstName", e.target.value)} className={errors.firstName ? "border-red-500" : ""} />
                          </F>
                          <F label="Last Name" required error={errors.lastName}>
                            <Input placeholder="Enter your last name" value={profile.lastName} onChange={e => set("lastName", e.target.value)} className={errors.lastName ? "border-red-500" : ""} />
                          </F>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <F label="Date of Birth" required error={errors.dateOfBirth}>
                            <Input type="date" value={profile.dateOfBirth} onChange={e => set("dateOfBirth", e.target.value)} className={errors.dateOfBirth ? "border-red-500" : ""} />
                          </F>
                          <F label="Place of Birth" required error={errors.placeOfBirth}>
                            <Input placeholder="Enter city and country" value={profile.placeOfBirth} onChange={e => set("placeOfBirth", e.target.value)} className={errors.placeOfBirth ? "border-red-500" : ""} />
                          </F>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <F label="Nationality" required error={errors.nationality}>
                            <Input placeholder="Enter your nationality" value={profile.nationality} onChange={e => set("nationality", e.target.value)} className={errors.nationality ? "border-red-500" : ""} />
                          </F>
                          <F label="Marital Status" required>
                            <select value={profile.maritalStatus} onChange={e => set("maritalStatus", e.target.value)} className={sel}>
                              <option value="single">Single</option>
                              <option value="married">Married</option>
                              <option value="pacs">PACS / Civil Partnership</option>
                              <option value="divorced">Divorced</option>
                              <option value="widowed">Widowed</option>
                              <option value="cohabitation">Cohabitation</option>
                            </select>
                          </F>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* ── 2. Contact Information ── */}
                <Card className="border border-gray-100 shadow-sm">
                  <CardContent className="p-0">
                    <SectionHeader title="2. Contact Information" open={open.contact} onToggle={() => toggle("contact")} />
                    {open.contact && (
                      <div className="px-6 pb-6 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <F label="Email Address" required error={errors.email}>
                            <Input type="email" placeholder="Enter your email address" value={profile.email}
                              onChange={e => { set("email", e.target.value); if (errors.email) setErrors(p => { const e2 = {...p}; delete e2.email; return e2; }); }}
                              onBlur={e => validateEmailInline(e.target.value)}
                              className={errors.email ? "border-red-500" : ""} />
                          </F>
                          <F label="Phone Number" required error={errors.phone}>
                            <Input type="tel" placeholder="Enter your phone number (e.g. +352 26 12 34 56)" value={profile.phone}
                              onChange={e => { set("phone", e.target.value); if (errors.phone) setErrors(p => { const e2 = {...p}; delete e2.phone; return e2; }); }}
                              onBlur={e => validatePhoneInline(e.target.value)}
                              className={errors.phone ? "border-red-500" : ""} />
                          </F>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* ── 3. Residential Address ── */}
                <Card className="border border-gray-100 shadow-sm">
                  <CardContent className="p-0">
                    <SectionHeader title="3. Residential Address" open={open.address} onToggle={() => toggle("address")} />
                    {open.address && (
                      <div className="px-6 pb-6 space-y-4">
                        <F label="Address Line 1" required error={errors.addressLine1}>
                          <Input placeholder="Enter street number and name" value={profile.addressLine1} onChange={e => set("addressLine1", e.target.value)} className={errors.addressLine1 ? "border-red-500" : ""} />
                        </F>
                        <F label="Address Line 2">
                          <Input placeholder="Apartment, suite, floor (optional)" value={profile.addressLine2} onChange={e => set("addressLine2", e.target.value)} />
                        </F>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <F label="City" required error={errors.city}>
                            <Input placeholder="Enter your city" value={profile.city} onChange={e => set("city", e.target.value)} className={errors.city ? "border-red-500" : ""} />
                          </F>
                          <F label="Postal Code" required error={errors.postalCode}>
                            <Input placeholder="Enter postal code" value={profile.postalCode} onChange={e => set("postalCode", e.target.value)} className={errors.postalCode ? "border-red-500" : ""} />
                          </F>
                          <F label="Country" required error={errors.country}>
                            <Input placeholder="Enter your country" value={profile.country} onChange={e => set("country", e.target.value)} className={errors.country ? "border-red-500" : ""} />
                          </F>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* ── 4. Identity Document ── */}
                <Card className="border border-gray-100 shadow-sm">
                  <CardContent className="p-0">
                    <SectionHeader title="4. Identity Document" open={open.document} onToggle={() => toggle("document")} />
                    {open.document && (
                      <div className="px-6 pb-6 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <F label="Document Type" required>
                            <select value={profile.docType} onChange={e => handleDocTypeChange(e.target.value)} className={sel}>
                              <option value="passport">Passport</option>
                              <option value="national_id">National Identity Card</option>
                              <option value="drivers_license">Driver's Licence</option>
                              <option value="residence_permit">Residence Permit</option>
                            </select>
                          </F>
                          <F label="Document Number" required error={errors.docNumber}>
                            <Input placeholder="Enter document number" value={profile.docNumber} onChange={e => set("docNumber", e.target.value)} className={errors.docNumber ? "border-red-500" : ""} />
                          </F>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <F label="Expiry Date" required error={errors.docExpiry}>
                            <Input type="date" value={profile.docExpiry} onChange={e => set("docExpiry", e.target.value)} className={errors.docExpiry ? "border-red-500" : ""} />
                          </F>
                          <F label="Issuing Country" required error={errors.docIssuingCountry}>
                            <Input placeholder="Enter issuing country" value={profile.docIssuingCountry} onChange={e => set("docIssuingCountry", e.target.value)} className={errors.docIssuingCountry ? "border-red-500" : ""} />
                          </F>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* ── 5. Tax Residency ── */}
                <Card className="border border-gray-100 shadow-sm">
                  <CardContent className="p-0">
                    <SectionHeader title="5. Tax Residency" open={open.tax} onToggle={() => toggle("tax")} />
                    {open.tax && (
                      <div className="px-6 pb-6 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <F label="Country of Tax Residence" required error={errors.taxCountry}>
                            <Input placeholder="Enter your country of tax residence" value={profile.taxCountry} onChange={e => set("taxCountry", e.target.value)} className={errors.taxCountry ? "border-red-500" : ""} />
                          </F>
                          <F label="Tax Identification Number (TIN)">
                            <Input placeholder="Enter your tax identification number" value={profile.taxId} onChange={e => set("taxId", e.target.value)} />
                          </F>
                        </div>
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input type="checkbox" checked={profile.usPerson} onChange={e => set("usPerson", e.target.checked)}
                            className="mt-1 h-4 w-4 text-brand-gold focus:ring-brand-gold rounded" />
                          <span className="text-sm text-brand-dark">I am a US person for tax purposes (FATCA)</span>
                        </label>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* ── 6. Professional Situation ── */}
                <Card className="border border-gray-100 shadow-sm">
                  <CardContent className="p-0">
                    <SectionHeader title="6. Professional Situation" open={open.professional} onToggle={() => toggle("professional")} />
                    {open.professional && (
                      <div className="px-6 pb-6 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <F label="Professional Status" required error={errors.professionalStatus}>
                            <select value={profile.professionalStatus} onChange={e => set("professionalStatus", e.target.value)} className={`${sel} ${errors.professionalStatus ? "border-red-500" : ""}`}>
                              <option value="">Select status</option>
                              <option value="employed">Employed</option>
                              <option value="self_employed">Self-Employed</option>
                              <option value="business_owner">Business Owner</option>
                              <option value="retired">Retired</option>
                              <option value="unemployed">Unemployed</option>
                              <option value="student">Student</option>
                            </select>
                          </F>
                          <F label="Industry / Sector">
                            <Input placeholder="Enter your industry or sector" value={profile.sector} onChange={e => set("sector", e.target.value)} />
                          </F>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <F label="Employer Name">
                            <Input placeholder="Enter company or organisation name" value={profile.employerName} onChange={e => set("employerName", e.target.value)} />
                          </F>
                          <F label="Job Title / Position">
                            <Input placeholder="Enter your job title or position" value={profile.position} onChange={e => set("position", e.target.value)} />
                          </F>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* ── 7. Family Situation ── */}
                <Card className="border border-gray-100 shadow-sm">
                  <CardContent className="p-0">
                    <SectionHeader title="7. Family Situation" open={open.family} onToggle={() => toggle("family")} />
                    {open.family && (
                      <div className="px-6 pb-6">
                        <F label="Number of Dependants">
                          <Input type="number" min="0" max="20" value={profile.numberOfDependents}
                            onChange={e => set("numberOfDependents", e.target.value)} className="w-32" />
                        </F>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* ── 8. Financial Situation ── */}
                <Card className="border border-gray-100 shadow-sm">
                  <CardContent className="p-0">
                    <SectionHeader title="8. Financial Situation" open={open.financial} onToggle={() => toggle("financial")} />
                    {open.financial && (
                      <div className="px-6 pb-6 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <F label="Annual Income (EUR)" required error={errors.annualIncome}>
                            <Input type="number" placeholder="Enter your annual income in EUR" value={profile.annualIncome} onChange={e => set("annualIncome", e.target.value)} className={errors.annualIncome ? "border-red-500" : ""} />
                          </F>
                          <F label="Main Income Source" required error={errors.incomeSource}>
                            <select value={profile.incomeSource} onChange={e => set("incomeSource", e.target.value)} className={`${sel} ${errors.incomeSource ? "border-red-500" : ""}`}>
                              <option value="">Select source</option>
                              <option value="salary">Salary</option>
                              <option value="business">Business Income</option>
                              <option value="investments">Investment Returns</option>
                              <option value="pension">Pension</option>
                              <option value="inheritance">Inheritance</option>
                              <option value="rental">Rental Income</option>
                              <option value="other">Other</option>
                            </select>
                          </F>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <F label="Total Assets (EUR)">
                            <Input type="number" placeholder="Enter total asset value in EUR" value={profile.totalAssets} onChange={e => set("totalAssets", e.target.value)} />
                          </F>
                          <F label="Liquid Assets (EUR)">
                            <Input type="number" placeholder="Enter liquid asset value in EUR" value={profile.liquidAssets} onChange={e => set("liquidAssets", e.target.value)} />
                          </F>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <F label="Real Estate Value (EUR)">
                            <Input type="number" placeholder="Enter total real estate value in EUR" value={profile.realEstateValue} onChange={e => set("realEstateValue", e.target.value)} />
                          </F>
                          <F label="Outstanding Debts / Loans (EUR)">
                            <Input type="number" placeholder="Enter outstanding debt value in EUR" value={profile.outstandingDebts} onChange={e => set("outstandingDebts", e.target.value)} />
                          </F>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* ── 9. Origin of Funds ── */}
                <Card className="border border-gray-100 shadow-sm">
                  <CardContent className="p-0">
                    <SectionHeader title="9. Origin of Investment Funds" open={open.origin} onToggle={() => toggle("origin")} />
                    {open.origin && (
                      <div className="px-6 pb-6 space-y-4">
                        <F label="Primary Origin of Funds" required error={errors.originOfFunds}>
                          <select value={profile.originOfFunds} onChange={e => set("originOfFunds", e.target.value)} className={`${sel} ${errors.originOfFunds ? "border-red-500" : ""}`}>
                            <option value="">Select origin</option>
                            <option value="savings">Personal Savings</option>
                            <option value="salary">Salary / Employment Income</option>
                            <option value="sale_of_assets">Sale of Assets</option>
                            <option value="inheritance">Inheritance / Gift</option>
                            <option value="business_income">Business Income</option>
                            <option value="investment_returns">Investment Returns</option>
                            <option value="real_estate">Real Estate Proceeds</option>
                            <option value="other">Other</option>
                          </select>
                        </F>
                        <F label="Additional Details">
                          <textarea rows={3} placeholder="Provide additional context about the origin of your investment funds"
                            value={profile.originDetails} onChange={e => set("originDetails", e.target.value)}
                            className={`${inp} resize-none`} />
                        </F>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* ── 10. Investment Profile ── */}
                <Card className="border border-gray-100 shadow-sm">
                  <CardContent className="p-0">
                    <SectionHeader title="10. Investment Knowledge & Objectives" open={open.investment} onToggle={() => toggle("investment")} />
                    {open.investment && (
                      <div className="px-6 pb-6 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <F label="Investment Experience">
                            <select value={profile.investmentExperience} onChange={e => set("investmentExperience", e.target.value)} className={sel}>
                              <option value="beginner">Beginner (less than 2 years)</option>
                              <option value="intermediate">Intermediate (2–5 years)</option>
                              <option value="advanced">Advanced (5–10 years)</option>
                              <option value="expert">Expert (10+ years)</option>
                            </select>
                          </F>
                          <F label="Risk Tolerance">
                            <select value={profile.riskTolerance} onChange={e => set("riskTolerance", e.target.value)} className={sel}>
                              <option value="conservative">Conservative – Preserve capital</option>
                              <option value="moderate">Moderate – Balanced growth</option>
                              <option value="aggressive">Aggressive – Maximum growth</option>
                            </select>
                          </F>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <F label="Investment Horizon" required error={errors.investmentHorizon}>
                            <select value={profile.investmentHorizon} onChange={e => set("investmentHorizon", e.target.value)} className={`${sel} ${errors.investmentHorizon ? "border-red-500" : ""}`}>
                              <option value="">Select horizon</option>
                              <option value="short">Short-term (less than 3 years)</option>
                              <option value="medium">Medium-term (3–7 years)</option>
                              <option value="long">Long-term (more than 7 years)</option>
                            </select>
                          </F>
                          <F label="Primary Objective" required error={errors.investmentObjective}>
                            <select value={profile.investmentObjective} onChange={e => set("investmentObjective", e.target.value)} className={`${sel} ${errors.investmentObjective ? "border-red-500" : ""}`}>
                              <option value="">Select objective</option>
                              <option value="capital_preservation">Capital Preservation</option>
                              <option value="income_generation">Income Generation</option>
                              <option value="capital_growth">Capital Growth</option>
                              <option value="balanced">Balanced Growth & Income</option>
                            </select>
                          </F>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <F label="Expected Annual Return (%)">
                            <Input type="number" step="0.1" placeholder="Enter expected return percentage" value={profile.expectedReturn} onChange={e => set("expectedReturn", e.target.value)} />
                          </F>
                          <F label="Maximum Acceptable Loss (%)">
                            <Input type="number" step="0.1" placeholder="Enter maximum acceptable loss percentage" value={profile.maxLossAcceptable} onChange={e => set("maxLossAcceptable", e.target.value)} />
                          </F>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* ── 11. Service & Investment Amount ── */}
                <Card className="border border-gray-100 shadow-sm">
                  <CardContent className="p-0">
                    <SectionHeader title="11. Service Type & Investment Amount" open={open.service} onToggle={() => toggle("service")} />
                    {open.service && (
                      <div className="px-6 pb-6 space-y-4">
                        <F label="Type of Service">
                          <select value={profile.missionType} onChange={e => set("missionType", e.target.value)} className={sel}>
                            <option value="advisory">Investment Advisory (Conseil) – We recommend, you decide</option>
                            <option value="management">Portfolio Management (Gestion sous mandat) – We manage on your behalf</option>
                          </select>
                        </F>
                        <F label="Planned Initial Investment (EUR)" required error={errors.initialInvestment}>
                          <Input type="number" placeholder="Enter planned initial investment in EUR" value={profile.initialInvestment}
                            onChange={e => set("initialInvestment", e.target.value)}
                            className={errors.initialInvestment ? "border-red-500" : ""} />
                          <p className="mt-1 text-xs text-brand-grayMed">Minimum initial investment: €10,000</p>
                        </F>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* ── 12. Consents ── */}
                <Card className="border border-gray-100 shadow-sm">
                  <CardContent className="p-0">
                    <SectionHeader title="12. Consents & Declarations" open={open.consents} onToggle={() => toggle("consents")} />
                    {open.consents && (
                      <div className="px-6 pb-6 space-y-4">
                        {[
                          { key: "consentData" as const, required: true, label: "Data Processing *", text: "I consent to the processing of my personal data for KYC/AML compliance and investment advisory purposes in accordance with GDPR." },
                          { key: "consentKyc" as const, required: true, label: "KYC / AML Compliance *", text: "I authorise Opulanz to perform identity verification and AML/CFT checks as required by French and Luxembourgish regulations (ACPR, AMF, CSSF)." },
                          { key: "consentElectronic" as const, required: true, label: "Electronic Signature *", text: "I agree to receive and sign documents electronically via DocuSign, and accept that electronic signatures have the same legal validity as handwritten signatures." },
                          { key: "consentMarketing" as const, required: false, label: "Marketing Communications", text: "I agree to receive updates and offers from Opulanz (optional)." },
                        ].map(({ key, label, text, required }) => (
                          <div key={key}>
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" checked={profile[key] as boolean}
                                onChange={e => set(key, e.target.checked)}
                                className="mt-1 h-4 w-4 text-brand-gold focus:ring-brand-gold rounded" />
                              <span className="text-sm text-brand-dark">
                                <strong>{label}:</strong> {text}
                              </span>
                            </label>
                            {errors[key] && <p className="mt-1 text-xs text-red-500 ml-7">This consent is required</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Error summary */}
                {Object.keys(errors).length > 0 && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                    <p className="text-sm font-semibold text-red-700">Please complete all required fields before continuing.</p>
                    <p className="text-xs text-red-600 mt-1">Sections with missing information have been expanded above.</p>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <Button type="submit" disabled={loading} className="flex items-center gap-2 bg-brand-gold text-white hover:bg-brand-goldDark px-8 py-3 text-base">
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Submit <ArrowRight className="h-5 w-5" /></>}
                  </Button>
                </div>

              </form>
            </>
          )}

          {/* ═══════════════════════════════════════════════════════════
              CONFIRMATION
          ═══════════════════════════════════════════════════════════ */}
          {step === "confirmation" && (
            <div className="text-center py-8">
              <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="mb-4 text-3xl font-bold text-brand-dark">Request Received</h2>
              <p className="mb-3 text-lg text-brand-grayMed">
                Thank you, <span className="font-semibold text-brand-dark">{fullName}</span>.
              </p>
              <p className="mb-8 text-xl font-semibold text-brand-gold">
                We will contact you in 2 working days.
              </p>
              <Button onClick={() => window.location.href = `/${locale}`} className="bg-brand-gold text-white hover:bg-brand-goldDark">
                Return to Home
              </Button>
            </div>
          )}

        </div>
      </section>
    </>
  );
}
