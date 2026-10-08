"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import {
  TrendingUp, Building2, FileText, DollarSign, ArrowRight, Clock, CheckCircle,
  AlertCircle, Wallet, PieChart, Calendar, ExternalLink, ChevronDown
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getCurrentInvestor,
  getInvestorInvestments,
  type Investor,
  type Investment,
  type InvestorPortfolioSummary,
} from "@/lib/investment-api";

export default function SpvDashboardPage() {
  const t = useTranslations();
  const locale = useLocale();

  const [investor, setInvestor] = React.useState<Investor | null>(null);
  const [investments, setInvestments] = React.useState<Investment[]>([]);
  const [summary, setSummary] = React.useState<InvestorPortfolioSummary | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [expandedPropertyIds, setExpandedPropertyIds] = React.useState<Set<number>>(new Set());

  const togglePropertyExpand = (propertyId: number) => {
    setExpandedPropertyIds((prev) => {
      const next = new Set(prev);
      if (next.has(propertyId)) {
        next.delete(propertyId);
      } else {
        next.add(propertyId);
      }
      return next;
    });
  };

  const formatInvestmentDate = (inv: any) => {
    const rawDate = inv.created_at || inv.investment_date;
    if (!rawDate) return "N/A";
    const dateObj = new Date(rawDate);
    const dateStr = dateObj.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
    // Check if created_at contains time
    if (inv.created_at) {
      const timeStr = dateObj.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit"
      });
      return `${dateStr} at ${timeStr}`;
    }
    return dateStr;
  };

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const currentInvestor = getCurrentInvestor();
        setInvestor(currentInvestor);

        if (currentInvestor) {
          const result = await getInvestorInvestments(currentInvestor.id);
          setInvestments(result.data || []);
          setSummary(result.summary || null);
        }
      } catch (error) {
        console.error("Error fetching portfolio:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const hasInvestments = investments.length > 0;

  const stats = [
    {
      label: t("spvInvestment.portal.dashboard.totalInvested"),
      value: summary ? `€${summary.total_invested.toLocaleString()}` : "€0",
      icon: Wallet,
      change: hasInvestments
        ? investments.length > 1
          ? t("spvInvestment.portal.dashboard.activeInvestmentsPlural", { count: investments.length })
          : t("spvInvestment.portal.dashboard.activeInvestments", { count: investments.length })
        : t("spvInvestment.portal.dashboard.noInvestmentsYet"),
      color: "text-brand-gold",
    },
    {
      label: t("spvInvestment.portal.dashboard.portfolioValue"),
      value: summary ? `€${summary.portfolio_value.toLocaleString()}` : "€0",
      icon: PieChart,
      change: hasInvestments
        ? summary?.overall_status === 'profit'
          ? `+€${summary.total_returns.toLocaleString()} ${t("spvInvestment.portal.dashboard.returns", { amount: "" }).trim()}`
          : `€${summary?.total_returns.toLocaleString()} ${t("spvInvestment.portal.dashboard.returns", { amount: "" }).trim()}`
        : t("spvInvestment.portal.dashboard.startInvesting"),
      color: summary?.overall_status === 'profit' ? "text-green-600" : "text-red-600",
    },
    {
      label: t("spvInvestment.portal.dashboard.portfolioRoi"),
      value: summary ? `${summary.portfolio_roi.toFixed(1)}%` : "—",
      icon: TrendingUp,
      change: hasInvestments
        ? t("spvInvestment.portal.dashboard.overallReturnRate")
        : t("spvInvestment.portal.dashboard.investToSeeReturns"),
      color: (summary?.portfolio_roi || 0) >= 0 ? "text-green-600" : "text-red-600",
    },
    {
      label: t("spvInvestment.portal.dashboard.distributionsReceived"),
      value: summary ? `€${summary.total_distributions.toLocaleString()}` : "€0",
      icon: DollarSign,
      change: hasInvestments
        ? t("spvInvestment.portal.dashboard.totalDividendsPaid")
        : t("spvInvestment.portal.dashboard.distributionsPlaceholder"),
      color: "text-green-600",
    },
  ];

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-[calc(100vh-7.5rem)] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-gold/30 border-t-brand-gold" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-7.5rem)]">
      {/* Page Header */}
      <div className="bg-white border-b border-brand-grayLight/30">
        <div className="container mx-auto max-w-7xl px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-brand-dark md:text-3xl">
                {t("spvInvestment.portal.dashboard.welcome", {
                  name: investor?.name?.split(' ')[0] || t("spvInvestment.portal.dashboard.welcomeDefault"),
                })}
              </h1>
              <p className="mt-1 text-sm text-brand-grayMed">
                {t("spvInvestment.portal.dashboard.subtitle")}
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 text-sm text-brand-grayMed">
              <Calendar className="h-4 w-4" />
              {new Date().toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-6 py-8">
        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="border-none shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-brand-grayMed">{stat.label}</p>
                      <p className={cn("mt-1 text-2xl font-bold", stat.color || "text-brand-dark")}>
                        {stat.value}
                      </p>
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
          {/* Portfolio / Investments */}
          <div className="lg:col-span-2">
            <Card className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">{t("spvInvestment.portal.dashboard.yourInvestments")}</CardTitle>
                {hasInvestments && (
                  <Link
                    href={`/${locale}/spv-investment/portal/offerings`}
                    className="text-sm font-medium text-brand-gold hover:text-brand-goldDark"
                  >
                    {t("spvInvestment.portal.dashboard.viewAllOfferings")}
                  </Link>
                )}
              </CardHeader>
              <CardContent>
                {!hasInvestments ? (
                  <div className="text-center py-12">
                    <Building2 className="mx-auto h-12 w-12 text-brand-grayLight" />
                    <h3 className="mt-4 text-lg font-semibold text-brand-dark">
                      {t("spvInvestment.portal.dashboard.noInvestmentsTitle")}
                    </h3>
                    <p className="mt-2 text-sm text-brand-grayMed max-w-sm mx-auto">
                      {t("spvInvestment.portal.dashboard.noInvestmentsDesc")}
                    </p>
                    <Button asChild className="mt-6 bg-brand-gold hover:bg-brand-goldDark">
                      <Link href={`/${locale}/spv-investment/portal/offerings`}>
                        <Building2 className="mr-2 h-4 w-4" />
                        {t("spvInvestment.portal.dashboard.browseOfferings")}
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(() => {
                      // Group investments by property_id
                      const grouped = investments.reduce((acc: Record<number, any>, inv: any) => {
                        const pid = inv.property_id;
                        if (!acc[pid]) {
                          acc[pid] = {
                            property_id: pid,
                            property_title: inv.property_title || "Investment Property",
                            property_location: inv.property_location || "Location",
                            images: inv.images,
                            total_amount: 0,
                            total_ownership: 0,
                            total_returns: 0,
                            status: inv.status,
                            items: []
                          };
                        }
                        acc[pid].items.push(inv);
                        acc[pid].total_amount += parseFloat(inv.amount_invested) || 0;
                        acc[pid].total_ownership += parseFloat(inv.ownership_percentage) || 0;
                        acc[pid].total_returns += parseFloat(inv.calculations?.profit_loss || 0);
                        // If any investment is active, show active, otherwise latest status
                        if (inv.status === 'active') {
                          acc[pid].status = 'active';
                        }
                        return acc;
                      }, {});

                      return Object.values(grouped).map((group: any) => {
                        const isMulti = group.items.length > 1;
                        const isExpanded = expandedPropertyIds.has(group.property_id);

                        return (
                          <div
                            key={group.property_id}
                            className="rounded-xl border border-brand-grayLight/30 hover:border-brand-gold/30 bg-white overflow-hidden transition-all shadow-sm"
                          >
                            {/* Main Summary Header */}
                            <div
                              onClick={() => {
                                if (isMulti) {
                                  togglePropertyExpand(group.property_id);
                                }
                              }}
                              className={cn(
                                "flex items-center gap-4 p-4 transition-all",
                                isMulti ? "cursor-pointer hover:bg-brand-off/40" : ""
                              )}
                            >
                              {/* Property Image */}
                              <div className="relative h-16 w-24 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                                <Image
                                  src={group.images?.[0] || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&h=150&fit=crop"}
                                  alt={group.property_title}
                                  fill
                                  className="object-cover"
                                />
                              </div>

                              {/* Details */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold text-brand-dark truncate">
                                    {group.property_title}
                                  </h4>
                                  {isMulti && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-brand-gold/15 text-brand-gold">
                                      {t("spvInvestment.portal.dashboard.investmentsCount", { count: group.items.length })}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-brand-grayMed mt-0.5">
                                  {group.property_location} • {t("spvInvestment.portal.dashboard.totalOwnership", { percentage: group.total_ownership.toFixed(2) })}
                                </p>
                                <div className="mt-1 flex items-center gap-3 text-xs">
                                  <span className={cn(
                                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full",
                                    group.status === 'active' ? "bg-green-100 text-green-700" :
                                    group.status === 'pending' ? "bg-amber-100 text-amber-700" :
                                    "bg-gray-100 text-gray-600"
                                  )}>
                                    <span className={cn(
                                      "h-1.5 w-1.5 rounded-full",
                                      group.status === 'active' ? "bg-green-500" :
                                      group.status === 'pending' ? "bg-amber-500" :
                                      "bg-gray-400"
                                    )} />
                                    {group.status?.charAt(0).toUpperCase() + group.status?.slice(1) || "Active"}
                                  </span>
                                  {!isMulti && group.items[0] && (
                                    <span className="text-brand-grayMed">
                                      {t("spvInvestment.portal.dashboard.investedOn", {
                                        date: formatInvestmentDate(group.items[0]),
                                      })}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Amount & Returns */}
                              <div className="text-right shrink-0">
                                <p className="font-bold text-brand-dark text-base">
                                  €{group.total_amount.toLocaleString()}
                                </p>
                                <p className="text-xs text-brand-grayMed">
                                  {group.total_returns >= 0 ? '+' : ''}€{group.total_returns.toLocaleString()} {t("spvInvestment.portal.dashboard.returns", { amount: "" }).trim()}
                                </p>
                              </div>

                              {/* Expand/Collapse Chevron or Offering Link */}
                              <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                                <Link
                                  href={`/${locale}/spv-investment/portal/offerings/${group.property_id}`}
                                  className="p-2 rounded-lg hover:bg-brand-gold/10 text-brand-grayMed hover:text-brand-gold transition-colors"
                                  title="View Offering"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Link>
                                {isMulti && (
                                  <button
                                    type="button"
                                    onClick={() => togglePropertyExpand(group.property_id)}
                                    className="p-2 rounded-lg hover:bg-brand-off text-brand-grayMed hover:text-brand-dark transition-colors"
                                    title={isExpanded ? "Collapse" : "Expand investment breakdown"}
                                  >
                                    <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isExpanded ? "rotate-180" : "")} />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Dropdown Breakdown for Multiple Investments */}
                            {isMulti && isExpanded && (
                              <div className="border-t border-brand-grayLight/30 bg-brand-off/30 px-4 py-3 divide-y divide-brand-grayLight/20">
                                <div className="text-xs font-semibold text-brand-grayMed uppercase tracking-wider mb-2 px-2">
                                  {t("spvInvestment.portal.dashboard.investmentHistory", { count: group.items.length })}
                                </div>
                                {group.items.map((inv: any, idx: number) => (
                                  <div
                                    key={inv.id || idx}
                                    className="flex items-center justify-between py-2.5 px-2 hover:bg-white/80 rounded-lg transition-colors"
                                  >
                                    <div className="flex items-center gap-2.5">
                                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-gold/10 text-brand-gold text-xs font-bold shrink-0">
                                        #{idx + 1}
                                      </div>
                                      <div>
                                        <p className="text-xs font-semibold text-brand-dark">
                                          €{parseFloat(inv.amount_invested).toLocaleString()}
                                          <span className="ml-2 font-normal text-brand-grayMed">
                                            ({inv.ownership_percentage}% ownership)
                                          </span>
                                        </p>
                                        <p className="text-[11px] text-brand-grayMed">
                                          {formatInvestmentDate(inv)}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <span className={cn(
                                        "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium",
                                        inv.status === 'active' ? "bg-green-100 text-green-700" :
                                        inv.status === 'pending' ? "bg-amber-100 text-amber-700" :
                                        "bg-gray-100 text-gray-600"
                                      )}>
                                        {inv.status?.charAt(0).toUpperCase() + inv.status?.slice(1) || "Active"}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">{t("spvInvestment.portal.dashboard.quickActions.title")}</CardTitle>
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

            {/* Account Info */}
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">{t("spvInvestment.portal.dashboard.yourAccount")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-brand-grayMed">{t("spvInvestment.portal.dashboard.name")}</span>
                    <span className="font-medium text-brand-dark">{investor?.name || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-brand-grayMed">{t("spvInvestment.portal.dashboard.email")}</span>
                    <span className="font-medium text-brand-dark truncate ml-2">{investor?.email || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-brand-grayMed">{t("spvInvestment.portal.dashboard.investorType")}</span>
                    <span className="font-medium text-brand-dark capitalize">{investor?.investor_type || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-brand-grayMed">{t("spvInvestment.portal.dashboard.status")}</span>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium",
                      investor?.status === 'active' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                    )}>
                      {investor?.status?.charAt(0).toUpperCase() + (investor?.status?.slice(1) || "")}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            {hasInvestments && (
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">{t("spvInvestment.portal.dashboard.recentActivity")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {investments.slice(0, 3).map((inv: any, index) => (
                      <div key={index} className="flex items-start gap-3 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-brand-dark">
                            {t("spvInvestment.portal.dashboard.investmentIn", {
                              title: inv.property_title?.substring(0, 20) || "",
                            })}
                          </p>
                          <p className="text-xs text-brand-grayMed">
                            {new Date(inv.investment_date).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-GB')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
