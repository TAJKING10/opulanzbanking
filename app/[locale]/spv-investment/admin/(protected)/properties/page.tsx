"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Search, Plus, Edit2, Trash2, MapPin, Building2, Check, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getProperties, deleteProperty, getCurrentAdmin, type Property } from "@/lib/investment-api";

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

  const [properties, setProperties] = React.useState<Property[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [deleteConfirm, setDeleteConfirm] = React.useState<number | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Load properties
  React.useEffect(() => {
    const fetchProperties = async () => {
      try {
        const status = statusFilter === "all" ? undefined : statusFilter;
        const search = searchTerm || undefined;
        const result = await getProperties({ status, search });
        setProperties(result.data);
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProperties();
  }, [statusFilter, searchTerm]);

  // Check for ?action=new in URL
  React.useEffect(() => {
    if (searchParams.get("action") === "new") {
      window.location.href = `/${locale}/spv-investment/admin/properties/new`;
    }
  }, [searchParams, locale]);

  const handleDelete = async (id: number) => {
    const admin = getCurrentAdmin();
    const success = await deleteProperty(id, admin?.id);
    if (success) {
      setProperties((prev) => prev.filter((p) => p.id !== id));
    }
    setDeleteConfirm(null);
  };

  const formatCurrency = (value: number | undefined) => {
    if (!value) return "—";
    return new Intl.NumberFormat("en-EU", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
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
        {properties.length === 0 ? (
          <Card className="border-none shadow-sm">
            <CardContent className="py-12 text-center">
              <Building2 className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-4 text-slate-500">{t("spvInvestment.admin.properties.noProperties")}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => {
              const config = statusConfig[property.status] || statusConfig.open;
              const images = property.images || [];
              return (
                <Card key={property.id} className="border-none shadow-sm overflow-hidden group">
                  {/* Image */}
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={images[0] || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=500&fit=crop"}
                      alt={property.title}
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
                    <h3 className="font-bold text-slate-900 line-clamp-1">{property.title}</h3>

                    {/* Location */}
                    <div className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
                      <MapPin className="h-4 w-4" />
                      {property.location}
                    </div>

                    {/* Property Type */}
                    <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                      <Building2 className="h-4 w-4" />
                      {property.property_type}
                    </div>

                    {/* Financials */}
                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-slate-400">Min. Investment</p>
                        <p className="font-semibold text-slate-900">{formatCurrency(property.min_investment)}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Target Return</p>
                        <p className="font-semibold text-slate-900">{property.target_return || "—"}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end gap-2">
                      {deleteConfirm === property.id ? (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(property.id)}
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
                            onClick={() => setDeleteConfirm(property.id)}
                            className="text-slate-500 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/${locale}/spv-investment/admin/properties/${property.id}`}>
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
