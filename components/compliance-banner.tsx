"use client";

import * as React from "react";
import { AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

interface ComplianceBannerProps {
  market: "FR" | "LU";
  productType?: "banking" | "investment" | "insurance" | "mortgage";
  dismissible?: boolean;
  className?: string;
}

export function ComplianceBanner({
  market,
  productType = "banking",
  dismissible = true,
  className,
}: ComplianceBannerProps) {
  const t = useTranslations();
  const [isDismissed, setIsDismissed] = React.useState(false);

  React.useEffect(() => {
    const dismissed = localStorage.getItem(
      `compliance-banner-${market}-${productType}`
    );
    if (dismissed) {
      setIsDismissed(true);
    }
  }, [market, productType]);

  const handleDismiss = () => {
    localStorage.setItem(`compliance-banner-${market}-${productType}`, "true");
    setIsDismissed(true);
  };

  if (isDismissed) return null;

  const message = t(`compliance.${market}.${productType}`);

  return (
    <div
      className={cn(
        "border-l-4 border-brand-gold bg-accent-beige/30 px-6 py-4",
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-4">
        <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-goldDark" />
        <div className="flex-1">
          <p className="text-sm text-brand-dark">{message}</p>
        </div>
        {dismissible && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="flex-shrink-0"
            aria-label="Dismiss notice"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
