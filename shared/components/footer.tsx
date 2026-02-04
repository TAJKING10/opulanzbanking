import * as React from "react";
import Link from "next/link";
import { Facebook, Twitter, Linkedin, Instagram } from "lucide-react";
import { useTranslations } from "next-intl";

interface FooterProps {
  locale: string;
}

const socialLinks = [
  { icon: Linkedin, href: "#", key: "linkedin" },
  { icon: Twitter, href: "#", key: "twitter" },
  { icon: Facebook, href: "#", key: "facebook" },
  { icon: Instagram, href: "#", key: "instagram" },
];

export function Footer({ locale }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const t = useTranslations();

  return (
    <footer className="border-t border-brand-grayLight bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto max-w-7xl px-6 py-12">
        {/* Links Grid at Top */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 gap-y-8 mb-12">

          {/* Services Column */}
          <div>
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
                  href={`/${locale}/investment-advisory`}
                  className="text-xs text-brand-grayMed transition-colors hover:text-brand-gold"
                >
                  {t("footer.links.services.investment")}
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

          {/* Products Column */}
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-brand-dark">
              {t("footer.sections.products")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href={`/${locale}/life-insurance`}
                  className="text-xs text-brand-grayMed transition-colors hover:text-brand-gold"
                >
                  {t("footer.links.products.lifeInsurance")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/mortgage`}
                  className="text-xs text-brand-grayMed transition-colors hover:text-brand-gold"
                >
                  {t("footer.links.products.mortgage")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/open-account`}
                  className="text-xs text-brand-grayMed transition-colors hover:text-brand-gold"
                >
                  {t("footer.links.products.businessBanking")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
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
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-brand-dark">
              {t("footer.sections.legal")}
            </h3>
            <ul className="space-y-2">
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
            <div className="mt-6 flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.key}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t(`footer.social.${social.key}`)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gold text-white transition-all hover:bg-brand-goldDark hover:scale-110"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-brand-grayLight pt-8">
          <div className="flex flex-col items-center justify-between gap-4 text-sm text-brand-grayMed md:flex-row">
            <p className="text-center md:text-left">
              © {currentYear} {t("footer.copyright", { year: currentYear }).replace(`© ${currentYear} `, '')}
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <p className="text-xs text-center">
                {t("footer.regulated")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
