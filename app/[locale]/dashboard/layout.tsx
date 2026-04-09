"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  CreditCard,
  FileText,
  Send,
  PiggyBank,
  Settings,
  HelpCircle,
  LogOut,
  Bell,
  Search,
  ChevronDown,
  Menu,
  X,
  User,
  RefreshCw,
  Plus,
  Globe,
  Shield,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getCurrentUser } from "@/lib/auth";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Accounts", href: "/dashboard/accounts", icon: Wallet },
  { name: "Transactions", href: "/dashboard/transactions", icon: ArrowLeftRight },
  { name: "Cards", href: "/dashboard/cards", icon: CreditCard },
  // { name: "Invoices", href: "/dashboard/invoices", icon: FileText },
  { name: "Send Money", href: "/dashboard/send", icon: Send },
  { name: "Exchange", href: "/dashboard/exchange", icon: RefreshCw },
  // { name: "Add Funds", href: "/dashboard/add-funds", icon: PiggyBank },
  { name: "Support", href: "/dashboard/support", icon: HelpCircle },
];

const bottomNavigation = [
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const params = useParams();
  const locale = params.locale as string;
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);

  const user = getCurrentUser();
  const userEmail = user?.email || '';
  const userInitials = userEmail ? userEmail.slice(0, 2).toUpperCase() : 'OP';
  const userDisplayName = userEmail ? userEmail.split('@')[0] : 'My Account';

  const isActive = (href: string) => {
    const fullPath = `/${locale}${href}`;
    if (href === "/dashboard") {
      return pathname === fullPath;
    }
    return pathname.startsWith(fullPath);
  };

  return (
    <div className="flex h-screen bg-[#f8f9fa]">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 transform bg-white border-r border-gray-100 transition-transform duration-300 lg:static lg:transform-none shadow-xl lg:shadow-none",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center justify-between p-6">
            <Link href={`/${locale}/dashboard`} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#b59354] to-[#886844] rounded-xl flex items-center justify-center shadow-lg shadow-[#b59354]/20">
                <span className="text-xl font-bold text-white">O</span>
              </div>
              <div>
                <span className="text-xl font-bold text-gray-900">Opulanz</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-[#b59354] font-medium">Business</span>
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                </div>
              </div>
            </Link>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quick Balance Preview */}
          <div className="mx-4 mb-4 p-4 bg-gradient-to-br from-[#b59354] to-[#886844] rounded-xl text-white">
            <p className="text-xs text-white/70 mb-1">Total Balance</p>
            <p className="text-2xl font-bold">€182,240.80</p>
            <div className="flex items-center gap-1 mt-1 text-xs text-green-300">
              <span>+5.2%</span>
              <span className="text-white/50">this month</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3">
            <p className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Menu
            </p>
            <div className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    href={`/${locale}${item.href}`}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                      active
                        ? "bg-[#b59354] text-white shadow-lg shadow-[#b59354]/25"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    )}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <Icon className={cn("h-5 w-5", active ? "text-white" : "text-gray-400")} />
                    {item.name}
                    {item.name === "Transactions" && (
                      <span className="ml-auto px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">3</span>
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Account
              </p>
              <div className="space-y-1">
                {bottomNavigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      href={`/${locale}${item.href}`}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                        active
                          ? "bg-[#b59354] text-white shadow-lg shadow-[#b59354]/25"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      )}
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      <Icon className={cn("h-5 w-5", active ? "text-white" : "text-gray-400")} />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* Bottom CTA */}
          <div className="p-4 border-t border-gray-100">
            <Link
              href={`/${locale}/open-account`}
              className="flex items-center justify-center gap-2 w-full bg-gray-900 text-white py-3 px-4 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Open New Account
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-100 px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Left Side */}
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Breadcrumb / Search */}
              <div className="hidden lg:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search anything..."
                    className="pl-10 pr-4 py-2.5 w-80 bg-gray-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#b59354]/20 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {/* Language Selector */}
              <button className="hidden md:flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Globe className="h-4 w-4" />
                <span>EN</span>
              </button>

              {/* Notifications */}
              <button className="relative p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
              </button>

              {/* Divider */}
              <div className="h-8 w-px bg-gray-200 mx-2 hidden md:block"></div>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-3 p-1.5 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-[#b59354] to-[#886844] rounded-xl flex items-center justify-center shadow-sm">
                    <span className="text-sm font-bold text-white">{userInitials}</span>
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold text-gray-900">{userDisplayName}</p>
                    <p className="text-xs text-gray-500">{user?.accountType === 'corporate' ? 'Business Account' : 'Personal Account'}</p>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 text-gray-400 transition-transform", isProfileOpen && "rotate-180")} />
                </button>

                {isProfileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                    <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-semibold text-gray-900">{userDisplayName}</p>
                        <p className="text-sm text-gray-500">{userEmail}</p>
                        <div className="flex items-center gap-1 mt-2">
                          <Shield className="h-3.5 w-3.5 text-green-500" />
                          <span className="text-xs text-green-600 font-medium">Verified Business</span>
                        </div>
                      </div>

                      <div className="py-2">
                        <Link
                          href={`/${locale}/dashboard/settings`}
                          className="flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <div className="flex items-center gap-3">
                            <Settings className="h-4 w-4 text-gray-400" />
                            Account Settings
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-300" />
                        </Link>
                        <Link
                          href={`/${locale}/dashboard/support`}
                          className="flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <div className="flex items-center gap-3">
                            <HelpCircle className="h-4 w-4 text-gray-400" />
                            Help Center
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-300" />
                        </Link>
                      </div>

                      <div className="border-t border-gray-100 pt-2">
                        <Link
                          href={`/${locale}/login`}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </Link>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-[#f8f9fa]">
          {children}
        </main>
      </div>
    </div>
  );
}
