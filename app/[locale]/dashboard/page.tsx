"use client";

import * as React from "react";
import { CreditCard, TrendingUp, FileText, Plus, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusChip } from "@/components/status-chip";
import { Timeline, type TimelineItem } from "@/components/timeline";
import { SectionHeading } from "@/components/section-heading";
import { useTranslations } from "next-intl";

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const accountBalance = "45,234.50";
  const currency = "EUR";

  const applications: TimelineItem[] = [
    {
      id: "1",
      title: "Business Account Opening",
      description: "Your application has been approved",
      status: "completed",
      date: "2025-10-15",
    },
    {
      id: "2",
      title: "Company Formation - SARL",
      description: "Awaiting notary certificate",
      status: "in_progress",
      date: "2025-10-18",
    },
    {
      id: "3",
      title: "Tax Advisory Consultation",
      description: "Scheduled for next week",
      status: "pending",
      date: "2025-10-25",
    },
  ];

  const recentTransactions = [
    {
      id: "1",
      type: "credit",
      description: "Wire Transfer from Client ABC",
      amount: "+5,000.00",
      date: "2025-10-19",
      status: "completed",
    },
    {
      id: "2",
      type: "debit",
      description: "Payment to Supplier XYZ",
      amount: "-2,345.67",
      date: "2025-10-18",
      status: "completed",
    },
    {
      id: "3",
      type: "debit",
      description: "Monthly Subscription",
      amount: "-99.00",
      date: "2025-10-17",
      status: "completed",
    },
  ];

  const quickActions = [
    { label: t('actions.openNewAccount'), href: "/open-account", icon: Plus },
    { label: t('actions.formCompany'), href: "/company-formation", icon: FileText },
    { label: t('actions.bookAdvisory'), href: "/tax-advisory", icon: TrendingUp },
    { label: t('actions.viewStatements'), href: "/dashboard/statements", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-brand-off py-20">
      <div className="container mx-auto max-w-7xl px-6">
        <div className="mb-12">
          <h1 className="mb-2 text-3xl font-bold text-brand-dark">{t('title')}</h1>
          <p className="text-brand-grayMed">
            {t('subtitle')}
          </p>
        </div>

        {/* Account Balance Card */}
        <div className="mb-8">
          <Card className="border-none bg-gradient-to-br from-brand-goldDark to-brand-gold shadow-elevated">
            <CardContent className="p-8">
              <div className="flex items-start justify-between">
                <div className="text-white">
                  <p className="mb-2 text-sm opacity-90">{t('totalBalance')}</p>
                  <p className="mb-6 text-4xl font-bold">
                    {currency} {accountBalance}
                  </p>
                  <div className="flex gap-4">
                    <Button
                      variant="default"
                      size="sm"
                      className="bg-white text-brand-dark hover:bg-brand-off"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {t('addFunds')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="border border-white/30 text-white hover:bg-white/10"
                    >
                      {t('transfer')}
                    </Button>
                  </div>
                </div>
                <CreditCard className="h-12 w-12 text-white/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content - 2 cols */}
          <div className="space-y-8 lg:col-span-2">
            {/* Quick Actions */}
            <div>
              <h2 className="mb-4 text-xl font-bold text-brand-dark">
                {t('quickActions')}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Card
                      key={action.label}
                      className="card-hover cursor-pointer border-brand-grayLight transition-all hover:border-brand-gold"
                    >
                      <CardContent className="flex items-center gap-4 p-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-goldLight">
                          <Icon className="h-6 w-6 text-brand-goldDark" />
                        </div>
                        <span className="font-semibold text-brand-dark">
                          {action.label}
                        </span>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Recent Transactions */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-brand-dark">
                  {t('recentTransactions')}
                </h2>
                <Button variant="link" className="text-brand-gold">
                  {t('viewAll')}
                </Button>
              </div>
              <Card className="border-brand-grayLight">
                <CardContent className="p-0">
                  <div className="divide-y divide-brand-grayLight">
                    {recentTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-6 transition-colors hover:bg-brand-off"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full ${
                              transaction.type === "credit"
                                ? "bg-green-100"
                                : "bg-red-100"
                            }`}
                          >
                            {transaction.type === "credit" ? (
                              <ArrowDownLeft className="h-5 w-5 text-green-600" />
                            ) : (
                              <ArrowUpRight className="h-5 w-5 text-red-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-brand-dark">
                              {transaction.description}
                            </p>
                            <p className="text-sm text-brand-grayMed">
                              {transaction.date}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`text-lg font-bold ${
                              transaction.type === "credit"
                                ? "text-green-600"
                                : "text-brand-dark"
                            }`}
                          >
                            {transaction.amount} {currency}
                          </p>
                          <StatusChip status={transaction.status as any} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar - 1 col */}
          <div className="space-y-8">
            {/* Application Status */}
            <div>
              <h2 className="mb-4 text-xl font-bold text-brand-dark">
                {t('applicationStatus')}
              </h2>
              <Card className="border-brand-grayLight">
                <CardContent className="p-6">
                  <Timeline items={applications} />
                </CardContent>
              </Card>
            </div>

            {/* Services */}
            <div>
              <h2 className="mb-4 text-xl font-bold text-brand-dark">
                {t('ourServices')}
              </h2>
              <Card className="border-brand-grayLight">
                <CardContent className="space-y-4 p-6">
                  <div>
                    <h4 className="mb-2 font-semibold text-brand-dark">
                      {t('needHelp')}
                    </h4>
                    <p className="mb-4 text-sm text-brand-grayMed">
                      {t('bookConsultationDescription')}
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      {t('bookConsultation')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
