# 🚀 Azure Deployment Guide - Opulanz Banking Platform

## Architecture Overview

**IMPORTANT:** This is a **Next.js 14** application with App Router, NOT a React SPA with React Router.

### Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Internationalization:** next-intl v3
- **Hosting:** Azure App Service (Node.js runtime)
- **CI/CD:** Azure DevOps Pipelines
- **Languages:** English (en) & French (fr)

---

## 🔧 Azure App Service Configuration

### Prerequisites
1. Azure App Service with **Node.js 20.x** runtime
2. Azure DevOps Pipeline configured
3. Service Connection to Azure

### Required Azure App Service Settings

#### Application Settings (Environment Variables)

Go to **Azure Portal → App Service → Configuration → Application settings**:

```bash
# Base URL for SEO (canonical URLs, hreflang)
NEXT_PUBLIC_BASE_URL=https://your-production-domain.com

# Node.js version
WEBSITE_NODE_DEFAULT_VERSION=20-lts

# Node environment
NODE_ENV=production

# Port (Azure sets this automatically, but good to have)
PORT=8080

# Enable Node.js logging
WEBSITE_NODE_LOG_ENABLED=true
```

#### General Settings

Go to **Configuration → General settings**:

- **Stack:** Node
- **Major version:** 20 LTS
- **Minor version:** 20 LTS
- **Startup Command:** `npm start`
- **Always On:** Enabled (important for production)
- **ARR Affinity:** Disabled (for better load balancing)

---

## 📦 Build & Deployment Process

### Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Access at http://localhost:3000/en or http://localhost:3000/fr
```

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Azure DevOps Pipeline

The pipeline (`azure-pipelines-frontend.yml`) does:

1. ✅ Uses Node.js 20.x
2. ✅ Installs dependencies (`npm ci`)
3. ✅ Copies source code to `build_output/` (excludes node_modules, .next, .git)
4. ✅ Archives to ZIP
5. ✅ Deploys ZIP to Azure App Service
6. ⚙️ **Azure builds and starts the app automatically**

#### Important Notes:
- **No pre-build on CI/CD** - Azure App Service builds the app on the server
- **Oryx Build System** - Azure automatically detects Next.js and runs `npm install && npm run build && npm start`
- **web.config** - Ensures proper routing for Next.js on IIS

---

## 🌍 Internationalization (i18n)

### URL Structure

```
Production URLs:
├── /en                    # English homepage
├── /fr                    # French homepage
├── /en/open-account       # English account opening
├── /fr/open-account       # French account opening
└── /en/company-formation  # English company formation
```

### How It Works

1. **Middleware (`middleware.ts`)** - Detects locale from URL and redirects if needed
2. **App Router (`app/[locale]/`)** - Dynamic locale segment for all routes
3. **next-intl** - Handles translations and locale-specific rendering
4. **web.config** - Ensures all routes work on Azure IIS

### Locale Detection Priority

1. URL path (`/en`, `/fr`)
2. Accept-Language header (fallback)
3. Default locale (en)

---

## 🔍 SEO Configuration

### Implemented SEO Features

✅ **Canonical URLs** - Prevents duplicate content issues
```html
<link rel="canonical" href="https://yourdomain.com/en/page" />
```

✅ **Hreflang Tags** - Tells Google about language versions
```html
<link rel="alternate" hreflang="en" href="https://yourdomain.com/en" />
<link rel="alternate" hreflang="fr" href="https://yourdomain.com/fr" />
<link rel="alternate" hreflang="x-default" href="https://yourdomain.com/en" />
```

✅ **Open Graph & Twitter Cards** - Social media previews

✅ **Robots Meta Tags** - Search engine indexing control

### Usage in Pages

```tsx
import { generateSEOMetadata } from './metadata';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return generateSEOMetadata({
    locale,
    pathname: '/open-account',
    title: 'Open Account - Opulanz',
    description: 'Open your digital banking account today',
  });
}
```

---

## 🚨 Troubleshooting

### Issue: 404 on Page Refresh in Production

**Cause:** Azure IIS not routing correctly to Next.js server

**Solution:**
- ✅ Ensure `web.config` is deployed
- ✅ Check `web.config` has proper rewrite rules
- ✅ Verify App Service is using Node.js 20

### Issue: next-intl Deprecation Warning

**Status:** ✅ **FIXED** (migrated to `i18n/request.ts`)

**Old (deprecated):**
```ts
// i18n.ts
export default getRequestConfig(async ({ locale }) => { ... });
```

**New (current):**
```ts
// i18n/request.ts
export default getRequestConfig(async ({ requestLocale }) => { ... });
```

### Issue: Build Fails on Azure

**Possible Causes:**
1. Node.js version mismatch
2. Missing dependencies
3. Out of memory

**Solutions:**
```bash
# Check Azure build logs
az webapp log tail --name rg-opulanz-frontend --resource-group your-rg

# Ensure Node.js 20.x is set
az webapp config set --name rg-opulanz-frontend --resource-group your-rg --linux-fx-version "NODE|20-lts"

# Increase memory if needed (scale up App Service Plan)
```

### Issue: Environment Variables Not Working

**Check:**
1. Azure Portal → App Service → Configuration → Application settings
2. Verify `NEXT_PUBLIC_BASE_URL` is set
3. Restart App Service after adding variables

### Issue: Slow Cold Starts

**Solutions:**
1. Enable **Always On** in App Service settings
2. Use **Premium App Service Plan** for production
3. Consider Azure Front Door for caching

---

## 📊 Monitoring & Logs

### View Application Logs

```bash
# Azure CLI
az webapp log tail --name rg-opulanz-frontend --resource-group your-rg

# Or in Azure Portal
App Service → Monitoring → Log stream
```

### Application Insights (Recommended)

1. Enable Application Insights in Azure Portal
2. Add connection string to App Service configuration
3. Monitor performance, errors, and dependencies

---

## ✅ Pre-Deployment Checklist

Before deploying to production:

- [ ] Set `NEXT_PUBLIC_BASE_URL` in Azure App Service settings
- [ ] Enable **Always On** in App Service configuration
- [ ] Verify `web.config` is in repository root
- [ ] Test all language routes (`/en`, `/fr`)
- [ ] Verify SEO metadata (view page source)
- [ ] Check hreflang tags in page source
- [ ] Test page refresh on all routes
- [ ] Monitor build logs during first deployment
- [ ] Verify all environment variables are set
- [ ] Test social media previews (Open Graph)

---

## 🔄 Rollback Procedure

If deployment fails:

1. **Azure Portal** → App Service → Deployment Center → Deployment History
2. Select previous successful deployment
3. Click **Redeploy**
4. Monitor logs

Or via Azure CLI:
```bash
az webapp deployment list-publishing-profiles --name rg-opulanz-frontend --resource-group your-rg
```

---

## 🌐 Custom Domain Setup

### Add Custom Domain

1. **Azure Portal** → App Service → Custom domains
2. Click **Add custom domain**
3. Enter your domain (e.g., `opulanz.com`)
4. Add DNS records at your domain provider:

```
Type: A
Host: @
Value: <App Service IP>

Type: TXT
Host: asuid
Value: <Verification ID>
```

5. Enable SSL/TLS:
   - **Recommended:** Use Azure Managed Certificate (free)
   - Or upload custom certificate

### Update Environment Variables

After custom domain is configured:

```bash
NEXT_PUBLIC_BASE_URL=https://opulanz.com
```

Restart App Service.

---

## 📞 Support

For deployment issues:
- Check Azure DevOps pipeline logs
- Review Azure App Service logs
- Verify all configuration settings
- Consult CLAUDE.md for project-specific changes

---

**Last Updated:** January 2026
**Deployment Target:** Azure App Service (Node.js 20 LTS)
**Application Type:** Next.js 14 with App Router
