"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Info } from "lucide-react";

interface PremiumPaymentsStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

const CURRENCIES = [
  { code: "EUR", symbol: "\u20ac", name: "Euro" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "GBP", symbol: "\u00a3", name: "British Pound" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
];

export function PremiumPaymentsStep({ data, onUpdate, onNext }: PremiumPaymentsStepProps) {
  const t = useTranslations("insurance.premiumPayments");
  const [formState, setFormState] = React.useState({
    currency: data.currency || "EUR",
    premiumType: data.premiumType || "",
    singlePremiumAmount: data.singlePremiumAmount || "",
    regularPremiumAmount: data.regularPremiumAmount || "",
    regularPremiumFrequency: data.regularPremiumFrequency || "",
    paymentMethod: data.paymentMethod || "",
    accountHolder: data.accountHolder || "",
    iban: data.iban || "",
    bic: data.bic || "",
    bankName: data.bankName || "",
  });

  const updateField = (field: string, value: any) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const minPremium = React.useMemo(() => {
    if (formState.premiumType === "single") return 25000;
    if (formState.premiumType === "regular" && formState.regularPremiumFrequency === "monthly") return 500;
    if (formState.premiumType === "regular" && formState.regularPremiumFrequency === "quarterly") return 1500;
    if (formState.premiumType === "regular" && formState.regularPremiumFrequency === "annual") return 5000;
    return 0;
  }, [formState.premiumType, formState.regularPremiumFrequency]);

  const isFormValid = React.useMemo(() => {
    const baseValid = formState.currency && formState.premiumType && formState.paymentMethod;

    let premiumValid = false;
    if (formState.premiumType === "single") {
      const amount = parseFloat(formState.singlePremiumAmount);
      premiumValid = !isNaN(amount) && amount >= minPremium;
    } else if (formState.premiumType === "regular") {
      const amount = parseFloat(formState.regularPremiumAmount);
      premiumValid =
        formState.regularPremiumFrequency && !isNaN(amount) && amount >= minPremium;
    }

    const paymentDetailsValid =
      formState.paymentMethod === "paypal" ||
      formState.paymentMethod === "check" ||
      (formState.paymentMethod === "bank-transfer" &&
        formState.accountHolder &&
        formState.iban &&
        formState.bic &&
        formState.bankName);

    return baseValid && premiumValid && paymentDetailsValid;
  }, [formState, minPremium]);

  React.useEffect(() => {
    onUpdate({
      ...formState,
      isPremiumStepValid: isFormValid,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formState, isFormValid]);

  const formatCurrency = (value: string) => {
    const currency = CURRENCIES.find((c) => c.code === formState.currency);
    return `${currency?.symbol || "\u20ac"}${parseFloat(value || "0").toLocaleString()}`;
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-brand-dark">{t("title")}</h2>
        <p className="text-brand-grayMed">{t("subtitle")}</p>
      </div>

      {/* Currency Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-brand-dark">{t("policyCurrency")}</h3>
        <div className="space-y-2">
          <Label htmlFor="currency">{t("selectCurrencyLabel")}</Label>
          <Select value={formState.currency} onValueChange={(value) => updateField("currency", value)}>
            <SelectTrigger id="currency">
              <SelectValue placeholder={t("selectCurrency")} />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((currency) => (
                <SelectItem key={currency.code} value={currency.code}>
                  {currency.symbol} {currency.name} ({currency.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-brand-grayMed">{t("currencyDesc")}</p>
        </div>
      </div>

      {/* Premium Type */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-brand-dark">{t("premiumStructure")}</h3>
        <RadioGroup value={formState.premiumType} onValueChange={(value) => updateField("premiumType", value)}>
          <div className="space-y-3">
            <div className={`flex items-start space-x-3 rounded-lg border-2 p-4 transition-all ${formState.premiumType === "single" ? "border-brand-gold bg-brand-gold/5" : "border-gray-200 hover:border-gray-300"}`}>
              <RadioGroupItem value="single" id="premium-single" />
              <div className="flex-1">
                <Label htmlFor="premium-single" className="cursor-pointer font-medium">{t("singlePremium")}</Label>
                <p className="text-sm text-brand-grayMed">{t("singlePremiumDesc")}</p>
              </div>
            </div>
            <div className={`flex items-start space-x-3 rounded-lg border-2 p-4 transition-all ${formState.premiumType === "regular" ? "border-brand-gold bg-brand-gold/5" : "border-gray-200 hover:border-gray-300"}`}>
              <RadioGroupItem value="regular" id="premium-regular" />
              <div className="flex-1">
                <Label htmlFor="premium-regular" className="cursor-pointer font-medium">{t("regularPremium")}</Label>
                <p className="text-sm text-brand-grayMed">{t("regularPremiumDesc")}</p>
              </div>
            </div>
          </div>
        </RadioGroup>
      </div>

      {/* Single Premium Amount */}
      {formState.premiumType === "single" && (
        <div className="space-y-4">
          <div className="rounded-lg border border-brand-grayLight bg-gray-50 p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="singlePremiumAmount">{t("singlePremiumAmount")}</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-grayMed">
                    {CURRENCIES.find((c) => c.code === formState.currency)?.symbol || "\u20ac"}
                  </span>
                  <Input id="singlePremiumAmount" type="number" min={minPremium} step="1000" value={formState.singlePremiumAmount} onChange={(e) => updateField("singlePremiumAmount", e.target.value)} placeholder={minPremium.toString()} className="pl-8" required />
                </div>
                <p className="text-xs text-brand-grayMed">{t("minimumSinglePremium")}: {formatCurrency(minPremium.toString())}</p>
              </div>
              {parseFloat(formState.singlePremiumAmount) > 0 && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <p className="text-sm font-semibold text-blue-900">{t("totalPremium")}: {formatCurrency(formState.singlePremiumAmount)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Regular Premium Amount */}
      {formState.premiumType === "regular" && (
        <div className="space-y-4">
          <div className="rounded-lg border border-brand-grayLight bg-gray-50 p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="regularPremiumFrequency">{t("paymentFrequency")}</Label>
                <Select value={formState.regularPremiumFrequency} onValueChange={(value) => updateField("regularPremiumFrequency", value)}>
                  <SelectTrigger id="regularPremiumFrequency">
                    <SelectValue placeholder={t("selectFrequency")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">{t("monthly")}</SelectItem>
                    <SelectItem value="quarterly">{t("quarterly")}</SelectItem>
                    <SelectItem value="annual">{t("annually")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formState.regularPremiumFrequency && (
                <div className="space-y-2">
                  <Label htmlFor="regularPremiumAmount">{t("premiumAmount")}</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-grayMed">
                      {CURRENCIES.find((c) => c.code === formState.currency)?.symbol || "\u20ac"}
                    </span>
                    <Input id="regularPremiumAmount" type="number" min={minPremium} step="100" value={formState.regularPremiumAmount} onChange={(e) => updateField("regularPremiumAmount", e.target.value)} placeholder={minPremium.toString()} className="pl-8" required />
                  </div>
                  <p className="text-xs text-brand-grayMed">
                    {t("minimumPremium", { frequency: formState.regularPremiumFrequency })}: {formatCurrency(minPremium.toString())}
                  </p>
                </div>
              )}
              {parseFloat(formState.regularPremiumAmount) > 0 && formState.regularPremiumFrequency && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <p className="text-sm font-semibold text-blue-900">
                    {formState.regularPremiumFrequency.charAt(0).toUpperCase() + formState.regularPremiumFrequency.slice(1)} {t("premiumLabel")}: {formatCurrency(formState.regularPremiumAmount)}
                  </p>
                  <p className="mt-1 text-xs text-blue-800">
                    {t("annualTotal")}: {formatCurrency((parseFloat(formState.regularPremiumAmount) * (formState.regularPremiumFrequency === "monthly" ? 12 : formState.regularPremiumFrequency === "quarterly" ? 4 : 1)).toString())}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Method */}
      {formState.premiumType && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-brand-dark">{t("paymentMethod")}</h3>
          <RadioGroup value={formState.paymentMethod} onValueChange={(value) => updateField("paymentMethod", value)}>
            <div className="space-y-3">
              <div className={`flex items-start space-x-3 rounded-lg border-2 p-4 transition-all ${formState.paymentMethod === "bank-transfer" ? "border-brand-gold bg-brand-gold/5" : "border-gray-200 hover:border-gray-300"}`}>
                <RadioGroupItem value="bank-transfer" id="payment-transfer" />
                <div className="flex-1">
                  <Label htmlFor="payment-transfer" className="cursor-pointer font-medium">{t("bankTransfer")}</Label>
                  <p className="text-sm text-brand-grayMed">
                    {formState.premiumType === "single" ? t("bankTransferSingleDesc") : t("bankTransferRegularDesc")}
                  </p>
                </div>
              </div>
              {formState.premiumType === "single" && (
                <div className={`flex items-start space-x-3 rounded-lg border-2 p-4 transition-all ${formState.paymentMethod === "check" ? "border-brand-gold bg-brand-gold/5" : "border-gray-200 hover:border-gray-300"}`}>
                  <RadioGroupItem value="check" id="payment-check" />
                  <div className="flex-1">
                    <Label htmlFor="payment-check" className="cursor-pointer font-medium">{t("bankCheck")}</Label>
                    <p className="text-sm text-brand-grayMed">{t("bankCheckDesc")}</p>
                  </div>
                </div>
              )}
              <div className={`flex items-start space-x-3 rounded-lg border-2 p-4 transition-all ${formState.paymentMethod === "paypal" ? "border-brand-gold bg-brand-gold/5" : "border-gray-200 hover:border-gray-300"}`}>
                <RadioGroupItem value="paypal" id="payment-paypal" />
                <div className="flex-1">
                  <Label htmlFor="payment-paypal" className="cursor-pointer font-medium">PayPal</Label>
                  <p className="text-sm text-brand-grayMed">
                    {formState.premiumType === "single" ? t("paypalSingleDesc") : t("paypalRegularDesc")}
                  </p>
                </div>
              </div>
            </div>
          </RadioGroup>
        </div>
      )}

      {/* Bank Account Details */}
      {formState.paymentMethod === "bank-transfer" && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-brand-dark">{t("bankAccountDetails")}</h3>
          <div className="rounded-lg border border-brand-grayLight bg-gray-50 p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="accountHolder">{t("accountHolder")}</Label>
                <Input id="accountHolder" type="text" value={formState.accountHolder} onChange={(e) => updateField("accountHolder", e.target.value)} placeholder={t("accountHolderPlaceholder")} required />
                <p className="text-xs text-brand-grayMed">{t("accountHolderDesc")}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="iban">{t("ibanLabel")}</Label>
                <Input id="iban" type="text" value={formState.iban} onChange={(e) => updateField("iban", e.target.value.toUpperCase())} placeholder="LU28 0019 4006 4475 0000" required />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="bic">{t("bicLabel")}</Label>
                  <Input id="bic" type="text" value={formState.bic} onChange={(e) => updateField("bic", e.target.value.toUpperCase())} placeholder="BCEELULL" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bankName">{t("bankNameLabel")}</Label>
                  <Input id="bankName" type="text" value={formState.bankName} onChange={(e) => updateField("bankName", e.target.value)} placeholder={t("bankNamePlaceholder")} required />
                </div>
              </div>
            </div>
          </div>
          {formState.premiumType === "regular" && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-start gap-2">
                <Info className="mt-0.5 h-5 w-5 text-blue-600" />
                <div className="space-y-1 text-sm text-blue-800">
                  <p className="font-semibold">{t("sepaTitle")}</p>
                  <p>{t("sepaText")}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {formState.paymentMethod === "check" && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-5 w-5 text-blue-600" />
            <div className="space-y-1 text-sm text-blue-800">
              <p className="font-semibold">{t("checkInstructionsTitle")}</p>
              <p>{t("checkInstructionsPayable")}</p>
              <p className="mt-2 font-mono">
                Opulanz Life Luxembourg S.A.<br />
                Premium Processing Department<br />
                12, rue Erasme<br />
                L-1468 Luxembourg
              </p>
              <p className="mt-2">{t("checkInstructionsMemo")}</p>
            </div>
          </div>
        </div>
      )}

      {/* PayPal Payment */}
      {formState.paymentMethod === "paypal" && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-brand-dark">{t("paypalPayment")}</h3>
          <div className="rounded-lg border border-brand-grayLight bg-gray-50 p-6">
            <div className="space-y-4">
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-start gap-2">
                  <Info className="mt-0.5 h-5 w-5 text-blue-600" />
                  <div className="space-y-1 text-sm text-blue-800">
                    <p className="font-semibold">{t("securePaypal")}</p>
                    <p>{t("securePaypalDesc")}</p>
                    {formState.premiumType === "single" && formState.singlePremiumAmount && (
                      <p className="mt-2 font-semibold">{t("amountToPay")}: {formatCurrency(formState.singlePremiumAmount)}</p>
                    )}
                    {formState.premiumType === "regular" && formState.regularPremiumAmount && (
                      <p className="mt-2 font-semibold">{formState.regularPremiumFrequency} {t("paymentLabel")}: {formatCurrency(formState.regularPremiumAmount)}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-center">
                <form action="https://www.paypal.com/ncp/payment/RDXD9J28Z94BL" method="post" target="_blank" className="inline-flex flex-col items-center justify-center gap-2">
                  <button type="submit" className="min-w-[11.625rem] rounded border-none bg-[#FFD140] px-8 py-2.5 text-base font-bold leading-5 text-black transition-all hover:bg-[#FFC520] focus:outline-none focus:ring-2 focus:ring-[#FFD140] focus:ring-offset-2" style={{ fontFamily: '"Helvetica Neue", Arial, sans-serif' }}>
                    {t("payWithPaypal")}
                  </button>
                  <img src="https://www.paypalobjects.com/images/Debit_Credit_APM.svg" alt={t("acceptedPaymentMethods")} className="h-8" />
                  <div className="text-xs text-brand-grayMed">
                    {t("securedBy")}{" "}
                    <img src="https://www.paypalobjects.com/paypal-ui/logos/svg/paypal-wordmark-color.svg" alt="PayPal" className="inline h-3.5 align-middle" />
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-2">
              <Info className="mt-0.5 h-5 w-5 text-amber-600" />
              <div className="space-y-1 text-sm text-amber-800">
                <p className="font-semibold">{t("paymentVerification")}</p>
                <p>{t("paymentVerificationDesc")}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-start gap-2">
          <Info className="mt-0.5 h-5 w-5 text-amber-600" />
          <div className="space-y-1 text-sm text-amber-800">
            <p className="font-semibold">{t("importantNote")}</p>
            <p>{t("importantNoteText")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
