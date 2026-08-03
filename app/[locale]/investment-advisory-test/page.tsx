import dynamic from "next/dynamic";

// Disable SSR entirely for this page — it's noindex and uses client-only hooks
// (useTranslations, framer-motion, DocuSign, Calendly). This eliminates all
// React hydration mismatches (#418 / #423) that caused the white-screen crash.
const IATPageContent = dynamic(
  () => import("./iat-page-content").then((m) => m.IATPageContent),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-gold border-t-transparent" />
      </div>
    ),
  }
);

export default function InvestmentAdvisoryTestPage({
  params,
}: {
  params: { locale: string };
}) {
  return <IATPageContent params={params} />;
}
