"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { Target, Eye, Award, Users, Shield, Globe, CheckCircle, TrendingUp } from "lucide-react";
import { Hero } from "@/components/hero";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AboutPage() {
  const t = useTranslations();
  const locale = useLocale();

  const values = [
    {
      icon: Shield,
      title: "Security & Trust",
      description: "Your financial security is our top priority. We implement bank-grade security measures and comply with all regulatory requirements.",
    },
    {
      icon: Users,
      title: "Client-Centric",
      description: "We put our clients first, offering personalized service and dedicated support to help you achieve your financial goals.",
    },
    {
      icon: Globe,
      title: "Innovation",
      description: "We leverage cutting-edge technology to provide seamless digital banking experiences that meet modern needs.",
    },
    {
      icon: Award,
      title: "Excellence",
      description: "We strive for excellence in everything we do, from service quality to compliance and operational efficiency.",
    },
  ];

  const stats = [
    { number: "10,000+", label: "Active Clients" },
    { number: "€2.5B+", label: "Assets Under Management" },
    { number: "25+", label: "Years of Experience" },
    { number: "99.9%", label: "Uptime" },
  ];

  const timeline = [
    {
      year: "2020",
      title: "Foundation",
      description: "Opulanz was founded with a vision to revolutionize digital banking in Europe.",
    },
    {
      year: "2021",
      title: "Regulatory Approval",
      description: "Received licenses and regulatory approval from authorities in Luxembourg and France.",
    },
    {
      year: "2022",
      title: "Platform Launch",
      description: "Launched our comprehensive digital banking platform with full suite of services.",
    },
    {
      year: "2023",
      title: "Expansion",
      description: "Expanded services to include company formation, tax advisory, and investment services.",
    },
    {
      year: "2024",
      title: "Innovation",
      description: "Introduced AI-powered financial tools and enhanced mobile banking experience.",
    },
  ];


  return (
    <>
      <Hero
        title="About Opulanz"
        subtitle="Building the future of digital banking for modern businesses and individuals"
      />

      {/* Mission & Vision */}
      <section className="bg-white py-20 md:py-28">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-goldLight">
                <Target className="h-8 w-8 text-brand-goldDark" />
              </div>
              <h2 className="mb-4 text-3xl font-bold text-brand-dark">Our Mission</h2>
              <p className="mb-4 text-lg text-brand-grayMed">
                To empower businesses and individuals with innovative, secure, and accessible financial services that enable them to thrive in the global economy.
              </p>
              <p className="text-brand-grayMed">
                We believe that everyone deserves access to professional banking services that are transparent, efficient, and tailored to their unique needs. Our mission is to break down barriers and make world-class financial services accessible to all.
              </p>
            </div>

            <div>
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-goldLight">
                <Eye className="h-8 w-8 text-brand-goldDark" />
              </div>
              <h2 className="mb-4 text-3xl font-bold text-brand-dark">Our Vision</h2>
              <p className="mb-4 text-lg text-brand-grayMed">
                To become the leading digital banking platform in Europe, known for excellence, innovation, and client satisfaction.
              </p>
              <p className="text-brand-grayMed">
                We envision a future where banking is seamless, intuitive, and fully integrated into the digital lives of our clients. Through continuous innovation and unwavering commitment to service, we aim to redefine what modern banking can be.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-brand-off py-20">
        <div className="container mx-auto max-w-7xl px-6">
          <SectionHeading
            title="Opulanz by the Numbers"
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

      {/* Core Values */}
      <section className="bg-white py-20 md:py-28">
        <div className="container mx-auto max-w-7xl px-6">
          <SectionHeading
            overline="OUR VALUES"
            title="What We Stand For"
            description="The principles that guide everything we do"
            align="center"
            className="mb-12"
          />

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="card-hover border-none text-center">
                  <CardContent className="p-8">
                    <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-goldLight">
                      <Icon className="h-8 w-8 text-brand-goldDark" />
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-brand-dark">
                      {value.title}
                    </h3>
                    <p className="text-sm text-brand-grayMed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-brand-off py-20 md:py-28">
        <div className="container mx-auto max-w-4xl px-6">
          <SectionHeading
            overline="OUR JOURNEY"
            title="Our Story"
            description="From vision to reality"
            align="center"
            className="mb-16"
          />

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-brand-gold/30 md:left-1/2" />

            {/* Timeline Items */}
            <div className="space-y-12">
              {timeline.map((item, index) => (
                <div
                  key={index}
                  className={`relative flex items-start gap-8 ${
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  {/* Year Badge */}
                  <div className="relative z-10 flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-brand-gold text-white shadow-lg md:absolute md:left-1/2 md:-translate-x-1/2">
                    <span className="text-sm font-bold">{item.year}</span>
                  </div>

                  {/* Content */}
                  <div className={`flex-1 ${index % 2 === 0 ? "md:pr-24" : "md:pl-24"}`}>
                    <Card className="border-none shadow-sm">
                      <CardContent className="p-6">
                        <h3 className="mb-2 text-xl font-bold text-brand-dark">
                          {item.title}
                        </h3>
                        <p className="text-sm text-brand-grayMed">
                          {item.description}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Spacer for alternating layout */}
                  <div className="hidden flex-1 md:block" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-brand-off py-20 md:py-28">
        <div className="container mx-auto max-w-4xl px-6">
          <SectionHeading
            title="Why Choose Opulanz?"
            description="What sets us apart from traditional banks"
            align="center"
            className="mb-12"
          />

          <div className="space-y-6">
            {[
              {
                title: "Fully Digital Experience",
                description: "Open accounts, transfer money, and manage your finances entirely online with our intuitive platform.",
              },
              {
                title: "Competitive Pricing",
                description: "Transparent fees with no hidden charges. We offer some of the most competitive rates in the market.",
              },
              {
                title: "Multi-Currency Support",
                description: "Hold and transact in multiple currencies with competitive exchange rates and low transfer fees.",
              },
              {
                title: "Expert Advisory Services",
                description: "Access professional advice on tax, accounting, investment, and business formation from our team of experts.",
              },
              {
                title: "Regulatory Compliance",
                description: "Fully licensed and regulated, ensuring your funds are protected and operations are compliant.",
              },
              {
                title: "24/7 Support",
                description: "Our dedicated support team is available around the clock to assist you with any questions or issues.",
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
            Join thousands of businesses and individuals who trust Opulanz for their banking needs.
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
