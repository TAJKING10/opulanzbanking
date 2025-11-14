"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { Target, Eye, Award, Users, Shield, Globe, CheckCircle, BadgeCheck, FileCheck, LockKeyhole } from "lucide-react";
import { Hero } from "@/components/hero";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AboutPage() {
  const t = useTranslations();
  const locale = useLocale();

  const strengths = [
    {
      icon: Users,
      title: "Business Banking Expertise",
      description: "Over 17 years of experience serving commercial companies, financial institutions, and investment funds across Europe.",
    },
    {
      icon: Target,
      title: "All-in-One Platform",
      description: "Complete business solution from company formation to banking, accounting, tax advisory, investment, and insurance.",
    },
    {
      icon: Globe,
      title: "Modern Technology",
      description: "Leveraging Artificial Intelligence and Blockchain to make business banking better, easier, and more efficient.",
    },
  ];

  const certifications = [
    {
      icon: BadgeCheck,
      title: "State Licensed",
      description: "State Licensed Agents",
    },
    {
      icon: Award,
      title: "Certified",
      description: "Industry Certified Professionals",
    },
    {
      icon: Shield,
      title: "Bonded",
      description: "Bonded & Insured Operations",
    },
    {
      icon: FileCheck,
      title: "Accredited",
      description: "Better Business Bureau Accredited",
    },
  ];

  const stats = [
    { number: "17+", label: "Years of Experience" },
    { number: "1000+", label: "Business Clients" },
    { number: "€50M+", label: "Assets Under Management" },
    { number: "99%", label: "Client Satisfaction" },
  ];

  return (
    <>
      <Hero
        title="About Opulanz"
        subtitle="The One-Stop-Shop Business Banking Platform"
      />

      {/* Our Story */}
      <section className="bg-white py-20 md:py-28">
        <div className="container mx-auto max-w-4xl px-6">
          <SectionHeading
            overline="OUR STORY"
            title="Transforming Business Banking"
            align="center"
            className="mb-12"
          />

          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-brand-grayMed mb-6">
              Opulanz is part of Groupe Advensys Luxembourg S.A., a holding company with over 17 years of experience
              in providing comprehensive business solutions across Europe. We built Opulanz with a clear vision:
              to become the leader in European online banking for businesses.
            </p>

            <p className="text-brand-grayMed mb-6">
              Our mission is to improve the ecosystem of business banking, payments, and operational processes,
              making them better, easier, and more efficient using modern technology including Artificial Intelligence
              and Blockchain. We offer a complete one-stop-shop platform where businesses can handle everything
              from company formation to banking, accounting, tax advisory, investment, and insurance.
            </p>

            <p className="text-brand-grayMed">
              Today, we serve commercial companies, financial institutions, investment funds, and freelancers across
              Europe. Our experienced team continues to innovate with cutting-edge technology while maintaining
              the highest standards of security, compliance, and customer service. Made in Luxembourg, we represent
              quality, trust, and innovation in business banking.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-brand-off py-20">
        <div className="container mx-auto max-w-7xl px-6">
          <SectionHeading
            title="Our Impact"
            description="Our growth reflects the trust our clients place in us"
            align="center"
            className="mb-12"
          />

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <Card key={index} className="border-none text-center shadow-sm">
                <CardContent className="p-8">
                  <div className="mb-2 text-4xl font-bold text-brand-gold">
                    {stat.number}
                  </div>
                  <p className="text-sm font-semibold text-brand-dark">
                    {stat.label}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Our Strengths */}
      <section className="bg-white py-20 md:py-28">
        <div className="container mx-auto max-w-7xl px-6">
          <SectionHeading
            overline="OUR STRENGTHS"
            title="What Sets Us Apart"
            description="Three key pillars of our success"
            align="center"
            className="mb-12"
          />

          <div className="grid gap-8 md:grid-cols-3">
            {strengths.map((strength, index) => {
              const Icon = strength.icon;
              return (
                <Card key={index} className="card-hover border-none text-center">
                  <CardContent className="p-8">
                    <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-goldLight">
                      <Icon className="h-8 w-8 text-brand-goldDark" />
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-brand-dark">
                      {strength.title}
                    </h3>
                    <p className="text-sm text-brand-grayMed">
                      {strength.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Licenses & Certifications */}
      <section className="bg-brand-off py-20 md:py-28">
        <div className="container mx-auto max-w-7xl px-6">
          <SectionHeading
            overline="LICENSES & CERTIFICATIONS"
            title="Fully Licensed & Certified"
            description="We maintain all necessary licenses and certifications to provide business banking and financial services across Europe, ensuring compliance with industry regulations and standards."
            align="center"
            className="mb-12"
          />

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {certifications.map((cert, index) => {
              const Icon = cert.icon;
              return (
                <Card key={index} className="border-none text-center shadow-sm">
                  <CardContent className="p-8">
                    <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-gold text-white">
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="mb-2 text-lg font-bold text-brand-dark">
                      {cert.title}
                    </h3>
                    <p className="text-sm text-brand-grayMed">
                      {cert.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-white py-20 md:py-28">
        <div className="container mx-auto max-w-4xl px-6">
          <SectionHeading
            title="Why Choose Opulanz?"
            description="What makes us your trusted business banking partner"
            align="center"
            className="mb-12"
          />

          <div className="space-y-6">
            {[
              {
                title: "One-Stop-Shop Platform",
                description: "Complete business solution covering company formation, banking, accounting, tax advisory, investment, insurance, and more - all in one platform.",
              },
              {
                title: "17+ Years of Experience",
                description: "Part of Groupe Advensys Luxembourg S.A., we bring nearly two decades of expertise in serving businesses across Europe.",
              },
              {
                title: "Modern Technology Stack",
                description: "Built with cutting-edge Artificial Intelligence and Blockchain technology to provide efficient, secure, and innovative banking solutions.",
              },
              {
                title: "Business-Focused Approach",
                description: "Specifically designed for commercial companies, financial institutions, investment funds, and freelancers - not retail banking.",
              },
              {
                title: "Made in Luxembourg",
                description: "Operating from Luxembourg, we represent European quality, trust, and compliance with the highest banking standards.",
              },
              {
                title: "Future-Ready Vision",
                description: "Working towards full banking license with integrated blockchain and green technologies to lead the European online banking market.",
              },
            ].map((benefit, index) => (
              <Card key={index} className="border-none">
                <CardContent className="flex items-start gap-4 p-6">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-brand-gold" />
                  </div>
                  <div>
                    <h3 className="mb-2 text-lg font-bold text-brand-dark">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-brand-grayMed">
                      {benefit.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="hero-gradient py-20 md:py-28">
        <div className="container mx-auto max-w-4xl px-6 text-center">
          <h2 className="mb-6 text-balance text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            Ready to Get Started?
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-balance text-lg text-white/90">
            Join thousands of businesses across Europe who trust Opulanz as their all-in-one banking and business solution platform.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="min-w-48 bg-white text-brand-dark hover:bg-gray-50"
            >
              <Link href={`/${locale}/open-account`}>Open an Account</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="min-w-48 border-2 border-white bg-transparent text-white hover:bg-white/10"
            >
              <Link href={`/${locale}/support`}>Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
