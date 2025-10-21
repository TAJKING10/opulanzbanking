import * as React from "react";
import Link from "next/link";
import { Facebook, Twitter, Linkedin, Instagram } from "lucide-react";

interface FooterProps {
  locale: string;
}

const footerSections = [
  {
    title: "Services",
    links: [
      { label: "Open Account", href: "/open-account" },
      { label: "Company Formation", href: "/company-formation" },
      { label: "Accounting & Invoicing", href: "/invoicing-accounting" },
      { label: "Tax Advisory", href: "/tax-advisory" },
      { label: "Investment Advisory", href: "/investment-advisory" },
    ],
  },
  {
    title: "Products",
    links: [
      { label: "Life Insurance", href: "/life-insurance" },
      { label: "Mortgage", href: "/mortgage" },
      { label: "Business Banking", href: "/open-account" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Support", href: "/support" },
      { label: "Contact", href: "/support" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms & Conditions", href: "/legal/terms" },
      { label: "Privacy Policy", href: "/legal/privacy" },
      { label: "Disclaimers", href: "/legal/disclaimers" },
      { label: "Regulatory", href: "/legal/regulatory" },
    ],
  },
];

const socialLinks = [
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Instagram, href: "#", label: "Instagram" },
];

export function Footer({ locale }: FooterProps) {
  const currentYear = new Date().getFullYear();

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
              Professional digital banking and advisory services for businesses
              and individuals in France and Luxembourg.
            </p>
            <div className="mt-6 flex gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gold text-white transition-colors hover:bg-brand-goldDark"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Links Columns */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-brand-dark">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={`/${locale}${link.href}`}
                      className="text-sm text-brand-grayMed transition-colors hover:text-brand-gold"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-brand-grayLight pt-8">
          <div className="flex flex-col items-center justify-between gap-4 text-sm text-brand-grayMed md:flex-row">
            <p>
              &copy; {currentYear} Opulanz. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <p className="text-xs">
                Regulated by CSSF (LU) | ACPR & AMF (FR)
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
