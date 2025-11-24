"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Building2, FileText, Users, CreditCard, CheckCircle } from "lucide-react";
import { Hero } from "@/components/hero";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CompanyFormationWizard } from "@/components/company-formation/company-formation-wizard";
import type { CompanyFormType } from "@/types/company-formation";

const companyForms = [
  {
    id: "SARL" as const,
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
    id: "SARL-S" as const,
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
    id: "SA" as const,
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
    id: "SCSp" as const,
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
  {
    id: "SOLE" as const,
    name: "Sole Proprietor",
    fullName: "Individual Enterprise",
    minCapital: "No minimum",
    minShareholders: 1,
    liability: "Unlimited",
    features: [
      "Simplest structure",
      "No separate legal entity",
      "Full control",
      "Personal liability",
    ],
  },
];

export default function CompanyFormationPage() {
  const t = useTranslations();
  const [selectedForm, setSelectedForm] = React.useState<CompanyFormType | null>(null);

  if (selectedForm) {
    return (
      <CompanyFormationWizard
        initialFormType={selectedForm}
        onBack={() => setSelectedForm(null)}
      />
    );
  }

  return (
    <>
      <Hero
        title="Company Formation in Luxembourg"
        subtitle="Complete company formation services with expert guidance. Choose your structure and start your formation wizard."
      />

      {/* Company Types Selection */}
      <section className="bg-white py-20">
        <div className="container mx-auto max-w-7xl px-6">
          <SectionHeading
            title="Choose Your Company Form"
            description="Select the legal structure that best fits your business needs"
            align="center"
            className="mb-12"
          />

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {companyForms.map((form) => (
              <Card
                key={form.id}
                className="card-hover group cursor-pointer border-2 border-brand-grayLight transition-all hover:border-brand-gold hover:shadow-lg"
                onClick={() => setSelectedForm(form.id)}
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
                    className="w-full group-hover:border-brand-gold group-hover:bg-brand-goldLight/10 group-hover:text-brand-gold"
                  >
                    Start Formation
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process Overview */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto max-w-7xl px-6">
          <SectionHeading
            title="Simple 8-Step Formation Process"
            description="We guide you through every step of the company formation"
            align="center"
            className="mb-12"
          />

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Building2, title: "Company Type", desc: "Select your legal structure" },
              { icon: FileText, title: "General Info", desc: "Provide company details" },
              { icon: Users, title: "People", desc: "Add shareholders & directors" },
              { icon: CreditCard, title: "Capital", desc: "Define share capital" },
              { icon: FileText, title: "Activity", desc: "Business activity details" },
              { icon: Building2, title: "Notary", desc: "Notary preferences" },
              { icon: FileText, title: "Documents", desc: "Upload required docs" },
              { icon: CheckCircle, title: "Submit", desc: "Review and submit" },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="text-center">
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-gold text-white font-bold">
                    {index + 1}
                  </div>
                  <h3 className="mb-2 font-bold text-brand-dark">{item.title}</h3>
                  <p className="text-sm text-brand-grayMed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-white py-20">
        <div className="container mx-auto max-w-7xl px-6">
          <SectionHeading
            title="Why Form Your Company with Opulanz?"
            align="center"
            className="mb-12"
          />

          <div className="grid gap-8 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CheckCircle className="mb-4 h-12 w-12 text-brand-gold" />
                <CardTitle>Expert Guidance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-brand-grayMed">
                  Our team of Luxembourg corporate law experts guide you through every step of the formation process.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CheckCircle className="mb-4 h-12 w-12 text-brand-gold" />
                <CardTitle>Fast & Efficient</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-brand-grayMed">
                  Complete the online wizard in minutes. Most formations completed within 2-3 weeks.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CheckCircle className="mb-4 h-12 w-12 text-brand-gold" />
                <CardTitle>Full Service</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-brand-grayMed">
                  From notary coordination to RCS registration, we handle everything for you.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}
