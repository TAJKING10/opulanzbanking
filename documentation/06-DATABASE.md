# 06 — Database (Azure PostgreSQL)

## Connection Details

| Setting | Value |
|---------|-------|
| Host | `opulanz-pg.postgres.database.azure.com` |
| Port | `5432` |
| Database | `postgres` |
| Username | `opulanz_admin` |
| Password | `Advensys2025Secure!` |
| SSL | Required (Azure enforces it) |

---

## How to Connect Locally

Use any PostgreSQL client:

### Option 1: pgAdmin (GUI)
1. Download pgAdmin from https://www.pgadmin.org/download/
2. Open pgAdmin → Add New Server
3. Fill in the connection details above
4. Enable SSL under "SSL" tab

### Option 2: psql (Command Line)
```bash
psql "host=opulanz-pg.postgres.database.azure.com port=5432 dbname=postgres user=opulanz_admin password=Advensys2025Secure! sslmode=require"
```

---

## All Database Tables

### 1. `users`
Stores registered users and their authentication info.

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PRIMARY KEY | Auto-increment ID |
| email | VARCHAR(255) UNIQUE | User email |
| password_hash | VARCHAR | Bcrypt hashed password |
| first_name | VARCHAR(100) | First name |
| last_name | VARCHAR(100) | Last name |
| role | VARCHAR(50) | `user`, `admin` |
| google_id | VARCHAR | Google OAuth ID |
| totp_secret | VARCHAR | 2FA secret |
| created_at | TIMESTAMP | Creation date |
| updated_at | TIMESTAMP | Last update |

### 2. `applications`
KYC (individual) and KYB (company) applications.

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PRIMARY KEY | Auto-increment ID |
| type | VARCHAR(50) | `individual`, `company`, `company_formation` |
| status | VARCHAR(50) | `draft`, `submitted`, `under_review`, `approved`, `rejected` |
| payload | JSONB | All form data as JSON |
| narvi_customer_id | VARCHAR | Narvi banking reference |
| narvi_company_id | VARCHAR | Narvi company reference |
| rejection_reason | TEXT | Why rejected (if applicable) |
| approved_at | TIMESTAMP | Approval timestamp |
| rejected_at | TIMESTAMP | Rejection timestamp |
| created_at | TIMESTAMP | Submission date |

### 3. `documents`
Uploaded and generated documents.

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PRIMARY KEY | Auto-increment ID |
| application_id | INTEGER | FK to `applications` |
| type | VARCHAR(50) | `kyc_questionnaire`, `mission_letter`, `id_document`, etc. |
| filename | VARCHAR | File name |
| url | TEXT | Azure Blob Storage URL |
| docusign_envelope_id | VARCHAR | DocuSign envelope reference |
| docusign_status | VARCHAR | `sent`, `delivered`, `completed`, `declined` |
| signed_document_url | TEXT | URL of signed document |
| sent_for_signature_at | TIMESTAMP | When sent to DocuSign |
| signed_at | TIMESTAMP | When signed |
| created_at | TIMESTAMP | Upload date |

### 4. `companies`
Company profiles (from KYB and formation).

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PRIMARY KEY | Auto-increment ID |
| name | VARCHAR(255) | Company name |
| registration_number | VARCHAR(100) | Company registration number |
| country | VARCHAR(2) | 2-letter country code |
| legal_form | VARCHAR(100) | SARL, SA, etc. |
| incorporation_date | DATE | Date of incorporation |
| registered_address | JSONB | Full address as JSON |
| narvi_company_id | VARCHAR | Narvi reference |
| created_at | TIMESTAMP | Creation date |

### 5. `appointments`
All scheduled appointments (all services).

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PRIMARY KEY | Auto-increment ID |
| type | VARCHAR(50) | `tax_advisory`, `life_insurance`, `investment_advisory` |
| status | VARCHAR(50) | `pending`, `confirmed`, `cancelled` |
| confirmation_number | VARCHAR | Unique confirmation code (e.g., `OPZ-20260707-XXXX`) |
| customer_info | JSONB | Name, email, phone |
| service | JSONB | Service details, price |
| appointment | JSONB | Date, time, Calendly URLs |
| payment | JSONB | PayPal order ID, status, amount |
| notes | TEXT | Additional info / full KYC profile JSON |
| created_at | TIMESTAMP | Booking date |

### 6. `tax_advisory_bookings`
Dedicated table for tax advisory bookings.

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PRIMARY KEY | Auto-increment ID |
| confirmation_number | VARCHAR | Unique code |
| type | VARCHAR | `tax_advisory` |
| status | VARCHAR | `confirmed`, `pending`, `cancelled` |
| customer_info | JSONB | Contact details |
| appointment | JSONB | Calendly event data |
| payment | JSONB | Payment info |
| created_at | TIMESTAMP | Booking date |

### 7. `life_insurance_bookings`
Dedicated table for life insurance bookings.

Same structure as `tax_advisory_bookings` with `type = 'life_insurance'`.

### 8. `investment_admins`
Admins for the SPV investment portal.

### 9. `investment_investors`
Investors registered in the SPV portal.

### 10. `investment_properties`
Properties listed in the SPV portal.

### 11. `investments`
Investment records (who invested in what property).

### 12. `investment_activity_logs`
Activity log for all investment actions.

### 13. `investment_inquiries`
Contact form submissions from the investment portal.

### 14. `auth_sessions`
Active login sessions and refresh tokens.

### 15. `otps`
One-time passwords for 2FA and verification.

---

## Running Migrations

```bash
cd C:\Users\Toufi\AndroidStudioProjects\azuree\backend

# Run ALL migrations (creates all tables)
node src/migrations/run-all-migrations.js

# Run single migration
node src/migrations/run-migration.js 001_create_users_table.sql
```

Migration files are in:
`backend/src/migrations/*.sql`

---

## Database Backup

From Azure Portal:
1. Go to Azure Portal → `opulanz-pg` PostgreSQL server
2. Click "Backup" in left menu
3. Azure auto-backs up daily. Retention: 7 days.

Manual backup:
```bash
pg_dump "host=opulanz-pg.postgres.database.azure.com port=5432 dbname=postgres user=opulanz_admin password=Advensys2025Secure! sslmode=require" > backup.sql
```
