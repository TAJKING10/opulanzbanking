"use client";

import * as React from "react";
import {
  Search,
  Filter,
  Download,
  ChevronRight,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
} from "lucide-react";

export default function TransactionsPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterType, setFilterType] = React.useState("all");
  const [dateRange, setDateRange] = React.useState("30");

  const transactions = [
    {
      id: "1",
      name: "Amazon Web Services",
      category: "Cloud Infrastructure",
      date: "Oct 24, 2023",
      time: "14:32",
      amount: "-€1,240.55",
      balance: "€123,320.25",
      isCredit: false,
      status: "completed",
      initial: "A",
      color: "bg-[#b59354]",
    },
    {
      id: "2",
      name: "Stripe Payout",
      category: "Merchant Settlement",
      date: "Oct 23, 2023",
      time: "11:45",
      amount: "+€12,500.00",
      balance: "€124,560.80",
      isCredit: true,
      status: "completed",
      initial: "S",
      color: "bg-green-500",
    },
    {
      id: "3",
      name: "Slack Technologies",
      category: "Subscriptions",
      date: "Oct 23, 2023",
      time: "09:15",
      amount: "-€89.00",
      balance: "€112,060.80",
      isCredit: false,
      status: "completed",
      initial: "S",
      color: "bg-blue-500",
    },
    {
      id: "4",
      name: "Google Cloud",
      category: "Workspace",
      date: "Oct 22, 2023",
      time: "22:01",
      amount: "-€450.20",
      balance: "€112,149.80",
      isCredit: false,
      status: "completed",
      initial: "G",
      color: "bg-yellow-500",
    },
    {
      id: "5",
      name: "Client Payment - Nordic Tech",
      category: "Invoice #INV-2023-045",
      date: "Oct 21, 2023",
      time: "16:20",
      amount: "+€8,500.00",
      balance: "€112,600.00",
      isCredit: true,
      status: "completed",
      initial: "N",
      color: "bg-purple-500",
    },
    {
      id: "6",
      name: "Office Rent",
      category: "Real Estate",
      date: "Oct 20, 2023",
      time: "09:00",
      amount: "-€3,200.00",
      balance: "€104,100.00",
      isCredit: false,
      status: "completed",
      initial: "O",
      color: "bg-gray-500",
    },
    {
      id: "7",
      name: "Salary Payment - Batch",
      category: "Payroll",
      date: "Oct 19, 2023",
      time: "08:00",
      amount: "-€25,000.00",
      balance: "€107,300.00",
      isCredit: false,
      status: "completed",
      initial: "S",
      color: "bg-red-500",
    },
    {
      id: "8",
      name: "Wire Transfer",
      category: "Client Payment",
      date: "Oct 18, 2023",
      time: "14:30",
      amount: "+€15,000.00",
      balance: "€132,300.00",
      isCredit: true,
      status: "completed",
      initial: "W",
      color: "bg-teal-500",
    },
  ];

  const summary = {
    totalIncome: "+€36,000.00",
    totalExpenses: "-€29,979.75",
    netChange: "+€6,020.25",
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (filterType === "income" && !tx.isCredit) return false;
    if (filterType === "expense" && tx.isCredit) return false;
    if (searchQuery && !tx.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
          <p className="text-gray-500 mt-1">View and manage all your transactions</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total Income</p>
          <p className="text-2xl font-bold text-green-600">{summary.totalIncome}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total Expenses</p>
          <p className="text-2xl font-bold text-red-600">{summary.totalExpenses}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Net Change</p>
          <p className="text-2xl font-bold text-[#b59354]">{summary.netChange}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#b59354]/20 focus:border-[#b59354]"
            />
          </div>

          {/* Date Range */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#b59354]/20"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#b59354]/20"
            >
              <option value="all">All Transactions</option>
              <option value="income">Income Only</option>
              <option value="expense">Expenses Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 text-left text-sm text-gray-500 bg-gray-50">
                <th className="px-6 py-4 font-medium">Transaction</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Balance</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium"></th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 ${tx.color} text-white rounded-full flex items-center justify-center`}
                      >
                        {tx.isCredit ? (
                          <ArrowDownLeft className="h-5 w-5" />
                        ) : (
                          <ArrowUpRight className="h-5 w-5" />
                        )}
                      </div>
                      <p className="font-semibold text-gray-900">{tx.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {tx.date}
                    <br />
                    <span className="text-xs text-gray-400">{tx.time}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{tx.category}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`font-semibold ${
                        tx.isCredit ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {tx.amount}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-medium">{tx.balance}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                      Completed
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-gray-400 hover:text-gray-600">
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {filteredTransactions.length} of {transactions.length} transactions
          </p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50" disabled>
              Previous
            </button>
            <button className="px-3 py-1 bg-[#b59354] text-white rounded text-sm">1</button>
            <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50">2</button>
            <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50">3</button>
            <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
