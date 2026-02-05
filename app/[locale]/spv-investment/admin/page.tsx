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
import { loginAdmin } from "@/lib/spv-data";

export default function AdminLoginPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations();

  const [accessCode, setAccessCode] = React.useState("");
  const [showCode, setShowCode] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    setIsLoading(true);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const admin = loginAdmin(accessCode);
    if (admin) {
      sessionStorage.setItem("spv-admin-access", "granted");
      sessionStorage.setItem("spv-admin-timestamp", Date.now().toString());
      router.push(`/${locale}/spv-investment/admin/dashboard`);
    } else {
      setError(true);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Back Link */}
      <div className="container mx-auto max-w-7xl px-6 py-6">
        <Link
          href={`/${locale}/spv-investment`}
          className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("spvInvestment.admin.login.backToSite")}
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 pb-20">
        <div className="w-full max-w-md">
          {/* Logo/Title */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600/20 ring-2 ring-indigo-500/50">
              <Shield className="h-8 w-8 text-indigo-400" />
            </div>
            <h1 className="text-2xl font-bold text-white md:text-3xl">
              {t("spvInvestment.admin.login.title")}
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              {t("spvInvestment.admin.login.subtitle")}
            </p>
          </div>

          {/* Login Card */}
          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm shadow-2xl">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="accessCode" className="text-slate-200">
                    {t("spvInvestment.admin.login.accessCode")}
                  </Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      <Lock className="h-5 w-5 text-slate-500" />
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
                      className="pl-10 pr-10 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCode(!showCode)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showCode ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-lg bg-red-900/30 border border-red-800 p-3 text-sm text-red-300">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {t("spvInvestment.admin.login.error")}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-12"
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
            <p className="text-xs text-slate-500">
              {t("spvInvestment.admin.login.securityNotice")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
