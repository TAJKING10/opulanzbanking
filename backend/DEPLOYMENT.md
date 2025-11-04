# 🚀 Deployment Guide - Opulanz Banking API

This guide covers deploying your Node.js backend to Azure App Service.

---

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Method 1: Automated GitHub Actions](#method-1-automated-github-actions-recommended)
- [Method 2: Azure CLI Script](#method-2-azure-cli-script)
- [Method 3: Manual Azure Portal](#method-3-manual-azure-portal)
- [Post-Deployment](#post-deployment)
- [Monitoring & Logs](#monitoring--logs)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- ✅ Azure account (free tier works)
- ✅ Azure PostgreSQL database running (opulanz-pg)
- ✅ Local backend tested and working (`npm start`)
- ✅ Database migration completed (`npm run migrate`)
- ✅ Git repository (for GitHub Actions)

---

## Method 1: Automated GitHub Actions (Recommended)

### Step 1: Create Azure Web App

1. **Go to Azure Portal:** https://portal.azure.com

2. **Create Web App:**
   - Click "+ Create a resource"
   - Search "Web App"
   - Click "Create"

3. **Fill in details:**
   - **Subscription:** Your Azure subscription
   - **Resource Group:** `opulanz-resources` (create new if needed)
   - **Name:** `opulanz-banking-api` (must be globally unique)
   - **Publish:** Code
   - **Runtime stack:** Node 20 LTS
   - **Operating System:** Linux
   - **Region:** West Europe (close to France/Luxembourg)
   - **Pricing Plan:** B1 Basic (or F1 Free for testing)

4. **Click "Review + Create"** → **Create**

5. **Wait for deployment** (2-3 minutes)

### Step 2: Get Publish Profile

1. **Go to your Web App:** `opulanz-banking-api`

2. **Download publish profile:**
   - Click "Get publish profile" (top toolbar)
   - Save the `.PublishSettings` file

3. **Copy file contents:**
   - Open the downloaded file in a text editor
   - Copy ALL the XML content

### Step 3: Configure GitHub Secrets

1. **Go to your GitHub repository**

2. **Navigate to:** Settings → Secrets and variables → Actions

3. **Click "New repository secret"**

4. **Add secret:**
   - **Name:** `AZURE_WEBAPP_PUBLISH_PROFILE`
   - **Value:** Paste the XML content from publish profile
   - Click "Add secret"

### Step 4: Configure Environment Variables in Azure

1. **Go to Azure Portal → opulanz-banking-api**

2. **Left sidebar:** Settings → **Environment variables**

3. **Click "+ Add"** and add each:

   | Name | Value |
   |------|-------|
   | `NODE_ENV` | `production` |
   | `DB_HOST` | `opulanz-pg.postgres.database.azure.com` |
   | `DB_USER` | `opulanz_admin` |
   | `DB_PASSWORD` | Your Azure PG password |
   | `DB_NAME` | `postgres` |
   | `DB_PORT` | `5432` |
   | `PORT` | `8080` |

4. **Click "Apply"** at the bottom

### Step 5: Enable Azure PostgreSQL Access

1. **Go to:** opulanz-pg → Networking

2. **Add firewall rule:**
   - **Rule name:** `AllowAzureServices`
   - Enable: "Allow public access from any Azure service within Azure to this server"
   - **Save**

### Step 6: Deploy via GitHub Actions

1. **Push your code to GitHub:**
   ```bash
   cd C:\Users\Toufi\AndroidStudioProjects\opulanzbanking
   git add .
   git commit -m "Add backend and deployment workflow"
   git push origin main
   ```

2. **Watch deployment:**
   - Go to GitHub → Actions tab
   - You'll see "Deploy Backend to Azure" workflow running
   - Wait for green checkmark (3-5 minutes)

3. **Test your API:**
   ```
   https://opulanz-banking-api.azurewebsites.net/health
   ```

   Should return:
   ```json
   {
     "status": "ok",
     "message": "Opulanz Banking API is running"
   }
   ```

✅ **Done!** Every push to `main` that changes `backend/**` will auto-deploy.

---

## Method 2: Azure CLI Script

### Step 1: Install Azure CLI

**Windows:**
```powershell
winget install Microsoft.AzureCLI
```

**Mac:**
```bash
brew install azure-cli
```

**Linux:**
```bash
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
```

### Step 2: Login to Azure

```bash
az login
```

This opens your browser for authentication.

### Step 3: Make Script Executable

**Git Bash / WSL / Mac / Linux:**
```bash
cd backend
chmod +x azure-deploy.sh
```

### Step 4: Run Deployment Script

```bash
./azure-deploy.sh
```

The script will:
- ✅ Create resource group
- ✅ Create App Service plan
- ✅ Create Web App
- ✅ Configure environment variables
- ✅ Deploy your code
- ✅ Show your live URL

**Expected output:**
```
╔════════════════════════════════════════════════════════╗
║   Deployment Complete!                                 ║
╚════════════════════════════════════════════════════════╝

🎉 Your API is now live at:
   https://opulanz-banking-api.azurewebsites.net

Test endpoints:
   Health: https://opulanz-banking-api.azurewebsites.net/health
   Users:  https://opulanz-banking-api.azurewebsites.net/api/users
```

---

## Method 3: Manual Azure Portal

### Step 1: Create Web App (Same as Method 1)

Follow Method 1, Steps 1-2

### Step 2: Configure Deployment

1. **In Azure Portal → opulanz-banking-api**

2. **Deployment Center (left sidebar)**

3. **Choose source:**
   - **Local Git**
   - Click "Save"

4. **Copy Git URL** (shown after saving)

### Step 3: Deploy Code

```bash
cd backend

# Add Azure remote
git init  # If not already a git repo
git remote add azure <PASTE_GIT_URL_HERE>

# Commit and push
git add .
git commit -m "Initial backend deployment"
git push azure main
```

### Step 4: Configure Environment Variables

Same as Method 1, Step 4

---

## Post-Deployment

### 1. Run Database Migration (One-Time)

**Option A: Using Azure SSH**

1. Azure Portal → opulanz-banking-api → **SSH** (left sidebar)
2. In terminal:
   ```bash
   cd site/wwwroot
   node src/migrations/run-migration.js
   ```

**Option B: Using Kudu Console**

1. Go to: `https://opulanz-banking-api.scm.azurewebsites.net/DebugConsole`
2. Navigate to `site/wwwroot`
3. Run:
   ```bash
   node src/migrations/run-migration.js
   ```

### 2. Test All Endpoints

```bash
BASE_URL="https://opulanz-banking-api.azurewebsites.net"

# Health check
curl $BASE_URL/health

# Get users
curl $BASE_URL/api/users

# Create user
curl -X POST $BASE_URL/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@opulanz.com","role":"user"}'
```

### 3. Update Frontend to Use Production API

In your Next.js `.env.local`:
```env
NEXT_PUBLIC_API_URL=https://opulanz-banking-api.azurewebsites.net
```

---

## Monitoring & Logs

### View Live Logs

**Method 1: Azure CLI**
```bash
az webapp log tail \
  --name opulanz-banking-api \
  --resource-group opulanz-resources
```

**Method 2: Azure Portal**
1. Portal → opulanz-banking-api
2. Monitoring → **Log stream**

### Enable Application Insights (Recommended)

1. Portal → opulanz-banking-api
2. Settings → **Application Insights**
3. Click "Turn on Application Insights"
4. Create new resource
5. Apply

Provides:
- Request/response times
- Error tracking
- Performance metrics
- Custom telemetry

### Download Logs

```bash
az webapp log download \
  --name opulanz-banking-api \
  --resource-group opulanz-resources \
  --log-file logs.zip
```

---

## Troubleshooting

### Issue 1: Application Error on Startup

**Symptom:** "Application Error" page when visiting URL

**Solution:**
1. Check logs: `az webapp log tail ...`
2. Common causes:
   - Missing environment variables
   - Database connection failed
   - Port configuration (should be 8080)

**Fix:**
- Verify all env vars are set
- Check PostgreSQL firewall allows Azure services
- Set `PORT=8080` in environment variables

### Issue 2: Database Connection Timeout

**Symptom:** "Connection timeout" in logs

**Solution:**
1. Azure Portal → opulanz-pg → Networking
2. Enable "Allow public access from any Azure service within Azure"
3. Add specific outbound IP of App Service:
   - Portal → opulanz-banking-api → Properties
   - Copy "Outbound IP addresses"
   - Add each to PostgreSQL firewall

### Issue 3: 404 on API Routes

**Symptom:** `/health` works but `/api/users` returns 404

**Solution:**
- Check logs for startup errors
- Verify `package.json` has correct `start` script
- Ensure all route files are included in deployment

### Issue 4: Environment Variables Not Loading

**Symptom:** "DB_PASSWORD is undefined"

**Solution:**
1. Don't commit `.env` file (it's gitignored)
2. Set environment variables in Azure Portal:
   - Settings → Environment variables
   - Add all required variables
   - Click "Apply"
3. Restart app:
   ```bash
   az webapp restart \
     --name opulanz-banking-api \
     --resource-group opulanz-resources
   ```

### Issue 5: Deployment Succeeds but App Crashes

**Check startup command:**
1. Portal → opulanz-banking-api
2. Settings → Configuration
3. General settings → **Startup Command**
4. Should be: `npm start` or `node src/index.js`

**Check Node version:**
1. Configuration → General settings
2. Stack: Node 20 LTS
3. Save changes

---

## Scaling & Performance

### Vertical Scaling (More Power)

Upgrade pricing tier:
1. Portal → opulanz-banking-api
2. Settings → **Scale up (App Service plan)**
3. Choose P1V2 or higher for production

### Horizontal Scaling (More Instances)

1. Portal → opulanz-banking-api
2. Settings → **Scale out (App Service plan)**
3. Configure autoscaling:
   - Based on CPU usage
   - Min instances: 1
   - Max instances: 3-10

### Connection Pooling

Already configured in `db.js`:
```javascript
max: 20,  // Max connections per instance
```

For multiple instances:
- Max connections = instances × 20
- Ensure Azure PostgreSQL can handle it
- Upgrade database tier if needed

---

## Security Best Practices

### 1. Use Managed Identity (Advanced)

Instead of password-based authentication:

```bash
az webapp identity assign \
  --name opulanz-banking-api \
  --resource-group opulanz-resources
```

Then configure PostgreSQL to use Azure AD authentication.

### 2. Enable HTTPS Only

```bash
az webapp update \
  --name opulanz-banking-api \
  --resource-group opulanz-resources \
  --set httpsOnly=true
```

### 3. Add Custom Domain (Optional)

1. Portal → opulanz-banking-api
2. Settings → **Custom domains**
3. Add your domain: `api.opulanz.com`
4. Configure DNS CNAME record
5. Add SSL certificate (free with App Service)

### 4. Restrict Database Access

In PostgreSQL firewall:
- Remove "Allow all Azure services"
- Add only specific App Service outbound IPs

---

## Cost Estimation

| Resource | Tier | Monthly Cost (EUR) |
|----------|------|--------------------|
| App Service | B1 Basic | ~€12 |
| App Service | F1 Free | €0 (limited) |
| PostgreSQL | B1ms Basic | ~€20 |
| **Total (Basic)** | | **~€32/month** |

For production:
| Resource | Tier | Monthly Cost (EUR) |
|----------|------|--------------------|
| App Service | P1V2 Premium | ~€60 |
| PostgreSQL | GP_Gen5_2 | ~€80 |
| **Total (Production)** | | **~€140/month** |

---

## Next Steps

After successful deployment:

1. **Configure CI/CD**
   - ✅ GitHub Actions already set up
   - Deploys on every push to `main`

2. **Add Monitoring**
   - Enable Application Insights
   - Set up alerts for errors
   - Monitor performance metrics

3. **Implement Authentication**
   - Add JWT token authentication
   - Secure API endpoints
   - Implement role-based access

4. **Add More Features**
   - Rate limiting
   - API documentation (Swagger)
   - Input validation
   - Error tracking (Sentry)

5. **Load Testing**
   - Test with production-like traffic
   - Optimize database queries
   - Configure caching if needed

---

## Support & Resources

- **Azure App Service Docs:** https://learn.microsoft.com/azure/app-service/
- **Azure PostgreSQL Docs:** https://learn.microsoft.com/azure/postgresql/
- **GitHub Actions Docs:** https://docs.github.com/actions

---

**🎉 Congratulations!** Your backend is now running in the cloud! 🚀
