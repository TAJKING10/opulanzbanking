"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, MapPin, Building2, Calendar, CheckCircle, Download, Copy, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const offeringsData: Record<string, {
  id: string;
  title: string;
  location: string;
  propertyType: string;
  size: string;
  yearBuilt: string;
  status: string;
  description: string;
  features: string[];
  images: string[];
  financials: {
    totalValue: string;
    spvShares: string;
    minimumInvestment: string;
    targetReturn: string;
    investmentTerm: string;
    distributionFrequency: string;
  };
  bankTransfer: {
    bankName: string;
    iban: string;
    bic: string;
    reference: string;
  };
}> = {
  "spv-lux-residence-01": {
    id: "spv-lux-residence-01",
    title: "Luxembourg City Premium Residence",
    location: "Luxembourg City, Luxembourg",
    propertyType: "Residential — Luxury Apartments",
    size: "2,400 m²",
    yearBuilt: "2022",
    status: "open",
    description: "This SPV holds a premium residential property located in the heart of Luxembourg City. The development comprises 12 luxury apartment units with high-quality finishes, situated in a sought-after neighbourhood with excellent transport links, proximity to the financial district, and strong rental demand. The property benefits from stable occupancy rates and delivers consistent rental income to SPV investors. The investment structure provides clear legal separation of assets, professional property management, and transparent quarterly reporting.",
    features: [
      "Prime city-centre location with excellent transport links",
      "12 fully furnished luxury residential units",
      "Professional property management included",
      "Current occupancy rate above 95%",
      "Energy efficiency rating: Class A",
      "Secure underground parking facility",
      "Quarterly investor distributions",
      "Annual independent property valuation",
    ],
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&h=400&fit=crop",
    ],
    financials: {
      totalValue: "€3,200,000",
      spvShares: "40 shares",
      minimumInvestment: "€50,000",
      targetReturn: "7–9% p.a.",
      investmentTerm: "5 years",
      distributionFrequency: "Quarterly",
    },
    bankTransfer: {
      bankName: "Banque de Luxembourg",
      iban: "LU12 3456 7890 1234 5678",
      bic: "BLLLLULL",
      reference: "SPV-LUX-RES-01",
    },
  },
  "spv-riga-commercial-02": {
    id: "spv-riga-commercial-02",
    title: "Riga Commercial Centre",
    location: "Riga, Latvia",
    propertyType: "Commercial — Mixed Use",
    size: "4,800 m²",
    yearBuilt: "2019",
    status: "closing",
    description: "This SPV holds a strategically located mixed-use commercial property in Riga's central business district. The property features retail space on the ground floor and modern office space across four upper floors, attracting quality tenants with long-term lease agreements. The investment benefits from Latvia's growing economy and competitive rental yields in the Baltic region.",
    features: [
      "Central business district location",
      "Multi-tenant commercial property",
      "Established long-term lease agreements",
      "Modern energy-efficient building systems",
      "Retail and office mixed-use format",
      "Strong Baltic economic fundamentals",
      "Semi-annual investor distributions",
      "Independent annual audit and valuation",
    ],
    images: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&h=400&fit=crop",
    ],
    financials: {
      totalValue: "€5,600,000",
      spvShares: "80 shares",
      minimumInvestment: "€25,000",
      targetReturn: "8–11% p.a.",
      investmentTerm: "7 years",
      distributionFrequency: "Semi-Annual",
    },
    bankTransfer: {
      bankName: "Banque de Luxembourg",
      iban: "LU98 7654 3210 9876 5432",
      bic: "BLLLLULL",
      reference: "SPV-RIG-COM-02",
    },
  },
  "spv-stockholm-dev-03": {
    id: "spv-stockholm-dev-03",
    title: "Stockholm Waterfront Development",
    location: "Stockholm, Sweden",
    propertyType: "Residential — New Development",
    size: "6,200 m²",
    yearBuilt: "2026 (est.)",
    status: "coming",
    description: "This SPV will hold a new-build waterfront residential development in Stockholm. The project includes 24 sustainably designed apartments with panoramic water views, targeting the premium Scandinavian residential market. Pre-sales have been strong, with a significant portion of units already reserved prior to construction completion.",
    features: [
      "Premium waterfront location in Stockholm",
      "24 residential units with panoramic views",
      "Sustainable construction — BREEAM Excellent",
      "Over 60% of units pre-reserved",
      "High-quality Scandinavian design and finishes",
      "Expected completion Q3 2026",
      "Developer track record of 15+ successful projects",
      "Capital distributions upon unit sales",
    ],
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=600&h=400&fit=crop",
    ],
    financials: {
      totalValue: "€8,400,000",
      spvShares: "60 shares",
      minimumInvestment: "€100,000",
      targetReturn: "9–12% p.a.",
      investmentTerm: "4 years",
      distributionFrequency: "Upon exit",
    },
    bankTransfer: {
      bankName: "Banque de Luxembourg",
      iban: "LU55 1122 3344 5566 7788",
      bic: "BLLLLULL",
      reference: "SPV-STO-DEV-03",
    },
  },
  "spv-lux-office-04": {
    id: "spv-lux-office-04",
    title: "Kirchberg Office Complex",
    location: "Kirchberg, Luxembourg",
    propertyType: "Commercial — Office",
    size: "3,600 m²",
    yearBuilt: "2018",
    status: "closed",
    description: "This SPV holds a Grade A office complex in Luxembourg's Kirchberg district, home to major EU institutions and international banks. The property is fully leased under a triple-net arrangement to institutional tenants, providing highly predictable income with minimal landlord obligations.",
    features: [
      "Kirchberg financial and institutional district",
      "Grade A office specification",
      "Triple-net lease structure",
      "Institutional-quality tenants",
      "Modern building systems and infrastructure",
      "Excellent public transport connectivity",
      "Quarterly investor distributions",
      "Long-term lease certainty",
    ],
    images: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&h=400&fit=crop",
    ],
    financials: {
      totalValue: "€4,800,000",
      spvShares: "48 shares",
      minimumInvestment: "€75,000",
      targetReturn: "6–8% p.a.",
      investmentTerm: "6 years",
      distributionFrequency: "Quarterly",
    },
    bankTransfer: {
      bankName: "Banque de Luxembourg",
      iban: "LU77 9988 7766 5544 3322",
      bic: "BLLLLULL",
      reference: "SPV-LUX-OFF-04",
    },
  },
};

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

  const offering = offeringsData[id];

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

  const config = statusConfig[offering.status];

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
              src={offering.images[selectedImage]}
              alt={offering.title}
              fill
              className="object-cover"
            />
          </div>
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
