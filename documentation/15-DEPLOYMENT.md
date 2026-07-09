# 15 — Deployment Guide

How to deploy the Opulanz platform to Azure production.

---

## Architecture

```
GitHub (code) → Azure DevOps Pipeline → Azure App Service (live)
```

---

## Before You Deploy Checklist

- [ ] All environment variables set in Azure App Service settings
- [ ] Backend is connected to Azure PostgreSQL (not localhost)
- [ ] All database migrations have been run on production database
- [ ] PayPal credentials updated (sandbox or live)
- [ ] DocuSign consent granted for production integration key
- [ ] CORS origins updated to include production URLs
- [ ] Tested locally — no errors

---

## Deploying the Frontend

### Via Git Push (Automatic)
```bash
git add .
git commit -m "Deploy: your description"
git push origin main
```
Azure DevOps pipeline (`azure-pipelines-frontend.yml`) runs automatically.

**Pipeline does:**
1. Zips source code (excludes `node_modules`, `.next`, `.git`)
2. Deploys ZIP to Azure App Service
3. Azure Oryx builds: `npm install && npm run build && npm start`

### Via Manual Script
```powershell
cd C:\Users\Toufi\AndroidStudioProjects\azuree
.\deploy-frontend.ps1
```

### Check Status
After deploying, visit:
`https://rg-opulanz-frontend-hdd4ddcvd4gsc6cx.canadacentral-01.azurewebsites.net/en`

---

## Deploying the Backend

### Via Git Push (Automatic)
Pushing to main also triggers `azure-pipelines-backend.yml`.

### Via Manual Script
```powershell
cd C:\Users\Toufi\AndroidStudioProjects\azuree
.\deploy-backend.ps1
```

### Check Status
`https://rg-opulanz-backend-ffa3bgfze4a4g6gf.canadacentral-01.azurewebsites.net/health`

Should return: `{"status":"ok"}`

---

## Running Migrations on Production Database

Run migrations against the Azure database (not localhost):

```bash
# Make sure backend/.env points to Azure database:
# DB_HOST=opulanz-pg.postgres.database.azure.com
# DB_USER=opulanz_admin
# DB_PASSWORD=Advensys2025Secure!

cd C:\Users\Toufi\AndroidStudioProjects\azuree\backend
node src/migrations/run-all-migrations.js
```

This only needs to be done:
- First time setting up the database
- When new migration files are added

---

## Azure App Service Settings

### Frontend Settings
Go to: Azure Portal → `rg-opulanz-frontend` → Configuration → Application settings

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_API_URL` | `https://rg-opulanz-backend-ffa3bgfze4a4g6gf.canadacentral-01.azurewebsites.net` |
| `NEXT_PUBLIC_APP_URL` | `https://rg-opulanz-frontend-hdd4ddcvd4gsc6cx.canadacentral-01.azurewebsites.net` |
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | `ASfDlk...` |
| `NEXT_PUBLIC_PAYPAL_CURRENCY` | `EUR` |
| `NEXT_PUBLIC_ENVIRONMENT` | `production` |
| `NEXT_PUBLIC_ENABLE_DEBUG` | `false` |
| `WEBSITE_NODE_DEFAULT_VERSION` | `20-lts` |
| `NODE_ENV` | `production` |

**General Settings → Startup Command:** `npm start`

---

### Backend Settings
Go to: Azure Portal → `rg-opulanz-backend` → Configuration → Application settings

| Name | Value |
|------|-------|
| `PORT` | `8080` |
| `NODE_ENV` | `production` |
| `DB_HOST` | `opulanz-pg.postgres.database.azure.com` |
| `DB_USER` | `opulanz_admin` |
| `DB_PASSWORD` | `Advensys2025Secure!` |
| `DB_NAME` | `postgres` |
| `DB_PORT` | `5432` |
| `FRONTEND_URL` | `https://rg-opulanz-frontend-hdd4ddcvd4gsc6cx.canadacentral-01.azurewebsites.net` |
| `EMAIL_USER` | `opulanz.banking@gmail.com` |
| `EMAIL_PASS` | `dpbqsmhgoqgblbub` |
| `ADMIN_EMAIL` | `opulanz.banking@gmail.com` |
| `PAYPAL_CLIENT_ID` | `ASfDlk...` |
| `PAYPAL_SECRET` | `<your secret>` |
| `PAYPAL_ENV` | `sandbox` |
| `DOCUSIGN_INTEGRATION_KEY` | `<key>` |
| `DOCUSIGN_USER_ID` | `<id>` |
| `DOCUSIGN_ACCOUNT_ID` | `<id>` |
| `AZURE_STORAGE_CONNECTION_STRING` | `DefaultEndpoints...` |
| `AZURE_STORAGE_CONTAINER_NAME` | `opulanz-documents` |
| `JWT_SECRET` | `<long random string>` |

**General Settings → Startup Command:** `node src/index.js`

---

## Monitoring Production

### View Logs
```
Azure Portal → App Service → Monitoring → Log stream
```

### Quick Health Checks
```bash
# Frontend
curl https://rg-opulanz-frontend-hdd4ddcvd4gsc6cx.canadacentral-01.azurewebsites.net/en

# Backend
curl https://rg-opulanz-backend-ffa3bgfze4a4g6gf.canadacentral-01.azurewebsites.net/health
```

### Restart App Service
Azure Portal → App Service → Overview → **Restart** button

---

## Rolling Back

If a deployment breaks production:
1. Azure Portal → App Service → **Deployment Center** → **Deployment logs**
2. Find the last good deployment
3. Click **Redeploy** on that version

---

## Scaling Up

If the app needs more power:
1. Azure Portal → App Service → **Scale up (App Service plan)**
2. Choose a higher tier (B2, B3, P1, etc.)
3. Click **Apply**

---

## Custom Domain Setup

To use `opulanz.com`:
1. Azure Portal → App Service → **Custom domains** → **+ Add custom domain**
2. Enter `opulanz.com` or `www.opulanz.com`
3. Follow the DNS instructions (add CNAME/A records at your domain registrar)
4. Enable **HTTPS** (free SSL certificate from Azure)
