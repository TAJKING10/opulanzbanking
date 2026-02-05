"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { LayoutDashboard, Users, Building2, LogOut, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export default function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations();

  const [isAuthorized, setIsAuthorized] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const access = sessionStorage.getItem("spv-admin-access");
    const timestamp = sessionStorage.getItem("spv-admin-timestamp");

    if (access === "granted" && timestamp) {
      const elapsed = Date.now() - parseInt(timestamp, 10);
      if (elapsed < SESSION_EXPIRY_MS) {
        setIsAuthorized(true);
        setIsLoading(false);
        return;
      }
    }

    // Invalid or expired session
    sessionStorage.removeItem("spv-admin-access");
    sessionStorage.removeItem("spv-admin-timestamp");
    router.replace(`/${locale}/spv-investment/admin`);
  }, [locale, router]);

  const handleLogout = () => {
    sessionStorage.removeItem("spv-admin-access");
    sessionStorage.removeItem("spv-admin-timestamp");
    router.replace(`/${locale}/spv-investment/admin`);
  };

  const navItems = [
    {
      name: t("spvInvestment.admin.nav.dashboard"),
      href: `/${locale}/spv-investment/admin/dashboard`,
      icon: LayoutDashboard,
    },
    {
      name: t("spvInvestment.admin.nav.customers"),
      href: `/${locale}/spv-investment/admin/customers`,
      icon: Users,
    },
    {
      name: t("spvInvestment.admin.nav.properties"),
      href: `/${locale}/spv-investment/admin/properties`,
      icon: Building2,
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-indigo-500/30 border-t-indigo-500" />
          <p className="mt-4 text-sm text-slate-400">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Admin Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-slate-900 border-b border-slate-700 shadow-lg">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Left: Logo + Nav */}
            <div className="flex items-center gap-8">
              {/* Logo */}
              <Link
                href={`/${locale}/spv-investment/admin/dashboard`}
                className="flex items-center gap-2"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold text-white">
                  {t("spvInvestment.admin.title")}
                </span>
              </Link>

              {/* Navigation Links */}
              <div className="hidden md:flex items-center gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-indigo-600 text-white"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right: Admin Badge + Logout */}
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-indigo-600/20 px-3 py-1 text-xs font-medium text-indigo-300 ring-1 ring-indigo-500/30">
                <Shield className="h-3 w-3" />
                Admin
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">{t("spvInvestment.admin.nav.logout")}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-slate-700">
          <div className="container mx-auto max-w-7xl px-6 py-2">
            <div className="flex items-center gap-1 overflow-x-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                      isActive
                        ? "bg-indigo-600 text-white"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main>{children}</main>
    </div>
  );
}
