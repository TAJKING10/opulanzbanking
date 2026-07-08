# 16 — Risk Management Documentation

## Opulanz Banking Platform — Risk Management Guide

**Version:** 1.0
**Date:** July 2026
**Applies to:** All team members, developers, business owners, and compliance officers

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Risk Categories](#2-risk-categories)
3. [Risk Register](#3-risk-register)
4. [Technical & Security Risks](#4-technical--security-risks)
5. [Financial & Payment Risks](#5-financial--payment-risks)
6. [Regulatory & Compliance Risks](#6-regulatory--compliance-risks)
7. [Operational Risks](#7-operational-risks)
8. [Data & Privacy Risks](#8-data--privacy-risks)
9. [Third-Party Service Risks](#9-third-party-service-risks)
10. [Incident Response Plan](#10-incident-response-plan)
11. [Step-by-Step Risk Checklist](#11-step-by-step-risk-checklist)
12. [Risk Review Schedule](#12-risk-review-schedule)

---

## 1. Introduction

### What is Risk Management?

Risk management is the process of **identifying**, **assessing**, and **controlling** threats to the platform. For a financial services company like Opulanz, this is not optional — it is required by regulators (ACPR, AMF, CSSF) and protects clients, the business, and the team.

### Why It Matters for Opulanz

Opulanz handles:
- **Personal financial data** (income, assets, debts, identity documents)
- **Real money payments** via PayPal
- **Regulated services** (investment advisory, life insurance, tax advisory)
- **Client identity verification** (KYC/AML data)
- **Legal documents** (electronically signed via DocuSign)

A breach, outage, or compliance failure can result in:
- Regulatory fines (GDPR: up to €20 million or 4% of revenue)
- Loss of operating license
- Client lawsuits
- Reputational damage

### Risk Rating System

| Rating | Score | Meaning |
|--------|-------|---------|
| 🔴 Critical | 5 | Must fix immediately. Business-stopping. |
| 🟠 High | 4 | Fix within 1 week. Significant damage possible. |
| 🟡 Medium | 3 | Fix within 1 month. Moderate impact. |
| 🟢 Low | 2 | Fix when convenient. Minor impact. |
| ⚪ Negligible | 1 | Monitor only. Minimal impact. |

### How Risk Score is Calculated

```
Risk Score = Likelihood (1-5) × Impact (1-5)

Example:
  Database breach: Likelihood 2 × Impact 5 = Score 10 → Critical
  Typo in translation: Likelihood 4 × Impact 1 = Score 4 → Low
```

---

## 2. Risk Categories

| # | Category | Examples |
|---|----------|---------|
| A | Technical & Security | SQL injection, data breach, server downtime |
| B | Financial & Payment | Fraudulent payments, PayPal disputes, chargebacks |
| C | Regulatory & Compliance | GDPR violation, KYC failure, unlicensed activity |
| D | Operational | Staff error, lost credentials, bad deployment |
| E | Data & Privacy | Personal data leak, GDPR breach, unauthorized access |
| F | Third-Party Services | PayPal outage, Calendly down, DocuSign failure |

---

## 3. Risk Register

This is the master list of all identified risks.

| ID | Category | Risk | Likelihood | Impact | Score | Status |
|----|----------|------|-----------|--------|-------|--------|
| R01 | A | SQL injection attack on database | 2 | 5 | 10 | 🔴 Mitigated |
| R02 | A | Database credentials exposed in code | 2 | 5 | 10 | 🔴 Mitigated |
| R03 | A | Server goes down in production | 3 | 4 | 12 | 🔴 Mitigated |
| R04 | A | .env file with secrets committed to Git | 2 | 5 | 10 | 🔴 Mitigated |
| R05 | B | Fraudulent PayPal payment | 3 | 4 | 12 | 🟠 Monitor |
| R06 | B | PayPal chargeback after service rendered | 2 | 3 | 6 | 🟡 Monitor |
| R07 | B | Payment captured but booking not created | 2 | 4 | 8 | 🟠 Mitigated |
| R08 | C | Offering regulated services without license | 1 | 5 | 5 | 🟠 Action needed |
| R09 | C | GDPR: collecting data without consent | 1 | 5 | 5 | 🟠 Mitigated |
| R10 | C | KYC not performed before investment advisory | 2 | 5 | 10 | 🔴 Mitigated |
| R11 | C | AML: not screening for sanctioned persons | 2 | 5 | 10 | 🔴 Action needed |
| R12 | D | Wrong environment variables on production | 3 | 4 | 12 | 🟠 Mitigated |
| R13 | D | Accidental deletion of production database | 1 | 5 | 5 | 🟠 Mitigated |
| R14 | D | Developer leaves — credentials lost | 2 | 4 | 8 | 🟠 Action needed |
| R15 | E | Client KYC data leaked | 1 | 5 | 5 | 🟠 Mitigated |
| R16 | E | Client data retained longer than allowed | 3 | 3 | 9 | 🟡 Action needed |
| R17 | F | PayPal API down during payment | 2 | 3 | 6 | 🟡 Mitigated |
| R18 | F | Calendly down — no booking possible | 2 | 3 | 6 | 🟡 Monitor |
| R19 | F | DocuSign down — signatures delayed | 2 | 2 | 4 | 🟢 Monitor |
| R20 | F | Azure database outage | 1 | 5 | 5 | 🟠 Mitigated |

---

## 4. Technical & Security Risks

### R01 — SQL Injection Attack

**What it is:** An attacker injects malicious SQL code into form inputs to access or destroy the database.

**Example attack:** User types `'; DROP TABLE users; --` in a name field.

**Current protections:**
- Backend uses **parameterized queries** with the `pg` library (never raw string concatenation)
- Example of safe code:
  ```javascript
  // SAFE — parameterized
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [userEmail]
  );
  // NEVER DO THIS — vulnerable
  const result = await pool.query(
    `SELECT * FROM users WHERE email = '${userEmail}'`
  );
  ```
- `helmet` middleware adds security headers

**Action steps:**
1. [ ] Audit every `pool.query()` call in `backend/src/routes/` — ensure all use `$1, $2` parameters
2. [ ] Never use string interpolation in SQL queries
3. [ ] Run a security scan tool like OWASP ZAP on the API endpoints before launch

---

### R02 — Database Credentials Exposed

**What it is:** Secrets like passwords and API keys accidentally pushed to GitHub.

**Current protections:**
- `.gitignore` includes `.env`, `backend/.env`, `*.pem`
- Credentials are in `.env` files (not in code)

**Action steps:**
1. [ ] Run this command to check if any secrets are in Git history:
   ```bash
   git log --all --full-history -- .env
   git log --all --full-history -- backend/.env
   ```
   If they appear, the secrets have been exposed and must be rotated.
2. [ ] Install `git-secrets` or use GitHub's secret scanning feature
3. [ ] Rotate all passwords if any `.env` was ever committed
4. [ ] Store secrets in Azure Key Vault for production (not as plain text app settings)

---

### R03 — Server Downtime

**What it is:** The Azure App Service crashes or becomes unresponsive.

**Current protections:**
- Azure App Service has built-in health monitoring
- "Always On" setting prevents cold starts

**Action steps:**
1. [ ] Enable **Application Insights** in Azure Portal for automatic alerts
2. [ ] Set up uptime monitoring (e.g., UptimeRobot — free):
   - Monitor: `https://rg-opulanz-backend-.../health`
   - Alert: Email when down for 5+ minutes
3. [ ] Configure **Auto-restart** in Azure App Service → Configuration → General settings
4. [ ] Set minimum instances to 2 for high availability (requires scaling up plan)

---

### R04 — .env File in Git

**Action steps — do these NOW:**
```bash
# Check if .env is tracked by Git
cd C:\Users\Toufi\AndroidStudioProjects\azuree
git ls-files .env backend/.env

# If they appear in the output, remove them:
git rm --cached .env
git rm --cached backend/.env
git commit -m "Remove .env files from tracking"
git push
```

Then verify `.gitignore` contains:
```
.env
.env.local
.env.production
backend/.env
*.pem
```

---

## 5. Financial & Payment Risks

### R05 — Fraudulent PayPal Payment

**What it is:** Someone uses a stolen credit card or fake PayPal account to pay.

**Risk:** Opulanz charges the fraudster, PayPal reverses it later, and the service was already rendered.

**Action steps:**
1. [ ] Enable **PayPal Seller Protection** in your PayPal business account:
   - Log in → Settings → Seller Protection
   - Ensure "Item Not Received" and "Unauthorized Transaction" protections are ON
2. [ ] For investment advisory (high-value service): do not deliver service until PayPal confirms `COMPLETED` status (not just `CREATED`)
3. [ ] Save the PayPal order ID and capture result in the database for every payment
4. [ ] Set up fraud filters in PayPal: Dashboard → Risk Controls → Fraud Management Filters

---

### R06 — Chargeback After Service

**What it is:** Client pays, receives the consultation, then disputes the payment with their bank.

**Mitigation:**
1. [ ] Record all services with timestamps in the database
2. [ ] Have clients sign a **Terms of Service** before payment (currently in the consent form)
3. [ ] Keep DocuSign-signed mission letters as proof of service agreement
4. [ ] Send a receipt email (with order ID and service description) after every payment
5. [ ] For investment advisory: the signed mission letter IS your proof of contract

---

### R07 — Payment Captured But Booking Not Created

**What it is:** PayPal succeeds, but the Calendly step is skipped or fails, leaving a paid but unbookable client.

**Current protection:**
- The app moves the user to the Calendly step immediately after PayPal captures
- Booking is saved when Calendly fires the `event_scheduled` message

**Action steps:**
1. [ ] Add a **database record at payment capture time** (before Calendly):
   ```json
   { "payment_status": "captured", "booking_status": "pending", "paypal_order_id": "..." }
   ```
2. [ ] Build an admin view to find paid-but-not-booked clients and contact them manually
3. [ ] Consider sending an email immediately on payment capture: "Payment received — please complete your booking"

---

## 6. Regulatory & Compliance Risks

### R08 — Offering Regulated Services Without a License

**What it is:** In France and Luxembourg, investment advisory and insurance brokerage are **regulated activities** requiring specific licenses.

**Required licenses:**
| Service | France | Luxembourg |
|---------|--------|-----------|
| Investment Advisory | AMF registration (CIF) | CSSF authorization |
| Life Insurance Brokerage | ORIAS registration | CAA approval |
| Tax Advisory | Not regulated (but must declare as professional) | — |

**Action steps:**
1. [ ] Confirm current license status with your legal advisor
2. [ ] Add license numbers to the website footer and Terms of Service
3. [ ] If not yet licensed: add disclaimers that consultations are "informational only" pending licensing
4. [ ] Register on ORIAS (France): https://www.orias.fr
5. [ ] Register with AMF (France): https://www.amf-france.org
6. [ ] Apply to CSSF (Luxembourg): https://www.cssf.lu

---

### R09 — GDPR: Data Collection Without Proper Consent

**What it is:** Collecting personal data (name, address, financial info) without explicit, informed consent violates GDPR (EU regulation). Fine: up to €20 million.

**Current protections:**
- Investment advisory form has mandatory GDPR consent checkbox
- Consents saved to database

**Action steps:**
1. [ ] Ensure **every form** that collects personal data has a GDPR consent checkbox
2. [ ] Add a **Privacy Policy** page at `/en/legal/privacy-policy`
3. [ ] The Privacy Policy must explain:
   - What data is collected
   - Why it is collected (legal basis)
   - How long it is kept
   - Who it is shared with
   - How clients can request deletion
4. [ ] Add a **Cookie Consent Banner** if using analytics or tracking
5. [ ] Register as a Data Controller with CNIL (France): https://www.cnil.fr
6. [ ] Appoint a Data Protection Officer (DPO) or use a DPO-as-a-service

---

### R10 — KYC Not Performed Before Investment Advisory

**What it is:** Providing investment advisory without verifying client identity violates AML/CFT laws.

**Current status:** ✅ The investment advisory schedule page requires full KYC form before payment and booking.

**Action steps:**
1. [ ] Ensure the KYC data is reviewed by a human before the consultation happens
2. [ ] Do not provide the Calendly booking link directly — always go through the KYC step first
3. [ ] Store all KYC data and make it reviewable by your compliance officer
4. [ ] If using Sumsub for identity verification: trigger verification flow after KYC form submission

---

### R11 — AML: Not Screening for Sanctioned Persons

**What it is:** Under EU AML directives, you must screen clients against sanctions lists (EU, UN, OFAC) before doing business with them.

**Current status:** ⚠️ Not yet implemented.

**Action steps:**
1. [ ] Integrate a sanctions screening API such as:
   - **ComplyAdvantage** (https://complyadvantage.com)
   - **Refinitiv World-Check**
   - **OpenSanctions** (free, open source: https://opensanctions.org)
2. [ ] Screen every client at onboarding using their name, date of birth, and nationality
3. [ ] Document every screening result in the database
4. [ ] Block service if client appears on a sanctions list
5. [ ] Re-screen existing clients periodically (at least annually)

---

## 7. Operational Risks

### R12 — Wrong Environment Variables in Production

**What it is:** Using `sandbox` PayPal in production (fake money) or using `localhost` API URL in Azure.

**Most common mistakes:**
- `NEXT_PUBLIC_API_URL=http://localhost:5000` in production → API calls fail
- `PAYPAL_ENV=sandbox` in production → No real money collected
- `NODE_ENV=development` in production → Debug logs exposed

**Action steps — Deployment Checklist:**
Before every production deployment:
1. [ ] Verify `NEXT_PUBLIC_API_URL` points to Azure backend (not localhost)
2. [ ] Verify `PAYPAL_ENV=live` (when switching to real payments)
3. [ ] Verify `NODE_ENV=production`
4. [ ] Verify `NEXT_PUBLIC_ENABLE_DEBUG=false`
5. [ ] Test the `/health` endpoint on the live backend after deploy
6. [ ] Test a complete booking flow on production before announcing launch

---

### R13 — Accidental Deletion of Production Database

**What it is:** A developer runs `DROP TABLE` or `DELETE FROM` on the live Azure database.

**Current protections:**
- Azure PostgreSQL has automatic daily backups (7-day retention)

**Action steps:**
1. [ ] Enable **geo-redundant backups** in Azure PostgreSQL:
   - Azure Portal → `opulanz-pg` → Backup and restore → Enable geo-redundant backup
2. [ ] Create a read-only database user for developers who only need to read data:
   ```sql
   CREATE USER readonly_user WITH PASSWORD 'ReadOnly2026!';
   GRANT CONNECT ON DATABASE postgres TO readonly_user;
   GRANT USAGE ON SCHEMA public TO readonly_user;
   GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;
   ```
3. [ ] Never run destructive SQL commands on production without a backup first
4. [ ] To restore from backup: Azure Portal → `opulanz-pg` → Backup and restore → Select restore point

---

### R14 — Developer Leaves — Credentials Lost

**What it is:** The only person who knows the passwords leaves the company.

**Action steps:**
1. [ ] Store all credentials in a **password manager** shared by the team:
   - Recommended: **1Password Teams**, **Bitwarden Business**, or **LastPass Teams**
2. [ ] Document every account in `documentation/13-ACCOUNTS-AND-CREDENTIALS.md` and keep it updated
3. [ ] Enable **2-factor authentication** on all accounts (Gmail, PayPal, Azure, Calendly, DocuSign)
4. [ ] Store backup 2FA codes in the password manager
5. [ ] At least 2 people should have admin access to every service

---

## 8. Data & Privacy Risks

### R15 — Client KYC Data Leaked

**What it is:** A security breach exposes client names, addresses, passport numbers, financial data.

**This is a critical risk** for a financial services company. Consequences: GDPR fines, client lawsuits, license revocation.

**Current protections:**
- Database on Azure (not publicly accessible)
- HTTPS everywhere
- Data stored in PostgreSQL, not in browser

**Action steps:**
1. [ ] **Encrypt sensitive database columns** (passport numbers, TIN numbers):
   - Use PostgreSQL's `pgcrypto` extension
   - Or encrypt at application level before storing
2. [ ] Enable **Azure Defender for PostgreSQL**:
   - Azure Portal → `opulanz-pg` → Microsoft Defender for Cloud → Enable
3. [ ] Implement **role-based access control (RBAC)**:
   - Advisors can only see their own clients
   - Admins can see all
   - Developers should not have production access
4. [ ] Log all data access in an audit trail
5. [ ] Create a **Data Breach Response Plan** (see Incident Response below)

---

### R16 — Data Retained Too Long (GDPR)

**What it is:** GDPR requires you to delete personal data when it is no longer needed. Keeping data indefinitely is a violation.

**Retention rules for financial services:**
| Data Type | Retention Period | Legal Basis |
|-----------|-----------------|------------|
| KYC documents | 5 years after client relationship ends | AML Directive |
| Transaction records | 5 years | AML Directive |
| Booking records | 3 years | General limitation period |
| Marketing data | Until consent withdrawn | GDPR |
| Unapproved applications | 1 year maximum | Proportionality |

**Action steps:**
1. [ ] Add a `scheduled_deletion_date` column to the `applications` table
2. [ ] Build an automated cleanup job (runs monthly):
   ```javascript
   // Delete records older than retention period
   DELETE FROM applications
   WHERE created_at < NOW() - INTERVAL '5 years'
   AND status = 'rejected';
   ```
3. [ ] Create a **Right to Erasure** workflow: clients can email to request data deletion
4. [ ] Document your retention policy in the Privacy Policy

---

## 9. Third-Party Service Risks

### R17 — PayPal API Outage

**What it is:** PayPal's API goes down and payments cannot be processed.

**Likelihood:** Low (PayPal SLA: 99.9% uptime), but it happens.

**Action steps:**
1. [ ] Show a user-friendly message when PayPal fails: "Payment temporarily unavailable. Please try again in a few minutes or contact us."
2. [ ] Provide an alternative payment method (bank transfer) as fallback:
   - Add contact email/phone to the payment page
3. [ ] Monitor PayPal status at: https://www.paypal-status.com
4. [ ] Consider adding a second payment provider (Stripe) in the future

---

### R18 — Calendly Service Down

**What it is:** Calendly's servers are unavailable — clients can't book.

**Action steps:**
1. [ ] Add a fallback message on the booking page: "If the calendar doesn't load, contact us at opulanz.banking@gmail.com"
2. [ ] Monitor Calendly status at: https://status.calendly.com
3. [ ] Consider self-hosted scheduling (Cal.com open source) as a long-term alternative

---

### R19 — DocuSign Service Down

**What it is:** Documents can't be sent for signature.

**Action steps:**
1. [ ] Queue documents for signature (store in database with status `pending_signature`)
2. [ ] Retry sending automatically when DocuSign comes back
3. [ ] Monitor status: https://status.docusign.com
4. [ ] Allow wet (paper) signatures as backup for critical documents

---

### R20 — Azure Database Outage

**What it is:** Azure PostgreSQL server is unavailable.

**Action steps:**
1. [ ] Enable **High Availability** in Azure PostgreSQL:
   - Azure Portal → `opulanz-pg` → High availability → Enable
   - This creates a standby replica that takes over automatically
2. [ ] Enable **geo-redundant backup** so data can be restored even if Canada Central region fails
3. [ ] For maximum resilience: consider read replica in a second Azure region

---

## 10. Incident Response Plan

### Step 1 — Detect the Incident

**How to detect:**
- Uptime monitoring alert (UptimeRobot, Azure Application Insights)
- Client reports a problem
- Error in Azure Log Stream
- Developer notices in console

**Severity levels:**
| Level | Definition | Response Time |
|-------|-----------|--------------|
| P1 — Critical | Production down, data breach, payment failure | Immediate (< 1 hour) |
| P2 — High | Feature broken, partial outage | Within 4 hours |
| P3 — Medium | Minor bug, non-critical feature | Within 24 hours |
| P4 — Low | UI glitch, translation error | Within 1 week |

---

### Step 2 — Contain the Incident

**For a data breach:**
1. Immediately revoke all database access credentials
2. Generate new passwords
3. Identify what data was accessed and when
4. Isolate affected systems

**For a payment failure:**
1. Check PayPal status page
2. Check backend logs: Azure Portal → App Service → Log stream
3. If backend is down: restart it in Azure Portal

**For a production outage:**
1. Check Azure App Service status
2. Restart the App Service: Azure Portal → App Service → Restart
3. Check logs for the error
4. Roll back to previous deployment if needed

---

### Step 3 — Notify Affected Parties

**GDPR requires notification within 72 hours of discovering a data breach:**

1. **Notify the supervisory authority:**
   - France: CNIL — https://www.cnil.fr/en/notifying-personal-data-breach-cnil
   - Luxembourg: CNPD — https://cnpd.public.lu

2. **Notify affected clients** if breach is likely to cause harm:
   - Email all affected clients within 72 hours
   - Explain: what happened, what data was affected, what you are doing about it

3. **Internal notification:**
   - Notify all team members
   - Start an incident log (date, time, what happened, what was done)

---

### Step 4 — Recover

1. Fix the root cause (patch code, rotate credentials, etc.)
2. Restore from backup if data was lost
3. Test that the fix works
4. Deploy the fix
5. Verify production is working normally

---

### Step 5 — Post-Incident Review

Within 1 week of every incident:
1. Write an incident report covering:
   - What happened and when
   - Root cause
   - Impact (clients affected, data exposed, financial loss)
   - What was done to fix it
   - What changes will prevent recurrence
2. Update this Risk Register with new risk or changed status
3. Implement preventive measures

---

## 11. Step-by-Step Risk Checklist

Use this checklist **before going live** and **every 3 months** after.

### A — Technical Security

- [ ] All SQL queries use parameterized statements (no string interpolation)
- [ ] `.env` files are in `.gitignore` and NOT in Git history
- [ ] HTTPS is enforced on all Azure App Services (redirect HTTP → HTTPS)
- [ ] Helmet middleware is active (it is — in `backend/src/index.js`)
- [ ] Rate limiting is configured (it is — `express-rate-limit` in backend)
- [ ] No hardcoded passwords or API keys in source code
- [ ] All API keys rotated in the last 12 months
- [ ] Azure Defender for PostgreSQL is enabled
- [ ] Production logs do not contain personal data or passwords

### B — Financial & Payment

- [ ] PayPal Seller Protection is enabled in the PayPal account
- [ ] Every payment is saved to the database with PayPal order ID
- [ ] The payment amount matches the service price (not taken from user input)
- [ ] Receipts are sent by email after every successful payment
- [ ] Admin can view all payments in the admin panel

### C — Regulatory & Compliance

- [ ] Required licenses obtained (AMF, CSSF, ORIAS) — or disclaimers shown
- [ ] Privacy Policy page exists and is up to date
- [ ] All forms requiring data collection have GDPR consent checkbox
- [ ] Consents are stored in the database with timestamp
- [ ] KYC is mandatory before investment advisory booking
- [ ] Sanctions screening is implemented (or documented as pending)
- [ ] Data retention policy is documented and enforced

### D — Operational

- [ ] All credentials stored in a password manager
- [ ] At least 2 people have access to every service
- [ ] Deployment checklist is followed before every production push
- [ ] Database backup is verified working (test restore at least once)
- [ ] Uptime monitoring is configured with alerts

### E — Data & Privacy

- [ ] Sensitive data (passport numbers, financial data) is encrypted in the database
- [ ] RBAC is implemented (advisors see only their clients)
- [ ] Data access is logged in an audit trail
- [ ] A data deletion workflow exists for client requests
- [ ] Scheduled data deletion is implemented for records past retention period

### F — Third-Party Services

- [ ] Status monitoring pages bookmarked: PayPal, Calendly, DocuSign, Azure
- [ ] Fallback messages shown when third-party services fail
- [ ] Alternative contact method visible on payment and booking pages

---

## 12. Risk Review Schedule

| Frequency | Activity | Who |
|-----------|----------|-----|
| **Before every release** | Run the checklist in Section 11 | Developer |
| **Monthly** | Review the Risk Register — any new risks? | Business Owner |
| **Quarterly** | Full risk assessment update | Business Owner + Legal |
| **Annually** | Third-party audit of security and compliance | External auditor |
| **After any incident** | Incident report + Risk Register update | Developer + Business Owner |
| **When regulations change** | Review regulatory risks | Legal advisor |

---

## Key Contacts for Risk Events

| Situation | Contact |
|-----------|---------|
| Data breach (France) | CNIL: https://www.cnil.fr — 01 53 73 22 22 |
| Data breach (Luxembourg) | CNPD: https://cnpd.public.lu — +352 26 10 60-1 |
| Regulatory question (France) | AMF: https://www.amf-france.org |
| Regulatory question (Luxembourg) | CSSF: https://www.cssf.lu |
| PayPal fraud dispute | PayPal Resolution Center: https://www.paypal.com/disputes |
| Azure emergency | Azure Support: https://portal.azure.com → Help + Support |
| DocuSign issue | https://support.docusign.com |

---

*This document must be reviewed and updated at least every 3 months. Last updated: July 2026.*
