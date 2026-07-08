# Opulanz Banking Platform — Complete Documentation

📁 **Location:** `C:\Users\Toufi\AndroidStudioProjects\azuree\documentation\`

---

## 📚 Documentation Index

| File | What It Covers |
|------|----------------|
| [01-PROJECT-OVERVIEW.md](01-PROJECT-OVERVIEW.md) | What Opulanz is, tech stack, folder structure |
| [02-LOCAL-SETUP.md](02-LOCAL-SETUP.md) | How to install and run locally (step by step) |
| [03-ENVIRONMENT-VARIABLES.md](03-ENVIRONMENT-VARIABLES.md) | Every `.env` variable explained |
| [04-FRONTEND.md](04-FRONTEND.md) | Next.js frontend: pages, routes, i18n, components |
| [05-BACKEND.md](05-BACKEND.md) | Express backend: all API endpoints, database |
| [06-DATABASE.md](06-DATABASE.md) | PostgreSQL schema, all tables, migrations |
| [07-PAYPAL.md](07-PAYPAL.md) | PayPal setup: sandbox, live, credentials |
| [08-CALENDLY.md](08-CALENDLY.md) | Calendly setup: accounts, event types, URLs |
| [09-DOCUSIGN.md](09-DOCUSIGN.md) | DocuSign setup: integration key, JWT, consent |
| [10-AZURE.md](10-AZURE.md) | Azure: PostgreSQL, Blob Storage, App Service, deployment |
| [11-EMAILS.md](11-EMAILS.md) | Email setup: Gmail SMTP, EmailJS, Nodemailer |
| [12-MOBILE-APP.md](12-MOBILE-APP.md) | Android/iOS Capacitor app build and deploy |
| [13-ACCOUNTS-AND-CREDENTIALS.md](13-ACCOUNTS-AND-CREDENTIALS.md) | All accounts, emails, logins used in the project |
| [14-TROUBLESHOOTING.md](14-TROUBLESHOOTING.md) | Common errors and how to fix them |
| [15-DEPLOYMENT.md](15-DEPLOYMENT.md) | How to deploy to Azure production |

---

## 🚀 Quick Start (5 Minutes)

### Start Backend
```bash
cd C:\Users\Toufi\AndroidStudioProjects\azuree\backend
npm install
npm start
# → runs on http://localhost:5000
```

### Start Frontend
```bash
cd C:\Users\Toufi\AndroidStudioProjects\azuree
npm install
npm run dev
# → runs on http://localhost:3000 (or 3001, 3002... if port taken)
```

### Open in Browser
- English: http://localhost:3000/en
- French:  http://localhost:3000/fr

---

## 🔑 Key Accounts (Quick Reference)

| Service | Email / Login | Notes |
|---------|--------------|-------|
| Gmail (Email sending) | opulanz.banking@gmail.com | App password: `dpbq smhg oqgb lbub` |
| PayPal | Uses Client ID + Secret in `.env` | Sandbox mode |
| Calendly | opulanz-banking account | See [08-CALENDLY.md](08-CALENDLY.md) |
| DocuSign | Developer sandbox account | See [09-DOCUSIGN.md](09-DOCUSIGN.md) |
| Azure | Azure Portal subscription | See [10-AZURE.md](10-AZURE.md) |
| Azure PostgreSQL | DB: `opulanz-pg.postgres.database.azure.com` | User: `opulanz_admin` |

---

## 🏗️ Architecture in One Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     USER (Browser / App)                     │
└────────────────────────────┬────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  Next.js 14      │  Frontend
                    │  (Port 3000)     │  React + Tailwind
                    └────────┬────────┘
                             │ REST API calls
                    ┌────────▼────────┐
                    │  Express.js      │  Backend
                    │  (Port 5000)     │  Node.js
                    └──┬──────┬───────┘
                       │      │
          ┌────────────▼┐   ┌▼──────────────┐
          │ Azure        │   │ External APIs  │
          │ PostgreSQL   │   │ • PayPal       │
          │ (Database)   │   │ • Calendly     │
          └─────────────┘   │ • DocuSign     │
                            │ • Gmail SMTP   │
                            └───────────────┘
```
