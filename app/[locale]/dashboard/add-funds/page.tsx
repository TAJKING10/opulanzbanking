"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import {
  Building2,
  Copy,
  Check,
  Info,
} from "lucide-react";

export default function AddFundsPage() {
  const params = useParams();
  const locale = params.locale as string;

  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  const bankDetails = {
    "Account Name": "Nordic Solutions OY",
    "IBAN": "FI91 1234 5678 9012 34",
    "BIC / SWIFT": "NDEAFIHH",
    "Bank Name": "Nordea Bank Finland",
  };

  const handleCopy = (field: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Add Funds</h1>
        <p className="text-gray-500 mt-1">Transfer funds to your Opulanz account via bank transfer</p>
      </div>

      {/* Bank Transfer — only method shown for now */}
      {/* Debit Card and Instant Transfer methods are hidden until later phases */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#b59354] rounded-xl flex items-center justify-center">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Bank Transfer</h3>
            <p className="text-xs text-gray-500">1–2 business days · No fee</p>
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-6">
          Use the details below to transfer funds from your bank. Always include the reference number.
        </p>

        <div className="space-y-3">
          {Object.entries(bankDetails).map(([label, value]) => (
            <div
              key={label}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div>
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className="font-mono font-medium text-gray-900">{value}</p>
              </div>
              <button
                onClick={() => handleCopy(label, value)}
                className="p-2 text-[#b59354] hover:bg-[#b59354]/10 rounded-lg transition-colors"
              >
                {copiedField === label ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <Copy className="h-5 w-5" />
                )}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
          <p className="text-sm text-blue-700">
            Funds typically arrive within 1–2 business days. Make sure to use exactly the account name and IBAN shown above.
          </p>
        </div>
      </div>

      {/*
        === Hidden for this phase ===

        Debit Card deposit method — adds decision fatigue, less suited for B2B banking.
        Instant Transfer (QR / Apple Pay / Google Pay) — too consumer-focused for MVP.
        Recent Deposits sidebar panel — move to Transactions page.
        Deposit Limits sidebar panel — move to Settings/Account Details.

        Uncomment when these features are ready to ship.
      */}
    </div>
  );
}
