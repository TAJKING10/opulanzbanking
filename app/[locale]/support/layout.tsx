import type { Metadata } from 'next';
import { generateSEOMetadata } from '@/app/[locale]/metadata';
import { PageJsonLd } from '@/components/seo/page-json-ld';

const SUPPORT_FAQ = {
  en: [
    {
      question: 'How long does it take to open an account?',
      answer:
        'Individual accounts are typically approved within 24–48 hours. Business accounts take 3–5 business days depending on the complexity of the application.',
    },
    {
      question: 'What documents do I need?',
      answer:
        'For individuals: a valid government-issued ID, proof of address, and a selfie. For businesses: company registration documents, UBO declaration, and director IDs.',
    },
    {
      question: 'What are the monthly fees?',
      answer:
        'Individual accounts start at €10/month. Business accounts start at €25/month. Full fee schedules are available in your account settings.',
    },
    {
      question: 'Which currencies are supported?',
      answer:
        'We support EUR, USD, GBP, and CHF. Each account comes with a dedicated multi-currency IBAN for seamless international payments.',
    },
    {
      question: 'How do I contact my account manager?',
      answer:
        'Once your account is approved, you will be assigned a dedicated account manager reachable by email or phone during business hours.',
    },
  ],
  fr: [
    {
      question: 'Combien de temps faut-il pour ouvrir un compte ?',
      answer:
        'Les comptes individuels sont généralement approuvés dans les 24 à 48 heures. Les comptes professionnels prennent 3 à 5 jours ouvrables selon la complexité du dossier.',
    },
    {
      question: 'Quels documents sont nécessaires ?',
      answer:
        'Pour les particuliers : une pièce d’identité valide, un justificatif de domicile et un selfie. Pour les entreprises : les documents d’immatriculation, la déclaration UBO et les pièces d’identité des dirigeants.',
    },
    {
      question: 'Quels sont les frais mensuels ?',
      answer:
        'Les comptes individuels débutent à 10 €/mois. Les comptes professionnels débutent à 25 €/mois. Les grilles tarifaires complètes sont disponibles dans les paramètres de votre compte.',
    },
    {
      question: 'Quelles devises sont prises en charge ?',
      answer:
        'Nous prenons en charge l’EUR, l’USD, la GBP et le CHF. Chaque compte est associé à un IBAN multi-devises dédié pour des paiements internationaux simplifiés.',
    },
    {
      question: 'Comment contacter mon gestionnaire de compte ?',
      answer:
        'Une fois votre compte approuvé, un gestionnaire de compte dédié vous sera attribué, joignable par e-mail ou téléphone pendant les heures de bureau.',
    },
  ],
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return generateSEOMetadata({
    locale,
    pathname: '/support',
    title:
      locale === 'fr'
        ? "Assistance Client — Centre d'Aide Opulanz"
        : 'Customer Support — Opulanz Help Centre',
    description:
      locale === 'fr'
        ? "Contactez l'équipe Opulanz pour toute question sur vos comptes, services financiers, ou demandes de renseignements. Support disponible en français et en anglais."
        : 'Contact the Opulanz team for questions about your accounts, financial services, or general enquiries. Support available in English and French.',
  });
}

export default async function SupportLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isFr = locale === 'fr';
  const name = isFr ? 'Assistance client' : 'Customer Support';

  return (
    <>
      <PageJsonLd
        locale={locale}
        pathname="/support"
        name={name}
        description={
          isFr
            ? 'Contactez Opulanz pour vos comptes et services financiers. Support en français et en anglais.'
            : 'Contact Opulanz about accounts and financial services. Support in English and French.'
        }
        pageType="ContactPage"
        breadcrumbs={[
          { name: isFr ? 'Accueil' : 'Home', path: '' },
          { name, path: '/support' },
        ]}
        faq={locale === 'fr' ? SUPPORT_FAQ.fr : SUPPORT_FAQ.en}
      />
      {children}
    </>
  );
}
