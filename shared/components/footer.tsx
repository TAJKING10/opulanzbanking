"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FooterProps {
  locale: string;
}

export function Footer({ locale }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const t = useTranslations();

  // On mobile, sections can be toggled via accordion
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({
    services: false,
    company: false,
    legal: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <footer className="border-t border-brand-grayLight bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto max-w-7xl 3xl:max-w-[1600px] 4xl:max-w-[1800px] px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        {/* Navigation Sections */}
        <div className="mx-auto mb-10 w-full max-w-4xl divide-y divide-brand-grayLight/40 md:divide-y-0 md:grid md:grid-cols-3 md:gap-x-12 lg:gap-x-16 sm:mb-12">

          {/* Services Section */}
          <div className="py-3 md:py-0">
            {/* Mobile Accordion Trigger */}
            <button
              type="button"
              onClick={() => toggleSection("services")}
              className="flex w-full items-center justify-between py-2 text-left text-sm font-bold uppercase tracking-wider text-brand-dark transition-colors hover:text-brand-gold md:hidden"
              aria-expanded={openSections.services}
            >
              <span>{t("footer.sections.services")}</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-brand-grayMed transition-transform duration-200",
                  openSections.services && "rotate-180 text-brand-gold"
                )}
              />
            </button>

            {/* Desktop Header */}
            <h3 className="hidden mb-4 text-sm font-bold uppercase tracking-wider text-brand-dark md:block">
              {t("footer.sections.services")}
            </h3>

            {/* Links List */}
            <ul
              className={cn(
                "transition-all duration-200 md:block md:space-y-3",
                openSections.services ? "block pt-2 pb-3 space-y-1" : "hidden md:block"
              )}
            >
              <li>
                <Link
                  href={`/${locale}/open-account`}
                  className="block py-1.5 text-sm leading-6 text-brand-grayMed transition-colors hover:text-brand-gold md:py-0"
                >
                  {t("footer.links.services.openAccount")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/company-formation`}
                  className="block py-1.5 text-sm leading-6 text-brand-grayMed transition-colors hover:text-brand-gold md:py-0"
                >
                  {t("footer.links.services.companyFormation")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/invoicing-accounting`}
                  className="block py-1.5 text-sm leading-6 text-brand-grayMed transition-colors hover:text-brand-gold md:py-0"
                >
                  {t("footer.links.services.accounting")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/tax-advisory`}
                  className="block py-1.5 text-sm leading-6 text-brand-grayMed transition-colors hover:text-brand-gold md:py-0"
                >
                  {t("footer.links.services.tax")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/investment-advisory`}
                  className="block py-1.5 text-sm leading-6 text-brand-grayMed transition-colors hover:text-brand-gold md:py-0"
                >
                  {t("footer.links.services.investment")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/life-insurance`}
                  className="block py-1.5 text-sm leading-6 text-brand-grayMed transition-colors hover:text-brand-gold md:py-0"
                >
                  {t("footer.links.products.lifeInsurance")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/mortgage`}
                  className="block py-1.5 text-sm leading-6 text-brand-grayMed transition-colors hover:text-brand-gold md:py-0"
                >
                  {t("nav.mortgage")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/services`}
                  className="block py-1.5 text-sm leading-6 text-brand-grayMed transition-colors hover:text-brand-gold md:py-0"
                >
                  {t("nav.ourServices")}
                </Link>
              </li>
              {process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_ENVIRONMENT !== "production" && (
                <li>
                  <Link
                    href={`/${locale}/spv-investment`}
                    className="block py-1.5 text-sm leading-6 text-brand-grayMed transition-colors hover:text-brand-gold md:py-0"
                  >
                    {t("footer.links.services.spvInvestment")}
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Company Section */}
          <div className="py-3 md:py-0">
            {/* Mobile Accordion Trigger */}
            <button
              type="button"
              onClick={() => toggleSection("company")}
              className="flex w-full items-center justify-between py-2 text-left text-sm font-bold uppercase tracking-wider text-brand-dark transition-colors hover:text-brand-gold md:hidden"
              aria-expanded={openSections.company}
            >
              <span>{t("footer.sections.company")}</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-brand-grayMed transition-transform duration-200",
                  openSections.company && "rotate-180 text-brand-gold"
                )}
              />
            </button>

            {/* Desktop Header */}
            <h3 className="hidden mb-4 text-sm font-bold uppercase tracking-wider text-brand-dark md:block">
              {t("footer.sections.company")}
            </h3>

            {/* Links List */}
            <ul
              className={cn(
                "transition-all duration-200 md:block md:space-y-3",
                openSections.company ? "block pt-2 pb-3 space-y-1" : "hidden md:block"
              )}
            >
              <li>
                <Link
                  href={`/${locale}/about`}
                  className="block py-1.5 text-sm leading-6 text-brand-grayMed transition-colors hover:text-brand-gold md:py-0"
                >
                  {t("footer.links.company.about")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/support`}
                  className="block py-1.5 text-sm leading-6 text-brand-grayMed transition-colors hover:text-brand-gold md:py-0"
                >
                  {t("footer.links.company.support")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/support`}
                  className="block py-1.5 text-sm leading-6 text-brand-grayMed transition-colors hover:text-brand-gold md:py-0"
                >
                  {t("footer.links.company.contact")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Section */}
          <div className="py-3 md:py-0">
            {/* Mobile Accordion Trigger */}
            <button
              type="button"
              onClick={() => toggleSection("legal")}
              className="flex w-full items-center justify-between py-2 text-left text-sm font-bold uppercase tracking-wider text-brand-dark transition-colors hover:text-brand-gold md:hidden"
              aria-expanded={openSections.legal}
            >
              <span>{t("footer.sections.legal")}</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-brand-grayMed transition-transform duration-200",
                  openSections.legal && "rotate-180 text-brand-gold"
                )}
              />
            </button>

            {/* Desktop Header */}
            <h3 className="hidden mb-4 text-sm font-bold uppercase tracking-wider text-brand-dark md:block">
              {t("footer.sections.legal")}
            </h3>

            {/* Links List */}
            <ul
              className={cn(
                "transition-all duration-200 md:block md:space-y-3",
                openSections.legal ? "block pt-2 pb-3 space-y-1" : "hidden md:block"
              )}
            >
              <li>
                <Link
                  href={`/${locale}/legal/mentions`}
                  className="block py-1.5 text-sm leading-6 text-brand-grayMed transition-colors hover:text-brand-gold md:py-0"
                >
                  {t("footer.links.legal.mentions")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/legal/terms`}
                  className="block py-1.5 text-sm leading-6 text-brand-grayMed transition-colors hover:text-brand-gold md:py-0"
                >
                  {t("footer.links.legal.terms")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/legal/privacy`}
                  className="block py-1.5 text-sm leading-6 text-brand-grayMed transition-colors hover:text-brand-gold md:py-0"
                >
                  {t("footer.links.legal.privacy")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/legal/disclaimers`}
                  className="block py-1.5 text-sm leading-6 text-brand-grayMed transition-colors hover:text-brand-gold md:py-0"
                >
                  {t("footer.links.legal.disclaimers")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/legal/regulatory`}
                  className="block py-1.5 text-sm leading-6 text-brand-grayMed transition-colors hover:text-brand-gold md:py-0"
                >
                  {t("footer.links.legal.regulatory")}
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Brand Section Below Links */}
        <div className="border-t border-brand-grayLight/60 pt-8 pb-8">
          <div className="flex flex-col items-center text-center">
            <Link
              href={`/${locale}`}
              className="inline-flex items-center transition-opacity hover:opacity-85"
            >
              <img
                src="/images/opulanz-logo-header.png"
                alt="Opulanz"
                width={160}
                height={56}
                className="h-10 sm:h-12 w-auto object-contain"
              />
            </Link>
            <p className="mt-4 text-sm text-brand-grayMed leading-relaxed max-w-md px-2">
              {t("footer.description")}
            </p>
            <address className="mt-3 text-xs not-italic text-brand-grayMed leading-relaxed px-2">
              Groupe Advensys Luxembourg S.A. · 2 Rue Edward Steichen, L-2540 Luxembourg
            </address>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-brand-grayLight/60 pt-8 pb-16 sm:pb-8">
          <div className="flex flex-col items-center gap-4 text-sm text-brand-grayMed">
            <p className="text-xs text-center leading-relaxed max-w-4xl px-2">
              {t("footer.regulated")}
            </p>
            <p className="text-center text-xs sm:text-sm">
              © {currentYear} {t("footer.copyright", { year: currentYear }).replace(`© ${currentYear} `, '')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
