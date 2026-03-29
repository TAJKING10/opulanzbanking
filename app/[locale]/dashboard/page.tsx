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
  Rocket,
  Calendar,
  CreditCard,
  Building2,
  Globe,
  Shield,
  CheckCircle,
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  EyeOff,
  Sparkles,
  Clock,
  Users,
  FileText,
  BarChart3,
  AlertTriangle,
} from "lucide-react";
import { SumsubKycWidget } from "@/components/sumsub-kyc-widget";
import { getCurrentUser, clearAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();
  const [copiedIban, setCopiedIban] = React.useState(false);
  const [showBalance, setShowBalance] = React.useState(true);
  const [showKyc, setShowKyc] = React.useState(false);
  const [kycVerified, setKycVerified] = React.useState(false);
  const [authUserId, setAuthUserId] = React.useState("dashboard-user-001");
  const [kycType, setKycType] = React.useState<"individual" | "corporate">("individual");

  React.useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.replace(`/${locale}/login`);
      return;
    }
    setAuthUserId(`user-${user.userId}`);
    setKycType(user.accountType === "corporate" ? "corporate" : "individual");
    setKycVerified(user.kycStatus === "verified");
  }, [locale, router]);

  function handleSignOut() {
    clearAuth();
    router.push(`/${locale}/login`);
  }

  const handleCopyIban = () => {
    navigator.clipboard.writeText("FI91 1234 5678 9012 34");
    setCopiedIban(true);
    setTimeout(() => setCopiedIban(false), 2000);
  };

  const accounts = [
    {
      name: "Main Business Account",
      type: "EUR",
      balance: "€124,560.80",
      iban: "FI91 1234 5678 9012 34",
      change: "+2.4%",
      isUp: true,
      flag: "EU",
    },
    {
      name: "USD Account",
      type: "USD",
      balance: "$45,230.00",
      iban: "FI91 1234 5678 9012 35",
      change: "+1.2%",
      isUp: true,
      flag: "US",
    },
    {
      name: "GBP Account",
      type: "GBP",
      balance: "£12,450.00",
      iban: "FI91 1234 5678 9012 36",
      change: "-0.5%",
      isUp: false,
      flag: "GB",
    },
  ];

  const transactions = [
    {
      id: "1",
      name: "Amazon Web Services",
      category: "Cloud Infrastructure",
      date: "Mar 15, 2026",
      time: "14:32",
      amount: "-€1,240.55",
      isCredit: false,
      status: "completed",
      icon: "A",
      color: "bg-orange-500",
    },
    {
      id: "2",
      name: "Slack Technologies",
      category: "Software Subscription",
      date: "Mar 14, 2026",
      time: "09:15",
      amount: "-€89.00",
      isCredit: false,
      status: "processing",
      icon: "S",
      color: "bg-purple-500",
    },
    {
      id: "3",
      name: "Google Cloud Platform",
      category: "Cloud Services",
      date: "Mar 13, 2026",
      time: "22:01",
      amount: "-€450.20",
      isCredit: false,
      status: "completed",
      icon: "G",
      color: "bg-blue-500",
    },
    {
      id: "4",
      name: "Client Payment - TechCorp",
      category: "Invoice #INV-2024-089",
      date: "Mar 12, 2026",
      time: "11:45",
      amount: "+€12,500.00",
      isCredit: true,
      status: "completed",
      icon: "T",
      color: "bg-green-500",
    },
    {
      id: "5",
      name: "Office Supplies Co",
      category: "Office Equipment",
      date: "Mar 11, 2026",
      time: "16:20",
      amount: "-€234.50",
      isCredit: false,
      status: "completed",
      icon: "O",
      color: "bg-teal-500",
    },
  ];

  const quickStats = [
    { label: "Income (Mar)", value: "€48,500", change: "+12%", isUp: true, icon: ArrowDownLeft },
    { label: "Expenses (Mar)", value: "€23,450", change: "+5%", isUp: false, icon: ArrowUpRight },
    { label: "Pending", value: "€3,200", change: "3 items", isUp: null, icon: Clock },
    { label: "Invoices Due", value: "€8,750", change: "5 unpaid", isUp: null, icon: FileText },
  ];

  const recurringPayments = [
    { name: "Adobe Creative Cloud", amount: "€54.99", date: "Apr 1", logo: "AD", color: "bg-red-500" },
    { name: "GitHub Enterprise", amount: "€1,200.00", date: "Apr 5", logo: "GH", color: "bg-gray-800" },
    { name: "Microsoft 365", amount: "€299.00", date: "Apr 10", logo: "MS", color: "bg-blue-600" },
  ];

  const recentBeneficiaries = [
    { name: "TechCorp Ltd", initials: "TC", color: "bg-blue-500" },
    { name: "Design Studio", initials: "DS", color: "bg-pink-500" },
    { name: "Cloud Services", initials: "CS", color: "bg-purple-500" },
    { name: "Marketing Pro", initials: "MP", color: "bg-green-500" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header with Greeting */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">Good morning, Nordic Solutions</h1>
            <span className="text-2xl">&#128075;</span>
          </div>
          <p className="text-gray-500">Here's what's happening with your accounts today.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium">
            <CheckCircle className="h-4 w-4" />
            Account Verified
          </div>
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            Last login: Today, 09:45 AM
          </div>
          <button
            onClick={handleSignOut}
            className="px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* KYC Verification Banner */}
      {!kycVerified && (
        <div className="flex items-center justify-between gap-4 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-900">Identity verification required</p>
              <p className="text-xs text-amber-700">Complete KYC to unlock full account features and increase limits.</p>
            </div>
          </div>
          <button
            onClick={() => setShowKyc(true)}
            className="flex-shrink-0 px-4 py-2 bg-[#b59354] text-white text-sm font-medium rounded-lg hover:bg-[#886844] transition-colors"
          >
            Verify Now
          </button>
        </div>
      )}

      {kycVerified && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-5 py-4">
          <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-green-900">Identity verified</p>
            <p className="text-xs text-green-700">Your account is fully verified and all features are unlocked.</p>
          </div>
        </div>
      )}

      {/* Sumsub KYC Widget Modal */}
      {showKyc && (
        <SumsubKycWidget
          userId={authUserId}
          levelName={kycType === "corporate" ? "corporate_signup_kyc" : "individual_signup_kyc"}
          onClose={() => setShowKyc(false)}
          onComplete={() => {
            setKycVerified(true);
            setShowKyc(false);
          }}
        />
      )}

      {/* Quick Stats - HIDDEN: Uncomment to show Income/Expenses/Pending/Invoices Due cards */}
      {/*
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  stat.isUp === true ? "bg-green-100" : stat.isUp === false ? "bg-red-100" : "bg-gray-100"
                }`}>
                  <Icon className={`h-5 w-5 ${
                    stat.isUp === true ? "text-green-600" : stat.isUp === false ? "text-red-600" : "text-gray-600"
                  }`} />
                </div>
                {stat.isUp !== null && (
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    stat.isUp ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {stat.change}
                  </span>
                )}
                {stat.isUp === null && (
                  <span className="text-xs font-medium text-gray-500">{stat.change}</span>
                )}
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>
      */}

      {/* Main Balance Card & Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Balance */}
        <div className="lg:col-span-2 bg-gradient-to-br from-[#b59354] via-[#c9a86c] to-[#886844] rounded-2xl p-6 text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-white/80 text-sm">Total Balance</p>
                  <p className="text-xs text-white/60">All Accounts Combined</p>
                </div>
              </div>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                {showBalance ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline gap-3">
                <h2 className="text-4xl lg:text-5xl font-bold">
                  {showBalance ? "€182,240.80" : "€•••••••"}
                </h2>
                <div className="flex items-center gap-1 text-green-300 text-sm font-medium bg-green-500/20 px-2 py-1 rounded-full">
                  <TrendingUp className="h-4 w-4" />
                  <span>+5.2%</span>
                </div>
              </div>
              <p className="text-white/60 text-sm mt-2">vs. last month</p>
            </div>

            {/* Quick Account Switcher */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              {accounts.map((account, i) => (
                <div
                  key={account.type}
                  className={`flex-shrink-0 px-4 py-3 rounded-xl cursor-pointer transition-all ${
                    i === 0 ? "bg-white/20 backdrop-blur-sm" : "bg-white/10 hover:bg-white/15"
                  }`}
                >
                  <p className="text-xs text-white/70">{account.type}</p>
                  <p className="font-semibold">{showBalance ? account.balance : "•••••"}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href={`/${locale}/dashboard/send`}
              className="flex flex-col items-center gap-2 p-4 bg-[#b59354] text-white rounded-xl hover:bg-[#886844] transition-colors"
            >
              <Send className="h-6 w-6" />
              <span className="text-sm font-medium">Send Money</span>
            </Link>
            {/* Add Funds – hidden for now
            <Link
              href={`/${locale}/dashboard/add-funds`}
              className="flex flex-col items-center gap-2 p-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
            >
              <Plus className="h-6 w-6" />
              <span className="text-sm font-medium">Add Funds</span>
            </Link>
            */}
            <Link
              href={`/${locale}/dashboard/exchange`}
              className="flex flex-col items-center gap-2 p-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className="h-6 w-6" />
              <span className="text-sm font-medium">Exchange</span>
            </Link>
            <Link
              href={`/${locale}/dashboard/cards`}
              className="flex flex-col items-center gap-2 p-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
            >
              <CreditCard className="h-6 w-6" />
              <span className="text-sm font-medium">Cards</span>
            </Link>
          </div>

          {/* Recent Beneficiaries */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-3">Send Again</p>
            <div className="flex items-center gap-3">
              {recentBeneficiaries.map((ben) => (
                <button
                  key={ben.name}
                  className="flex flex-col items-center gap-1 group"
                  title={ben.name}
                >
                  <div className={`w-10 h-10 ${ben.color} text-white rounded-full flex items-center justify-center text-xs font-bold group-hover:scale-110 transition-transform`}>
                    {ben.initials}
                  </div>
                </button>
              ))}
              <button className="w-10 h-10 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center text-gray-400 hover:border-[#b59354] hover:text-[#b59354] transition-colors">
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chart and IBAN Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Weekly Spending Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-gray-900">Spending Analytics</h3>
              <p className="text-sm text-gray-500">March 2026</p>
            </div>
            <div className="flex items-center gap-2">
              <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#b59354]/20">
                <option>This Week</option>
                <option>Last Week</option>
                <option>This Month</option>
              </select>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <p className="text-2xl font-bold text-gray-900">€3,519</p>
              <p className="text-xs text-gray-500">Total Spent</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-xl">
              <p className="text-2xl font-bold text-green-600">€12,500</p>
              <p className="text-xs text-gray-500">Received</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-xl">
              <p className="text-2xl font-bold text-blue-600">42</p>
              <p className="text-xs text-gray-500">Transactions</p>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="h-48 flex items-end justify-between gap-3 px-2">
            {[
              { day: "Mon", spent: 850, received: 0 },
              { day: "Tue", spent: 1240, received: 5000 },
              { day: "Wed", spent: 450, received: 0 },
              { day: "Thu", spent: 620, received: 7500 },
              { day: "Fri", spent: 89, received: 0 },
              { day: "Sat", spent: 180, received: 0 },
              { day: "Sun", spent: 90, received: 0 },
            ].map((item) => {
              const maxValue = 7500;
              const spentHeight = (item.spent / maxValue) * 100;
              const receivedHeight = (item.received / maxValue) * 100;
              return (
                <div key={item.day} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col items-center justify-end h-36 gap-1">
                    {item.received > 0 && (
                      <div
                        className="w-full max-w-[32px] bg-gradient-to-t from-green-500 to-green-400 rounded-t transition-all"
                        style={{ height: `${receivedHeight}%`, minHeight: '4px' }}
                      />
                    )}
                    <div
                      className="w-full max-w-[32px] bg-gradient-to-t from-[#b59354] to-[#d4b878] rounded-t transition-all hover:from-[#886844] hover:to-[#b59354] cursor-pointer"
                      style={{ height: `${Math.max(spentHeight, 3)}%`, minHeight: '4px' }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 font-medium">{item.day}</span>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#b59354] rounded" />
              <span className="text-xs text-gray-500">Expenses</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded" />
              <span className="text-xs text-gray-500">Income</span>
            </div>
          </div>
        </div>

        {/* IBAN & Account Info */}
        <div className="space-y-4">
          {/* Primary Account IBAN */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="h-5 w-5 text-[#b59354]" />
              <h3 className="font-semibold text-gray-900">Primary Account</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">IBAN</p>
                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                  <p className="font-mono text-sm text-gray-900">FI91 1234 5678 9012 34</p>
                  <button
                    onClick={handleCopyIban}
                    className="p-1.5 text-[#b59354] hover:bg-[#b59354]/10 rounded-lg transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                {copiedIban && (
                  <p className="text-green-500 text-xs mt-1">Copied!</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500">BIC/SWIFT</p>
                  <p className="font-mono text-gray-900">OPULFI2H</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Currency</p>
                  <p className="text-gray-900">EUR</p>
                </div>
              </div>
            </div>
          </div>

          {/* Security Status */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-5 text-white">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="h-6 w-6" />
              <div>
                <p className="font-semibold">Account Protected</p>
                <p className="text-xs text-white/80">2FA Enabled</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/80">Security Score</span>
              <span className="font-semibold">Excellent</span>
            </div>
            <div className="mt-2 h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full w-[95%] bg-white rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Transactions & Side Panels */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg text-gray-900">Recent Transactions</h3>
              <p className="text-sm text-gray-500">Your latest activity</p>
            </div>
            <Link
              href={`/${locale}/dashboard/transactions`}
              className="flex items-center gap-1 text-[#b59354] text-sm font-medium hover:underline"
            >
              View All
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {transactions.map((tx) => (
              <div key={tx.id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${tx.color} text-white rounded-xl flex items-center justify-center font-bold`}>
                      {tx.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{tx.name}</p>
                      <p className="text-sm text-gray-500">{tx.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${tx.isCredit ? "text-green-600" : "text-gray-900"}`}>
                      {tx.amount}
                    </p>
                    <div className="flex items-center justify-end gap-2 mt-1">
                      <span className="text-xs text-gray-400">{tx.date}</span>
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                        tx.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {tx.status === "completed" ? "Completed" : "Processing"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* Upcoming Payments - HIDDEN: Uncomment to show recurring payments */}
          {/*
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#b59354]" />
                <h3 className="font-semibold text-gray-900">Upcoming Payments</h3>
              </div>
            </div>
            <div className="space-y-3">
              {recurringPayments.map((payment) => (
                <div key={payment.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${payment.color} text-white rounded-lg flex items-center justify-center text-xs font-bold`}>
                      {payment.logo}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-900">{payment.name}</p>
                      <p className="text-xs text-gray-500">{payment.date}</p>
                    </div>
                  </div>
                  <p className="font-semibold text-sm text-gray-900">{payment.amount}</p>
                </div>
              ))}
            </div>
          </div>
          */}

          {/* Upgrade Card */}
          <div className="bg-gradient-to-br from-[#b59354] to-[#886844] rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5" />
                <h3 className="font-semibold">Opulanz Pro</h3>
              </div>
              <p className="text-sm text-white/80 mb-4">
                Unlock premium features, global payments, and priority support.
              </p>
              <ul className="text-sm text-white/90 space-y-2 mb-4">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-300" />
                  Unlimited transactions
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-300" />
                  Virtual & physical cards
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-300" />
                  Advanced analytics
                </li>
              </ul>
              <button className="w-full bg-white text-[#b59354] px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-100 transition-colors">
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
