"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { AccountFunnelWrapper } from "@/components/account-opening/account-funnel-wrapper";
import type { AccountMode } from "@/types/account-opening";

function AccountOpeningContent({ locale }: { locale: string }) {
  const searchParams = useSearchParams();
  const mode = (searchParams.get("mode") as AccountMode) || "personal";

  return (
    <div className="min-h-screen bg-gray-50">
      <AccountFunnelWrapper initialMode={mode} locale={locale} />
    </div>
  );
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
