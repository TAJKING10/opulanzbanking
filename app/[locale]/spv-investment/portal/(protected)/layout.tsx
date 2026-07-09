"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { LayoutDashboard, Building2, FileText, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

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

  React.useEffect(() => {
    const access = sessionStorage.getItem("spv-portal-access");
    const timestamp = sessionStorage.getItem("spv-portal-timestamp");

    if (access === "granted" && timestamp) {
      const elapsed = Date.now() - parseInt(timestamp, 10);
      if (elapsed < SESSION_EXPIRY_MS) {
        setIsAuthorized(true);
        setIsLoading(false);
        return;
      }
    }

    sessionStorage.removeItem("spv-portal-access");
    sessionStorage.removeItem("spv-portal-timestamp");
    router.replace(`/${locale}/spv-investment/portal`);
  }, [locale, router]);

  const handleLogout = () => {
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
    <div>
      {/* Portal Navigation Bar */}
      <div className="bg-brand-dark border-b border-white/10">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.includes(item.href.split("/").pop()!);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-white/10 text-brand-gold"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Link>
                );
              })}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">{t("spvInvestment.portal.nav.logout")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Page Content */}
      {children}
    </div>
  );
}
