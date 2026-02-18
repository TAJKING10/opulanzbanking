"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Info, Upload, FileText, X } from "lucide-react";

interface ComplianceDeclarationsStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

interface Document {
  id: string;
  type: string;
  name: string;
  uploaded: boolean;
  required: boolean;
  file?: File;
}

export function ComplianceDeclarationsStep({
  data,
  onUpdate,
  onNext,
}: ComplianceDeclarationsStepProps) {
  const t = useTranslations("insurance.compliance");
  const [declarations, setDeclarations] = React.useState({
    healthDeclaration: data.healthDeclaration || false,
    accuracyDeclaration: data.accuracyDeclaration || false,
    taxComplianceDeclaration: data.taxComplianceDeclaration || false,
    amlDeclaration: data.amlDeclaration || false,
    dataProcessingConsent: data.dataProcessingConsent || false,
    termsAndConditions: data.termsAndConditions || false,
    electronicSignature: data.electronicSignature || false,
    marketingConsent: data.marketingConsent || false,
  });

  const [documents, setDocuments] = React.useState<Document[]>(
    data.complianceDocuments || [
      {
        id: "passport",
        type: t("docs.identityType"),
        name: t("docs.identityName"),
        uploaded: false,
        required: true,
      },
      {
        id: "proof-address",
        type: t("docs.addressType"),
        name: t("docs.addressName"),
        uploaded: false,
        required: true,
      },
      {
        id: "tax-residency",
        type: t("docs.taxType"),
        name: t("docs.taxName"),
        uploaded: false,
        required: false,
      },
      {
        id: "sof-docs",
        type: t("docs.sofType"),
        name: t("docs.sofName"),
        uploaded: false,
        required: true,
      },
    ]
  );

  const [uploadLater, setUploadLater] = React.useState(data.uploadLater || false);

  const updateDeclaration = (field: string, value: boolean) => {
    setDeclarations((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (docId: string, file: File | null) => {
    setDocuments(
      documents.map((doc) =>
        doc.id === docId
          ? { ...doc, uploaded: !!file, file: file || undefined }
          : doc
      )
    );
  };

  const removeDocument = (docId: string) => {
    setDocuments(
      documents.map((doc) =>
        doc.id === docId ? { ...doc, uploaded: false, file: undefined } : doc
      )
    );
  };

  const isFormValid = React.useMemo(() => {
    const requiredDeclarations =
      declarations.healthDeclaration &&
      declarations.accuracyDeclaration &&
      declarations.taxComplianceDeclaration &&
      declarations.amlDeclaration &&
      declarations.dataProcessingConsent &&
      declarations.termsAndConditions &&
      declarations.electronicSignature;

    const requiredDocs = documents.filter((doc) => doc.required);
    const allRequiredUploaded = requiredDocs.every((doc) => doc.uploaded);
    const documentsValid = allRequiredUploaded || uploadLater;

    return requiredDeclarations && documentsValid;
  }, [declarations, documents, uploadLater]);

  React.useEffect(() => {
    onUpdate({
      ...declarations,
      complianceDocuments: documents,
      uploadLater: uploadLater,
      isComplianceStepValid: isFormValid,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [declarations, documents, uploadLater, isFormValid]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-brand-dark">{t("title")}</h2>
        <p className="text-brand-grayMed">{t("subtitle")}</p>
      </div>

      {/* Required Documents */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-brand-dark">{t("requiredDocuments")}</h3>

        <div className="space-y-4">
          {documents.map((doc) => (
            <div key={doc.id} className="rounded-lg border border-brand-grayLight bg-gray-50 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-brand-gold" />
                    <h4 className="font-semibold text-brand-dark">
                      {doc.type}
                      {doc.required && <span className="ml-1 text-red-500">*</span>}
                    </h4>
                  </div>
                  <p className="mt-1 text-sm text-brand-grayMed">{doc.name}</p>

                  {doc.uploaded && doc.file && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                      <span className="font-medium">{t("uploaded")}:</span>
                      <span>{doc.file.name}</span>
                      <button type="button" onClick={() => removeDocument(doc.id)} className="text-red-600 hover:text-red-700">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {!doc.uploaded && (
                  <label className="cursor-pointer">
                    <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => { const file = e.target.files?.[0] || null; handleFileUpload(doc.id, file); }} />
                    <Button type="button" variant="outline" size="sm" className="pointer-events-none">
                      <Upload className="mr-2 h-4 w-4" />
                      {t("upload")}
                    </Button>
                  </label>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-start space-x-3 rounded-lg border border-brand-grayLight bg-white p-4">
          <Checkbox id="uploadLater" checked={uploadLater} onCheckedChange={(checked) => setUploadLater(checked as boolean)} />
          <div className="space-y-1">
            <Label htmlFor="uploadLater" className="cursor-pointer font-medium">{t("uploadLater")}</Label>
            <p className="text-sm text-brand-grayMed">{t("uploadLaterDesc")}</p>
          </div>
        </div>
      </div>

      {/* Declarations */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-brand-dark">{t("declarationsConsents")}</h3>

        <div className="space-y-4">
          {/* Health Declaration */}
          <div className="flex items-start space-x-3 rounded-lg border border-brand-grayLight bg-gray-50 p-4">
            <Checkbox id="healthDeclaration" checked={declarations.healthDeclaration} onCheckedChange={(checked) => updateDeclaration("healthDeclaration", checked as boolean)} />
            <div className="flex-1 space-y-1">
              <Label htmlFor="healthDeclaration" className="cursor-pointer font-medium">{t("health.label")}</Label>
              <p className="text-sm text-brand-grayMed">{t("health.text")}</p>
            </div>
          </div>

          {/* Accuracy Declaration */}
          <div className="flex items-start space-x-3 rounded-lg border border-brand-grayLight bg-gray-50 p-4">
            <Checkbox id="accuracyDeclaration" checked={declarations.accuracyDeclaration} onCheckedChange={(checked) => updateDeclaration("accuracyDeclaration", checked as boolean)} />
            <div className="flex-1 space-y-1">
              <Label htmlFor="accuracyDeclaration" className="cursor-pointer font-medium">{t("accuracy.label")}</Label>
              <p className="text-sm text-brand-grayMed">{t("accuracy.text")}</p>
            </div>
          </div>

          {/* Tax Compliance */}
          <div className="flex items-start space-x-3 rounded-lg border border-brand-grayLight bg-gray-50 p-4">
            <Checkbox id="taxComplianceDeclaration" checked={declarations.taxComplianceDeclaration} onCheckedChange={(checked) => updateDeclaration("taxComplianceDeclaration", checked as boolean)} />
            <div className="flex-1 space-y-1">
              <Label htmlFor="taxComplianceDeclaration" className="cursor-pointer font-medium">{t("taxCompliance.label")}</Label>
              <p className="text-sm text-brand-grayMed">{t("taxCompliance.text")}</p>
            </div>
          </div>

          {/* AML Declaration */}
          <div className="flex items-start space-x-3 rounded-lg border border-brand-grayLight bg-gray-50 p-4">
            <Checkbox id="amlDeclaration" checked={declarations.amlDeclaration} onCheckedChange={(checked) => updateDeclaration("amlDeclaration", checked as boolean)} />
            <div className="flex-1 space-y-1">
              <Label htmlFor="amlDeclaration" className="cursor-pointer font-medium">{t("aml.label")}</Label>
              <p className="text-sm text-brand-grayMed">{t("aml.text")}</p>
            </div>
          </div>

          {/* Data Processing Consent */}
          <div className="flex items-start space-x-3 rounded-lg border border-brand-grayLight bg-gray-50 p-4">
            <Checkbox id="dataProcessingConsent" checked={declarations.dataProcessingConsent} onCheckedChange={(checked) => updateDeclaration("dataProcessingConsent", checked as boolean)} />
            <div className="flex-1 space-y-1">
              <Label htmlFor="dataProcessingConsent" className="cursor-pointer font-medium">{t("dataProcessing.label")}</Label>
              <p className="text-sm text-brand-grayMed">{t("dataProcessing.text")}</p>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start space-x-3 rounded-lg border border-brand-grayLight bg-gray-50 p-4">
            <Checkbox id="termsAndConditions" checked={declarations.termsAndConditions} onCheckedChange={(checked) => updateDeclaration("termsAndConditions", checked as boolean)} />
            <div className="flex-1 space-y-1">
              <Label htmlFor="termsAndConditions" className="cursor-pointer font-medium">{t("terms.label")}</Label>
              <p className="text-sm text-brand-grayMed">
                {t("terms.textBefore")}{" "}
                <a href="#" className="text-brand-gold hover:underline">{t("terms.link")}</a>
                {t("terms.textAfter")}
              </p>
            </div>
          </div>

          {/* Electronic Signature */}
          <div className="flex items-start space-x-3 rounded-lg border border-brand-grayLight bg-gray-50 p-4">
            <Checkbox id="electronicSignature" checked={declarations.electronicSignature} onCheckedChange={(checked) => updateDeclaration("electronicSignature", checked as boolean)} />
            <div className="flex-1 space-y-1">
              <Label htmlFor="electronicSignature" className="cursor-pointer font-medium">{t("eSignature.label")}</Label>
              <p className="text-sm text-brand-grayMed">{t("eSignature.text")}</p>
            </div>
          </div>

          {/* Marketing Consent (Optional) */}
          <div className="flex items-start space-x-3 rounded-lg border border-brand-grayLight bg-white p-4">
            <Checkbox id="marketingConsent" checked={declarations.marketingConsent} onCheckedChange={(checked) => updateDeclaration("marketingConsent", checked as boolean)} />
            <div className="flex-1 space-y-1">
              <Label htmlFor="marketingConsent" className="cursor-pointer font-medium">{t("marketing.label")}</Label>
              <p className="text-sm text-brand-grayMed">{t("marketing.text")}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-5 w-5 text-blue-600" />
            <div className="space-y-1 text-sm text-blue-800">
              <p className="font-semibold">{t("regulatoryTitle")}</p>
              <p>{t("regulatoryText")}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-5 w-5 text-amber-600" />
            <div className="space-y-1 text-sm text-amber-800">
              <p className="font-semibold">{t("coolingOffTitle")}</p>
              <p>{t("coolingOffText")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
