"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Plus,
  CreditCard,
  Snowflake,
  Lock,
  Settings,
  AlertTriangle,
  Globe,
  Wifi,
  Building2,
  Eye,
  EyeOff,
  ChevronRight,
  MoreHorizontal,
  Construction,
} from "lucide-react";

export default function CardsPage() {
  const params = useParams();
  const locale = params.locale as string;

  const [showCardNumber, setShowCardNumber] = React.useState(false);
  const [selectedCard, setSelectedCard] = React.useState("1");

  const cards = [
    {
      id: "1",
      type: "Physical",
      name: "Business Debit Card",
      lastFour: "4532",
      expiryDate: "12/27",
      cardHolder: "NORDIC SOLUTIONS OY",
      status: "active",
      dailyLimit: "€5,000",
      monthlyLimit: "€25,000",
      color: "from-[#b59354] to-[#886844]",
    },
    {
      id: "2",
      type: "Virtual",
      name: "Online Purchases Card",
      lastFour: "8891",
      expiryDate: "06/26",
      cardHolder: "NORDIC SOLUTIONS OY",
      status: "active",
      dailyLimit: "€2,000",
      monthlyLimit: "€10,000",
      color: "from-blue-500 to-blue-700",
    },
  ];

  const cardSettings = [
    { name: "Online payments", icon: Globe, enabled: true },
    { name: "Contactless", icon: Wifi, enabled: true },
    { name: "ATM withdrawals", icon: Building2, enabled: true },
    { name: "International", icon: Globe, enabled: false },
  ];

  const recentTransactions = [
    { name: "Amazon Web Services", amount: "-€1,240.55", date: "Oct 24" },
    { name: "Slack Technologies", amount: "-€89.00", date: "Oct 23" },
    { name: "Google Cloud", amount: "-€450.20", date: "Oct 22" },
  ];

  const selectedCardData = cards.find((c) => c.id === selectedCard);

  return (
    <div className="p-6 lg:p-8">
      {/* Coming Soon Banner */}
      <div className="mb-6 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
        <Construction className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-amber-900">Preview — Card management coming soon</p>
          <p className="text-xs text-amber-700 mt-0.5">Virtual and physical card issuance will be available when the banking integration is complete.</p>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Cards</h1>
          <p className="text-gray-500 mt-1">Manage your physical and virtual cards</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-[#b59354] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#886844]">
          <Plus className="h-4 w-4" />
          Request New Card
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Card Display - 2 cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card Selector */}
          <div className="flex gap-4 overflow-x-auto pb-2">
            {cards.map((card) => (
              <button
                key={card.id}
                onClick={() => setSelectedCard(card.id)}
                className={`min-w-[200px] p-4 rounded-xl border-2 transition-colors ${
                  selectedCard === card.id
                    ? "border-[#b59354] bg-[#b59354]/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-[#b59354]" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900 text-sm">{card.name}</p>
                    <p className="text-xs text-gray-500">•••• {card.lastFour}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* 3D Card Display */}
          {selectedCardData && (
            <div
              className={`bg-gradient-to-br ${selectedCardData.color} rounded-2xl p-6 text-white shadow-xl relative overflow-hidden`}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
              </div>

              <div className="relative">
                {/* Card Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <span className="text-lg font-bold">O</span>
                    </div>
                    <span className="font-bold">Opulanz</span>
                  </div>
                  <span className="text-sm font-medium px-2 py-1 bg-white/20 rounded">
                    {selectedCardData.type}
                  </span>
                </div>

                {/* Chip */}
                <div className="w-12 h-9 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-md mb-6 flex items-center justify-center">
                  <div className="w-8 h-6 border border-yellow-600/30 rounded-sm" />
                </div>

                {/* Card Number */}
                <div className="mb-6">
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-xl tracking-wider">
                      {showCardNumber
                        ? `4532 8765 4321 ${selectedCardData.lastFour}`
                        : `•••• •••• •••• ${selectedCardData.lastFour}`}
                    </p>
                    <button
                      onClick={() => setShowCardNumber(!showCardNumber)}
                      className="text-white/70 hover:text-white"
                    >
                      {showCardNumber ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs text-white/70 mb-1">CARD HOLDER</p>
                    <p className="font-medium">{selectedCardData.cardHolder}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/70 mb-1">EXPIRES</p>
                    <p className="font-medium">{selectedCardData.expiryDate}</p>
                  </div>
                  <div className="text-right">
                    <svg className="w-12 h-8" viewBox="0 0 48 32" fill="none">
                      <circle cx="16" cy="16" r="14" fill="#EB001B" fillOpacity="0.8" />
                      <circle cx="32" cy="16" r="14" fill="#F79E1B" fillOpacity="0.8" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Card Details */}
          {selectedCardData && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Card Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Card Type</p>
                  <p className="font-medium text-gray-900">{selectedCardData.type} Debit</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                    Active
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Daily Limit</p>
                  <p className="font-medium text-gray-900">{selectedCardData.dailyLimit}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Monthly Limit</p>
                  <p className="font-medium text-gray-900">{selectedCardData.monthlyLimit}</p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <button className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-100 hover:border-[#b59354] hover:bg-[#b59354]/5 transition-colors">
              <Snowflake className="h-6 w-6 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">Freeze Card</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-100 hover:border-[#b59354] hover:bg-[#b59354]/5 transition-colors">
              <Lock className="h-6 w-6 text-purple-500" />
              <span className="text-sm font-medium text-gray-700">Change PIN</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-100 hover:border-[#b59354] hover:bg-[#b59354]/5 transition-colors">
              <Settings className="h-6 w-6 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Set Limits</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-100 hover:border-red-500 hover:bg-red-50 transition-colors">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <span className="text-sm font-medium text-gray-700">Report Lost</span>
            </button>
          </div>
        </div>

        {/* Sidebar - 1 col */}
        <div className="space-y-6">
          {/* Card Settings */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Card Settings</h3>
            <div className="space-y-4">
              {cardSettings.map((setting) => {
                const Icon = setting.icon;
                return (
                  <div key={setting.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-700">{setting.name}</span>
                    </div>
                    <button
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        setting.enabled ? "bg-[#b59354]" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          setting.enabled ? "left-6" : "left-1"
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Card Transactions */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Recent Activity</h3>
              <Link
                href={`/${locale}/dashboard/transactions`}
                className="text-sm text-[#b59354] font-medium hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {recentTransactions.map((tx, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{tx.name}</p>
                    <p className="text-xs text-gray-500">{tx.date}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{tx.amount}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Virtual Card CTA */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-6 text-white">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="h-5 w-5" />
              <h3 className="font-semibold">Create Virtual Card</h3>
            </div>
            <p className="text-sm text-white/80 mb-4">
              Get instant virtual cards for online purchases with custom spending limits.
            </p>
            <button className="w-full bg-white text-blue-600 py-2.5 px-4 rounded-lg font-semibold text-sm hover:bg-blue-50 transition-colors">
              Create Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
