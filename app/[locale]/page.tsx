import Link from 'next/link';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { unstable_setRequestLocale } from 'next-intl/server';
import { ArrowRight } from 'lucide-react';
import { Hero } from '@/components/hero';
import { AppInstallBanner } from '@/components/app-install-banner';
import { SectionHeading } from '@/components/section-heading';
import { ServiceCard } from '@/components/service-card';
import { PageGuidance } from '@/components/page-guidance';
import { VideoPopup } from '@/components/video-popup';
import { generateSEOMetadata } from './metadata';
import { PageJsonLd } from '@/components/seo/page-json-ld';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return generateSEOMetadata({
    locale,
    pathname: '',
    title:
      locale === 'fr'
        ? 'Opulanz — Plateforme Financière & Business Européenne | Luxembourg'
        : 'Opulanz — Luxembourg Financial & Business Platform | Europe',
    description:
      locale === 'fr'
        ? 'Plateforme financière et business européenne basée au Luxembourg pour les entreprises et entrepreneurs : services de paiement, comptabilité, création de société, conseil en investissement, assurance et solutions transfrontalières.'
        : 'Luxembourg-based European financial and business platform for companies and entrepreneurs: payment services, accounting, company formation assistance, investment advisory, insurance and cross-border business solutions.',
  });
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  unstable_setRequestLocale(locale);
  const t = await getTranslations();

  const services = [
    {
      id: 'svc-accounting',
      title: t('services.accounting.title'),
      description: t('services.accounting.description'),
      image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=500&fit=crop',
      href: `/${locale}/invoicing-accounting`,
      ctaLabel: t('common.learnMore'),
      exploreLabel: t('common.explore'),
    },
    {
      id: 'svc-open-account',
      title: t('nav.openAccount'),
      description: t('home.services.banking.description'),
      image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=500&fit=crop',
      href: `/${locale}/open-account`,
      ctaLabel: t('common.learnMore'),
      exploreLabel: t('common.explore'),
    },
    {
      id: 'svc-company-formation',
      title: t('nav.companyFormation'),
      description: t('home.services.formation.description'),
      image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=500&fit=crop',
      href: `/${locale}/company-formation`,
      ctaLabel: t('common.learnMore'),
      exploreLabel: t('common.explore'),
    },
    {
      id: 'svc-tax',
      title: t('services.tax.title'),
      description: t('services.tax.description'),
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=500&fit=crop',
      href: `/${locale}/tax-advisory`,
      ctaLabel: t('common.learnMore'),
      exploreLabel: t('common.explore'),
    },
    {
      id: 'svc-investment',
      title: t('services.investment.title'),
      description: t('services.investment.description'),
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop',
      href: `/${locale}/investment-advisory`,
      ctaLabel: t('common.learnMore'),
      exploreLabel: t('common.explore'),
    },
    {
      id: 'svc-insurance',
      title: t('services.lifeInsurance.title'),
      description: t('services.lifeInsurance.description'),
      image: 'https://images.unsplash.com/photo-1551836022-4c4c79ecde51?w=800&h=500&fit=crop',
      href: `/${locale}/life-insurance`,
      ctaLabel: t('common.learnMore'),
      exploreLabel: t('common.explore'),
    },
    {
      id: 'svc-mortgage',
      title: t('services.mortgage.title'),
      description: t('services.mortgage.description'),
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=500&fit=crop',
      href: `/${locale}/mortgage`,
      ctaLabel: t('common.learnMore'),
      exploreLabel: t('common.explore'),
    },
  ];

  return (
    <>
      <PageJsonLd
        locale={locale}
        pathname=""
        name={locale === 'fr' ? 'Opulanz' : 'Opulanz'}
        description={
          locale === 'fr'
            ? 'Plateforme financière et business européenne basée au Luxembourg pour les entreprises et entrepreneurs.'
            : 'Luxembourg-based European financial and business platform for companies and entrepreneurs.'
        }
        breadcrumbs={[{ name: locale === 'fr' ? 'Accueil' : 'Home', path: '' }]}
      />
      <PageGuidance
        pageKey="home"
        locale={locale}
        title="Welcome to Opulanz"
        description="Your all-in-one platform for banking, tax, investments, and more."
        steps={[
          {
            content: "Welcome to Opulanz — your complete financial services platform. Let us walk you through everything we offer.",
          },
          {
            title: "Accounting & Invoicing",
            content: "Professional accounting tools for businesses — automated invoicing, bookkeeping, payroll, VAT reporting, and financial dashboards. Ideal for freelancers and SMEs.",
            target: "#svc-accounting",
            position: "right",
          },
          {
            title: "Open an Account",
            content: "Open a personal or business banking account fully online in under 5 minutes. Includes IBAN, SEPA transfers, cards, and compliance — regulated under ACPR.",
            target: "#svc-open-account",
            position: "right",
          },
          {
            title: "Company Formation",
            content: "Register your company in France or Luxembourg — SARL, SAS, SA, and more. We handle all paperwork: legal filing, registered address, and bank account setup.",
            target: "#svc-company-formation",
            position: "right",
          },
          {
            title: "Tax Advisory",
            content: "Certified tax advisors for individuals and businesses. We handle personal tax returns, corporate tax, VAT compliance, and cross-border tax planning.",
            target: "#svc-tax",
            position: "left",
          },
          {
            title: "Investment Advisory",
            content: "MiFID II-compliant investment advice and portfolio management. Our advisors build personalized strategies covering equities, bonds, ETFs, and ESG investments.",
            target: "#svc-investment",
            position: "left",
          },
          {
            title: "Life Insurance",
            content: "Expert insurance brokerage connecting you with leading providers. Term life, whole life, and unit-linked policies — tailored to individuals and families.",
            target: "#svc-insurance",
            position: "left",
          },
          {
            title: "Ready to Begin?",
            content: "Use the navigation bar to go anywhere — open an account, book a consultation, or contact our support team. We're here to help.",
            target: "header nav",
            position: "bottom",
          },
        ]}
        tip="New here? Start by opening an account — it's free, fully online, and takes less than 5 minutes."
      />
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

      {/* <AppInstallBanner /> */}

      {/* Services Section */}
      <section id="services" className="bg-white py-12 md:py-16 lg:py-20">
        <div className="container mx-auto max-w-7xl 3xl:max-w-[1600px] 4xl:max-w-[1800px] px-4 sm:px-6 lg:px-8">
          <SectionHeading
            overline={t('home.services.title')}
            title={t('home.services.description')}
            description={t('home.services.summary')}
          />
          <div className="grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4">
            {services.map((service, index) => (
              <ServiceCard
                key={service.title}
                {...service}
                id={service.id}
                priority={index === 0}
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
        <div className="container mx-auto max-w-7xl 3xl:max-w-[1600px] 4xl:max-w-[1800px] px-4 sm:px-6 lg:px-8 relative z-10">
          <SectionHeading
            overline={t('home.trust.title')}
            title={t('home.trust.description')}
            description={t('home.trust.summary')}
          />
          <div className="mx-auto mt-8 flex w-full max-w-[720px] flex-col items-center justify-center gap-6 md:flex-row">
            <div className="w-full max-w-[330px]">
              <div className="card-hover group rounded-2xl border border-brand-grayLight/30 bg-white/80 backdrop-blur-sm p-10 text-center shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:rotate-1 transform-gpu">
                <h3 className="mb-3 text-xl font-bold text-brand-dark group-hover:text-brand-gold transition-colors">{t('home.regulatory.block1Title')}</h3>
                <p className="text-sm text-brand-grayMed leading-relaxed">
                  {t('home.regulatory.block1Desc')}
                </p>
                <div className="mt-6 h-1 w-16 mx-auto bg-gradient-to-r from-transparent via-brand-gold to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </div>
            <div className="w-full max-w-[330px]">
              <div className="card-hover group rounded-2xl border border-brand-grayLight/30 bg-white/80 backdrop-blur-sm p-10 text-center shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:-rotate-1 transform-gpu">
                <h3 className="mb-3 text-xl font-bold text-brand-dark group-hover:text-brand-gold transition-colors">{t('home.regulatory.block2Title')}</h3>
                <p className="text-sm text-brand-grayMed leading-relaxed">
                  {t('home.regulatory.block2Desc')}
                </p>
                <div className="mt-6 h-1 w-16 mx-auto bg-gradient-to-r from-transparent via-brand-gold to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
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
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
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

      {/* Floating Independent Video Widget */}
      <VideoPopup locale={locale} />
    </>
  );
}
