"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Building2, FileText, Users, CreditCard, CheckCircle } from "lucide-react";
import { Hero } from "@/components/hero";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const companyForms = [
  {
    id: "sarl",
    name: "SARL",
    fullName: "Private Limited Company",
    minCapital: "€12,000",
    minShareholders: 1,
    liability: "Limited",
    features: [
      "Most common structure",
      "Flexible management",
      "Lower capital requirement",
      "Suitable for SMEs",
    ],
  },
  {
    id: "sarls",
    name: "SARL-S",
    fullName: "Simplified Private Limited Company",
    minCapital: "€1",
    minShareholders: 1,
    liability: "Limited",
    features: [
      "Very low capital requirement",
      "Simplified formation",
      "Ideal for startups",
      "Max capital €100,000",
    ],
  },
  {
    id: "sa",
    name: "SA",
    fullName: "Public Limited Company",
    minCapital: "€30,000",
    minShareholders: 1,
    liability: "Limited",
    features: [
      "Can be listed publicly",
      "Board of directors required",
      "Higher credibility",
      "Suitable for larger businesses",
    ],
  },
  {
    id: "scsp",
    name: "SCSp",
    fullName: "Special Limited Partnership",
    minCapital: "No minimum",
    minShareholders: 2,
    liability: "Mixed",
    features: [
      "Tax transparent",
      "Popular for funds",
      "Flexible structure",
      "General partner liability",
    ],
  },
];

type Step = "select" | "wizard";

export default function CompanyFormationPage() {
  const t = useTranslations();
  const [step, setStep] = React.useState<Step>("select");
  const [selectedForm, setSelectedForm] = React.useState<string>("");

  if (step === "wizard" && selectedForm) {
    return <CompanyFormationWizard formType={selectedForm} />;
  }

  return (
    <>
      <Hero
        title="Company Formation"
        subtitle="Complete company formation services with expert guidance"
      />

      <section className="bg-white py-20">
        <div className="container mx-auto max-w-7xl px-6">
          <SectionHeading
            title="Choose Your Company Form"
            description="Choose the legal structure that best fits your business needs"
            align="center"
            className="mb-12"
          />

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {companyForms.map((form) => (
              <Card
                key={form.id}
                className="card-hover group cursor-pointer border-2 border-brand-grayLight transition-all hover:border-brand-gold"
                onClick={() => {
                  setSelectedForm(form.id);
                  setStep("wizard");
                }}
              >
                <CardHeader>
                  <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-goldLight">
                    <Building2 className="h-7 w-7 text-brand-goldDark" />
                  </div>
                  <CardTitle className="text-xl">{form.name}</CardTitle>
                  <p className="text-sm text-brand-grayMed">{form.fullName}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-brand-grayMed">Min. Capital:</span>
                      <span className="font-semibold text-brand-dark">
                        {form.minCapital}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-grayMed">Shareholders:</span>
                      <span className="font-semibold text-brand-dark">
                        Min. {form.minShareholders}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-grayMed">Liability:</span>
                      <span className="font-semibold text-brand-dark">
                        {form.liability}
                      </span>
                    </div>
                  </div>
                  <ul className="space-y-2 border-t border-brand-grayLight pt-4">
                    {form.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-xs text-brand-grayMed"
                      >
                        <span className="text-brand-gold">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant="outline"
                    className="w-full group-hover:border-brand-gold group-hover:text-brand-gold"
                  >
                    Select {form.name}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process Overview */}
      <section className="bg-brand-grayLight py-20">
        <div className="container mx-auto max-w-7xl px-6">
          <SectionHeading
            title="Simple Formation Process"
            description="We guide you through every step"
            align="center"
            className="mb-12"
          />

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
            {[
              { icon: FileText, title: "Company Details", desc: "Provide company information" },
              { icon: Users, title: "Shareholders", desc: "Add shareholders and structure" },
              { icon: Building2, title: "Capital Deposit", desc: "Deposit share capital" },
              { icon: CreditCard, title: "Payment", desc: "Pay formation fees" },
              { icon: CheckCircle, title: "Registration", desc: "Complete RCS registration" },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="text-center">
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-gold text-white">
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="mb-2 font-bold text-brand-dark">{item.title}</h3>
                  <p className="text-sm text-brand-grayMed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

function CompanyFormationWizard({ formType }: { formType: string }) {
  const t = useTranslations();
  const [currentStep, setCurrentStep] = React.useState(1);
  const totalSteps = 5;

  const steps = [
    { number: 1, title: t("companyFormation.companyDetails") },
    { number: 2, title: t("companyFormation.shareholders") },
    { number: 3, title: t("companyFormation.capitalDeposit") },
    { number: 4, title: t("companyFormation.payment") },
    { number: 5, title: t("companyFormation.confirmation") },
  ];

  return (
    <div className="min-h-screen bg-white py-20">
      <div className="container mx-auto max-w-5xl px-6">
        <div className="mb-12">
          <h1 className="mb-2 text-center text-3xl font-bold text-brand-dark">
            {t("companyFormation.wizardTitle")}
          </h1>
          <p className="text-center text-brand-grayMed">
            Forming a {formType.toUpperCase()} in Luxembourg
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              const isLast = index === steps.length - 1;

              return (
                <React.Fragment key={step.number}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`mb-2 flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                        isCompleted
                          ? "bg-brand-gold text-white"
                          : isActive
                          ? "bg-brand-goldLight text-brand-goldDark ring-4 ring-brand-goldLight/30"
                          : "bg-brand-grayLight text-brand-grayMed"
                      }`}
                    >
                      {isCompleted ? "✓" : step.number}
                    </div>
                    <p className="hidden text-xs text-brand-grayMed md:block">
                      {step.title}
                    </p>
                  </div>
                  {!isLast && (
                    <div
                      className={`h-1 flex-1 ${
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
        <Card className="border-none shadow-elevated">
          <CardHeader>
            <CardTitle>{steps[currentStep - 1].title}</CardTitle>
          </CardHeader>
          <CardContent>
            {currentStep === 1 && <StepCompanyDetails />}
            {currentStep === 2 && <StepShareholders />}
            {currentStep === 3 && <StepCapitalDeposit />}
            {currentStep === 4 && <StepPayment />}
            {currentStep === 5 && <StepConfirmation />}

            <div className="mt-8 flex justify-between">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  {t("common.back")}
                </Button>
              )}
              <div className="ml-auto flex gap-4">
                <Button variant="ghost">{t("companyFormation.saveProgress")}</Button>
                {currentStep < totalSteps ? (
                  <Button
                    variant="primary"
                    onClick={() => setCurrentStep(currentStep + 1)}
                  >
                    {t("common.next")}
                  </Button>
                ) : (
                  <Button variant="primary">{t("common.submit")}</Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StepCompanyDetails() {
  const t = useTranslations();
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="companyName">
          {t("companyFormation.companyName")}
          <span className="text-red-600">*</span>
        </Label>
        <Input id="companyName" placeholder="Enter company name" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="businessActivity">
          {t("companyFormation.businessActivity")}
          <span className="text-red-600">*</span>
        </Label>
        <textarea
          id="businessActivity"
          rows={4}
          className="flex w-full rounded-xl border border-brand-grayLight bg-white px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
          placeholder="Describe your business activity..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="shareCapital">
          {t("companyFormation.shareCapital")}
          <span className="text-red-600">*</span>
        </Label>
        <Input id="shareCapital" type="number" placeholder="12000" />
        <p className="text-xs text-brand-grayMed">
          Minimum capital: €12,000 for SARL
        </p>
      </div>
    </div>
  );
}

function StepShareholders() {
  const t = useTranslations();
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-brand-grayLight bg-white p-6">
        <h4 className="mb-4 font-bold text-brand-dark">Shareholder 1</h4>
        <div className="grid gap-4 md:grid-cols-2">
          <Input placeholder="Full Name" />
          <Input placeholder="Nationality" />
          <Input placeholder="Email" />
          <Input placeholder="Ownership %" type="number" />
        </div>
      </div>
      <Button variant="outline" className="w-full">
        {t("companyFormation.addShareholder")}
      </Button>
    </div>
  );
}

function StepCapitalDeposit() {
  const t = useTranslations();
  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-accent-beige/30 p-6">
        <h4 className="mb-4 font-bold text-brand-dark">Capital Deposit Process</h4>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-gold text-white text-sm font-bold">
              1
            </div>
            <div>
              <p className="font-semibold text-brand-dark">
                {t("companyFormation.depositCapital")}
              </p>
              <p className="text-sm text-brand-grayMed">
                We'll provide bank details for the capital deposit
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-gold text-white text-sm font-bold">
              2
            </div>
            <div>
              <p className="font-semibold text-brand-dark">
                {t("companyFormation.notaryCertificate")}
              </p>
              <p className="text-sm text-brand-grayMed">
                After deposit confirmation, notary proceeds with incorporation
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-gold text-white text-sm font-bold">
              3
            </div>
            <div>
              <p className="font-semibold text-brand-dark">
                {t("companyFormation.rcsRegistration")}
              </p>
              <p className="text-sm text-brand-grayMed">
                Company is registered with Luxembourg Business Registers
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepPayment() {
  const t = useTranslations();
  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-brand-grayLight/50 p-6">
        <h4 className="mb-4 text-lg font-bold text-brand-dark">
          {t("companyFormation.totalFees")}
        </h4>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-brand-grayMed">Formation fees</span>
            <span className="font-semibold text-brand-dark">€1,500</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-brand-grayMed">Notary fees</span>
            <span className="font-semibold text-brand-dark">€800</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-brand-grayMed">Registration fees</span>
            <span className="font-semibold text-brand-dark">€300</span>
          </div>
          <div className="border-t border-brand-grayMed pt-3">
            <div className="flex justify-between">
              <span className="text-lg font-bold text-brand-dark">Total</span>
              <span className="text-2xl font-bold text-brand-gold">€2,600</span>
            </div>
          </div>
        </div>
      </div>
      <Button variant="primary" size="lg" className="w-full">
        {t("companyFormation.proceedToPayment")}
      </Button>
    </div>
  );
}

function StepConfirmation() {
  return (
    <div className="space-y-6 text-center">
      <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
        <CheckCircle className="h-10 w-10 text-green-600" />
      </div>
      <h3 className="text-2xl font-bold text-brand-dark">
        Company Formation Initiated!
      </h3>
      <p className="text-brand-grayMed">
        We'll keep you updated on each step. Expected completion: 2-3 weeks.
      </p>
    </div>
  );
}
