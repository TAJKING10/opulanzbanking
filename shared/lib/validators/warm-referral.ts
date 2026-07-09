import { z } from 'zod';
import { commonPersonFields, consentFields } from './common-fields';

export const warmReferralSchema = z.object({
  email: commonPersonFields.email,
  clientType: z.enum(['individual', 'company']),
  country: z.enum(['FR', 'LU']),
  legalForm: z.string().optional(),
  expectedVolume: z.string().min(1, 'Please select expected volume'),
  consentDataSharing: consentFields.dataSharing,
  consentTerms: consentFields.terms,
  consentPartner: consentFields.terms.refine((val) => val === true, {
    message: 'You must acknowledge partner account opening',
  }),
});

export type WarmReferralFormData = z.infer<typeof warmReferralSchema>;
