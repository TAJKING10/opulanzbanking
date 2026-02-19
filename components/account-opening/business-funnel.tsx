/**
 * Business Account Opening Funnel
 * Multi-step wizard for business account applications
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
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FormStepper, Step } from "./form-stepper";
import { ArrowLeft, ArrowRight, CheckCircle, Loader2, Plus, Trash2, Clock, FileText, Upload, X } from "lucide-react";
import type {
  BusinessApplication,
  PersonalIdentity,
  CompanyInfo,
  BusinessIntent,
  DirectorOrUBO,
  BusinessConsents,
} from "@/types/account-opening";
// Removed: import { generateReferralRouting, saveReferralEntry, getPartnerDisplayName } from "@/lib/referral-routing";

interface BusinessFunnelProps {
  onSwitchMode: () => void;
  locale: string;
}

export function BusinessFunnel({ onSwitchMode, locale }: BusinessFunnelProps) {
  const t = useTranslations("common");
  const tSteps = useTranslations("accountOpening.business.businessFunnel.steps");
  const tWelcome = useTranslations("accountOpening.business.businessFunnel.welcome");
  const tCompany = useTranslations("accountOpening.business.businessFunnel.company");
  const tContact = useTranslations("accountOpening.business.businessFunnel.contact");
  const tIntent = useTranslations("accountOpening.business.businessFunnel.intent");
  const tDirectors = useTranslations("accountOpening.business.businessFunnel.directors");
  const tReview = useTranslations("accountOpening.business.businessFunnel.review");
  const tSubmission = useTranslations("accountOpening.business.businessFunnel.submission");

  const STEPS: Step[] = [
    { id: "welcome", label: tSteps("welcome.label"), shortLabel: tSteps("welcome.shortLabel") },
    { id: "company", label: tSteps("company.label"), shortLabel: tSteps("company.shortLabel") },
    { id: "contact", label: tSteps("contact.label"), shortLabel: tSteps("contact.shortLabel") },
    { id: "intent", label: tSteps("intent.label"), shortLabel: tSteps("intent.shortLabel") },
    { id: "directors", label: tSteps("directors.label"), shortLabel: tSteps("directors.shortLabel") },
    { id: "review", label: tSteps("review.label"), shortLabel: tSteps("review.shortLabel") },
    { id: "submission", label: tSteps("submission.label"), shortLabel: tSteps("submission.shortLabel") },
  ];

  const [currentStep, setCurrentStep] = React.useState(1);
  const [formData, setFormData] = React.useState<Partial<BusinessApplication>>({});
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

  const [directors, setDirectors] = React.useState<DirectorOrUBO[]>([]);

  // Company Status Form
  const companySchema = z.object({
    status: z.enum(["existing", "new"]),
    countryOfIncorporation: z.string().optional(),
    companyName: z.string().optional(),
    registrationNumber: z.string().optional(),
    legalForm: z.string().optional(),
    website: z.string().optional(),
  });

  const companyForm = useForm({
    resolver: zodResolver(companySchema),
    defaultValues: formData.company || { status: "existing" },
  });

  // Contact Person Form (same as personal identity)
  const contactSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    countryCode: z.string().min(1, "Country code is required"),
    mobile: z.string().min(10, "Invalid phone number"),
    countryOfResidence: z.string().min(1, "Country is required"),
    taxCountry: z.string().min(1, "Tax residency is required"),
    taxId: z.string().optional(),
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    nationality: z.string().min(1, "Nationality is required"),
  });

  const contactForm = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: formData.contactPerson || {},
  });

  // Business Intent Form
  const intentSchema = z.object({
    jurisdictions: z.array(z.string()).min(1, "Select at least one jurisdiction"),
    businessActivity: z.string().min(1, "Business activity is required"),
    expectedMonthlyVolume: z.number().min(0),
    averageTicketSize: z.number().min(0),
    currencies: z.array(z.string()).min(1, "Select at least one currency"),
  });

  const intentForm = useForm({
    resolver: zodResolver(intentSchema),
    defaultValues: {
      jurisdictions: [],
      businessActivity: "",
      expectedMonthlyVolume: 50000,
      averageTicketSize: 5000,
      currencies: [],
      ...formData.intent,
    },
  });

  // Consents Form
  const consentsSchema = z.object({
    dataProcessing: z.boolean().refine((val) => val === true, "Required"),
    dataSharing: z.boolean().refine((val) => val === true, "Required"),
    authorizedRepresentative: z.boolean().refine((val) => val === true, "Required"),
    marketingOptIn: z.boolean(),
  });

  const consentsForm = useForm({
    resolver: zodResolver(consentsSchema),
    defaultValues: {
      dataProcessing: false,
      dataSharing: false,
      authorizedRepresentative: false,
      marketingOptIn: false,
      ...formData.consents,
    },
  });

  const handleNext = async () => {
    let isValid = true;

    if (currentStep === 2) {
      isValid = await companyForm.trigger();
      if (isValid) {
        const values = companyForm.getValues();
        const company: CompanyInfo = values;
        setFormData((prev) => ({ ...prev, company }));
      }
    }

    if (currentStep === 3) {
      isValid = await contactForm.trigger();
      if (isValid) {
        const values = contactForm.getValues();
        const contactPerson: PersonalIdentity = {
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
        setFormData((prev) => ({ ...prev, contactPerson }));
      }
    }

    if (currentStep === 4) {
      isValid = await intentForm.trigger();
      if (isValid) {
        const values = intentForm.getValues();
        const intent: BusinessIntent = values as any;
        setFormData((prev) => ({ ...prev, intent }));
      }
    }

    if (currentStep === 5) {
      // Directors validation (at least one)
      if (directors.length === 0) {
        alert(tDirectors("atLeastOneRequired"));
        return;
      }
      setFormData((prev) => ({ ...prev, directorsAndUBOs: directors }));
    }

    if (currentStep === 6) {
      isValid = await consentsForm.trigger();
      if (isValid) {
        const values = consentsForm.getValues();
        const consents: BusinessConsents = values;
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
      const appId = `OPL-BA-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

      const application: BusinessApplication = {
        userRef: crypto.randomUUID(),
        mode: "business",
        contactPerson: formData.contactPerson!,
        company: formData.company!,
        intent: formData.intent!,
        directorsAndUBOs: formData.directorsAndUBOs!,
        consents: formData.consents!,
        createdAt: new Date().toISOString(),
      };

      // Save application to localStorage with unique ID
      const applications = JSON.parse(localStorage.getItem("opulanz_applications") || "[]");
      applications.push({
        id: appId,
        type: "business",
        application,
        documents: uploadedDocuments,
        submittedAt: new Date().toISOString(),
      });
      localStorage.setItem("opulanz_applications", JSON.stringify(applications));

      // Store application ID for display
      setApplicationId(appId);

      setCurrentStep(7);
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addDirector = () => {
    setDirectors([
      ...directors,
      {
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        nationality: "",
        residencyCountry: "",
        role: "director",
      },
    ]);
  };

  const removeDirector = (index: number) => {
    setDirectors(directors.filter((_, i) => i !== index));
  };

  const updateDirector = (index: number, field: keyof DirectorOrUBO, value: any) => {
    const updated = [...directors];
    updated[index] = { ...updated[index], [field]: value };
    setDirectors(updated);
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-6">
      <FormStepper steps={STEPS} currentStep={currentStep} className="mb-12" />

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
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gold text-white text-sm font-bold flex-shrink-0">1</div>
                  <div className="flex-1">
                    <div className="font-semibold text-brand-dark">{tWelcome("timeline.step1.title")}</div>
                    <div className="text-sm text-brand-grayMed">{tWelcome("timeline.step1.description")}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gold text-white text-sm font-bold flex-shrink-0">2</div>
                  <div className="flex-1">
                    <div className="font-semibold text-brand-dark">{tWelcome("timeline.step2.title")}</div>
                    <div className="text-sm text-brand-grayMed">{tWelcome("timeline.step2.description")}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gold text-white text-sm font-bold flex-shrink-0">3</div>
                  <div className="flex-1">
                    <div className="font-semibold text-brand-dark">{tWelcome("timeline.step3.title")}</div>
                    <div className="text-sm text-brand-grayMed">{tWelcome("timeline.step3.description")}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gold text-white text-sm font-bold flex-shrink-0">4</div>
                  <div className="flex-1">
                    <div className="font-semibold text-brand-dark">{tWelcome("timeline.step4.title")}</div>
                    <div className="text-sm text-brand-grayMed">{tWelcome("timeline.step4.description")}</div>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-brand-gold/20">
                <p className="text-sm text-brand-dark">
                  <strong>{tWelcome("timeline.totalTime")}</strong>
                </p>
                <p className="text-xs text-brand-grayMed mt-1">
                  {tWelcome("timeline.note")}
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
                <ul className="space-y-2 text-sm text-brand-dark">
                  <li className="flex items-start gap-2">
                    <span className="text-brand-gold">✓</span>
                    <span>{tWelcome("eligibility.requirement1")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-gold">✓</span>
                    <span>{tWelcome("eligibility.requirement2")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-gold">✓</span>
                    <span>{tWelcome("eligibility.requirement3")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-gold">✓</span>
                    <span>{tWelcome("eligibility.requirement4")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-gold">✓</span>
                    <span>{tWelcome("eligibility.requirement5")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-gold">✓</span>
                    <span>{tWelcome("eligibility.requirement6")}</span>
                  </li>
                </ul>
              </div>

              <div className="border border-brand-grayLight rounded-xl p-6">
                <h3 className="text-lg font-bold text-brand-dark mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-brand-gold" />
                  {tWelcome("documents.title")}
                </h3>
                <ul className="space-y-2 text-sm text-brand-dark">
                  <li className="flex items-start gap-2">
                    <span className="text-brand-gold">✓</span>
                    <span>{tWelcome("documents.document1")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-gold">✓</span>
                    <span>{tWelcome("documents.document2")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-gold">✓</span>
                    <span>{tWelcome("documents.document3")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-gold">✓</span>
                    <span>{tWelcome("documents.document4")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-gold">✓</span>
                    <span>{tWelcome("documents.document5")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-gold">✓</span>
                    <span>{tWelcome("documents.document6")}</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* How It Works */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-brand-dark mb-4">{tWelcome("howItWorks.title")}</h3>
              <div className="space-y-4 text-sm text-brand-grayMed">
                <p>
                  <strong className="text-brand-dark">{tWelcome("howItWorks.smartRouting.title")}</strong> {tWelcome("howItWorks.smartRouting.description")}
                </p>
                <p>
                  <strong className="text-brand-dark">{tWelcome("howItWorks.priorityProcessing.title")}</strong> {tWelcome("howItWorks.priorityProcessing.description")}
                </p>
                <p>
                  <strong className="text-brand-dark">{tWelcome("howItWorks.enhancedDueDiligence.title")}</strong> {tWelcome("howItWorks.enhancedDueDiligence.description")}
                </p>
                <p>
                  <strong className="text-brand-dark">{tWelcome("howItWorks.noObligation.title")}</strong> {tWelcome("howItWorks.noObligation.description")}
                </p>
              </div>
            </div>

            {/* Account Features */}
            <div className="border-2 border-brand-gold/30 rounded-xl p-6 bg-gradient-to-br from-brand-goldLight/5 to-transparent">
              <h3 className="text-lg font-bold text-brand-dark mb-4">{tWelcome("features.title")}</h3>
              <div className="grid sm:grid-cols-2 gap-3 text-sm text-brand-dark">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-brand-gold flex-shrink-0 mt-0.5" />
                  <span>{tWelcome("features.feature1")}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-brand-gold flex-shrink-0 mt-0.5" />
                  <span>{tWelcome("features.feature2")}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-brand-gold flex-shrink-0 mt-0.5" />
                  <span>{tWelcome("features.feature3")}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-brand-gold flex-shrink-0 mt-0.5" />
                  <span>{tWelcome("features.feature4")}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-brand-gold flex-shrink-0 mt-0.5" />
                  <span>{tWelcome("features.feature5")}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-brand-gold flex-shrink-0 mt-0.5" />
                  <span>{tWelcome("features.feature6")}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 max-w-md mx-auto mt-8">
              <Button size="lg" onClick={handleNext}>
                {tWelcome("startButton")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Company Status */}
        {currentStep === 2 && (
          <form className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-brand-dark mb-2">
                {tCompany("title")}
              </h2>
              <p className="text-brand-grayMed">
                {tCompany("subtitle")}
              </p>
            </div>

            <RadioGroup
              value={companyForm.watch("status")}
              onValueChange={(value) => companyForm.setValue("status", value as "existing" | "new")}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="existing" id="existing" />
                <Label htmlFor="existing" className="font-normal cursor-pointer">
                  {tCompany("existingCompany")}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="new" id="new" />
                <Label htmlFor="new" className="font-normal cursor-pointer">
                  {tCompany("newCompany")}
                </Label>
              </div>
            </RadioGroup>

            {companyForm.watch("status") === "existing" && (
              <div className="space-y-6 mt-6 p-6 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="companyName">{tCompany("companyName")}</Label>
                  <Input
                    id="companyName"
                    {...companyForm.register("companyName")}
                    placeholder="Acme Corp S.à r.l."
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="countryOfIncorporation">{tCompany("countryOfIncorporation")}</Label>
                    <Input
                      id="countryOfIncorporation"
                      {...companyForm.register("countryOfIncorporation")}
                      placeholder="Luxembourg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="registrationNumber">{tCompany("registrationNumber")}</Label>
                    <Input
                      id="registrationNumber"
                      {...companyForm.register("registrationNumber")}
                      placeholder="B123456"
                    />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="legalForm">{tCompany("legalForm")}</Label>
                    <Input
                      id="legalForm"
                      {...companyForm.register("legalForm")}
                      placeholder="S.à r.l., SA, etc."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">{tCompany("website")}</Label>
                    <Input
                      id="website"
                      type="url"
                      {...companyForm.register("website")}
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
              </div>
            )}

            {companyForm.watch("status") === "new" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <p className="text-blue-900 mb-4">
                  {tCompany("formationService.description")}
                </p>
                <ul className="space-y-2 text-sm text-blue-800 mb-4">
                  <li>• {tCompany("formationService.item1")}</li>
                  <li>• {tCompany("formationService.item2")}</li>
                  <li>• {tCompany("formationService.item3")}</li>
                  <li>• {tCompany("formationService.item4")}</li>
                </ul>
                <Button variant="outline" size="sm" asChild>
                  <a href={`/${locale}/company-formation`} target="_blank">
                    {tCompany("formationService.learnMore")}
                  </a>
                </Button>
              </div>
            )}
          </form>
        )}

        {/* Step 3: Contact Person (same fields as personal identity) */}
        {currentStep === 3 && (
          <form className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-brand-dark mb-2">
                {tContact("title")}
              </h2>
              <p className="text-brand-grayMed">
                {tContact("subtitle")}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  {tContact("firstName")} <span className="text-red-500">{tContact("required")}</span>
                </Label>
                <Input id="firstName" {...contactForm.register("firstName")} />
                {contactForm.formState.errors.firstName && (
                  <p className="text-sm text-red-500">
                    {contactForm.formState.errors.firstName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">
                  {tContact("lastName")} <span className="text-red-500">{tContact("required")}</span>
                </Label>
                <Input id="lastName" {...contactForm.register("lastName")} />
                {contactForm.formState.errors.lastName && (
                  <p className="text-sm text-red-500">
                    {contactForm.formState.errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                {tContact("email")} <span className="text-red-500">{tContact("required")}</span>
              </Label>
              <Input id="email" type="email" {...contactForm.register("email")} />
              {contactForm.formState.errors.email && (
                <p className="text-sm text-red-500">
                  {contactForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile">
                {tContact("mobile")} <span className="text-red-500">{tContact("required")}</span>
              </Label>
              <Input id="mobile" type="tel" {...contactForm.register("mobile")} />
              {contactForm.formState.errors.mobile && (
                <p className="text-sm text-red-500">
                  {contactForm.formState.errors.mobile.message}
                </p>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">
                  {tContact("dateOfBirth")} <span className="text-red-500">{tContact("required")}</span>
                </Label>
                <Input id="dateOfBirth" type="date" {...contactForm.register("dateOfBirth")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nationality">
                  {tContact("nationality")} <span className="text-red-500">{tContact("required")}</span>
                </Label>
                <Input id="nationality" {...contactForm.register("nationality")} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="countryOfResidence">
                {tContact("countryOfResidence")} <span className="text-red-500">{tContact("required")}</span>
              </Label>
              <Input id="countryOfResidence" {...contactForm.register("countryOfResidence")} />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="taxCountry">
                  {tContact("taxResidency")} <span className="text-red-500">{tContact("required")}</span>
                </Label>
                <Input id="taxCountry" {...contactForm.register("taxCountry" as any)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxId">{tContact("taxId")}</Label>
                <Input id="taxId" {...contactForm.register("taxId" as any)} />
              </div>
            </div>
          </form>
        )}

        {/* Step 4: Business Intent */}
        {currentStep === 4 && (
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
              <Label>{tIntent("jurisdictions")} <span className="text-red-500">{tIntent("required")}</span></Label>
              <div className="grid grid-cols-2 gap-4">
                {["Luxembourg", "France", "Finland", "Other EEA"].map((jur) => (
                  <div key={jur} className="flex items-center space-x-2">
                    <Checkbox
                      id={jur}
                      checked={intentForm.watch("jurisdictions" as any)?.includes(jur.toLowerCase().replace(" ", "_"))}
                      onCheckedChange={(checked) => {
                        const current = intentForm.getValues("jurisdictions") || [];
                        const value = jur.toLowerCase().replace(" ", "_");
                        if (checked) {
                          intentForm.setValue("jurisdictions" as any, [...current, value]);
                        } else {
                          intentForm.setValue("jurisdictions" as any, current.filter((j) => j !== value));
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

            <div className="space-y-2">
              <Label htmlFor="businessActivity">
                {tIntent("businessActivity")} <span className="text-red-500">{tIntent("required")}</span>
              </Label>
              <Input
                id="businessActivity"
                {...intentForm.register("businessActivity")}
                placeholder={tIntent("businessActivityPlaceholder")}
              />
              {intentForm.formState.errors.businessActivity && (
                <p className="text-sm text-red-500">
                  {intentForm.formState.errors.businessActivity.message}
                </p>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="expectedMonthlyVolume">
                  {tIntent("expectedMonthlyVolume")}
                </Label>
                <Input
                  id="expectedMonthlyVolume"
                  type="number"
                  {...intentForm.register("expectedMonthlyVolume", { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="averageTicketSize">
                  {tIntent("averageTicketSize")}
                </Label>
                <Input
                  id="averageTicketSize"
                  type="number"
                  {...intentForm.register("averageTicketSize", { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label>{tIntent("currencies")} <span className="text-red-500">{tIntent("required")}</span></Label>
              <div className="grid grid-cols-2 gap-4">
                {["EUR", "USD", "GBP", "Other"].map((curr) => (
                  <div key={curr} className="flex items-center space-x-2">
                    <Checkbox
                      id={curr}
                      checked={intentForm.watch("currencies" as any)?.includes(curr)}
                      onCheckedChange={(checked) => {
                        const current = intentForm.getValues("currencies") || [];
                        if (checked) {
                          intentForm.setValue("currencies" as any, [...current, curr]);
                        } else {
                          intentForm.setValue("currencies" as any, current.filter((c) => c !== curr));
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

            {/* Document Upload Section */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-brand-dark mb-2">{tIntent("supportingDocuments.title")}</h3>
                <p className="text-sm text-brand-grayMed mb-4">
                  {tIntent("supportingDocuments.subtitle")}
                </p>
              </div>

              {/* Company Registration Certificate */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {tIntent("supportingDocuments.companyCertificate")} <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload(e, "company_registration")}
                    className="hidden"
                    id="company-registration-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById("company-registration-upload")?.click()}
                    className="w-full sm:w-auto"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {tIntent("supportingDocuments.uploadCertificate")}
                  </Button>
                </div>
              </div>

              {/* Articles of Association */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {tIntent("supportingDocuments.articles")} <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload(e, "articles_of_association")}
                    className="hidden"
                    id="articles-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById("articles-upload")?.click()}
                    className="w-full sm:w-auto"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {tIntent("supportingDocuments.uploadArticles")}
                  </Button>
                </div>
              </div>

              {/* Shareholder Register */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {tIntent("supportingDocuments.shareholderRegister")} <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload(e, "shareholder_register")}
                    className="hidden"
                    id="shareholder-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById("shareholder-upload")?.click()}
                    className="w-full sm:w-auto"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {tIntent("supportingDocuments.uploadShareholder")}
                  </Button>
                </div>
              </div>

              {/* Business Plan */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {tIntent("supportingDocuments.businessPlan")}
                  <span className="text-xs text-brand-grayMed font-normal">{tIntent("supportingDocuments.recommended")}</span>
                </Label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload(e, "business_plan")}
                    className="hidden"
                    id="business-plan-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById("business-plan-upload")?.click()}
                    className="w-full sm:w-auto"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {tIntent("supportingDocuments.uploadBusinessPlan")}
                  </Button>
                </div>
              </div>

              {/* Financial Statements */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {tIntent("supportingDocuments.financialStatements")}
                  <span className="text-xs text-brand-grayMed font-normal">{tIntent("supportingDocuments.ifExisting")}</span>
                </Label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload(e, "financial_statements")}
                    className="hidden"
                    id="financial-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById("financial-upload")?.click()}
                    className="w-full sm:w-auto"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {tIntent("supportingDocuments.uploadFinancial")}
                  </Button>
                </div>
              </div>

              {/* Uploaded Documents List */}
              {uploadedDocuments.length > 0 && (
                <div className="space-y-2 pt-4">
                  <Label>{tIntent("supportingDocuments.uploadedDocuments", { count: uploadedDocuments.length })}</Label>
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

              <p className="text-xs text-brand-grayMed">
                {tIntent("supportingDocuments.fileRequirements")}
              </p>
            </div>
          </form>
        )}

        {/* Step 5: Directors & UBOs */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-brand-dark mb-2">
                {tDirectors("title")}
              </h2>
              <p className="text-brand-grayMed">
                {tDirectors("subtitle")}
              </p>
            </div>

            <div className="space-y-4">
              {directors.map((director, index) => (
                <div key={index} className="p-6 bg-gray-50 rounded-lg space-y-4 relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-4 right-4"
                    onClick={() => removeDirector(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>

                  <h4 className="font-semibold text-brand-dark">{tDirectors("personLabel", { index: index + 1 })}</h4>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>{tDirectors("firstName")}</Label>
                      <Input
                        value={director.firstName}
                        onChange={(e) => updateDirector(index, "firstName", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{tDirectors("lastName")}</Label>
                      <Input
                        value={director.lastName}
                        onChange={(e) => updateDirector(index, "lastName", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>{tDirectors("dateOfBirth")}</Label>
                      <Input
                        type="date"
                        value={director.dateOfBirth}
                        onChange={(e) => updateDirector(index, "dateOfBirth", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{tDirectors("nationality")}</Label>
                      <Input
                        value={director.nationality}
                        onChange={(e) => updateDirector(index, "nationality", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{tDirectors("residency")}</Label>
                      <Input
                        value={director.residencyCountry}
                        onChange={(e) => updateDirector(index, "residencyCountry", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>{tDirectors("role")}</Label>
                      <RadioGroup
                        value={director.role}
                        onValueChange={(value) => updateDirector(index, "role", value)}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="director" id={`director-${index}`} />
                          <Label htmlFor={`director-${index}`} className="font-normal">
                            {tDirectors("directorRole")}
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="ubo" id={`ubo-${index}`} />
                          <Label htmlFor={`ubo-${index}`} className="font-normal">
                            {tDirectors("uboRole")}
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="both" id={`both-${index}`} />
                          <Label htmlFor={`both-${index}`} className="font-normal">
                            {tDirectors("bothRole")}
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {(director.role === "ubo" || director.role === "both") && (
                      <div className="space-y-2">
                        <Label>{tDirectors("ownershipPercent")}</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={director.ownershipPercentage || ""}
                          onChange={(e) =>
                            updateDirector(index, "ownershipPercentage", Number(e.target.value))
                          }
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <Button variant="outline" onClick={addDirector} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                {tDirectors("addDirector")}
              </Button>
            </div>
          </div>
        )}

        {/* Step 6: Review & Consents */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-brand-dark mb-2">
                {tReview("title")}
              </h2>
              <p className="text-brand-grayMed">
                {tReview("subtitle")}
              </p>
            </div>

            <div className="space-y-4 p-6 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-brand-dark">{tReview("summaryTitle")}</h3>

              <div className="grid gap-4 text-sm">
                <div>
                  <p className="text-brand-grayMed">{tReview("company")}</p>
                  <p className="font-medium text-brand-dark">
                    {formData.company?.companyName || tReview("newCompany")}
                  </p>
                </div>

                <div>
                  <p className="text-brand-grayMed">{tReview("contactPerson")}</p>
                  <p className="font-medium text-brand-dark">
                    {formData.contactPerson?.firstName} {formData.contactPerson?.lastName}
                  </p>
                </div>

                <div>
                  <p className="text-brand-grayMed">{tReview("businessActivity")}</p>
                  <p className="font-medium text-brand-dark">
                    {formData.intent?.businessActivity}
                  </p>
                </div>

                <div>
                  <p className="text-brand-grayMed">{tReview("directorsUbos")}</p>
                  <p className="font-medium text-brand-dark">
                    {tReview("personsCount", { count: formData.directorsAndUBOs?.length || 0 })}
                  </p>
                </div>
              </div>
            </div>

            <form className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="dataProcessing"
                  checked={consentsForm.watch("dataProcessing")}
                  onCheckedChange={(checked) =>
                    consentsForm.setValue("dataProcessing", !!checked)
                  }
                />
                <Label htmlFor="dataProcessing" className="font-normal cursor-pointer leading-tight">
                  <span className="text-red-500">*</span> {tReview("dataProcessingConsent")}
                </Label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="dataSharing"
                  checked={consentsForm.watch("dataSharing")}
                  onCheckedChange={(checked) => consentsForm.setValue("dataSharing", !!checked)}
                />
                <Label htmlFor="dataSharing" className="font-normal cursor-pointer leading-tight">
                  <span className="text-red-500">*</span> {tReview("dataSharingConsent")}
                </Label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="authorizedRepresentative"
                  checked={consentsForm.watch("authorizedRepresentative")}
                  onCheckedChange={(checked) =>
                    consentsForm.setValue("authorizedRepresentative", !!checked)
                  }
                />
                <Label htmlFor="authorizedRepresentative" className="font-normal cursor-pointer leading-tight">
                  <span className="text-red-500">*</span> {tReview("authorizedRepresentativeConsent")}
                </Label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="marketingOptIn"
                  checked={consentsForm.watch("marketingOptIn")}
                  onCheckedChange={(checked) =>
                    consentsForm.setValue("marketingOptIn", !!checked)
                  }
                />
                <Label htmlFor="marketingOptIn" className="font-normal cursor-pointer leading-tight">
                  {tReview("marketingOptIn")}
                </Label>
              </div>
            </form>
          </div>
        )}

        {/* Step 7: Submission */}
        {currentStep === 7 && (
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
                <a href={`/${locale}`}>{tSubmission("backToHomepage")}</a>
              </Button>
              <Button variant="outline" size="lg" onClick={onSwitchMode}>
                {tSubmission("startPersonalApplication")}
              </Button>
            </div>
          </div>
        )}

        {/* Navigation */}
        {currentStep > 1 && currentStep < 7 && (
          <div className="flex items-center justify-between gap-4 mt-8 pt-8 border-t">
            <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
              <ArrowLeft className="mr-2 h-5 w-5" />
              {t("back")}
            </Button>

            {currentStep < 6 && (
              <Button onClick={handleNext} disabled={isSubmitting}>
                {t("next")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            )}

            {currentStep === 6 && (
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {t("submitting")}
                  </>
                ) : (
                  <>
                    {t("submitApplication")}
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
