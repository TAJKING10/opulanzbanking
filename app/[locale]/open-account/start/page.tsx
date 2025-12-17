"use client";

import * as React from "react";
import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { AccountMode } from "@/types/account-opening";

function AccountOpeningContent({ locale }: { locale: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mode = (searchParams.get("mode") as AccountMode) || "personal";

  useEffect(() => {
    // Redirect to the appropriate account opening page based on mode
    if (mode === "personal") {
      router.replace(`/${locale}/open-account/personal`);
    } else if (mode === "business") {
      router.replace(`/${locale}/open-account/business`);
    }
  }, [mode, locale, router]);

  return null;
}

function LoadingFallback() {
  const t = useTranslations("accountOpening.start");

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-gold border-r-transparent"></div>
        <p className="mt-4 text-brand-grayMed">{t("loading")}</p>
      </div>
    </div>
  );
}

export default function AccountOpeningStartPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AccountOpeningContent locale={locale} />
    </Suspense>
  );
}
