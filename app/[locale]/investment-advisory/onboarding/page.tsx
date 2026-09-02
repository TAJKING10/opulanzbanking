import dynamic from "next/dynamic";

const IATPageContent = dynamic(
  () =>
    import("@/app/[locale]/investment-advisory-test/iat-page-content").then(
      (m) => m.IATPageContent
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-gold border-t-transparent" />
      </div>
    ),
  }
);

export default function InvestmentAdvisoryOnboardingPage({
  params,
}: {
  params: { locale: string };
}) {
  return <IATPageContent params={params} />;
}
