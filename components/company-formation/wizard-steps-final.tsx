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
          NACE Code <span className="text-red-500">*</span>
        </Label>
        <Input
          id="naceCode"
          value={naceCode}
          onChange={(e) => setNaceCode(e.target.value)}
          placeholder="e.g., 62.01 - Computer programming activities"
        />
        <p className="text-xs text-brand-grayMed">
          Statistical classification of economic activities in the EU.{" "}
          <a
            href="https://nacev2.com/en"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-gold hover:underline"
          >
            Find your NACE code
          </a>
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="expectedTurnover">
          Expected Annual Turnover (EUR) <span className="text-red-500">*</span>
        </Label>
        <Input
          id="expectedTurnover"
          type="number"
          min="0"
          value={expectedTurnover}
          onChange={(e) => setExpectedTurnover(parseFloat(e.target.value) || 0)}
          placeholder="e.g., 500000"
        />
        <p className="text-xs text-brand-grayMed">
          Estimated annual revenue for the first year
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="numberOfEmployees">
          Number of Employees at Launch
        </Label>
        <Input
          id="numberOfEmployees"
          type="number"
          min="0"
          value={numberOfEmployees}
          onChange={(e) => setNumberOfEmployees(parseInt(e.target.value) || 0)}
          placeholder="e.g., 5"
        />
        <p className="text-xs text-brand-grayMed">
          Expected number of employees when starting operations
        </p>
      </div>

      <div className="rounded-xl bg-blue-50 p-4">
        <h4 className="mb-2 font-semibold text-blue-900">Why we ask</h4>
        <p className="text-sm text-blue-800">
          This information helps us prepare accurate documentation and advise you on applicable
          regulations, tax obligations, and reporting requirements.
        </p>
      </div>
    </div>
  );
}

// Step 6: Notary & Domiciliation
export function Step6NotaryDomiciliation({ dossier, updateDossier }: StepProps) {
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
        <h3 className="mb-4 text-lg font-bold text-brand-dark">Notary Preferences</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notaryName">Preferred Notary Name (Optional)</Label>
            <Input
              id="notaryName"
              value={notaryName}
              onChange={(e) => setNotaryName(e.target.value)}
              placeholder="Leave blank to let us choose"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notaryCity">Preferred City (Optional)</Label>
            <Input
              id="notaryCity"
              value={notaryCity}
              onChange={(e) => setNotaryCity(e.target.value)}
              placeholder="e.g., Luxembourg City"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notaryLanguage">Language for Incorporation Deeds</Label>
            <select
              id="notaryLanguage"
              className="flex h-11 w-full rounded-xl border border-brand-grayLight bg-white px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
              value={notaryLanguage}
              onChange={(e) => setNotaryLanguage(e.target.value as "FR" | "EN" | "DE")}
            >
              <option value="EN">English</option>
              <option value="FR">French</option>
              <option value="DE">German</option>
            </select>
          </div>
        </div>
      </div>

      <div className="border-t border-brand-grayLight pt-6">
        <h3 className="mb-4 text-lg font-bold text-brand-dark">Registered Office / Domiciliation</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="domiciliationNeeded"
              checked={domiciliationNeeded}
              onCheckedChange={(checked) => setDomiciliationNeeded(checked as boolean)}
            />
            <div>
              <Label htmlFor="domiciliationNeeded" className="cursor-pointer font-semibold">
                I need a domiciliation / registered address service
              </Label>
              <p className="mt-1 text-sm text-brand-grayMed">
                We can provide you with a professional business address in Luxembourg for your registered office.
              </p>
            </div>
          </div>

          {domiciliationNeeded && (
            <div className="rounded-xl bg-brand-goldLight/20 p-4">
              <h4 className="mb-2 font-semibold text-brand-dark">Domiciliation Service</h4>
              <p className="text-sm text-brand-grayMed mb-2">
                Our domiciliation service includes:
              </p>
              <ul className="text-sm text-brand-dark space-y-1">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-brand-gold flex-shrink-0 mt-0.5" />
                  <span>Professional business address in Luxembourg</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-brand-gold flex-shrink-0 mt-0.5" />
                  <span>Mail forwarding and scanning</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-brand-gold flex-shrink-0 mt-0.5" />
                  <span>Meeting room access</span>
                </li>
              </ul>
              <p className="mt-3 text-sm font-semibold text-brand-dark">
                From €600/year
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl bg-blue-50 p-4">
        <p className="text-sm text-blue-900">
          <strong>Note:</strong> If you don't select domiciliation service, you must provide proof
          of a registered address (lease agreement or property title) in the next step.
        </p>
      </div>
    </div>
  );
}

// Step 7: Documents
export function Step7Documents({ dossier, updateDossier }: StepProps) {
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
          ID/Passport Copies <span className="text-red-500">*</span>
        </h3>
        <p className="mb-4 text-sm text-brand-grayMed">
          Upload ID or passport copies for all directors, managers, and UBOs
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
              <p className="text-sm font-semibold text-brand-dark">Click to upload ID/Passport</p>
              <p className="text-xs text-brand-grayMed">PDF, JPG, or PNG • Max 10MB</p>
            </div>
          </label>
        </div>
      </div>

      {/* Lease/Domiciliation Proof */}
      {!dossier.domiciliationNeeded && (
        <div>
          <h3 className="mb-2 text-lg font-bold text-brand-dark">
            Lease Agreement / Property Title <span className="text-red-500">*</span>
          </h3>
          <p className="mb-4 text-sm text-brand-grayMed">
            Proof of registered office address in Luxembourg
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
                <p className="text-sm font-semibold text-brand-dark">Click to upload Lease/Title</p>
                <p className="text-xs text-brand-grayMed">PDF • Max 10MB</p>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Capital Certificate */}
      <div>
        <h3 className="mb-2 text-lg font-bold text-brand-dark">
          Capital Deposit Certificate (Optional)
        </h3>
        <p className="mb-4 text-sm text-brand-grayMed">
          Can be uploaded after payment. Bank certificate confirming capital deposit.
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
                <p className="text-sm font-semibold text-brand-dark">Click to upload Certificate</p>
                <p className="text-xs text-brand-grayMed">PDF • Max 10MB</p>
              </div>
            </label>
          )}
        </div>
      </div>

      <div className="rounded-xl bg-yellow-50 p-4">
        <p className="text-sm text-yellow-900">
          <AlertCircle className="inline h-4 w-4 mr-1" />
          <strong>Note:</strong> This is a simulation. In production, files would be uploaded to secure cloud storage.
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
  const [termsAccepted, setTermsAccepted] = React.useState(dossier.consents?.termsAccepted || false);
  const [privacyAccepted, setPrivacyAccepted] = React.useState(dossier.consents?.privacyAccepted || false);
  const [accuracyConfirmed, setAccuracyConfirmed] = React.useState(dossier.consents?.accuracyConfirmed || false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [isPaymentComplete, setIsPaymentComplete] = React.useState(dossier.paymentStatus === "PAID");
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isPayPalLoaded, setIsPayPalLoaded] = React.useState(false);
  const [paypalOrderId, setPaypalOrderId] = React.useState("");

  const setupFee = 1500; // €1500 setup fee

  React.useEffect(() => {
    updateDossier({
      consents: { termsAccepted, privacyAccepted, accuracyConfirmed },
      setupFeeAmount: setupFee,
    });
  }, [termsAccepted, privacyAccepted, accuracyConfirmed]);

  // Initialize PayPal buttons when payment section is shown
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

      // Save to localStorage (backup)
      const existingDossiers = localStorage.getItem("opulanz_company_formations");
      const dossiers = existingDossiers ? JSON.parse(existingDossiers) : [];
      dossiers.push(finalDossier);
      localStorage.setItem("opulanz_company_formations", JSON.stringify(dossiers));

      // Log to console
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
          Formation Dossier Submitted!
        </h3>
        <p className="text-brand-grayMed max-w-2xl mx-auto">
          Your company formation dossier has been created. Our team will review it and contact you within 24–72 hours
          to proceed with the notarization and registration process.
        </p>
        <div className="rounded-xl bg-brand-goldLight/20 p-6 max-w-md mx-auto">
          <p className="text-sm text-brand-dark">
            <strong>Reference:</strong> {dossier.userRef}
          </p>
          <p className="text-xs text-brand-grayMed mt-2">
            You'll receive an email confirmation shortly.
          </p>
        </div>
        <Button onClick={() => window.location.href = "/"}>
          Return to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary */}
      <div>
        <h3 className="mb-4 text-lg font-bold text-brand-dark">Dossier Summary</h3>
        <div className="space-y-4">
          <SummarySection title="Company Type">
            <p>{dossier.formType}</p>
          </SummarySection>

          <SummarySection title="Company Name">
            <p>{dossier.proposedNames?.[0] || "Not provided"}</p>
            {dossier.proposedNames?.[1] && (
              <p className="text-sm text-brand-grayMed">Alternate: {dossier.proposedNames[1]}</p>
            )}
          </SummarySection>

          <SummarySection title="Capital">
            <p>€{dossier.capitalAmount?.toLocaleString() || 0} EUR</p>
          </SummarySection>

          <SummarySection title="People">
            <p>Shareholders: {dossier.shareholders?.length || 0}</p>
            {dossier.directors && dossier.directors.length > 0 && (
              <p>Directors: {dossier.directors.length}</p>
            )}
            {dossier.managers && dossier.managers.length > 0 && (
              <p>Managers: {dossier.managers.length}</p>
            )}
            <p>UBOs: {dossier.ubos?.length || 0}</p>
          </SummarySection>

          <SummarySection title="Activity">
            <p>NACE: {dossier.naceCode || "Not provided"}</p>
            <p>Expected turnover: €{dossier.expectedTurnover?.toLocaleString() || 0}</p>
          </SummarySection>

          <SummarySection title="Documents">
            <p>ID documents: {dossier.uploads?.ids?.length || 0}</p>
            <p>Lease/Domiciliation: {dossier.domiciliationNeeded ? "Service requested" : `${dossier.uploads?.leaseOrDomiciliation?.length || 0} uploaded`}</p>
            <p>Capital certificate: {dossier.uploads?.capitalCertificate ? "Uploaded" : "Not yet"}</p>
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
            <h3 className="mb-4 text-lg font-bold text-brand-dark">Setup Fee Payment</h3>
            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900">
                <strong>Secure Payment:</strong> Your payment is processed securely through PayPal.
                You don't need a PayPal account - you can pay with credit/debit card.
              </p>
            </div>
            <div className="mb-4 flex items-center justify-between rounded-xl bg-brand-goldLight/20 p-4">
              <span className="font-semibold text-brand-dark">Opulanz Setup Fee</span>
              <span className="text-2xl font-bold text-brand-gold">€{setupFee.toFixed(2)}</span>
            </div>
            <p className="mb-6 text-sm text-brand-grayMed">
              This covers our administrative and coordination services. Notary and registration fees are separate and will be communicated by the notary.
            </p>

            <div id="paypal-button-container" className="mb-4"></div>

            {!isPayPalLoaded && (
              <div className="text-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-gold border-r-transparent"></div>
                <p className="mt-4 text-brand-grayMed">Loading payment options...</p>
              </div>
            )}
          </div>
        </>
      )}

      {isPaymentComplete && (
        <div className="rounded-xl bg-green-50 p-4 border border-green-200">
          <div className="flex items-center gap-2 text-green-700 mb-2">
            <CheckCircle className="h-5 w-5" />
            <span className="font-semibold">Payment Complete</span>
          </div>
          {paypalOrderId && (
            <p className="text-sm text-green-800">
              PayPal Order ID: <span className="font-mono font-semibold">{paypalOrderId}</span>
            </p>
          )}
          <p className="text-sm text-green-800 mt-1">
            Setup fee of €{setupFee.toFixed(2)} has been paid successfully.
          </p>
        </div>
      )}

      {/* Consents */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-brand-dark">Required Consents</h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="accuracyConfirmed"
              checked={accuracyConfirmed}
              onCheckedChange={(checked) => setAccuracyConfirmed(checked as boolean)}
            />
            <Label htmlFor="accuracyConfirmed" className="cursor-pointer leading-relaxed">
              I confirm that all information provided is accurate and complete to the best of my knowledge
            </Label>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="termsAccepted"
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
            />
            <Label htmlFor="termsAccepted" className="cursor-pointer leading-relaxed">
              I accept the{" "}
              <Link href="/en/legal/terms" className="text-brand-gold hover:underline">
                Terms & Conditions
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
              I accept the{" "}
              <Link href="/en/legal/privacy" className="text-brand-gold hover:underline">
                Privacy Policy
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
        Submit Formation Dossier
      </Button>

      {(!termsAccepted || !privacyAccepted || !accuracyConfirmed || !isPaymentComplete) && (
        <p className="text-center text-sm text-brand-grayMed">
          {!isPaymentComplete
            ? "Please complete payment before submitting"
            : "Please accept all consents to submit"}
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
