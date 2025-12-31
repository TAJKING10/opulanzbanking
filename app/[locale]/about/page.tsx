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
  const t = useTranslations('about');
  const locale = useLocale();

  const strengths = [
    {
      icon: Users,
      title: t('strengths.banking.title'),
      description: t('strengths.banking.description'),
    },
    {
      icon: Target,
      title: t('strengths.platform.title'),
      description: t('strengths.platform.description'),
    },
    {
      icon: Globe,
      title: t('strengths.technology.title'),
      description: t('strengths.technology.description'),
    },
  ];

  const certifications = [
    {
      icon: BadgeCheck,
      title: t('certifications.stateLicensed.title'),
      description: t('certifications.stateLicensed.description'),
    },
    {
      icon: Award,
      title: t('certifications.certified.title'),
      description: t('certifications.certified.description'),
    },
    {
      icon: Shield,
      title: t('certifications.bonded.title'),
      description: t('certifications.bonded.description'),
    },
    {
      icon: FileCheck,
      title: t('certifications.accredited.title'),
      description: t('certifications.accredited.description'),
    },
  ];

  const stats = [
    { number: "18+", label: t('stats.yearsExperience') },
    { number: "500+", label: t('stats.businessClients') },
  ];

  const benefits = [
    {
      title: t('whyChoose.benefits.platform.title'),
      description: t('whyChoose.benefits.platform.description'),
    },
    {
      title: t('whyChoose.benefits.experience.title'),
      description: t('whyChoose.benefits.experience.description'),
    },
    {
      title: t('whyChoose.benefits.technology.title'),
      description: t('whyChoose.benefits.technology.description'),
    },
    {
      title: t('whyChoose.benefits.focus.title'),
      description: t('whyChoose.benefits.focus.description'),
    },
    {
      title: t('whyChoose.benefits.quality.title'),
      description: t('whyChoose.benefits.quality.description'),
    },
    {
      title: t('whyChoose.benefits.vision.title'),
      description: t('whyChoose.benefits.vision.description'),
    },
  ];

  return (
    <>
      <Hero
        title={t('hero.title')}
        subtitle={t('hero.subtitle')}
      />

      {/* Our Story */}
      <section className="bg-white py-20 md:py-28">
        <div className="container mx-auto max-w-4xl px-6">
          <SectionHeading
            overline={t('story.overline')}
            title={t('story.title')}
            align="center"
            className="mb-12"
          />

          <div className="space-y-6">
            <div className="rounded-2xl bg-gradient-to-br from-brand-goldLight/20 to-brand-gold/10 p-8 border-l-4 border-brand-gold">
              <p className="text-base text-brand-grayMed leading-relaxed">
                {t('story.intro')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-xl bg-white p-6 shadow-sm border border-brand-grayLight">
                <div className="flex items-start gap-3 mb-3">
                  <Target className="h-6 w-6 text-brand-gold flex-shrink-0 mt-1" />
                  <h3 className="text-lg font-bold text-brand-dark">{t('story.mission.title')}</h3>
                </div>
                <p className="text-base text-brand-grayMed leading-relaxed">
                  {t('story.mission.description')}
                </p>
              </div>

              <div className="rounded-xl bg-white p-6 shadow-sm border border-brand-grayLight">
                <div className="flex items-start gap-3 mb-3">
                  <Eye className="h-6 w-6 text-brand-gold flex-shrink-0 mt-1" />
                  <h3 className="text-lg font-bold text-brand-dark">{t('story.vision.title')}</h3>
                </div>
                <p className="text-base text-brand-grayMed leading-relaxed">
                  {t('story.vision.description')}
                </p>
              </div>
            </div>

            <p className="text-base text-brand-grayMed leading-relaxed text-center">
              {t('story.summary')}
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative bg-gradient-to-br from-brand-dark via-brand-grayDark to-brand-dark py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-gold rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-gold rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        <div className="container mx-auto max-w-5xl px-6 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="text-brand-gold text-sm font-bold tracking-wider uppercase">{t('stats.overline')}</span>
              <div className="h-1 w-16 bg-gradient-to-r from-brand-gold to-brand-goldDark mx-auto mt-2 rounded-full"></div>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              {t('stats.title')}
            </h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              {t('stats.subtitle')}
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
      <section className="bg-white py-20 md:py-28">
        <div className="container mx-auto max-w-7xl px-6">
          <SectionHeading
            overline={t('strengths.overline')}
            title={t('strengths.title')}
            description={t('strengths.subtitle')}
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
      <section className="bg-brand-off py-20 md:py-28">
        <div className="container mx-auto max-w-7xl px-6">
          <SectionHeading
            overline={t('certifications.overline')}
            title={t('certifications.title')}
            description={t('certifications.subtitle')}
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
            title={t('whyChoose.title')}
            description={t('whyChoose.subtitle')}
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
      <section className="hero-gradient py-20 md:py-28">
        <div className="container mx-auto max-w-4xl px-6 text-center">
          <h2 className="mb-6 text-balance text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            {t('cta.title')}
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-balance text-lg text-white/90">
            {t('cta.subtitle')}
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="min-w-48 bg-white text-brand-dark hover:bg-gray-50"
            >
              <Link href={`/${locale}/open-account`}>{t('cta.openAccount')}</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="min-w-48 border-2 border-white bg-transparent text-white hover:bg-white/10"
            >
              <Link href={`/${locale}/support`}>{t('cta.contactUs')}</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
