"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Lock, Eye, EyeOff, Shield, ArrowLeft, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginInvestor } from "@/lib/investment-api";
import { isSpvInvestorAuthenticated } from "@/lib/spv-auth";

export default function SpvPortalLoginPage() {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations();
  const [accessCode, setAccessCode] = React.useState("");
  const [showCode, setShowCode] = React.useState(false);
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (isSpvInvestorAuthenticated()) {
      router.replace(`/${locale}/spv-investment/portal/dashboard`);
      return;
    }
    const access = sessionStorage.getItem("spv-portal-access");
    if (access === "granted") {
      router.replace(`/${locale}/spv-investment/portal/dashboard`);
    }
  }, [locale, router]);

  // Hidden admin portal access: Ctrl+Shift+A
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "A") {
        e.preventDefault();
        router.push(`/${locale}/spv-investment/admin`);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [locale, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const investor = await loginInvestor(accessCode.trim());
      if (investor) {
        sessionStorage.setItem("spv-portal-access", "granted");
        sessionStorage.setItem("spv-portal-timestamp", Date.now().toString());
        sessionStorage.setItem("spv-portal-profile", investor.profile_type || "new");
        router.push(`/${locale}/spv-investment/portal/dashboard`);
      } else {
        setError(t("spvInvestment.portal.login.error"));
        setIsLoading(false);
      }
    } catch {
      setError(t("spvInvestment.portal.login.error"));
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gradient-to-b from-brand-off via-white to-brand-off/50 flex flex-col justify-between py-8">
      {/* Back Link */}
      <div className="container mx-auto max-w-7xl px-6">
        <Link
          href={`/${locale}/spv-investment`}
          className="inline-flex items-center text-sm font-medium text-brand-grayMed hover:text-brand-gold transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("common.back")}
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          {/* Logo/Title */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-gold/10 ring-1 ring-brand-gold/30 shadow-sm">
              <Shield className="h-8 w-8 text-brand-gold" />
            </div>
            <h1 className="text-2xl font-bold text-brand-dark md:text-3xl tracking-tight">
              {t("spvInvestment.portal.login.title")}
            </h1>
            <p className="mt-2 text-sm text-brand-grayMed">
              {t("spvInvestment.portal.login.subtitle")}
            </p>
          </div>

          {/* Login Card */}
          <Card className="border border-brand-grayLight/40 bg-white shadow-xl rounded-2xl">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="accessCode" className="text-brand-dark font-medium">
                    {t("spvInvestment.portal.login.accessCode")}
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
                      className="pl-10 pr-10 bg-brand-off/30 border-brand-grayLight/60 text-brand-dark placeholder:text-brand-grayMed/70 focus:border-brand-gold focus:ring-brand-gold/20 h-11"
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
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-brand-gold hover:bg-brand-goldDark text-white font-semibold h-12 rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      {t("common.loading")}
                    </div>
                  ) : (
                    t("spvInvestment.portal.login.signIn")
                  )}
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

          {/* Security Notice */}
          <div className="mt-6 text-center">
            <p className="text-xs text-brand-grayMed">
              {t("spvInvestment.portal.login.securityNotice")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
