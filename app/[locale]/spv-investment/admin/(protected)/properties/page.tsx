"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Search, Plus, Edit2, Trash2, MapPin, Building2, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getOfferings, deleteOffering, type Offering } from "@/lib/spv-data";

const statusConfig: Record<string, { color: string; label: string }> = {
  open: { color: "bg-green-100 text-green-800", label: "Open" },
  closing: { color: "bg-amber-100 text-amber-800", label: "Closing Soon" },
  closed: { color: "bg-slate-100 text-slate-600", label: "Closed" },
  coming: { color: "bg-blue-100 text-blue-800", label: "Coming Soon" },
};

export default function PropertiesPage() {
  const t = useTranslations();
  const locale = useLocale();
  const searchParams = useSearchParams();

  const [offerings, setOfferings] = React.useState<Offering[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [deleteConfirm, setDeleteConfirm] = React.useState<string | null>(null);

  // Load offerings
  React.useEffect(() => {
    setOfferings(getOfferings());
  }, []);

  // Check for ?action=new in URL
  React.useEffect(() => {
    if (searchParams.get("action") === "new") {
      // Redirect to create page
      window.location.href = `/${locale}/spv-investment/admin/properties/new`;
    }
  }, [searchParams, locale]);

  const filtered = offerings.filter((o) => {
    const matchesSearch =
      searchTerm === "" ||
      o.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = (id: string) => {
    deleteOffering(id);
    setOfferings(getOfferings());
    setDeleteConfirm(null);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-100">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto max-w-7xl px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
                {t("spvInvestment.admin.properties.title")}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {t("spvInvestment.admin.properties.subtitle")}
              </p>
            </div>
            <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
              <Link href={`/${locale}/spv-investment/admin/properties/new`}>
                <Plus className="mr-2 h-4 w-4" />
                {t("spvInvestment.admin.properties.addProperty")}
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
              placeholder={t("spvInvestment.admin.properties.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["all", "open", "closing", "closed", "coming"].map((status) => (
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
                {status === "all" ? t("spvInvestment.admin.properties.filter.all") : statusConfig[status]?.label}
              </button>
            ))}
          </div>
        </div>

        {/* Properties Grid */}
        {filtered.length === 0 ? (
          <Card className="border-none shadow-sm">
            <CardContent className="py-12 text-center">
              <Building2 className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-4 text-slate-500">{t("spvInvestment.admin.properties.noProperties")}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((offering) => {
              const config = statusConfig[offering.status] || statusConfig.open;
              return (
                <Card key={offering.id} className="border-none shadow-sm overflow-hidden group">
                  {/* Image */}
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={offering.images[0] || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=500&fit=crop"}
                      alt={offering.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3">
                      <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", config.color)}>
                        {config.label}
                      </span>
                    </div>
                  </div>

                  <CardContent className="p-5">
                    {/* Title */}
                    <h3 className="font-bold text-slate-900 line-clamp-1">{offering.title}</h3>

                    {/* Location */}
                    <div className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
                      <MapPin className="h-4 w-4" />
                      {offering.location}
                    </div>

                    {/* Property Type */}
                    <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                      <Building2 className="h-4 w-4" />
                      {offering.propertyType}
                    </div>

                    {/* Financials */}
                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-slate-400">Min. Investment</p>
                        <p className="font-semibold text-slate-900">{offering.financials.minimumInvestment}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Target Return</p>
                        <p className="font-semibold text-slate-900">{offering.financials.targetReturn}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end gap-2">
                      {deleteConfirm === offering.id ? (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(offering.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Confirm
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteConfirm(null)}
                            className="text-slate-500"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteConfirm(offering.id)}
                            className="text-slate-500 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/${locale}/spv-investment/admin/properties/${offering.id}`}>
                              <Edit2 className="h-4 w-4 mr-1" />
                              Edit
                            </Link>
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
