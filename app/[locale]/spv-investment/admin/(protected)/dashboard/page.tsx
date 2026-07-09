"use client";

import * as React from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Users, Building2, TrendingUp, UserPlus, Plus, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getDashboardStats, type ActivityLog, type DashboardStats } from "@/lib/investment-api";

export default function AdminDashboardPage() {
  const t = useTranslations();
  const locale = useLocale();

  const [stats, setStats] = React.useState<DashboardStats>({
    totalInvestors: 0,
    activeInvestors: 0,
    totalProperties: 0,
    openProperties: 0,
    totalAdmins: 0,
    recentActivity: [],
  });
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    {
      label: t("spvInvestment.admin.dashboard.totalCustomers"),
      value: stats.totalInvestors,
      icon: Users,
      color: "bg-blue-500",
      href: `/${locale}/spv-investment/admin/customers`,
    },
    {
      label: t("spvInvestment.admin.dashboard.activeCustomers"),
      value: stats.activeInvestors,
      icon: UserPlus,
      color: "bg-green-500",
      href: `/${locale}/spv-investment/admin/customers`,
    },
    {
      label: t("spvInvestment.admin.dashboard.totalProperties"),
      value: stats.totalProperties,
      icon: Building2,
      color: "bg-purple-500",
      href: `/${locale}/spv-investment/admin/properties`,
    },
    {
      label: t("spvInvestment.admin.dashboard.openProperties"),
      value: stats.openProperties,
      icon: TrendingUp,
      color: "bg-amber-500",
      href: `/${locale}/spv-investment/admin/properties`,
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "customer_login":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "customer_created":
      case "offering_created":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "customer_updated":
      case "offering_updated":
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case "customer_deleted":
      case "offering_deleted":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-slate-400" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(locale === "fr" ? "fr-FR" : "en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-100 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600/30 border-t-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-100">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto max-w-7xl px-6 py-8">
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
            {t("spvInvestment.admin.dashboard.title")}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {t("spvInvestment.admin.dashboard.subtitle")}
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-6 py-8">
        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.label} href={stat.href}>
                <Card className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-slate-500">{stat.label}</p>
                        <p className="mt-1 text-3xl font-bold text-slate-900">{stat.value}</p>
                      </div>
                      <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.color}`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
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
                  {t("spvInvestment.admin.dashboard.recentActivity")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.recentActivity.length === 0 ? (
                  <p className="text-sm text-slate-500 py-4">
                    {t("spvInvestment.admin.dashboard.noActivity")}
                  </p>
                ) : (
                  <div className="space-y-4">
                    {stats.recentActivity.map((activity: ActivityLog) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0"
                      >
                        <div className="mt-0.5">{getActivityIcon(activity.log_type)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-700">{activity.description}</p>
                          <p className="mt-0.5 text-xs text-slate-400">
                            {formatTimestamp(activity.created_at)}
                            {activity.admin_name && ` • ${activity.admin_name}`}
                          </p>
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
                  {t("spvInvestment.admin.dashboard.quickActions")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full justify-start bg-indigo-600 hover:bg-indigo-700">
                  <Link href={`/${locale}/spv-investment/admin/customers?action=new`}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    {t("spvInvestment.admin.dashboard.addCustomer")}
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href={`/${locale}/spv-investment/admin/properties?action=new`}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t("spvInvestment.admin.dashboard.addProperty")}
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href={`/${locale}/spv-investment/admin/customers`}>
                    <Users className="mr-2 h-4 w-4" />
                    {t("spvInvestment.admin.dashboard.viewCustomers")}
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href={`/${locale}/spv-investment/admin/properties`}>
                    <Building2 className="mr-2 h-4 w-4" />
                    {t("spvInvestment.admin.dashboard.viewProperties")}
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
