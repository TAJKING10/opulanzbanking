// SPV Investment Data Layer
// Manages customers and offerings in localStorage

// ============ TYPES ============

export interface Customer {
  id: string;
  accessCode: string;
  name: string;
  email: string;
  phone?: string;
  investorType: "institutional" | "professional" | "private";
  profile: "existing" | "new";
  createdAt: string;
  lastAccess?: string;
  status: "active" | "inactive";
}

export interface OfferingFinancials {
  totalValue: string;
  spvShares: string;
  minimumInvestment: string;
  targetReturn: string;
  investmentTerm: string;
  distributionFrequency: string;
}

export interface OfferingBankTransfer {
  bankName: string;
  iban: string;
  bic: string;
  reference: string;
}

export interface Offering {
  id: string;
  title: string;
  location: string;
  propertyType: string;
  size: string;
  yearBuilt: string;
  status: "open" | "closing" | "closed" | "coming";
  description: string;
  features: string[];
  images: string[];
  financials: OfferingFinancials;
  bankTransfer: OfferingBankTransfer;
}

export interface ActivityLog {
  id: string;
  type: "customer_login" | "customer_created" | "customer_updated" | "customer_deleted" | "offering_created" | "offering_updated" | "offering_deleted";
  description: string;
  timestamp: string;
}

// ============ STORAGE KEYS ============

const STORAGE_KEYS = {
  customers: "spv-customers",
  offerings: "spv-offerings",
  activityLog: "spv-activity-log",
  initialized: "spv-data-initialized",
};

// ============ SEED DATA ============

const SEED_CUSTOMERS: Customer[] = [
  {
    id: "cust-001",
    accessCode: "OPULANZ-INV-2025",
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "+352 691 123 456",
    investorType: "professional",
    profile: "existing",
    createdAt: "2024-06-15T10:00:00Z",
    lastAccess: "2025-01-28T14:30:00Z",
    status: "active",
  },
  {
    id: "cust-002",
    accessCode: "OPULANZ-INV-NEW-2025",
    name: "Marie Dupont",
    email: "marie.dupont@example.com",
    phone: "+33 6 12 34 56 78",
    investorType: "private",
    profile: "new",
    createdAt: "2025-01-10T09:00:00Z",
    status: "active",
  },
];

const SEED_OFFERINGS: Offering[] = [
  {
    id: "spv-lux-residence-01",
    title: "Luxembourg City Premium Residence",
    location: "Luxembourg City, Luxembourg",
    propertyType: "Residential — Luxury Apartments",
    size: "2,400 m²",
    yearBuilt: "2022",
    status: "open",
    description: "This SPV holds a premium residential property located in the heart of Luxembourg City. The development includes 12 luxury apartment units with high-quality finishes, situated in a sought-after neighbourhood with excellent transport links, proximity to the financial district, and strong rental demand. The property benefits from stable occupancy rates and delivers consistent rental income to SPV investors. The SPV structure provides clear legal separation of assets, professional property management, and transparent quarterly reporting.",
    features: [
      "Prime city-centre location with excellent transport links",
      "12 fully furnished luxury residential units",
      "Professional property management included",
      "Current occupancy rate above 95%",
      "Energy efficiency rating: Class A",
      "Secure underground parking facility",
      "Quarterly investor distributions",
      "Annual independent property valuation",
    ],
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&h=400&fit=crop",
    ],
    financials: {
      totalValue: "€3,200,000",
      spvShares: "40 SPV shares",
      minimumInvestment: "€50,000",
      targetReturn: "7–9% p.a.",
      investmentTerm: "5 years",
      distributionFrequency: "Quarterly",
    },
    bankTransfer: {
      bankName: "Banque de Luxembourg",
      iban: "LU12 3456 7890 1234 5678",
      bic: "BLLLLULL",
      reference: "SPV-LUX-RES-01",
    },
  },
  {
    id: "spv-riga-commercial-02",
    title: "Riga Commercial Centre",
    location: "Riga, Latvia",
    propertyType: "Commercial — Mixed Use",
    size: "4,800 m²",
    yearBuilt: "2019",
    status: "closing",
    description: "This SPV holds a strategically located mixed-use commercial property in Riga's central business district. The property features retail space on the ground floor and modern office space across four upper floors, attracting quality tenants with long-term lease agreements. The SPV benefits from Latvia's growing economy and competitive rental yields in the Baltic region.",
    features: [
      "Central business district location",
      "Multi-tenant commercial property",
      "Established long-term lease agreements",
      "Modern energy-efficient building systems",
      "Retail and office mixed-use format",
      "Strong Baltic economic fundamentals",
      "Semi-annual investor distributions",
      "Independent annual audit and valuation",
    ],
    images: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&h=400&fit=crop",
    ],
    financials: {
      totalValue: "€5,600,000",
      spvShares: "80 SPV shares",
      minimumInvestment: "€25,000",
      targetReturn: "8–11% p.a.",
      investmentTerm: "7 years",
      distributionFrequency: "Semi-Annual",
    },
    bankTransfer: {
      bankName: "Banque de Luxembourg",
      iban: "LU98 7654 3210 9876 5432",
      bic: "BLLLLULL",
      reference: "SPV-RIG-COM-02",
    },
  },
  {
    id: "spv-stockholm-dev-03",
    title: "Stockholm Waterfront Development",
    location: "Stockholm, Sweden",
    propertyType: "Residential — New Development",
    size: "6,200 m²",
    yearBuilt: "2026 (est.)",
    status: "coming",
    description: "This SPV comprises a new-build waterfront residential development in Stockholm, including 24 sustainably designed apartments with panoramic water views, targeting the premium Scandinavian residential market. Pre-sales have been strong, with a significant portion of units already reserved prior to construction completion.",
    features: [
      "Premium waterfront location in Stockholm",
      "24 residential units with panoramic views",
      "Sustainable construction — BREEAM Excellent",
      "Over 60% of units pre-reserved",
      "High-quality Scandinavian design and finishes",
      "Expected completion Q3 2026",
      "Developer track record of 15+ successful projects",
      "Capital distributions upon unit sales",
    ],
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=600&h=400&fit=crop",
    ],
    financials: {
      totalValue: "€8,400,000",
      spvShares: "60 SPV shares",
      minimumInvestment: "€100,000",
      targetReturn: "9–12% p.a.",
      investmentTerm: "4 years",
      distributionFrequency: "Upon exit",
    },
    bankTransfer: {
      bankName: "Banque de Luxembourg",
      iban: "LU55 1122 3344 5566 7788",
      bic: "BLLLLULL",
      reference: "SPV-STO-DEV-03",
    },
  },
  {
    id: "spv-lux-office-04",
    title: "Kirchberg Office Complex",
    location: "Kirchberg, Luxembourg",
    propertyType: "Commercial — Office",
    size: "3,600 m²",
    yearBuilt: "2018",
    status: "closed",
    description: "This SPV holds a Grade A office complex in Luxembourg's Kirchberg district, home to major EU institutions and international banks. The property is fully leased under a triple-net arrangement to institutional tenants, providing highly predictable income with minimal landlord obligations.",
    features: [
      "Kirchberg financial and institutional district",
      "Grade A office specification",
      "Triple-net lease structure",
      "Institutional-quality tenants",
      "Modern building systems and infrastructure",
      "Excellent public transport connectivity",
      "Quarterly investor distributions",
      "Long-term lease certainty",
    ],
    images: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&h=400&fit=crop",
    ],
    financials: {
      totalValue: "€4,800,000",
      spvShares: "48 SPV shares",
      minimumInvestment: "€75,000",
      targetReturn: "6–8% p.a.",
      investmentTerm: "6 years",
      distributionFrequency: "Quarterly",
    },
    bankTransfer: {
      bankName: "Banque de Luxembourg",
      iban: "LU77 9988 7766 5544 3322",
      bic: "BLLLLULL",
      reference: "SPV-LUX-OFF-04",
    },
  },
];

// ============ INITIALIZATION ============

export function initializeData(): void {
  if (typeof window === "undefined") return;

  const initialized = localStorage.getItem(STORAGE_KEYS.initialized);
  if (initialized) return;

  localStorage.setItem(STORAGE_KEYS.customers, JSON.stringify(SEED_CUSTOMERS));
  localStorage.setItem(STORAGE_KEYS.offerings, JSON.stringify(SEED_OFFERINGS));
  localStorage.setItem(STORAGE_KEYS.activityLog, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.initialized, "true");
}

// ============ CUSTOMER FUNCTIONS ============

export function getCustomers(): Customer[] {
  if (typeof window === "undefined") return [];
  initializeData();
  const data = localStorage.getItem(STORAGE_KEYS.customers);
  return data ? JSON.parse(data) : [];
}

export function getCustomerById(id: string): Customer | undefined {
  const customers = getCustomers();
  return customers.find((c) => c.id === id);
}

export function getCustomerByAccessCode(code: string): Customer | undefined {
  const customers = getCustomers();
  return customers.find((c) => c.accessCode === code && c.status === "active");
}

export function createCustomer(customer: Omit<Customer, "id" | "createdAt">): Customer {
  const customers = getCustomers();
  const newCustomer: Customer = {
    ...customer,
    id: `cust-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  customers.push(newCustomer);
  localStorage.setItem(STORAGE_KEYS.customers, JSON.stringify(customers));
  addActivityLog("customer_created", `Customer "${newCustomer.name}" created`);
  return newCustomer;
}

export function updateCustomer(id: string, updates: Partial<Customer>): Customer | undefined {
  const customers = getCustomers();
  const index = customers.findIndex((c) => c.id === id);
  if (index === -1) return undefined;

  customers[index] = { ...customers[index], ...updates };
  localStorage.setItem(STORAGE_KEYS.customers, JSON.stringify(customers));
  addActivityLog("customer_updated", `Customer "${customers[index].name}" updated`);
  return customers[index];
}

export function deleteCustomer(id: string): boolean {
  const customers = getCustomers();
  const customer = customers.find((c) => c.id === id);
  const filtered = customers.filter((c) => c.id !== id);
  if (filtered.length === customers.length) return false;

  localStorage.setItem(STORAGE_KEYS.customers, JSON.stringify(filtered));
  if (customer) {
    addActivityLog("customer_deleted", `Customer "${customer.name}" deleted`);
  }
  return true;
}

export function updateCustomerLastAccess(accessCode: string): void {
  const customers = getCustomers();
  const index = customers.findIndex((c) => c.accessCode === accessCode);
  if (index !== -1) {
    customers[index].lastAccess = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.customers, JSON.stringify(customers));
    addActivityLog("customer_login", `Customer "${customers[index].name}" logged in`);
  }
}

export function generateAccessCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "OPULANZ-";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// ============ OFFERING FUNCTIONS ============

export function getOfferings(): Offering[] {
  if (typeof window === "undefined") return [];
  initializeData();
  const data = localStorage.getItem(STORAGE_KEYS.offerings);
  return data ? JSON.parse(data) : [];
}

export function getOfferingById(id: string): Offering | undefined {
  const offerings = getOfferings();
  return offerings.find((o) => o.id === id);
}

export function createOffering(offering: Omit<Offering, "id">): Offering {
  const offerings = getOfferings();
  const newOffering: Offering = {
    ...offering,
    id: `spv-${Date.now()}`,
  };
  offerings.push(newOffering);
  localStorage.setItem(STORAGE_KEYS.offerings, JSON.stringify(offerings));
  addActivityLog("offering_created", `Property "${newOffering.title}" created`);
  return newOffering;
}

export function updateOffering(id: string, updates: Partial<Offering>): Offering | undefined {
  const offerings = getOfferings();
  const index = offerings.findIndex((o) => o.id === id);
  if (index === -1) return undefined;

  offerings[index] = { ...offerings[index], ...updates };
  localStorage.setItem(STORAGE_KEYS.offerings, JSON.stringify(offerings));
  addActivityLog("offering_updated", `Property "${offerings[index].title}" updated`);
  return offerings[index];
}

export function deleteOffering(id: string): boolean {
  const offerings = getOfferings();
  const offering = offerings.find((o) => o.id === id);
  const filtered = offerings.filter((o) => o.id !== id);
  if (filtered.length === offerings.length) return false;

  localStorage.setItem(STORAGE_KEYS.offerings, JSON.stringify(filtered));
  if (offering) {
    addActivityLog("offering_deleted", `Property "${offering.title}" deleted`);
  }
  return true;
}

// ============ ACTIVITY LOG FUNCTIONS ============

export function getActivityLog(): ActivityLog[] {
  if (typeof window === "undefined") return [];
  initializeData();
  const data = localStorage.getItem(STORAGE_KEYS.activityLog);
  return data ? JSON.parse(data) : [];
}

export function addActivityLog(type: ActivityLog["type"], description: string): void {
  if (typeof window === "undefined") return;

  const logs = getActivityLog();
  const newLog: ActivityLog = {
    id: `log-${Date.now()}`,
    type,
    description,
    timestamp: new Date().toISOString(),
  };

  // Keep only the last 50 logs
  const updatedLogs = [newLog, ...logs].slice(0, 50);
  localStorage.setItem(STORAGE_KEYS.activityLog, JSON.stringify(updatedLogs));
}

// ============ ADMIN AUTH ============

const ADMIN_ACCESS_CODE = "OPULANZ-ADMIN-2025";

export function validateAdminCode(code: string): boolean {
  return code === ADMIN_ACCESS_CODE;
}

// ============ STATS ============

export function getStats() {
  const customers = getCustomers();
  const offerings = getOfferings();

  return {
    totalCustomers: customers.length,
    activeCustomers: customers.filter((c) => c.status === "active").length,
    totalOfferings: offerings.length,
    openOfferings: offerings.filter((o) => o.status === "open" || o.status === "closing").length,
  };
}
