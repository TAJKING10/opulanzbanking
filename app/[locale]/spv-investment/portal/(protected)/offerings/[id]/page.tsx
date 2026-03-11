"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  ArrowLeft, MapPin, Building2, Calendar, CheckCircle, Download, Copy, Check,
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

        // Get current ownership to calculate available
        if (propertyData) {
          const investments = await getPropertyInvestments(parseInt(id));
          const totalOwnership = investments.summary?.total_ownership_sold || 0;
          setAvailableOwnership(100 - totalOwnership);
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
          <p className="mt-4 text-brand-grayMed">Property not found.</p>
          <Link
            href={`/${locale}/spv-investment/portal/offerings`}
            className="mt-4 inline-flex items-center text-sm font-semibold text-brand-gold"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Offerings
          </Link>
        </div>
      </div>
    );
  }

  const config = statusConfig[property.status] || statusConfig.open;
  const images = property.images?.length > 0
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
            Back to Offerings
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
                <p className="font-semibold text-green-900">Investment Request Submitted!</p>
                <p className="text-sm text-green-700">
                  Your investment request has been received. Our team will contact you shortly with next steps.
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
                {config.key === "open" ? "Open for Investment" :
                 config.key === "closing" ? "Closing Soon" :
                 config.key === "closed" ? "Fully Subscribed" : "Coming Soon"}
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
                    <span><strong className="text-brand-dark">Location:</strong> {property.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-brand-grayMed">
                    <Building2 className="h-4 w-4 text-brand-gold" />
                    <span><strong className="text-brand-dark">Type:</strong> {property.property_type}</span>
                  </div>
                  {property.size && (
                    <div className="flex items-center gap-2 text-sm text-brand-grayMed">
                      <Building2 className="h-4 w-4 text-brand-gold" />
                      <span><strong className="text-brand-dark">Size:</strong> {property.size}</span>
                    </div>
                  )}
                  {property.year_built && (
                    <div className="flex items-center gap-2 text-sm text-brand-grayMed">
                      <Calendar className="h-4 w-4 text-brand-gold" />
                      <span><strong className="text-brand-dark">Year Built:</strong> {property.year_built}</span>
                    </div>
                  )}
                </div>

                {property.description && (
                  <>
                    <h3 className="text-lg font-bold text-brand-dark mb-3">Description</h3>
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
                  <CardTitle>Key Features</CardTitle>
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
              <Card className="border-none shadow-sm border-l-4 border-l-green-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    Invest in This Property
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!showInvestForm ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-brand-grayMed mb-4">
                        Ready to invest? Click below to submit your investment request.
                      </p>
                      <div className="flex items-center justify-center gap-4 text-sm text-brand-grayMed mb-6">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-brand-gold" />
                          Min: €{property.min_investment?.toLocaleString() || "Contact us"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-brand-gold" />
                          {availableOwnership.toFixed(1)}% Available
                        </span>
                      </div>
                      <Button
                        onClick={() => setShowInvestForm(true)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <DollarSign className="mr-2 h-4 w-4" />
                        Request to Invest
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitInvestment} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="amount">Investment Amount (€)</Label>
                          <Input
                            id="amount"
                            type="text"
                            value={investmentAmount}
                            onChange={(e) => handleAmountChange(e.target.value)}
                            placeholder={`Min €${property.min_investment?.toLocaleString() || "0"}`}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ownership">Ownership Percentage</Label>
                          <Input
                            id="ownership"
                            type="text"
                            value={ownershipRequested ? `${ownershipRequested}%` : ""}
                            readOnly
                            className="bg-gray-50"
                          />
                        </div>
                      </div>

                      <div className="p-4 bg-amber-50 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                          <div className="text-sm text-amber-800">
                            <p className="font-semibold">Investment Terms</p>
                            <ul className="mt-1 space-y-1 text-xs">
                              <li>• Minimum investment: €{property.min_investment?.toLocaleString()}</li>
                              <li>• Target return: {property.target_return || "N/A"}</li>
                              <li>• Investment term: {property.investment_term || "N/A"}</li>
                              <li>• Distribution: {property.distribution_frequency || "As per agreement"}</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      {submitError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                          {submitError}
                        </div>
                      )}

                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowInvestForm(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={isSubmitting || !investmentAmount}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Send className="mr-2 h-4 w-4" />
                              Submit Investment Request
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
                <CardTitle className="text-lg">Financial Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-brand-grayLight/20 pb-3">
                    <span className="text-sm text-brand-grayMed">Total Value</span>
                    <span className="text-sm font-bold text-brand-dark">
                      €{property.total_value?.toLocaleString() || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-brand-grayLight/20 pb-3">
                    <span className="text-sm text-brand-grayMed">Min Investment</span>
                    <span className="text-sm font-bold text-brand-dark">
                      €{property.min_investment?.toLocaleString() || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-brand-grayLight/20 pb-3">
                    <span className="text-sm text-brand-grayMed">Target Return</span>
                    <span className="text-sm font-bold text-brand-gold">
                      {property.target_return || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-brand-grayLight/20 pb-3">
                    <span className="text-sm text-brand-grayMed">Investment Term</span>
                    <span className="text-sm font-bold text-brand-dark">
                      {property.investment_term || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-brand-grayLight/20 pb-3">
                    <span className="text-sm text-brand-grayMed">Distribution</span>
                    <span className="text-sm font-bold text-brand-dark">
                      {property.distribution_frequency || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-brand-grayMed">Available</span>
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
                  <CardTitle className="text-lg">Bank Transfer Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-brand-grayMed mb-4">
                    Use the following details to complete your investment transfer.
                  </p>
                  <div className="space-y-3">
                    {property.bank_name && (
                      <div>
                        <p className="text-xs text-brand-grayMed">Bank Name</p>
                        <p className="text-sm font-semibold text-brand-dark">{property.bank_name}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-brand-grayMed">IBAN</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-mono font-semibold text-brand-dark">{property.bank_iban}</p>
                        <button
                          onClick={handleCopyIban}
                          className="text-brand-grayMed hover:text-brand-gold transition-colors"
                          title="Copy IBAN"
                        >
                          {copiedIban ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    {property.bank_bic && (
                      <div>
                        <p className="text-xs text-brand-grayMed">BIC/SWIFT</p>
                        <p className="text-sm font-mono font-semibold text-brand-dark">{property.bank_bic}</p>
                      </div>
                    )}
                    {property.bank_reference && (
                      <div>
                        <p className="text-xs text-brand-grayMed">Payment Reference</p>
                        <p className="text-sm font-mono font-semibold text-brand-gold">{property.bank_reference}</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 rounded-lg bg-amber-50 p-3">
                    <p className="text-xs text-amber-800">
                      Always include the payment reference in your transfer to ensure proper allocation.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Documents */}
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {["Investment Prospectus", "Subscription Agreement", "Term Sheet"].map((doc) => (
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
            <strong>Important Notice:</strong> This investment opportunity is provided for informational purposes only
            and does not constitute an offer to sell or a solicitation of an offer to buy any securities.
            Investment in SPV structures involves risks including the potential loss of principal.
            Past performance is not indicative of future results. Please review all documentation
            carefully and consult with your financial advisor before making any investment decisions.
          </p>
        </div>
      </div>
    </div>
  );
}
