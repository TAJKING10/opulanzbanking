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
      title: "Expert Financial Advisors",
      description: "Our team consists of certified financial professionals with years of experience in the industry.",
    },
    {
      icon: Target,
      title: "Personalized Solutions",
      description: "We create customized financial plans tailored to your specific needs and goals.",
    },
    {
      icon: Globe,
      title: "Comprehensive Services",
      description: "From insurance to investments, we offer a full range of financial services under one roof.",
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
    { number: "1000+", label: "Satisfied Clients" },
    { number: "€50M+", label: "Assets Under Management" },
    { number: "15+", label: "Years of Experience" },
    { number: "99%", label: "Client Satisfaction" },
  ];

  return (
    <>
      <Hero
        title="About Advensys in Finance"
        subtitle="Your Trusted Financial Partner"
      />

      {/* Our Story */}
      <section className="bg-white py-20 md:py-28">
        <div className="container mx-auto max-w-4xl px-6">
          <SectionHeading
            overline="OUR STORY"
            title="Building Trust Through Excellence"
            align="center"
            className="mb-12"
          />

          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-brand-grayMed mb-6">
              Advensys in Finance began with a simple mission: to provide reliable, affordable financial solutions
              to individuals and businesses across Europe.
            </p>

            <p className="text-brand-grayMed mb-6">
              We have built strong relationships with top financial institutions, allowing us to offer comprehensive
              coverage options at competitive rates. Our commitment to excellence and customer satisfaction has made
              us a trusted name in the financial industry.
            </p>

            <p className="text-brand-grayMed">
              Today, we serve thousands of satisfied clients across Europe, from individuals seeking personal
              protection to businesses requiring comprehensive commercial coverage. Our experienced team continues
              to adapt to changing market needs while maintaining our core values of integrity, service, and reliability.
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
            description="We maintain all necessary licenses and certifications to provide insurance services across multiple states, ensuring compliance with industry regulations and standards."
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
            title="Why Choose Advensys?"
            description="What makes us your trusted financial partner"
            align="center"
            className="mb-12"
          />

          <div className="space-y-6">
            {[
              {
                title: "Expert Financial Advisors",
                description: "Our team of certified financial professionals brings years of industry experience to help you make informed decisions.",
              },
              {
                title: "Personalized Service",
                description: "We take the time to understand your unique situation and create customized financial solutions that align with your goals.",
              },
              {
                title: "Comprehensive Coverage",
                description: "From insurance to investment advisory and banking intermediation, we provide a full suite of financial services.",
              },
              {
                title: "Strong Industry Relationships",
                description: "Our partnerships with top financial institutions allow us to offer competitive rates and comprehensive options.",
              },
              {
                title: "Commitment to Excellence",
                description: "We maintain the highest standards of integrity, service, and reliability in everything we do.",
              },
              {
                title: "Regulatory Compliance",
                description: "Fully licensed and certified, we ensure all operations meet industry regulations and standards.",
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
            Join thousands of individuals and businesses across Europe who trust Advensys for their financial needs.
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
