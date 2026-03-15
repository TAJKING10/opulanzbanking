"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
  Copy,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  PiggyBank,
  Briefcase,
  Building2,
} from "lucide-react";

export default function AccountsPage() {
  const params = useParams();
  const locale = params.locale as string;
  const [showBalances, setShowBalances] = React.useState(true);

  const accounts = [
    {
      id: "1",
      name: "Main Current Account",
      type: "Business",
      iban: "FI91 1234 5678 9012 34",
      balance: "€85,230.50",
      change: "+2.4%",
      isPositive: true,
      icon: Building2,
      color: "bg-[#b59354]",
    },
    {
      id: "2",
      name: "Savings Account",
      type: "Savings",
      iban: "FI91 1234 5678 9012 35",
      balance: "€35,200.00",
      change: "2.5% APY",
      isPositive: true,
      icon: PiggyBank,
      color: "bg-green-500",
    },
    {
      id: "3",
      name: "Investment Account",
      type: "Investment",
      iban: "FI91 1234 5678 9012 36",
      balance: "€5,000.00",
      change: "+12.3%",
      isPositive: true,
      icon: TrendingUp,
      color: "bg-blue-500",
    },
    {
      id: "4",
      name: "Operating Expenses",
      type: "Business",
      iban: "FI91 1234 5678 9012 37",
      balance: "€45,000.00",
      change: "-5.2%",
      isPositive: false,
      icon: Briefcase,
      color: "bg-orange-500",
    },
  ];

  const totalBalance = "€170,430.50";

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Accounts</h1>
          <p className="text-gray-500 mt-1">Manage all your accounts in one place</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowBalances(!showBalances)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {showBalances ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showBalances ? "Hide" : "Show"} Balances
          </button>
          <Link
            href={`/${locale}/open-account`}
            className="inline-flex items-center gap-2 bg-[#b59354] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#886844]"
          >
            <Plus className="h-4 w-4" />
            Add Account
          </Link>
        </div>
      </div>

      {/* Total Balance Card */}
      <div className="bg-gradient-to-r from-[#b59354] to-[#886844] rounded-xl p-6 text-white mb-8">
        <p className="text-white/70 text-sm mb-1">Total Assets</p>
        <h2 className="text-4xl font-bold mb-4">
          {showBalances ? totalBalance : "••••••••"}
        </h2>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-white/70">Total Deposits</p>
            <p className="font-semibold">
              {showBalances ? "+€24,500.00" : "••••••"}
            </p>
          </div>
          <div>
            <p className="text-white/70">Total Withdrawals</p>
            <p className="font-semibold">
              {showBalances ? "-€12,300.00" : "••••••"}
            </p>
          </div>
          <div>
            <p className="text-white/70">Net Change (Month)</p>
            <p className="font-semibold text-green-300">
              {showBalances ? "+€12,200.00" : "••••••"}
            </p>
          </div>
        </div>
      </div>

      {/* Account Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {accounts.map((account) => {
          const Icon = account.icon;
          return (
            <div
              key={account.id}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 ${account.color} rounded-xl flex items-center justify-center`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{account.name}</h3>
                    <p className="text-sm text-gray-500">{account.type}</p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Balance</p>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-gray-900">
                    {showBalances ? account.balance : "••••••••"}
                  </p>
                  <span
                    className={`inline-flex items-center gap-1 text-sm font-medium ${
                      account.isPositive ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {account.isPositive ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    {account.change}
                  </span>
                </div>
              </div>

              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">IBAN</p>
                <div className="flex items-center justify-between">
                  <p className="font-mono text-sm text-gray-700">{account.iban}</p>
                  <button
                    onClick={() => navigator.clipboard.writeText(account.iban)}
                    className="text-[#b59354] hover:text-[#886844]"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/${locale}/dashboard/accounts/${account.id}`}
                  className="flex-1 text-center py-2 px-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  View Details
                </Link>
                <Link
                  href={`/${locale}/dashboard/send?from=${account.id}`}
                  className="flex-1 text-center py-2 px-3 bg-[#b59354] text-white rounded-lg text-sm font-medium hover:bg-[#886844]"
                >
                  Transfer
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
