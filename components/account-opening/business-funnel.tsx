/**
 * Business Account Opening Funnel
 * Multi-step wizard for business account applications
 */

"use client";

import * as React from "react";
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

const STEPS: Step[] = [
  { id: "welcome", label: "Welcome", shortLabel: "Welcome" },
  { id: "company", label: "Company Status", shortLabel: "Company" },
  { id: "contact", label: "Contact Person", shortLabel: "Contact" },
  { id: "intent", label: "Business Intent", shortLabel: "Intent" },
  { id: "directors", label: "Directors & UBOs", shortLabel: "Directors" },
  { id: "review", label: "Review & Consents", shortLabel: "Review" },
  { id: "submission", label: "Submission", shortLabel: "Submit" },
];

interface BusinessFunnelProps {
  onSwitchMode: () => void;
  locale: string;
}

export function BusinessFunnel({ onSwitchMode, locale }: BusinessFunnelProps) {
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
        alert("Please add at least one director or UBO");
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
                Open Your Business Account
              </h2>
              <p className="text-lg text-brand-grayMed max-w-2xl mx-auto">
                Tell us about your company, and we'll guide you through the right setup with an Opulanz partner bank.
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
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gold text-white text-sm font-bold flex-shrink-0">1</div>
                  <div className="flex-1">
                    <div className="font-semibold text-brand-dark">Application Submission</div>
                    <div className="text-sm text-brand-grayMed">Complete the online form (15-20 minutes)</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gold text-white text-sm font-bold flex-shrink-0">2</div>
                  <div className="flex-1">
                    <div className="font-semibold text-brand-dark">Document Review</div>
                    <div className="text-sm text-brand-grayMed">Partner bank reviews company documents and UBO information (2-5 business days)</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gold text-white text-sm font-bold flex-shrink-0">3</div>
                  <div className="flex-1">
                    <div className="font-semibold text-brand-dark">KYC & Compliance</div>
                    <div className="text-sm text-brand-grayMed">Enhanced due diligence for business accounts (3-7 business days)</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gold text-white text-sm font-bold flex-shrink-0">4</div>
                  <div className="flex-1">
                    <div className="font-semibold text-brand-dark">Account Activation</div>
                    <div className="text-sm text-brand-grayMed">Receive IBAN, credentials, and corporate cards (2-3 business days)</div>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-brand-gold/20">
                <p className="text-sm text-brand-dark">
                  <strong>Total estimated time: 7-15 business days</strong>
                </p>
                <p className="text-xs text-brand-grayMed mt-1">
                  Timeline may vary based on company structure complexity and document completeness
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
                <ul className="space-y-2 text-sm text-brand-dark">
                  <li className="flex items-start gap-2">
                    <span className="text-brand-gold">✓</span>
                    <span>Company registered in EU/EEA or select jurisdictions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-gold">✓</span>
                    <span>Valid company registration documents</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-gold">✓</span>
                    <span>Articles of association or equivalent</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-gold">✓</span>
                    <span>UBO declaration (Ultimate Beneficial Owners)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-gold">✓</span>
                    <span>All directors/signatories have valid ID</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-gold">✓</span>
                    <span>Company tax identification number</span>
                  </li>
                </ul>
              </div>

              <div className="border border-brand-grayLight rounded-xl p-6">
                <h3 className="text-lg font-bold text-brand-dark mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-brand-gold" />
                  Required Documents
                </h3>
                <ul className="space-y-2 text-sm text-brand-dark">
                  <li className="flex items-start gap-2">
                    <span className="text-brand-gold">✓</span>
                    <span>Certificate of incorporation (dated within 3 months)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-gold">✓</span>
                    <span>Articles of association / company bylaws</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-gold">✓</span>
                    <span>Register of directors and shareholders</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-gold">✓</span>
                    <span>ID/passport for all directors and UBOs ({'>'}25% ownership)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-gold">✓</span>
                    <span>Proof of business address (utility bill, lease)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-gold">✓</span>
                    <span>Business plan or activity description</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* How It Works */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-brand-dark mb-4">How It Works</h3>
              <div className="space-y-4 text-sm text-brand-grayMed">
                <p>
                  <strong className="text-brand-dark">Smart Routing:</strong> Based on your company's jurisdiction, industry, and banking needs, we automatically route your application to the most suitable Opulanz partner bank.
                </p>
                <p>
                  <strong className="text-brand-dark">Priority Processing:</strong> Your application includes a secure signed referral code from Opulanz, ensuring expedited review and preferential commercial terms from our partner banks.
                </p>
                <p>
                  <strong className="text-brand-dark">Enhanced Due Diligence:</strong> Business accounts undergo comprehensive KYC/AML screening including UBO verification, business activity assessment, and source of funds validation to ensure full regulatory compliance.
                </p>
                <p>
                  <strong className="text-brand-dark">No Obligation:</strong> Submitting this application does not commit you to opening an account. You'll receive final terms and can decide whether to proceed after partner bank approval.
                </p>
              </div>
            </div>

            {/* Account Features */}
            <div className="border-2 border-brand-gold/30 rounded-xl p-6 bg-gradient-to-br from-brand-goldLight/5 to-transparent">
              <h3 className="text-lg font-bold text-brand-dark mb-4">Business Account Features</h3>
              <div className="grid sm:grid-cols-2 gap-3 text-sm text-brand-dark">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-brand-gold flex-shrink-0 mt-0.5" />
                  <span>Dedicated business IBAN in EUR</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-brand-gold flex-shrink-0 mt-0.5" />
                  <span>SEPA transfers and SWIFT payments</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-brand-gold flex-shrink-0 mt-0.5" />
                  <span>Corporate debit/credit cards</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-brand-gold flex-shrink-0 mt-0.5" />
                  <span>Multi-user access with permissions</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-brand-gold flex-shrink-0 mt-0.5" />
                  <span>Accounting software integration</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-brand-gold flex-shrink-0 mt-0.5" />
                  <span>Dedicated business support</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 max-w-md mx-auto mt-8">
              <Button size="lg" onClick={handleNext}>
                Start Business Application
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
                Company Status
              </h2>
              <p className="text-brand-grayMed">
                Do you have an existing company or need to create one?
              </p>
            </div>

            <RadioGroup
              value={companyForm.watch("status")}
              onValueChange={(value) => companyForm.setValue("status", value as "existing" | "new")}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="existing" id="existing" />
                <Label htmlFor="existing" className="font-normal cursor-pointer">
                  I already have a company
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="new" id="new" />
                <Label htmlFor="new" className="font-normal cursor-pointer">
                  I need to create a company
                </Label>
              </div>
            </RadioGroup>

            {companyForm.watch("status") === "existing" && (
              <div className="space-y-6 mt-6 p-6 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    {...companyForm.register("companyName")}
                    placeholder="Acme Corp S.à r.l."
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="countryOfIncorporation">Country of Incorporation</Label>
                    <Input
                      id="countryOfIncorporation"
                      {...companyForm.register("countryOfIncorporation")}
                      placeholder="Luxembourg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="registrationNumber">Registration Number</Label>
                    <Input
                      id="registrationNumber"
                      {...companyForm.register("registrationNumber")}
                      placeholder="B123456"
                    />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="legalForm">Legal Form</Label>
                    <Input
                      id="legalForm"
                      {...companyForm.register("legalForm")}
                      placeholder="S.à r.l., SA, etc."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website (optional)</Label>
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
                  We can help you incorporate your company in Luxembourg or other jurisdictions. Our company formation service includes:
                </p>
                <ul className="space-y-2 text-sm text-blue-800 mb-4">
                  <li>• Legal structure consultation</li>
                  <li>• Company registration and filing</li>
                  <li>• Registered office address</li>
                  <li>• Bank account setup</li>
                </ul>
                <Button variant="outline" size="sm" asChild>
                  <a href={`/${locale}/company-formation`} target="_blank">
                    Learn More About Company Formation
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
                Contact Person
              </h2>
              <p className="text-brand-grayMed">
                Who will be the main contact for this application?
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  First Name <span className="text-red-500">*</span>
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
                  Last Name <span className="text-red-500">*</span>
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
                Email <span className="text-red-500">*</span>
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
                Mobile Phone <span className="text-red-500">*</span>
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
                  Date of Birth <span className="text-red-500">*</span>
                </Label>
                <Input id="dateOfBirth" type="date" {...contactForm.register("dateOfBirth")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nationality">
                  Nationality <span className="text-red-500">*</span>
                </Label>
                <Input id="nationality" {...contactForm.register("nationality")} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="countryOfResidence">
                Country of Residence <span className="text-red-500">*</span>
              </Label>
              <Input id="countryOfResidence" {...contactForm.register("countryOfResidence")} />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="taxCountry">
                  Tax Residency <span className="text-red-500">*</span>
                </Label>
                <Input id="taxCountry" {...contactForm.register("taxCountry" as any)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxId">Tax ID (Optional)</Label>
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
                Business Intent & Activity
              </h2>
              <p className="text-brand-grayMed">
                Tell us about your business operations
              </p>
            </div>

            <div className="space-y-4">
              <Label>Intended Jurisdictions <span className="text-red-500">*</span></Label>
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
                Business Activity <span className="text-red-500">*</span>
              </Label>
              <Input
                id="businessActivity"
                {...intentForm.register("businessActivity")}
                placeholder="E-commerce, Consulting, etc."
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
                  Expected Monthly Volume (€)
                </Label>
                <Input
                  id="expectedMonthlyVolume"
                  type="number"
                  {...intentForm.register("expectedMonthlyVolume", { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="averageTicketSize">
                  Average Ticket Size (€)
                </Label>
                <Input
                  id="averageTicketSize"
                  type="number"
                  {...intentForm.register("averageTicketSize", { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label>Primary Currencies <span className="text-red-500">*</span></Label>
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
                <h3 className="text-lg font-semibold text-brand-dark mb-2">Supporting Documents</h3>
                <p className="text-sm text-brand-grayMed mb-4">
                  Please upload the following documents to support your business application
                </p>
              </div>

              {/* Company Registration Certificate */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Company Registration Certificate <span className="text-red-500">*</span>
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
                    Upload Registration Certificate
                  </Button>
                </div>
              </div>

              {/* Articles of Association */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Articles of Association / Statutes <span className="text-red-500">*</span>
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
                    Upload Articles of Association
                  </Button>
                </div>
              </div>

              {/* Shareholder Register */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Shareholder Register / UBO Declaration <span className="text-red-500">*</span>
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
                    Upload Shareholder Register
                  </Button>
                </div>
              </div>

              {/* Business Plan */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Business Plan / Activity Description
                  <span className="text-xs text-brand-grayMed font-normal">(Recommended)</span>
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
                    Upload Business Plan
                  </Button>
                </div>
              </div>

              {/* Financial Statements */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Recent Financial Statements
                  <span className="text-xs text-brand-grayMed font-normal">(If existing company)</span>
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
                    Upload Financial Statements
                  </Button>
                </div>
              </div>

              {/* Uploaded Documents List */}
              {uploadedDocuments.length > 0 && (
                <div className="space-y-2 pt-4">
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

              <p className="text-xs text-brand-grayMed">
                Accepted formats: JPG, PNG, PDF • Maximum size: 5MB per file
              </p>
            </div>
          </form>
        )}

        {/* Step 5: Directors & UBOs */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-brand-dark mb-2">
                Directors & Ultimate Beneficial Owners
              </h2>
              <p className="text-brand-grayMed">
                Add key persons associated with the company
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

                  <h4 className="font-semibold text-brand-dark">Person #{index + 1}</h4>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>First Name</Label>
                      <Input
                        value={director.firstName}
                        onChange={(e) => updateDirector(index, "firstName", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name</Label>
                      <Input
                        value={director.lastName}
                        onChange={(e) => updateDirector(index, "lastName", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Date of Birth</Label>
                      <Input
                        type="date"
                        value={director.dateOfBirth}
                        onChange={(e) => updateDirector(index, "dateOfBirth", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Nationality</Label>
                      <Input
                        value={director.nationality}
                        onChange={(e) => updateDirector(index, "nationality", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Residency</Label>
                      <Input
                        value={director.residencyCountry}
                        onChange={(e) => updateDirector(index, "residencyCountry", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <RadioGroup
                        value={director.role}
                        onValueChange={(value) => updateDirector(index, "role", value)}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="director" id={`director-${index}`} />
                          <Label htmlFor={`director-${index}`} className="font-normal">
                            Director
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="ubo" id={`ubo-${index}`} />
                          <Label htmlFor={`ubo-${index}`} className="font-normal">
                            UBO
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="both" id={`both-${index}`} />
                          <Label htmlFor={`both-${index}`} className="font-normal">
                            Both
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {(director.role === "ubo" || director.role === "both") && (
                      <div className="space-y-2">
                        <Label>Ownership %</Label>
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
                Add Director / UBO
              </Button>
            </div>
          </div>
        )}

        {/* Step 6: Review & Consents */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-brand-dark mb-2">
                Review & Consents
              </h2>
              <p className="text-brand-grayMed">
                Please review and provide your consent
              </p>
            </div>

            <div className="space-y-4 p-6 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-brand-dark">Application Summary</h3>

              <div className="grid gap-4 text-sm">
                <div>
                  <p className="text-brand-grayMed">Company</p>
                  <p className="font-medium text-brand-dark">
                    {formData.company?.companyName || "New Company"}
                  </p>
                </div>

                <div>
                  <p className="text-brand-grayMed">Contact Person</p>
                  <p className="font-medium text-brand-dark">
                    {formData.contactPerson?.firstName} {formData.contactPerson?.lastName}
                  </p>
                </div>

                <div>
                  <p className="text-brand-grayMed">Business Activity</p>
                  <p className="font-medium text-brand-dark">
                    {formData.intent?.businessActivity}
                  </p>
                </div>

                <div>
                  <p className="text-brand-grayMed">Directors & UBOs</p>
                  <p className="font-medium text-brand-dark">
                    {formData.directorsAndUBOs?.length || 0} person(s)
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
                  <span className="text-red-500">*</span> I consent to Opulanz processing company data for partner bank introductions.
                </Label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="dataSharing"
                  checked={consentsForm.watch("dataSharing")}
                  onCheckedChange={(checked) => consentsForm.setValue("dataSharing", !!checked)}
                />
                <Label htmlFor="dataSharing" className="font-normal cursor-pointer leading-tight">
                  <span className="text-red-500">*</span> I authorize Opulanz to share information with partner banks for account onboarding.
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
                  <span className="text-red-500">*</span> I confirm I am authorized to submit this application on behalf of the company.
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
                  Keep me informed about Opulanz services (optional)
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
                Application Submitted Successfully!
              </h2>
              <p className="text-lg text-brand-grayMed max-w-2xl mx-auto mb-6">
                Thank you for submitting your business account application. Our team will review your information and contact you within 24-72 hours.
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
                  <span>Our compliance team will review your application and supporting documents</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>We'll match your business with the most suitable Opulanz partner bank</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>You'll receive an email with next steps within 24-72 hours</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-4 max-w-md mx-auto mt-8">
              <Button variant="outline" size="lg" asChild>
                <a href={`/${locale}`}>Back to Homepage</a>
              </Button>
              <Button variant="outline" size="lg" onClick={onSwitchMode}>
                Start a Personal Application
              </Button>
            </div>
          </div>
        )}

        {/* Navigation */}
        {currentStep > 1 && currentStep < 7 && (
          <div className="flex items-center justify-between gap-4 mt-8 pt-8 border-t">
            <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back
            </Button>

            {currentStep < 6 && (
              <Button onClick={handleNext} disabled={isSubmitting}>
                Next
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            )}

            {currentStep === 6 && (
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
