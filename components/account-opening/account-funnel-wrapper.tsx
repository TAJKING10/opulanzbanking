/**
 * Account Funnel Wrapper
 * Manages mode switching between Personal and Business funnels
 */

"use client";

import * as React from "react";
import { PersonalFunnel } from "./personal-funnel";
import { BusinessFunnel } from "./business-funnel";
import type { AccountMode } from "@/types/account-opening";

interface AccountFunnelWrapperProps {
  initialMode?: AccountMode;
  locale: string;
}

export function AccountFunnelWrapper({
  initialMode = "personal",
  locale,
}: AccountFunnelWrapperProps) {
  const [mode, setMode] = React.useState<AccountMode>(initialMode);

  const switchToPersonal = () => setMode("personal");
  const switchToBusiness = () => setMode("business");

  return (
    <>
      {mode === "personal" ? (
        <PersonalFunnel onSwitchMode={switchToBusiness} locale={locale} />
      ) : (
        <BusinessFunnel onSwitchMode={switchToPersonal} locale={locale} />
      )}
    </>
  );
}
