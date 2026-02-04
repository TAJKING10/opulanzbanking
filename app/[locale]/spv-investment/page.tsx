"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Building2, Shield, Users, Lock, CheckCircle, ArrowRight, Mail, Phone, User, Send } from "lucide-react";
import { Hero } from "@/components/hero";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SpvInvestmentPage() {
  const t = useTranslations();
  const locale = useLocale();

  const [formData, setFormData] = React.useState({
    fullName: "",
    email: "",
    phone: "",
    investorType: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Investment info request:", formData);
    setIsSubmitted(true);
  };

  const benefits = [
    {
      icon: Shield,
      title: t("spvInvestment.landing.whatIsSpv.benefits.protection.title"),
      description: t("spvInvestment.landing.whatIsSpv.benefits.protection.description"),
    },
    {
      icon: Users,
      title: t("spvInvestment.landing.whatIsSpv.benefits.governance.title"),
      description: t("spvInvestment.landing.whatIsSpv.benefits.governance.description"),
    },
    {
      icon: Building2,
      title: t("spvInvestment.landing.whatIsSpv.benefits.transparency.title"),
      description: t("spvInvestment.landing.whatIsSpv.benefits.transparency.description"),
    },
    {
      icon: Lock,
      title: t("spvInvestment.landing.whatIsSpv.benefits.exit.title"),
      description: t("spvInvestment.landing.whatIsSpv.benefits.exit.description"),
    },
  ];

  const steps = [
    { key: "contact", number: "01" },
    { key: "qualification", number: "02" },
    { key: "access", number: "03" },
    { key: "investment", number: "04" },
  ];

  return (
    <>
      <Hero
        title={t("spvInvestment.landing.heroTitle")}
        subtitle={t("spvInvestment.landing.heroSubtitle")}
        primaryCta={{
          label: t("spvInvestment.landing.cta.contactButton"),
          href: "#contact",
        }}
        secondaryCta={{
          label: t("spvInvestment.landing.cta.portalAccess"),
          href: `/${locale}/spv-investment/portal`,
        }}
      />

      {/* What is an SPV Section */}
      <section id="what-is-spv" className="bg-white py-20 md:py-28">
        <div className="container mx-auto max-w-7xl px-6">
          <SectionHeading
            overline={t("spvInvestment.landing.whatIsSpv.overline")}
            title={t("spvInvestment.landing.whatIsSpv.title")}
            description={t("spvInvestment.landing.whatIsSpv.description")}
          />
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <Card key={benefit.title} className="border-none shadow-sm">
                  <CardHeader>
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-brand-gold/10">
                      <Icon className="h-6 w-6 text-brand-gold" />
                    </div>
                    <CardTitle className="text-lg">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-brand-grayMed">{benefit.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gray-50 py-20 md:py-28">
        <div className="container mx-auto max-w-7xl px-6">
          <SectionHeading
            overline={t("spvInvestment.landing.howItWorks.overline")}
            title={t("spvInvestment.landing.howItWorks.title")}
            description={t("spvInvestment.landing.howItWorks.description")}
          />
          <div className="mx-auto max-w-3xl space-y-8">
            {steps.map((step, index) => (
              <div key={step.key} className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-gold text-white font-bold text-sm shrink-0">
                    {step.number}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="mt-2 w-px flex-1 bg-brand-grayLight" />
                  )}
                </div>
                <div className="pb-8">
                  <h3 className="mb-2 text-lg font-bold text-brand-dark">
                    {t(`spvInvestment.landing.howItWorks.steps.${step.key}.title`)}
                  </h3>
                  <p className="text-sm text-brand-grayMed leading-relaxed">
                    {t(`spvInvestment.landing.howItWorks.steps.${step.key}.description`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact" className="bg-white py-20 md:py-28">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left Column - Information */}
            <div>
              <h2 className="mb-6 text-3xl font-bold text-brand-dark md:text-4xl">
                {t("spvInvestment.landing.contactForm.title")}
              </h2>
              <p className="mb-8 text-lg text-brand-grayMed leading-relaxed">
                {t("spvInvestment.landing.contactForm.description")}
              </p>
              <div className="space-y-4">
                {[
                  t("spvInvestment.landing.whatIsSpv.benefits.protection.title"),
                  t("spvInvestment.landing.whatIsSpv.benefits.governance.title"),
                  t("spvInvestment.landing.whatIsSpv.benefits.transparency.title"),
                  t("spvInvestment.landing.whatIsSpv.benefits.exit.title"),
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-brand-gold" />
                    <p className="text-brand-dark">{item}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Link
                  href={`/${locale}/spv-investment/portal`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-brand-gold hover:text-brand-goldDark transition-colors"
                >
                  {t("spvInvestment.landing.cta.portalAccess")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Right Column - Form */}
            <Card className="border-none shadow-elevated">
              <CardContent className="p-8">
                {isSubmitted ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <p className="text-lg font-semibold text-brand-dark mb-2">
                      {t("spvInvestment.landing.contactForm.success")}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">
                        {t("spvInvestment.landing.contactForm.fullName")} <span className="text-red-600">*</span>
                      </Label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                          <User className="h-5 w-5 text-brand-grayMed" />
                        </div>
                        <Input
                          id="fullName"
                          type="text"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">
                        {t("spvInvestment.landing.contactForm.email")} <span className="text-red-600">*</span>
                      </Label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                          <Mail className="h-5 w-5 text-brand-grayMed" />
                        </div>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">
                        {t("spvInvestment.landing.contactForm.phone")}
                      </Label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                          <Phone className="h-5 w-5 text-brand-grayMed" />
                        </div>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="investorType">
                        {t("spvInvestment.landing.contactForm.investorType")} <span className="text-red-600">*</span>
                      </Label>
                      <select
                        id="investorType"
                        value={formData.investorType}
                        onChange={(e) => setFormData({ ...formData, investorType: e.target.value })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
                        required
                      >
                        <option value="">{t("common.select")}</option>
                        <option value="institutional">{t("spvInvestment.landing.contactForm.investorTypes.institutional")}</option>
                        <option value="professional">{t("spvInvestment.landing.contactForm.investorTypes.professional")}</option>
                        <option value="private">{t("spvInvestment.landing.contactForm.investorTypes.private")}</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">
                        {t("spvInvestment.landing.contactForm.message")}
                      </Label>
                      <textarea
                        id="message"
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder={t("spvInvestment.landing.contactForm.messagePlaceholder")}
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 resize-none"
                      />
                    </div>

                    <Button type="submit" variant="primary" size="lg" className="w-full">
                      <Send className="mr-2 h-4 w-4" />
                      {t("spvInvestment.landing.contactForm.submit")}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
          <p className="mt-8 text-xs text-center text-brand-grayMed max-w-3xl mx-auto leading-relaxed">
            {t("spvInvestment.landing.contactForm.disclaimer")}
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="hero-gradient py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-brand-goldLight rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>
        <div className="container mx-auto max-w-4xl px-6 text-center relative z-10">
          <h2 className="mb-6 text-balance text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            {t("spvInvestment.landing.cta.title")}
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-balance text-lg text-white/90">
            {t("spvInvestment.landing.cta.description")}
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="#contact"
              className="group inline-flex h-14 min-w-48 items-center justify-center rounded-2xl bg-white px-8 text-base font-semibold text-brand-dark shadow-lg transition-all hover:shadow-2xl hover:scale-105 hover:-translate-y-1"
            >
              {t("spvInvestment.landing.cta.contactButton")}
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </a>
            <Link
              href={`/${locale}/spv-investment/portal`}
              className="inline-flex h-14 min-w-48 items-center justify-center rounded-2xl border-2 border-white bg-transparent px-8 text-base font-semibold text-white transition-all hover:bg-white/10 hover:scale-105 hover:-translate-y-1"
            >
              {t("spvInvestment.landing.cta.portalAccess")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
