import { z } from 'zod';
import { commonPersonFields, addressFields, consentFields, businessActivityFields, fileFields, pepField } from './common-fields';

export const whitelabelKYCSchema = z.object({
  // Personal Information
  ...commonPersonFields,
  phoneNumber: commonPersonFields.phone,
  address: z.string().min(5, 'Address is required'),
  ...addressFields,

  // Documents (simulated with file names)
  idDocument: fileFields.singleFile.refine(() => true, { message: 'ID document required' }),
  selfie: fileFields.singleFile.refine(() => true, { message: 'Selfie required' }),
  proofOfAddress: fileFields.singleFile.refine(() => true, { message: 'Proof of address required' }),

  // Activity Information
  ...pepField,
  activityCountries: z.array(z.string()).min(1, 'Select at least one country'),
  expectedMonthlyVolume: z.string().min(1, 'Expected volume required'),
  sourceOfFunds: z.string().min(10, 'Please describe source of funds'),

  // Consents
  consentKYC: consentFields.terms.refine((val) => val === true, {
    message: 'You must consent to KYC verification',
  }),
  consentTerms: consentFields.terms,
});

export const whitelabelKYBSchema = z.object({
  // Company Information
  companyName: z.string().min(2, 'Company name is required'),
  registrationNumber: z.string().min(5, 'Registration number required'),
  dateOfIncorporation: z.string().min(1, 'Date of incorporation required'),
  legalForm: z.string().min(1, 'Legal form required'),
  companyAddress: z.string().min(5, 'Company address required'),
  companyCity: addressFields.city,
  companyPostalCode: addressFields.postal,
  companyCountry: addressFields.country,

  // Documents
  statutes: fileFields.singleFile.refine(() => true, { message: 'Company statutes required' }),
  registerExtract: fileFields.singleFile.refine(() => true, { message: 'Register extract required' }),
  uboDeclaration: fileFields.singleFile.refine(() => true, { message: 'UBO declaration required' }),

  // Business Activity
  ...businessActivityFields,

  // Consents
  consentKYB: consentFields.terms.refine((val) => val === true, {
    message: 'You must consent to KYB verification',
  }),
  consentTerms: consentFields.terms,
});

export type WhitelabelKYCFormData = z.infer<typeof whitelabelKYCSchema>;
export type WhitelabelKYBFormData = z.infer<typeof whitelabelKYBSchema>;
