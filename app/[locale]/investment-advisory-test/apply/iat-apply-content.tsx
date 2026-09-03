"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle, FileText, ArrowRight, AlertCircle, Mail, ArrowLeft,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// QCC wizard components
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
import {
  defaultFormData,
  type IATFormData,
  type ClientType,
} from "@/components/investment-advisory-test/iat-types";

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
          <Link href={`/${locale}/investment-advisory-test`}>
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
// MAIN APPLY PAGE
// ---------------------------------------------------------------------------

export function IATApplyContent({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  const t = useTranslations("iat");

  // Wizard state
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

  const wizardRef = React.useRef<HTMLDivElement>(null);

  const updateFormData = (updates: Partial<IATFormData>) =>
    setFormData((prev) => ({ ...prev, ...updates }));

  const scrollToTop = () =>
    setTimeout(() => wizardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);

  const goToStep = (n: number) => {
    setStep(n);
    setStepError("");
    scrollToTop();
  };

  const handleSelectType = (type: ClientType) => {
    setClientType(type);
    setFormData({ ...defaultFormData, clientType: type });
    setStep(1);
    setStepError("");
    scrollToTop();
  };

  const restart = () => {
    setFormData(defaultFormData);
    setStep(1);
    setClientType(null);
    setCompleted(false);
    setShowDocuSign(false);
    setEmailStatus("idle");
    setSignedPdfBase64(undefined);
    setSignedPdfFilename(undefined);
    setStepError("");
    scrollToTop();
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

      {/* Back to overview */}
      <div className="bg-white border-b border-brand-grayLight">
        <div className="container mx-auto max-w-4xl px-6 py-3">
          <Link
            href={`/${locale}/investment-advisory-test`}
            className="inline-flex items-center gap-1.5 text-sm text-brand-grayMed hover:text-brand-gold transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Overview
          </Link>
        </div>
      </div>

      {/* Wizard anchor */}
      <div ref={wizardRef} />

      {/* MULTI-STEP QCC WIZARD */}
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

      {/* DOCUSIGN MODAL */}
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
