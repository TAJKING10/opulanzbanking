"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { LayoutDashboard, Building2, FileText, LogOut, User, ChevronDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

import { isSpvInvestorAuthenticated, getSpvInvestor, clearSpvInvestorSession } from "@/lib/spv-auth";
import type { Investor } from "@/lib/investment-api";

const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export default function SpvPortalProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations();
  const [isAuthorized, setIsAuthorized] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [investor, setInvestor] = React.useState<Investor | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isSpvInvestorAuthenticated()) {
      setIsAuthorized(true);
      setInvestor(getSpvInvestor());
      setIsLoading(false);
      return;
    }

    // Fallback check for session
    const access = sessionStorage.getItem("spv-portal-access");
    const timestamp = sessionStorage.getItem("spv-portal-timestamp");

    if (access === "granted" && timestamp) {
      const elapsed = Date.now() - parseInt(timestamp, 10);
      if (elapsed < SESSION_EXPIRY_MS) {
        setIsAuthorized(true);
        setInvestor(getSpvInvestor());
        setIsLoading(false);
        return;
      }
    }

    clearSpvInvestorSession();
    sessionStorage.removeItem("spv-portal-access");
    sessionStorage.removeItem("spv-portal-timestamp");
    router.replace(`/${locale}/spv-investment/portal`);
  }, [locale, router]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    clearSpvInvestorSession();
    sessionStorage.removeItem("spv-portal-access");
    sessionStorage.removeItem("spv-portal-timestamp");
    sessionStorage.removeItem("spv-portal-profile");
    router.push(`/${locale}/spv-investment/portal`);
  };

  const navItems = [
    {
      label: t("spvInvestment.portal.nav.dashboard"),
      href: `/${locale}/spv-investment/portal/dashboard`,
      icon: LayoutDashboard,
    },
    {
      label: t("spvInvestment.portal.nav.offerings"),
      href: `/${locale}/spv-investment/portal/offerings`,
      icon: Building2,
    },
    {
      label: t("spvInvestment.portal.nav.documents"),
      href: `/${locale}/spv-investment/portal/documents`,
      icon: FileText,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-gold border-t-transparent" />
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-brand-off/30">
      {/* Portal Navigation Bar */}
      <div className="sticky top-0 z-40 bg-white border-b border-brand-grayLight/40 shadow-sm backdrop-blur-md bg-white/95">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="flex items-center justify-between h-14">
            {/* Left Nav items */}
            <div className="flex items-center gap-2 sm:gap-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.includes(item.href.split("/").pop()!);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all",
                      isActive
                        ? "bg-brand-gold/15 text-brand-gold font-semibold shadow-xs"
                        : "text-brand-dark/70 hover:bg-brand-off hover:text-brand-dark"
                    )}
                  >
                    <Icon className={cn("h-4 w-4", isActive ? "text-brand-gold" : "text-brand-grayMed")} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Right: Investor profile & sign out */}
            <div className="flex items-center gap-3">
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-medium text-brand-dark hover:bg-brand-off transition-colors"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold font-bold text-xs">
                    {investor?.name?.charAt(0).toUpperCase() || <User className="h-3.5 w-3.5" />}
                  </div>
                  <span className="hidden md:inline text-xs font-semibold text-brand-dark">
                    {investor?.name || "Investor"}
                  </span>
                  <ChevronDown className={cn(
                    "h-3.5 w-3.5 text-brand-grayMed transition-transform duration-200",
                    isDropdownOpen ? "rotate-180" : ""
                  )} />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-brand-grayLight/50 shadow-xl z-50 overflow-hidden">
                    <div className="p-3 border-b border-brand-grayLight/30 bg-brand-off/40">
                      <p className="text-sm font-semibold text-brand-dark">{investor?.name}</p>
                      <p className="text-xs text-brand-grayMed truncate">{investor?.email}</p>
                      {investor?.investor_type && (
                        <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-brand-gold/10 px-2 py-0.5 text-[10px] font-medium text-brand-gold capitalize">
                          <Sparkles className="h-2.5 w-2.5" />
                          {investor.investor_type} Investor
                        </span>
                      )}
                    </div>
                    <div className="p-1">
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          handleLogout();
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        {t("spvInvestment.portal.nav.logout")}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Direct Sign Out Button on desktop */}
              <button
                onClick={handleLogout}
                className="hidden sm:flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-brand-grayMed transition-colors hover:bg-brand-off hover:text-red-600"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>{t("spvInvestment.portal.nav.logout")}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <main>{children}</main>
    </div>
  );
}

