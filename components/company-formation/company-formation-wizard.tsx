"use client";

import * as React from "react";
import { v4 as uuidv4 } from "uuid";
import { useTranslations } from "next-intl";
import {
  Building2,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CompanyFormType,
  CompanyFormationDossier,
  COMPANY_FORM_RULES,
  WIZARD_STEPS,
} from "@/types/company-formation";
import { Step3People, Step4Capital } from "./wizard-steps";
import { Step5Activity, Step6NotaryDomiciliation, Step7Documents, Step8ReviewSubmit } from "./wizard-steps-final";

interface CompanyFormationWizardProps {
  initialFormType: CompanyFormType;
  onBack: () => void;
}

export function CompanyFormationWizard({ initialFormType, onBack }: CompanyFormationWizardProps) {
  const t = useTranslations("companyFormation.wizard");

  const [currentStep, setCurrentStep] = React.useState(1);
  const [dossier, setDossier] = React.useState<Partial<CompanyFormationDossier>>({
    formType: initialFormType,
    country: "LU",
    capitalCurrency: "EUR",
    proposedNames: [],
    shareholders: [],
    directors: [],
    managers: [],
    ubos: [],
    contributions: [],
    uploads: {
      ids: [],
      leaseOrDomiciliation: [],
      capitalCertificate: null,
    },
    consents: {
      termsAccepted: false,
      privacyAccepted: false,
      accuracyConfirmed: false,
    },
    domiciliationNeeded: false,
    paymentStatus: "PENDING",
    userRef: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const translatedSteps = [
    t("wizardSteps.companyType"),
    t("wizardSteps.generalInfo"),
    t("wizardSteps.people"),
    t("wizardSteps.capital"),
    t("wizardSteps.activity"),
    t("wizardSteps.notaryDomiciliation"),
    t("wizardSteps.documents"),
    t("wizardSteps.reviewSubmit"),
  ];

  // Scroll to top on step change
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  // Save to localStorage on changes
  React.useEffect(() => {
    if (dossier.userRef) {
      localStorage.setItem(`opulanz_company_formation_${dossier.userRef}`, JSON.stringify(dossier));
    }
  }, [dossier]);

  const handleNext = () => {
    if (currentStep < WIZARD_STEPS.length) {
      setDossier(prev => ({ ...prev, updatedAt: new Date().toISOString() }));
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  const updateDossier = (updates: Partial<CompanyFormationDossier>) => {
    setDossier(prev => ({ ...prev, ...updates, updatedAt: new Date().toISOString() }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto max-w-5xl px-6">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("backToSelection")}
          </Button>
          <h1 className="mb-2 text-3xl font-bold text-brand-dark">
            {t("title")}
          </h1>
          <p className="text-brand-grayMed">
            {t("formingIn", { formType: dossier.formType })}
          </p>
        </div>

        {/* Progress Stepper */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {translatedSteps.map((step, index) => {
              const stepNumber = index + 1;
              const isActive = currentStep === stepNumber;
              const isCompleted = currentStep > stepNumber;
              const isLast = index === translatedSteps.length - 1;

              return (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`mb-2 flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all ${
                        isCompleted
                          ? "bg-brand-gold text-white"
                          : isActive
                          ? "bg-brand-goldLight text-brand-goldDark ring-4 ring-brand-goldLight/30"
                          : "bg-brand-grayLight text-brand-grayMed"
                      }`}
                    >
                      {isCompleted ? <CheckCircle className="h-5 w-5" /> : stepNumber}
                    </div>
                    <p className="hidden text-xs text-center text-brand-grayMed md:block max-w-[100px]">
                      {step}
                    </p>
                  </div>
                  {!isLast && (
                    <div
                      className={`h-1 flex-1 mx-2 transition-all ${
                        isCompleted ? "bg-brand-gold" : "bg-brand-grayLight"
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">{translatedSteps[currentStep - 1]}</CardTitle>
          </CardHeader>
          <CardContent>
            {currentStep === 1 && <Step1CompanyType dossier={dossier} updateDossier={updateDossier} />}
            {currentStep === 2 && <Step2GeneralInfo dossier={dossier} updateDossier={updateDossier} />}
            {currentStep === 3 && <Step3People dossier={dossier} updateDossier={updateDossier} />}
            {currentStep === 4 && <Step4Capital dossier={dossier} updateDossier={updateDossier} />}
            {currentStep === 5 && <Step5Activity dossier={dossier} updateDossier={updateDossier} />}
            {currentStep === 6 && <Step6NotaryDomiciliation dossier={dossier} updateDossier={updateDossier} />}
            {currentStep === 7 && <Step7Documents dossier={dossier} updateDossier={updateDossier} />}
            {currentStep === 8 && <Step8ReviewSubmit dossier={dossier} updateDossier={updateDossier} />}

            {/* Navigation */}
            <div className="mt-8 flex justify-between border-t border-brand-grayLight pt-6">
              <Button
                variant="outline"
                onClick={handleBack}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("back")}
              </Button>
              <div className="flex gap-4">
                <Button variant="ghost">{t("saveResume")}</Button>
                {currentStep < WIZARD_STEPS.length ? (
                  <Button
                    variant="primary"
                    onClick={handleNext}
                  >
                    {t("next")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Step 1: Company Type (already selected, just show confirmation)
function Step1CompanyType({ dossier, updateDossier }: StepProps) {
  const t = useTranslations("companyFormation.wizard.step1");
  const tf = useTranslations("companyFormation.forms");

  const formTypes = [
    { value: "SARL" as const, name: "SARL", desc: tf("sarl.fullName") },
    { value: "SARL-S" as const, name: "SARL-S", desc: tf("sarls.fullName") },
    { value: "SA" as const, name: "SA", desc: tf("sa.fullName") },
    { value: "SCSp" as const, name: "SCSp", desc: tf("scsp.fullName") },
    { value: "SOLE" as const, name: tf("soleProprietor"), desc: tf("sole.fullName") },
  ];

  const currentFormType = formTypes.find(f => f.value === dossier.formType);
  const rules = COMPANY_FORM_RULES[dossier.formType!];

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-brand-goldLight/20 p-6">
        <h3 className="mb-4 text-lg font-bold text-brand-dark">{t("selectedType")}</h3>
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-gold text-white">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-xl font-bold text-brand-dark">{currentFormType?.name}</h4>
            <p className="text-brand-grayMed">{currentFormType?.desc}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-bold text-brand-dark">{t("requirementsFor", { formType: dossier.formType })}</h4>
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-brand-gold flex-shrink-0 mt-0.5" />
            <span className="text-brand-dark">
              {rules.minCapital === 0
                ? t("noMinCapital")
                : t("minCapital", { amount: `€${rules.minCapital.toLocaleString()}` })}
            </span>
          </li>
          {rules.maxCapital !== Infinity && (
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-brand-gold flex-shrink-0 mt-0.5" />
              <span className="text-brand-dark">
                {t("maxCapital", { amount: `€${rules.maxCapital.toLocaleString()}` })}
              </span>
            </li>
          )}
          {rules.requiresDirectors && (
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-brand-gold flex-shrink-0 mt-0.5" />
              <span className="text-brand-dark">
                {t("requiresDirectors", { count: (rules as any).minDirectors })}
              </span>
            </li>
          )}
          {rules.requiresManagers && (
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-brand-gold flex-shrink-0 mt-0.5" />
              <span className="text-brand-dark">
                {t("requiresManagers", { count: (rules as any).minManagers })}
              </span>
            </li>
          )}
        </ul>
      </div>

      <div className="rounded-xl bg-blue-50 p-4">
        <p className="text-sm text-blue-900">
          <strong>Note:</strong> {t("changeNote")}
        </p>
      </div>
    </div>
  );
}

// Step 2: General Info
function Step2GeneralInfo({ dossier, updateDossier }: StepProps) {
  const t = useTranslations("companyFormation.wizard.step2");

  const [primaryName, setPrimaryName] = React.useState(dossier.proposedNames?.[0] || "");
  const [alternateName, setAlternateName] = React.useState(dossier.proposedNames?.[1] || "");
  const [purpose, setPurpose] = React.useState(dossier.purpose || "");
  const [registeredOffice, setRegisteredOffice] = React.useState(dossier.registeredOffice || "");
  const [duration, setDuration] = React.useState(dossier.duration || t("durationDefault"));

  React.useEffect(() => {
    const names = [primaryName, alternateName].filter(Boolean);
    updateDossier({
      proposedNames: names,
      purpose,
      registeredOffice,
      duration,
    });
  }, [primaryName, alternateName, purpose, registeredOffice, duration]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="primaryName">
          {t("proposedName")} <span className="text-red-500">*</span>
        </Label>
        <Input
          id="primaryName"
          value={primaryName}
          onChange={(e) => setPrimaryName(e.target.value)}
          placeholder={t("proposedNamePlaceholder")}
        />
        <p className="text-xs text-brand-grayMed">
          {t("proposedNameHelp")}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="alternateName">
          {t("alternateName")}
        </Label>
        <Input
          id="alternateName"
          value={alternateName}
          onChange={(e) => setAlternateName(e.target.value)}
          placeholder={t("alternateNamePlaceholder")}
        />
        <p className="text-xs text-brand-grayMed">
          {t("alternateNameHelp")}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="purpose">
          {t("purpose")} <span className="text-red-500">*</span>
        </Label>
        <textarea
          id="purpose"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          rows={5}
          className="flex w-full rounded-xl border border-brand-grayLight bg-white px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
          placeholder={t("purposePlaceholder")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="registeredOffice">
          {t("registeredOffice")} <span className="text-red-500">*</span>
        </Label>
        <textarea
          id="registeredOffice"
          value={registeredOffice}
          onChange={(e) => setRegisteredOffice(e.target.value)}
          rows={3}
          className="flex w-full rounded-xl border border-brand-grayLight bg-white px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
          placeholder={t("registeredOfficePlaceholder")}
        />
        <p className="text-xs text-brand-grayMed">
          {t("registeredOfficeHelp")}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="duration">
          {t("duration")}
        </Label>
        <Input
          id="duration"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder={t("durationDefault")}
        />
        <p className="text-xs text-brand-grayMed">
          {t("durationHelp")}
        </p>
      </div>
    </div>
  );
}

type StepProps = {
  dossier: Partial<CompanyFormationDossier>;
  updateDossier: (updates: Partial<CompanyFormationDossier>) => void;
};
