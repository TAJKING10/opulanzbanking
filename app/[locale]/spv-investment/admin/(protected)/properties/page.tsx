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
  open: { color: "bg-emerald-50 text-emerald-700 border border-emerald-200", label: "Open" },
  closing: { color: "bg-amber-50 text-amber-700 border border-amber-200", label: "Closing Soon" },
  closed: { color: "bg-brand-off text-brand-grayMed border border-brand-grayLight/40", label: "Closed" },
  coming: { color: "bg-brand-gold/10 text-brand-goldDark border border-brand-gold/30", label: "Coming Soon" },
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
                {t("spvInvestment.admin.properties.title")}
              </h1>
              <p className="mt-1 text-sm text-brand-grayMed">
                {t("spvInvestment.admin.properties.subtitle")}
              </p>
            </div>
            <Button asChild className="bg-brand-gold hover:bg-brand-goldDark text-white font-medium shadow-sm">
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-grayMed" />
            <Input
              type="text"
              placeholder={t("spvInvestment.admin.properties.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-brand-grayLight/60 focus:border-brand-gold bg-white"
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
                    ? "bg-brand-gold text-white shadow-sm"
                    : "bg-white text-brand-grayMed border border-brand-grayLight/50 hover:bg-brand-off"
                )}
              >
                {status === "all" ? t("spvInvestment.admin.properties.filter.all") : statusConfig[status]?.label}
              </button>
            ))}
          </div>
        </div>

        {/* Properties Grid */}
        {properties.length === 0 ? (
          <Card className="border border-brand-grayLight/30 bg-white shadow-sm">
            <CardContent className="py-12 text-center">
              <Building2 className="mx-auto h-12 w-12 text-brand-grayMed/40" />
              <p className="mt-4 text-sm text-brand-grayMed">{t("spvInvestment.admin.properties.noProperties")}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => {
              const config = statusConfig[property.status] || statusConfig.open;
              const images = property.images || [];
              return (
                <Card key={property.id} className="border border-brand-grayLight/40 bg-white shadow-sm rounded-xl overflow-hidden group hover:shadow-md transition-all">
                  {/* Image */}
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={images[0] || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=500&fit=crop"}
                      alt={property.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3">
                      <span className={cn("rounded-full px-3 py-1 text-xs font-semibold shadow-sm", config.color)}>
                        {config.label}
                      </span>
                    </div>
                  </div>

                  <CardContent className="p-5">
                    {/* Title */}
                    <h3 className="font-bold text-brand-dark line-clamp-1">{property.title}</h3>

                    {/* Location */}
                    <div className="mt-2 flex items-center gap-1.5 text-sm text-brand-grayMed">
                      <MapPin className="h-4 w-4 text-brand-gold" />
                      {property.location}
                    </div>

                    {/* Property Type */}
                    <div className="mt-1 flex items-center gap-1.5 text-sm text-brand-grayMed">
                      <Building2 className="h-4 w-4 text-brand-gold" />
                      {property.property_type}
                    </div>

                    {/* Financials */}
                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm p-3 bg-brand-off/60 rounded-lg border border-brand-grayLight/30">
                      <div>
                        <p className="text-xs text-brand-grayMed">Min. Investment</p>
                        <p className="font-semibold text-brand-dark mt-0.5">{formatCurrency(property.min_investment)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-brand-grayMed">Target Return</p>
                        <p className="font-semibold text-brand-gold mt-0.5">{property.target_return || "—"}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 pt-4 border-t border-brand-grayLight/30 flex justify-end gap-2">
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
                            className="text-brand-grayMed"
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
                            className="text-brand-grayMed hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button asChild variant="outline" size="sm" className="border-brand-grayLight/50 text-brand-dark hover:bg-brand-off">
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
