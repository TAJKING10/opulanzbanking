"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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

// New QCC components
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

// ---------------------------------------------------------------------------
// Static content
// ---------------------------------------------------------------------------

const BENEFITS = [
  {
    icon: Target,
    title: "Personalised Assessment",
    description: "Review your objectives, experience, income, assets, commitments, and investment preferences.",
  },
  {
    icon: Users,
    title: "Professional Guidance",
    description: "Discuss your financial situation with an AMF-certified investment advisor.",
  },
  {
    icon: FileText,
    title: "Documented Recommendations",
    description: "Receive a formal suitability report explaining the recommendations made during the advisory process.",
  },
];

const PROCESS_STEPS = [
  {
    num: 1,
    title: "Complete Your Investor Profile",
    description: "Answer questions about your knowledge, experience, financial situation, objectives, investment horizon, liquidity needs, and risk tolerance.",
  },
  {
    num: 2,
    title: "Provide Supporting Information",
    description: "Securely provide relevant information, including your current portfolio, income details, and any personal or financial constraints.",
  },
  {
    num: 3,
    title: "Meet Your Advisor",
    description: "Book a consultation with an AMF-certified advisor to review your circumstances and discuss suitable investment options.",
  },
  {
    num: 4,
    title: "Receive and Sign Your Report",
    description: "Receive your suitability report in PDF format and review and sign it electronically.",
  },
];

const PROFILE_ITEMS = [
  "Investment objectives", "Investment time horizon", "Knowledge and experience",
  "Current portfolio", "Income and financial commitments", "Liquidity requirements",
  "Capacity to bear losses", "Risk tolerance", "Investment restrictions",
  "Sustainability preferences, where applicable",
];

const DOCUMENTS_INFO = [
  { icon: BarChart3, label: "Current investment portfolio" },
  { icon: TrendingUp, label: "Income information" },
  { icon: PieChart, label: "Assets and financial commitments" },
  { icon: FileText, label: "Existing investment statements" },
  { icon: ShieldCheck, label: "Identification and compliance documents" },
  { icon: ClipboardList, label: "Investment restriction information" },
  { icon: BookOpen, label: "Additional documents requested by the advisor" },
];

const FAQ_ITEMS = [
  {
    q: "Who provides the investment advisory service?",
    a: "Investment advisory services are provided by Advensys Insurance Finance, a regulated firm in France operating under AMF supervision. Opulanz facilitates access to this service on behalf of clients.",
  },
  {
    q: "What information will I need to provide?",
    a: "You will be asked to complete a MiFID II investor profile questionnaire covering your objectives, experience, financial situation, time horizon, liquidity needs, and risk tolerance.",
  },
  {
    q: "Why is a MiFID II questionnaire required?",
    a: "MiFID II regulations require investment advisors to gather sufficient information about a client's circumstances before providing a personal recommendation.",
  },
  {
    q: "What is a suitability report?",
    a: "A formal document explaining the client profile considered, the recommendations discussed, the associated risks, and why a proposed approach may be suitable for your circumstances.",
  },
  {
    q: "Does completing the questionnaire guarantee a recommendation?",
    a: "No. A recommendation will only be provided if the advisor determines that a suitable investment approach can be identified based on the information you provide.",
  },
  {
    q: "Can I update my information before the consultation?",
    a: "Yes. You can update the information provided at any time before the consultation takes place.",
  },
  {
    q: "How will my documents be protected?",
    a: "All documents and personal information are handled in accordance with applicable data protection regulations, including the GDPR.",
  },
  {
    q: "Is the service available in every country?",
    a: "The investment advisory service is currently designed for clients resident in France and Luxembourg.",
  },
];

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

      {/* Email status */}
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

      {/* Download copy */}
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

  // Wizard state
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

  const searchParams = useSearchParams();

  // Prefill details if redirected from consultation booking (schedule step 4)
  React.useEffect(() => {
    const qName = searchParams?.get("name");
    const qEmail = searchParams?.get("email");
    const qPhone = searchParams?.get("phone");

    if (qName || qEmail || qPhone) {
      setStarted(true);
      setClientType((prev) => prev || "personal");

      const nameParts = (qName || "").trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      setFormData((prev) => ({
        ...prev,
        titulaire1: {
          ...prev.titulaire1,
          firstName: firstName || prev.titulaire1.firstName,
          lastName: lastName || prev.titulaire1.lastName,
          email: qEmail || prev.titulaire1.email,
          phone: qPhone || prev.titulaire1.phone,
        },
      }));
    }
  }, [searchParams]);

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

  // Step 1: fill official QCC template PDF with form data BEFORE opening DocuSign
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
      console.error("[handleSign] PDF generation failed:", err);
      setStepError(
        locale === "fr"
          ? `Erreur lors de la génération du document QCC: ${err instanceof Error ? err.message : String(err)}`
          : `Error generating QCC document: ${err instanceof Error ? err.message : String(err)}`
      );
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Step 2: called by the modal after DocuSign signing_complete event
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
      const dateStr = now.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

      const signedName = `Signé via DocuSign (${envelopeId})`;

      // Download the SIGNED PDF from DocuSign (contains the actual embedded signature)
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
        // Fallback: re-fill the official QCC template
        const { fillTemplatePdf } = await import(
          "@/components/investment-advisory-test/iat-pdf-filler"
        );
        const { base64 } = await fillTemplatePdf(
          clientType === "company" ? "company" : "personal",
          formData
        );
        pdfBase64 = base64;
      }
      const formSummary = buildFormSummary(formData, locale);

      const docPrefix = clientType === "company" ? "DCE" : "QCC";
      const safeName = (resolvedClientName || "Client").replace(/\s+/g, "-");
      const filename = `${docPrefix}-${safeName}-${dateStr.replace(/\s/g, "-")}.pdf`;
      setSignedPdfBase64(pdfBase64);
      setSignedPdfFilename(filename);

      const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      // Upload signed PDF to Azure Blob Storage permanently via /api/upload
      let uploadedDocUrl: string | null = null;
      let uploadedBlobName: string | null = null;
      let uploadedFileSize: number | null = null;

      try {
        const byteCharacters = atob(pdfBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const pdfBlob = new Blob([byteArray], { type: "application/pdf" });
        uploadedFileSize = pdfBlob.size;

        const uploadForm = new FormData();
        uploadForm.append("file", pdfBlob, filename);
        uploadForm.append("type", "signed_mifid_qcc");

        const uploadResp = await fetch(`${API}/api/upload`, {
          method: "POST",
          body: uploadForm,
        });

        if (uploadResp.ok) {
          const uploadJson = await uploadResp.json();
          if (uploadJson.success && uploadJson.data) {
            uploadedDocUrl = uploadJson.data.fileUrl || uploadJson.data.url;
            uploadedBlobName = uploadJson.data.blobName;
            uploadedFileSize = uploadJson.data.fileSize || uploadedFileSize;
            console.log("✅ Signed QCC document saved to Azure Blob Storage:", uploadedDocUrl);
          }
        }
      } catch (uploadErr) {
        console.warn("Could not upload signed PDF to Azure Blob (non-fatal):", uploadErr);
      }

      try {
        const appResp = await fetch(`${API}/api/applications`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "investment_advisory",
            status: "submitted",
            payload: {
              clientName: resolvedClientName,
              firstName: clientType === "personal" ? formData.titulaire1.firstName : resolvedClientName,
              lastName: clientType === "personal" ? formData.titulaire1.lastName : "",
              companyName: clientType === "company" ? formData.companyIdentity.companyName : undefined,
              email: resolvedClientEmail,
              clientType: clientType === "personal" ? "PP" : "PM",
              envelopeId,
              signedAt: now.toISOString(),
              submittedAt: now.toISOString(),
              signedDocumentUrl: uploadedDocUrl,
              signedDocumentFilename: filename,
              signedDocumentBlobName: uploadedBlobName,
              signedDocumentSize: uploadedFileSize,
              documents: uploadedDocUrl ? [
                {
                  name: filename,
                  filename: filename,
                  url: uploadedDocUrl,
                  blobName: uploadedBlobName,
                  size: uploadedFileSize,
                  type: "signed_contract",
                }
              ] : [],
              formData,
            },
          }),
        });
        const appJson = await appResp.json();
        console.log("✅ Application created in database:", appJson);
      } catch (appErr) {
        console.error("❌ Failed to create application in DB:", appErr);
      }

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

  return (
    <>
      {/* Test badge */}
      <div className="bg-amber-50 border-b border-amber-200 py-2 text-center">
        <span className="inline-flex items-center gap-2 text-xs font-semibold text-amber-800">
          <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
          Internal Review Prototype — not published, not linked from any live page
        </span>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* HERO                                                                 */}
      {/* ------------------------------------------------------------------ */}
      <Hero
        title="Investment Guidance Built Around Your Goals"
        subtitle="Meet with an AMF-certified advisor to review your objectives, financial situation, investment experience, time horizon, and risk profile. Receive personalised recommendations supported by a formal suitability report."
        primaryCta={{
          label: "Start Your Advisory Request",
          onClick: startPrototype,
        }}
        secondaryCta={{
          label: "How It Works",
          href: "#process",
        }}
      />
      <div className="bg-white py-3 text-center text-xs text-brand-grayMed border-b border-brand-grayLight">
        Advisory services provided by Advensys Insurance Finance, France.
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* INTRODUCTION                                                         */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative bg-gradient-to-b from-white to-gray-50 py-12 md:py-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold/5 rounded-full blur-3xl pointer-events-none" />
        <div className="container mx-auto max-w-7xl px-6 relative z-10">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-start">
            <div>
              <SectionHeading overline="OUR APPROACH" title="Personalised Advice for Important Investment Decisions" align="left" className="mb-0" />
              <p className="mt-6 text-brand-grayMed leading-relaxed">
                Investment decisions should reflect more than expected returns. Our advisory process considers your financial objectives, experience, investment horizon, liquidity needs, personal constraints, and ability to accept risk.
              </p>
              <p className="mt-4 text-brand-grayMed leading-relaxed">
                Through a structured consultation and MiFID II assessment, your advisor can evaluate whether proposed investment solutions are appropriate for your circumstances.
              </p>
            </div>
            <div className="grid gap-4">
              {BENEFITS.map(({ icon: Icon, title, description }) => (
                <div key={title} className="group flex gap-4 rounded-2xl border border-brand-grayLight bg-white p-5 shadow-sm transition-all hover:border-brand-gold/40 hover:shadow-md">
                  <div className="flex-shrink-0 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gold/10 group-hover:bg-brand-gold/20 transition-colors">
                    <Icon className="h-5 w-5 text-brand-gold" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-brand-dark">{title}</h3>
                    <p className="text-sm text-brand-grayMed leading-relaxed">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* HOW IT WORKS                                                         */}
      {/* ------------------------------------------------------------------ */}
      <section id="process" className="relative bg-white py-12 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_110%)] opacity-20 pointer-events-none" />
        <div className="container mx-auto max-w-7xl px-6 relative z-10">
          <SectionHeading overline="THE PROCESS" title="Your Investment Advisory Journey" className="mb-12" />
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {PROCESS_STEPS.map((s, idx) => (
              <div key={s.num} className="group relative text-center">
                {idx < PROCESS_STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 -translate-x-1/2 bg-gradient-to-r from-brand-gold/40 to-brand-gold/10 z-0" />
                )}
                <div className="relative z-10">
                  <div className="relative inline-block mb-4">
                    <div className="absolute inset-0 bg-brand-gold rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
                    <div className="relative inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-gold to-brand-goldDark text-white text-xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                      {s.num}
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
      <section className="bg-gray-50 py-12 md:py-20">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-start">
            <div>
              <SectionHeading overline="MIFID II ASSESSMENT" title="A Structured MiFID II Assessment" description="Before recommendations can be provided, we need to understand your financial profile and investment needs." align="left" className="mb-0" />
            </div>
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {PROFILE_ITEMS.map((item) => (
                  <div key={item} className="flex items-start gap-2.5 rounded-xl border border-brand-grayLight bg-white px-4 py-3 shadow-sm">
                    <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-gold" aria-hidden="true" />
                    <span className="text-sm text-brand-dark">{item}</span>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-brand-gold/30 bg-brand-gold/5 p-4">
                <p className="text-sm text-brand-dark leading-relaxed">
                  <strong>Please note: </strong>Your responses help the advisor assess whether a recommendation is suitable for your circumstances. Completing the questionnaire does not guarantee that a particular investment product will be recommended.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* DOCUMENTS OVERVIEW                                                   */}
      {/* ------------------------------------------------------------------ */}
      <section className="bg-white py-12 md:py-20">
        <div className="container mx-auto max-w-7xl px-6">
          <SectionHeading overline="DOCUMENTATION" title="Information You May Be Asked to Provide" className="mb-10" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-6">
            {DOCUMENTS_INFO.map(({ icon: Icon, label }) => (
              <div key={label} className="group flex items-start gap-3 rounded-xl border border-brand-grayLight bg-gray-50 p-4 transition-all hover:border-brand-gold/40 hover:bg-white hover:shadow-sm">
                <div className="flex-shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gold/10 group-hover:bg-brand-gold/20 transition-colors">
                  <Icon className="h-4 w-4 text-brand-gold" aria-hidden="true" />
                </div>
                <span className="text-sm font-medium text-brand-dark leading-snug pt-1">{label}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-brand-grayMed max-w-2xl mx-auto text-center">
            The exact documentation required may depend on your profile, country of residence, and the nature of the advisory request.
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* START CTA (if not yet started)                                       */}
      {/* ------------------------------------------------------------------ */}
      {!started && (
        <section className="bg-gray-50 py-12 md:py-16">
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
                <Button variant="primary" size="lg" onClick={startPrototype}>
                  {t("wizard.startBtn")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button asChild variant="outline" size="lg">
                  <a href="#consultation-info">{t("wizard.bookConsultation")}</a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* WIZARD anchor                                                        */}
      {/* ------------------------------------------------------------------ */}
      <div ref={prototypeRef} />

      {/* ------------------------------------------------------------------ */}
      {/* MULTI-STEP QCC WIZARD                                                */}
      {/* ------------------------------------------------------------------ */}
      {started && (
        <section className="bg-white py-10 md:py-16">
          <div className="container mx-auto max-w-4xl px-6">

            {!completed ? (
              <>
                {/* Type selector — shown until a type is chosen */}
                {!clientType ? (
                  <Card className="border-none shadow-lg">
                    <CardContent className="p-6 md:p-8">
                      <IATTypeSelector onSelect={handleSelectType} />
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {/* Progress */}
                    <div className="mb-8 rounded-2xl border border-brand-grayLight bg-gray-50 p-4 md:p-6">
                      <IATProgress step={step} totalSteps={8} labels={stepLabels} />
                    </div>

                    {/* Step card */}
                    <Card className="border-none shadow-lg">
                      <CardHeader className="border-b border-brand-grayLight pb-4">
                        <CardTitle className="text-lg text-brand-grayMed font-normal">
                          {stepTitle}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6 md:p-8">

                        {/* Back to type selector */}
                        {step === 1 && (
                          <div className="mb-4">
                            <button
                              type="button"
                              onClick={() => { setClientType(null); setStepError(""); }}
                              className="text-xs text-brand-grayMed hover:text-brand-gold underline underline-offset-2"
                            >
                              {t("wizard.changeClientType")}
                            </button>
                          </div>
                        )}

                        {/* ---- PP Steps ---- */}
                        {clientType === "personal" && step === 1 && (
                          <IATppStep1
                            formData={formData}
                            onChange={updateFormData}
                            onNext={() => goToStep(2)}
                            error={stepError}
                            setError={setStepError}
                          />
                        )}
                        {clientType === "personal" && step === 2 && (
                          <IATppStep2
                            formData={formData}
                            onChange={updateFormData}
                            onNext={() => goToStep(3)}
                            error={stepError}
                            setError={setStepError}
                          />
                        )}
                        {clientType === "personal" && step === 3 && (
                          <IATppStep3
                            formData={formData}
                            onChange={updateFormData}
                            onNext={() => goToStep(4)}
                            error={stepError}
                            setError={setStepError}
                          />
                        )}

                        {/* ---- PM Steps ---- */}
                        {clientType === "company" && step === 1 && (
                          <IATpmStep1
                            formData={formData}
                            onChange={updateFormData}
                            onNext={() => goToStep(2)}
                            error={stepError}
                            setError={setStepError}
                          />
                        )}
                        {clientType === "company" && step === 2 && (
                          <IATpmStep2
                            formData={formData}
                            onChange={updateFormData}
                            onNext={() => goToStep(3)}
                            error={stepError}
                            setError={setStepError}
                          />
                        )}
                        {clientType === "company" && step === 3 && (
                          <IATpmStep3
                            formData={formData}
                            onChange={updateFormData}
                            onNext={() => goToStep(4)}
                            error={stepError}
                            setError={setStepError}
                          />
                        )}

                        {/* ---- Shared Steps ---- */}
                        {step === 4 && (
                          <IATStepKnowledge
                            formData={formData}
                            onChange={updateFormData}
                            onNext={() => goToStep(5)}
                            error={stepError}
                            setError={setStepError}
                          />
                        )}
                        {step === 5 && (
                          <IATStepObjectives
                            formData={formData}
                            onChange={updateFormData}
                            onNext={() => goToStep(6)}
                            error={stepError}
                            setError={setStepError}
                          />
                        )}
                        {step === 6 && (
                          <IATStepESG
                            formData={formData}
                            onChange={updateFormData}
                            onNext={() => goToStep(7)}
                            error={stepError}
                            setError={setStepError}
                          />
                        )}
                        {step === 7 && (
                          <IATCalendly
                            formData={formData}
                            onChange={updateFormData}
                            onNext={() => goToStep(8)}
                            error={stepError}
                            setError={setStepError}
                          />
                        )}
                        {step === 8 && (
                          <IATStepReview
                            formData={formData}
                            onChange={updateFormData}
                            onSign={handleSign}
                            isGeneratingPdf={isGeneratingPdf}
                            error={stepError}
                            setError={setStepError}
                          />
                        )}

                        {/* Back navigation (steps 2–8) */}
                        {step > 1 && step < 8 && (
                          <div className="mt-6 pt-4 border-t border-brand-grayLight">
                            <button
                              type="button"
                              onClick={() => goToStep(step - 1)}
                              className="text-sm text-brand-grayMed hover:text-brand-dark underline underline-offset-2"
                            >
                              {t("wizard.previousStep")}
                            </button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </>
                )}
              </>
            ) : (
              <CompletionScreen
                onRestart={restart}
                locale={locale}
                clientName={clientName}
                emailStatus={emailStatus}
                pdfBase64={signedPdfBase64}
                pdfFilename={signedPdfFilename}
              />
            )}
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* REGULATORY NOTICE                                                    */}
      {/* ------------------------------------------------------------------ */}
      <section className="bg-gray-50 py-12 md:py-16">
        <div className="container mx-auto max-w-4xl px-6">
          <SectionHeading overline="IMPORTANT INFORMATION" title="Regulatory Notice" className="mb-8" />
          <div className="rounded-2xl border border-brand-grayLight bg-white p-6 md:p-8 shadow-sm space-y-4">
            {[
              "Investment advisory services are provided by Advensys Insurance Finance in France.",
              "Investment values can rise or fall. Past performance does not guarantee future results.",
              "Any recommendation must be based on an assessment of the client's individual circumstances, objectives, knowledge, experience, financial situation, risk tolerance, and capacity to bear losses.",
              "The information presented on this test page is general and does not constitute personal investment advice, an offer, or a recommendation to purchase or sell any financial instrument.",
              "This page is a management-review prototype and does not confirm that the service is currently available.",
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-gold" aria-hidden="true" />
                <p className="text-sm text-brand-grayMed leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2">
            {[
              { label: "Legal Notice", href: `/${locale}/legal/mentions` },
              { label: "Terms & Conditions", href: `/${locale}/legal/terms` },
              { label: "Privacy Policy", href: `/${locale}/legal/privacy` },
              { label: "Disclaimers", href: `/${locale}/legal/disclaimers` },
              { label: "Regulatory Information", href: `/${locale}/legal/regulatory` },
            ].map(({ label, href }) => (
              <Link key={label} href={href} className="text-xs text-brand-gold underline underline-offset-2 hover:text-brand-goldDark transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* TECHNICAL & COMPLIANCE SECTION                                       */}
      {/* ------------------------------------------------------------------ */}
      <section className="bg-white py-12 md:py-16">
        <div className="container mx-auto max-w-4xl px-6">
          <SectionHeading overline="INTERNAL REVIEW" title="Technical & Compliance Requirements" description="This section is for management review only and describes the intended production requirements. It does not make unsupported legal guarantees." className="mb-8" />
          <IATTechSection />
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* FAQ                                                                  */}
      {/* ------------------------------------------------------------------ */}
      <section className="bg-gray-50 py-12 md:py-20">
        <div className="container mx-auto max-w-3xl px-6">
          <SectionHeading overline="FAQ" title="Frequently Asked Questions" className="mb-10" />
          <div className="rounded-2xl border border-brand-grayLight bg-white px-6 shadow-sm">
            {FAQ_ITEMS.map((item, i) => (
              <FaqItem key={i} index={i} question={item.q} answer={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* FINAL CTA                                                            */}
      {/* ------------------------------------------------------------------ */}
      <section id="consultation-info" className="hero-gradient py-12 md:py-20">
        <div className="container mx-auto max-w-4xl px-6 text-center">
          <h2 className="mb-4 text-balance text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            Ready to Discuss Your Investment Objectives?
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-balance text-lg text-white/90">
            Complete the initial request and our team will help guide you through the next steps.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              onClick={startPrototype}
              className="inline-flex h-14 min-w-48 items-center justify-center rounded-2xl bg-white px-8 text-base font-semibold text-brand-dark shadow-sm transition-all hover:bg-gray-50"
            >
              Request a Consultation
            </button>
            <Link
              href={`/${locale}/support`}
              className="inline-flex h-14 min-w-48 items-center justify-center rounded-2xl border-2 border-white bg-transparent px-8 text-base font-semibold text-white transition-all hover:bg-white/10"
            >
              Contact Us
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
        locale={locale}
        onClose={() => setShowDocuSign(false)}
        onSigned={handleSigned}
      />
    </>
  );
}
