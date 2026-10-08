"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  ArrowLeft, ArrowRight, MapPin, Building2, Calendar, CheckCircle, Download, Copy, Check,
  DollarSign, TrendingUp, Clock, Send, Loader2, AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  getPropertyById,
  getCurrentInvestor,
  createInvestment,
  getPropertyInvestments,
  type Property,
  type Investor,
} from "@/lib/investment-api";

const statusConfig: Record<string, { color: string; key: string }> = {
  open: { color: "bg-green-100 text-green-800", key: "open" },
  closing: { color: "bg-amber-100 text-amber-800", key: "closing" },
  closed: { color: "bg-gray-100 text-gray-600", key: "closed" },
  coming: { color: "bg-blue-100 text-blue-800", key: "coming" },
};

export default function SpvOfferingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const locale = useLocale();
  const t = useTranslations();

  const [selectedImage, setSelectedImage] = React.useState(0);
  const [copiedIban, setCopiedIban] = React.useState(false);
  const [property, setProperty] = React.useState<Property | null>(null);
  const [investor, setInvestor] = React.useState<Investor | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [availableOwnership, setAvailableOwnership] = React.useState(100);
  const [userInvestmentCount, setUserInvestmentCount] = React.useState(0);
  const [userTotalInvested, setUserTotalInvested] = React.useState(0);

  // Investment form state
  const [showInvestForm, setShowInvestForm] = React.useState(false);
  const [investmentAmount, setInvestmentAmount] = React.useState("");
  const [ownershipRequested, setOwnershipRequested] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitSuccess, setSubmitSuccess] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current investor
        const currentInvestor = getCurrentInvestor();
        setInvestor(currentInvestor);

        // Get property details
        const propertyData = await getPropertyById(parseInt(id));
        setProperty(propertyData);

        // Get current ownership to calculate available & check investor's existing investments
        if (propertyData) {
          const investments = await getPropertyInvestments(parseInt(id));
          const totalOwnership = investments.summary?.total_ownership_sold || 0;
          setAvailableOwnership(100 - totalOwnership);

          if (currentInvestor && investments.data) {
            const myInvestments = investments.data.filter(
              (inv) => inv.investor_id === currentInvestor.id && inv.status !== "cancelled"
            );
            setUserInvestmentCount(myInvestments.length);
            const totalMyInvested = myInvestments.reduce(
              (acc, inv) => acc + (parseFloat(inv.amount_invested as any) || 0),
              0
            );
            setUserTotalInvested(totalMyInvested);
          }
        }
      } catch (error) {
        console.error("Error fetching property:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleCopyIban = () => {
    if (property?.bank_iban) {
      navigator.clipboard.writeText(property.bank_iban.replace(/\s/g, ""));
      setCopiedIban(true);
      setTimeout(() => setCopiedIban(false), 2000);
    }
  };

  const calculateOwnership = (amount: string) => {
    if (!property?.total_value || !amount) return "";
    const totalValue = parseFloat(property.total_value.toString());
    const investAmount = parseFloat(amount.replace(/[^0-9.]/g, ""));
    if (totalValue > 0 && investAmount > 0) {
      const ownership = (investAmount / totalValue) * 100;
      return Math.min(ownership, availableOwnership).toFixed(2);
    }
    return "";
  };

  const handleAmountChange = (value: string) => {
    setInvestmentAmount(value);
    setOwnershipRequested(calculateOwnership(value));
  };

  const handleSubmitInvestment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!investor || !property) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const amount = parseFloat(investmentAmount.replace(/[^0-9.]/g, ""));
      const ownership = parseFloat(ownershipRequested);

      if (amount < (property.min_investment || 0)) {
        setSubmitError(`Minimum investment is €${property.min_investment?.toLocaleString()}`);
        setIsSubmitting(false);
        return;
      }

      if (ownership > availableOwnership) {
        setSubmitError(`Only ${availableOwnership}% ownership is available`);
        setIsSubmitting(false);
        return;
      }

      const result = await createInvestment({
        investor_id: investor.id,
        property_id: property.id,
        amount_invested: amount,
        ownership_percentage: ownership,
        number_of_shares: Math.floor(amount / (property.min_investment || 1)),
      });

      if (result.success) {
        setSubmitSuccess(true);
        setShowInvestForm(false);
        // Refresh available ownership
        setAvailableOwnership(prev => prev - ownership);
      } else {
        setSubmitError(result.error || "Failed to submit investment request");
      }
    } catch (error) {
      console.error("Error submitting investment:", error);
      setSubmitError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-[calc(100vh-7.5rem)] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-gold/30 border-t-brand-gold" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="bg-gray-50 min-h-[calc(100vh-7.5rem)] flex items-center justify-center">
        <div className="text-center">
          <Building2 className="mx-auto h-12 w-12 text-brand-grayLight" />
          <p className="mt-4 text-brand-grayMed">{t("spvInvestment.portal.offeringDetail.propertyNotFound")}</p>
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

  const config = statusConfig[property.status] || statusConfig.open;
  const images: string[] = (property.images && property.images.length > 0)
    ? property.images
    : ["https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=800&fit=crop"];

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
        {/* Success Message */}
        {submitSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-semibold text-green-900">
                  {t("spvInvestment.portal.offeringDetail.investCard.successTitle")}
                </p>
                <p className="text-sm text-green-700">
                  {t("spvInvestment.portal.offeringDetail.investCard.successDesc")}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Photo Gallery */}
        <div className="mb-8">
          <div className="relative aspect-[21/9] w-full overflow-hidden rounded-2xl mb-3">
            <Image
              src={images[selectedImage]}
              alt={property.title}
              fill
              className="object-cover"
            />
            {/* Status Badge */}
            <div className="absolute top-4 right-4">
              <span className={cn("rounded-full px-4 py-2 text-sm font-semibold", config.color)}>
                {t(`spvInvestment.portal.offerings.status.${config.key}`)}
              </span>
            </div>
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {images.map((img, index) => (
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
                <h1 className="text-2xl font-bold text-brand-dark md:text-3xl mb-4">
                  {property.title}
                </h1>

                <div className="grid gap-4 sm:grid-cols-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-brand-grayMed">
                    <MapPin className="h-4 w-4 text-brand-gold" />
                    <span><strong className="text-brand-dark">{t("spvInvestment.portal.offeringDetail.location")}:</strong> {property.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-brand-grayMed">
                    <Building2 className="h-4 w-4 text-brand-gold" />
                    <span><strong className="text-brand-dark">{t("spvInvestment.portal.offeringDetail.propertyType")}:</strong> {property.property_type}</span>
                  </div>
                  {property.size && (
                    <div className="flex items-center gap-2 text-sm text-brand-grayMed">
                      <Building2 className="h-4 w-4 text-brand-gold" />
                      <span><strong className="text-brand-dark">{t("spvInvestment.portal.offeringDetail.size")}:</strong> {property.size}</span>
                    </div>
                  )}
                  {property.year_built && (
                    <div className="flex items-center gap-2 text-sm text-brand-grayMed">
                      <Calendar className="h-4 w-4 text-brand-gold" />
                      <span><strong className="text-brand-dark">{t("spvInvestment.portal.offeringDetail.yearBuilt")}:</strong> {property.year_built}</span>
                    </div>
                  )}
                </div>

                {property.description && (
                  <>
                    <h3 className="text-lg font-bold text-brand-dark mb-3">{t("spvInvestment.portal.offeringDetail.description")}</h3>
                    <p className="text-sm text-brand-grayMed leading-relaxed">
                      {property.description}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Key Features */}
            {property.features && property.features.length > 0 && (
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle>{t("spvInvestment.portal.offeringDetail.features")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {property.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-brand-gold shrink-0 mt-0.5" />
                        <p className="text-sm text-brand-dark">{feature}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Investment Form */}
            {(property.status === "open" || property.status === "closing") && !submitSuccess && (
              <Card className="border border-brand-gold/30 bg-gradient-to-br from-white via-white to-brand-off/60 shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl overflow-hidden relative">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-gold/40 via-brand-gold to-brand-gold/40" />
                <CardHeader className="pb-3 pt-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="flex items-center gap-2.5 text-lg font-bold text-brand-dark">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gold/15 text-brand-gold">
                        <DollarSign className="h-5 w-5" />
                      </div>
                      {userInvestmentCount > 0
                        ? t("spvInvestment.portal.offeringDetail.investCard.titleMore")
                        : t("spvInvestment.portal.offeringDetail.investCard.title")}
                    </CardTitle>
                    {userInvestmentCount > 0 && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-gold/15 text-brand-dark text-xs font-semibold border border-brand-gold/30">
                        <CheckCircle className="h-3.5 w-3.5 text-brand-gold" />
                        {t("spvInvestment.portal.offeringDetail.investCard.alreadyInvestedBadge", {
                          amount: `€${userTotalInvested.toLocaleString()}`,
                        })}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pb-6">
                  {!showInvestForm ? (
                    <div className="text-center py-6 px-4 bg-brand-off/30 rounded-xl border border-brand-grayLight/30">
                      <p className="text-sm text-brand-grayMed max-w-md mx-auto mb-5 leading-relaxed">
                        {userInvestmentCount > 0
                          ? t("spvInvestment.portal.offeringDetail.investCard.descriptionMore")
                          : t("spvInvestment.portal.offeringDetail.investCard.description")}
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-brand-grayMed mb-6">
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-brand-grayLight/40 shadow-xs font-medium text-brand-dark">
                          <TrendingUp className="h-4 w-4 text-brand-gold" />
                          {t("spvInvestment.portal.offeringDetail.investCard.minBadge", {
                            amount: property.min_investment ? `€${property.min_investment.toLocaleString()}` : "Contact us",
                          })}
                        </span>
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-brand-grayLight/40 shadow-xs font-medium text-brand-dark">
                          <Clock className="h-4 w-4 text-brand-gold" />
                          {t("spvInvestment.portal.offeringDetail.investCard.availableBadge", {
                            percentage: availableOwnership.toFixed(1),
                          })}
                        </span>
                      </div>
                      <Button
                        onClick={() => setShowInvestForm(true)}
                        className="group relative inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-brand-gold via-brand-goldDark to-brand-gold hover:from-brand-goldDark hover:to-brand-gold shadow-md hover:shadow-xl hover:shadow-brand-gold/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer h-12"
                      >
                        <DollarSign className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                        <span className="tracking-wide">
                          {userInvestmentCount > 0
                            ? t("spvInvestment.portal.offeringDetail.investCard.investMoreButton")
                            : t("spvInvestment.portal.offeringDetail.investCard.requestButton")}
                        </span>
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitInvestment} className="space-y-5 pt-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="amount" className="text-xs font-semibold uppercase tracking-wider text-brand-grayMed">
                            {userInvestmentCount > 0
                              ? t("spvInvestment.portal.offeringDetail.investCard.amountMoreLabel")
                              : t("spvInvestment.portal.offeringDetail.investCard.amountLabel")}
                          </Label>
                          <div className="relative">
                            <Input
                              id="amount"
                              type="text"
                              value={investmentAmount}
                              onChange={(e) => handleAmountChange(e.target.value)}
                              placeholder={t("spvInvestment.portal.offeringDetail.investCard.amountPlaceholder", {
                                min: property.min_investment?.toLocaleString() || "0",
                              })}
                              className="h-11 rounded-xl border-brand-grayLight/60 focus:border-brand-gold focus:ring-brand-gold/20 text-brand-dark font-medium"
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ownership" className="text-xs font-semibold uppercase tracking-wider text-brand-grayMed">
                            {userInvestmentCount > 0
                              ? t("spvInvestment.portal.offeringDetail.investCard.ownershipMoreLabel")
                              : t("spvInvestment.portal.offeringDetail.investCard.ownershipLabel")}
                          </Label>
                          <Input
                            id="ownership"
                            type="text"
                            value={ownershipRequested ? `${ownershipRequested}%` : ""}
                            readOnly
                            className="h-11 rounded-xl bg-brand-off/60 border-brand-grayLight/40 text-brand-dark font-semibold"
                          />
                        </div>
                      </div>

                      <div className="p-4 bg-brand-gold/5 border border-brand-gold/20 rounded-xl">
                        <div className="flex items-start gap-3">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold shrink-0 mt-0.5">
                            <AlertCircle className="h-4 w-4" />
                          </div>
                          <div className="text-xs text-brand-grayMed space-y-1">
                            <p className="font-semibold text-brand-dark">{t("spvInvestment.portal.offeringDetail.investCard.offeringTerms")}</p>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-1">
                              <div>• {t("spvInvestment.portal.offeringDetail.investCard.termMin")} <span className="font-medium text-brand-dark">€{property.min_investment?.toLocaleString()}</span></div>
                              <div>• {t("spvInvestment.portal.offeringDetail.investCard.termTargetReturn")} <span className="font-medium text-brand-gold">{property.target_return || "N/A"}</span></div>
                              <div>• {t("spvInvestment.portal.offeringDetail.investCard.termPeriod")} <span className="font-medium text-brand-dark">{property.investment_term || "N/A"}</span></div>
                              <div>• {t("spvInvestment.portal.offeringDetail.investCard.termDistribution")} <span className="font-medium text-brand-dark">{property.distribution_frequency || "Quarterly"}</span></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {submitError && (
                        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 shrink-0" />
                          <span>{submitError}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-3 pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowInvestForm(false)}
                          className="rounded-xl h-11 px-5 border-brand-grayLight/60 hover:bg-brand-off text-brand-grayMed"
                        >
                          {t("spvInvestment.portal.offeringDetail.investCard.cancel")}
                        </Button>
                        <Button
                          type="submit"
                          disabled={isSubmitting || !investmentAmount}
                          className="flex-1 rounded-xl h-11 font-semibold text-white bg-gradient-to-r from-brand-gold to-brand-goldDark hover:from-brand-goldDark hover:to-brand-gold shadow-md hover:shadow-lg transition-all"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              {t("spvInvestment.portal.offeringDetail.investCard.submitting")}
                            </>
                          ) : (
                            <>
                              <Send className="mr-2 h-4 w-4" />
                              {userInvestmentCount > 0
                                ? t("spvInvestment.portal.offeringDetail.investCard.submitMore")
                                : t("spvInvestment.portal.offeringDetail.investCard.submit")}
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  )}
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
                  <div className="flex items-center justify-between border-b border-brand-grayLight/20 pb-3">
                    <span className="text-sm text-brand-grayMed">{t("spvInvestment.portal.offeringDetail.financials.totalValue")}</span>
                    <span className="text-sm font-bold text-brand-dark">
                      €{property.total_value?.toLocaleString() || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-brand-grayLight/20 pb-3">
                    <span className="text-sm text-brand-grayMed">{t("spvInvestment.portal.offeringDetail.financials.minimumInvestment")}</span>
                    <span className="text-sm font-bold text-brand-dark">
                      €{property.min_investment?.toLocaleString() || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-brand-grayLight/20 pb-3">
                    <span className="text-sm text-brand-grayMed">{t("spvInvestment.portal.offeringDetail.financials.targetReturn")}</span>
                    <span className="text-sm font-bold text-brand-gold">
                      {property.target_return || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-brand-grayLight/20 pb-3">
                    <span className="text-sm text-brand-grayMed">{t("spvInvestment.portal.offeringDetail.financials.investmentTerm")}</span>
                    <span className="text-sm font-bold text-brand-dark">
                      {property.investment_term || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-brand-grayLight/20 pb-3">
                    <span className="text-sm text-brand-grayMed">{t("spvInvestment.portal.offeringDetail.financials.distribution")}</span>
                    <span className="text-sm font-bold text-brand-dark">
                      {property.distribution_frequency || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-brand-grayMed">{t("spvInvestment.portal.offeringDetail.financials.available")}</span>
                    <span className="text-sm font-bold text-green-600">
                      {availableOwnership.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bank Transfer Instructions */}
            {(property.status === "open" || property.status === "closing") && property.bank_iban && (
              <Card className="border-none shadow-sm border-l-4 border-l-brand-gold">
                <CardHeader>
                  <CardTitle className="text-lg">{t("spvInvestment.portal.offeringDetail.bankTransfer.title")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-brand-grayMed mb-4">
                    {t("spvInvestment.portal.offeringDetail.bankTransfer.description")}
                  </p>
                  <div className="space-y-3">
                    {property.bank_name && (
                      <div>
                        <p className="text-xs text-brand-grayMed">{t("spvInvestment.portal.offeringDetail.bankTransfer.bankName")}</p>
                        <p className="text-sm font-semibold text-brand-dark">{property.bank_name}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-brand-grayMed">{t("spvInvestment.portal.offeringDetail.bankTransfer.iban")}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-mono font-semibold text-brand-dark">{property.bank_iban}</p>
                        <button
                          onClick={handleCopyIban}
                          className="text-brand-grayMed hover:text-brand-gold transition-colors"
                          title={t("spvInvestment.portal.offeringDetail.bankTransfer.copyIban")}
                        >
                          {copiedIban ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    {property.bank_bic && (
                      <div>
                        <p className="text-xs text-brand-grayMed">{t("spvInvestment.portal.offeringDetail.bankTransfer.bic")}</p>
                        <p className="text-sm font-mono font-semibold text-brand-dark">{property.bank_bic}</p>
                      </div>
                    )}
                    {property.bank_reference && (
                      <div>
                        <p className="text-xs text-brand-grayMed">{t("spvInvestment.portal.offeringDetail.bankTransfer.reference")}</p>
                        <p className="text-sm font-mono font-semibold text-brand-gold">{property.bank_reference}</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 rounded-lg bg-amber-50 p-3">
                    <p className="text-xs text-amber-800">
                      {t("spvInvestment.portal.offeringDetail.bankTransfer.important")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Documents */}
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">{t("spvInvestment.portal.offeringDetail.documents.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    t("spvInvestment.portal.offeringDetail.documents.prospectus"),
                    t("spvInvestment.portal.offeringDetail.documents.agreement"),
                    t("spvInvestment.portal.offeringDetail.documents.termSheet")
                  ].map((doc) => (
                    <button
                      key={doc}
                      className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-brand-off"
                    >
                      <Download className="h-4 w-4 text-brand-gold shrink-0" />
                      <span className="text-sm font-medium text-brand-dark">{doc}</span>
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
            <strong>{t("spvInvestment.portal.offeringDetail.disclaimerTitle")}</strong>{" "}
            {t("spvInvestment.portal.offeringDetail.disclaimer")}
          </p>
        </div>
      </div>
    </div>
  );
}
