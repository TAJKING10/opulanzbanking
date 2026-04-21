"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowRight,
  User,
  Building2,
  Plus,
  ChevronDown,
  Info,
  Check,
  Search,
} from "lucide-react";

// SEPA country codes (simplified list)
const SEPA_COUNTRY_CODES = new Set([
  "AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IE",
  "IT","LV","LT","LU","MT","NL","PL","PT","RO","SK","SI","ES","SE",
  "IS","LI","NO","CH","GB","MC","SM","AD","VA",
]);

function classifyTransfer(iban: string, country: string): "domestic" | "sepa" | "international" {
  const ibanCountry = iban.slice(0, 2).toUpperCase();
  const target = ibanCountry || country.toUpperCase();
  if (target === "FI") return "domestic";
  if (SEPA_COUNTRY_CODES.has(target)) return "sepa";
  return "international";
}

const CLASSIFICATION_LABELS: Record<string, { label: string; color: string }> = {
  domestic: { label: "Domestic Transfer", color: "text-green-700 bg-green-50" },
  sepa: { label: "SEPA Transfer", color: "text-blue-700 bg-blue-50" },
  international: { label: "International (SWIFT)", color: "text-orange-700 bg-orange-50" },
};

export default function SendMoneyPage() {
  const params = useParams();
  const locale = params.locale as string;

  const [transferType, setTransferType] = React.useState<"own" | "bank">("bank");
  const [amount, setAmount] = React.useState("");
  const [selectedAccount, setSelectedAccount] = React.useState("main");
  const [selectedRecipient, setSelectedRecipient] = React.useState<string | null>(null);
  const [reference, setReference] = React.useState("");
  const [isScheduled, setIsScheduled] = React.useState(false);
  const [beneficiarySearch, setBeneficiarySearch] = React.useState("");
  const [beneficiaryIban, setBeneficiaryIban] = React.useState("");

  const accounts = [
    { id: "main", name: "Main Current Account", balance: "€85,230.50", iban: "FI91 1234 5678 9012 34" },
    { id: "savings", name: "Savings Account", balance: "€35,200.00", iban: "FI91 1234 5678 9012 35" },
    { id: "operating", name: "Operating Expenses", balance: "€45,000.00", iban: "FI91 1234 5678 9012 37" },
  ];

  const recentRecipients = [
    { id: "1", name: "Nordic Tech AB", initial: "N", color: "bg-purple-500" },
    { id: "2", name: "Amazon Services", initial: "A", color: "bg-[#b59354]" },
    { id: "3", name: "Google Cloud", initial: "G", color: "bg-yellow-500" },
    { id: "4", name: "Slack Inc", initial: "S", color: "bg-blue-500" },
  ];

  const savedBeneficiaries = [
    { id: "1", name: "Nordic Tech AB", iban: "SE45 5000 0000 0583 9825 7466", bank: "Swedbank" },
    { id: "2", name: "CloudTech Solutions", iban: "DE89 3704 0044 0532 0130 00", bank: "Commerzbank" },
    { id: "3", name: "Invoice Partner Ltd", iban: "GB82 WEST 1234 5698 7654 32", bank: "HSBC" },
  ];

  const filteredBeneficiaries = beneficiarySearch
    ? savedBeneficiaries.filter((b) =>
        b.name.toLowerCase().includes(beneficiarySearch.toLowerCase()) ||
        b.iban.toLowerCase().includes(beneficiarySearch.toLowerCase())
      )
    : savedBeneficiaries;

  const selectedAccountData = accounts.find((a) => a.id === selectedAccount);

  // Classify the transfer based on IBAN input
  const classification = beneficiaryIban.length >= 2
    ? classifyTransfer(beneficiaryIban.replace(/\s/g, ""), "")
    : null;
  const classLabel = classification ? CLASSIFICATION_LABELS[classification] : null;

  const isFormReady = !!(amount && selectedRecipient);

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Transfer Money</h1>
        <p className="text-gray-500 mt-1">Send money to your accounts or other beneficiaries</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Form - 2 cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* Transfer Type Tabs */}
          <div className="bg-white rounded-xl p-1 shadow-sm border border-gray-100">
            <div className="flex">
              <button
                onClick={() => setTransferType("own")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                  transferType === "own"
                    ? "bg-[#b59354] text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <User className="h-4 w-4" />
                Own Accounts
              </button>
              <button
                onClick={() => setTransferType("bank")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                  transferType === "bank"
                    ? "bg-[#b59354] text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Building2 className="h-4 w-4" />
                Bank Transfer
              </button>
              {/* International tab removed — handled inside Bank Transfer via IBAN detection */}
            </div>
          </div>

          {/* From Account */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-3">From Account</label>
            <div className="relative">
              <select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#b59354]/20 focus:border-[#b59354] bg-white"
              >
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} — {account.balance}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
            {selectedAccountData && (
              <p className="mt-2 text-xs text-gray-500">IBAN: {selectedAccountData.iban}</p>
            )}
          </div>

          {/* To — Beneficiary Selection */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-medium text-gray-700">To</label>
              <Link
                href={`/${locale}/dashboard/send/add-recipient`}
                className="inline-flex items-center gap-1 text-sm text-[#b59354] font-medium hover:underline"
              >
                <Plus className="h-4 w-4" />
                Add New Beneficiary
              </Link>
            </div>

            {/* Search field — primary entry point */}
            <div className="relative mb-5">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={beneficiarySearch}
                onChange={(e) => setBeneficiarySearch(e.target.value)}
                placeholder="Search by name or IBAN…"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#b59354]/20 focus:border-[#b59354]"
              />
            </div>

            {/* Recent Recipients */}
            {!beneficiarySearch && (
              <div className="mb-5">
                <p className="text-xs text-gray-500 mb-3">Recent Recipients</p>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {recentRecipients.map((recipient) => (
                    <button
                      key={recipient.id}
                      onClick={() => setSelectedRecipient(recipient.id)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl min-w-[80px] transition-colors ${
                        selectedRecipient === recipient.id
                          ? "bg-[#b59354]/10 ring-2 ring-[#b59354]"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div
                        className={`w-12 h-12 ${recipient.color} text-white rounded-full flex items-center justify-center text-sm font-bold`}
                      >
                        {recipient.initial}
                      </div>
                      <span className="text-xs text-gray-700 text-center truncate w-full">
                        {recipient.name.split(" ")[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Saved / Filtered Beneficiaries */}
            <div>
              {!beneficiarySearch && (
                <p className="text-xs text-gray-500 mb-3">Saved Beneficiaries</p>
              )}
              <div className="space-y-2">
                {filteredBeneficiaries.map((beneficiary) => (
                  <button
                    key={beneficiary.id}
                    onClick={() => {
                      setSelectedRecipient(beneficiary.id);
                      setBeneficiaryIban(beneficiary.iban);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      selectedRecipient === beneficiary.id
                        ? "bg-[#b59354]/10 ring-2 ring-[#b59354]"
                        : "hover:bg-gray-50 border border-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-600">
                        {beneficiary.name.charAt(0)}
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900 text-sm">{beneficiary.name}</p>
                        <p className="text-xs text-gray-500">{beneficiary.bank} · {beneficiary.iban}</p>
                      </div>
                    </div>
                    {selectedRecipient === beneficiary.id && (
                      <Check className="h-5 w-5 text-[#b59354]" />
                    )}
                  </button>
                ))}
                {beneficiarySearch && filteredBeneficiaries.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">No beneficiaries found.</p>
                )}
              </div>
            </div>

            {/* Transfer classification badge (shown once IBAN is known) */}
            {classLabel && (
              <div className={`mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${classLabel.color}`}>
                {classLabel.label}
              </div>
            )}
          </div>

          {/* Amount */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-3">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">€</span>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-12 pr-20 py-4 border border-gray-200 rounded-lg text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-[#b59354]/20 focus:border-[#b59354]"
              />
              <select className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 border border-gray-200 rounded text-sm bg-white">
                <option>EUR</option>
                <option>USD</option>
                <option>GBP</option>
              </select>
            </div>
          </div>

          {/* Reference */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-3">Reference / Description</label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g., Invoice #12345"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#b59354]/20 focus:border-[#b59354]"
            />
          </div>

          {/* Transfer Date */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-3">Transfer Date</label>
            <div className="flex gap-3">
              <button
                onClick={() => setIsScheduled(false)}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                  !isScheduled
                    ? "bg-[#b59354] text-white"
                    : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                Immediate
              </button>
              <button
                onClick={() => setIsScheduled(true)}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                  isScheduled
                    ? "bg-[#b59354] text-white"
                    : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                Schedule
              </button>
            </div>
            {isScheduled && (
              <input
                type="date"
                className="mt-3 w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#b59354]/20"
              />
            )}
          </div>
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 sticky top-6">
            <h3 className="font-semibold text-gray-900 mb-4">Transfer Summary</h3>

            {isFormReady ? (
              <>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Amount</span>
                    <span className="font-medium text-gray-900">€{amount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Transfer Fee</span>
                    <span className="font-medium text-gray-900">€0.00</span>
                  </div>
                  <hr />
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Total</span>
                    <span className="font-bold text-lg text-gray-900">€{amount}</span>
                  </div>
                </div>

                {/* SEPA note — only shown when transfer classifies as SEPA */}
                {classification === "sepa" && (
                  <div className="bg-blue-50 rounded-lg p-3 mb-6">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                      <p className="text-xs text-blue-700">
                        SEPA transfers are free and typically arrive within 1 business day.
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="mb-6 py-8 text-center">
                <p className="text-sm text-gray-400">
                  Select a beneficiary and enter an amount to see the summary.
                </p>
              </div>
            )}

            <button
              disabled={!isFormReady}
              className="w-full bg-[#b59354] text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-[#886844] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isFormReady ? "Review Transfer" : "Continue"}
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
