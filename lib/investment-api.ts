// Investment API Service
// Connects to the Azure PostgreSQL backend for investment portal data

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ============ TYPES ============

export interface AdminProfile {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: "primary" | "admin";
  status: "active" | "inactive";
  permissions?: Record<string, boolean>;
  last_login?: string;
  created_at: string;
  updated_at?: string;
}

export interface Investor {
  id: number;
  access_code: string;
  name: string;
  email: string;
  phone?: string;
  investor_type: "institutional" | "professional" | "private";
  profile_type: "existing" | "new";
  status: "active" | "inactive";
  company_name?: string;
  address?: Record<string, string>;
  notes?: string;
  total_invested?: number;
  last_access?: string;
  created_by?: number;
  created_at: string;
  updated_at?: string;
}

export interface Property {
  id: number;
  title: string;
  location: string;
  property_type: string;
  status: "open" | "closing" | "closed" | "coming";
  description?: string;
  features?: string[];
  images?: string[];
  size?: string;
  year_built?: string;
  total_value?: number;
  total_shares?: number;
  min_investment?: number;
  target_return?: string;
  investment_term?: string;
  distribution_frequency?: string;
  bank_name?: string;
  bank_iban?: string;
  bank_bic?: string;
  bank_reference?: string;
  documents?: Document[];
  created_by?: number;
  created_at: string;
  updated_at?: string;
}

export interface ActivityLog {
  id: number;
  log_type: string;
  description: string;
  admin_id?: number;
  admin_name?: string;
  investor_id?: number;
  property_id?: number;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface DashboardStats {
  totalInvestors: number;
  activeInvestors: number;
  totalProperties: number;
  openProperties: number;
  totalAdmins: number;
  recentActivity: ActivityLog[];
}

// ============ ADMIN AUTH API ============

export async function loginAdmin(accessCode: string): Promise<AdminProfile | null> {
  try {
    const response = await fetch(`${API_BASE}/api/investment/admins/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessCode }),
    });

    const data = await response.json();

    if (data.success && data.data) {
      // Store admin data in sessionStorage
      sessionStorage.setItem('spv-admin-data', JSON.stringify(data.data));
      sessionStorage.setItem('spv-admin-access', 'granted');
      sessionStorage.setItem('spv-admin-timestamp', Date.now().toString());
      return data.data;
    }
    return null;
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
}

export function getCurrentAdmin(): AdminProfile | null {
  if (typeof window === 'undefined') return null;
  const adminData = sessionStorage.getItem('spv-admin-data');
  if (!adminData) return null;

  // Check session expiry (24 hours)
  const timestamp = sessionStorage.getItem('spv-admin-timestamp');
  if (timestamp && Date.now() - parseInt(timestamp) > 24 * 60 * 60 * 1000) {
    logoutAdmin();
    return null;
  }

  try {
    return JSON.parse(adminData);
  } catch {
    return null;
  }
}

export function logoutAdmin(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem('spv-admin-data');
  sessionStorage.removeItem('spv-admin-access');
  sessionStorage.removeItem('spv-admin-timestamp');
}

// ============ ADMINS API ============

export async function getAdmins(): Promise<AdminProfile[]> {
  try {
    const response = await fetch(`${API_BASE}/api/investment/admins`);
    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Error fetching admins:', error);
    return [];
  }
}

export async function getAdminById(id: number): Promise<AdminProfile | null> {
  try {
    const response = await fetch(`${API_BASE}/api/investment/admins/${id}`);
    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Error fetching admin:', error);
    return null;
  }
}

export async function createAdmin(admin: {
  name: string;
  email: string;
  phone?: string;
  role?: string;
  permissions?: Record<string, boolean>;
  createdBy?: number;
}): Promise<{ success: boolean; data?: AdminProfile; accessCode?: string; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/api/investment/admins`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(admin),
    });
    const data = await response.json();
    return {
      success: data.success,
      data: data.data,
      accessCode: data.data?.access_code,
      error: data.error,
    };
  } catch (error) {
    console.error('Error creating admin:', error);
    return { success: false, error: 'Network error' };
  }
}

export async function updateAdmin(id: number, updates: Partial<AdminProfile & { updatedBy?: number }>): Promise<AdminProfile | null> {
  try {
    const response = await fetch(`${API_BASE}/api/investment/admins/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Error updating admin:', error);
    return null;
  }
}

export async function deleteAdmin(id: number, deletedBy?: number): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/api/investment/admins/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deletedBy }),
    });
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error deleting admin:', error);
    return false;
  }
}

export async function resetAdminPassword(id: number, resetBy?: number): Promise<{ success: boolean; accessCode?: string }> {
  try {
    const response = await fetch(`${API_BASE}/api/investment/admins/${id}/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resetBy }),
    });
    const data = await response.json();
    return {
      success: data.success,
      accessCode: data.data?.access_code,
    };
  } catch (error) {
    console.error('Error resetting admin password:', error);
    return { success: false };
  }
}

// ============ INVESTORS API ============

export async function getInvestors(params?: {
  status?: string;
  investor_type?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ data: Investor[]; total: number }> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.investor_type) searchParams.append('investor_type', params.investor_type);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());

    const response = await fetch(`${API_BASE}/api/investment/investors?${searchParams}`);
    const data = await response.json();
    return {
      data: data.success ? data.data : [],
      total: data.pagination?.total || 0,
    };
  } catch (error) {
    console.error('Error fetching investors:', error);
    return { data: [], total: 0 };
  }
}

export async function getInvestorById(id: number): Promise<Investor | null> {
  try {
    const response = await fetch(`${API_BASE}/api/investment/investors/${id}`);
    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Error fetching investor:', error);
    return null;
  }
}

export async function createInvestor(investor: {
  name: string;
  email: string;
  phone?: string;
  investor_type?: string;
  profile_type?: string;
  company_name?: string;
  address?: Record<string, string>;
  notes?: string;
  createdBy?: number;
}): Promise<{ success: boolean; data?: Investor; accessCode?: string; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/api/investment/investors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(investor),
    });
    const data = await response.json();
    return {
      success: data.success,
      data: data.data,
      accessCode: data.data?.access_code,
      error: data.error,
    };
  } catch (error) {
    console.error('Error creating investor:', error);
    return { success: false, error: 'Network error' };
  }
}

export async function updateInvestor(id: number, updates: Partial<Investor & { updatedBy?: number }>): Promise<Investor | null> {
  try {
    const response = await fetch(`${API_BASE}/api/investment/investors/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Error updating investor:', error);
    return null;
  }
}

export async function deleteInvestor(id: number, deletedBy?: number): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/api/investment/investors/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deletedBy }),
    });
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error deleting investor:', error);
    return false;
  }
}

export async function resetInvestorAccessCode(id: number, resetBy?: number): Promise<{ success: boolean; accessCode?: string }> {
  try {
    const response = await fetch(`${API_BASE}/api/investment/investors/${id}/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resetBy }),
    });
    const data = await response.json();
    return {
      success: data.success,
      accessCode: data.data?.access_code,
    };
  } catch (error) {
    console.error('Error resetting investor access code:', error);
    return { success: false };
  }
}

// ============ PROPERTIES API ============

export async function getProperties(params?: {
  status?: string;
  property_type?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ data: Property[]; total: number }> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.property_type) searchParams.append('property_type', params.property_type);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());

    const response = await fetch(`${API_BASE}/api/investment/properties?${searchParams}`);
    const data = await response.json();
    return {
      data: data.success ? data.data : [],
      total: data.pagination?.total || 0,
    };
  } catch (error) {
    console.error('Error fetching properties:', error);
    return { data: [], total: 0 };
  }
}

export async function getPropertyById(id: number): Promise<Property | null> {
  try {
    const response = await fetch(`${API_BASE}/api/investment/properties/${id}`);
    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Error fetching property:', error);
    return null;
  }
}

export async function createProperty(property: {
  title: string;
  location: string;
  property_type: string;
  status?: string;
  description?: string;
  features?: string[];
  images?: string[];
  size?: string;
  year_built?: string;
  total_value?: number;
  total_shares?: number;
  min_investment?: number;
  target_return?: string;
  investment_term?: string;
  distribution_frequency?: string;
  bank_name?: string;
  bank_iban?: string;
  bank_bic?: string;
  bank_reference?: string;
  createdBy?: number;
}): Promise<{ success: boolean; data?: Property; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/api/investment/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(property),
    });
    const data = await response.json();
    return {
      success: data.success,
      data: data.data,
      error: data.error,
    };
  } catch (error) {
    console.error('Error creating property:', error);
    return { success: false, error: 'Network error' };
  }
}

export async function updateProperty(id: number, updates: Partial<Property & { updatedBy?: number }>): Promise<Property | null> {
  try {
    const response = await fetch(`${API_BASE}/api/investment/properties/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Error updating property:', error);
    return null;
  }
}

export async function deleteProperty(id: number, deletedBy?: number): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/api/investment/properties/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deletedBy }),
    });
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error deleting property:', error);
    return false;
  }
}

// ============ ACTIVITY & STATS API ============

export async function getActivityLog(params?: {
  admin_id?: number;
  log_type?: string;
  limit?: number;
  offset?: number;
}): Promise<{ data: ActivityLog[]; total: number }> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.admin_id) searchParams.append('admin_id', params.admin_id.toString());
    if (params?.log_type) searchParams.append('log_type', params.log_type);
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());

    const response = await fetch(`${API_BASE}/api/investment/activity?${searchParams}`);
    const data = await response.json();
    return {
      data: data.success ? data.data : [],
      total: data.pagination?.total || 0,
    };
  } catch (error) {
    console.error('Error fetching activity log:', error);
    return { data: [], total: 0 };
  }
}

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const response = await fetch(`${API_BASE}/api/investment/activity/stats`);
    const data = await response.json();
    return data.success ? data.data : {
      totalInvestors: 0,
      activeInvestors: 0,
      totalProperties: 0,
      openProperties: 0,
      totalAdmins: 0,
      recentActivity: [],
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return {
      totalInvestors: 0,
      activeInvestors: 0,
      totalProperties: 0,
      openProperties: 0,
      totalAdmins: 0,
      recentActivity: [],
    };
  }
}

// ============ INVESTOR LOGIN API ============

export async function loginInvestor(accessCode: string): Promise<Investor | null> {
  try {
    const response = await fetch(`${API_BASE}/api/investment/investors/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessCode }),
    });

    const data = await response.json();

    if (data.success && data.data) {
      sessionStorage.setItem('spv-investor-data', JSON.stringify(data.data));
      sessionStorage.setItem('spv-access', 'granted');
      sessionStorage.setItem('spv-timestamp', Date.now().toString());
      return data.data;
    }
    return null;
  } catch (error) {
    console.error('Investor login error:', error);
    return null;
  }
}

export function getCurrentInvestor(): Investor | null {
  if (typeof window === 'undefined') return null;
  const investorData = sessionStorage.getItem('spv-investor-data');
  if (!investorData) return null;

  const timestamp = sessionStorage.getItem('spv-timestamp');
  if (timestamp && Date.now() - parseInt(timestamp) > 24 * 60 * 60 * 1000) {
    logoutInvestor();
    return null;
  }

  try {
    return JSON.parse(investorData);
  } catch {
    return null;
  }
}

export function logoutInvestor(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem('spv-investor-data');
  sessionStorage.removeItem('spv-access');
  sessionStorage.removeItem('spv-timestamp');
}
