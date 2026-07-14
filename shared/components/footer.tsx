import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

interface FooterProps {
  locale: string;
}

export function Footer({ locale }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const t = useTranslations();

  return (
    <footer className="border-t border-brand-grayLight bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto max-w-7xl 3xl:max-w-[1600px] 4xl:max-w-[1800px] px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        {/* Links Grid at Top */}
        <div className="flex flex-wrap justify-center gap-x-20 gap-y-8 mb-10 sm:mb-12">

          {/* Services Column */}
          <div className="min-w-[180px]">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-brand-dark">
              {t("footer.sections.services")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href={`/${locale}/open-account`}
                  className="text-xs text-brand-grayMed transition-colors hover:text-brand-gold"
                >
                  {t("footer.links.services.openAccount")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/company-formation`}
                  className="text-xs text-brand-grayMed transition-colors hover:text-brand-gold"
                >
                  {t("footer.links.services.companyFormation")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/invoicing-accounting`}
                  className="text-xs text-brand-grayMed transition-colors hover:text-brand-gold"
                >
                  {t("footer.links.services.accounting")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/tax-advisory`}
                  className="text-xs text-brand-grayMed transition-colors hover:text-brand-gold"
                >
                  {t("footer.links.services.tax")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/spv-investment`}
                  className="text-xs text-brand-grayMed transition-colors hover:text-brand-gold"
                >
                  {t("footer.links.services.spvInvestment")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div className="min-w-[140px]">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-brand-dark">
              {t("footer.sections.company")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href={`/${locale}/about`}
                  className="text-xs text-brand-grayMed transition-colors hover:text-brand-gold"
                >
                  {t("footer.links.company.about")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/support`}
                  className="text-xs text-brand-grayMed transition-colors hover:text-brand-gold"
                >
                  {t("footer.links.company.support")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/support`}
                  className="text-xs text-brand-grayMed transition-colors hover:text-brand-gold"
                >
                  {t("footer.links.company.contact")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="min-w-[160px]">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-brand-dark">
              {t("footer.sections.legal")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href={`/${locale}/legal/mentions`}
                  className="text-xs text-brand-grayMed transition-colors hover:text-brand-gold"
                >
                  {t("footer.links.legal.mentions")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/legal/terms`}
                  className="text-xs text-brand-grayMed transition-colors hover:text-brand-gold"
                >
                  {t("footer.links.legal.terms")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/legal/privacy`}
                  className="text-xs text-brand-grayMed transition-colors hover:text-brand-gold"
                >
                  {t("footer.links.legal.privacy")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/legal/disclaimers`}
                  className="text-xs text-brand-grayMed transition-colors hover:text-brand-gold"
                >
                  {t("footer.links.legal.disclaimers")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/legal/regulatory`}
                  className="text-xs text-brand-grayMed transition-colors hover:text-brand-gold"
                >
                  {t("footer.links.legal.regulatory")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Brand Section Below Links */}
        <div className="border-t border-brand-grayLight pt-8 pb-8">
          <div className="flex flex-col items-center text-center">
            <Link
              href={`/${locale}`}
              className="text-2xl font-bold uppercase tracking-tight text-brand-dark hover:text-brand-gold transition-colors"
            >
              OPULANZ
            </Link>
            <p className="mt-4 text-sm text-brand-grayMed leading-relaxed max-w-md">
              {t("footer.description")}
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-brand-grayLight pt-8">
          <div className="flex flex-col items-center gap-4 text-sm text-brand-grayMed">
            <p className="text-xs text-center leading-relaxed max-w-4xl">
              {t("footer.regulated")}
            </p>
            <p className="text-center">
              © {currentYear} {t("footer.copyright", { year: currentYear }).replace(`© ${currentYear} `, '')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
