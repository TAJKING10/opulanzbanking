/**
 * Personal Account Opening Funnel
 * 6-step wizard for individual account applications
 */

"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
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

const COUNTRY_CODES = [
  { code: "+93", country: "Afghanistan", flag: "🇦🇫" },
  { code: "+355", country: "Albania", flag: "🇦🇱" },
  { code: "+213", country: "Algeria", flag: "🇩🇿" },
  { code: "+376", country: "Andorra", flag: "🇦🇩" },
  { code: "+244", country: "Angola", flag: "🇦🇴" },
  { code: "+54", country: "Argentina", flag: "🇦🇷" },
  { code: "+374", country: "Armenia", flag: "🇦🇲" },
  { code: "+61", country: "Australia", flag: "🇦🇺" },
  { code: "+43", country: "Austria", flag: "🇦🇹" },
  { code: "+994", country: "Azerbaijan", flag: "🇦🇿" },
  { code: "+973", country: "Bahrain", flag: "🇧🇭" },
  { code: "+880", country: "Bangladesh", flag: "🇧🇩" },
  { code: "+375", country: "Belarus", flag: "🇧🇾" },
  { code: "+32", country: "Belgium", flag: "🇧🇪" },
  { code: "+229", country: "Benin", flag: "🇧🇯" },
  { code: "+975", country: "Bhutan", flag: "🇧🇹" },
  { code: "+591", country: "Bolivia", flag: "🇧🇴" },
  { code: "+387", country: "Bosnia", flag: "🇧🇦" },
  { code: "+55", country: "Brazil", flag: "🇧🇷" },
  { code: "+673", country: "Brunei", flag: "🇧🇳" },
  { code: "+359", country: "Bulgaria", flag: "🇧🇬" },
  { code: "+855", country: "Cambodia", flag: "🇰🇭" },
  { code: "+237", country: "Cameroon", flag: "🇨🇲" },
  { code: "+1", country: "Canada", flag: "🇨🇦" },
  { code: "+56", country: "Chile", flag: "🇨🇱" },
  { code: "+86", country: "China", flag: "🇨🇳" },
  { code: "+57", country: "Colombia", flag: "🇨🇴" },
  { code: "+506", country: "Costa Rica", flag: "🇨🇷" },
  { code: "+385", country: "Croatia", flag: "🇭🇷" },
  { code: "+53", country: "Cuba", flag: "🇨🇺" },
  { code: "+357", country: "Cyprus", flag: "🇨🇾" },
  { code: "+420", country: "Czech Republic", flag: "🇨🇿" },
  { code: "+45", country: "Denmark", flag: "🇩🇰" },
  { code: "+593", country: "Ecuador", flag: "🇪🇨" },
  { code: "+20", country: "Egypt", flag: "🇪🇬" },
  { code: "+503", country: "El Salvador", flag: "🇸🇻" },
  { code: "+372", country: "Estonia", flag: "🇪🇪" },
  { code: "+251", country: "Ethiopia", flag: "🇪🇹" },
  { code: "+358", country: "Finland", flag: "🇫🇮" },
  { code: "+33", country: "France", flag: "🇫🇷" },
  { code: "+995", country: "Georgia", flag: "🇬🇪" },
  { code: "+49", country: "Germany", flag: "🇩🇪" },
  { code: "+233", country: "Ghana", flag: "🇬🇭" },
  { code: "+30", country: "Greece", flag: "🇬🇷" },
  { code: "+502", country: "Guatemala", flag: "🇬🇹" },
  { code: "+509", country: "Haiti", flag: "🇭🇹" },
  { code: "+504", country: "Honduras", flag: "🇭🇳" },
  { code: "+852", country: "Hong Kong", flag: "🇭🇰" },
  { code: "+36", country: "Hungary", flag: "🇭🇺" },
  { code: "+354", country: "Iceland", flag: "🇮🇸" },
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+62", country: "Indonesia", flag: "🇮🇩" },
  { code: "+98", country: "Iran", flag: "🇮🇷" },
  { code: "+964", country: "Iraq", flag: "🇮🇶" },
  { code: "+353", country: "Ireland", flag: "🇮🇪" },
  { code: "+972", country: "Israel", flag: "🇮🇱" },
  { code: "+39", country: "Italy", flag: "🇮🇹" },
  { code: "+81", country: "Japan", flag: "🇯🇵" },
  { code: "+962", country: "Jordan", flag: "🇯🇴" },
  { code: "+7", country: "Kazakhstan", flag: "🇰🇿" },
  { code: "+254", country: "Kenya", flag: "🇰🇪" },
  { code: "+965", country: "Kuwait", flag: "🇰🇼" },
  { code: "+371", country: "Latvia", flag: "🇱🇻" },
  { code: "+961", country: "Lebanon", flag: "🇱🇧" },
  { code: "+218", country: "Libya", flag: "🇱🇾" },
  { code: "+370", country: "Lithuania", flag: "🇱🇹" },
  { code: "+352", country: "Luxembourg", flag: "🇱🇺" },
  { code: "+60", country: "Malaysia", flag: "🇲🇾" },
  { code: "+960", country: "Maldives", flag: "🇲🇻" },
  { code: "+356", country: "Malta", flag: "🇲🇹" },
  { code: "+52", country: "Mexico", flag: "🇲🇽" },
  { code: "+373", country: "Moldova", flag: "🇲🇩" },
  { code: "+377", country: "Monaco", flag: "🇲🇨" },
  { code: "+976", country: "Mongolia", flag: "🇲🇳" },
  { code: "+382", country: "Montenegro", flag: "🇲🇪" },
  { code: "+212", country: "Morocco", flag: "🇲🇦" },
  { code: "+95", country: "Myanmar", flag: "🇲🇲" },
  { code: "+977", country: "Nepal", flag: "🇳🇵" },
  { code: "+31", country: "Netherlands", flag: "🇳🇱" },
  { code: "+64", country: "New Zealand", flag: "🇳🇿" },
  { code: "+234", country: "Nigeria", flag: "🇳🇬" },
  { code: "+47", country: "Norway", flag: "🇳🇴" },
  { code: "+968", country: "Oman", flag: "🇴🇲" },
  { code: "+92", country: "Pakistan", flag: "🇵🇰" },
  { code: "+970", country: "Palestine", flag: "🇵🇸" },
  { code: "+507", country: "Panama", flag: "🇵🇦" },
  { code: "+51", country: "Peru", flag: "🇵🇪" },
  { code: "+63", country: "Philippines", flag: "🇵🇭" },
  { code: "+48", country: "Poland", flag: "🇵🇱" },
  { code: "+351", country: "Portugal", flag: "🇵🇹" },
  { code: "+974", country: "Qatar", flag: "🇶🇦" },
  { code: "+40", country: "Romania", flag: "🇷🇴" },
  { code: "+7", country: "Russia", flag: "🇷🇺" },
  { code: "+966", country: "Saudi Arabia", flag: "🇸🇦" },
  { code: "+381", country: "Serbia", flag: "🇷🇸" },
  { code: "+65", country: "Singapore", flag: "🇸🇬" },
  { code: "+421", country: "Slovakia", flag: "🇸🇰" },
  { code: "+386", country: "Slovenia", flag: "🇸🇮" },
  { code: "+27", country: "South Africa", flag: "🇿🇦" },
  { code: "+82", country: "South Korea", flag: "🇰🇷" },
  { code: "+34", country: "Spain", flag: "🇪🇸" },
  { code: "+94", country: "Sri Lanka", flag: "🇱🇰" },
  { code: "+46", country: "Sweden", flag: "🇸🇪" },
  { code: "+41", country: "Switzerland", flag: "🇨🇭" },
  { code: "+963", country: "Syria", flag: "🇸🇾" },
  { code: "+886", country: "Taiwan", flag: "🇹🇼" },
  { code: "+66", country: "Thailand", flag: "🇹🇭" },
  { code: "+216", country: "Tunisia", flag: "🇹🇳" },
  { code: "+90", country: "Turkey", flag: "🇹🇷" },
  { code: "+971", country: "UAE", flag: "🇦🇪" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+1", country: "USA", flag: "🇺🇸" },
  { code: "+598", country: "Uruguay", flag: "🇺🇾" },
  { code: "+58", country: "Venezuela", flag: "🇻🇪" },
  { code: "+84", country: "Vietnam", flag: "🇻🇳" },
  { code: "+967", country: "Yemen", flag: "🇾🇪" },
];

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia",
  "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
  "Cambodia", "Cameroon", "Canada", "Cape Verde", "Central African Republic", "Chad", "Chile", "China", "Colombia",
  "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic",
  "Denmark", "Djibouti", "Dominica", "Dominican Republic",
  "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia",
  "Fiji", "Finland", "France",
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
  "Haiti", "Honduras", "Hungary",
  "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy",
  "Jamaica", "Japan", "Jordan",
  "Kazakhstan", "Kenya", "Kiribati", "Kosovo", "Kuwait", "Kyrgyzstan",
  "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius",
  "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
  "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway",
  "Oman",
  "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar",
  "Romania", "Russia", "Rwanda",
  "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe",
  "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands",
  "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
  "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey",
  "Turkmenistan", "Tuvalu",
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan",
  "Vanuatu", "Vatican City", "Venezuela", "Vietnam",
  "Yemen",
  "Zambia", "Zimbabwe"
];

interface PersonalFunnelProps {
  onSwitchMode: () => void;
  locale: string;
}

export function PersonalFunnel({ onSwitchMode, locale }: PersonalFunnelProps) {
  const tSteps = useTranslations("accountOpening.personal.personalFunnel.steps");
  const tWelcome = useTranslations("accountOpening.personal.personalFunnel.welcome");
  const tIdentity = useTranslations("accountOpening.personal.personalFunnel.identity");
  const tIntent = useTranslations("accountOpening.personal.personalFunnel.intent");
  const tEligibility = useTranslations("accountOpening.personal.personalFunnel.eligibility");
  const tReview = useTranslations("accountOpening.personal.personalFunnel.review");
  const tSubmission = useTranslations("accountOpening.personal.personalFunnel.submission");

  const STEPS: Step[] = [
    { id: "welcome", label: tSteps("welcome.label"), shortLabel: tSteps("welcome.shortLabel") },
    { id: "identity", label: tSteps("identity.label"), shortLabel: tSteps("identity.shortLabel") },
    { id: "intent", label: tSteps("intent.label"), shortLabel: tSteps("intent.shortLabel") },
    { id: "eligibility", label: tSteps("eligibility.label"), shortLabel: tSteps("eligibility.shortLabel") },
    { id: "review", label: tSteps("review.label"), shortLabel: tSteps("review.shortLabel") },
    { id: "submission", label: tSteps("submission.label"), shortLabel: tSteps("submission.shortLabel") },
  ];

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
    firstName: z.string().min(1, tIdentity("errors.firstNameRequired")),
    lastName: z.string().min(1, tIdentity("errors.lastNameRequired")),
    email: z.string().email(tIdentity("errors.invalidEmail")),
    countryCode: z.string().min(1, tIdentity("errors.countryCodeRequired")),
    mobile: z.string().min(6, tIdentity("errors.invalidPhone")),
    countryOfResidence: z.string().min(1, tIdentity("errors.countryRequired")),
    taxCountry: z.string().min(1, tIdentity("errors.taxResidencyRequired")),
    taxId: z.string().optional(),
    dateOfBirth: z.string().min(1, tIdentity("errors.dateOfBirthRequired")),
    nationality: z.string().min(1, tIdentity("errors.nationalityRequired")),
  });

  const step2Form = useForm({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      countryCode: "+352", // Default to Luxembourg
      ...(formData.identity || {}),
    },
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
          countryCode: values.countryCode,
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
                {tWelcome("title")}
              </h2>
              <p className="text-lg text-brand-grayMed max-w-2xl mx-auto">
                {tWelcome("subtitle")}
              </p>
            </div>

            {/* Process Timeline */}
            <div className="bg-brand-goldLight/10 rounded-xl p-6 border border-brand-gold/20">
              <h3 className="text-xl font-bold text-brand-dark mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-brand-gold" />
                {tWelcome("timeline.title")}
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-gold text-white flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <p className="font-semibold text-brand-dark">{tWelcome("timeline.step1.title")}</p>
                    <p className="text-sm text-brand-grayMed">{tWelcome("timeline.step1.description")}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-gold text-white flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <p className="font-semibold text-brand-dark">{tWelcome("timeline.step2.title")}</p>
                    <p className="text-sm text-brand-grayMed">{tWelcome("timeline.step2.description")}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-gold text-white flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <p className="font-semibold text-brand-dark">{tWelcome("timeline.step3.title")}</p>
                    <p className="text-sm text-brand-grayMed">{tWelcome("timeline.step3.description")}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-gold text-white flex items-center justify-center text-sm font-bold">4</div>
                  <div>
                    <p className="font-semibold text-brand-dark">{tWelcome("timeline.step4.title")}</p>
                    <p className="text-sm text-brand-grayMed">{tWelcome("timeline.step4.description")}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-brand-gold/20">
                <p className="text-sm font-semibold text-brand-dark">
                  {tWelcome("timeline.totalTime")}
                </p>
              </div>
            </div>

            {/* Eligibility Requirements */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-brand-grayLight rounded-xl p-6">
                <h3 className="text-lg font-bold text-brand-dark mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-brand-gold" />
                  {tWelcome("eligibility.title")}
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-brand-gold mt-0.5">✓</span>
                    <span className="text-brand-dark">{tWelcome("eligibility.requirement1")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-gold mt-0.5">✓</span>
                    <span className="text-brand-dark">{tWelcome("eligibility.requirement2")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-gold mt-0.5">✓</span>
                    <span className="text-brand-dark">{tWelcome("eligibility.requirement3")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-gold mt-0.5">✓</span>
                    <span className="text-brand-dark">{tWelcome("eligibility.requirement4")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-gold mt-0.5">✓</span>
                    <span className="text-brand-dark">{tWelcome("eligibility.requirement5")}</span>
                  </li>
                </ul>
              </div>

              <div className="border border-brand-grayLight rounded-xl p-6">
                <h3 className="text-lg font-bold text-brand-dark mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-brand-gold" />
                  {tWelcome("documents.title")}
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-brand-gold mt-0.5">•</span>
                    <span className="text-brand-dark">{tWelcome("documents.document1")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-gold mt-0.5">•</span>
                    <span className="text-brand-dark">{tWelcome("documents.document2")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-gold mt-0.5">•</span>
                    <span className="text-brand-dark">{tWelcome("documents.document3")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-gold mt-0.5">•</span>
                    <span className="text-brand-dark">{tWelcome("documents.document4")}</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* How It Works */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-brand-dark mb-4">{tWelcome("howItWorks.title")}</h3>
              <div className="space-y-4 text-sm text-brand-grayMed">
                <p>
                  <strong className="text-brand-dark">{tWelcome("howItWorks.smartMatching.title")}</strong> {tWelcome("howItWorks.smartMatching.description")}
                </p>
                <p>
                  <strong className="text-brand-dark">{tWelcome("howItWorks.warmReferral.title")}</strong> {tWelcome("howItWorks.warmReferral.description")}
                </p>
                <p>
                  <strong className="text-brand-dark">{tWelcome("howItWorks.dataSecurity.title")}</strong> {tWelcome("howItWorks.dataSecurity.description")}
                </p>
                <p>
                  <strong className="text-brand-dark">{tWelcome("howItWorks.noCommitment.title")}</strong> {tWelcome("howItWorks.noCommitment.description")}
                </p>
              </div>
            </div>

            {/* Account Features */}
            <div className="border-2 border-brand-gold/30 rounded-xl p-6 bg-gradient-to-br from-brand-goldLight/5 to-transparent">
              <h3 className="text-lg font-bold text-brand-dark mb-4">{tWelcome("features.title")}</h3>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-brand-gold flex-shrink-0" />
                  <span className="text-brand-dark">{tWelcome("features.feature1")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-brand-gold flex-shrink-0" />
                  <span className="text-brand-dark">{tWelcome("features.feature2")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-brand-gold flex-shrink-0" />
                  <span className="text-brand-dark">{tWelcome("features.feature3")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-brand-gold flex-shrink-0" />
                  <span className="text-brand-dark">{tWelcome("features.feature4")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-brand-gold flex-shrink-0" />
                  <span className="text-brand-dark">{tWelcome("features.feature5")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-brand-gold flex-shrink-0" />
                  <span className="text-brand-dark">{tWelcome("features.feature6")}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 max-w-md mx-auto mt-8">
              <Button size="lg" onClick={handleNext}>
                {tWelcome("startButton")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <p className="text-xs text-center text-brand-grayMed">
                {tWelcome("disclaimer")}
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Identity & Contact */}
        {currentStep === 2 && (
          <form className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-brand-dark mb-2">
                {tIdentity("title")}
              </h2>
              <p className="text-brand-grayMed">
                {tIdentity("subtitle")}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  {tIdentity("firstName")} <span className="text-red-500">{tIdentity("required")}</span>
                </Label>
                <Input
                  id="firstName"
                  {...step2Form.register("firstName")}
                  placeholder={tIdentity("firstNamePlaceholder")}
                />
                {step2Form.formState.errors.firstName && (
                  <p className="text-sm text-red-500">
                    {step2Form.formState.errors.firstName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">
                  {tIdentity("lastName")} <span className="text-red-500">{tIdentity("required")}</span>
                </Label>
                <Input
                  id="lastName"
                  {...step2Form.register("lastName")}
                  placeholder={tIdentity("lastNamePlaceholder")}
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
                {tIdentity("email")} <span className="text-red-500">{tIdentity("required")}</span>
              </Label>
              <Input
                id="email"
                type="email"
                {...step2Form.register("email")}
                placeholder={tIdentity("emailPlaceholder")}
              />
              {step2Form.formState.errors.email && (
                <p className="text-sm text-red-500">
                  {step2Form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile">
                {tIdentity("mobile")} <span className="text-red-500">{tIdentity("required")}</span>
              </Label>
              <div className="relative">
                <div className="flex items-center border border-input rounded-md bg-background h-10 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                  <Select
                    value={step2Form.watch("countryCode") || ""}
                    onValueChange={(value) => step2Form.setValue("countryCode", value)}
                  >
                    <SelectTrigger className="h-full border-0 bg-transparent hover:bg-transparent focus:ring-0 focus:ring-offset-0 w-[110px] px-3 gap-1.5">
                      <SelectValue placeholder="Select">
                        {step2Form.watch("countryCode") && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xl leading-none">{COUNTRY_CODES.find(c => c.code === step2Form.watch("countryCode"))?.flag}</span>
                            <span className="text-sm">{step2Form.watch("countryCode")}</span>
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {COUNTRY_CODES.map((item) => (
                        <SelectItem key={`${item.code}-${item.country}`} value={item.code}>
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{item.flag}</span>
                            <span className="text-sm font-medium min-w-[50px]">{item.code}</span>
                            <span className="text-sm text-muted-foreground">{item.country}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="h-5 w-px bg-border"></div>
                  <Input
                    id="mobile"
                    type="tel"
                    {...step2Form.register("mobile")}
                    placeholder={tIdentity("mobilePlaceholder")}
                    className="flex-1 h-full border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-3 shadow-none"
                  />
                </div>
              </div>
              {(step2Form.formState.errors.countryCode || step2Form.formState.errors.mobile) && (
                <p className="text-sm text-red-500">
                  {step2Form.formState.errors.countryCode?.message || step2Form.formState.errors.mobile?.message}
                </p>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">
                  {tIdentity("dateOfBirth")} <span className="text-red-500">{tIdentity("required")}</span>
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
                  {tIdentity("nationality")} <span className="text-red-500">{tIdentity("required")}</span>
                </Label>
                <Select
                  value={step2Form.watch("nationality") || ""}
                  onValueChange={(value) => step2Form.setValue("nationality", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={tIdentity("nationalityPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {step2Form.formState.errors.nationality && (
                  <p className="text-sm text-red-500">
                    {step2Form.formState.errors.nationality.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="countryOfResidence">
                {tIdentity("countryOfResidence")} <span className="text-red-500">{tIdentity("required")}</span>
              </Label>
              <Input
                id="countryOfResidence"
                {...step2Form.register("countryOfResidence")}
                placeholder={tIdentity("countryOfResidencePlaceholder")}
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
                  {tIdentity("taxResidency")} <span className="text-red-500">{tIdentity("required")}</span>
                </Label>
                <Input
                  id="taxCountry"
                  {...step2Form.register("taxCountry" as any)}
                  placeholder={tIdentity("taxResidencyPlaceholder")}
                />
                {(step2Form.formState.errors as any).taxCountry && (
                  <p className="text-sm text-red-500">
                    {(step2Form.formState.errors as any).taxCountry.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxId">{tIdentity("taxId")}</Label>
                <Input
                  id="taxId"
                  {...step2Form.register("taxId" as any)}
                  placeholder={tIdentity("taxIdPlaceholder")}
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
                {tIntent("title")}
              </h2>
              <p className="text-brand-grayMed">
                {tIntent("subtitle")}
              </p>
            </div>

            <div className="space-y-4">
              <Label>{tIntent("accountType")} <span className="text-red-500">{tIntent("required")}</span></Label>
              <RadioGroup
                defaultValue={step3Form.getValues("accountType")}
                onValueChange={(value) => step3Form.setValue("accountType", value as AccountType)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="current" id="current" />
                  <Label htmlFor="current" className="font-normal cursor-pointer">
                    {tIntent("currentAccount")}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="private_banking" id="private_banking" />
                  <Label htmlFor="private_banking" className="font-normal cursor-pointer">
                    {tIntent("privateBanking")}
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <Label>{tIntent("jurisdictions")} <span className="text-red-500">{tIntent("required")}</span></Label>
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
              <Label>{tIntent("currencies")} <span className="text-red-500">{tIntent("required")}</span></Label>
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
                {tIntent("estimatedMonthlyIncoming")}: €
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
                {tIntent("sourceOfFunds")} <span className="text-red-500">{tIntent("required")}</span>
              </Label>
              <Select
                value={step3Form.watch("sourceOfFunds")}
                onValueChange={(value) => step3Form.setValue("sourceOfFunds", value as SourceOfFunds)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={tIntent("sourceOfFundsPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="salary">{tIntent("sourceOptions.salary")}</SelectItem>
                  <SelectItem value="dividends">{tIntent("sourceOptions.dividends")}</SelectItem>
                  <SelectItem value="business_income">{tIntent("sourceOptions.businessIncome")}</SelectItem>
                  <SelectItem value="asset_sale">{tIntent("sourceOptions.assetSale")}</SelectItem>
                  <SelectItem value="savings">{tIntent("sourceOptions.savings")}</SelectItem>
                  <SelectItem value="other">{tIntent("sourceOptions.other")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {step3Form.watch("sourceOfFunds") === "other" && (
              <div className="space-y-2">
                <Label htmlFor="sourceOfFundsDetails">{tIntent("sourceOfFundsDetails")}</Label>
                <Input
                  id="sourceOfFundsDetails"
                  {...step3Form.register("sourceOfFundsDetails")}
                  placeholder={tIntent("sourceOfFundsDetailsPlaceholder")}
                />
              </div>
            )}

            <div className="space-y-4">
              <Label>{tIntent("pepLabel")}</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPEP"
                  checked={step3Form.watch("isPEP")}
                  onCheckedChange={(checked) => step3Form.setValue("isPEP", !!checked)}
                />
                <Label htmlFor="isPEP" className="font-normal cursor-pointer">
                  {tIntent("pepCheckbox")}
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
                {tEligibility("title")}
              </h2>
              <p className="text-brand-grayMed">
                {tEligibility("subtitle")}
              </p>
            </div>

            <div className="space-y-4">
              {/* Valid ID or Passport */}
              <div className="p-4 bg-brand-goldLight/10 rounded-lg space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-brand-gold mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-brand-dark">{tEligibility("validId")}</p>
                    <p className="text-sm text-brand-grayMed">{tEligibility("validIdDescription")}</p>
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
                    {uploadedDocuments.some(d => d.category === "id_document") ? tEligibility("uploaded") : tEligibility("uploadId")}
                  </Button>
                </div>
              </div>

              {/* Proof of Address */}
              <div className="p-4 bg-brand-goldLight/10 rounded-lg space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-brand-gold mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-brand-dark">{tEligibility("proofOfAddress")}</p>
                    <p className="text-sm text-brand-grayMed">{tEligibility("proofOfAddressDescription")}</p>
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
                    {uploadedDocuments.some(d => d.category === "proof_of_address") ? tEligibility("uploaded") : tEligibility("uploadProof")}
                  </Button>
                </div>
              </div>

              {/* Tax Identification Number */}
              <div className="p-4 bg-brand-goldLight/10 rounded-lg space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-brand-gold mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-brand-dark">{tEligibility("taxIdDocument")}</p>
                    <p className="text-sm text-brand-grayMed">{tEligibility("taxIdDocumentDescription")}</p>
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
                    {uploadedDocuments.some(d => d.category === "tax_id_document") ? tEligibility("uploaded") : tEligibility("uploadTaxId")}
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
                {tReview("title")}
              </h2>
              <p className="text-brand-grayMed">
                {tReview("subtitle")}
              </p>
            </div>

            {/* Summary */}
            <div className="space-y-4 p-6 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-brand-dark">{tReview("summaryTitle")}</h3>

              <div className="grid gap-4 text-sm">
                <div>
                  <p className="text-brand-grayMed">{tReview("name")}</p>
                  <p className="font-medium text-brand-dark">
                    {formData.identity?.firstName} {formData.identity?.lastName}
                  </p>
                </div>

                <div>
                  <p className="text-brand-grayMed">{tReview("email")}</p>
                  <p className="font-medium text-brand-dark">{formData.identity?.email}</p>
                </div>

                <div>
                  <p className="text-brand-grayMed">{tReview("mobile")}</p>
                  <p className="font-medium text-brand-dark">{formData.identity?.mobile}</p>
                </div>

                <div>
                  <p className="text-brand-grayMed">{tReview("accountType")}</p>
                  <p className="font-medium text-brand-dark capitalize">
                    {formData.intent?.accountType?.replace("_", " ")}
                  </p>
                </div>

                <div>
                  <p className="text-brand-grayMed">{tReview("preferredJurisdictions")}</p>
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
                  <span className="text-red-500">*</span> {tReview("dataProcessingConsent")}
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
                  <span className="text-red-500">*</span> {tReview("dataSharingConsent")}
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
                  {tReview("marketingOptIn")}
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
                {tSubmission("title")}
              </h2>
              <p className="text-lg text-brand-grayMed max-w-2xl mx-auto mb-6">
                {tSubmission("message")}
              </p>
            </div>

            <div className="p-8 bg-gradient-to-br from-brand-goldLight/20 to-brand-gold/10 rounded-2xl border-2 border-brand-gold/30 max-w-md mx-auto">
              <p className="text-sm text-brand-grayMed mb-3 font-semibold uppercase tracking-wide">
                {tSubmission("applicationNumberLabel")}
              </p>
              <div className="text-3xl font-bold text-brand-dark mb-2 font-mono tracking-tight">
                {applicationId}
              </div>
              <p className="text-sm text-brand-grayMed">
                {tSubmission("saveNumberMessage")}
              </p>
            </div>

            <div className="p-6 bg-blue-50 rounded-lg border border-blue-200 max-w-2xl mx-auto text-left">
              <h3 className="font-semibold text-brand-dark mb-3">{tSubmission("nextStepsTitle")}</h3>
              <ul className="space-y-2 text-sm text-brand-grayMed">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>{tSubmission("nextStep1")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>{tSubmission("nextStep2")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>{tSubmission("nextStep3")}</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-4 max-w-md mx-auto mt-8">
              <Button variant="outline" size="lg" asChild>
                <a href={`/${locale}`}>
                  {tSubmission("backToHomepage")}
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
