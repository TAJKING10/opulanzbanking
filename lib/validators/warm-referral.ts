import { z } from 'zod';

export const warmReferralSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  clientType: z.enum(['individual', 'company']),
  country: z.enum(['FR', 'LU']),
  legalForm: z.string().optional(),
  expectedVolume: z.string().min(1, 'Please select expected volume'),
  consentDataSharing: z.boolean().refine((val) => val === true, {
    message: 'You must consent to data sharing',
  }),
  consentTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to terms and conditions',
  }),
  consentPartner: z.boolean().refine((val) => val === true, {
    message: 'You must acknowledge partner account opening',
  }),
});

export type WarmReferralFormData = z.infer<typeof warmReferralSchema>;
