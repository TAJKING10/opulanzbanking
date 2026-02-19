export type NavItem = {
  name: string;
  href: string; // locale prefix added by consumers
};

export const navigation: NavItem[] = [
  { name: "Open Account", href: "/open-account" },
  { name: "Company Formation", href: "/company-formation" },
  { name: "Services", href: "/services" },
  { name: "Support", href: "/support" },
];

export const services: NavItem[] = [
  { name: "Company Formation", href: "/company-formation" },
  { name: "Tax Advisory", href: "/tax-advisory" },
  { name: "Investment Advisory", href: "/investment-advisory" },
  { name: "Life Insurance", href: "/life-insurance" },
  { name: "Accounting & Invoicing", href: "/invoicing-accounting" },
];
