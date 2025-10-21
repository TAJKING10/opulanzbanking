# Dashboard Feature

## Purpose
User account dashboard with balance, transactions, and application tracking.

## Components
- `timeline.tsx` - Application timeline tracker
- `status-chip.tsx` - Status indicators (pending, approved, rejected)
- Account balance card
- Quick actions menu
- Recent transactions list

## Dashboard Sections
1. **Account Overview**
   - Current balance
   - Account number/IBAN
   - Account status

2. **Quick Actions**
   - Transfer money
   - Add beneficiary
   - Download statements
   - Update profile

3. **Recent Transactions**
   - Transaction history
   - Filters and search
   - Export functionality

4. **Application Timeline**
   - KYC/KYB status
   - Company formation progress
   - Service applications

## Related Routes
- `/[locale]/dashboard` - Main dashboard
- `/[locale]/dashboard/transactions` - Transaction history
- `/[locale]/dashboard/profile` - User profile

## Future Enhancements
- Real-time balance updates
- Advanced transaction filtering
- Chart visualizations
- Notification center
