# Company Formation Feature (Lot 1)

## Purpose
Luxembourg entity creation wizard for different legal forms.

## Supported Entity Types
- SARL (Private Limited Company)
- SA (Public Limited Company)
- SCSp (Special Limited Partnership)

## Wizard Steps
1. **Company Details** - Name, address, activity
2. **Shareholders** - UBO information, ownership structure
3. **Share Capital** - Capital amount, distribution
4. **Payment** - Fee payment
5. **Confirmation** - Summary and submission

## Key Features
- 5-step wizard with progress tracking
- Save & resume functionality
- Document upload for incorporation
- Real-time validation

## Related Routes
- `/[locale]/company-formation` - Formation wizard

## Dependencies
- Form validation (Zod)
- File upload components
- Payment integration (future)
