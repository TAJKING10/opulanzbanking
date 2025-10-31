"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeaderProps {
  locale: string;
}

const navigation = [
  { name: "Home", href: "" },
  { name: "About", href: "/about" },
  { name: "Open Account", href: "/open-account" },
  { name: "Services", href: "/services" },
  { name: "Support", href: "/support" },
];

export function Header({ locale }: HeaderProps) {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300",
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-md"
          : "bg-white shadow-sm"
      )}
    >
      <nav className="container mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link
          href={`/${locale}`}
          className="flex items-center gap-3 transition-opacity hover:opacity-80"
        >
          <img
            src={`${process.env.NODE_ENV === 'production' ? '/opulanzbanking' : ''}/images/opulanz-logo.png`}
            alt="Opulanz Logo"
            width={40}
            height={40}
            className="h-10 w-auto"
          />
          <span className="text-2xl font-bold uppercase tracking-tight text-brand-dark">
            OPULANZ
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-10 md:flex">
          {navigation.map((item) => {
            const isActive = item.href === ""
              ? pathname === `/${locale}` || pathname === `/${locale}/`
              : pathname.includes(item.href);
            return (
              <Link
                key={item.name}
                href={`/${locale}${item.href}`}
                className={cn(
                  "text-sm font-semibold transition-all duration-200 hover:text-brand-gold hover:scale-105 px-1",
                  isActive ? "text-brand-gold" : "text-brand-dark"
                )}
              >
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-5">
          {/* Language Switcher */}
          <div className="hidden items-center gap-2 sm:flex">
            <Globe className="h-4 w-4 text-brand-grayMed transition-colors" />
            <select
              value={locale}
              onChange={(e) => {
                const newLocale = e.target.value;
                const path = pathname.replace(`/${locale}`, `/${newLocale}`);
                window.location.href = path;
              }}
              className="cursor-pointer border-none bg-transparent text-sm font-semibold text-brand-dark transition-colors focus:outline-none focus:ring-2 focus:ring-brand-gold rounded-md"
            >
              <option value="en">EN</option>
              <option value="fr">FR</option>
            </select>
          </div>

          {/* Open Account Button */}
          <Button
            asChild
            variant="default"
            size="sm"
            className="hidden sm:inline-flex bg-brand-gold text-white hover:bg-brand-goldDark transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
          >
            <Link href={`/${locale}/open-account`}>Open Account</Link>
          </Button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-brand-dark transition-colors" />
            ) : (
              <Menu className="h-6 w-6 text-brand-dark transition-colors" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="border-t border-brand-grayLight bg-white md:hidden">
          <div className="container mx-auto space-y-1 px-6 py-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={`/${locale}${item.href}`}
                className="block rounded-lg px-4 py-3 text-base font-semibold text-brand-dark transition-colors hover:bg-gray-50 hover:text-brand-gold"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="flex items-center gap-4 px-4 pt-4">
              <select
                value={locale}
                onChange={(e) => {
                  const newLocale = e.target.value;
                  const path = pathname.replace(`/${locale}`, `/${newLocale}`);
                  window.location.href = path;
                }}
                className="flex-1 rounded-lg border border-brand-grayLight bg-white px-4 py-3 text-sm font-semibold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold"
              >
                <option value="en">English</option>
                <option value="fr">Français</option>
              </select>
            </div>
            <div className="space-y-2 pt-4">
              <div className="space-y-2">
                <p className="px-4 text-xs font-semibold text-brand-grayMed uppercase tracking-wide">Open Account</p>
                <Button asChild variant="primary" className="w-full">
                  <Link href={`/${locale}/open-account/individual`}>Individual Account</Link>
                </Button>
                <Button asChild variant="default" className="w-full">
                  <Link href={`/${locale}/open-account/company`}>Company Account</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
