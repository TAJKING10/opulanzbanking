"use client";

import * as React from "react";
import { v4 as uuidv4 } from "uuid";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Upload,
  CheckCircle,
  X,
  FileText,
  AlertCircle,
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

type StepProps = {
  dossier: Partial<CompanyFormationDossier>;
  updateDossier: (updates: Partial<CompanyFormationDossier>) => void;
};

// Step 5: Activity & Scale
export function Step5Activity({ dossier, updateDossier }: StepProps) {
  const t = useTranslations("companyFormation.wizard.step5");

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
          {t("naceCode")} <span className="text-red-500">*</span>
        </Label>
        <Input
          id="naceCode"
          value={naceCode}
          onChange={(e) => setNaceCode(e.target.value)}
          placeholder={t("naceCodePlaceholder")}
        />
        <p className="text-xs text-brand-grayMed">
          {t("naceCodeHelp")}{" "}
          <a
            href="https://nacev2.com/en"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-gold hover:underline"
          >
            {t("findNaceCode")}
          </a>
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="expectedTurnover">
          {t("expectedTurnover")} <span className="text-red-500">*</span>
        </Label>
        <Input
          id="expectedTurnover"
          type="number"
          min="0"
          value={expectedTurnover}
          onChange={(e) => setExpectedTurnover(parseFloat(e.target.value) || 0)}
          placeholder={t("expectedTurnoverPlaceholder")}
        />
        <p className="text-xs text-brand-grayMed">
          {t("expectedTurnoverHelp")}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="numberOfEmployees">
          {t("numberOfEmployees")}
        </Label>
        <Input
          id="numberOfEmployees"
          type="number"
          min="0"
          value={numberOfEmployees}
          onChange={(e) => setNumberOfEmployees(parseInt(e.target.value) || 0)}
          placeholder={t("numberOfEmployeesPlaceholder")}
        />
        <p className="text-xs text-brand-grayMed">
          {t("numberOfEmployeesHelp")}
        </p>
      </div>

      <div className="rounded-xl bg-blue-50 p-4">
        <h4 className="mb-2 font-semibold text-blue-900">{t("whyWeAsk")}</h4>
        <p className="text-sm text-blue-800">
          {t("whyWeAskDesc")}
        </p>
      </div>
    </div>
  );
}

// Step 6: Notary & Domiciliation
export function Step6NotaryDomiciliation({ dossier, updateDossier }: StepProps) {
  const t = useTranslations("companyFormation.wizard.step6");

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
        <h3 className="mb-4 text-lg font-bold text-brand-dark">{t("notaryPreferences")}</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notaryName">{t("notaryName")}</Label>
            <Input
              id="notaryName"
              value={notaryName}
              onChange={(e) => setNotaryName(e.target.value)}
              placeholder={t("notaryNamePlaceholder")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notaryCity">{t("notaryCity")}</Label>
            <Input
              id="notaryCity"
              value={notaryCity}
              onChange={(e) => setNotaryCity(e.target.value)}
              placeholder={t("notaryCityPlaceholder")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notaryLanguage">{t("notaryLanguage")}</Label>
            <select
              id="notaryLanguage"
              className="flex h-11 w-full rounded-xl border border-brand-grayLight bg-white px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
              value={notaryLanguage}
              onChange={(e) => setNotaryLanguage(e.target.value as "FR" | "EN" | "DE")}
            >
              <option value="EN">{t("english")}</option>
              <option value="FR">{t("french")}</option>
              <option value="DE">{t("german")}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="border-t border-brand-grayLight pt-6">
        <h3 className="mb-4 text-lg font-bold text-brand-dark">{t("registeredOffice")}</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="domiciliationNeeded"
              checked={domiciliationNeeded}
              onCheckedChange={(checked) => setDomiciliationNeeded(checked as boolean)}
            />
            <div>
              <Label htmlFor="domiciliationNeeded" className="cursor-pointer font-semibold">
                {t("needDomiciliation")}
              </Label>
              <p className="mt-1 text-sm text-brand-grayMed">
                {t("needDomiciliationDesc")}
              </p>
            </div>
          </div>

          {domiciliationNeeded && (
            <div className="rounded-xl bg-brand-goldLight/20 p-4">
              <h4 className="mb-2 font-semibold text-brand-dark">{t("domiciliationService")}</h4>
              <p className="text-sm text-brand-grayMed mb-2">
                {t("domiciliationIncludes")}
              </p>
              <ul className="text-sm text-brand-dark space-y-1">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-brand-gold flex-shrink-0 mt-0.5" />
                  <span>{t("domiciliationItem1")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-brand-gold flex-shrink-0 mt-0.5" />
                  <span>{t("domiciliationItem2")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-brand-gold flex-shrink-0 mt-0.5" />
                  <span>{t("domiciliationItem3")}</span>
                </li>
              </ul>
              <p className="mt-3 text-sm font-semibold text-brand-dark">
                {t("domiciliationPrice")}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl bg-blue-50 p-4">
        <p className="text-sm text-blue-900">
          <strong>Note:</strong> {t("noDomiciliationNote")}
        </p>
      </div>
    </div>
  );
}

// Step 7: Documents
export function Step7Documents({ dossier, updateDossier }: StepProps) {
  const t = useTranslations("companyFormation.wizard.step7");

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

    // Reset input
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
          {t("idDocuments")} <span className="text-red-500">*</span>
        </h3>
        <p className="mb-4 text-sm text-brand-grayMed">
          {t("idDocumentsDesc")}
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
              <p className="text-sm font-semibold text-brand-dark">{t("uploadIdPassport")}</p>
              <p className="text-xs text-brand-grayMed">{t("fileFormats")}</p>
            </div>
          </label>
        </div>
      </div>

      {/* Lease/Domiciliation Proof */}
      {!dossier.domiciliationNeeded && (
        <div>
          <h3 className="mb-2 text-lg font-bold text-brand-dark">
            {t("leaseTitle")} <span className="text-red-500">*</span>
          </h3>
          <p className="mb-4 text-sm text-brand-grayMed">
            {t("leaseDesc")}
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
                <p className="text-sm font-semibold text-brand-dark">{t("uploadLease")}</p>
                <p className="text-xs text-brand-grayMed">{t("leasePdfOnly")}</p>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Capital Certificate */}
      <div>
        <h3 className="mb-2 text-lg font-bold text-brand-dark">
          {t("capitalCertTitle")}
        </h3>
        <p className="mb-4 text-sm text-brand-grayMed">
          {t("capitalCertDesc")}
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
                <p className="text-sm font-semibold text-brand-dark">{t("uploadCertificate")}</p>
                <p className="text-xs text-brand-grayMed">{t("certPdfOnly")}</p>
              </div>
            </label>
          )}
        </div>
      </div>

      <div className="rounded-xl bg-yellow-50 p-4">
        <p className="text-sm text-yellow-900">
          <AlertCircle className="inline h-4 w-4 mr-1" />
          <strong>Note:</strong> {t("simulationNote")}
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
  const t = useTranslations("companyFormation.wizard.step8");
  const params = useParams();
  const locale = params.locale as string;

  const [termsAccepted, setTermsAccepted] = React.useState(dossier.consents?.termsAccepted || false);
  const [privacyAccepted, setPrivacyAccepted] = React.useState(dossier.consents?.privacyAccepted || false);
  const [accuracyConfirmed, setAccuracyConfirmed] = React.useState(dossier.consents?.accuracyConfirmed || false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [isPaymentComplete, setIsPaymentComplete] = React.useState(dossier.paymentStatus === "PAID");
  const [isProcessing, setIsProcessing] = React.useState(false);

  const setupFee = 1500; // Demo amount

  React.useEffect(() => {
    updateDossier({
      consents: { termsAccepted, privacyAccepted, accuracyConfirmed },
      setupFeeAmount: setupFee,
    });
  }, [termsAccepted, privacyAccepted, accuracyConfirmed]);

  const handlePayment = async () => {
    setIsProcessing(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setIsPaymentComplete(true);
    updateDossier({ paymentStatus: "PAID" });
  };

  const handleSubmit = async () => {
    if (!termsAccepted || !privacyAccepted || !accuracyConfirmed) {
      alert(t("acceptAllConsents"));
      return;
    }

    setIsProcessing(true);

    try {
      // Build final payload
      const finalDossier: CompanyFormationDossier = dossier as CompanyFormationDossier;
      finalDossier.updatedAt = new Date().toISOString();

      // Save to backend database
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

      const response = await fetch("http://localhost:5000/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(applicationPayload),
      });

      if (!response.ok) {
        throw new Error("Failed to submit application");
      }

      const result = await response.json();
      console.log("Company Formation Dossier saved to backend:", result);

      // Save to localStorage (backup)
      const existingDossiers = localStorage.getItem("opulanz_company_formations");
      const dossiers = existingDossiers ? JSON.parse(existingDossiers) : [];
      dossiers.push(finalDossier);
      localStorage.setItem("opulanz_company_formations", JSON.stringify(dossiers));

      setIsSubmitted(true);
    } catch (error) {
      console.error("Error submitting company formation:", error);
      alert(
        "Failed to submit company formation. Please try again or contact support."
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
          {t("submitted.title")}
        </h3>
        <p className="text-brand-grayMed max-w-2xl mx-auto">
          {t("submitted.description")}
        </p>
        <div className="rounded-xl bg-brand-goldLight/20 p-6 max-w-md mx-auto">
          <p className="text-sm text-brand-dark">
            <strong>{t("submitted.reference")}</strong> {dossier.userRef}
          </p>
          <p className="text-xs text-brand-grayMed mt-2">
            {t("submitted.emailConfirmation")}
          </p>
        </div>
        <Button onClick={() => window.location.href = "/"}>
          {t("submitted.returnHome")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary */}
      <div>
        <h3 className="mb-4 text-lg font-bold text-brand-dark">{t("dossierSummary")}</h3>
        <div className="space-y-4">
          <SummarySection title={t("companyType")}>
            <p>{dossier.formType}</p>
          </SummarySection>

          <SummarySection title={t("companyName")}>
            <p>{dossier.proposedNames?.[0] || t("notProvided")}</p>
            {dossier.proposedNames?.[1] && (
              <p className="text-sm text-brand-grayMed">{t("alternate", { name: dossier.proposedNames[1] })}</p>
            )}
          </SummarySection>

          <SummarySection title={t("capital")}>
            <p>{"\u20AC"}{dossier.capitalAmount?.toLocaleString() || 0} EUR</p>
          </SummarySection>

          <SummarySection title={t("people")}>
            <p>{t("shareholdersCount", { count: dossier.shareholders?.length || 0 })}</p>
            {dossier.directors && dossier.directors.length > 0 && (
              <p>{t("directorsCount", { count: dossier.directors.length })}</p>
            )}
            {dossier.managers && dossier.managers.length > 0 && (
              <p>{t("managersCount", { count: dossier.managers.length })}</p>
            )}
            <p>{t("ubosCount", { count: dossier.ubos?.length || 0 })}</p>
          </SummarySection>

          <SummarySection title={t("activity")}>
            <p>{t("nace", { code: dossier.naceCode || t("notProvided") })}</p>
            <p>{t("expectedTurnover", { amount: `\u20AC${dossier.expectedTurnover?.toLocaleString() || 0}` })}</p>
          </SummarySection>

          <SummarySection title={t("documents")}>
            <p>{t("idDocuments", { count: dossier.uploads?.ids?.length || 0 })}</p>
            <p>{t("leaseDomiciliation", { value: dossier.domiciliationNeeded ? t("serviceRequested") : `${dossier.uploads?.leaseOrDomiciliation?.length || 0} ${t("uploaded")}` })}</p>
            <p>{t("capitalCertificate", { value: dossier.uploads?.capitalCertificate ? t("uploadedStatus") : t("notYet") })}</p>
          </SummarySection>
        </div>
      </div>

      {/* Payment */}
      {!isPaymentComplete && (
        <div className="rounded-xl border-2 border-brand-gold p-6">
          <h3 className="mb-4 text-lg font-bold text-brand-dark">{t("setupFeePayment")}</h3>
          <div className="mb-4 flex items-center justify-between rounded-xl bg-brand-goldLight/20 p-4">
            <span className="font-semibold text-brand-dark">{t("opulanzSetupFee")}</span>
            <span className="text-2xl font-bold text-brand-gold">{"\u20AC"}{setupFee}</span>
          </div>
          <p className="mb-4 text-sm text-brand-grayMed">
            {t("feeDescription")}
          </p>
          <Button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>{t("processing")}</>
            ) : (
              <>
                <CreditCard className="mr-2 h-5 w-5" />
                {t("paySetupFee")}
              </>
            )}
          </Button>
        </div>
      )}

      {isPaymentComplete && (
        <div className="rounded-xl bg-green-50 p-4">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle className="h-5 w-5" />
            <span className="font-semibold">{t("paymentComplete")}</span>
          </div>
        </div>
      )}

      {/* Consents */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-brand-dark">{t("requiredConsents")}</h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="accuracyConfirmed"
              checked={accuracyConfirmed}
              onCheckedChange={(checked) => setAccuracyConfirmed(checked as boolean)}
            />
            <Label htmlFor="accuracyConfirmed" className="cursor-pointer leading-relaxed">
              {t("accuracyConfirm")}
            </Label>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="termsAccepted"
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
            />
            <Label htmlFor="termsAccepted" className="cursor-pointer leading-relaxed">
              {t("acceptTerms")}{" "}
              <Link href={`/${locale}/legal/terms`} className="text-brand-gold hover:underline">
                {t("termsConditions")}
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
              {t("acceptPrivacy")}{" "}
              <Link href={`/${locale}/legal/privacy`} className="text-brand-gold hover:underline">
                {t("privacyPolicy")}
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
        {t("submitDossier")}
      </Button>

      {(!termsAccepted || !privacyAccepted || !accuracyConfirmed || !isPaymentComplete) && (
        <p className="text-center text-sm text-brand-grayMed">
          {!isPaymentComplete
            ? t("completePaymentFirst")
            : t("acceptAllConsents")}
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
