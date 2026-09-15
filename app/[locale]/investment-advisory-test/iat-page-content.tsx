"use client";

import * as React from "react";
import Link from "next/link";
import {
  PieChart, BarChart3, Users, CheckCircle, ChevronDown,
  Target, FileText, ShieldCheck, TrendingUp, ClipboardList,
  BookOpen, ArrowRight, AlertCircle, Mail,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Hero } from "@/components/hero";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { IATTypeSelector } from "@/components/investment-advisory-test/iat-type-selector";
import { IATProgress } from "@/components/investment-advisory-test/iat-progress";
import { IATppStep1 } from "@/components/investment-advisory-test/iat-pp-step1";
import { IATppStep2 } from "@/components/investment-advisory-test/iat-pp-step2";
import { IATppStep3 } from "@/components/investment-advisory-test/iat-pp-step3";
import { IATpmStep1 } from "@/components/investment-advisory-test/iat-pm-step1";
import { IATpmStep2 } from "@/components/investment-advisory-test/iat-pm-step2";
import { IATpmStep3 } from "@/components/investment-advisory-test/iat-pm-step3";
import { IATStepKnowledge } from "@/components/investment-advisory-test/iat-step-knowledge";
import { IATStepObjectives } from "@/components/investment-advisory-test/iat-step-objectives";
import { IATStepESG } from "@/components/investment-advisory-test/iat-step-esg";
import { IATCalendly } from "@/components/investment-advisory-test/iat-calendly";
import { IATStepReview } from "@/components/investment-advisory-test/iat-step-review";
import { IATDocuSignModal } from "@/components/investment-advisory-test/iat-docusign-modal";
import { IATTechSection } from "@/components/investment-advisory-test/iat-tech-section";
import {
  defaultFormData,
  type IATFormData,
  type ClientType,
} from "@/components/investment-advisory-test/iat-types";

const BENEFIT_ICONS = [Target, Users, FileText];
const DOC_ICONS = [BarChart3, TrendingUp, PieChart, FileText, ShieldCheck, ClipboardList, BookOpen];

// ---------------------------------------------------------------------------
// FAQ accordion item
// ---------------------------------------------------------------------------

function FaqItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = React.useState(false);
  const id = `faq-iat-${index}`;
  return (
    <div className="border-b border-brand-grayLight last:border-b-0">
      <button
        id={`${id}-trigger`}
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left text-sm font-semibold text-brand-dark hover:text-brand-gold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
      >
        <span>{question}</span>
        <ChevronDown className={`h-5 w-5 flex-shrink-0 text-brand-gold transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      <div id={`${id}-panel`} role="region" aria-labelledby={`${id}-trigger`} hidden={!open} className="pb-5 text-sm leading-relaxed text-brand-grayMed">
        {answer}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Completion screen
// ---------------------------------------------------------------------------

function CompletionScreen({
  onRestart,
  locale,
  clientName,
  emailStatus,
  pdfBase64,
  pdfFilename,
}: {
  onRestart: () => void;
  locale: string;
  clientName: string;
  emailStatus: "idle" | "sending" | "sent" | "error";
  pdfBase64?: string;
  pdfFilename?: string;
}) {
  const t = useTranslations("iat");

  const handleDownload = () => {
    if (!pdfBase64) return;
    const link = document.createElement("a");
    link.href = `data:application/pdf;base64,${pdfBase64}`;
    link.download = pdfFilename || "QCC.pdf";
    link.click();
  };

  const name = clientName ? `, ${clientName}` : "";

  return (
    <div className="text-center py-10 space-y-6">
      <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
        <CheckCircle className="h-10 w-10 text-green-600" />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-brand-dark mb-2">
          {t("completion.title")}
        </h2>
        <p className="text-brand-grayMed max-w-xl mx-auto text-sm leading-relaxed">
          {t("completion.subtitle", { name })}
        </p>
      </div>

      <div className="mx-auto max-w-sm">
        {emailStatus === "sending" && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 flex items-center gap-2">
            <Mail className="h-4 w-4 flex-shrink-0 animate-pulse" />
            {t("completion.emailSending")}
          </div>
        )}
        {emailStatus === "sent" && (
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 flex-shrink-0" />
            {t("completion.emailSent")}
          </div>
        )}
        {emailStatus === "error" && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {t("completion.emailError")}
          </div>
        )}
      </div>

      <div className="mx-auto max-w-sm rounded-2xl border border-brand-grayLight bg-gray-50 p-5 text-left space-y-2">
        {[
          t("completion.checklistCompleted"),
          t("completion.checklistAppointment"),
          t("completion.checklistConsents"),
          t("completion.checklistSigned"),
          t("completion.checklistPdf"),
        ].map((item) => (
          <div key={item} className="flex items-center gap-2.5">
            <CheckCircle className="h-4 w-4 flex-shrink-0 text-brand-gold" />
            <span className="text-sm text-brand-dark">{item}</span>
          </div>
        ))}
      </div>

      {pdfBase64 && (
        <div className="mx-auto max-w-sm">
          <button
            type="button"
            onClick={handleDownload}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-brand-gold bg-brand-gold/5 px-4 py-3 text-sm font-semibold text-brand-goldDark hover:bg-brand-gold/10 transition-colors"
          >
            <FileText className="h-4 w-4 flex-shrink-0" />
            {t("completion.downloadBtn")}
          </button>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row justify-center">
        <Button asChild variant="outline" size="lg">
          <Link href={`/${locale}/investment-advisory`}>
            {t("completion.backBtn")}
          </Link>
        </Button>
        <Button variant="primary" size="lg" onClick={onRestart}>
          {t("completion.restartBtn")}
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MAIN PAGE
// ---------------------------------------------------------------------------

export function IATPageContent({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  const t = useTranslations("iat");
  const tp = useTranslations("iat.page");

  const [started, setStarted] = React.useState(false);
  const [clientType, setClientType] = React.useState<ClientType | null>(null);
  const [step, setStep] = React.useState(1);
  const [formData, setFormData] = React.useState<IATFormData>(defaultFormData);
  const [stepError, setStepError] = React.useState("");
  const [showDocuSign, setShowDocuSign] = React.useState(false);
  const [pdfForSigning, setPdfForSigning] = React.useState("");
  const [isGeneratingPdf, setIsGeneratingPdf] = React.useState(false);
  const [completed, setCompleted] = React.useState(false);
  const [emailStatus, setEmailStatus] = React.useState<"idle" | "sending" | "sent" | "error">("idle");
  const [signedPdfBase64, setSignedPdfBase64] = React.useState<string | undefined>(undefined);
  const [signedPdfFilename, setSignedPdfFilename] = React.useState<string | undefined>(undefined);

  const prototypeRef = React.useRef<HTMLDivElement>(null);

  const updateFormData = (updates: Partial<IATFormData>) =>
    setFormData((prev) => ({ ...prev, ...updates }));

  const scrollToWizard = () =>
    setTimeout(() => prototypeRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);

  const goToStep = (n: number) => {
    setStep(n);
    setStepError("");
    scrollToWizard();
  };

  const startPrototype = () => {
    setStarted(true);
    setClientType(null);
    setStep(1);
    setCompleted(false);
    setEmailStatus("idle");
    scrollToWizard();
  };

  const handleSelectType = (type: ClientType) => {
    setClientType(type);
    setFormData({ ...defaultFormData, clientType: type });
    setStep(1);
    setStepError("");
    scrollToWizard();
  };

  const restart = () => {
    setFormData(defaultFormData);
    setStep(1);
    setStarted(true);
    setClientType(null);
    setCompleted(false);
    setShowDocuSign(false);
    setEmailStatus("idle");
    setSignedPdfBase64(undefined);
    setSignedPdfFilename(undefined);
    setStepError("");
    scrollToWizard();
  };

  const [pdfPageCount, setPdfPageCount] = React.useState(1);

  const handleSign = async () => {
    setIsGeneratingPdf(true);
    try {
      const { fillTemplatePdf } = await import(
        "@/components/investment-advisory-test/iat-pdf-filler"
      );
      const { base64, pageCount } = await fillTemplatePdf(
        clientType === "company" ? "company" : "personal",
        formData
      );
      setPdfForSigning(base64);
      setPdfPageCount(pageCount);
      setShowDocuSign(true);
    } catch (err) {
      console.error("[handleSign] PDF fill failed:", err);
      setStepError(`Erreur lors de la génération du PDF: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleSigned = async (envelopeId: string) => {
    setShowDocuSign(false);
    setCompleted(true);
    setEmailStatus("sending");

    try {
      const { buildFormSummary } = await import(
        "@/components/investment-advisory-test/iat-pdf"
      );

      const resolvedClientName =
        clientType === "personal"
          ? [formData.titulaire1.firstName, formData.titulaire1.lastName].filter(Boolean).join(" ")
          : formData.companyIdentity.companyName;

      const resolvedClientEmail =
        clientType === "personal"
          ? formData.titulaire1.email
          : formData.companyIdentity.representative.email;

      const now = new Date();
      const dateStr = now.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
      const signatureDate = now.toLocaleString("fr-FR", {
        day: "2-digit", month: "long", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      });

      const signedName = `Signé via DocuSign (${envelopeId})`;

      let pdfBase64: string;
      try {
        const dlResp = await fetch("/api/docusign/download", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ envelopeId }),
        });
        if (!dlResp.ok) throw new Error(`HTTP ${dlResp.status}`);
        const dlData = await dlResp.json() as { success: boolean; pdfBase64: string };
        if (!dlData.success || !dlData.pdfBase64) throw new Error("No PDF returned");
        pdfBase64 = dlData.pdfBase64;
      } catch {
        const { fillTemplatePdf } = await import(
          "@/components/investment-advisory-test/iat-pdf-filler"
        );
        const { base64 } = await fillTemplatePdf(
          clientType === "company" ? "company" : "personal",
          formData
        );
        pdfBase64 = base64;
      }
      const formSummary = buildFormSummary(formData);

      const docPrefix = clientType === "company" ? "DCE" : "QCC";
      const safeName = (resolvedClientName || "Client").replace(/\s+/g, "-");
      const filename = `${docPrefix}-${safeName}-${dateStr.replace(/\s/g, "-")}.pdf`;
      setSignedPdfBase64(pdfBase64);
      setSignedPdfFilename(filename);

      const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      fetch(`${API}/api/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "investment_advisory",
          status: "submitted",
          payload: {
            clientName: resolvedClientName,
            email: resolvedClientEmail,
            clientType: clientType === "personal" ? "PP" : "PM",
            envelopeId,
            signedAt: now.toISOString(),
            submittedAt: now.toISOString(),
            formData,
          },
        }),
      }).catch(() => {});

      const res = await fetch("/api/send-questionnaire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: resolvedClientName,
          clientType: clientType === "personal" ? "Personne Physique (PP)" : "Personne Morale (PM)",
          clientEmail: resolvedClientEmail,
          pdfBase64,
          formSummary,
          date: dateStr,
          signatureDate,
          signedName,
          envelopeId,
        }),
      });

      setEmailStatus(res.ok ? "sent" : "error");
    } catch {
      setEmailStatus("error");
    }
  };

  const ppStepLabels = t.raw("ppStepLabels") as string[];
  const pmStepLabels = t.raw("pmStepLabels") as string[];
  const stepLabels = clientType === "company" ? pmStepLabels : ppStepLabels;

  const clientName =
    clientType === "personal"
      ? [formData.titulaire1.firstName, formData.titulaire1.lastName].filter(Boolean).join(" ")
      : formData.companyIdentity.companyName;

  const stepTitle = clientType
    ? t("wizard.stepTitle", { step: String(step), label: stepLabels[step - 1] ?? "" })
    : t("wizard.questionnaireTitle");

  const benefits = tp.raw("benefits") as { title: string; description: string }[];
  const processSteps = tp.raw("process") as { title: string; description: string }[];
  const profileItems = tp.raw("profileItems") as string[];
  const docItems = tp.raw("docItems") as string[];
  const regItems = tp.raw("regItems") as string[];
  const faqItems = tp.raw("faq") as { q: string; a: string }[];

  return (
    <>
      {/* Test badge */}
      <div className="bg-amber-50 border-b border-amber-200 py-2 text-center">
        <span className="inline-flex items-center gap-2 text-xs font-semibold text-amber-800">
          <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
          {tp("testBadge")}
        </span>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* HERO                                                                 */}
      {/* ------------------------------------------------------------------ */}
      <Hero
        title={tp("heroTitle")}
        subtitle={tp("heroSubtitle")}
        primaryCta={{
          label: tp("heroPrimaryBtn"),
          href: `/${locale}/investment-advisory-test/apply`,
        }}
        secondaryCta={{
          label: tp("heroSecondaryBtn"),
          href: "#process",
        }}
      />
      <div className="bg-white py-3 text-center text-xs text-brand-grayMed border-b border-brand-grayLight">
        {tp("heroAdvisoryNote")}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* INTRODUCTION                                                         */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative bg-gradient-to-b from-white to-gray-50 py-8 md:py-12 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold/5 rounded-full blur-3xl pointer-events-none" />
        <div className="container mx-auto max-w-7xl px-6 relative z-10">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-start">
            <div>
              <SectionHeading overline={tp("introOverline")} title={tp("introTitle")} align="left" className="mb-0" />
              <p className="mt-6 text-brand-grayMed leading-relaxed">
                {tp("introP1")}
              </p>
              <p className="mt-4 text-brand-grayMed leading-relaxed">
                {tp("introP2")}
              </p>
            </div>
            <div className="grid gap-4">
              {benefits.map(({ title, description }, i) => {
                const Icon = BENEFIT_ICONS[i];
                return (
                  <div key={title} className="group flex gap-4 rounded-2xl border border-brand-grayLight bg-white p-5 shadow-sm transition-all hover:border-brand-gold/40 hover:shadow-md">
                    <div className="flex-shrink-0 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gold/10 group-hover:bg-brand-gold/20 transition-colors">
                      <Icon className="h-5 w-5 text-brand-gold" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="mb-1 font-semibold text-brand-dark">{title}</h3>
                      <p className="text-sm text-brand-grayMed leading-relaxed">{description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* HOW IT WORKS                                                         */}
      {/* ------------------------------------------------------------------ */}
      <section id="process" className="relative bg-white py-8 md:py-12 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_110%)] opacity-20 pointer-events-none" />
        <div className="container mx-auto max-w-7xl px-6 relative z-10">
          <SectionHeading overline={tp("processOverline")} title={tp("processTitle")} className="mb-8" />
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((s, idx) => (
              <div key={idx} className="group relative text-center">
                {idx < processSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 -translate-x-1/2 bg-gradient-to-r from-brand-gold/40 to-brand-gold/10 z-0" />
                )}
                <div className="relative z-10">
                  <div className="relative inline-block mb-4">
                    <div className="absolute inset-0 bg-brand-gold rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
                    <div className="relative inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-gold to-brand-goldDark text-white text-xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                      {idx + 1}
                    </div>
                  </div>
                  <h3 className="mb-2 text-base font-bold text-brand-dark group-hover:text-brand-gold transition-colors">{s.title}</h3>
                  <p className="text-sm text-brand-grayMed leading-relaxed">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* INVESTOR PROFILE OVERVIEW                                           */}
      {/* ------------------------------------------------------------------ */}
      <section className="bg-gray-50 py-8 md:py-12">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-start">
            <div>
              <SectionHeading overline={tp("profileOverline")} title={tp("profileTitle")} description={tp("profileDesc")} align="left" className="mb-0" />
            </div>
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {profileItems.map((item) => (
                  <div key={item} className="flex items-start gap-2.5 rounded-xl border border-brand-grayLight bg-white px-4 py-3 shadow-sm">
                    <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-gold" aria-hidden="true" />
                    <span className="text-sm text-brand-dark">{item}</span>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-brand-gold/30 bg-brand-gold/5 p-4">
                <p className="text-sm text-brand-dark leading-relaxed">
                  <strong>{tp("profileNoteStrong")}</strong>{tp("profileNote")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* DOCUMENTS OVERVIEW                                                   */}
      {/* ------------------------------------------------------------------ */}
      <section className="bg-white py-8 md:py-12">
        <div className="container mx-auto max-w-7xl px-6">
          <SectionHeading overline={tp("docsOverline")} title={tp("docsTitle")} className="mb-6" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-6">
            {docItems.map((label, i) => {
              const Icon = DOC_ICONS[i] ?? FileText;
              return (
                <div key={label} className="group flex items-start gap-3 rounded-xl border border-brand-grayLight bg-gray-50 p-4 transition-all hover:border-brand-gold/40 hover:bg-white hover:shadow-sm">
                  <div className="flex-shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gold/10 group-hover:bg-brand-gold/20 transition-colors">
                    <Icon className="h-4 w-4 text-brand-gold" aria-hidden="true" />
                  </div>
                  <span className="text-sm font-medium text-brand-dark leading-snug pt-1">{label}</span>
                </div>
              );
            })}
          </div>
          <p className="text-sm text-brand-grayMed max-w-2xl mx-auto text-center">
            {tp("docsNote")}
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* START CTA                                                            */}
      {/* ------------------------------------------------------------------ */}
      <section className="bg-gray-50 py-8 md:py-10">
        <div className="container mx-auto max-w-3xl px-6 text-center">
          <div className="rounded-2xl border-2 border-brand-gold/30 bg-white p-8 shadow-sm">
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-gold/10">
              <Target className="h-7 w-7 text-brand-gold" />
            </div>
            <h2 className="mb-3 text-2xl font-bold text-brand-dark">{t("wizard.startCTA")}</h2>
            <p className="mb-6 text-brand-grayMed text-sm max-w-lg mx-auto">
              {t("wizard.startDesc")}
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button asChild variant="primary" size="lg">
                <Link href={`/${locale}/investment-advisory-test/apply`}>
                  {t("wizard.startBtn")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="#consultation-info">{t("wizard.bookConsultation")}</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* REGULATORY NOTICE                                                    */}
      {/* ------------------------------------------------------------------ */}
      <section className="bg-gray-50 py-8 md:py-12">
        <div className="container mx-auto max-w-4xl px-6">
          <SectionHeading overline={tp("regOverline")} title={tp("regTitle")} className="mb-6" />
          <div className="rounded-2xl border border-brand-grayLight bg-white p-6 md:p-8 shadow-sm space-y-4">
            {regItems.map((text, i) => (
              <div key={i} className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-gold" aria-hidden="true" />
                <p className="text-sm text-brand-grayMed leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2">
            {[
              { labelKey: "legalNotice", path: "mentions" },
              { labelKey: "termsConditions", path: "terms" },
              { labelKey: "privacyPolicy", path: "privacy" },
              { labelKey: "disclaimers", path: "disclaimers" },
              { labelKey: "regulatoryInfo", path: "regulatory" },
            ].map(({ labelKey, path }) => (
              <Link key={path} href={`/${locale}/legal/${path}`} className="text-xs text-brand-gold underline underline-offset-2 hover:text-brand-goldDark transition-colors">
                {tp(labelKey as Parameters<typeof tp>[0])}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* TECHNICAL & COMPLIANCE SECTION                                       */}
      {/* ------------------------------------------------------------------ */}
      <section className="bg-white py-8 md:py-12">
        <div className="container mx-auto max-w-4xl px-6">
          <SectionHeading overline={tp("techOverline")} title={tp("techTitle")} description={tp("techDesc")} className="mb-6" />
          <IATTechSection />
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* FAQ                                                                  */}
      {/* ------------------------------------------------------------------ */}
      <section className="bg-gray-50 py-8 md:py-12">
        <div className="container mx-auto max-w-3xl px-6">
          <SectionHeading overline={tp("faqOverline")} title={tp("faqTitle")} className="mb-6" />
          <div className="rounded-2xl border border-brand-grayLight bg-white px-6 shadow-sm">
            {faqItems.map((item, i) => (
              <FaqItem key={i} index={i} question={item.q} answer={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* FINAL CTA                                                            */}
      {/* ------------------------------------------------------------------ */}
      <section id="consultation-info" className="hero-gradient py-10 md:py-14">
        <div className="container mx-auto max-w-4xl px-6 text-center">
          <h2 className="mb-4 text-balance text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            {tp("ctaTitle")}
          </h2>
          <p className="mx-auto mb-6 max-w-2xl text-balance text-lg text-white/90">
            {tp("ctaSubtitle")}
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={`/${locale}/investment-advisory-test/apply`}
              className="inline-flex h-14 min-w-48 items-center justify-center rounded-2xl bg-white px-8 text-base font-semibold text-brand-dark shadow-sm transition-all hover:bg-gray-50"
            >
              {tp("ctaRequestBtn")}
            </Link>
            <Link
              href={`/${locale}/support`}
              className="inline-flex h-14 min-w-48 items-center justify-center rounded-2xl border-2 border-white bg-transparent px-8 text-base font-semibold text-white transition-all hover:bg-white/10"
            >
              {tp("ctaContactBtn")}
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* DOCUSIGN MODAL                                                       */}
      {/* ------------------------------------------------------------------ */}
      <IATDocuSignModal
        isOpen={showDocuSign}
        clientName={clientName}
        clientEmail={
          clientType === "personal"
            ? formData.titulaire1.email
            : formData.companyIdentity.representative.email
        }
        pdfBase64={pdfForSigning}
        pdfPageCount={pdfPageCount}
        onClose={() => setShowDocuSign(false)}
        onSigned={handleSigned}
      />
    </>
  );
}
