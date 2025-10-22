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
    <footer className="border-t border-brand-grayLight bg-white">
      <div className="container mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link
              href={`/${locale}`}
              className="text-2xl font-bold uppercase tracking-tight text-brand-dark"
            >
              OPULANZ
            </Link>
            <p className="mt-4 text-sm text-brand-grayMed">
              {t("footer.description")}
            </p>
            <div className="mt-6 flex gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.key}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t(`footer.social.${social.key}`)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gold text-white transition-colors hover:bg-brand-goldDark"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Services Column */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-brand-dark">
              {t("footer.sections.services")}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href={`/${locale}/open-account`}
                  className="text-sm text-brand-grayMed transition-colors hover:text-brand-gold"
                >
                  {t("footer.links.services.openAccount")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/company-formation`}
                  className="text-sm text-brand-grayMed transition-colors hover:text-brand-gold"
                >
                  {t("footer.links.services.companyFormation")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/invoicing-accounting`}
                  className="text-sm text-brand-grayMed transition-colors hover:text-brand-gold"
                >
                  {t("footer.links.services.accounting")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/tax-advisory`}
                  className="text-sm text-brand-grayMed transition-colors hover:text-brand-gold"
                >
                  {t("footer.links.services.tax")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/investment-advisory`}
                  className="text-sm text-brand-grayMed transition-colors hover:text-brand-gold"
                >
                  {t("footer.links.services.investment")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Products Column */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-brand-dark">
              {t("footer.sections.products")}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href={`/${locale}/life-insurance`}
                  className="text-sm text-brand-grayMed transition-colors hover:text-brand-gold"
                >
                  {t("footer.links.products.lifeInsurance")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/mortgage`}
                  className="text-sm text-brand-grayMed transition-colors hover:text-brand-gold"
                >
                  {t("footer.links.products.mortgage")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/open-account`}
                  className="text-sm text-brand-grayMed transition-colors hover:text-brand-gold"
                >
                  {t("footer.links.products.businessBanking")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-brand-dark">
              {t("footer.sections.company")}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href={`/${locale}/about`}
                  className="text-sm text-brand-grayMed transition-colors hover:text-brand-gold"
                >
                  {t("footer.links.company.about")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/support`}
                  className="text-sm text-brand-grayMed transition-colors hover:text-brand-gold"
                >
                  {t("footer.links.company.support")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/support`}
                  className="text-sm text-brand-grayMed transition-colors hover:text-brand-gold"
                >
                  {t("footer.links.company.contact")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-brand-dark">
              {t("footer.sections.legal")}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href={`/${locale}/legal/terms`}
                  className="text-sm text-brand-grayMed transition-colors hover:text-brand-gold"
                >
                  {t("footer.links.legal.terms")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/legal/privacy`}
                  className="text-sm text-brand-grayMed transition-colors hover:text-brand-gold"
                >
                  {t("footer.links.legal.privacy")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/legal/disclaimers`}
                  className="text-sm text-brand-grayMed transition-colors hover:text-brand-gold"
                >
                  {t("footer.links.legal.disclaimers")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/legal/regulatory`}
                  className="text-sm text-brand-grayMed transition-colors hover:text-brand-gold"
                >
                  {t("footer.links.legal.regulatory")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-brand-grayLight pt-8">
          <div className="flex flex-col items-center justify-between gap-4 text-sm text-brand-grayMed md:flex-row">
            <p>
              {t("footer.copyright", { year: currentYear })}
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <p className="text-xs">
                {t("footer.regulated")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
