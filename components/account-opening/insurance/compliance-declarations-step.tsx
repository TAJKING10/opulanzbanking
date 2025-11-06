"use client";

import * as React from "react";
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
        type: "Identity Document",
        name: "Passport or National ID",
        uploaded: false,
        required: true,
      },
      {
        id: "proof-address",
        type: "Proof of Address",
        name: "Utility bill or bank statement (less than 3 months old)",
        uploaded: false,
        required: true,
      },
      {
        id: "tax-residency",
        type: "Tax Residency",
        name: "Tax residency certificate (if non-LU resident)",
        uploaded: false,
        required: false,
      },
      {
        id: "sof-docs",
        type: "Source of Funds",
        name: "Bank statements, payslips, or other evidence",
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

  // Validation
  const isFormValid = React.useMemo(() => {
    // All required declarations must be checked
    const requiredDeclarations =
      declarations.healthDeclaration &&
      declarations.accuracyDeclaration &&
      declarations.taxComplianceDeclaration &&
      declarations.amlDeclaration &&
      declarations.dataProcessingConsent &&
      declarations.termsAndConditions &&
      declarations.electronicSignature;

    // Either all required documents uploaded OR upload later selected
    const requiredDocs = documents.filter((doc) => doc.required);
    const allRequiredUploaded = requiredDocs.every((doc) => doc.uploaded);
    const documentsValid = allRequiredUploaded || uploadLater;

    return requiredDeclarations && documentsValid;
  }, [declarations, documents, uploadLater]);

  // Update parent with validation status
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
        <h2 className="mb-2 text-2xl font-bold text-brand-dark">
          Compliance & Declarations
        </h2>
        <p className="text-brand-grayMed">
          Please review and confirm the following declarations and upload required documents.
        </p>
      </div>

      {/* Required Documents */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-brand-dark">Required Documents</h3>

        <div className="space-y-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="rounded-lg border border-brand-grayLight bg-gray-50 p-4"
            >
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
                      <span className="font-medium">Uploaded:</span>
                      <span>{doc.file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeDocument(doc.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {!doc.uploaded && (
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        handleFileUpload(doc.id, file);
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="pointer-events-none"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload
                    </Button>
                  </label>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-start space-x-3 rounded-lg border border-brand-grayLight bg-white p-4">
          <Checkbox
            id="uploadLater"
            checked={uploadLater}
            onCheckedChange={(checked) => setUploadLater(checked as boolean)}
          />
          <div className="space-y-1">
            <Label htmlFor="uploadLater" className="cursor-pointer font-medium">
              I will upload documents later
            </Label>
            <p className="text-sm text-brand-grayMed">
              You can proceed with your application and upload documents via email or secure
              portal. Your application will remain pending until all documents are received.
            </p>
          </div>
        </div>
      </div>

      {/* Declarations */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-brand-dark">Declarations & Consents</h3>

        <div className="space-y-4">
          {/* Health Declaration */}
          <div className="flex items-start space-x-3 rounded-lg border border-brand-grayLight bg-gray-50 p-4">
            <Checkbox
              id="healthDeclaration"
              checked={declarations.healthDeclaration}
              onCheckedChange={(checked) =>
                updateDeclaration("healthDeclaration", checked as boolean)
              }
            />
            <div className="flex-1 space-y-1">
              <Label
                htmlFor="healthDeclaration"
                className="cursor-pointer font-medium"
              >
                Health Declaration *
              </Label>
              <p className="text-sm text-brand-grayMed">
                I declare that I am in good health and have no knowledge of any medical condition
                that may affect my life expectancy. I understand that false declarations may void
                the policy.
              </p>
            </div>
          </div>

          {/* Accuracy Declaration */}
          <div className="flex items-start space-x-3 rounded-lg border border-brand-grayLight bg-gray-50 p-4">
            <Checkbox
              id="accuracyDeclaration"
              checked={declarations.accuracyDeclaration}
              onCheckedChange={(checked) =>
                updateDeclaration("accuracyDeclaration", checked as boolean)
              }
            />
            <div className="flex-1 space-y-1">
              <Label
                htmlFor="accuracyDeclaration"
                className="cursor-pointer font-medium"
              >
                Accuracy of Information *
              </Label>
              <p className="text-sm text-brand-grayMed">
                I declare that all information provided in this application is true, complete, and
                accurate to the best of my knowledge. I will notify the insurer of any changes to
                this information.
              </p>
            </div>
          </div>

          {/* Tax Compliance */}
          <div className="flex items-start space-x-3 rounded-lg border border-brand-grayLight bg-gray-50 p-4">
            <Checkbox
              id="taxComplianceDeclaration"
              checked={declarations.taxComplianceDeclaration}
              onCheckedChange={(checked) =>
                updateDeclaration("taxComplianceDeclaration", checked as boolean)
              }
            />
            <div className="flex-1 space-y-1">
              <Label
                htmlFor="taxComplianceDeclaration"
                className="cursor-pointer font-medium"
              >
                Tax Compliance *
              </Label>
              <p className="text-sm text-brand-grayMed">
                I confirm that I am in compliance with all applicable tax laws and regulations in
                my country(ies) of tax residence. I understand my obligation to report this policy
                to relevant tax authorities as required.
              </p>
            </div>
          </div>

          {/* AML Declaration */}
          <div className="flex items-start space-x-3 rounded-lg border border-brand-grayLight bg-gray-50 p-4">
            <Checkbox
              id="amlDeclaration"
              checked={declarations.amlDeclaration}
              onCheckedChange={(checked) =>
                updateDeclaration("amlDeclaration", checked as boolean)
              }
            />
            <div className="flex-1 space-y-1">
              <Label htmlFor="amlDeclaration" className="cursor-pointer font-medium">
                Anti-Money Laundering Declaration *
              </Label>
              <p className="text-sm text-brand-grayMed">
                I declare that the funds used for premium payments are from legitimate sources and
                are not proceeds from illegal activities. I understand that the insurer may
                conduct ongoing monitoring for AML/CFT purposes.
              </p>
            </div>
          </div>

          {/* Data Processing Consent */}
          <div className="flex items-start space-x-3 rounded-lg border border-brand-grayLight bg-gray-50 p-4">
            <Checkbox
              id="dataProcessingConsent"
              checked={declarations.dataProcessingConsent}
              onCheckedChange={(checked) =>
                updateDeclaration("dataProcessingConsent", checked as boolean)
              }
            />
            <div className="flex-1 space-y-1">
              <Label
                htmlFor="dataProcessingConsent"
                className="cursor-pointer font-medium"
              >
                Data Processing Consent *
              </Label>
              <p className="text-sm text-brand-grayMed">
                I consent to the processing of my personal data by Opulanz Life Luxembourg S.A.
                and its service providers for the purpose of administering this insurance policy,
                in accordance with GDPR and Luxembourg data protection laws.
              </p>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start space-x-3 rounded-lg border border-brand-grayLight bg-gray-50 p-4">
            <Checkbox
              id="termsAndConditions"
              checked={declarations.termsAndConditions}
              onCheckedChange={(checked) =>
                updateDeclaration("termsAndConditions", checked as boolean)
              }
            />
            <div className="flex-1 space-y-1">
              <Label
                htmlFor="termsAndConditions"
                className="cursor-pointer font-medium"
              >
                Terms and Conditions *
              </Label>
              <p className="text-sm text-brand-grayMed">
                I have read, understood, and agree to the{" "}
                <a href="#" className="text-brand-gold hover:underline">
                  Policy Terms and Conditions
                </a>
                , including all fees, charges, and investment risks.
              </p>
            </div>
          </div>

          {/* Electronic Signature */}
          <div className="flex items-start space-x-3 rounded-lg border border-brand-grayLight bg-gray-50 p-4">
            <Checkbox
              id="electronicSignature"
              checked={declarations.electronicSignature}
              onCheckedChange={(checked) =>
                updateDeclaration("electronicSignature", checked as boolean)
              }
            />
            <div className="flex-1 space-y-1">
              <Label
                htmlFor="electronicSignature"
                className="cursor-pointer font-medium"
              >
                Electronic Signature Consent *
              </Label>
              <p className="text-sm text-brand-grayMed">
                I agree that my electronic submission of this application constitutes my legal
                signature and has the same binding effect as a handwritten signature.
              </p>
            </div>
          </div>

          {/* Marketing Consent (Optional) */}
          <div className="flex items-start space-x-3 rounded-lg border border-brand-grayLight bg-white p-4">
            <Checkbox
              id="marketingConsent"
              checked={declarations.marketingConsent}
              onCheckedChange={(checked) =>
                updateDeclaration("marketingConsent", checked as boolean)
              }
            />
            <div className="flex-1 space-y-1">
              <Label htmlFor="marketingConsent" className="cursor-pointer font-medium">
                Marketing Communications (Optional)
              </Label>
              <p className="text-sm text-brand-grayMed">
                I consent to receive marketing communications about products and services that may
                be of interest to me. You can unsubscribe at any time.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-5 w-5 text-blue-600" />
            <div className="space-y-1 text-sm text-blue-800">
              <p className="font-semibold">Regulatory Compliance</p>
              <p>
                This application is subject to Luxembourg insurance regulations and EU directives
                including Solvency II, IDD (Insurance Distribution Directive), and GDPR. All
                declarations are legally binding.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-5 w-5 text-amber-600" />
            <div className="space-y-1 text-sm text-amber-800">
              <p className="font-semibold">Cooling-off Period</p>
              <p>
                Luxembourg law provides a 30-day cooling-off period from policy issuance. You may
                cancel the policy within this period and receive a full refund of premiums paid,
                subject to market value adjustments for unit-linked policies.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
