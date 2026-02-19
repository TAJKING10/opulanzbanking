# 👀 Real-Time Deployment Monitoring Guide

**Use this guide to monitor your Azure deployment RIGHT NOW**

---

## 🚀 Current Status

**Commit:** 1b964e5 - "Fix: Add required root layout for Next.js App Router"
**Pushed:** ✅ YES (just now)
**Pipeline:** Should trigger within 1-2 minutes
**Expected Duration:** 5-10 minutes total

---

## 📍 Step 1: Monitor Azure DevOps Pipeline (NOW)

### Open This URL:
```
https://dev.azure.com/OpulanzDevOps/OpulanzDevOps/_build
```

### What You Should See:

#### Immediately (within 1-2 minutes):
- 🟡 **New pipeline run starting**
- Branch: `main`
- Commit message: "Fix: Add required root layout..."

#### Expected Stages (watch for green checkmarks):

```
1. ✅ Use Node.js 20             (30 seconds)
2. ✅ Install dependencies       (1-2 minutes)
3. ✅ Prepare deploy folder      (10 seconds)
4. ✅ Archive deploy files       (20 seconds)
5. ✅ Deploy to App Service      (1-2 minutes)
```

**Total pipeline time:** 3-5 minutes

---

## 📍 Step 2: Monitor Azure App Service Build

### After Pipeline Completes:

1. **Open Azure Portal:**
   ```
   https://portal.azure.com
   ```

2. **Navigate to:**
   ```
   rg-opulanz-frontend → Monitoring → Log stream
   ```

3. **Watch for these logs:**

```bash
# Azure Oryx detects Next.js
✅ Detected Next.js application

# Installing dependencies
✅ Running 'npm install --production'
✅ Installed X packages

# Building application
✅ Running 'npm run build'
✅ Creating an optimized production build
✅ Compiled successfully
✅ Generating static pages (81/81)    ← KEY SUCCESS INDICATOR
✅ Build completed

# Starting server
✅ Running 'npm start'
✅ Next.js 14.2.33
✅ - Local: http://localhost:8080      ← KEY SUCCESS INDICATOR
✅ Ready in X seconds
```

**Total build time:** 5-8 minutes

---

## 📍 Step 3: Test Deployment (After "Ready" message)

### Wait for this log line:
```
✅ Ready in X seconds
```

### Then immediately test these URLs:

#### Test 1: Health Check (FASTEST TEST)
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

✅ If you see this → **DEPLOYMENT SUCCEEDED!**

---

#### Test 2: Homepage EN
```
https://rg-opulanz-frontend.azurewebsites.net/en
```

**Expected:** ✅ Homepage loads with French/English language selector

---

#### Test 3: Homepage FR
```
https://rg-opulanz-frontend.azurewebsites.net/fr
```

**Expected:** ✅ French version of homepage

---

#### Test 4: Root Redirect
```
https://rg-opulanz-frontend.azurewebsites.net
```

**Expected:** ✅ Automatically redirects to `/en`

---

#### Test 5: Deep Link + Refresh (CRITICAL TEST)
```
1. Visit: https://rg-opulanz-frontend.azurewebsites.net/fr/open-account
2. Press: Ctrl + F5 (hard refresh)
```

**Expected:** ✅ Page reloads successfully (NO 404)

❌ **If 404:** Something is wrong with web.config or build

---

#### Test 6: SEO Tags
```
1. Visit any page
2. Right-click → "View page source"
3. Press Ctrl + F and search: "hreflang"
```

**Expected:** Should find these tags:
```html
<link rel="canonical" href="https://...">
<link rel="alternate" hreflang="en" href="...">
<link rel="alternate" hreflang="fr" href="...">
<link rel="alternate" hreflang="x-default" href="...">
```

---

## 🚨 If Deployment Fails

### Check Pipeline Logs:

1. Azure DevOps → Pipelines → Click on failed run
2. Click on failed stage
3. Read error message
4. Look for:
   - ❌ "page.tsx doesn't have a root layout" → Should NOT appear anymore
   - ❌ Node.js version errors → Set to 20 LTS in Azure
   - ❌ Out of memory → Scale up App Service Plan

---

### Check Azure Build Logs:

1. Azure Portal → rg-opulanz-frontend → Log stream
2. Look for:
   - ❌ "npm run build" failed → Check error message
   - ❌ "Module not found" → Missing dependency
   - ❌ "Port already in use" → Restart App Service

---

## ⏱️ Timeline Expectations

```
T+0:00   Push to main
T+0:01   Pipeline detected
T+0:02   Pipeline starts
T+0:05   Pipeline completes ✅
T+0:06   Azure receives ZIP
T+0:07   Azure starts build
T+0:12   Build completes ✅
T+0:13   Server starts ✅
T+0:14   READY TO TEST ✅
```

**Total: ~10-14 minutes from push to ready**

---

## ✅ Success Indicators

### In Pipeline:
- ✅ All 5 stages green
- ✅ "Deploy to App Service" succeeded
- ✅ No red X marks

### In Azure Logs:
- ✅ "Generating static pages (81/81)"
- ✅ "Build completed"
- ✅ "Ready in X seconds"
- ✅ "Server started on port 8080"

### In Browser:
- ✅ `/api/health` returns JSON
- ✅ `/en` loads homepage
- ✅ `/fr` loads French homepage
- ✅ Ctrl+F5 refresh works (no 404)
- ✅ Page source shows hreflang tags

---

## 🎯 What to Do After Success

### 1. Configure Environment Variables (if not done)

Go to: **Azure Portal → rg-opulanz-frontend → Configuration → Application settings**

Add these 5:
```
NEXT_PUBLIC_BASE_URL=https://rg-opulanz-frontend.azurewebsites.net
NODE_ENV=production
WEBSITE_NODE_DEFAULT_VERSION=20-lts
WEBSITE_NODE_LOG_ENABLED=true
PORT=8080
```

**Then:** Save → Continue (restarts app)

---

### 2. Enable Always On

Go to: **Configuration → General settings**

- Always On: ✅ **ON**

**Click:** Save → Continue

---

### 3. Set Up Health Check

Go to: **Health check**

- Enable: ✅ ON
- Path: `/api/health`
- Interval: 30

**Click:** Save

---

### 4. Test All Routes

Visit and verify:
- ✅ /en
- ✅ /fr
- ✅ /en/open-account
- ✅ /fr/open-account
- ✅ /en/company-formation
- ✅ /fr/creation-entreprise
- ✅ /en/dashboard
- ✅ /en/services

---

### 5. Test on Different Devices

- ✅ Desktop browser
- ✅ Mobile browser
- ✅ Different browsers (Chrome, Firefox, Safari, Edge)

---

## 📞 Need Help?

### If deployment succeeds:
✅ You're done! Your app is live!

### If deployment fails:
1. Check `AZURE_DEPLOYMENT.md` troubleshooting section
2. Review Azure logs carefully
3. Verify Node.js 20 is configured
4. Check environment variables are set
5. Try restarting App Service

---

## 🎉 Expected Outcome

**After 10-15 minutes:**
- ✅ Pipeline succeeded
- ✅ Azure build succeeded
- ✅ Server started
- ✅ All routes working
- ✅ No 404 errors
- ✅ SEO tags present
- ✅ Health check responding

**Your Opulanz Banking Platform is LIVE on Azure!** 🚀

---

**Start monitoring NOW!** Open Azure DevOps and watch the pipeline.
