"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { AccountFunnelWrapper } from "@/components/account-opening/account-funnel-wrapper";
import type { AccountMode } from "@/types/account-opening";

export default function AccountOpeningStartPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const searchParams = useSearchParams();
  const mode = (searchParams.get("mode") as AccountMode) || "personal";

  return (
    <div className="min-h-screen bg-gray-50">
      <AccountFunnelWrapper initialMode={mode} locale={locale} />
    </div>
  );
}
