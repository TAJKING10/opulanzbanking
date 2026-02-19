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
import { getCustomers, deleteCustomer, type Customer } from "@/lib/spv-data";

export default function CustomersPage() {
  const t = useTranslations();
  const locale = useLocale();
  const searchParams = useSearchParams();

  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"all" | "active" | "inactive">("all");
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = React.useState<string | null>(null);

  // Load customers
  React.useEffect(() => {
    setCustomers(getCustomers());
  }, []);

  // Check for ?action=new in URL
  React.useEffect(() => {
    if (searchParams.get("action") === "new") {
      window.location.href = `/${locale}/spv-investment/admin/customers/new`;
    }
  }, [searchParams, locale]);

  const filtered = customers.filter((c) => {
    const matchesSearch =
      searchTerm === "" ||
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.accessCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = (id: string) => {
    deleteCustomer(id);
    setCustomers(getCustomers());
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

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-100">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto max-w-7xl px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
                {t("spvInvestment.admin.customers.title")}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {t("spvInvestment.admin.customers.subtitle")}
              </p>
            </div>
            <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder={t("spvInvestment.admin.customers.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
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
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                )}
              >
                {t(`spvInvestment.admin.customers.filter.${status}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Customers Table */}
        <Card className="border-none shadow-sm overflow-hidden">
          {/* Desktop Header */}
          <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-6 py-3 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wide border-b border-slate-200">
            <div className="col-span-3">{t("spvInvestment.admin.customers.columns.name")}</div>
            <div className="col-span-2">{t("spvInvestment.admin.customers.columns.accessCode")}</div>
            <div className="col-span-2">{t("spvInvestment.admin.customers.columns.type")}</div>
            <div className="col-span-2">{t("spvInvestment.admin.customers.columns.lastAccess")}</div>
            <div className="col-span-1">{t("spvInvestment.admin.customers.columns.status")}</div>
            <div className="col-span-2 text-right">{t("spvInvestment.admin.customers.columns.actions")}</div>
          </div>

          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="py-12 text-center">
                <User className="mx-auto h-12 w-12 text-slate-300" />
                <p className="mt-4 text-slate-500">{t("spvInvestment.admin.customers.noCustomers")}</p>
              </div>
            ) : (
              filtered.map((customer) => (
                <div
                  key={customer.id}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-4 items-center px-6 py-4 border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors"
                >
                  {/* Name + Email */}
                  <div className="lg:col-span-3">
                    <p className="font-medium text-slate-900">{customer.name}</p>
                    <p className="text-sm text-slate-500">{customer.email}</p>
                  </div>

                  {/* Access Code */}
                  <div className="lg:col-span-2">
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono bg-slate-100 px-2 py-1 rounded">
                        {customer.accessCode}
                      </code>
                      <button
                        onClick={() => handleCopyCode(customer.accessCode)}
                        className="text-slate-400 hover:text-indigo-600 transition-colors"
                      >
                        {copiedCode === customer.accessCode ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Type */}
                  <div className="lg:col-span-2">
                    <span className="text-sm text-slate-600 capitalize">{customer.investorType}</span>
                    <span className="text-slate-300 mx-2">•</span>
                    <span className="text-sm text-slate-500 capitalize">{customer.profile}</span>
                  </div>

                  {/* Last Access */}
                  <div className="lg:col-span-2">
                    <p className="text-sm text-slate-500">{formatDate(customer.lastAccess)}</p>
                  </div>

                  {/* Status */}
                  <div className="lg:col-span-1">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                        customer.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-slate-100 text-slate-600"
                      )}
                    >
                      {customer.status}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="lg:col-span-2 flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="text-slate-500 hover:text-indigo-600"
                    >
                      <Link href={`/${locale}/spv-investment/admin/customers/${customer.id}`}>
                        <Edit2 className="h-4 w-4" />
                      </Link>
                    </Button>
                    {deleteConfirm === customer.id ? (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(customer.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirm(null)}
                          className="text-slate-500"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirm(customer.id)}
                        className="text-slate-500 hover:text-red-600"
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
