import { useTranslations } from 'next-intl';
import { Hero } from '@/components/hero';
import { SectionHeading } from '@/components/section-heading';
import { ServiceCard } from '@/components/service-card';

export default function HomePage() {
  const t = useTranslations();

  const services = [
    {
      title: t('services.accounting.title'),
      description: t('services.accounting.description'),
      image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=500&fit=crop',
      href: '/invoicing-accounting',
    },
    {
      title: t('nav.openAccount'),
      description: 'Professional business banking accounts for individuals and companies',
      image: 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?w=800&h=500&fit=crop',
      href: '/open-account',
    },
    {
      title: t('nav.companyFormation'),
      description: 'Complete company formation services in Luxembourg',
      image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=500&fit=crop',
      href: '/company-formation',
    },
    {
      title: t('services.tax.title'),
      description: t('services.tax.description'),
      image: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800&h=500&fit=crop',
      href: '/tax-advisory',
    },
    {
      title: t('services.investment.title'),
      description: t('services.investment.description'),
      image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=500&fit=crop',
      href: '/investment-advisory',
    },
    {
      title: t('services.lifeInsurance.title'),
      description: t('services.lifeInsurance.description'),
      image: 'https://images.unsplash.com/photo-1551836022-4c4c79ecde51?w=800&h=500&fit=crop',
      href: '/life-insurance',
    },
  ];

  return (
    <>
      <Hero
        title={t('hero.home.title')}
        subtitle={t('hero.home.subtitle')}
        primaryCta={{
          label: t('hero.home.primaryCta'),
          href: '/open-account',
        }}
        secondaryCta={{
          label: t('hero.home.secondaryCta'),
          href: '#services',
        }}
      />

      {/* Services Section */}
      <section id="services" className="bg-brand-off py-20 md:py-28">
        <div className="container mx-auto max-w-7xl px-6">
          <SectionHeading
            overline="Our Services"
            title="Everything you need to grow your business"
            description="From banking to advisory, we provide comprehensive financial services for modern entrepreneurs."
          />
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service.title} {...service} />
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-brand-grayLight py-20 md:py-28">
        <div className="container mx-auto max-w-7xl px-6">
          <SectionHeading
            overline="Trusted & Regulated"
            title="Your business in safe hands"
            description="Opulanz operates under strict regulatory oversight to ensure your financial security."
          />
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl bg-white p-8 text-center">
              <div className="mb-4 text-4xl font-bold text-brand-gold">CSSF</div>
              <h3 className="mb-2 text-lg font-bold text-brand-dark">
                Luxembourg
              </h3>
              <p className="text-sm text-brand-grayMed">
                Regulated by Commission de Surveillance du Secteur Financier
              </p>
            </div>
            <div className="rounded-2xl bg-white p-8 text-center">
              <div className="mb-4 text-4xl font-bold text-brand-gold">
                ACPR
              </div>
              <h3 className="mb-2 text-lg font-bold text-brand-dark">France</h3>
              <p className="text-sm text-brand-grayMed">
                Autorité de Contrôle Prudentiel et de Résolution
              </p>
            </div>
            <div className="rounded-2xl bg-white p-8 text-center">
              <div className="mb-4 text-4xl font-bold text-brand-gold">AMF</div>
              <h3 className="mb-2 text-lg font-bold text-brand-dark">France</h3>
              <p className="text-sm text-brand-grayMed">
                Autorité des Marchés Financiers
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="hero-gradient py-20 md:py-28">
        <div className="container mx-auto max-w-4xl px-6 text-center">
          <h2 className="mb-6 text-balance text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            Ready to get started?
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-balance text-lg text-white/90">
            Open your account in minutes and access professional banking services
            tailored for your business.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="/open-account"
              className="inline-flex h-14 min-w-48 items-center justify-center rounded-2xl bg-white px-8 text-base font-semibold text-brand-dark shadow-sm transition-all hover:bg-brand-off"
            >
              {t('common.getStarted')}
            </a>
            <a
              href="/support"
              className="inline-flex h-14 min-w-48 items-center justify-center rounded-2xl border-2 border-white bg-transparent px-8 text-base font-semibold text-white transition-all hover:bg-white/10"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
