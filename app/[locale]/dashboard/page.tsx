"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  TrendingUp,
  TrendingDown,
  Send,
  Plus,
  RefreshCw,
  Copy,
  ChevronRight,
  MoreHorizontal,
  Rocket,
  Calendar,
} from "lucide-react";

export default function DashboardPage() {
  const params = useParams();
  const locale = params.locale as string;
  const [copiedIban, setCopiedIban] = React.useState(false);

  const handleCopyIban = () => {
    navigator.clipboard.writeText("FI91 1234 5678 9012 34");
    setCopiedIban(true);
    setTimeout(() => setCopiedIban(false), 2000);
  };

  const transactions = [
    {
      id: "1",
      name: "Amazon Web Services",
      category: "Cloud Infrastructure",
      date: "Oct 24, 2023",
      time: "14:32",
      amount: "-€1,240.55",
      isCredit: false,
      status: "completed",
      initial: "A",
      color: "bg-[#b59354]",
    },
    {
      id: "2",
      name: "Slack Technologies",
      category: "Subscriptions",
      date: "Oct 23, 2023",
      time: "09:15",
      amount: "-€89.00",
      isCredit: false,
      status: "processing",
      initial: "S",
      color: "bg-blue-500",
    },
    {
      id: "3",
      name: "Google Cloud",
      category: "Workspace",
      date: "Oct 22, 2023",
      time: "22:01",
      amount: "-€450.20",
      isCredit: false,
      status: "completed",
      initial: "G",
      color: "bg-yellow-500",
    },
    {
      id: "4",
      name: "Stripe Payout",
      category: "Merchant Settlement",
      date: "Oct 21, 2023",
      time: "11:45",
      amount: "+€12,500.00",
      isCredit: true,
      status: "completed",
      initial: "↓",
      color: "bg-green-500",
    },
  ];

  const recurringPayments = [
    {
      name: "Adobe Creative Cloud",
      amount: "€54.99",
      date: "Nov 1",
      initial: "AD",
      color: "bg-red-500",
    },
    {
      name: "GitHub Enterprise",
      amount: "€1,200.00",
      date: "Nov 5",
      initial: "GH",
      color: "bg-gray-900",
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Account Overview</h1>
        <p className="text-gray-500 mt-1">Welcome back, Nordic Solutions OY</p>
      </div>

      {/* Balance and IBAN Cards */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        {/* Balance Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm mb-2">Available Balance</p>
          <div className="flex items-center justify-between">
            <h2 className="text-4xl font-bold text-[#b59354]">€124,560.80</h2>
            <div className="flex items-center gap-1 text-green-500 text-sm font-medium">
              <TrendingUp className="h-4 w-4" />
              <span>+2.4%</span>
            </div>
          </div>
        </div>

        {/* IBAN Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm mb-2">IBAN Number</p>
          <div className="flex items-center justify-between">
            <p className="font-mono text-lg text-gray-900">FI91 1234 5678 9012 34</p>
            <button
              onClick={handleCopyIban}
              className="p-2 text-[#b59354] hover:bg-[#b59354]/10 rounded-lg transition-colors"
            >
              <Copy className="h-5 w-5" />
            </button>
          </div>
          {copiedIban && (
            <p className="text-green-500 text-xs mt-2">Copied to clipboard!</p>
          )}
        </div>
      </div>

      {/* Weekly Spending Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Weekly Spending</h3>
          <button className="text-gray-400 hover:text-gray-600">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
        <div className="h-48 bg-gray-50 rounded-lg flex items-end justify-around p-4">
          {/* Simple Bar Chart */}
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
            <div key={day} className="flex flex-col items-center gap-2">
              <div
                className="w-8 bg-[#b59354] rounded-t"
                style={{ height: `${[60, 80, 45, 90, 70, 30, 50][i]}%` }}
              />
              <span className="text-xs text-gray-500">{day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Link
          href={`/${locale}/dashboard/send`}
          className="inline-flex items-center gap-2 bg-[#b59354] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[#886844] transition-colors"
        >
          <Send className="h-4 w-4" />
          Send Money
        </Link>
        <Link
          href={`/${locale}/dashboard/add-funds`}
          className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Funds
        </Link>
        <Link
          href={`/${locale}/dashboard/exchange`}
          className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Exchange
        </Link>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-lg text-gray-900">Recent Transactions</h3>
          <Link
            href={`/${locale}/dashboard/transactions`}
            className="text-[#b59354] text-sm font-medium hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 text-left text-sm text-gray-500">
                <th className="px-6 py-3 font-medium">Transaction</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Amount</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 ${tx.color} text-white rounded-full flex items-center justify-center text-xs font-bold`}
                      >
                        {tx.initial}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{tx.name}</p>
                        <p className="text-gray-500 text-xs">{tx.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {tx.date}
                    <br />
                    <span className="text-xs text-gray-400">{tx.time}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`font-semibold ${
                        tx.isCredit ? "text-green-600" : "text-gray-900"
                      }`}
                    >
                      {tx.amount}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                        tx.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {tx.status === "completed" ? "Completed" : "Processing"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Grid - Recurring Payments & Upgrade */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recurring Payments */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900">Next Recurring Payments</h3>
          </div>
          <div className="space-y-4">
            {recurringPayments.map((payment, index) => (
              <div key={payment.name}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 ${payment.color} text-white rounded-full flex items-center justify-center text-xs font-bold`}
                    >
                      {payment.initial}
                    </div>
                    <p className="font-semibold text-sm text-gray-900">{payment.name}</p>
                  </div>
                  <p className="font-semibold text-sm text-gray-900">{payment.amount}</p>
                </div>
                <p className="text-xs text-gray-500 ml-13 mt-1 pl-13">{payment.date}</p>
                {index < recurringPayments.length - 1 && <hr className="mt-4" />}
              </div>
            ))}
          </div>
        </div>

        {/* Upgrade Card */}
        <div className="bg-gradient-to-br from-[#b59354] to-[#886844] rounded-xl p-6 text-white">
          <div className="flex items-center gap-2 mb-4">
            <Rocket className="h-5 w-5" />
            <h3 className="font-semibold">Get Opulanz Pro</h3>
          </div>
          <p className="text-sm text-white/80 mb-4">
            Unlock global payments, corporate cards, and advanced tax tools.
          </p>
          <button className="w-full bg-white text-[#b59354] px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors">
            Upgrade Now
          </button>
        </div>
      </div>
    </div>
  );
}
