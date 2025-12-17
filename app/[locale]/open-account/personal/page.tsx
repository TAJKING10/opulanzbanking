"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { PersonalFunnel } from "@/components/account-opening/personal-funnel";

export default function PersonalAccountPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;

  const handleSwitchMode = () => {
    router.push(`/${locale}/open-account/business`);
  };

  return <PersonalFunnel onSwitchMode={handleSwitchMode} locale={locale} />;
}
