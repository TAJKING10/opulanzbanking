# 🚀 Azure Quick Reference Card

**Print this or keep it open while configuring Azure**

---

## 📝 Azure Portal Configuration (Copy-Paste Ready)

### Application Settings

Portal: **rg-opulanz-frontend → Configuration → Application settings**

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_BASE_URL` | `https://rg-opulanz-frontend.azurewebsites.net` |
| `NODE_ENV` | `production` |
| `WEBSITE_NODE_DEFAULT_VERSION` | `20-lts` |
| `WEBSITE_NODE_LOG_ENABLED` | `true` |
| `PORT` | `8080` |

**Don't forget to click "Save" → "Continue"**

---

### General Settings

Portal: **rg-opulanz-frontend → Configuration → General settings**

- Stack: `Node`
- Version: `20 LTS`
- Always On: ✅ **ON**
- ARR Affinity: ❌ **OFF**
- HTTPS Only: ✅ **ON**

**Click "Save" → "Continue"**

---

### Health Check

Portal: **rg-opulanz-frontend → Health check**

- Enable: ✅ **ON**
- Path: `/api/health`
- Interval: `30`

**Click "Save"**

---

## 🧪 Quick Test Commands

### After Deployment, Run These:

```bash
# 1. Homepage EN
curl -I https://rg-opulanz-frontend.azurewebsites.net/en

# 2. Homepage FR
curl -I https://rg-opulanz-frontend.azurewebsites.net/fr

# 3. Root redirect
curl -I https://rg-opulanz-frontend.azurewebsites.net

# 4. Health check
curl https://rg-opulanz-frontend.azurewebsites.net/api/health

# All should return 200 OK or 307/308 for redirects
```

---

## ✅ 5-Minute Verification

1. **Homepage:** Visit `/en` and `/fr` ✅
2. **Root:** Visit `/` (should redirect to `/en`) ✅
3. **Refresh:** Visit `/fr/open-account`, press Ctrl+F5 (should NOT 404) ✅
4. **Health:** Visit `/api/health` (should show JSON) ✅
5. **SEO:** View page source, search for `hreflang` ✅

---

## 🚨 If Something Fails

| Symptom | Solution |
|---------|----------|
| 404 on refresh | Check `web.config` is deployed |
| Build fails | Check Node.js version is 20 LTS |
| Env vars not working | Verify saved in Azure Portal + restart |
| Health check fails | Verify path is `/api/health` |

---

## 📚 Full Documentation

- **Setup Guide:** `AZURE_CONFIGURATION_CHECKLIST.md`
- **Deployment Guide:** `AZURE_DEPLOYMENT.md`
- **Changes Summary:** `AZURE_CHANGES_SUMMARY.md`
- **Technical Details:** `ROUTING_AND_I18N_IMPROVEMENTS.md`

---

## ⚡ Deploy Now

```bash
git add .
git commit -m "Azure deployment optimizations"
git push origin main
```

Then watch: Azure DevOps → Pipelines (3-5 min)

---

**Ready? Configure Azure settings above, then deploy!** 🚀
