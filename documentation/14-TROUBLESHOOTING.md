# 14 — Troubleshooting Guide

Common problems and exactly how to fix them.

---

## Frontend Problems

### ❌ "TypeError: Cannot read properties of undefined (reading 'call')"

**What it is:** Webpack build cache is corrupted after a bad restart.

**Fix:**
```bash
# 1. Kill all Node processes
taskkill /F /IM node.exe

# 2. Delete the build cache
cd C:\Users\Toufi\AndroidStudioProjects\azuree
rm -rf .next

# 3. Restart
npm run dev
```

---

### ❌ "Port 3000 is in use"

**What it is:** Another process (or old frontend) is using port 3000.

**Fix:** Next.js automatically tries 3001, 3002, etc. Just use whatever port it shows:
```
▲ Next.js 14.2.33
- Local: http://localhost:3004   ← use this port
```

To force-free port 3000:
```bash
taskkill /F /IM node.exe
```

---

### ❌ Page shows blank white screen

**Possible causes:**
1. Missing translation key → Check `messages/en.json` for the key used in the component
2. Build cache issue → Delete `.next` and restart
3. Component error → Open browser DevTools (F12) → Console tab to see the error

---

### ❌ Calendly widget not showing

**Check:**
1. The Calendly script is loaded: look for `widget.js` in the HTML source
2. The event URL slug exists in your Calendly account
3. The `div` has class `calendly-inline-widget`

---

### ❌ PayPal button shows "PayPal failed to initialize"

**Check:**
1. `NEXT_PUBLIC_PAYPAL_CLIENT_ID` is correct in `.env`
2. Backend is running (`http://localhost:5000/health` returns `{status:"ok"}`)
3. Click "Try Again" to reload the SDK

---

### ❌ Language switcher not working

The locale is in the URL. If switching from `/en/` to `/fr/` shows 404:
- The page must exist in both `app/[locale]/...`
- Check `messages/fr.json` has all translation keys

---

## Backend Problems

### ❌ Backend won't start — "Cannot connect to database"

**Check:**
1. Your IP is whitelisted in Azure PostgreSQL firewall:
   - Azure Portal → `opulanz-pg` → Networking → Add your IP
2. Database credentials in `backend/.env` are correct
3. SSL is enabled (Azure requires it)

---

### ❌ "Port 5000 is already in use"

```bash
# Find what's using port 5000
netstat -ano | findstr :5000

# Kill it (replace XXXX with the PID shown)
taskkill /F /PID XXXX

# Restart backend
cd backend && npm start
```

Or change the port:
```env
PORT=5001
```
And update `NEXT_PUBLIC_API_URL=http://localhost:5001`

---

### ❌ Email not sending — "Invalid login: 535"

The Gmail App Password is wrong or expired.

**Fix:**
1. Go to https://myaccount.google.com/apppasswords
2. Delete the old password
3. Create a new one
4. Update `EMAIL_PASS` in `backend/.env`

---

### ❌ PayPal order creation fails

**Check:**
1. `PAYPAL_CLIENT_ID` and `PAYPAL_SECRET` are correct in `backend/.env`
2. `PAYPAL_ENV=sandbox` (not `live` unless you have a live account)
3. Backend is running and reachable from frontend

Test directly:
```bash
curl -X POST http://localhost:5000/api/paypal/create-order \
  -H "Content-Type: application/json" \
  -d '{"amount":"150.00","currency":"EUR","description":"Test"}'
```

---

### ❌ CORS error (blocked by browser)

The frontend is on a different port than what's in `FRONTEND_URL`.

**Fix:** In `backend/src/index.js`, add your port to `allowedOrigins`:
```javascript
'http://localhost:3004',  // add your current port
```

---

## DocuSign Problems

### ❌ "consent_required"

You need to grant consent once:
1. Open in browser: `https://account-d.docusign.com/oauth/auth?response_type=code&scope=signature%20impersonation&client_id=YOUR_INTEGRATION_KEY&redirect_uri=http://localhost:3000`
2. Log in and click Accept

### ❌ "invalid_grant"

Private key doesn't match the Integration Key. Regenerate RSA keys in DocuSign Admin.

---

## Database Problems

### ❌ "relation does not exist"

Table hasn't been created yet.

**Fix:**
```bash
cd C:\Users\Toufi\AndroidStudioProjects\azuree\backend
node src/migrations/run-all-migrations.js
```

---

### ❌ "duplicate key value violates unique constraint"

Trying to insert a record that already exists.

**Fix:** Use `UPSERT` or check for existing record before inserting.

---

## Azure Production Problems

### ❌ Production site shows 502 or App not running

1. Azure Portal → App Service → **Overview** — check if status is "Running"
2. Click **Restart** to restart the app
3. Check **Log stream** for errors

### ❌ Production API returning 500

1. Azure Portal → Backend App Service → **Log stream**
2. Check environment variables are set in **Configuration** → **Application settings**
3. Make sure `NODE_ENV=production` is set

---

## Mobile App Problems

### ❌ API calls fail in the mobile app

The mobile app cannot use `localhost:5000` — it needs the real Azure URL.

**Fix:** Make sure the static export was built with:
```env
NEXT_PUBLIC_API_URL=https://rg-opulanz-backend-ffa3bgfze4a4g6gf.canadacentral-01.azurewebsites.net
```

### ❌ White screen on mobile app

1. Check that `npm run build:mobile:win` completed successfully
2. Run `npx cap sync android` after every build
3. Check the `out/` folder has HTML files

---

## Quick Diagnostic Commands

```bash
# Is frontend running?
curl http://localhost:3000/en

# Is backend running?
curl http://localhost:5000/health

# Is database accessible?
curl http://localhost:5000/api/appointments

# Check which ports are in use
netstat -ano | grep "3000\|3001\|3002\|3003\|3004\|5000"
```
