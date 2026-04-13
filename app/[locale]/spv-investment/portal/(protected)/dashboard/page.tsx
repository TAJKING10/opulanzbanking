"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import {
  TrendingUp, Building2, FileText, DollarSign, ArrowRight, Clock, CheckCircle,
  AlertCircle, Wallet, PieChart, Calendar, ExternalLink
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
      label: "Total Invested",
      value: summary ? `€${summary.total_invested.toLocaleString()}` : "€0",
      icon: Wallet,
      change: hasInvestments ? `${investments.length} active investment${investments.length > 1 ? 's' : ''}` : "No investments yet",
      color: "text-brand-gold",
    },
    {
      label: "Portfolio Value",
      value: summary ? `€${summary.portfolio_value.toLocaleString()}` : "€0",
      icon: PieChart,
      change: hasInvestments
        ? summary?.overall_status === 'profit'
          ? `+€${summary.total_returns.toLocaleString()} returns`
          : `€${summary?.total_returns.toLocaleString()} returns`
        : "Start investing to see value",
      color: summary?.overall_status === 'profit' ? "text-green-600" : "text-red-600",
    },
    {
      label: "Portfolio ROI",
      value: summary ? `${summary.portfolio_roi.toFixed(1)}%` : "—",
      icon: TrendingUp,
      change: hasInvestments ? "Overall return rate" : "Invest to see returns",
      color: (summary?.portfolio_roi || 0) >= 0 ? "text-green-600" : "text-red-600",
    },
    {
      label: "Distributions Received",
      value: summary ? `€${summary.total_distributions.toLocaleString()}` : "€0",
      icon: DollarSign,
      change: hasInvestments ? "Total dividends paid" : "Distributions will appear here",
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
                Welcome back, {investor?.name?.split(' ')[0] || 'Investor'}
              </h1>
              <p className="mt-1 text-sm text-brand-grayMed">
                Here's an overview of your SPV investment portfolio
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 text-sm text-brand-grayMed">
              <Calendar className="h-4 w-4" />
              {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
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
                <CardTitle className="text-lg">Your Investments</CardTitle>
                {hasInvestments && (
                  <Link
                    href={`/${locale}/spv-investment/portal/offerings`}
                    className="text-sm font-medium text-brand-gold hover:text-brand-goldDark"
                  >
                    View All Offerings
                  </Link>
                )}
              </CardHeader>
              <CardContent>
                {!hasInvestments ? (
                  <div className="text-center py-12">
                    <Building2 className="mx-auto h-12 w-12 text-brand-grayLight" />
                    <h3 className="mt-4 text-lg font-semibold text-brand-dark">No Investments Yet</h3>
                    <p className="mt-2 text-sm text-brand-grayMed max-w-sm mx-auto">
                      Start building your real estate portfolio by exploring our current SPV investment opportunities.
                    </p>
                    <Button asChild className="mt-6 bg-brand-gold hover:bg-brand-goldDark">
                      <Link href={`/${locale}/spv-investment/portal/offerings`}>
                        <Building2 className="mr-2 h-4 w-4" />
                        Browse Offerings
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {investments.map((investment: any) => (
                      <div
                        key={investment.id}
                        className="flex items-center gap-4 p-4 rounded-xl border border-brand-grayLight/30 hover:border-brand-gold/30 hover:bg-brand-off/50 transition-all"
                      >
                        {/* Property Image */}
                        <div className="relative h-16 w-24 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                          <Image
                            src={investment.images?.[0] || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&h=150&fit=crop"}
                            alt={investment.property_title || "Property"}
                            fill
                            className="object-cover"
                          />
                        </div>

                        {/* Investment Details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-brand-dark truncate">
                            {investment.property_title || "Investment Property"}
                          </h4>
                          <p className="text-xs text-brand-grayMed">
                            {investment.property_location || "Location"} • {investment.ownership_percentage}% ownership
                          </p>
                          <div className="mt-1 flex items-center gap-3 text-xs">
                            <span className={cn(
                              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full",
                              investment.status === 'active' ? "bg-green-100 text-green-700" :
                              investment.status === 'pending' ? "bg-amber-100 text-amber-700" :
                              "bg-gray-100 text-gray-600"
                            )}>
                              <span className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                investment.status === 'active' ? "bg-green-500" :
                                investment.status === 'pending' ? "bg-amber-500" :
                                "bg-gray-400"
                              )} />
                              {investment.status?.charAt(0).toUpperCase() + investment.status?.slice(1) || "Active"}
                            </span>
                            <span className="text-brand-grayMed">
                              Invested: {new Date(investment.investment_date).toLocaleDateString('en-GB')}
                            </span>
                          </div>
                        </div>

                        {/* Investment Amount */}
                        <div className="text-right shrink-0">
                          <p className="font-bold text-brand-dark">
                            €{parseFloat(investment.amount_invested).toLocaleString()}
                          </p>
                          <p className="text-xs text-brand-grayMed">
                            {investment.calculations?.profit_loss_status === 'profit' ? '+' : ''}
                            €{investment.calculations?.profit_loss?.toLocaleString() || '0'} returns
                          </p>
                        </div>

                        {/* View Button */}
                        <Link
                          href={`/${locale}/spv-investment/portal/offerings/${investment.property_id}`}
                          className="p-2 rounded-lg hover:bg-brand-gold/10 text-brand-grayMed hover:text-brand-gold transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </div>
                    ))}
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
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild variant="primary" className="w-full justify-between">
                  <Link href={`/${locale}/spv-investment/portal/offerings`}>
                    Browse Offerings
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-between">
                  <Link href={`/${locale}/spv-investment/portal/documents`}>
                    View Documents
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-between">
                  <Link href={`/${locale}/support`}>
                    Contact Advisor
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Your Account</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-brand-grayMed">Name</span>
                    <span className="font-medium text-brand-dark">{investor?.name || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-brand-grayMed">Email</span>
                    <span className="font-medium text-brand-dark truncate ml-2">{investor?.email || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-brand-grayMed">Investor Type</span>
                    <span className="font-medium text-brand-dark capitalize">{investor?.investor_type || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-brand-grayMed">Status</span>
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
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {investments.slice(0, 3).map((inv: any, index) => (
                      <div key={index} className="flex items-start gap-3 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-brand-dark">
                            Investment in {inv.property_title?.substring(0, 20)}...
                          </p>
                          <p className="text-xs text-brand-grayMed">
                            {new Date(inv.investment_date).toLocaleDateString('en-GB')}
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
