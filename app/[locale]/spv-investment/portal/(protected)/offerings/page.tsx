"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { MapPin, Building2, Maximize2, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const offerings = [
  {
    id: "spv-lux-residence-01",
    title: "Luxembourg City Premium Residence",
    location: "Luxembourg City, Luxembourg",
    propertyType: "Residential — Luxury Apartments",
    size: "2,400 m²",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=500&fit=crop",
    status: "open" as const,
    minimumInvestment: "€50,000",
    targetReturn: "7–9%",
    term: "5 years",
    features: ["Prime city-centre location", "12 residential units", "Fully managed"],
    description: "Premium residential development in the heart of Luxembourg City, offering stable rental income and capital appreciation potential.",
  },
  {
    id: "spv-riga-commercial-02",
    title: "Riga Commercial Centre",
    location: "Riga, Latvia",
    propertyType: "Commercial — Mixed Use",
    size: "4,800 m²",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=500&fit=crop",
    status: "closing" as const,
    minimumInvestment: "€25,000",
    targetReturn: "8–11%",
    term: "7 years",
    features: ["High-traffic business district", "Multi-tenant commercial", "Long-term leases in place"],
    description: "Strategic mixed-use commercial property in Riga's business district with established tenancy agreements.",
  },
  {
    id: "spv-stockholm-dev-03",
    title: "Stockholm Waterfront Development",
    location: "Stockholm, Sweden",
    propertyType: "Residential — New Development",
    size: "6,200 m²",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=500&fit=crop",
    status: "coming" as const,
    minimumInvestment: "€100,000",
    targetReturn: "9–12%",
    term: "4 years",
    features: ["Waterfront location", "Sustainable construction", "Pre-sold units"],
    description: "New waterfront residential development in Stockholm with strong pre-sales and sustainable design certification.",
  },
  {
    id: "spv-lux-office-04",
    title: "Kirchberg Office Complex",
    location: "Kirchberg, Luxembourg",
    propertyType: "Commercial — Office",
    size: "3,600 m²",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=500&fit=crop",
    status: "closed" as const,
    minimumInvestment: "€75,000",
    targetReturn: "6–8%",
    term: "6 years",
    features: ["EU institution district", "Grade A office space", "Triple-net lease"],
    description: "Grade A office complex in Luxembourg's Kirchberg financial district, fully leased to institutional tenants.",
  },
];

const statusConfig = {
  open: { color: "bg-green-100 text-green-800", label: "open" },
  closing: { color: "bg-amber-100 text-amber-800", label: "closing" },
  closed: { color: "bg-gray-100 text-gray-600", label: "closed" },
  coming: { color: "bg-blue-100 text-blue-800", label: "coming" },
};

export default function SpvOfferingsPage() {
  const t = useTranslations();
  const locale = useLocale();
  const [activeFilter, setActiveFilter] = React.useState("all");

  const filters = [
    { key: "all", label: t("spvInvestment.portal.offerings.filters.all") },
    { key: "open", label: t("spvInvestment.portal.offerings.filters.open") },
    { key: "closing", label: t("spvInvestment.portal.offerings.filters.closing") },
  ];

  const filteredOfferings = offerings.filter((o) => {
    if (activeFilter === "all") return true;
    return o.status === activeFilter;
  });

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-7.5rem)]">
      {/* Page Header */}
      <div className="bg-white border-b border-brand-grayLight/30">
        <div className="container mx-auto max-w-7xl px-6 py-8">
          <h1 className="text-2xl font-bold text-brand-dark md:text-3xl">
            {t("spvInvestment.portal.offerings.title")}
          </h1>
          <p className="mt-1 text-sm text-brand-grayMed">
            {t("spvInvestment.portal.offerings.subtitle")}
          </p>
          {/* Filters */}
          <div className="mt-6 flex gap-2">
            {filters.map((filter) => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                  activeFilter === filter.key
                    ? "bg-brand-gold text-white"
                    : "bg-white text-brand-grayMed border border-brand-grayLight hover:text-brand-dark"
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-6 py-8">
        {filteredOfferings.length === 0 ? (
          <div className="py-20 text-center">
            <Building2 className="mx-auto h-12 w-12 text-brand-grayLight" />
            <p className="mt-4 text-brand-grayMed">
              {t("spvInvestment.portal.offerings.noOfferings")}
            </p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            {filteredOfferings.map((offering) => {
              const config = statusConfig[offering.status];
              return (
                <Card
                  key={offering.id}
                  className="group overflow-hidden border-none shadow-sm hover:shadow-lg transition-all duration-300"
                >
                  {/* Image */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden">
                    <Image
                      src={offering.image}
                      alt={offering.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", config.color)}>
                        {t(`spvInvestment.portal.offerings.status.${config.label}`)}
                      </span>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <h3 className="mb-3 text-xl font-bold text-brand-dark group-hover:text-brand-gold transition-colors">
                      {offering.title}
                    </h3>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-brand-grayMed">
                        <MapPin className="h-4 w-4 text-brand-gold shrink-0" />
                        {offering.location}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-brand-grayMed">
                        <Building2 className="h-4 w-4 text-brand-gold shrink-0" />
                        {offering.propertyType}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-brand-grayMed">
                        <Maximize2 className="h-4 w-4 text-brand-gold shrink-0" />
                        {offering.size}
                      </div>
                    </div>

                    <div className="border-t border-brand-grayLight/30 pt-4 mb-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-xs text-brand-grayMed">{t("spvInvestment.portal.offerings.card.minimumInvestment")}</p>
                          <p className="mt-0.5 text-sm font-bold text-brand-dark">{offering.minimumInvestment}</p>
                        </div>
                        <div>
                          <p className="text-xs text-brand-grayMed">{t("spvInvestment.portal.offerings.card.targetReturn")}</p>
                          <p className="mt-0.5 text-sm font-bold text-brand-dark">{offering.targetReturn}</p>
                        </div>
                        <div>
                          <p className="text-xs text-brand-grayMed">{t("spvInvestment.portal.offerings.card.term")}</p>
                          <p className="mt-0.5 text-sm font-bold text-brand-dark">{offering.term}</p>
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/${locale}/spv-investment/portal/offerings/${offering.id}`}
                      className="inline-flex items-center text-sm font-semibold text-brand-gold hover:text-brand-goldDark transition-colors"
                    >
                      {t("spvInvestment.portal.offerings.card.viewDetails")}
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
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
