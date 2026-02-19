"use client";

import * as React from "react";
import { v4 as uuidv4 } from "uuid";
import Link from "next/link";
import Script from "next/script";
import {
  Briefcase,
  Upload,
  CheckCircle,
  X,
  FileText,
  AlertCircle,
  Download,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CompanyFormationDossier,
  UploadedFile,
} from "@/types/company-formation";
import { useTranslations } from "next-intl";

// Extend Window interface for PayPal
declare global {
  interface Window {
    paypal?: any;
  }
}

type StepProps = {
  dossier: Partial<CompanyFormationDossier>;
  updateDossier: (updates: Partial<CompanyFormationDossier>) => void;
};

// Step 5: Activity & Scale
export function Step5Activity({ dossier, updateDossier }: StepProps) {
  const t = useTranslations("companyFormation.wizard");
  const [naceCode, setNaceCode] = React.useState(dossier.naceCode || "");
  const [expectedTurnover, setExpectedTurnover] = React.useState(dossier.expectedTurnover || 0);
  const [numberOfEmployees, setNumberOfEmployees] = React.useState(dossier.numberOfEmployees || 0);

  React.useEffect(() => {
    updateDossier({
      naceCode,
      expectedTurnover,
      numberOfEmployees,
    });
  }, [naceCode, expectedTurnover, numberOfEmployees]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="naceCode">
          {t("step5.naceCode")} <span className="text-red-500">{t("step5.naceCodeRequired")}</span>
        </Label>
        <Input
          id="naceCode"
          value={naceCode}
          onChange={(e) => setNaceCode(e.target.value)}
          placeholder={t("step5.naceCodePlaceholder")}
        />
        <p className="text-xs text-brand-grayMed">
          {t("step5.naceCodeHint")}{" "}
          <a
            href="https://nacev2.com/en"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-gold hover:underline"
          >
            {t("step5.findNaceCode")}
          </a>
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="expectedTurnover">
          {t("step5.expectedTurnover")} <span className="text-red-500">{t("step5.expectedTurnoverRequired")}</span>
        </Label>
        <Input
          id="expectedTurnover"
          type="number"
          min="0"
          value={expectedTurnover}
          onChange={(e) => setExpectedTurnover(parseFloat(e.target.value) || 0)}
          placeholder={t("step5.expectedTurnoverPlaceholder")}
        />
        <p className="text-xs text-brand-grayMed">
          {t("step5.expectedTurnoverHint")}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="numberOfEmployees">
          {t("step5.numberOfEmployees")}
        </Label>
        <Input
          id="numberOfEmployees"
          type="number"
          min="0"
          value={numberOfEmployees}
          onChange={(e) => setNumberOfEmployees(parseInt(e.target.value) || 0)}
          placeholder={t("step5.numberOfEmployeesPlaceholder")}
        />
        <p className="text-xs text-brand-grayMed">
          {t("step5.numberOfEmployeesHint")}
        </p>
      </div>

      <div className="rounded-xl bg-blue-50 p-4">
        <h4 className="mb-2 font-semibold text-blue-900">{t("step5.whyWeAskTitle")}</h4>
        <p className="text-sm text-blue-800">
          {t("step5.whyWeAskDescription")}
        </p>
      </div>
    </div>
  );
}

// Step 6: Notary & Domiciliation
export function Step6NotaryDomiciliation({ dossier, updateDossier }: StepProps) {
  const t = useTranslations("companyFormation.wizard");
  const [notaryName, setNotaryName] = React.useState(dossier.notaryPreferences?.name || "");
  const [notaryCity, setNotaryCity] = React.useState(dossier.notaryPreferences?.city || "");
  const [notaryLanguage, setNotaryLanguage] = React.useState<"FR" | "EN" | "DE">(
    dossier.notaryPreferences?.language || "EN"
  );
  const [domiciliationNeeded, setDomiciliationNeeded] = React.useState(dossier.domiciliationNeeded || false);

  React.useEffect(() => {
    updateDossier({
      notaryPreferences: {
        name: notaryName || undefined,
        city: notaryCity || undefined,
        language: notaryLanguage,
      },
      domiciliationNeeded,
    });
  }, [notaryName, notaryCity, notaryLanguage, domiciliationNeeded]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-bold text-brand-dark">{t("step6.notaryPreferences")}</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notaryName">{t("step6.preferredNotaryName")}</Label>
            <Input
              id="notaryName"
              value={notaryName}
              onChange={(e) => setNotaryName(e.target.value)}
              placeholder={t("step6.preferredNotaryNamePlaceholder")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notaryCity">{t("step6.preferredCity")}</Label>
            <Input
              id="notaryCity"
              value={notaryCity}
              onChange={(e) => setNotaryCity(e.target.value)}
              placeholder={t("step6.preferredCityPlaceholder")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notaryLanguage">{t("step6.languageForDeeds")}</Label>
            <select
              id="notaryLanguage"
              className="flex h-11 w-full rounded-xl border border-brand-grayLight bg-white px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
              value={notaryLanguage}
              onChange={(e) => setNotaryLanguage(e.target.value as "FR" | "EN" | "DE")}
            >
              <option value="EN">{t("step6.languageEnglish")}</option>
              <option value="FR">{t("step6.languageFrench")}</option>
              <option value="DE">{t("step6.languageGerman")}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="border-t border-brand-grayLight pt-6">
        <h3 className="mb-4 text-lg font-bold text-brand-dark">{t("step6.registeredOffice")}</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="domiciliationNeeded"
              checked={domiciliationNeeded}
              onCheckedChange={(checked) => setDomiciliationNeeded(checked as boolean)}
            />
            <div>
              <Label htmlFor="domiciliationNeeded" className="cursor-pointer font-semibold">
                {t("step6.needDomiciliation")}
              </Label>
              <p className="mt-1 text-sm text-brand-grayMed">
                {t("step6.domiciliationDescription")}
              </p>
            </div>
          </div>

          {domiciliationNeeded && (
            <div className="rounded-xl bg-brand-goldLight/20 p-4">
              <h4 className="mb-2 font-semibold text-brand-dark">{t("step6.domiciliationServiceTitle")}</h4>
              <p className="text-sm text-brand-grayMed mb-2">
                {t("step6.domiciliationServiceDescription")}
              </p>
              <ul className="text-sm text-brand-dark space-y-1">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-brand-gold flex-shrink-0 mt-0.5" />
                  <span>{t("step6.domiciliationFeature1")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-brand-gold flex-shrink-0 mt-0.5" />
                  <span>{t("step6.domiciliationFeature2")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-brand-gold flex-shrink-0 mt-0.5" />
                  <span>{t("step6.domiciliationFeature3")}</span>
                </li>
              </ul>
              <p className="mt-3 text-sm font-semibold text-brand-dark">
                {t("step6.domiciliationPrice")}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl bg-blue-50 p-4">
        <p className="text-sm text-blue-900">
          <strong>{t("noteTitle")}</strong> {t("step6.noteDomiciliation")}
        </p>
      </div>
    </div>
  );
}

// Step 7: Documents
export function Step7Documents({ dossier, updateDossier }: StepProps) {
  const t = useTranslations("companyFormation.wizard");
  const [idDocs, setIdDocs] = React.useState<UploadedFile[]>(dossier.uploads?.ids || []);
  const [leaseDocs, setLeaseDocs] = React.useState<UploadedFile[]>(dossier.uploads?.leaseOrDomiciliation || []);
  const [capitalCert, setCapitalCert] = React.useState<UploadedFile | null>(dossier.uploads?.capitalCertificate || null);

  React.useEffect(() => {
    updateDossier({
      uploads: {
        ids: idDocs,
        leaseOrDomiciliation: leaseDocs,
        capitalCertificate: capitalCert,
      },
    });
  }, [idDocs, leaseDocs, capitalCert]);

  const simulateUpload = (type: "id" | "lease" | "capital") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadedFile: UploadedFile = {
      id: uuidv4(),
      filename: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
    };

    switch (type) {
      case "id":
        setIdDocs([...idDocs, uploadedFile]);
        break;
      case "lease":
        setLeaseDocs([...leaseDocs, uploadedFile]);
        break;
      case "capital":
        setCapitalCert(uploadedFile);
        break;
    }

    e.target.value = "";
  };

  const removeFile = (type: "id" | "lease" | "capital", id?: string) => {
    switch (type) {
      case "id":
        setIdDocs(idDocs.filter(f => f.id !== id));
        break;
      case "lease":
        setLeaseDocs(leaseDocs.filter(f => f.id !== id));
        break;
      case "capital":
        setCapitalCert(null);
        break;
    }
  };

  return (
    <div className="space-y-8">
      {/* ID Documents */}
      <div>
        <h3 className="mb-2 text-lg font-bold text-brand-dark">
          {t("step7.idDocuments")} <span className="text-red-500">{t("step7.idDocumentsRequired")}</span>
        </h3>
        <p className="mb-4 text-sm text-brand-grayMed">
          {t("step7.idDocumentsDescription")}
        </p>
        <div className="space-y-4">
          {idDocs.map((file) => (
            <FileCard key={file.id} file={file} onRemove={() => removeFile("id", file.id)} />
          ))}
          <label className="flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-brand-grayLight p-6 transition-colors hover:border-brand-gold hover:bg-brand-goldLight/10">
            <input
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={simulateUpload("id")}
            />
            <div className="text-center">
              <Upload className="mx-auto mb-2 h-8 w-8 text-brand-grayMed" />
              <p className="text-sm font-semibold text-brand-dark">{t("step7.uploadIdPassport")}</p>
              <p className="text-xs text-brand-grayMed">{t("step7.uploadFileFormats")}</p>
            </div>
          </label>
        </div>
      </div>

      {/* Lease/Domiciliation Proof */}
      {!dossier.domiciliationNeeded && (
        <div>
          <h3 className="mb-2 text-lg font-bold text-brand-dark">
            {t("step7.leaseAgreement")} <span className="text-red-500">{t("step7.leaseAgreementRequired")}</span>
          </h3>
          <p className="mb-4 text-sm text-brand-grayMed">
            {t("step7.leaseAgreementDescription")}
          </p>
          <div className="space-y-4">
            {leaseDocs.map((file) => (
              <FileCard key={file.id} file={file} onRemove={() => removeFile("lease", file.id)} />
            ))}
            <label className="flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-brand-grayLight p-6 transition-colors hover:border-brand-gold hover:bg-brand-goldLight/10">
              <input
                type="file"
                className="hidden"
                accept=".pdf"
                onChange={simulateUpload("lease")}
              />
              <div className="text-center">
                <Upload className="mx-auto mb-2 h-8 w-8 text-brand-grayMed" />
                <p className="text-sm font-semibold text-brand-dark">{t("step7.uploadLease")}</p>
                <p className="text-xs text-brand-grayMed">{t("step7.uploadLeasePDF")}</p>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Capital Certificate */}
      <div>
        <h3 className="mb-2 text-lg font-bold text-brand-dark">
          {t("step7.capitalCertificate")}
        </h3>
        <p className="mb-4 text-sm text-brand-grayMed">
          {t("step7.capitalCertificateDescription")}
        </p>
        <div className="space-y-4">
          {capitalCert ? (
            <FileCard file={capitalCert} onRemove={() => removeFile("capital")} />
          ) : (
            <label className="flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-brand-grayLight p-6 transition-colors hover:border-brand-gold hover:bg-brand-goldLight/10">
              <input
                type="file"
                className="hidden"
                accept=".pdf"
                onChange={simulateUpload("capital")}
              />
              <div className="text-center">
                <Upload className="mx-auto mb-2 h-8 w-8 text-brand-grayMed" />
                <p className="text-sm font-semibold text-brand-dark">{t("step7.uploadCertificate")}</p>
                <p className="text-xs text-brand-grayMed">{t("step7.uploadLeasePDF")}</p>
              </div>
            </label>
          )}
        </div>
      </div>

      <div className="rounded-xl bg-yellow-50 p-4">
        <p className="text-sm text-yellow-900">
          <AlertCircle className="inline h-4 w-4 mr-1" />
          <strong>{t("noteTitle")}</strong> {t("step7.simulationNote")}
        </p>
      </div>
    </div>
  );
}

function FileCard({ file, onRemove }: { file: UploadedFile; onRemove: () => void }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-brand-grayLight p-4">
      <div className="flex items-center gap-3">
        <FileText className="h-8 w-8 text-brand-gold" />
        <div>
          <p className="font-semibold text-brand-dark">{file.filename}</p>
          <p className="text-xs text-brand-grayMed">
            {(file.size / 1024).toFixed(1)} KB • {new Date(file.uploadedAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={onRemove}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

// Step 8: Review & Submit
export function Step8ReviewSubmit({ dossier, updateDossier }: StepProps) {
  const t = useTranslations("companyFormation.wizard");
  const [termsAccepted, setTermsAccepted] = React.useState(dossier.consents?.termsAccepted || false);
  const [privacyAccepted, setPrivacyAccepted] = React.useState(dossier.consents?.privacyAccepted || false);
  const [accuracyConfirmed, setAccuracyConfirmed] = React.useState(dossier.consents?.accuracyConfirmed || false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [isPaymentComplete, setIsPaymentComplete] = React.useState(dossier.paymentStatus === "PAID");
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isPayPalLoaded, setIsPayPalLoaded] = React.useState(false);
  const [paypalOrderId, setPaypalOrderId] = React.useState("");

  const setupFee = 1500;

  React.useEffect(() => {
    updateDossier({
      consents: { termsAccepted, privacyAccepted, accuracyConfirmed },
      setupFeeAmount: setupFee,
    });
  }, [termsAccepted, privacyAccepted, accuracyConfirmed]);

  React.useEffect(() => {
    if (!isPaymentComplete && isPayPalLoaded && window.paypal) {
      window.paypal.Buttons({
        createOrder: function(data: any, actions: any) {
          return actions.order.create({
            purchase_units: [{
              description: `Company Formation - ${dossier.formType?.toUpperCase()} - ${dossier.proposedNames?.[0] || 'Company'}`,
              amount: {
                currency_code: 'EUR',
                value: setupFee.toFixed(2)
              }
            }]
          });
        },
        onApprove: async function(data: any, actions: any) {
          const order = await actions.order.capture();
          setPaypalOrderId(order.id);
          setIsPaymentComplete(true);
          updateDossier({
            paymentStatus: "PAID",
            paypalOrderId: order.id,
            paypalPaymentDetails: order
          });
        },
        onError: function(err: any) {
          console.error('PayPal error:', err);
          alert('Payment failed. Please try again or contact support.');
        }
      }).render('#paypal-button-container');
    }
  }, [isPayPalLoaded, isPaymentComplete, setupFee]);

  const handleSubmit = async () => {
    if (!termsAccepted || !privacyAccepted || !accuracyConfirmed) {
      alert("Please accept all required consents");
      return;
    }

    setIsProcessing(true);

    try {
      const finalDossier: CompanyFormationDossier = dossier as CompanyFormationDossier;
      finalDossier.updatedAt = new Date().toISOString();

      const applicationPayload = {
        type: "company_formation",
        status: "submitted",
        payload: {
          formType: finalDossier.formType,
          country: finalDossier.country,
          proposedNames: finalDossier.proposedNames,
          purpose: finalDossier.purpose,
          registeredOffice: finalDossier.registeredOffice,
          duration: finalDossier.duration,
          shareholders: finalDossier.shareholders,
          directors: finalDossier.directors,
          managers: finalDossier.managers,
          ubos: finalDossier.ubos,
          capitalAmount: finalDossier.capitalAmount,
          capitalCurrency: finalDossier.capitalCurrency,
          contributions: finalDossier.contributions,
          naceCode: finalDossier.naceCode,
          expectedTurnover: finalDossier.expectedTurnover,
          numberOfEmployees: finalDossier.numberOfEmployees,
          notaryPreferences: finalDossier.notaryPreferences,
          domiciliationNeeded: finalDossier.domiciliationNeeded,
          uploads: finalDossier.uploads,
          consents: finalDossier.consents,
          setupFeeAmount: finalDossier.setupFeeAmount,
          paymentStatus: finalDossier.paymentStatus,
          userRef: finalDossier.userRef,
          submittedAt: new Date().toISOString(),
        },
      };

      console.log("📤 Submitting to backend:", applicationPayload);

      const response = await fetch("http://localhost:5000/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(applicationPayload),
      });

      console.log("📥 Response status:", response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.text();
        console.error("❌ Backend error:", errorData);
        throw new Error(`Server responded with ${response.status}: ${errorData}`);
      }

      const result = await response.json();
      console.log("✅ Company Formation Dossier saved to backend:", result);

      const existingDossiers = localStorage.getItem("opulanz_company_formations");
      const dossiers = existingDossiers ? JSON.parse(existingDossiers) : [];
      dossiers.push(finalDossier);
      localStorage.setItem("opulanz_company_formations", JSON.stringify(dossiers));

      console.log("🏢 Company Formation Dossier Submitted:", finalDossier);

      setIsSubmitted(true);
    } catch (error: any) {
      console.error("❌ Error submitting company formation:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      alert(
        `Failed to submit company formation.\n\nError: ${error.message}\n\nPlease check the console for details or contact support.`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="space-y-6 text-center py-12">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-brand-dark">
          {t("step8.submissionSuccessTitle")}
        </h3>
        <p className="text-brand-grayMed max-w-2xl mx-auto">
          {t("step8.submissionSuccessMessage")}
        </p>
        <div className="rounded-xl bg-brand-goldLight/20 p-6 max-w-md mx-auto">
          <p className="text-sm text-brand-dark">
            <strong>{t("step8.reference", { ref: dossier.userRef })}</strong>
          </p>
          <p className="text-xs text-brand-grayMed mt-2">
            {t("step8.emailConfirmation")}
          </p>
        </div>
        <Button onClick={() => window.location.href = "/"}>
          {t("step8.returnToHome")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary */}
      <div>
        <h3 className="mb-4 text-lg font-bold text-brand-dark">{t("step8.dossierSummary")}</h3>
        <div className="space-y-4">
          <SummarySection title={t("step8.companyType")}>
            <p>{dossier.formType}</p>
          </SummarySection>

          <SummarySection title={t("step8.companyName")}>
            <p>{dossier.proposedNames?.[0] || t("step8.notProvided")}</p>
            {dossier.proposedNames?.[1] && (
              <p className="text-sm text-brand-grayMed">{t("step8.alternate", { name: dossier.proposedNames[1] })}</p>
            )}
          </SummarySection>

          <SummarySection title={t("step8.capital")}>
            <p>€{dossier.capitalAmount?.toLocaleString() || 0} EUR</p>
          </SummarySection>

          <SummarySection title={t("step8.people")}>
            <p>{t("step8.shareholdersCount", { count: dossier.shareholders?.length || 0 })}</p>
            {dossier.directors && dossier.directors.length > 0 && (
              <p>{t("step8.directorsCount", { count: dossier.directors.length })}</p>
            )}
            {dossier.managers && dossier.managers.length > 0 && (
              <p>{t("step8.managersCount", { count: dossier.managers.length })}</p>
            )}
            <p>{t("step8.ubosCount", { count: dossier.ubos?.length || 0 })}</p>
          </SummarySection>

          <SummarySection title={t("step8.activity")}>
            <p>{t("step8.nace", { code: dossier.naceCode || t("step8.notProvided") })}</p>
            <p>{t("step8.expectedTurnover", { amount: dossier.expectedTurnover?.toLocaleString() || 0 })}</p>
          </SummarySection>

          <SummarySection title={t("step8.documents")}>
            <p>{t("step8.idDocuments", { count: dossier.uploads?.ids?.length || 0 })}</p>
            <p>{t("step8.leaseDomiciliation", { status: dossier.domiciliationNeeded ? t("step8.serviceRequested") : t("step8.uploaded", { count: dossier.uploads?.leaseOrDomiciliation?.length || 0 }) })}</p>
            <p>{t("step8.capitalCertificate", { status: dossier.uploads?.capitalCertificate ? t("step8.uploadedStatus") : t("step8.notYet") })}</p>
          </SummarySection>
        </div>
      </div>

      {/* Payment */}
      {!isPaymentComplete && (
        <>
          <Script
            src={`https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'test'}&currency=EUR`}
            onLoad={() => setIsPayPalLoaded(true)}
          />
          <div className="rounded-xl border-2 border-brand-gold p-6">
            <h3 className="mb-4 text-lg font-bold text-brand-dark">{t("step8.setupFeePayment")}</h3>
            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900">
                {t("step8.securePaymentNote")}
              </p>
            </div>
            <div className="mb-4 flex items-center justify-between rounded-xl bg-brand-goldLight/20 p-4">
              <span className="font-semibold text-brand-dark">{t("step8.setupFee")}</span>
              <span className="text-2xl font-bold text-brand-gold">€{setupFee.toFixed(2)}</span>
            </div>
            <p className="mb-6 text-sm text-brand-grayMed">
              {t("step8.setupFeeDescription")}
            </p>

            <div id="paypal-button-container" className="mb-4"></div>

            {!isPayPalLoaded && (
              <div className="text-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-gold border-r-transparent"></div>
                <p className="mt-4 text-brand-grayMed">{t("step8.loadingPaymentOptions")}</p>
              </div>
            )}
          </div>
        </>
      )}

      {isPaymentComplete && (
        <div className="rounded-xl bg-green-50 p-4 border border-green-200">
          <div className="flex items-center gap-2 text-green-700 mb-2">
            <CheckCircle className="h-5 w-5" />
            <span className="font-semibold">{t("step8.paymentComplete")}</span>
          </div>
          {paypalOrderId && (
            <p className="text-sm text-green-800">
              {t("step8.paypalOrderId")} <span className="font-mono font-semibold">{paypalOrderId}</span>
            </p>
          )}
          <p className="text-sm text-green-800 mt-1">
            {t("step8.paymentCompleteFee", { amount: setupFee.toFixed(2) })}
          </p>
        </div>
      )}

      {/* Consents */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-brand-dark">{t("step8.requiredConsents")}</h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="accuracyConfirmed"
              checked={accuracyConfirmed}
              onCheckedChange={(checked) => setAccuracyConfirmed(checked as boolean)}
            />
            <Label htmlFor="accuracyConfirmed" className="cursor-pointer leading-relaxed">
              {t("step8.accuracyConfirmation")}
            </Label>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="termsAccepted"
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
            />
            <Label htmlFor="termsAccepted" className="cursor-pointer leading-relaxed">
              {t("step8.termsAcceptance")}{" "}
              <Link href="/en/legal/terms" className="text-brand-gold hover:underline">
                {t("step8.termsLink")}
              </Link>
            </Label>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="privacyAccepted"
              checked={privacyAccepted}
              onCheckedChange={(checked) => setPrivacyAccepted(checked as boolean)}
            />
            <Label htmlFor="privacyAccepted" className="cursor-pointer leading-relaxed">
              {t("step8.privacyAcceptance")}{" "}
              <Link href="/en/legal/privacy" className="text-brand-gold hover:underline">
                {t("step8.privacyLink")}
              </Link>
            </Label>
          </div>
        </div>
      </div>

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={!termsAccepted || !privacyAccepted || !accuracyConfirmed || !isPaymentComplete}
        size="lg"
        className="w-full"
      >
        {isProcessing ? t("step8.processing") : t("step8.submitDossier")}
      </Button>

      {(!termsAccepted || !privacyAccepted || !accuracyConfirmed || !isPaymentComplete) && (
        <p className="text-center text-sm text-brand-grayMed">
          {!isPaymentComplete
            ? t("step8.pleaseCompletePayment")
            : t("step8.pleaseAcceptConsents")}
        </p>
      )}
    </div>
  );
}

function SummarySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-brand-grayLight p-4">
      <h4 className="mb-2 font-semibold text-brand-dark">{title}</h4>
      <div className="space-y-1 text-sm text-brand-grayMed">{children}</div>
    </div>
  );
}
