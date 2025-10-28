import { getTranslations } from 'next-intl/server';
import { unstable_setRequestLocale } from 'next-intl/server';
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
    },
    {
      title: t('nav.openAccount'),
      description: t('home.services.banking.description'),
      image: 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?w=800&h=500&fit=crop',
      href: `/${locale}/open-account`,
    },
    {
      title: t('nav.companyFormation'),
      description: t('home.services.formation.description'),
      image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=500&fit=crop',
      href: `/${locale}/company-formation`,
    },
    {
      title: t('services.tax.title'),
      description: t('services.tax.description'),
      image: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800&h=500&fit=crop',
      href: `/${locale}/tax-advisory`,
    },
    {
      title: t('services.investment.title'),
      description: t('services.investment.description'),
      image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=500&fit=crop',
      href: `/${locale}/investment-advisory`,
    },
    {
      title: t('services.lifeInsurance.title'),
      description: t('services.lifeInsurance.description'),
      image: 'https://images.unsplash.com/photo-1551836022-4c4c79ecde51?w=800&h=500&fit=crop',
      href: `/${locale}/life-insurance`,
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
      <section id="services" className="bg-white py-20 md:py-28">
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
      <section className="bg-brand-off py-20 md:py-28">
        <div className="container mx-auto max-w-7xl px-6">
          <SectionHeading
            overline={t('home.trust.title')}
            title={t('home.trust.description')}
            description={t('home.trust.summary')}
          />
          <div className="grid gap-8 md:grid-cols-2">
            <div className="card-hover group rounded-2xl border border-brand-grayLight/30 bg-white p-8 text-center shadow-sm transition-all duration-300">
              <div className="mb-4 text-4xl font-bold text-brand-gold transition-transform duration-300 group-hover:scale-110">
                ACPR
              </div>
              <h3 className="mb-2 text-lg font-bold text-brand-dark">{t('home.regulatory.france')}</h3>
              <p className="text-sm text-brand-grayMed">
                {t('home.regulatory.acpr')}
              </p>
            </div>
            <div className="card-hover group rounded-2xl border border-brand-grayLight/30 bg-white p-8 text-center shadow-sm transition-all duration-300">
              <div className="mb-4 text-4xl font-bold text-brand-gold transition-transform duration-300 group-hover:scale-110">AMF</div>
              <h3 className="mb-2 text-lg font-bold text-brand-dark">{t('home.regulatory.france')}</h3>
              <p className="text-sm text-brand-grayMed">
                {t('home.regulatory.amf')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="hero-gradient py-20 md:py-28">
        <div className="container mx-auto max-w-4xl px-6 text-center">
          <h2 className="mb-6 text-balance text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            {t('home.cta.title')}
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-balance text-lg text-white/90">
            {t('home.cta.description')}
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href={`/${locale}/open-account`}
              className="inline-flex h-14 min-w-48 items-center justify-center rounded-2xl bg-white px-8 text-base font-semibold text-brand-dark shadow-sm transition-all hover:bg-gray-50"
            >
              {t('common.getStarted')}
            </a>
            <a
              href={`/${locale}/support`}
              className="inline-flex h-14 min-w-48 items-center justify-center rounded-2xl border-2 border-white bg-transparent px-8 text-base font-semibold text-white transition-all hover:bg-white/10"
            >
              {t('home.cta.contact')}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
