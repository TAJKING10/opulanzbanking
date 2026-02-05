"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Lock, Eye, EyeOff, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCustomerByAccessCode, updateCustomerLastAccess } from "@/lib/spv-data";

export default function SpvPortalLoginPage() {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations();
  const [accessCode, setAccessCode] = React.useState("");
  const [showCode, setShowCode] = React.useState(false);
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    const access = sessionStorage.getItem("spv-portal-access");
    if (access === "granted") {
      router.replace(`/${locale}/spv-investment/portal/dashboard`);
    }
  }, [locale, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 800));

    const customer = getCustomerByAccessCode(accessCode.trim());
    if (customer) {
      updateCustomerLastAccess(accessCode.trim());
      sessionStorage.setItem("spv-portal-access", "granted");
      sessionStorage.setItem("spv-portal-timestamp", Date.now().toString());
      sessionStorage.setItem("spv-portal-profile", customer.profile);
      router.push(`/${locale}/spv-investment/portal/dashboard`);
    } else {
      setError(t("spvInvestment.portal.login.error"));
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-20">
      <div className="container mx-auto max-w-md px-6">
        {/* Brand */}
        <div className="mb-8 text-center">
          <Link
            href={`/${locale}`}
            className="inline-block text-3xl font-bold uppercase tracking-tight text-brand-dark"
          >
            OPULANZ
          </Link>
          <p className="mt-2 text-sm text-brand-grayMed">
            {t("services.spvInvestment.title")}
          </p>
        </div>

        <Card className="border-none shadow-elevated">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-gold/10">
                <Shield className="h-7 w-7 text-brand-gold" />
              </div>
            </div>
            <CardTitle className="text-center text-2xl">
              {t("spvInvestment.portal.login.title")}
            </CardTitle>
            <p className="text-center text-sm text-brand-grayMed mt-2">
              {t("spvInvestment.portal.login.subtitle")}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="accessCode">
                  {t("spvInvestment.portal.login.accessCode")} <span className="text-red-600">*</span>
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Lock className="h-5 w-5 text-brand-grayMed" />
                  </div>
                  <Input
                    id="accessCode"
                    type={showCode ? "text" : "password"}
                    placeholder={t("spvInvestment.portal.login.accessCodePlaceholder")}
                    value={accessCode}
                    onChange={(e) => {
                      setAccessCode(e.target.value);
                      setError("");
                    }}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCode(!showCode)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-grayMed hover:text-brand-dark transition-colors"
                  >
                    {showCode ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {error && (
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? t("common.loading") : t("spvInvestment.portal.login.signIn")}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-brand-grayMed">
                {t("spvInvestment.portal.login.help")}
              </p>
              <Link
                href={`/${locale}/support`}
                className="mt-2 inline-block text-sm font-semibold text-brand-gold hover:text-brand-goldDark transition-colors"
              >
                {t("spvInvestment.portal.login.contactSupport")}
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Link
            href={`/${locale}/spv-investment`}
            className="text-sm text-brand-gold hover:text-brand-goldDark transition-colors"
          >
            &larr; {t("common.back")}
          </Link>
        </div>

        <div className="mt-4 rounded-xl bg-brand-gold/5 p-4">
          <p className="text-xs text-center text-brand-grayMed">
            <Lock className="inline h-3 w-3 mr-1" />
            {t("spvInvestment.portal.login.securityNotice")}
          </p>
        </div>
      </div>
    </div>
  );
}
