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
      title: t('hero.about.strength1Title'),
      description: t('hero.about.strength1Description'),
    },
    {
      icon: Target,
      title: t('hero.about.strength2Title'),
      description: t('hero.about.strength2Description'),
    },
    {
      icon: Globe,
      title: t('hero.about.strength3Title'),
      description: t('hero.about.strength3Description'),
    },
  ];

  const certifications = [
    {
      icon: BadgeCheck,
      title: t('hero.about.cert1Title'),
      description: t('hero.about.cert1Description'),
    },
    {
      icon: Award,
      title: t('hero.about.cert2Title'),
      description: t('hero.about.cert2Description'),
    },
    {
      icon: Shield,
      title: t('hero.about.cert3Title'),
      description: t('hero.about.cert3Description'),
    },
    {
      icon: FileCheck,
      title: t('hero.about.cert4Title'),
      description: t('hero.about.cert4Description'),
    },
  ];

  const stats = [
    { number: t('hero.about.statsYears'), label: t('hero.about.statsYearsLabel') },
    { number: t('hero.about.statsClients'), label: t('hero.about.statsClientsLabel') },
  ];

  const benefits = [
    { title: t('hero.about.benefit1Title'), description: t('hero.about.benefit1Description') },
    { title: t('hero.about.benefit2Title'), description: t('hero.about.benefit2Description') },
    { title: t('hero.about.benefit3Title'), description: t('hero.about.benefit3Description') },
    { title: t('hero.about.benefit4Title'), description: t('hero.about.benefit4Description') },
    { title: t('hero.about.benefit5Title'), description: t('hero.about.benefit5Description') },
    { title: t('hero.about.benefit6Title'), description: t('hero.about.benefit6Description') },
  ];

  return (
    <>
      <Hero
        title={t('hero.about.title')}
        subtitle={t('hero.about.subtitle')}
      />

      {/* Our Story */}
      <section className="bg-white py-12 md:py-16">
        <div className="container mx-auto max-w-4xl px-6">
          <SectionHeading
            overline={t('hero.about.storyOverline')}
            title={t('hero.about.storyTitle')}
            align="center"
            className="mb-12"
          />

          <div className="space-y-6">
            <div className="rounded-2xl bg-gradient-to-br from-brand-goldLight/20 to-brand-gold/10 p-8 border-l-4 border-brand-gold">
              <p className="text-base text-brand-grayMed leading-relaxed">
                {t('hero.about.storyIntro')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-xl bg-white p-6 shadow-sm border border-brand-grayLight">
                <div className="flex items-start gap-3 mb-3">
                  <Target className="h-6 w-6 text-brand-gold flex-shrink-0 mt-1" />
                  <h3 className="text-lg font-bold text-brand-dark">{t('hero.about.missionTitle')}</h3>
                </div>
                <p className="text-base text-brand-grayMed leading-relaxed">
                  {t('hero.about.missionText')}
                </p>
              </div>

              <div className="rounded-xl bg-white p-6 shadow-sm border border-brand-grayLight">
                <div className="flex items-start gap-3 mb-3">
                  <Eye className="h-6 w-6 text-brand-gold flex-shrink-0 mt-1" />
                  <h3 className="text-lg font-bold text-brand-dark">{t('hero.about.visionTitle')}</h3>
                </div>
                <p className="text-base text-brand-grayMed leading-relaxed">
                  {t('hero.about.visionText')}
                </p>
              </div>
            </div>

            <p className="text-base text-brand-grayMed leading-relaxed text-center">
              {t('hero.about.storyClosing')}
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative bg-gradient-to-br from-brand-dark via-brand-grayDark to-brand-dark py-12 md:py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-gold rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-gold rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        <div className="container mx-auto max-w-5xl px-6 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="text-brand-gold text-sm font-bold tracking-wider uppercase">{t('hero.about.impactOverline')}</span>
              <div className="h-1 w-16 bg-gradient-to-r from-brand-gold to-brand-goldDark mx-auto mt-2 rounded-full"></div>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              {t('hero.about.impactTitle')}
            </h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              {t('hero.about.impactSubtitle')}
            </p>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {stats.map((stat, index) => (
              <div key={index} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-gold via-brand-goldDark to-brand-gold rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl scale-105"></div>
                <Card className="relative border-2 border-brand-gold/30 bg-white/10 backdrop-blur-md text-center shadow-2xl hover:shadow-brand-gold/20 transition-all duration-500 hover:scale-110 hover:-translate-y-2 min-w-[280px]">
                  <CardContent className="p-10">
                    <div className="mb-4 text-6xl md:text-7xl font-black bg-gradient-to-br from-brand-gold via-brand-goldLight to-brand-goldDark bg-clip-text text-transparent drop-shadow-lg">
                      {stat.number}
                    </div>
                    <div className="h-1 w-12 bg-gradient-to-r from-brand-gold to-brand-goldDark mx-auto mb-4 rounded-full"></div>
                    <p className="text-lg font-bold text-white tracking-wide">
                      {stat.label}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Strengths */}
      <section className="bg-white py-12 md:py-16">
        <div className="container mx-auto max-w-7xl px-6">
          <SectionHeading
            overline={t('hero.about.strengthsOverline')}
            title={t('hero.about.strengthsTitle')}
            description={t('hero.about.strengthsDescription')}
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
                    <p className="text-base text-brand-grayMed leading-relaxed">
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
      <section className="bg-brand-off py-12 md:py-16">
        <div className="container mx-auto max-w-7xl px-6">
          <SectionHeading
            overline={t('hero.about.licensesOverline')}
            title={t('hero.about.licensesTitle')}
            description={t('hero.about.licensesDescription')}
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
      <section className="bg-white py-12 md:py-16">
        <div className="container mx-auto max-w-4xl px-6">
          <SectionHeading
            title={t('hero.about.whyTitle')}
            description={t('hero.about.whyDescription')}
            align="center"
            className="mb-12"
          />

          <div className="space-y-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-none">
                <CardContent className="flex items-start gap-4 p-6">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-brand-gold" />
                  </div>
                  <div>
                    <h3 className="mb-2 text-lg font-bold text-brand-dark">
                      {benefit.title}
                    </h3>
                    <p className="text-base text-brand-grayMed leading-relaxed">
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
      <section className="hero-gradient py-12 md:py-16">
        <div className="container mx-auto max-w-4xl px-6 text-center">
          <h2 className="mb-6 text-balance text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            {t('hero.about.ctaTitle')}
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-balance text-lg text-white/90">
            {t('hero.about.ctaDescription')}
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="min-w-48 bg-white text-brand-dark hover:bg-gray-50"
            >
              <Link href={`/${locale}/open-account`}>{t('hero.about.ctaOpenAccount')}</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="min-w-48 border-2 border-white bg-transparent text-white hover:bg-white/10"
            >
              <Link href={`/${locale}/support`}>{t('hero.about.ctaContact')}</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
