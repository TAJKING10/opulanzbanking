// SPV Investment Data Layer
// Manages customers and offerings in localStorage

// ============ TYPES ============

export interface Document {
  id: string;
  name: string;
  type: "id" | "contract" | "kyc" | "prospectus" | "legal" | "financial" | "other";
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  url?: string; // For demo purposes, can store base64 or URL
}

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
  documents?: Document[];
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
  documents?: Document[];
}

export interface ActivityLog {
  id: string;
  type: "customer_login" | "customer_created" | "customer_updated" | "customer_deleted" | "offering_created" | "offering_updated" | "offering_deleted" | "admin_login" | "admin_created" | "admin_updated" | "admin_deleted" | "password_reset";
  description: string;
  timestamp: string;
  adminId?: string; // Track which admin performed the action
  adminName?: string;
}

export interface AdminProfile {
  id: string;
  name: string;
  email: string;
  accessCode: string;
  role: "primary" | "admin";
  status: "active" | "inactive";
  createdAt: string;
  lastLogin?: string;
  createdBy?: string; // ID of the admin who created this profile
}

// ============ STORAGE KEYS ============

const STORAGE_KEYS = {
  customers: "spv-customers",
  offerings: "spv-offerings",
  activityLog: "spv-activity-log",
  admins: "spv-admins",
  currentAdmin: "spv-current-admin",
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

const SEED_ADMINS: AdminProfile[] = [
  {
    id: "admin-primary",
    name: "Primary Administrator",
    email: "admin@opulanz.com",
    accessCode: "OPULANZ-ADMIN-2025",
    role: "primary",
    status: "active",
    createdAt: "2024-01-01T00:00:00Z",
    lastLogin: "2025-02-05T10:00:00Z",
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
  localStorage.setItem(STORAGE_KEYS.admins, JSON.stringify(SEED_ADMINS));
  localStorage.setItem(STORAGE_KEYS.activityLog, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.initialized, "true");
}

// Ensure admins are initialized (for existing users who already have data)
export function ensureAdminsInitialized(): void {
  if (typeof window === "undefined") return;

  const admins = localStorage.getItem(STORAGE_KEYS.admins);
  if (!admins) {
    localStorage.setItem(STORAGE_KEYS.admins, JSON.stringify(SEED_ADMINS));
  }
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

  // Automatically include current admin info if available
  const currentAdmin = getCurrentAdmin();

  const logs = getActivityLog();
  const newLog: ActivityLog = {
    id: `log-${Date.now()}`,
    type,
    description,
    timestamp: new Date().toISOString(),
    adminId: currentAdmin?.id,
    adminName: currentAdmin?.name,
  };

  // Keep only the last 100 logs
  const updatedLogs = [newLog, ...logs].slice(0, 100);
  localStorage.setItem(STORAGE_KEYS.activityLog, JSON.stringify(updatedLogs));
}

// ============ ADMIN PROFILE FUNCTIONS ============

export function getAdmins(): AdminProfile[] {
  if (typeof window === "undefined") return [];
  initializeData();
  ensureAdminsInitialized();
  const data = localStorage.getItem(STORAGE_KEYS.admins);
  return data ? JSON.parse(data) : [];
}

export function getAdminById(id: string): AdminProfile | undefined {
  const admins = getAdmins();
  return admins.find((a) => a.id === id);
}

export function getAdminByAccessCode(code: string): AdminProfile | undefined {
  const admins = getAdmins();
  return admins.find((a) => a.accessCode === code && a.status === "active");
}

export function getPrimaryAdmin(): AdminProfile | undefined {
  const admins = getAdmins();
  return admins.find((a) => a.role === "primary");
}

export function validateAdminCode(code: string): boolean {
  const admin = getAdminByAccessCode(code);
  return !!admin;
}

export function loginAdmin(code: string): AdminProfile | undefined {
  const admin = getAdminByAccessCode(code);
  if (admin) {
    // Update last login
    updateAdmin(admin.id, { lastLogin: new Date().toISOString() });
    // Set current admin in session
    sessionStorage.setItem(STORAGE_KEYS.currentAdmin, JSON.stringify(admin));
    addActivityLogWithAdmin("admin_login", `Admin "${admin.name}" logged in`, admin.id, admin.name);
    return admin;
  }
  return undefined;
}

export function getCurrentAdmin(): AdminProfile | null {
  if (typeof window === "undefined") return null;
  const data = sessionStorage.getItem(STORAGE_KEYS.currentAdmin);
  return data ? JSON.parse(data) : null;
}

export function logoutAdmin(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEYS.currentAdmin);
  sessionStorage.removeItem("spv-admin-access");
  sessionStorage.removeItem("spv-admin-expiry");
}

export function createAdmin(admin: Omit<AdminProfile, "id" | "createdAt">): AdminProfile | { error: string } {
  const currentAdmin = getCurrentAdmin();
  if (!currentAdmin || currentAdmin.role !== "primary") {
    return { error: "Only primary admin can create new admin profiles" };
  }

  // Check if access code already exists
  const existingAdmin = getAdminByAccessCode(admin.accessCode);
  if (existingAdmin) {
    return { error: "Access code already exists" };
  }

  const admins = getAdmins();
  const newAdmin: AdminProfile = {
    ...admin,
    id: `admin-${Date.now()}`,
    createdAt: new Date().toISOString(),
    createdBy: currentAdmin.id,
  };
  admins.push(newAdmin);
  localStorage.setItem(STORAGE_KEYS.admins, JSON.stringify(admins));
  addActivityLogWithAdmin("admin_created", `Admin "${newAdmin.name}" created by "${currentAdmin.name}"`, currentAdmin.id, currentAdmin.name);
  return newAdmin;
}

export function updateAdmin(id: string, updates: Partial<AdminProfile>): AdminProfile | undefined {
  const admins = getAdmins();
  const index = admins.findIndex((a) => a.id === id);
  if (index === -1) return undefined;

  // Prevent changing primary admin role to regular admin
  if (admins[index].role === "primary" && updates.role === "admin") {
    return undefined;
  }

  admins[index] = { ...admins[index], ...updates };
  localStorage.setItem(STORAGE_KEYS.admins, JSON.stringify(admins));

  // Update session if updating current admin
  const currentAdmin = getCurrentAdmin();
  if (currentAdmin && currentAdmin.id === id) {
    sessionStorage.setItem(STORAGE_KEYS.currentAdmin, JSON.stringify(admins[index]));
  }

  if (currentAdmin) {
    addActivityLogWithAdmin("admin_updated", `Admin "${admins[index].name}" updated`, currentAdmin.id, currentAdmin.name);
  }
  return admins[index];
}

export function deleteAdmin(id: string): boolean | { error: string } {
  const currentAdmin = getCurrentAdmin();
  if (!currentAdmin || currentAdmin.role !== "primary") {
    return { error: "Only primary admin can delete admin profiles" };
  }

  const admins = getAdmins();
  const admin = admins.find((a) => a.id === id);

  // Prevent deleting primary admin
  if (admin?.role === "primary") {
    return { error: "Cannot delete primary admin" };
  }

  // Prevent deleting self
  if (currentAdmin.id === id) {
    return { error: "Cannot delete your own profile" };
  }

  const filtered = admins.filter((a) => a.id !== id);
  if (filtered.length === admins.length) return false;

  localStorage.setItem(STORAGE_KEYS.admins, JSON.stringify(filtered));
  if (admin) {
    addActivityLogWithAdmin("admin_deleted", `Admin "${admin.name}" deleted by "${currentAdmin.name}"`, currentAdmin.id, currentAdmin.name);
  }
  return true;
}

export function resetAdminPassword(id: string): string | { error: string } {
  const currentAdmin = getCurrentAdmin();
  if (!currentAdmin || currentAdmin.role !== "primary") {
    return { error: "Only primary admin can reset passwords" };
  }

  const admins = getAdmins();
  const admin = admins.find((a) => a.id === id);
  if (!admin) {
    return { error: "Admin not found" };
  }

  // Generate new access code
  const newCode = generateAdminAccessCode();
  const index = admins.findIndex((a) => a.id === id);
  admins[index] = { ...admins[index], accessCode: newCode };
  localStorage.setItem(STORAGE_KEYS.admins, JSON.stringify(admins));

  addActivityLogWithAdmin("password_reset", `Password reset for admin "${admin.name}" by "${currentAdmin.name}"`, currentAdmin.id, currentAdmin.name);
  return newCode;
}

export function generateAdminAccessCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "OPULANZ-ADM-";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Activity log with admin tracking
export function addActivityLogWithAdmin(type: ActivityLog["type"], description: string, adminId?: string, adminName?: string): void {
  if (typeof window === "undefined") return;

  const logs = getActivityLog();
  const newLog: ActivityLog = {
    id: `log-${Date.now()}`,
    type,
    description,
    timestamp: new Date().toISOString(),
    adminId,
    adminName,
  };

  // Keep only the last 100 logs
  const updatedLogs = [newLog, ...logs].slice(0, 100);
  localStorage.setItem(STORAGE_KEYS.activityLog, JSON.stringify(updatedLogs));
}

// Get activity logs filtered by admin
export function getActivityLogByAdmin(adminId: string): ActivityLog[] {
  const logs = getActivityLog();
  return logs.filter((log) => log.adminId === adminId);
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

// ============ DOCUMENT FUNCTIONS ============

export function generateDocumentId(): string {
  return `doc-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Customer Document Functions
export function addCustomerDocument(customerId: string, doc: Omit<Document, "id" | "uploadedAt">): Document | undefined {
  const customers = getCustomers();
  const index = customers.findIndex((c) => c.id === customerId);
  if (index === -1) return undefined;

  const newDoc: Document = {
    ...doc,
    id: generateDocumentId(),
    uploadedAt: new Date().toISOString(),
  };

  if (!customers[index].documents) {
    customers[index].documents = [];
  }
  customers[index].documents!.push(newDoc);
  localStorage.setItem(STORAGE_KEYS.customers, JSON.stringify(customers));
  addActivityLog("customer_updated", `Document "${newDoc.name}" added to customer "${customers[index].name}"`);
  return newDoc;
}

export function updateCustomerDocument(customerId: string, docId: string, updates: Partial<Document>): Document | undefined {
  const customers = getCustomers();
  const custIndex = customers.findIndex((c) => c.id === customerId);
  if (custIndex === -1 || !customers[custIndex].documents) return undefined;

  const docIndex = customers[custIndex].documents!.findIndex((d) => d.id === docId);
  if (docIndex === -1) return undefined;

  customers[custIndex].documents![docIndex] = { ...customers[custIndex].documents![docIndex], ...updates };
  localStorage.setItem(STORAGE_KEYS.customers, JSON.stringify(customers));
  addActivityLog("customer_updated", `Document updated for customer "${customers[custIndex].name}"`);
  return customers[custIndex].documents![docIndex];
}

export function deleteCustomerDocument(customerId: string, docId: string): boolean {
  const customers = getCustomers();
  const custIndex = customers.findIndex((c) => c.id === customerId);
  if (custIndex === -1 || !customers[custIndex].documents) return false;

  const docIndex = customers[custIndex].documents!.findIndex((d) => d.id === docId);
  if (docIndex === -1) return false;

  const docName = customers[custIndex].documents![docIndex].name;
  customers[custIndex].documents!.splice(docIndex, 1);
  localStorage.setItem(STORAGE_KEYS.customers, JSON.stringify(customers));
  addActivityLog("customer_updated", `Document "${docName}" removed from customer "${customers[custIndex].name}"`);
  return true;
}

// Offering Document Functions
export function addOfferingDocument(offeringId: string, doc: Omit<Document, "id" | "uploadedAt">): Document | undefined {
  const offerings = getOfferings();
  const index = offerings.findIndex((o) => o.id === offeringId);
  if (index === -1) return undefined;

  const newDoc: Document = {
    ...doc,
    id: generateDocumentId(),
    uploadedAt: new Date().toISOString(),
  };

  if (!offerings[index].documents) {
    offerings[index].documents = [];
  }
  offerings[index].documents!.push(newDoc);
  localStorage.setItem(STORAGE_KEYS.offerings, JSON.stringify(offerings));
  addActivityLog("offering_updated", `Document "${newDoc.name}" added to property "${offerings[index].title}"`);
  return newDoc;
}

export function updateOfferingDocument(offeringId: string, docId: string, updates: Partial<Document>): Document | undefined {
  const offerings = getOfferings();
  const offIndex = offerings.findIndex((o) => o.id === offeringId);
  if (offIndex === -1 || !offerings[offIndex].documents) return undefined;

  const docIndex = offerings[offIndex].documents!.findIndex((d) => d.id === docId);
  if (docIndex === -1) return undefined;

  offerings[offIndex].documents![docIndex] = { ...offerings[offIndex].documents![docIndex], ...updates };
  localStorage.setItem(STORAGE_KEYS.offerings, JSON.stringify(offerings));
  addActivityLog("offering_updated", `Document updated for property "${offerings[offIndex].title}"`);
  return offerings[offIndex].documents![docIndex];
}

export function deleteOfferingDocument(offeringId: string, docId: string): boolean {
  const offerings = getOfferings();
  const offIndex = offerings.findIndex((o) => o.id === offeringId);
  if (offIndex === -1 || !offerings[offIndex].documents) return false;

  const docIndex = offerings[offIndex].documents!.findIndex((d) => d.id === docId);
  if (docIndex === -1) return false;

  const docName = offerings[offIndex].documents![docIndex].name;
  offerings[offIndex].documents!.splice(docIndex, 1);
  localStorage.setItem(STORAGE_KEYS.offerings, JSON.stringify(offerings));
  addActivityLog("offering_updated", `Document "${docName}" removed from property "${offerings[offIndex].title}"`);
  return true;
}
