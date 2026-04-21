import { z } from 'zod';

const fileType = z.custom<File>((val) => {
  return typeof File !== 'undefined' && val instanceof File;
}, 'Must be a file');
export const whitelabelKYCSchema = z.object({
  // Personal Information
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  nationality: z.string().min(1, 'Nationality is required'),
  phoneNumber: z.string().min(10, 'Valid phone number required'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  postalCode: z.string().min(4, 'Postal code is required'),
  country: z.string().min(2, 'Country is required'),

  // Documents (simulated with file names)
  idDocument: z.array(fileType).min(1, 'ID document required'),
  selfie: z.array(fileType).min(1, 'Selfie required'),
  proofOfAddress: z.array(fileType).min(1, 'Proof of address required'),


  // Activity Information
  isPEP: z.boolean(),
  activityCountries: z.array(z.string()).min(1, 'Select at least one country'),
  expectedMonthlyVolume: z.string().min(1, 'Expected volume required'),
  sourceOfFunds: z.string().min(10, 'Please describe source of funds'),

  // Consents
  consentKYC: z.boolean().refine((val) => val === true, {
    message: 'You must consent to KYC verification',
  }),
  consentTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to terms and conditions',
  }),
});

export const whitelabelKYBSchema = z.object({
  // Company Information
  companyName: z.string().min(2, 'Company name is required'),
  registrationNumber: z.string().min(5, 'Registration number required'),
  dateOfIncorporation: z.string().min(1, 'Date of incorporation required'),
  legalForm: z.string().min(1, 'Legal form required'),
  companyAddress: z.string().min(5, 'Company address required'),
  companyCity: z.string().min(2, 'City is required'),
  companyPostalCode: z.string().min(4, 'Postal code is required'),
  companyCountry: z.string().min(2, 'Country is required'),

  // Documents
  statutes: z.array(z.instanceof(File)).min(1, 'Company statutes required'),
  registerExtract: z.array(z.instanceof(File)).min(1, 'Register extract required'),
  uboDeclaration: z.array(z.instanceof(File)).min(1, 'UBO declaration required'),

  // Business Activity
  businessActivity: z.string().min(10, 'Describe your business activity'),
  activityCountries: z.array(z.string()).min(1, 'Select at least one country'),
  expectedMonthlyVolume: z.string().min(1, 'Expected volume required'),

  // Consents
  consentKYB: z.boolean().refine((val) => val === true, {
    message: 'You must consent to KYB verification',
  }),
  consentTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to terms and conditions',
  }),
});

export type WhitelabelKYCFormData = z.infer<typeof whitelabelKYCSchema>;
export type WhitelabelKYBFormData = z.infer<typeof whitelabelKYBSchema>;
