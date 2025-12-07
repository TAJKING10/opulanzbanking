# Opulanz Banking Platform - Environment Configuration
## For Azure Deployment

**Date:** December 1, 2025
**Project:** Opulanz Banking Platform
**Environment:** Production (Azure)

---

## 📋 Table of Contents
1. [Backend Environment Variables](#backend-environment-variables)
2. [Frontend Environment Variables](#frontend-environment-variables)
3. [Azure Resources](#azure-resources)
4. [Security Notes](#security-notes)
5. [Deployment Checklist](#deployment-checklist)

---

## 🔧 Backend Environment Variables

### File Location: `backend/.env`

```bash
# =================================================================
# Opulanz Banking Platform - Backend Environment Configuration
# =================================================================

# ---------------------------
# Server Configuration
# ---------------------------
PORT=5000
NODE_ENV=production

# ---------------------------
# Azure PostgreSQL Database
# ---------------------------
DB_HOST=opulanz-pg.postgres.database.azure.com
DB_USER=opulanz_admin
DB_PASSWORD=Advensys2025Secure!
DB_NAME=postgres
DB_PORT=5432

# Alternative Connection String Format:
# DATABASE_URL=postgresql://opulanz_admin:Advensys2025Secure!@opulanz-pg.postgres.database.azure.com:5432/postgres?sslmode=require

# ---------------------------
# CORS Configuration
# ---------------------------
# For Azure deployment, update this to your actual frontend URL
# Example: https://opulanz-banking.azurewebsites.net
FRONTEND_URL=http://localhost:3000

# ---------------------------
# Logging
# ---------------------------
LOG_LEVEL=info

# ---------------------------
# Narvi API Configuration
# ---------------------------
# Banking API integration
NARVI_API_URL=https://api.narvi.com/rest/v1.0
NARVI_API_KEY_ID=EY66Z3MKPW4K26K6
NARVI_PRIVATE_KEY_PATH=/home/site/wwwroot/banking_private.pem
NARVI_API_IP_WHITELIST=80.232.250.236

# ---------------------------
# Email Configuration (Gmail SMTP)
# ---------------------------
# IMPORTANT: This is a Gmail App Password, NOT the regular password
# Generate at: https://myaccount.google.com/apppasswords
EMAIL_USER=opulanz.banking@gmail.com
EMAIL_PASS=dpbqsmhgoqgblbub
ADMIN_EMAIL=opulanz.banking@gmail.com
```

---

## 🌐 Frontend Environment Variables

### File Location: `.env.local` (Next.js)

```bash
# =================================================================
# Opulanz Banking Platform - Frontend Environment Configuration
# =================================================================

# ---------------------------
# API Configuration
# ---------------------------
# For Azure deployment, update this to your backend URL
# Example: https://opulanz-api.azurewebsites.net
NEXT_PUBLIC_API_URL=http://localhost:5000

# ---------------------------
# Application Configuration
# ---------------------------
NEXT_PUBLIC_APP_NAME=Opulanz Banking
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ---------------------------
# Feature Flags
# ---------------------------
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_DEBUG=false
```

---

## ☁️ Azure Resources

### Current Infrastructure

| Resource Type | Name | Location | Status |
|--------------|------|----------|--------|
| **PostgreSQL Database** | opulanz-pg | (Check Azure Portal) | ✅ Active |
| **Database Name** | postgres | - | ✅ Active |
| **Admin User** | opulanz_admin | - | ✅ Active |

### Database Tables Created

The following tables exist in the database:

1. **users** - User accounts
2. **applications** - All application types (individual, company, accounting, insurance, company_formation)
3. **documents** - Uploaded documents
4. **companies** - Company records
5. **appointments** - Appointment scheduling

### Application Types Supported

The `applications` table supports these types:
- `individual` - Individual account applications
- `company` - Company account applications
- `accounting` - Accounting service applications
- `insurance` - Insurance applications
- `company_formation` - Company formation (SARL, SARL-S, SA, SCSp, SOLE)

---

## 🔐 Security Notes

### ⚠️ CRITICAL - Before Deployment

1. **Update FRONTEND_URL**
   - Change from `http://localhost:3000` to your Azure frontend URL
   - Example: `https://opulanz-banking.azurewebsites.net`

2. **Update NODE_ENV**
   - Change from `development` to `production`

3. **Update LOG_LEVEL**
   - Change from `debug` to `info` or `warn` for production

4. **Narvi Private Key**
   - Currently located at: `C:/Users/Toufi/AndroidStudioProjects/opulanzbanking/banking_private.pem`
   - **Must upload to Azure:** Update `NARVI_PRIVATE_KEY_PATH` to Azure location
   - Recommended Azure path: `/home/site/wwwroot/banking_private.pem`

5. **Database Password**
   - Current password: `Advensys2025Secure!`
   - **Consider changing** for production deployment
   - If changed, update both:
     - Azure PostgreSQL server
     - `DB_PASSWORD` environment variable

6. **Email App Password**
   - Current Gmail App Password is set
   - **Do NOT share** this password publicly
   - If compromised, regenerate at: https://myaccount.google.com/apppasswords

---

## 📝 Deployment Checklist

### Azure App Service Configuration

When deploying to Azure App Service, configure these environment variables in the **Configuration** blade:

#### Backend (Node.js API)

```
Application Settings:
├── PORT = 5000
├── NODE_ENV = production
├── DB_HOST = opulanz-pg.postgres.database.azure.com
├── DB_USER = opulanz_admin
├── DB_PASSWORD = Advensys2025Secure!
├── DB_NAME = postgres
├── DB_PORT = 5432
├── FRONTEND_URL = https://your-frontend-url.azurewebsites.net
├── LOG_LEVEL = info
├── NARVI_API_URL = https://api.narvi.com/rest/v1.0
├── NARVI_API_KEY_ID = EY66Z3MKPW4K26K6
├── NARVI_PRIVATE_KEY_PATH = /home/site/wwwroot/banking_private.pem
├── NARVI_API_IP_WHITELIST = 80.232.250.236
├── EMAIL_USER = opulanz.banking@gmail.com
├── EMAIL_PASS = dpbqsmhgoqgblbub
└── ADMIN_EMAIL = opulanz.banking@gmail.com
```

#### Frontend (Next.js)

```
Application Settings:
├── NEXT_PUBLIC_API_URL = https://your-backend-url.azurewebsites.net
├── NEXT_PUBLIC_APP_NAME = Opulanz Banking
└── NEXT_PUBLIC_APP_URL = https://your-frontend-url.azurewebsites.net
```

### Azure PostgreSQL Configuration

**Firewall Rules:**
- Ensure Azure App Service IP addresses are whitelisted
- Or enable "Allow access to Azure services"

**SSL Configuration:**
- SSL is REQUIRED (currently using `sslmode=require`)
- Download Azure SSL certificate if needed

---

## 📦 Required Files to Upload

### Backend Files

1. **Private Key for Narvi API**
   - File: `banking_private.pem`
   - Upload to: `/home/site/wwwroot/banking_private.pem`
   - **CRITICAL:** Keep this file secure!

2. **Backend Code**
   - All files in `backend/` directory
   - Including `node_modules/` (or install via npm on Azure)

### Frontend Files

1. **Next.js Build**
   - Run `npm run build` locally first
   - Upload `.next/` directory
   - Or configure Azure to build on deployment

---

## 🔄 Database Migrations

All migrations have been run. Current schema includes:

```sql
-- Applications table supports all types
CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) CHECK (type IN ('individual', 'company', 'accounting', 'insurance', 'company_formation')),
    status VARCHAR(50) DEFAULT 'draft',
    payload JSONB NOT NULL DEFAULT '{}',
    narvi_customer_id VARCHAR(255),
    narvi_company_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🧪 Testing After Deployment

### Backend Health Check
```bash
curl https://your-backend-url.azurewebsites.net/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2025-12-01T...",
  "database": "connected"
}
```

### Frontend Test
```bash
curl https://your-frontend-url.azurewebsites.net/en
```

### Database Connection Test
```bash
# From Azure Cloud Shell or local with Azure CLI
psql "postgresql://opulanz_admin:Advensys2025Secure!@opulanz-pg.postgres.database.azure.com:5432/postgres?sslmode=require"
```

---

## 📞 Support & Resources

### API Endpoints (Backend)

- **Health:** `GET /health`
- **Users:** `GET/POST /api/users`
- **Applications:** `GET/POST /api/applications`
- **Documents:** `GET/POST /api/documents`
- **Companies:** `GET/POST /api/companies`
- **Appointments:** `GET/POST /api/appointments`

### Frontend Routes

- **Home:** `/en` or `/fr`
- **Individual Account:** `/en/open-account/individual`
- **Company Account:** `/en/open-account/company`
- **Company Formation:** `/en/company-formation`
- **Dashboard:** `/en/dashboard`

---

## 🚨 Important Notes

1. **Never commit .env files to Git**
2. **Update all localhost URLs to Azure URLs**
3. **Enable Azure Application Insights** for monitoring
4. **Configure Azure Key Vault** for secrets management (recommended)
5. **Set up SSL certificates** for custom domains
6. **Enable Azure CDN** for better performance
7. **Configure auto-scaling** based on traffic

---

## 📧 Contact

For questions about this configuration, contact the development team.

**Last Updated:** December 1, 2025
**Configuration Version:** 1.0
**Database Schema Version:** 1.5 (includes company_formation type)
