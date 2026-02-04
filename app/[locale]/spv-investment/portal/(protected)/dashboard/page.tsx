"use client";

import * as React from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { TrendingUp, Building2, FileText, DollarSign, ArrowRight, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SpvDashboardPage() {
  const t = useTranslations();
  const locale = useLocale();
  const [profile, setProfile] = React.useState<string>("existing");

  React.useEffect(() => {
    const stored = sessionStorage.getItem("spv-portal-profile");
    if (stored) setProfile(stored);
  }, []);

  const isNew = profile === "new";

  const stats = isNew
    ? [
        {
          label: t("spvInvestment.portal.dashboard.totalInvested"),
          value: "€0",
          icon: DollarSign,
          change: "No investments yet",
        },
        {
          label: t("spvInvestment.portal.dashboard.activeSpvs"),
          value: "0",
          icon: Building2,
          change: "Browse offerings to get started",
        },
        {
          label: t("spvInvestment.portal.dashboard.estimatedReturn"),
          value: "—",
          icon: TrendingUp,
          change: "Invest to see projected returns",
        },
        {
          label: t("spvInvestment.portal.dashboard.documentsAvailable"),
          value: "0",
          icon: FileText,
          change: "Documents will appear here",
        },
      ]
    : [
        {
          label: t("spvInvestment.portal.dashboard.totalInvested"),
          value: "€150,000",
          icon: DollarSign,
          change: "+€50,000 this quarter",
        },
        {
          label: t("spvInvestment.portal.dashboard.activeSpvs"),
          value: "2",
          icon: Building2,
          change: "Luxembourg, Sweden",
        },
        {
          label: t("spvInvestment.portal.dashboard.estimatedReturn"),
          value: "7.8%",
          icon: TrendingUp,
          change: "Target annual return",
        },
        {
          label: t("spvInvestment.portal.dashboard.documentsAvailable"),
          value: "12",
          icon: FileText,
          change: "3 new this month",
        },
      ];

  const recentActivity = isNew
    ? []
    : [
        {
          date: "2025-01-28",
          description: "Investment confirmed — Luxembourg City Premium Residence",
          type: "success",
        },
        {
          date: "2025-01-15",
          description: "Subscription agreement signed — Riga Commercial Centre",
          type: "success",
        },
        {
          date: "2025-01-10",
          description: "Q4 2024 Performance Report available for download",
          type: "info",
        },
        {
          date: "2024-12-20",
          description: "Annual tax certificate 2024 uploaded",
          type: "info",
        },
        {
          date: "2024-12-01",
          description: "Bank transfer received — €50,000 allocated to Luxembourg project",
          type: "success",
        },
      ];

  const typeIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />;
      default:
        return <Clock className="h-4 w-4 text-brand-grayMed shrink-0 mt-0.5" />;
    }
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-7.5rem)]">
      {/* Page Header */}
      <div className="bg-white border-b border-brand-grayLight/30">
        <div className="container mx-auto max-w-7xl px-6 py-8">
          <h1 className="text-2xl font-bold text-brand-dark md:text-3xl">
            {t("spvInvestment.portal.dashboard.title")}
          </h1>
          <p className="mt-1 text-sm text-brand-grayMed">
            {t("spvInvestment.portal.dashboard.welcome")}
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-6 py-8">
        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="border-none shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-brand-grayMed">{stat.label}</p>
                      <p className="mt-1 text-2xl font-bold text-brand-dark">{stat.value}</p>
                      <p className="mt-1 text-xs text-brand-grayMed">{stat.change}</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-gold/10">
                      <Icon className="h-5 w-5 text-brand-gold" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Content Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">
                  {t("spvInvestment.portal.dashboard.recentActivity")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity.length === 0 ? (
                  <p className="text-sm text-brand-grayMed py-4">
                    {t("spvInvestment.portal.dashboard.noActivity")}
                  </p>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 pb-4 border-b border-brand-grayLight/20 last:border-0 last:pb-0"
                      >
                        {typeIcon(activity.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-brand-dark">{activity.description}</p>
                          <p className="mt-0.5 text-xs text-brand-grayMed">{activity.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">
                  {t("spvInvestment.portal.dashboard.quickActions.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild variant="primary" className="w-full justify-between">
                  <Link href={`/${locale}/spv-investment/portal/offerings`}>
                    {t("spvInvestment.portal.dashboard.quickActions.viewOfferings")}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-between">
                  <Link href={`/${locale}/spv-investment/portal/documents`}>
                    {t("spvInvestment.portal.dashboard.quickActions.downloadDocuments")}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-between">
                  <Link href={`/${locale}/support`}>
                    {t("spvInvestment.portal.dashboard.quickActions.contactAdvisor")}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
