# Account Opening Feature

## Purpose
All account opening flows including Individual KYC, Company KYB, and Warm Referral.

## Sub-features

### Individual (Lot 0.2)
Personal account opening with full KYC:
- Personal information form
- Document upload (ID, selfie, proof of address)
- PEP declaration
- Status tracking (Form → Submitted → Approved)

### Company
Business account opening with KYB process:
- Company information
- UBO declarations
- Corporate documents

### Warm Referral (Lot 0.1)
Partner matching and referral flow:
- 3-step flow: Form → Handoff → Thank You
- Partner matching logic
- Consent capture

## Related Routes
- `/[locale]/open-account` - Account type selection
- `/[locale]/open-account/individual` - Individual KYC
- `/[locale]/open-account/company` - Company KYB
- `/[locale]/open-account/warm-referral` - Warm referral flow

## Components
- Form components (FileDropzone, ConsentCheckbox)
- Status indicators
- Multi-step wizards
