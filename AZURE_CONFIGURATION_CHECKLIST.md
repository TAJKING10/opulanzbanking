# ✅ Azure Configuration Checklist

**Complete this checklist before deploying to ensure 100% success**

---

## 📋 Pre-Deployment Checklist

### ☑️ Step 1: Azure App Service - Application Settings

Go to: **Azure Portal → rg-opulanz-frontend → Configuration → Application settings**

Click **"+ New application setting"** and add each of these:

#### Required Settings:

| Name | Value | Purpose |
|------|-------|---------|
| `NEXT_PUBLIC_BASE_URL` | `https://rg-opulanz-frontend.azurewebsites.net` | SEO, canonical URLs, hreflang |
| `NODE_ENV` | `production` | Enables production optimizations |
| `WEBSITE_NODE_DEFAULT_VERSION` | `20-lts` | Sets Node.js 20 LTS |
| `WEBSITE_NODE_LOG_ENABLED` | `true` | Enables logging for debugging |
| `PORT` | `8080` | Port for Next.js server |

**After adding all settings:**
1. Click **"Save"** at the top
2. Click **"Continue"** to restart the app

---

### ☑️ Step 2: Azure App Service - General Settings

Go to: **Azure Portal → rg-opulanz-frontend → Configuration → General settings**

#### Stack Settings:

- **Stack:** `Node`
- **Major version:** `20 LTS`
- **Minor version:** `20 LTS`

#### Platform Settings:

- **Platform:** `64 Bit`
- **Managed pipeline version:** `Integrated`
- **FTP state:** `Disabled` (recommended for security)
- **HTTP version:** `2.0`
- **ARR affinity:** ❌ **OFF** (important for load balancing)
- **HTTPS Only:** ✅ **ON** (required for production)

#### Debugging:

- **Remote debugging:** ❌ OFF

#### Incoming client certificates:**

- **Client certificate mode:** `Ignore`

#### Startup Command:

- Leave blank or use: `npm start`

**After configuring:**
1. Click **"Save"** at the top
2. Click **"Continue"** to restart

---

### ☑️ Step 3: Azure App Service - Always On

Go to: **Azure Portal → rg-opulanz-frontend → Configuration → General settings**

Scroll down to **Application settings** section:

- **Always On:** ✅ **ON**

**Why critical:** Prevents cold starts, keeps your app running 24/7

⚠️ **Note:** Always On requires at least Basic tier (B1) or higher. Free tier doesn't support it.

---

### ☑️ Step 4: Verify Service Plan

Go to: **Azure Portal → rg-opulanz-frontend → Scale up (App Service plan)**

**Recommended minimum for production:**
- **Tier:** Basic B1 or higher
- **Features needed:**
  - Always On (✅)
  - Custom domains (✅)
  - SSL/TLS (✅)

**If you're on Free tier:**
- Upgrade to at least **Basic B1** for production use
- Free tier will have cold starts and can't use Always On

---

### ☑️ Step 5: Health Check Configuration (Optional but Recommended)

Go to: **Azure Portal → rg-opulanz-frontend → Health check**

- **Enable health check:** ✅ ON
- **Path:** `/api/health`
- **Interval (seconds):** `30`

**What this does:**
- Azure will ping `/api/health` every 30 seconds
- If the app becomes unhealthy, Azure will restart it automatically
- Provides monitoring and auto-healing

---

### ☑️ Step 6: SSL/TLS Certificates

Go to: **Azure Portal → rg-opulanz-frontend → TLS/SSL settings**

#### HTTPS Only:
- **HTTPS Only:** ✅ **ON** (force HTTPS)

#### TLS/SSL Version:
- **Minimum TLS Version:** `1.2`

#### Certificates:
- If using custom domain, add SSL certificate here
- Azure provides free managed certificates for custom domains

---

### ☑️ Step 7: Custom Domain (If Applicable)

If using a custom domain like `opulanz.com`:

Go to: **Azure Portal → rg-opulanz-frontend → Custom domains**

1. Click **"+ Add custom domain"**
2. Enter your domain: `opulanz.com` or `www.opulanz.com`
3. Add DNS records at your domain provider:

```
Type: CNAME
Host: www
Value: rg-opulanz-frontend.azurewebsites.net

Type: TXT
Host: asuid.www
Value: <verification ID from Azure>
```

4. After DNS verification, add SSL certificate
5. **Update environment variable:**
   - Change `NEXT_PUBLIC_BASE_URL` from:
     - `https://rg-opulanz-frontend.azurewebsites.net`
   - To:
     - `https://opulanz.com`

---

### ☑️ Step 8: Application Insights (Recommended)

Go to: **Azure Portal → rg-opulanz-frontend → Application Insights**

1. Click **"Turn on Application Insights"**
2. Select **"Create new resource"** or use existing
3. Enable:
   - ✅ **Enable Application Insights**
   - ✅ **Enable Profiler**
   - ✅ **Enable Snapshot Debugger**

**Benefits:**
- Performance monitoring
- Error tracking
- Request tracing
- Custom metrics

---

### ☑️ Step 9: Deployment Center

Go to: **Azure Portal → rg-opulanz-frontend → Deployment Center**

Verify:
- **Source:** Azure DevOps
- **Organization:** Your organization
- **Project:** Your project
- **Repository:** Your repository
- **Branch:** `main`

**Make sure:**
- Service connection is configured correctly
- Pipeline has permission to deploy

---

### ☑️ Step 10: Verify Files in Repository

Make sure these files exist and are committed:

```bash
✅ web.config                          # IIS routing (CRITICAL)
✅ package.json                        # Dependencies
✅ package-lock.json                   # Lock file
✅ next.config.js                      # Next.js config
✅ middleware.ts                       # i18n middleware
✅ i18n/request.ts                     # i18n config
✅ i18n/routing.ts                     # Routing config
✅ app/[locale]/layout.tsx             # Main layout
✅ app/page.tsx                        # Root redirect
✅ app/api/health/route.ts             # Health check
✅ .env.production                     # Production env vars
✅ azure-pipelines-frontend.yml        # Deployment pipeline
```

**Verify in Git:**
```bash
git status
git add .
git commit -m "Azure configuration optimizations"
```

---

## 🚀 Deployment Process

### Step 1: Push to Repository

```bash
git add .
git commit -m "Final Azure configuration and optimizations"
git push origin main
```

### Step 2: Monitor Pipeline

1. Go to Azure DevOps → Pipelines
2. Watch the pipeline run
3. Expected stages:
   - ✅ Install Node.js 20
   - ✅ Install dependencies
   - ✅ Prepare deploy folder
   - ✅ Archive files
   - ✅ Deploy to Azure App Service

**Expected time:** 3-5 minutes

### Step 3: Monitor Azure Deployment

1. Go to Azure Portal → rg-opulanz-frontend → Deployment Center
2. Click on latest deployment
3. Watch logs for:
   - ✅ Oryx build detection
   - ✅ Running npm install
   - ✅ Running npm run build
   - ✅ Starting npm start

**Expected time:** 5-10 minutes for first deployment

### Step 4: Check Application Logs

```bash
az webapp log tail --name rg-opulanz-frontend --resource-group your-resource-group
```

Or in Azure Portal:
**rg-opulanz-frontend → Monitoring → Log stream**

Look for:
```
✅ Next.js 14.x.x
✅ Server started on port 8080
✅ Ready in X seconds
```

---

## ✅ Post-Deployment Verification

### Test 1: Homepage

Visit:
```
https://rg-opulanz-frontend.azurewebsites.net/en
https://rg-opulanz-frontend.azurewebsites.net/fr
```

**Expected:** Homepage loads without errors

---

### Test 2: Root Redirect

Visit:
```
https://rg-opulanz-frontend.azurewebsites.net
```

**Expected:** Automatically redirects to `/en`

---

### Test 3: Page Refresh (CRITICAL TEST)

1. Visit: `https://rg-opulanz-frontend.azurewebsites.net/fr/open-account`
2. Press **Ctrl + F5** (hard refresh)

**Expected:** ✅ Page reloads successfully (NO 404)

❌ **If you get 404:** web.config is not deployed or not working

---

### Test 4: Deep Link Navigation

Click on links in the navigation menu:
- Open Account
- Company Formation
- Services

**Expected:** All pages load without 404 errors

---

### Test 5: Health Check

Visit:
```
https://rg-opulanz-frontend.azurewebsites.net/api/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-13T...",
  "service": "opulanz-frontend",
  "version": "1.0.0",
  "environment": "production"
}
```

---

### Test 6: SEO Tags (View Source)

1. Visit any page
2. Right-click → "View page source"
3. Search for:

```html
✅ <link rel="canonical" href="https://...">
✅ <link rel="alternate" hreflang="en" href="...">
✅ <link rel="alternate" hreflang="fr" href="...">
✅ <link rel="alternate" hreflang="x-default" href="...">
✅ <meta property="og:title" content="...">
✅ <meta property="og:description" content="...">
```

---

### Test 7: Browser Console

1. Open browser DevTools (F12)
2. Check **Console** tab

**Expected:** No errors (some warnings are OK)

❌ **Red errors:** Investigate and fix

---

### Test 8: Network Performance

1. Open DevTools → Network tab
2. Reload page
3. Check:
   - ✅ All resources load (200 status)
   - ✅ _next/* files load correctly
   - ✅ Images load
   - ✅ No 404 errors

---

## 🚨 Troubleshooting

### Issue 1: 404 on Page Refresh

**Symptoms:**
- Homepage works
- Navigation works
- Refreshing deep pages returns 404

**Cause:** web.config not deployed or not working

**Fix:**
1. Verify `web.config` exists in repository root
2. Check it's not in `.gitignore`
3. Redeploy
4. Check Azure logs for IIS errors

---

### Issue 2: Build Fails on Azure

**Symptoms:** Pipeline succeeds but Azure build fails

**Check Azure logs:**
```bash
az webapp log tail --name rg-opulanz-frontend --resource-group your-rg
```

**Common causes:**
- Node.js version mismatch
- Missing dependencies
- Out of memory

**Fix:**
- Ensure Node.js 20 is set in configuration
- Check package.json and package-lock.json are committed
- Scale up to higher tier if memory issue

---

### Issue 3: Environment Variables Not Working

**Symptoms:** App loads but API calls fail, SEO tags missing

**Fix:**
1. Azure Portal → Configuration → Application settings
2. Verify all variables are set correctly
3. Click **"Save"** → **"Continue"**
4. Check logs to confirm variables are loaded

---

### Issue 4: Slow Cold Starts

**Symptoms:** First request takes 10+ seconds

**Fix:**
1. Enable **Always On** in Configuration
2. Upgrade to at least Basic B1 tier
3. Consider Premium tier for better performance

---

### Issue 5: Health Check Failing

**Symptoms:** Azure shows unhealthy status

**Check:**
1. Visit `/api/health` manually
2. Check if it returns 200 OK
3. Verify health check path is correct in Azure settings

---

## 📊 Expected Results After Configuration

✅ **Routing:** All routes work, no 404 on refresh
✅ **i18n:** /en and /fr work perfectly
✅ **SEO:** All pages have proper metadata
✅ **Performance:** Fast loading, Always On prevents cold starts
✅ **Monitoring:** Application Insights tracking all requests
✅ **Security:** HTTPS enforced, TLS 1.2+
✅ **Reliability:** Health checks auto-restart unhealthy instances

---

## 🎯 Final Verification Commands

Run these after deployment:

```bash
# 1. Check homepage
curl -I https://rg-opulanz-frontend.azurewebsites.net/en

# 2. Check health
curl https://rg-opulanz-frontend.azurewebsites.net/api/health

# 3. Check root redirect
curl -I https://rg-opulanz-frontend.azurewebsites.net

# 4. Check French route
curl -I https://rg-opulanz-frontend.azurewebsites.net/fr

# All should return 200 OK or 307/308 for redirects
```

---

## 📞 Support

If you encounter issues:

1. Check **AZURE_DEPLOYMENT.md** for detailed troubleshooting
2. Review Azure logs: `az webapp log tail`
3. Check Application Insights for errors
4. Verify all checklist items are completed

---

**Last Updated:** January 2026
**Target:** Azure App Service (rg-opulanz-frontend)
**Framework:** Next.js 14 with App Router
**Status:** Production Ready ✅
