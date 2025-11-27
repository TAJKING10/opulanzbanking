/**
 * Personal Account Opening Funnel
 * 6-step wizard for individual account applications
 */

"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FormStepper, Step } from "./form-stepper";
import { ArrowLeft, ArrowRight, CheckCircle, Loader2, Clock, FileText, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  PersonalApplication,
  PersonalIdentity,
  PersonalIntent,
  PersonalConsents,
  TaxResidency,
  Jurisdiction,
  Currency,
  SourceOfFunds,
  AccountType,
} from "@/types/account-opening";
// Removed: import { generateReferralRouting, saveReferralEntry, getPartnerDisplayName, getPartnerExplanation } from "@/lib/referral-routing";

const STEPS: Step[] = [
  { id: "welcome", label: "Welcome", shortLabel: "Welcome" },
  { id: "identity", label: "Identity & Contact", shortLabel: "Identity" },
  { id: "intent", label: "Account Intent", shortLabel: "Intent" },
  { id: "eligibility", label: "Eligibility", shortLabel: "Eligibility" },
  { id: "review", label: "Review & Consents", shortLabel: "Review" },
  { id: "submission", label: "Submission", shortLabel: "Submit" },
];

interface PersonalFunnelProps {
  onSwitchMode: () => void;
  locale: string;
}

export function PersonalFunnel({ onSwitchMode, locale }: PersonalFunnelProps) {
  const [currentStep, setCurrentStep] = React.useState(1);
  const [formData, setFormData] = React.useState<Partial<PersonalApplication>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [applicationId, setApplicationId] = React.useState<string>("");

  // Document uploads state
  const [uploadedDocuments, setUploadedDocuments] = React.useState<Array<{
    name: string;
    type: string;
    size: number;
    data: string; // base64 encoded
    category: string;
  }>>([]);

  // Scroll to top whenever step changes
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  // Step 1: Welcome - No form needed

  // Step 2: Identity & Contact
  const step2Schema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    mobile: z.string().min(10, "Invalid phone number"),
    countryOfResidence: z.string().min(1, "Country is required"),
    taxCountry: z.string().min(1, "Tax residency is required"),
    taxId: z.string().optional(),
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    nationality: z.string().min(1, "Nationality is required"),
  });

  const step2Form = useForm({
    resolver: zodResolver(step2Schema),
    defaultValues: formData.identity || {},
  });

  // Step 3: Intent
  const step3Schema = z.object({
    accountType: z.enum(["current", "private_banking", "investment"]),
    jurisdictions: z.array(z.string()).min(1, "Select at least one jurisdiction"),
    currencies: z.array(z.string()).min(1, "Select at least one currency"),
    estimatedMonthlyIncoming: z.number().min(0),
    sourceOfFunds: z.enum(["salary", "dividends", "business_income", "asset_sale", "savings", "other"]),
    sourceOfFundsDetails: z.string().optional(),
    isPEP: z.boolean(),
  });

  const step3Form = useForm({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      accountType: "current" as AccountType,
      jurisdictions: [],
      currencies: [],
      estimatedMonthlyIncoming: 5000,
      sourceOfFunds: "salary" as SourceOfFunds,
      isPEP: false,
      ...formData.intent,
    },
  });

  // Step 5: Consents
  const step5Schema = z.object({
    dataProcessing: z.boolean().refine((val) => val === true, "You must consent to data processing"),
    dataSharing: z.boolean().refine((val) => val === true, "You must authorize data sharing"),
    marketingOptIn: z.boolean(),
  });

  const step5Form = useForm({
    resolver: zodResolver(step5Schema),
    defaultValues: {
      dataProcessing: false,
      dataSharing: false,
      marketingOptIn: false,
      ...formData.consents,
    },
  });

  const handleNext = async () => {
    let isValid = true;

    if (currentStep === 2) {
      isValid = await step2Form.trigger();
      if (isValid) {
        const values = step2Form.getValues();
        const identity: PersonalIdentity = {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          mobile: values.mobile,
          countryOfResidence: values.countryOfResidence,
          taxResidencies: [{ country: (values as any).taxCountry, tin: (values as any).taxId }],
          dateOfBirth: values.dateOfBirth,
          nationality: values.nationality,
        };
        setFormData((prev) => ({ ...prev, identity }));
      }
    }

    if (currentStep === 3) {
      isValid = await step3Form.trigger();
      if (isValid) {
        const values = step3Form.getValues();
        const intent: PersonalIntent = {
          accountType: values.accountType as AccountType,
          preferredJurisdictions: values.jurisdictions as any,
          currencies: values.currencies as any,
          estimatedMonthlyIncoming: values.estimatedMonthlyIncoming,
          sourceOfFunds: values.sourceOfFunds as SourceOfFunds,
          sourceOfFundsDetails: values.sourceOfFundsDetails,
          isPEP: values.isPEP,
        };
        setFormData((prev) => ({ ...prev, intent }));
      }
    }

    if (currentStep === 5) {
      isValid = await step5Form.trigger();
      if (isValid) {
        const values = step5Form.getValues();
        const consents: PersonalConsents = {
          dataProcessing: values.dataProcessing,
          dataSharing: values.dataSharing,
          marketingOptIn: values.marketingOptIn,
        };
        setFormData((prev) => ({ ...prev, consents }));
      }
    }

    if (isValid && currentStep < STEPS.length) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, category: string) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (file.size > maxSize) {
      alert("File size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setUploadedDocuments(prev => [...prev, {
        name: file.name,
        type: file.type,
        size: file.size,
        data: base64,
        category: category
      }]);
    };
    reader.readAsDataURL(file);
  };

  const removeDocument = (index: number) => {
    setUploadedDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Generate unique application ID
      const appId = `OPL-PA-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

      // Build complete application
      const application: PersonalApplication = {
        userRef: crypto.randomUUID(),
        mode: "personal",
        identity: formData.identity!,
        intent: formData.intent!,
        consents: formData.consents!,
        createdAt: new Date().toISOString(),
      };

      // Save application to localStorage with unique ID
      const applications = JSON.parse(localStorage.getItem("opulanz_applications") || "[]");
      applications.push({
        id: appId,
        type: "personal",
        application,
        documents: uploadedDocuments,
        submittedAt: new Date().toISOString(),
      });
      localStorage.setItem("opulanz_applications", JSON.stringify(applications));

      // Store application ID for display
      setApplicationId(appId);

      // Move to final step
      setCurrentStep(6);
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-6">
      {/* Progress Stepper */}
      <FormStepper steps={STEPS} currentStep={currentStep} className="mb-12" />

      {/* Step Content */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        {/* Step 1: Welcome */}
        {currentStep === 1 && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-brand-dark">
                Open Your Personal Account
              </h2>
              <p className="text-lg text-brand-grayMed max-w-2xl mx-auto">
                Answer a few quick questions so we can match you with a licensed Opulanz partner bank.
              </p>
            </div>

            {/* Process Timeline */}
            <div className="bg-brand-goldLight/10 rounded-xl p-6 border border-brand-gold/20">
              <h3 className="text-xl font-bold text-brand-dark mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-brand-gold" />
                Application Timeline
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-gold text-white flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <p className="font-semibold text-brand-dark">Submit Application (10 minutes)</p>
                    <p className="text-sm text-brand-grayMed">Complete online form with your details</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-gold text-white flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <p className="font-semibold text-brand-dark">Partner Review (24-72 hours)</p>
                    <p className="text-sm text-brand-grayMed">Partner bank reviews your application</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-gold text-white flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <p className="font-semibold text-brand-dark">KYC Verification (1-3 days)</p>
                    <p className="text-sm text-brand-grayMed">Identity and document verification</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-gold text-white flex items-center justify-center text-sm font-bold">4</div>
                  <div>
                    <p className="font-semibold text-brand-dark">Account Activation (1-2 days)</p>
                    <p className="text-sm text-brand-grayMed">Receive IBAN and access credentials</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-brand-gold/20">
                <p className="text-sm font-semibold text-brand-dark">
                  ⏱️ Total Time: Approximately 5-7 business days
                </p>
              </div>
            </div>

            {/* Eligibility Requirements */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-brand-grayLight rounded-xl p-6">
                <h3 className="text-lg font-bold text-brand-dark mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-brand-gold" />
                  Eligibility Requirements
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-brand-gold mt-0.5">✓</span>
                    <span className="text-brand-dark">18 years or older</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-gold mt-0.5">✓</span>
                    <span className="text-brand-dark">Valid government-issued ID or passport</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-gold mt-0.5">✓</span>
                    <span className="text-brand-dark">Proof of address (utility bill, bank statement)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-gold mt-0.5">✓</span>
                    <span className="text-brand-dark">EU/EEA resident or valid residence permit</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-gold mt-0.5">✓</span>
                    <span className="text-brand-dark">Tax identification number (TIN)</span>
                  </li>
                </ul>
              </div>

              <div className="border border-brand-grayLight rounded-xl p-6">
                <h3 className="text-lg font-bold text-brand-dark mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-brand-gold" />
                  Required Documents
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-brand-gold mt-0.5">•</span>
                    <span className="text-brand-dark">Valid ID card or passport (color scan)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-gold mt-0.5">•</span>
                    <span className="text-brand-dark">Proof of address (dated within 3 months)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-gold mt-0.5">•</span>
                    <span className="text-brand-dark">Proof of income (payslips or tax returns)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-gold mt-0.5">•</span>
                    <span className="text-brand-dark">Source of funds declaration</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* How It Works */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-brand-dark mb-4">How It Works</h3>
              <div className="space-y-4 text-sm text-brand-grayMed">
                <p>
                  <strong className="text-brand-dark">Smart Matching:</strong> Based on your jurisdiction preferences, we automatically route your application to the most suitable Opulanz partner bank.
                </p>
                <p>
                  <strong className="text-brand-dark">Warm Referral:</strong> Your application includes a secure signed referral code, ensuring priority processing and preferential terms.
                </p>
                <p>
                  <strong className="text-brand-dark">Data Security:</strong> All information is encrypted and transmitted securely. We comply with GDPR and Luxembourg banking regulations.
                </p>
                <p>
                  <strong className="text-brand-dark">No Commitment:</strong> Submitting this application does not obligate you to open an account. You can review final terms before accepting.
                </p>
              </div>
            </div>

            {/* Account Features */}
            <div className="border-2 border-brand-gold/30 rounded-xl p-6 bg-gradient-to-br from-brand-goldLight/5 to-transparent">
              <h3 className="text-lg font-bold text-brand-dark mb-4">What You'll Get</h3>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-brand-gold flex-shrink-0" />
                  <span className="text-brand-dark">Multi-currency IBAN account</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-brand-gold flex-shrink-0" />
                  <span className="text-brand-dark">SEPA & SWIFT transfers</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-brand-gold flex-shrink-0" />
                  <span className="text-brand-dark">Debit card (Mastercard/Visa)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-brand-gold flex-shrink-0" />
                  <span className="text-brand-dark">Mobile & online banking</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-brand-gold flex-shrink-0" />
                  <span className="text-brand-dark">24/7 customer support</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-brand-gold flex-shrink-0" />
                  <span className="text-brand-dark">EU-regulated protection</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 max-w-md mx-auto mt-8">
              <Button size="lg" onClick={handleNext}>
                Start Personal Application
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <p className="text-xs text-center text-brand-grayMed">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Identity & Contact */}
        {currentStep === 2 && (
          <form className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-brand-dark mb-2">
                Identity & Contact Information
              </h2>
              <p className="text-brand-grayMed">
                Please provide your personal details
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  {...step2Form.register("firstName")}
                  placeholder="John"
                />
                {step2Form.formState.errors.firstName && (
                  <p className="text-sm text-red-500">
                    {step2Form.formState.errors.firstName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  {...step2Form.register("lastName")}
                  placeholder="Doe"
                />
                {step2Form.formState.errors.lastName && (
                  <p className="text-sm text-red-500">
                    {step2Form.formState.errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                {...step2Form.register("email")}
                placeholder="john.doe@example.com"
              />
              {step2Form.formState.errors.email && (
                <p className="text-sm text-red-500">
                  {step2Form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile">
                Mobile Phone <span className="text-red-500">*</span>
              </Label>
              <Input
                id="mobile"
                type="tel"
                {...step2Form.register("mobile")}
                placeholder="+352 123 456 789"
              />
              {step2Form.formState.errors.mobile && (
                <p className="text-sm text-red-500">
                  {step2Form.formState.errors.mobile.message}
                </p>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">
                  Date of Birth <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  {...step2Form.register("dateOfBirth")}
                />
                {step2Form.formState.errors.dateOfBirth && (
                  <p className="text-sm text-red-500">
                    {step2Form.formState.errors.dateOfBirth.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="nationality">
                  Nationality <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nationality"
                  {...step2Form.register("nationality")}
                  placeholder="Luxembourg"
                />
                {step2Form.formState.errors.nationality && (
                  <p className="text-sm text-red-500">
                    {step2Form.formState.errors.nationality.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="countryOfResidence">
                Country of Residence <span className="text-red-500">*</span>
              </Label>
              <Input
                id="countryOfResidence"
                {...step2Form.register("countryOfResidence")}
                placeholder="Luxembourg"
              />
              {step2Form.formState.errors.countryOfResidence && (
                <p className="text-sm text-red-500">
                  {step2Form.formState.errors.countryOfResidence.message}
                </p>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="taxCountry">
                  Tax Residency <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="taxCountry"
                  {...step2Form.register("taxCountry" as any)}
                  placeholder="Luxembourg"
                />
                {(step2Form.formState.errors as any).taxCountry && (
                  <p className="text-sm text-red-500">
                    {(step2Form.formState.errors as any).taxCountry.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxId">Tax ID (Optional)</Label>
                <Input
                  id="taxId"
                  {...step2Form.register("taxId" as any)}
                  placeholder="1234567890"
                />
              </div>
            </div>
          </form>
        )}

        {/* Step 3: Intent */}
        {currentStep === 3 && (
          <form className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-brand-dark mb-2">
                Account Intent & Preferences
              </h2>
              <p className="text-brand-grayMed">
                Tell us about your banking needs
              </p>
            </div>

            <div className="space-y-4">
              <Label>Account Type <span className="text-red-500">*</span></Label>
              <RadioGroup
                defaultValue={step3Form.getValues("accountType")}
                onValueChange={(value) => step3Form.setValue("accountType", value as AccountType)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="current" id="current" />
                  <Label htmlFor="current" className="font-normal cursor-pointer">
                    Current Account (daily banking)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="private_banking" id="private_banking" />
                  <Label htmlFor="private_banking" className="font-normal cursor-pointer">
                    Private Banking / Investment Account
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <Label>Preferred Jurisdictions <span className="text-red-500">*</span></Label>
              <div className="grid grid-cols-2 gap-4">
                {["Luxembourg", "France", "Finland", "Other EEA"].map((jur) => (
                  <div key={jur} className="flex items-center space-x-2">
                    <Checkbox
                      id={jur}
                      checked={step3Form.watch("jurisdictions" as any)?.includes(jur.toLowerCase().replace(" ", "_"))}
                      onCheckedChange={(checked) => {
                        const current = step3Form.getValues("jurisdictions") || [];
                        const value = jur.toLowerCase().replace(" ", "_");
                        if (checked) {
                          step3Form.setValue("jurisdictions" as any, [...current, value]);
                        } else {
                          step3Form.setValue("jurisdictions" as any, current.filter((j) => j !== value));
                        }
                      }}
                    />
                    <Label htmlFor={jur} className="font-normal cursor-pointer">
                      {jur}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Label>Preferred Currencies <span className="text-red-500">*</span></Label>
              <div className="grid grid-cols-2 gap-4">
                {["EUR", "USD", "GBP", "Other"].map((curr) => (
                  <div key={curr} className="flex items-center space-x-2">
                    <Checkbox
                      id={curr}
                      checked={step3Form.watch("currencies" as any)?.includes(curr)}
                      onCheckedChange={(checked) => {
                        const current = step3Form.getValues("currencies") || [];
                        if (checked) {
                          step3Form.setValue("currencies" as any, [...current, curr]);
                        } else {
                          step3Form.setValue("currencies" as any, current.filter((c) => c !== curr));
                        }
                      }}
                    />
                    <Label htmlFor={curr} className="font-normal cursor-pointer">
                      {curr}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Label>
                Estimated Monthly Incoming Transfers: €
                {step3Form.watch("estimatedMonthlyIncoming")?.toLocaleString()}
              </Label>
              <Slider
                value={[step3Form.watch("estimatedMonthlyIncoming") || 5000]}
                onValueChange={(value) => step3Form.setValue("estimatedMonthlyIncoming", value[0])}
                min={1000}
                max={100000}
                step={1000}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sourceOfFunds">
                Source of Funds <span className="text-red-500">*</span>
              </Label>
              <Select
                value={step3Form.watch("sourceOfFunds")}
                onValueChange={(value) => step3Form.setValue("sourceOfFunds", value as SourceOfFunds)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="salary">Salary</SelectItem>
                  <SelectItem value="dividends">Dividends</SelectItem>
                  <SelectItem value="business_income">Business Income</SelectItem>
                  <SelectItem value="asset_sale">Asset Sale</SelectItem>
                  <SelectItem value="savings">Savings</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {step3Form.watch("sourceOfFunds") === "other" && (
              <div className="space-y-2">
                <Label htmlFor="sourceOfFundsDetails">Please provide details</Label>
                <Input
                  id="sourceOfFundsDetails"
                  {...step3Form.register("sourceOfFundsDetails")}
                  placeholder="Describe your source of funds"
                />
              </div>
            )}

            <div className="space-y-4">
              <Label>PEP / Sanctions Awareness</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPEP"
                  checked={step3Form.watch("isPEP")}
                  onCheckedChange={(checked) => step3Form.setValue("isPEP", !!checked)}
                />
                <Label htmlFor="isPEP" className="font-normal cursor-pointer">
                  I am a Politically Exposed Person (PEP) or subject to sanctions
                </Label>
              </div>
            </div>
          </form>
        )}

        {/* Step 4: Eligibility */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-brand-dark mb-2">
                Eligibility & Required Documents
              </h2>
              <p className="text-brand-grayMed">
                Based on your selections, you will need the following documents
              </p>
            </div>

            <div className="space-y-4">
              {/* Valid ID or Passport */}
              <div className="p-4 bg-brand-goldLight/10 rounded-lg space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-brand-gold mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-brand-dark">Valid ID or Passport</p>
                    <p className="text-sm text-brand-grayMed">Government-issued photo ID</p>
                  </div>
                </div>
                <div className="pl-8">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload(e, "id_document")}
                    className="hidden"
                    id="step4-id-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById("step4-id-upload")?.click()}
                    className="w-full sm:w-auto"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {uploadedDocuments.some(d => d.category === "id_document") ? "✓ Uploaded" : "Upload ID"}
                  </Button>
                </div>
              </div>

              {/* Proof of Address */}
              <div className="p-4 bg-brand-goldLight/10 rounded-lg space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-brand-gold mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-brand-dark">Proof of Address</p>
                    <p className="text-sm text-brand-grayMed">Utility bill or bank statement (less than 3 months old)</p>
                  </div>
                </div>
                <div className="pl-8">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload(e, "proof_of_address")}
                    className="hidden"
                    id="step4-address-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById("step4-address-upload")?.click()}
                    className="w-full sm:w-auto"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {uploadedDocuments.some(d => d.category === "proof_of_address") ? "✓ Uploaded" : "Upload Proof"}
                  </Button>
                </div>
              </div>

              {/* Tax Identification Number */}
              <div className="p-4 bg-brand-goldLight/10 rounded-lg space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-brand-gold mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-brand-dark">Tax Identification Number</p>
                    <p className="text-sm text-brand-grayMed">If applicable in your jurisdiction</p>
                  </div>
                </div>
                <div className="pl-8">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload(e, "tax_id_document")}
                    className="hidden"
                    id="step4-tax-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById("step4-tax-upload")?.click()}
                    className="w-full sm:w-auto"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {uploadedDocuments.some(d => d.category === "tax_id_document") ? "✓ Uploaded" : "Upload Tax ID"}
                  </Button>
                </div>
              </div>

              {/* Source of Funds Documentation */}
              <div className="p-4 bg-brand-goldLight/10 rounded-lg space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-brand-gold mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-brand-dark">Source of Funds Documentation</p>
                    <p className="text-sm text-brand-grayMed">Pay slips, investment statements, or other proof</p>
                  </div>
                </div>
                <div className="pl-8">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload(e, "source_of_funds")}
                    className="hidden"
                    id="step4-funds-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById("step4-funds-upload")?.click()}
                    className="w-full sm:w-auto"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {uploadedDocuments.some(d => d.category === "source_of_funds") ? "✓ Uploaded" : "Upload Proof"}
                  </Button>
                </div>
              </div>

              {/* Private Banking Additional Documents */}
              {formData.intent?.accountType === "private_banking" && (
                <>
                  <div className="p-4 bg-brand-goldLight/10 rounded-lg space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-brand-gold mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium text-brand-dark">Proof of Assets</p>
                        <p className="text-sm text-brand-grayMed">Bank statements, investment portfolios</p>
                      </div>
                    </div>
                    <div className="pl-8">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileUpload(e, "proof_of_assets")}
                        className="hidden"
                        id="step4-assets-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById("step4-assets-upload")?.click()}
                        className="w-full sm:w-auto"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        {uploadedDocuments.some(d => d.category === "proof_of_assets") ? "✓ Uploaded" : "Upload Assets"}
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 bg-brand-goldLight/10 rounded-lg space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-brand-gold mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium text-brand-dark">Income Evidence</p>
                        <p className="text-sm text-brand-grayMed">Tax returns, employment contracts</p>
                      </div>
                    </div>
                    <div className="pl-8">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileUpload(e, "income_evidence")}
                        className="hidden"
                        id="step4-income-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById("step4-income-upload")?.click()}
                        className="w-full sm:w-auto"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        {uploadedDocuments.some(d => d.category === "income_evidence") ? "✓ Uploaded" : "Upload Income Proof"}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Uploaded Documents List */}
            {uploadedDocuments.length > 0 && (
              <div className="space-y-2 pt-6 border-t border-gray-200 mt-6">
                <Label>Uploaded Documents ({uploadedDocuments.length})</Label>
                <div className="space-y-2">
                  {uploadedDocuments.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileText className="h-5 w-5 text-brand-gold flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-brand-dark truncate">{doc.name}</p>
                          <p className="text-xs text-brand-grayMed">
                            {doc.category.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} • {(doc.size / 1024).toFixed(0)} KB
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDocument(index)}
                        className="flex-shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 5: Review & Consents */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-brand-dark mb-2">
                Review & Consents
              </h2>
              <p className="text-brand-grayMed">
                Please review your information and provide your consent
              </p>
            </div>

            {/* Summary */}
            <div className="space-y-4 p-6 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-brand-dark">Application Summary</h3>

              <div className="grid gap-4 text-sm">
                <div>
                  <p className="text-brand-grayMed">Name</p>
                  <p className="font-medium text-brand-dark">
                    {formData.identity?.firstName} {formData.identity?.lastName}
                  </p>
                </div>

                <div>
                  <p className="text-brand-grayMed">Email</p>
                  <p className="font-medium text-brand-dark">{formData.identity?.email}</p>
                </div>

                <div>
                  <p className="text-brand-grayMed">Mobile</p>
                  <p className="font-medium text-brand-dark">{formData.identity?.mobile}</p>
                </div>

                <div>
                  <p className="text-brand-grayMed">Account Type</p>
                  <p className="font-medium text-brand-dark capitalize">
                    {formData.intent?.accountType?.replace("_", " ")}
                  </p>
                </div>

                <div>
                  <p className="text-brand-grayMed">Preferred Jurisdictions</p>
                  <p className="font-medium text-brand-dark capitalize">
                    {formData.intent?.preferredJurisdictions?.join(", ").replace(/_/g, " ")}
                  </p>
                </div>
              </div>
            </div>

            {/* Consents */}
            <form className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="dataProcessing"
                  checked={step5Form.watch("dataProcessing")}
                  onCheckedChange={(checked) => step5Form.setValue("dataProcessing", !!checked)}
                />
                <Label htmlFor="dataProcessing" className="font-normal cursor-pointer leading-tight">
                  <span className="text-red-500">*</span> I consent to Opulanz processing my data for the purpose of introducing me to licensed banking partners.
                </Label>
              </div>
              {step5Form.formState.errors.dataProcessing && (
                <p className="text-sm text-red-500 ml-7">
                  {step5Form.formState.errors.dataProcessing.message}
                </p>
              )}

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="dataSharing"
                  checked={step5Form.watch("dataSharing")}
                  onCheckedChange={(checked) => step5Form.setValue("dataSharing", !!checked)}
                />
                <Label htmlFor="dataSharing" className="font-normal cursor-pointer leading-tight">
                  <span className="text-red-500">*</span> I authorize Opulanz to share my information with partner banks/EMIs solely for account onboarding.
                </Label>
              </div>
              {step5Form.formState.errors.dataSharing && (
                <p className="text-sm text-red-500 ml-7">
                  {step5Form.formState.errors.dataSharing.message}
                </p>
              )}

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="marketingOptIn"
                  checked={step5Form.watch("marketingOptIn")}
                  onCheckedChange={(checked) => step5Form.setValue("marketingOptIn", !!checked)}
                />
                <Label htmlFor="marketingOptIn" className="font-normal cursor-pointer leading-tight">
                  Keep me informed about Opulanz services (optional)
                </Label>
              </div>
            </form>
          </div>
        )}

        {/* Step 6: Submission */}
        {currentStep === 6 && (
          <div className="space-y-8 text-center">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>

            <div>
              <h2 className="text-3xl font-bold text-brand-dark mb-4">
                Application Submitted Successfully!
              </h2>
              <p className="text-lg text-brand-grayMed max-w-2xl mx-auto mb-6">
                Thank you for submitting your personal account application. Our team will review your information and contact you within 24-72 hours.
              </p>
            </div>

            <div className="p-8 bg-gradient-to-br from-brand-goldLight/20 to-brand-gold/10 rounded-2xl border-2 border-brand-gold/30 max-w-md mx-auto">
              <p className="text-sm text-brand-grayMed mb-3 font-semibold uppercase tracking-wide">
                Your Application Number
              </p>
              <div className="text-3xl font-bold text-brand-dark mb-2 font-mono tracking-tight">
                {applicationId}
              </div>
              <p className="text-sm text-brand-grayMed">
                Please save this number for your records
              </p>
            </div>

            <div className="p-6 bg-blue-50 rounded-lg border border-blue-200 max-w-2xl mx-auto text-left">
              <h3 className="font-semibold text-brand-dark mb-3">What happens next?</h3>
              <ul className="space-y-2 text-sm text-brand-grayMed">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Our compliance team will review your application</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>We'll match you with the most suitable Opulanz partner bank</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>You'll receive an email with next steps within 24-72 hours</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-4 max-w-md mx-auto mt-8">
              <Button variant="outline" size="lg" asChild>
                <a href={`/${locale}`}>
                  Back to Homepage
                </a>
              </Button>
              <Button variant="outline" size="lg" onClick={onSwitchMode}>
                Start a Business Application
              </Button>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        {currentStep > 1 && currentStep < 6 && (
          <div className="flex items-center justify-between gap-4 mt-8 pt-8 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={isSubmitting}
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back
            </Button>

            {currentStep < 5 && (
              <Button onClick={handleNext} disabled={isSubmitting}>
                Next
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            )}

            {currentStep === 5 && (
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Application
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
