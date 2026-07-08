# 10 — Azure Setup & Deployment

## Overview

Azure hosts the entire production infrastructure:
- **Frontend** → Azure App Service (Next.js)
- **Backend** → Azure App Service (Express.js)
- **Database** → Azure Database for PostgreSQL
- **Files** → Azure Blob Storage

---

## Azure Services Used

| Service | Name in Azure | Purpose |
|---------|--------------|---------|
| App Service (Frontend) | `rg-opulanz-frontend` | Runs Next.js web app |
| App Service (Backend) | `rg-opulanz-backend` | Runs Express.js API |
| PostgreSQL Server | `opulanz-pg` | Database |
| Blob Storage | — | Document/file storage |
| Azure DevOps | — | CI/CD pipelines |

---

## Live URLs

| Service | URL |
|---------|-----|
| Frontend (Production) | `https://rg-opulanz-frontend-hdd4ddcvd4gsc6cx.canadacentral-01.azurewebsites.net` |
| Backend (Production) | `https://rg-opulanz-backend-ffa3bgfze4a4g6gf.canadacentral-01.azurewebsites.net` |

---

## Azure Portal Access

1. Go to https://portal.azure.com
2. Sign in with your Microsoft account
3. Find resources by searching for `opulanz` in the search bar

---

## Azure PostgreSQL Setup

### Connection Details
| Setting | Value |
|---------|-------|
| Server | `opulanz-pg.postgres.database.azure.com` |
| Port | `5432` |
| Admin user | `opulanz_admin` |
| Password | `Advensys2025Secure!` |
| SSL | Required |

### How to Access in Azure Portal
1. Azure Portal → Search `opulanz-pg`
2. Click on the PostgreSQL server
3. Under **Settings** → **Connect** — see connection strings
4. Under **Settings** → **Networking** — add your IP to allow access

### Allow Your Computer to Connect
1. Azure Portal → `opulanz-pg` → **Networking**
2. Under **Firewall rules**, click **+ Add current client IP address**
3. Click **Save**

---

## Azure Blob Storage Setup

### Getting the Connection String
1. Azure Portal → Search for your Storage Account
2. In the left menu: **Security + networking** → **Access keys**
3. Copy **Connection string** for key1
4. Add to backend `.env`:
   ```env
   AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=...;AccountKey=...;EndpointSuffix=core.windows.net
   AZURE_STORAGE_CONTAINER_NAME=opulanz-documents
   ```

### Creating the Container (First Time)
1. Azure Portal → Storage Account → **Containers**
2. Click **+ Container**
3. Name: `opulanz-documents`
4. Access level: **Private** (no anonymous read)
5. Click **Create**

---

## Deploying Frontend to Azure

### Method 1 — Azure DevOps Pipeline
The pipeline file is: `azure-pipelines-frontend.yml`

It automatically:
1. Zips the source code
2. Deploys to Azure App Service
3. Azure runs `npm install && npm run build && npm start`

To trigger a deployment:
```bash
git push origin main
```
The pipeline runs automatically on push to `main`.

### Method 2 — Manual Deploy Script
```powershell
# Run from project root
.\deploy-frontend.ps1
```

### Frontend App Service Settings
In Azure Portal → `rg-opulanz-frontend` → **Configuration** → **Application settings**:

| Setting | Value |
|---------|-------|
| `NEXT_PUBLIC_API_URL` | `https://rg-opulanz-backend-ffa3bgfze4a4g6gf.canadacentral-01.azurewebsites.net` |
| `NEXT_PUBLIC_APP_URL` | `https://rg-opulanz-frontend-hdd4ddcvd4gsc6cx.canadacentral-01.azurewebsites.net` |
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | `ASfDlk...` |
| `WEBSITE_NODE_DEFAULT_VERSION` | `20-lts` |
| `NODE_ENV` | `production` |

**Startup Command:** `npm start`

---

## Deploying Backend to Azure

### Method 1 — Pipeline
Pipeline file: `azure-pipelines-backend.yml`

### Method 2 — Manual Deploy Script
```powershell
.\deploy-backend.ps1
```

### Backend App Service Settings
In Azure Portal → `rg-opulanz-backend` → **Configuration** → **Application settings**:

| Setting | Value |
|---------|-------|
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
| `PAYPAL_CLIENT_ID` | `ASfDlk...` |
| `PAYPAL_SECRET` | `<secret>` |
| `PAYPAL_ENV` | `sandbox` |
| `DOCUSIGN_INTEGRATION_KEY` | `<key>` |
| `DOCUSIGN_USER_ID` | `<id>` |
| `DOCUSIGN_ACCOUNT_ID` | `<id>` |
| `AZURE_STORAGE_CONNECTION_STRING` | `DefaultEndpoints...` |

**Startup Command:** `node src/index.js`

---

## Monitoring & Logs

### View Live Logs
1. Azure Portal → App Service → **Monitoring** → **Log stream**
2. Or use Azure CLI:
   ```bash
   az webapp log tail --name rg-opulanz-frontend --resource-group YOUR_RG
   ```

### Check App Health
- Frontend: `https://rg-opulanz-frontend-hdd4ddcvd4gsc6cx.canadacentral-01.azurewebsites.net/en`
- Backend: `https://rg-opulanz-backend-ffa3bgfze4a4g6gf.canadacentral-01.azurewebsites.net/health`

---

## Custom Domain (Optional)

To use `opulanz.com` instead of the azurewebsites.net URL:
1. Azure Portal → App Service → **Custom domains**
2. Click **+ Add custom domain**
3. Enter your domain name
4. Add the provided DNS records to your domain registrar
5. Click **Validate** then **Add custom domain**

---

## CORS Configuration

The backend allows these origins by default:
- `http://localhost:3000` through `3010`
- `https://rg-opulanz-frontend-hdd4ddcvd4gsc6cx.canadacentral-01.azurewebsites.net`
- `https://opulanz.com`
- `capacitor://localhost` (mobile app)

To add a new origin, edit `backend/src/index.js` → `allowedOrigins` array.
