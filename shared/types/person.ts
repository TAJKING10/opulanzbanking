/**
 * Shared Person Type Definitions
 * Consolidates duplicate person interfaces across the codebase
 */

/**
 * Base person with minimal required fields
 * Used for simple contact forms and minimal person data
 */
export interface BasePerson {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

/**
 * Extended person with full identification details
 * Used for KYC/KYB processes, company formation, account opening
 */
export interface DetailedPerson extends BasePerson {
  dob: string;
  nationality: string;
  address: string;
  isPep?: boolean;
}

/**
 * Person with role designation
 * Used in accounting and business contexts
 */
export interface PersonWithRole extends BasePerson {
  role: string;
}

/**
 * Company shareholder with ownership information
 * Used in company formation and business account opening
 */
export interface Shareholder extends DetailedPerson {
  sharePercent: number;
  roles: PersonRole[];
}

/**
 * Company director or manager
 * Used in company formation (SA, SARL structures)
 */
export interface DirectorOrManager extends DetailedPerson {
  roles: PersonRole[];
}

/**
 * Ultimate Beneficial Owner (UBO)
 * Used for compliance and regulatory requirements
 */
export interface UBO extends DetailedPerson {
  ownership?: string;
  roles: PersonRole[];
}

/**
 * Director or UBO for business account opening
 * Simplified version for account opening forms
 */
export interface DirectorOrUBO {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  ownership?: string;
  role?: "director" | "ubo" | "both";
}

/**
 * Person role types used in company formation
 */
export type PersonRole = "DIRECTOR" | "MANAGER" | "UBO" | "FOUNDER" | "SHAREHOLDER";

/**
 * Address structure for person or company
 */
export interface Address {
  street: string;
  city: string;
  postal: string;
  country: string;
}

/**
 * Person with address block (used in accounting)
 */
export interface PersonWithAddress extends BasePerson {
  role: string;
  address?: Address;
}
