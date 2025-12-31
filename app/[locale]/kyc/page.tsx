import { getTranslations } from 'next-intl/server';
import { unstable_setRequestLocale } from 'next-intl/server';
import { KYCWizardProvider } from '@/contexts/KYCWizardContext';
import { KYCWizard } from '@/components/kyc/KYCWizard';

export default async function KYCPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  unstable_setRequestLocale(locale);
  const t = await getTranslations('kyc');

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12">
      <div className="container mx-auto max-w-4xl px-6">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-brand-dark mb-4">
            {t('title')}
          </h1>
          <p className="text-brand-grayMed">
            {t('description')}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <KYCWizardProvider>
            <KYCWizard />
          </KYCWizardProvider>
        </div>
      </div>
    </div>
  );
}
