"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { FileText, Download, Search, FolderOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const documents = [
  {
    id: 1,
    name: "Luxembourg City Premium Residence — Subscription Agreement",
    category: "agreements",
    date: "2025-01-28",
    size: "2.4 MB",
  },
  {
    id: 2,
    name: "Riga Commercial Centre — Subscription Agreement",
    category: "agreements",
    date: "2025-01-15",
    size: "2.1 MB",
  },
  {
    id: 3,
    name: "Luxembourg Residence — Investment Prospectus",
    category: "agreements",
    date: "2025-01-20",
    size: "4.8 MB",
  },
  {
    id: 4,
    name: "Q4 2024 Performance Report — All Projects",
    category: "reports",
    date: "2025-01-10",
    size: "1.8 MB",
  },
  {
    id: 5,
    name: "Q3 2024 Performance Report — All Projects",
    category: "reports",
    date: "2024-10-12",
    size: "1.6 MB",
  },
  {
    id: 6,
    name: "Annual Tax Certificate 2024",
    category: "tax",
    date: "2025-02-01",
    size: "0.5 MB",
  },
  {
    id: 7,
    name: "Tax Residency Self-Certification Form",
    category: "tax",
    date: "2024-06-15",
    size: "0.3 MB",
  },
  {
    id: 8,
    name: "Luxembourg Residence — Articles of Association",
    category: "legal",
    date: "2024-06-01",
    size: "3.2 MB",
  },
  {
    id: 9,
    name: "Riga Commercial — Articles of Association",
    category: "legal",
    date: "2024-09-10",
    size: "2.9 MB",
  },
  {
    id: 10,
    name: "General Terms & Conditions — Investor Portal",
    category: "legal",
    date: "2024-01-01",
    size: "1.1 MB",
  },
];

const categoryConfig: Record<string, { color: string }> = {
  agreements: { color: "bg-blue-100 text-blue-800" },
  reports: { color: "bg-green-100 text-green-800" },
  tax: { color: "bg-amber-100 text-amber-800" },
  legal: { color: "bg-purple-100 text-purple-800" },
};

export default function SpvDocumentsPage() {
  const t = useTranslations();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [activeCategory, setActiveCategory] = React.useState("all");

  const categories = [
    { key: "all", label: t("spvInvestment.portal.documents.categories.all") },
    { key: "agreements", label: t("spvInvestment.portal.documents.categories.agreements") },
    { key: "reports", label: t("spvInvestment.portal.documents.categories.reports") },
    { key: "tax", label: t("spvInvestment.portal.documents.categories.tax") },
    { key: "legal", label: t("spvInvestment.portal.documents.categories.legal") },
  ];

  const filtered = documents.filter((doc) => {
    const matchesCategory = activeCategory === "all" || doc.category === activeCategory;
    const matchesSearch =
      searchTerm === "" ||
      doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-7.5rem)]">
      {/* Page Header */}
      <div className="bg-white border-b border-brand-grayLight/30">
        <div className="container mx-auto max-w-7xl px-6 py-8">
          <h1 className="text-2xl font-bold text-brand-dark md:text-3xl">
            {t("spvInvestment.portal.documents.title")}
          </h1>
          <p className="mt-1 text-sm text-brand-grayMed">
            {t("spvInvestment.portal.documents.subtitle")}
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-6 py-8">
        {/* Controls */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-grayMed" />
            <Input
              type="text"
              placeholder={t("spvInvestment.portal.documents.search")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                  activeCategory === cat.key
                    ? "bg-brand-gold text-white"
                    : "bg-white text-brand-grayMed border border-brand-grayLight hover:text-brand-dark"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Documents List */}
        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <FolderOpen className="mx-auto h-12 w-12 text-brand-grayLight" />
            <p className="mt-4 text-brand-grayMed">
              {t("spvInvestment.portal.documents.noDocuments")}
            </p>
          </div>
        ) : (
          <Card className="border-none shadow-sm overflow-hidden">
            {/* Desktop Table Header */}
            <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3 bg-gray-50 text-xs font-semibold text-brand-grayMed uppercase tracking-wide border-b border-brand-grayLight/20">
              <div className="col-span-6">{t("spvInvestment.portal.documents.table.name")}</div>
              <div className="col-span-2">{t("spvInvestment.portal.documents.table.category")}</div>
              <div className="col-span-2">{t("spvInvestment.portal.documents.table.date")}</div>
              <div className="col-span-1">{t("spvInvestment.portal.documents.table.size")}</div>
              <div className="col-span-1"></div>
            </div>

            <CardContent className="p-0">
              {filtered.map((doc) => {
                const catConfig = categoryConfig[doc.category] || { color: "bg-gray-100 text-gray-600" };
                return (
                  <div
                    key={doc.id}
                    className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-center px-6 py-4 border-b border-brand-grayLight/10 last:border-0 hover:bg-gray-50/50 transition-colors"
                  >
                    {/* Document Name */}
                    <div className="md:col-span-6 flex items-center gap-3">
                      <FileText className="h-5 w-5 text-brand-gold shrink-0" />
                      <span className="text-sm font-medium text-brand-dark">{doc.name}</span>
                    </div>

                    {/* Category */}
                    <div className="md:col-span-2">
                      <span className={cn("inline-block rounded-full px-2.5 py-0.5 text-xs font-medium", catConfig.color)}>
                        {t(`spvInvestment.portal.documents.categories.${doc.category}`)}
                      </span>
                    </div>

                    {/* Date */}
                    <div className="md:col-span-2 text-sm text-brand-grayMed">{doc.date}</div>

                    {/* Size */}
                    <div className="md:col-span-1 text-sm text-brand-grayMed">{doc.size}</div>

                    {/* Download */}
                    <div className="md:col-span-1 flex justify-end">
                      <Button variant="ghost" size="sm" className="text-brand-gold hover:text-brand-goldDark">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
