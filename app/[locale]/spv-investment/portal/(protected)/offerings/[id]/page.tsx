"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, MapPin, Building2, Calendar, CheckCircle, Download, Copy, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getOfferingById, type Offering } from "@/lib/spv-data";

const statusConfig: Record<string, { color: string; key: string }> = {
  open: { color: "bg-green-100 text-green-800", key: "open" },
  closing: { color: "bg-amber-100 text-amber-800", key: "closing" },
  closed: { color: "bg-gray-100 text-gray-600", key: "closed" },
  coming: { color: "bg-blue-100 text-blue-800", key: "coming" },
};

export default function SpvOfferingDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const locale = useLocale();
  const t = useTranslations();
  const [selectedImage, setSelectedImage] = React.useState(0);
  const [copiedIban, setCopiedIban] = React.useState(false);
  const [offering, setOffering] = React.useState<Offering | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const data = getOfferingById(id);
    setOffering(data || null);
    setIsLoading(false);
  }, [id]);

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-[calc(100vh-7.5rem)] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-gold/30 border-t-brand-gold" />
      </div>
    );
  }

  if (!offering) {
    return (
      <div className="bg-gray-50 min-h-[calc(100vh-7.5rem)] flex items-center justify-center">
        <div className="text-center">
          <Building2 className="mx-auto h-12 w-12 text-brand-grayLight" />
          <p className="mt-4 text-brand-grayMed">Offering not found.</p>
          <Link
            href={`/${locale}/spv-investment/portal/offerings`}
            className="mt-4 inline-flex items-center text-sm font-semibold text-brand-gold"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            {t("spvInvestment.portal.offeringDetail.backToOfferings")}
          </Link>
        </div>
      </div>
    );
  }

  const config = statusConfig[offering.status] || statusConfig.open;

  const handleCopyIban = () => {
    navigator.clipboard.writeText(offering.bankTransfer.iban.replace(/\s/g, ""));
    setCopiedIban(true);
    setTimeout(() => setCopiedIban(false), 2000);
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-7.5rem)]">
      {/* Back Navigation */}
      <div className="bg-white border-b border-brand-grayLight/30">
        <div className="container mx-auto max-w-7xl px-6 py-4">
          <Link
            href={`/${locale}/spv-investment/portal/offerings`}
            className="inline-flex items-center text-sm font-medium text-brand-grayMed hover:text-brand-gold transition-colors"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            {t("spvInvestment.portal.offeringDetail.backToOfferings")}
          </Link>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-6 py-8">
        {/* Photo Gallery */}
        <div className="mb-8">
          <div className="relative aspect-[21/9] w-full overflow-hidden rounded-2xl mb-3">
            <Image
              src={offering.images[selectedImage] || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=800&fit=crop"}
              alt={offering.title}
              fill
              className="object-cover"
            />
          </div>
          {offering.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {offering.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={cn(
                    "relative aspect-[3/2] overflow-hidden rounded-lg transition-all",
                    selectedImage === index
                      ? "ring-2 ring-brand-gold ring-offset-2"
                      : "opacity-70 hover:opacity-100"
                  )}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content (2/3) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            <Card className="border-none shadow-sm">
              <CardContent className="p-8">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <h1 className="text-2xl font-bold text-brand-dark md:text-3xl">
                    {offering.title}
                  </h1>
                  <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", config.color)}>
                    {t(`spvInvestment.portal.offerings.status.${config.key}`)}
                  </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-brand-grayMed">
                    <MapPin className="h-4 w-4 text-brand-gold" />
                    <span><strong className="text-brand-dark">{t("spvInvestment.portal.offeringDetail.location")}:</strong> {offering.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-brand-grayMed">
                    <Building2 className="h-4 w-4 text-brand-gold" />
                    <span><strong className="text-brand-dark">{t("spvInvestment.portal.offeringDetail.propertyType")}:</strong> {offering.propertyType}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-brand-grayMed">
                    <Building2 className="h-4 w-4 text-brand-gold" />
                    <span><strong className="text-brand-dark">{t("spvInvestment.portal.offeringDetail.totalSize")}:</strong> {offering.size}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-brand-grayMed">
                    <Calendar className="h-4 w-4 text-brand-gold" />
                    <span><strong className="text-brand-dark">{t("spvInvestment.portal.offeringDetail.yearBuilt")}:</strong> {offering.yearBuilt}</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-brand-dark mb-3">
                  {t("spvInvestment.portal.offeringDetail.description")}
                </h3>
                <p className="text-sm text-brand-grayMed leading-relaxed">
                  {offering.description}
                </p>
              </CardContent>
            </Card>

            {/* Key Features */}
            {offering.features.length > 0 && (
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle>{t("spvInvestment.portal.offeringDetail.features")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {offering.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-brand-gold shrink-0 mt-0.5" />
                        <p className="text-sm text-brand-dark">{feature}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar (1/3) */}
          <div className="space-y-6">
            {/* Financial Overview */}
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">{t("spvInvestment.portal.offeringDetail.financials.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(offering.financials).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between border-b border-brand-grayLight/20 pb-3 last:border-0 last:pb-0">
                      <span className="text-sm text-brand-grayMed">
                        {t(`spvInvestment.portal.offeringDetail.financials.${key}`)}
                      </span>
                      <span className="text-sm font-bold text-brand-dark">{value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Bank Transfer Instructions */}
            {(offering.status === "open" || offering.status === "closing") && (
              <Card className="border-none shadow-sm border-l-4 border-l-brand-gold">
                <CardHeader>
                  <CardTitle className="text-lg">{t("spvInvestment.portal.offeringDetail.bankTransfer.title")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-brand-grayMed mb-4">
                    {t("spvInvestment.portal.offeringDetail.bankTransfer.description")}
                  </p>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-brand-grayMed">{t("spvInvestment.portal.offeringDetail.bankTransfer.bankName")}</p>
                      <p className="text-sm font-semibold text-brand-dark">{offering.bankTransfer.bankName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-brand-grayMed">{t("spvInvestment.portal.offeringDetail.bankTransfer.iban")}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-mono font-semibold text-brand-dark">{offering.bankTransfer.iban}</p>
                        <button
                          onClick={handleCopyIban}
                          className="text-brand-grayMed hover:text-brand-gold transition-colors"
                          title="Copy IBAN"
                        >
                          {copiedIban ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-brand-grayMed">{t("spvInvestment.portal.offeringDetail.bankTransfer.bic")}</p>
                      <p className="text-sm font-mono font-semibold text-brand-dark">{offering.bankTransfer.bic}</p>
                    </div>
                    <div>
                      <p className="text-xs text-brand-grayMed">{t("spvInvestment.portal.offeringDetail.bankTransfer.reference")}</p>
                      <p className="text-sm font-mono font-semibold text-brand-gold">{offering.bankTransfer.reference}</p>
                    </div>
                  </div>
                  <div className="mt-4 rounded-lg bg-amber-50 p-3">
                    <p className="text-xs text-amber-800">
                      {t("spvInvestment.portal.offeringDetail.bankTransfer.important")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Related Documents */}
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">{t("spvInvestment.portal.offeringDetail.documents.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {["prospectus", "agreement", "termSheet"].map((doc) => (
                    <button
                      key={doc}
                      className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-brand-off"
                    >
                      <Download className="h-4 w-4 text-brand-gold shrink-0" />
                      <span className="text-sm font-medium text-brand-dark">
                        {t(`spvInvestment.portal.offeringDetail.documents.${doc}`)}
                      </span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
          <p className="text-xs text-brand-grayMed leading-relaxed">
            {t("spvInvestment.portal.offeringDetail.disclaimer")}
          </p>
        </div>
      </div>
    </div>
  );
}
