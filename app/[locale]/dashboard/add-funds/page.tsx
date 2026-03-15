"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import {
  CreditCard,
  Building2,
  Smartphone,
  Copy,
  Check,
  Info,
  ChevronDown,
  ArrowRight,
  QrCode,
  Wallet,
} from "lucide-react";

export default function AddFundsPage() {
  const params = useParams();
  const locale = params.locale as string;

  const [method, setMethod] = React.useState<"bank" | "card" | "instant">("bank");
  const [amount, setAmount] = React.useState("");
  const [selectedAccount, setSelectedAccount] = React.useState("main");
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  const accounts = [
    { id: "main", name: "Main Current Account", iban: "FI91 1234 5678 9012 34" },
    { id: "savings", name: "Savings Account", iban: "FI91 1234 5678 9012 35" },
    { id: "operating", name: "Operating Expenses", iban: "FI91 1234 5678 9012 37" },
  ];

  const bankDetails = {
    accountName: "Nordic Solutions OY",
    iban: "FI91 1234 5678 9012 34",
    bic: "NDEAFIHH",
    bankName: "Nordea Bank Finland",
    reference: "RF12 3456 7890",
  };

  const handleCopy = (field: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const quickAmounts = ["€100", "€500", "€1,000", "€5,000"];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Add Funds</h1>
        <p className="text-gray-500 mt-1">Deposit money into your Narvi account</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content - 2 cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* Deposit Method Selection */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Select Deposit Method</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <button
                onClick={() => setMethod("bank")}
                className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  method === "bank"
                    ? "border-[#3b4078] bg-[#3b4078]/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  method === "bank" ? "bg-[#3b4078] text-white" : "bg-gray-100 text-gray-600"
                }`}>
                  <Building2 className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-gray-900">Bank Transfer</p>
                  <p className="text-xs text-gray-500">1-2 business days</p>
                </div>
              </button>

              <button
                onClick={() => setMethod("card")}
                className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  method === "card"
                    ? "border-[#3b4078] bg-[#3b4078]/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  method === "card" ? "bg-[#3b4078] text-white" : "bg-gray-100 text-gray-600"
                }`}>
                  <CreditCard className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-gray-900">Debit Card</p>
                  <p className="text-xs text-gray-500">Instant • 1.5% fee</p>
                </div>
              </button>

              <button
                onClick={() => setMethod("instant")}
                className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  method === "instant"
                    ? "border-[#3b4078] bg-[#3b4078]/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  method === "instant" ? "bg-[#3b4078] text-white" : "bg-gray-100 text-gray-600"
                }`}>
                  <Smartphone className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-gray-900">Instant Transfer</p>
                  <p className="text-xs text-gray-500">Seconds • Free</p>
                </div>
              </button>
            </div>
          </div>

          {/* Bank Transfer Details */}
          {method === "bank" && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-2">Bank Transfer Details</h3>
              <p className="text-sm text-gray-500 mb-6">
                Use these details to transfer funds from your bank account
              </p>

              <div className="space-y-4">
                {Object.entries({
                  "Account Name": bankDetails.accountName,
                  "IBAN": bankDetails.iban,
                  "BIC/SWIFT": bankDetails.bic,
                  "Bank Name": bankDetails.bankName,
                  "Reference": bankDetails.reference,
                }).map(([label, value]) => (
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
                      className="p-2 text-[#3b4078] hover:bg-[#3b4078]/10 rounded-lg transition-colors"
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
                <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">Important</p>
                  <p>Always include the reference number when making a transfer. Funds typically arrive within 1-2 business days.</p>
                </div>
              </div>
            </div>
          )}

          {/* Card Deposit */}
          {method === "card" && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Deposit with Card</h3>

              {/* Destination Account */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destination Account
                </label>
                <div className="relative">
                  <select
                    value={selectedAccount}
                    onChange={(e) => setSelectedAccount(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#3b4078]/20"
                  >
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>

              {/* Amount */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">€</span>
                  <input
                    type="text"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-lg text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-[#3b4078]/20"
                  />
                </div>
                <div className="flex gap-2 mt-3">
                  {quickAmounts.map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setAmount(amt.replace("€", "").replace(",", ""))}
                      className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
                    >
                      {amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Card Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number
                  </label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3b4078]/20"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3b4078]/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      placeholder="123"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3b4078]/20"
                    />
                  </div>
                </div>
              </div>

              <button className="w-full mt-6 bg-[#3b4078] text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-[#2a2d5a] transition-colors">
                Deposit Funds
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* Instant Transfer */}
          {method === "instant" && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Instant Transfer</h3>
              <p className="text-sm text-gray-500 mb-6">
                Scan the QR code with your banking app to make an instant transfer
              </p>

              <div className="flex flex-col items-center py-8">
                <div className="w-48 h-48 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
                  <QrCode className="h-32 w-32 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 mb-2">Or use account details</p>
                <p className="font-mono text-lg font-medium text-gray-900">{bankDetails.iban}</p>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Wallet className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-xs text-gray-500">Apple Pay</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Wallet className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-xs text-gray-500">Google Pay</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Building2 className="h-6 w-6 text-purple-600" />
                  </div>
                  <p className="text-xs text-gray-500">Open Banking</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Deposits */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Recent Deposits</h3>
            <div className="space-y-4">
              {[
                { amount: "+€5,000.00", date: "Oct 20, 2023", method: "Bank Transfer" },
                { amount: "+€1,500.00", date: "Oct 15, 2023", method: "Card Deposit" },
                { amount: "+€10,000.00", date: "Oct 10, 2023", method: "Bank Transfer" },
              ].map((deposit, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="font-semibold text-green-600">{deposit.amount}</p>
                    <p className="text-xs text-gray-500">{deposit.method}</p>
                  </div>
                  <p className="text-sm text-gray-500">{deposit.date}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Deposit Limits */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Deposit Limits</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">Daily Limit</span>
                  <span className="font-medium text-gray-900">€50,000</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#3b4078] rounded-full" style={{ width: "15%" }} />
                </div>
                <p className="text-xs text-gray-500 mt-1">€7,500 used today</p>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">Monthly Limit</span>
                  <span className="font-medium text-gray-900">€500,000</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#3b4078] rounded-full" style={{ width: "35%" }} />
                </div>
                <p className="text-xs text-gray-500 mt-1">€175,000 used this month</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
