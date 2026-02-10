import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { unstable_setRequestLocale } from 'next-intl/server';
import { ArrowRight } from 'lucide-react';
import { Hero } from '@/components/hero';
import { SectionHeading } from '@/components/section-heading';
import { ServiceCard } from '@/components/service-card';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  unstable_setRequestLocale(locale);
  const t = await getTranslations();

  const services = [
    {
      title: t('services.accounting.title'),
      description: t('services.accounting.description'),
      image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=500&fit=crop',
      href: `/${locale}/invoicing-accounting`,
      ctaLabel: t('common.learnMore'),
      exploreLabel: t('common.explore'),
    },
    {
      title: t('nav.openAccount'),
      description: t('home.services.banking.description'),
      image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=500&fit=crop',
      href: `/${locale}/open-account`,
      ctaLabel: t('common.learnMore'),
      exploreLabel: t('common.explore'),
    },
    {
      title: t('nav.companyFormation'),
      description: t('home.services.formation.description'),
      image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=500&fit=crop',
      href: `/${locale}/company-formation`,
      ctaLabel: t('common.learnMore'),
      exploreLabel: t('common.explore'),
    },
    {
      title: t('services.tax.title'),
      description: t('services.tax.description'),
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=500&fit=crop',
      href: `/${locale}/tax-advisory`,
      ctaLabel: t('common.learnMore'),
      exploreLabel: t('common.explore'),
    },
    {
      title: t('services.investment.title'),
      description: t('services.investment.description'),
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop',
      href: `/${locale}/investment-advisory`,
      ctaLabel: t('common.learnMore'),
      exploreLabel: t('common.explore'),
    },
    {
      title: t('services.lifeInsurance.title'),
      description: t('services.lifeInsurance.description'),
      image: 'https://images.unsplash.com/photo-1551836022-4c4c79ecde51?w=800&h=500&fit=crop',
      href: `/${locale}/life-insurance`,
      ctaLabel: t('common.learnMore'),
      exploreLabel: t('common.explore'),
    },
    {
      title: t('services.spvInvestment.title'),
      description: t('services.spvInvestment.description'),
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=500&fit=crop',
      href: `/${locale}/spv-investment`,
    },
  ];

  return (
    <>
      <Hero
        title={t('hero.home.title')}
        subtitle={t('hero.home.subtitle')}
        primaryCta={{
          label: t('hero.home.primaryCta'),
          href: `/${locale}/open-account`,
        }}
        secondaryCta={{
          label: t('hero.home.secondaryCta'),
          href: '#services',
        }}
      />

      {/* Services Section */}
      <section id="services" className="bg-white py-12 md:py-16">
        <div className="container mx-auto max-w-7xl px-6">
          <SectionHeading
            overline={t('home.services.title')}
            title={t('home.services.description')}
            description={t('home.services.summary')}
          />
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <ServiceCard
                key={service.title}
                {...service}
                style={{ animationDelay: `${index * 100}ms` }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-gradient-to-br from-brand-off via-white to-brand-goldLight/10 py-12 md:py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-brand-gold rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-goldLight rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto max-w-7xl px-6 relative z-10">
          <SectionHeading
            overline={t('home.trust.title')}
            title={t('home.trust.description')}
            description={t('home.trust.summary')}
          />
          <div className="grid gap-8 md:grid-cols-2">
            <div className="card-hover group rounded-2xl border border-brand-grayLight/30 bg-white/80 backdrop-blur-sm p-10 text-center shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:rotate-1 transform-gpu">
              <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-brand-gold to-brand-goldLight shadow-lg transition-transform duration-500 group-hover:scale-125 group-hover:rotate-12">
                <div className="text-3xl font-bold text-white">
                  ACPR
                </div>
              </div>
              <h3 className="mb-3 text-xl font-bold text-brand-dark group-hover:text-brand-gold transition-colors">{t('home.regulatory.france')}</h3>
              <p className="text-sm text-brand-grayMed leading-relaxed">
                {t('home.regulatory.acpr')}
              </p>
              <div className="mt-6 h-1 w-16 mx-auto bg-gradient-to-r from-transparent via-brand-gold to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            <div className="card-hover group rounded-2xl border border-brand-grayLight/30 bg-white/80 backdrop-blur-sm p-10 text-center shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:-rotate-1 transform-gpu">
              <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-brand-goldLight to-brand-gold shadow-lg transition-transform duration-500 group-hover:scale-125 group-hover:-rotate-12">
                <div className="text-3xl font-bold text-white">AMF</div>
              </div>
              <h3 className="mb-3 text-xl font-bold text-brand-dark group-hover:text-brand-gold transition-colors">{t('home.regulatory.france')}</h3>
              <p className="text-sm text-brand-grayMed leading-relaxed">
                {t('home.regulatory.amf')}
              </p>
              <div className="mt-6 h-1 w-16 mx-auto bg-gradient-to-r from-transparent via-brand-gold to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="hero-gradient py-12 md:py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-brand-goldLight rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        <div className="container mx-auto max-w-4xl px-6 text-center relative z-10">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-4 py-2 text-sm font-medium text-white border border-white/20">
            <span className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            {t('common.readyToStart')}
          </div>
          <h2 className="mb-6 text-balance text-3xl font-bold text-white md:text-4xl lg:text-5xl drop-shadow-lg">
            {t('home.cta.title')}
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-balance text-lg text-white/90 drop-shadow">
            {t('home.cta.description')}
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={`/${locale}/open-account`}
              className="group inline-flex h-14 min-w-48 items-center justify-center rounded-2xl bg-white px-8 text-base font-semibold text-brand-dark shadow-lg transition-all hover:shadow-2xl hover:scale-105 hover:-translate-y-1"
            >
              {t('common.getStarted')}
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href={`/${locale}/support`}
              className="group inline-flex h-14 min-w-48 items-center justify-center rounded-2xl border-2 border-white bg-transparent px-8 text-base font-semibold text-white transition-all hover:bg-white hover:text-brand-dark hover:scale-105 hover:-translate-y-1"
            >
              {t('home.cta.contact')}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
