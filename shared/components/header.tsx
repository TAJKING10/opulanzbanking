"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, Globe, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { navigation, services } from "@/shared/lib/navigation";

interface HeaderProps {
  locale: string;
}

// navigation and services now sourced from shared/lib/navigation

export function Header({ locale }: HeaderProps) {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = React.useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = React.useState(false);
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
          ? "bg-white shadow-md"
          : "bg-transparent"
      )}
    >
      <nav className="container mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link
          href={`/${locale}`}
          className="flex items-center gap-3 transition-opacity hover:opacity-80"
        >
          <Image
            src="/images/opulanz-logo.png"
            alt="Opulanz Logo"
            width={60}
            height={60}
            className="h-16 w-auto"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          {navigation.map((item) => {
            const isActive = pathname.includes(item.href);

            // Services dropdown
            if (item.name === "Services") {
              return (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => setIsServicesDropdownOpen(true)}
                  onMouseLeave={() => setIsServicesDropdownOpen(false)}
                >
                  <button
                    className={cn(
                      "flex items-center gap-1 text-sm font-semibold transition-colors hover:text-brand-gold",
                      isActive ? "text-brand-gold" : "text-brand-dark"
                    )}
                  >
                    {item.name}
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  {/* Dropdown Menu */}
                  {isServicesDropdownOpen && (
                    <div className="absolute left-0 top-full pt-2">
                      <div className="min-w-[220px] rounded-lg border border-brand-grayLight bg-white shadow-lg">
                        <div className="py-2">
                          <Link
                            href={`/${locale}/services`}
                            className="block px-4 py-2.5 text-sm font-bold text-brand-gold transition-colors hover:bg-brand-off"
                          >
                            Our Services
                          </Link>
                          {services.map((service) => (
                            <Link
                              key={service.name}
                              href={`/${locale}${service.href}`}
                              className="block px-4 py-2.5 text-sm font-medium text-brand-dark transition-colors hover:bg-brand-off hover:text-brand-gold"
                            >
                              {service.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.name}
                href={`/${locale}${item.href}`}
                className={cn(
                  "text-sm font-semibold transition-colors hover:text-brand-gold",
                  isActive ? "text-brand-gold" : "text-brand-dark"
                )}
              >
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
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
              className="cursor-pointer border-none bg-transparent text-sm font-semibold text-brand-dark transition-colors focus:outline-none focus:ring-2 focus:ring-brand-gold"
            >
              <option value="en">EN</option>
              <option value="fr">FR</option>
            </select>
          </div>

          <Button
            asChild
            variant={isScrolled ? "primary" : "default"}
            size="sm"
            className="hidden sm:inline-flex"
          >
            <Link href={`/${locale}/open-account`}>Get Started</Link>
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
            {navigation.map((item) => {
              // Services with submenu
              if (item.name === "Services") {
                return (
                  <div key={item.name}>
                    <button
                      onClick={() => setIsMobileServicesOpen(!isMobileServicesOpen)}
                      className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-base font-semibold text-brand-dark transition-colors hover:bg-brand-off hover:text-brand-gold"
                    >
                      {item.name}
                      <ChevronDown
                        className={cn(
                          "h-5 w-5 transition-transform",
                          isMobileServicesOpen && "rotate-180"
                        )}
                      />
                    </button>
                    {isMobileServicesOpen && (
                      <div className="ml-4 mt-1 space-y-1">
                        <Link
                          href={`/${locale}/services`}
                          className="block rounded-lg px-4 py-2.5 text-sm font-bold text-brand-gold transition-colors hover:bg-brand-off"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Our Services
                        </Link>
                        {services.map((service) => (
                          <Link
                            key={service.name}
                            href={`/${locale}${service.href}`}
                            className="block rounded-lg px-4 py-2.5 text-sm font-medium text-brand-grayMed transition-colors hover:bg-brand-off hover:text-brand-gold"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {service.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.name}
                  href={`/${locale}${item.href}`}
                  className="block rounded-lg px-4 py-3 text-base font-semibold text-brand-dark transition-colors hover:bg-brand-off hover:text-brand-gold"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              );
            })}
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
            <Button asChild variant="primary" className="mt-4 w-full">
              <Link href={`/${locale}/open-account`}>Get Started</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
