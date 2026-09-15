import dynamic from "next/dynamic";

// Disable SSR — this page uses client-only hooks (useTranslations,
// framer-motion, DocuSign, Calendly). Same strategy as the parent page.
const IATApplyContent = dynamic(
  () =>
    import(
      "@/app/[locale]/investment-advisory-test/apply/iat-apply-content"
    ).then((m) => m.IATApplyContent),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-gold border-t-transparent" />
      </div>
    ),
  }
);

export default function IATApplyPage({
  params,
}: {
  params: { locale: string };
}) {
  return <IATApplyContent params={params} />;
}
