import Link from 'next/link';
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
      title: 'Open a Personal Account',
      description: 'Start your banking journey with a personal current account or explore private banking options.',
      image: 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?w=800&h=500&fit=crop',
      href: `/${locale}/open-account/personal`,
    },
    {
      title: 'Open a Business Account',
      description: 'Get a business account for your existing company or start a new company with integrated banking.',
      image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=500&fit=crop',
      href: `/${locale}/open-account/business`,
    },
  ];

  return (
    <>
      <Hero
        title="Welcome to Opulanz"
        subtitle="Your gateway to European banking. Open a personal or business account with our partner banks."
        primaryCta={{
          label: 'Get Started',
          href: '#accounts',
        }}
        secondaryCta={{
          label: 'How It Works',
          href: '#how-it-works',
        }}
      />

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-white py-20 md:py-28">
        <div className="container mx-auto max-w-7xl px-6">
          <SectionHeading
            overline="How Opulanz Works"
            title="Your Path to European Banking"
            description="We connect you with trusted banking partners across Europe. Choose your account type, complete the application, and we'll match you with the right bank."
          />
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand-gold/10 text-2xl font-bold text-brand-gold">
                1
              </div>
              <h3 className="mb-3 text-xl font-bold text-brand-dark">Choose Account Type</h3>
              <p className="text-sm text-brand-grayMed">
                Select personal or business account based on your needs
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand-gold/10 text-2xl font-bold text-brand-gold">
                2
              </div>
              <h3 className="mb-3 text-xl font-bold text-brand-dark">Complete Application</h3>
              <p className="text-sm text-brand-grayMed">
                Fill in your details and upload required documents
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand-gold/10 text-2xl font-bold text-brand-gold">
                3
              </div>
              <h3 className="mb-3 text-xl font-bold text-brand-dark">Get Matched</h3>
              <p className="text-sm text-brand-grayMed">
                We connect you with Opulanz Partner Bank for account opening
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Account Types Section */}
      <section id="accounts" className="bg-gray-50 py-20 md:py-28">
        <div className="container mx-auto max-w-7xl px-6">
          <SectionHeading
            overline="Account Options"
            title="Choose Your Banking Solution"
            description="Whether you need personal banking or business banking, we have the right solution for you."
          />
          <div className="grid gap-8 md:grid-cols-2">
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
            Ready to Open Your Account?
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-balance text-lg text-white/90">
            Start your banking journey today. Choose personal or business account and complete your application in minutes.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href={`/${locale}/open-account/personal`}
              className="inline-flex h-14 min-w-48 items-center justify-center rounded-2xl bg-white px-8 text-base font-semibold text-brand-dark shadow-sm transition-all hover:bg-gray-50"
            >
              Personal Account
            </a>
            <a
              href={`/${locale}/open-account/business`}
              className="inline-flex h-14 min-w-48 items-center justify-center rounded-2xl border-2 border-white bg-transparent px-8 text-base font-semibold text-white transition-all hover:bg-white/10"
            >
              Business Account
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
