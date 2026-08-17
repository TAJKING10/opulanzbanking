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
        <div className="mx-auto mb-10 flex w-full max-w-[680px] flex-col gap-y-8 sm:mb-12 md:flex-row md:items-start md:justify-center md:gap-x-14">

          {/* Services Column */}
          <div className="w-full text-center md:w-[220px]">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-brand-dark">
              {t("footer.sections.services")}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href={`/${locale}/open-account`}
                  className="text-sm leading-6 text-brand-grayMed transition-colors hover:text-brand-gold"
                >
                  {t("footer.links.services.openAccount")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/company-formation`}
                  className="text-sm leading-6 text-brand-grayMed transition-colors hover:text-brand-gold"
                >
                  {t("footer.links.services.companyFormation")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/invoicing-accounting`}
                  className="text-sm leading-6 text-brand-grayMed transition-colors hover:text-brand-gold"
                >
                  {t("footer.links.services.accounting")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/tax-advisory`}
                  className="text-sm leading-6 text-brand-grayMed transition-colors hover:text-brand-gold"
                >
                  {t("footer.links.services.tax")}
                </Link>
              </li>
              {process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_ENVIRONMENT !== "production" && (
                <li>
                  <Link
                    href={`/${locale}/spv-investment`}
                    className="text-sm leading-6 text-brand-grayMed transition-colors hover:text-brand-gold"
                  >
                    {t("footer.links.services.spvInvestment")}
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Company Column */}
          <div className="w-full text-center md:w-[150px]">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-brand-dark">
              {t("footer.sections.company")}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href={`/${locale}/about`}
                  className="text-sm leading-6 text-brand-grayMed transition-colors hover:text-brand-gold"
                >
                  {t("footer.links.company.about")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/support`}
                  className="text-sm leading-6 text-brand-grayMed transition-colors hover:text-brand-gold"
                >
                  {t("footer.links.company.support")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/support`}
                  className="text-sm leading-6 text-brand-grayMed transition-colors hover:text-brand-gold"
                >
                  {t("footer.links.company.contact")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="w-full text-center md:w-[180px]">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-brand-dark">
              {t("footer.sections.legal")}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href={`/${locale}/legal/mentions`}
                  className="text-sm leading-6 text-brand-grayMed transition-colors hover:text-brand-gold"
                >
                  {t("footer.links.legal.mentions")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/legal/terms`}
                  className="text-sm leading-6 text-brand-grayMed transition-colors hover:text-brand-gold"
                >
                  {t("footer.links.legal.terms")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/legal/privacy`}
                  className="text-sm leading-6 text-brand-grayMed transition-colors hover:text-brand-gold"
                >
                  {t("footer.links.legal.privacy")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/legal/disclaimers`}
                  className="text-sm leading-6 text-brand-grayMed transition-colors hover:text-brand-gold"
                >
                  {t("footer.links.legal.disclaimers")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/legal/regulatory`}
                  className="text-sm leading-6 text-brand-grayMed transition-colors hover:text-brand-gold"
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
