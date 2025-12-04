"use client";

import * as React from "react";
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
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
];

export function PremiumPaymentsStep({ data, onUpdate, onNext }: PremiumPaymentsStepProps) {
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

  // Calculate minimum premium based on type
  const minPremium = React.useMemo(() => {
    if (formState.premiumType === "single") return 25000;
    if (formState.premiumType === "regular" && formState.regularPremiumFrequency === "monthly") return 500;
    if (formState.premiumType === "regular" && formState.regularPremiumFrequency === "quarterly") return 1500;
    if (formState.premiumType === "regular" && formState.regularPremiumFrequency === "annual") return 5000;
    return 0;
  }, [formState.premiumType, formState.regularPremiumFrequency]);

  // Validation
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

  // Update parent with validation status
  React.useEffect(() => {
    onUpdate({
      ...formState,
      isPremiumStepValid: isFormValid,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formState, isFormValid]);

  const formatCurrency = (value: string) => {
    const currency = CURRENCIES.find((c) => c.code === formState.currency);
    return `${currency?.symbol || "€"}${parseFloat(value || "0").toLocaleString()}`;
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-brand-dark">Premium & Payments</h2>
        <p className="text-brand-grayMed">
          Choose your premium structure and provide payment details.
        </p>
      </div>

      {/* Currency Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-brand-dark">Policy Currency *</h3>

        <div className="space-y-2">
          <Label htmlFor="currency">Select Currency</Label>
          <Select value={formState.currency} onValueChange={(value) => updateField("currency", value)}>
            <SelectTrigger id="currency">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((currency) => (
                <SelectItem key={currency.code} value={currency.code}>
                  {currency.symbol} {currency.name} ({currency.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-brand-grayMed">
            All premiums and payouts will be denominated in this currency
          </p>
        </div>
      </div>

      {/* Premium Type */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-brand-dark">Premium Structure *</h3>

        <RadioGroup value={formState.premiumType} onValueChange={(value) => updateField("premiumType", value)}>
          <div className="space-y-3">
            <div
              className={`flex items-start space-x-3 rounded-lg border-2 p-4 transition-all ${
                formState.premiumType === "single"
                  ? "border-brand-gold bg-brand-gold/5"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <RadioGroupItem value="single" id="premium-single" />
              <div className="flex-1">
                <Label htmlFor="premium-single" className="cursor-pointer font-medium">
                  Single Premium
                </Label>
                <p className="text-sm text-brand-grayMed">
                  One-time lump sum payment (Minimum: €25,000)
                </p>
              </div>
            </div>

            <div
              className={`flex items-start space-x-3 rounded-lg border-2 p-4 transition-all ${
                formState.premiumType === "regular"
                  ? "border-brand-gold bg-brand-gold/5"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <RadioGroupItem value="regular" id="premium-regular" />
              <div className="flex-1">
                <Label htmlFor="premium-regular" className="cursor-pointer font-medium">
                  Regular Premium
                </Label>
                <p className="text-sm text-brand-grayMed">
                  Recurring payments (monthly, quarterly, or annually)
                </p>
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
                <Label htmlFor="singlePremiumAmount">Single Premium Amount *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-grayMed">
                    {CURRENCIES.find((c) => c.code === formState.currency)?.symbol || "€"}
                  </span>
                  <Input
                    id="singlePremiumAmount"
                    type="number"
                    min={minPremium}
                    step="1000"
                    value={formState.singlePremiumAmount}
                    onChange={(e) => updateField("singlePremiumAmount", e.target.value)}
                    placeholder={minPremium.toString()}
                    className="pl-8"
                    required
                  />
                </div>
                <p className="text-xs text-brand-grayMed">
                  Minimum single premium: {formatCurrency(minPremium.toString())}
                </p>
              </div>

              {parseFloat(formState.singlePremiumAmount) > 0 && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <p className="text-sm font-semibold text-blue-900">
                    Total Premium: {formatCurrency(formState.singlePremiumAmount)}
                  </p>
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
                <Label htmlFor="regularPremiumFrequency">Payment Frequency *</Label>
                <Select
                  value={formState.regularPremiumFrequency}
                  onValueChange={(value) => updateField("regularPremiumFrequency", value)}
                >
                  <SelectTrigger id="regularPremiumFrequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="annual">Annually</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formState.regularPremiumFrequency && (
                <div className="space-y-2">
                  <Label htmlFor="regularPremiumAmount">Premium Amount *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-grayMed">
                      {CURRENCIES.find((c) => c.code === formState.currency)?.symbol || "€"}
                    </span>
                    <Input
                      id="regularPremiumAmount"
                      type="number"
                      min={minPremium}
                      step="100"
                      value={formState.regularPremiumAmount}
                      onChange={(e) => updateField("regularPremiumAmount", e.target.value)}
                      placeholder={minPremium.toString()}
                      className="pl-8"
                      required
                    />
                  </div>
                  <p className="text-xs text-brand-grayMed">
                    Minimum {formState.regularPremiumFrequency} premium:{" "}
                    {formatCurrency(minPremium.toString())}
                  </p>
                </div>
              )}

              {parseFloat(formState.regularPremiumAmount) > 0 && formState.regularPremiumFrequency && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <p className="text-sm font-semibold text-blue-900">
                    {formState.regularPremiumFrequency.charAt(0).toUpperCase() +
                      formState.regularPremiumFrequency.slice(1)}{" "}
                    Premium: {formatCurrency(formState.regularPremiumAmount)}
                  </p>
                  <p className="mt-1 text-xs text-blue-800">
                    Annual total: {formatCurrency((
                      parseFloat(formState.regularPremiumAmount) *
                      (formState.regularPremiumFrequency === "monthly"
                        ? 12
                        : formState.regularPremiumFrequency === "quarterly"
                        ? 4
                        : 1)
                    ).toString())}
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
          <h3 className="text-lg font-semibold text-brand-dark">Payment Method *</h3>

          <RadioGroup value={formState.paymentMethod} onValueChange={(value) => updateField("paymentMethod", value)}>
            <div className="space-y-3">
              <div
                className={`flex items-start space-x-3 rounded-lg border-2 p-4 transition-all ${
                  formState.paymentMethod === "bank-transfer"
                    ? "border-brand-gold bg-brand-gold/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <RadioGroupItem value="bank-transfer" id="payment-transfer" />
                <div className="flex-1">
                  <Label htmlFor="payment-transfer" className="cursor-pointer font-medium">
                    Bank Transfer / SEPA
                  </Label>
                  <p className="text-sm text-brand-grayMed">
                    {formState.premiumType === "single"
                      ? "One-time wire transfer from your bank account"
                      : "Set up automatic recurring payments"}
                  </p>
                </div>
              </div>

              {formState.premiumType === "single" && (
                <div
                  className={`flex items-start space-x-3 rounded-lg border-2 p-4 transition-all ${
                    formState.paymentMethod === "check"
                      ? "border-brand-gold bg-brand-gold/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <RadioGroupItem value="check" id="payment-check" />
                  <div className="flex-1">
                    <Label htmlFor="payment-check" className="cursor-pointer font-medium">
                      Bank Check
                    </Label>
                    <p className="text-sm text-brand-grayMed">
                      Send a certified bank check
                    </p>
                  </div>
                </div>
              )}

              <div
                className={`flex items-start space-x-3 rounded-lg border-2 p-4 transition-all ${
                  formState.paymentMethod === "paypal"
                    ? "border-brand-gold bg-brand-gold/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <RadioGroupItem value="paypal" id="payment-paypal" />
                <div className="flex-1">
                  <Label htmlFor="payment-paypal" className="cursor-pointer font-medium">
                    PayPal
                  </Label>
                  <p className="text-sm text-brand-grayMed">
                    {formState.premiumType === "single"
                      ? "Pay securely with PayPal, debit or credit card"
                      : "Set up recurring payments via PayPal"}
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
          <h3 className="text-lg font-semibold text-brand-dark">Bank Account Details</h3>

          <div className="rounded-lg border border-brand-grayLight bg-gray-50 p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="accountHolder">Account Holder Name *</Label>
                <Input
                  id="accountHolder"
                  type="text"
                  value={formState.accountHolder}
                  onChange={(e) => updateField("accountHolder", e.target.value)}
                  placeholder="Full name as it appears on the account"
                  required
                />
                <p className="text-xs text-brand-grayMed">
                  Must match the policyholder name for AML compliance
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="iban">IBAN *</Label>
                <Input
                  id="iban"
                  type="text"
                  value={formState.iban}
                  onChange={(e) => updateField("iban", e.target.value.toUpperCase())}
                  placeholder="LU28 0019 4006 4475 0000"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="bic">BIC / SWIFT Code *</Label>
                  <Input
                    id="bic"
                    type="text"
                    value={formState.bic}
                    onChange={(e) => updateField("bic", e.target.value.toUpperCase())}
                    placeholder="BCEELULL"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name *</Label>
                  <Input
                    id="bankName"
                    type="text"
                    value={formState.bankName}
                    onChange={(e) => updateField("bankName", e.target.value)}
                    placeholder="Name of your bank"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {formState.premiumType === "regular" && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-start gap-2">
                <Info className="mt-0.5 h-5 w-5 text-blue-600" />
                <div className="space-y-1 text-sm text-blue-800">
                  <p className="font-semibold">SEPA Direct Debit Authorization</p>
                  <p>
                    By providing your bank details, you authorize us to automatically debit your account for
                    regular premium payments. You can cancel this authorization at any time.
                  </p>
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
              <p className="font-semibold">Bank Check Instructions</p>
              <p>
                Please make the check payable to "Opulanz Life Luxembourg S.A." and send it to:
              </p>
              <p className="mt-2 font-mono">
                Opulanz Life Luxembourg S.A.<br />
                Premium Processing Department<br />
                12, rue Erasme<br />
                L-1468 Luxembourg
              </p>
              <p className="mt-2">
                Include your application reference number on the check memo line.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PayPal Payment */}
      {formState.paymentMethod === "paypal" && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-brand-dark">PayPal Payment</h3>

          <div className="rounded-lg border border-brand-grayLight bg-gray-50 p-6">
            <div className="space-y-4">
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-start gap-2">
                  <Info className="mt-0.5 h-5 w-5 text-blue-600" />
                  <div className="space-y-1 text-sm text-blue-800">
                    <p className="font-semibold">Secure PayPal Payment</p>
                    <p>
                      You will be redirected to PayPal to complete your payment securely. You can pay with your PayPal balance, bank account, or credit/debit card.
                    </p>
                    {formState.premiumType === "single" && formState.singlePremiumAmount && (
                      <p className="mt-2 font-semibold">
                        Amount to pay: {formatCurrency(formState.singlePremiumAmount)}
                      </p>
                    )}
                    {formState.premiumType === "regular" && formState.regularPremiumAmount && (
                      <p className="mt-2 font-semibold">
                        {formState.regularPremiumFrequency} payment: {formatCurrency(formState.regularPremiumAmount)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* PayPal Button */}
              <div className="flex justify-center">
                <form
                  action="https://www.paypal.com/ncp/payment/RDXD9J28Z94BL"
                  method="post"
                  target="_blank"
                  className="inline-flex flex-col items-center justify-center gap-2"
                >
                  <button
                    type="submit"
                    className="min-w-[11.625rem] rounded border-none bg-[#FFD140] px-8 py-2.5 text-base font-bold leading-5 text-black transition-all hover:bg-[#FFC520] focus:outline-none focus:ring-2 focus:ring-[#FFD140] focus:ring-offset-2"
                    style={{ fontFamily: '"Helvetica Neue", Arial, sans-serif' }}
                  >
                    Pay with PayPal
                  </button>
                  <img
                    src="https://www.paypalobjects.com/images/Debit_Credit_APM.svg"
                    alt="Accepted payment methods"
                    className="h-8"
                  />
                  <div className="text-xs text-brand-grayMed">
                    Secured by{" "}
                    <img
                      src="https://www.paypalobjects.com/paypal-ui/logos/svg/paypal-wordmark-color.svg"
                      alt="PayPal"
                      className="inline h-3.5 align-middle"
                    />
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-2">
              <Info className="mt-0.5 h-5 w-5 text-amber-600" />
              <div className="space-y-1 text-sm text-amber-800">
                <p className="font-semibold">Payment Verification</p>
                <p>
                  After completing your PayPal payment, you will receive a confirmation email. Your application will be processed once the payment is verified.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-start gap-2">
          <Info className="mt-0.5 h-5 w-5 text-amber-600" />
          <div className="space-y-1 text-sm text-amber-800">
            <p className="font-semibold">Important Note</p>
            <p>
              Premium payments must originate from an account in the policyholder's name. Third-party payments
              may not be accepted due to anti-money laundering regulations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
