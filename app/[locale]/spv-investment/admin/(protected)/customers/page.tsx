"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { Search, Plus, Edit2, Trash2, Copy, Check, X, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getInvestors, deleteInvestor, getCurrentAdmin, type Investor } from "@/lib/investment-api";

export default function CustomersPage() {
  const t = useTranslations();
  const locale = useLocale();
  const searchParams = useSearchParams();

  const [investors, setInvestors] = React.useState<Investor[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"all" | "active" | "inactive">("all");
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = React.useState<number | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Load investors
  React.useEffect(() => {
    const fetchInvestors = async () => {
      try {
        const status = statusFilter === "all" ? undefined : statusFilter;
        const search = searchTerm || undefined;
        const result = await getInvestors({ status, search });
        setInvestors(result.data);
      } catch (error) {
        console.error("Error fetching investors:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInvestors();
  }, [statusFilter, searchTerm]);

  // Check for ?action=new in URL
  React.useEffect(() => {
    if (searchParams.get("action") === "new") {
      window.location.href = `/${locale}/spv-investment/admin/customers/new`;
    }
  }, [searchParams, locale]);

  const handleDelete = async (id: number) => {
    const admin = getCurrentAdmin();
    const success = await deleteInvestor(id, admin?.id);
    if (success) {
      setInvestors((prev) => prev.filter((i) => i.id !== id));
    }
    setDeleteConfirm(null);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-brand-off flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-gold/30 border-t-brand-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-brand-off">
      {/* Page Header */}
      <div className="bg-white border-b border-brand-grayLight/40">
        <div className="container mx-auto max-w-7xl px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-brand-dark md:text-3xl tracking-tight">
                {t("spvInvestment.admin.customers.title")}
              </h1>
              <p className="mt-1 text-sm text-brand-grayMed">
                {t("spvInvestment.admin.customers.subtitle")}
              </p>
            </div>
            <Button asChild className="bg-brand-gold hover:bg-brand-goldDark text-white font-medium shadow-sm">
              <Link href={`/${locale}/spv-investment/admin/customers/new`}>
                <Plus className="mr-2 h-4 w-4" />
                {t("spvInvestment.admin.customers.addCustomer")}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-6 py-8">
        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-grayMed" />
            <Input
              type="text"
              placeholder={t("spvInvestment.admin.customers.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-brand-grayLight/60 focus:border-brand-gold bg-white"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "active", "inactive"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                  statusFilter === status
                    ? "bg-brand-gold text-white shadow-sm"
                    : "bg-white text-brand-grayMed border border-brand-grayLight/50 hover:bg-brand-off"
                )}
              >
                {t(`spvInvestment.admin.customers.filter.${status}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Customers Table */}
        <Card className="border border-brand-grayLight/40 bg-white shadow-sm rounded-xl overflow-hidden">
          {/* Desktop Header */}
          <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-6 py-3.5 bg-brand-off/60 text-xs font-semibold text-brand-grayMed uppercase tracking-wide border-b border-brand-grayLight/40">
            <div className="col-span-3">{t("spvInvestment.admin.customers.columns.name")}</div>
            <div className="col-span-2">{t("spvInvestment.admin.customers.columns.accessCode")}</div>
            <div className="col-span-2">{t("spvInvestment.admin.customers.columns.type")}</div>
            <div className="col-span-2">{t("spvInvestment.admin.customers.columns.lastAccess")}</div>
            <div className="col-span-1">{t("spvInvestment.admin.customers.columns.status")}</div>
            <div className="col-span-2 text-right">{t("spvInvestment.admin.customers.columns.actions")}</div>
          </div>

          <CardContent className="p-0">
            {investors.length === 0 ? (
              <div className="py-12 text-center">
                <User className="mx-auto h-12 w-12 text-brand-grayMed/40" />
                <p className="mt-4 text-sm text-brand-grayMed">{t("spvInvestment.admin.customers.noCustomers")}</p>
              </div>
            ) : (
              investors.map((investor) => (
                <div
                  key={investor.id}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-4 items-center px-6 py-4 border-b border-brand-grayLight/30 last:border-0 hover:bg-brand-off/40 transition-colors"
                >
                  {/* Name + Email */}
                  <div className="lg:col-span-3">
                    <p className="font-medium text-brand-dark">{investor.name}</p>
                    <p className="text-sm text-brand-grayMed">{investor.email}</p>
                  </div>

                  {/* Access Code */}
                  <div className="lg:col-span-2">
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono bg-brand-off px-2 py-1 rounded border border-brand-grayLight/30 text-brand-dark">
                        {investor.access_code}
                      </code>
                      <button
                        onClick={() => handleCopyCode(investor.access_code)}
                        className="text-brand-grayMed hover:text-brand-gold transition-colors"
                      >
                        {copiedCode === investor.access_code ? (
                          <Check className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Type */}
                  <div className="lg:col-span-2">
                    <span className="text-sm text-brand-dark capitalize">{investor.investor_type}</span>
                    <span className="text-brand-grayLight mx-2">•</span>
                    <span className="text-sm text-brand-grayMed capitalize">{investor.profile_type}</span>
                  </div>

                  {/* Last Access */}
                  <div className="lg:col-span-2">
                    <p className="text-sm text-brand-grayMed">{formatDate(investor.last_access)}</p>
                  </div>

                  {/* Status */}
                  <div className="lg:col-span-1">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                        investor.status === "active"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-brand-off text-brand-grayMed border border-brand-grayLight/40"
                      )}
                    >
                      {investor.status}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="lg:col-span-2 flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="text-brand-grayMed hover:text-brand-gold hover:bg-brand-gold/10"
                    >
                      <Link href={`/${locale}/spv-investment/admin/customers/${investor.id}`}>
                        <Edit2 className="h-4 w-4" />
                      </Link>
                    </Button>
                    {deleteConfirm === investor.id ? (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(investor.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirm(null)}
                          className="text-brand-grayMed"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirm(investor.id)}
                        className="text-brand-grayMed hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
