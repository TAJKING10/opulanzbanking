/**
 * Common Zod Validation Fields
 * Reusable validation schemas to eliminate duplication across forms
 */

import { z } from 'zod';

/**
 * Common person identification fields
 * Used in KYC, KYB, account opening, and company formation
 */
export const commonPersonFields = {
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Valid phone number required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  nationality: z.string().min(1, "Nationality is required"),
};

/**
 * Address validation fields
 */
export const addressFields = {
  street: z.string().min(1, "Street address is required"),
  city: z.string().min(2, "City is required"),
  postal: z.string().min(4, "Postal code is required"),
  country: z.string().min(2, "Country is required"),
};

/**
 * Extended address fields with optional apartment/unit
 */
export const detailedAddressFields = {
  ...addressFields,
  apartment: z.string().optional(),
  state: z.string().optional(),
};

/**
 * Contact information fields
 */
export const contactFields = {
  email: z.string().email("Invalid email address"),
  countryCode: z.string().min(1, "Country code is required"),
  mobile: z.string().min(6, "Invalid phone number"),
  phone: z.string().min(10, "Valid phone number required"),
};

/**
 * Tax residency fields
 */
export const taxFields = {
  taxCountry: z.string().min(1, "Tax residency is required"),
  taxId: z.string().optional(),
};

/**
 * Complete person schema builder
 * Creates a full person validation schema with optional fields
 */
export const createPersonSchema = (options: {
  requireAddress?: boolean;
  requireDob?: boolean;
  requireNationality?: boolean;
  requirePhone?: boolean;
} = {}) => {
  const baseSchema = {
    firstName: commonPersonFields.firstName,
    lastName: commonPersonFields.lastName,
    email: commonPersonFields.email,
  };

  if (options.requirePhone) {
    Object.assign(baseSchema, { phone: commonPersonFields.phone });
  }

  if (options.requireDob) {
    Object.assign(baseSchema, { dateOfBirth: commonPersonFields.dateOfBirth });
  }

  if (options.requireNationality) {
    Object.assign(baseSchema, { nationality: commonPersonFields.nationality });
  }

  if (options.requireAddress) {
    Object.assign(baseSchema, addressFields);
  }

  return z.object(baseSchema);
};

/**
 * Company basic fields
 */
export const companyFields = {
  companyName: z.string().min(2, "Company name is required"),
  registrationNumber: z.string().min(5, "Registration number required"),
  legalForm: z.string().min(1, "Legal form required"),
};

/**
 * Company with address
 */
export const companyWithAddressFields = {
  ...companyFields,
  companyAddress: z.string().min(5, "Company address required"),
  companyCity: z.string().min(2, "City is required"),
  companyPostalCode: z.string().min(4, "Postal code is required"),
  companyCountry: z.string().min(2, "Country is required"),
};

/**
 * Business activity fields
 */
export const businessActivityFields = {
  businessActivity: z.string().min(10, "Describe your business activity"),
  activityCountries: z.array(z.string()).min(1, "Select at least one country"),
  expectedMonthlyVolume: z.string().min(1, "Expected volume required"),
};

/**
 * File upload validation
 */
export const fileFields = {
  singleFile: z.array(z.instanceof(File)).min(1, "File is required"),
  optionalFile: z.array(z.instanceof(File)).optional(),
  multipleFiles: z.array(z.instanceof(File)).min(1, "At least one file required"),
};

/**
 * Consent fields (must be true)
 */
export const consentFields = {
  terms: z.boolean().refine((val) => val === true, {
    message: "You must agree to terms and conditions",
  }),
  dataProcessing: z.boolean().refine((val) => val === true, {
    message: "You must consent to data processing",
  }),
  dataSharing: z.boolean().refine((val) => val === true, {
    message: "You must authorize data sharing",
  }),
};

/**
 * Optional marketing consent
 */
export const marketingConsentField = {
  marketingOptIn: z.boolean().optional(),
};

/**
 * PEP (Politically Exposed Person) declaration
 */
export const pepField = {
  isPEP: z.boolean(),
};

/**
 * Source of funds fields
 */
export const sourceOfFundsFields = {
  sourceOfFunds: z.string().min(10, "Please describe source of funds"),
};
