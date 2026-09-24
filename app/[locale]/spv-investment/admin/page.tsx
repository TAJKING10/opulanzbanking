"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Shield, Lock, Eye, EyeOff, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAdmin } from "@/lib/investment-api";
import { isSpvAdminAuthenticated } from "@/lib/spv-auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations();

  const [accessCode, setAccessCode] = React.useState("");
  const [showCode, setShowCode] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (isSpvAdminAuthenticated()) {
      router.replace(`/${locale}/spv-investment/admin/dashboard`);
      return;
    }
    const access = sessionStorage.getItem("spv-admin-access");
    if (access === "granted") {
      router.replace(`/${locale}/spv-investment/admin/dashboard`);
    }
  }, [locale, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    setIsLoading(true);

    try {
      const admin = await loginAdmin(accessCode);
      if (admin) {
        router.push(`/${locale}/spv-investment/admin/dashboard`);
      } else {
        setError(true);
        setIsLoading(false);
      }
    } catch {
      setError(true);
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
          {t("spvInvestment.admin.login.backToSite")}
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
              {t("spvInvestment.admin.login.title")}
            </h1>
            <p className="mt-2 text-sm text-brand-grayMed">
              {t("spvInvestment.admin.login.subtitle")}
            </p>
          </div>

          {/* Login Card */}
          <Card className="border border-brand-grayLight/40 bg-white shadow-xl rounded-2xl">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="accessCode" className="text-brand-dark font-medium">
                    {t("spvInvestment.admin.login.accessCode")}
                  </Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      <Lock className="h-5 w-5 text-brand-grayMed" />
                    </div>
                    <Input
                      id="accessCode"
                      type={showCode ? "text" : "password"}
                      value={accessCode}
                      onChange={(e) => {
                        setAccessCode(e.target.value);
                        setError(false);
                      }}
                      placeholder={t("spvInvestment.admin.login.accessCodePlaceholder")}
                      className="pl-10 pr-10 bg-brand-off/30 border-brand-grayLight/60 text-brand-dark placeholder:text-brand-grayMed/70 focus:border-brand-gold focus:ring-brand-gold/20 h-11"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCode(!showCode)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-grayMed hover:text-brand-dark transition-colors"
                    >
                      {showCode ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {t("spvInvestment.admin.login.error")}
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
                    t("spvInvestment.admin.login.signIn")
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <div className="mt-6 text-center">
            <p className="text-xs text-brand-grayMed">
              {t("spvInvestment.admin.login.securityNotice")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
