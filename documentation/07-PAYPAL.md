# 07 — PayPal Integration

## Overview

Opulanz uses **PayPal v6 Web SDK** (latest) for payment processing. Currently configured in **sandbox mode** (test payments).

---

## Accounts & Credentials

### PayPal Developer Account
- Login at: https://developer.paypal.com
- Sign in with the business PayPal account email

### Sandbox Credentials (Currently Active)

| Credential | Value |
|-----------|-------|
| Client ID | `ASfDlkfY0QexOMLyaQl7LzQP00oDbv3I2j9EkPcBNfSSS6TdwotWY50J3IQWEN17mqpB92UbVY97u3bJ` |
| Secret | Stored in `backend/.env` as `PAYPAL_SECRET` |
| Environment | Sandbox |
| Currency | EUR |

---

## How to Find / Update Credentials

1. Go to https://developer.paypal.com/dashboard
2. Click **Apps & Credentials** in the top menu
3. Select your app (or create one: **Create App**)
4. You will see:
   - **Client ID** — copy this
   - **Secret** — click "Show" to copy this
5. Update these values:
   - Frontend: `NEXT_PUBLIC_PAYPAL_CLIENT_ID` in `.env`
   - Backend: `PAYPAL_CLIENT_ID` and `PAYPAL_SECRET` in `backend/.env`

---

## How to Switch to Live (Real Money)

1. Go to https://developer.paypal.com/dashboard → Apps & Credentials
2. Toggle the switch from **Sandbox** to **Live** at the top
3. Get your **Live Client ID** and **Live Secret**
4. Update:
   - Frontend `.env`: `NEXT_PUBLIC_PAYPAL_CLIENT_ID=<live_client_id>`
   - Backend `backend/.env`:
     ```env
     PAYPAL_CLIENT_ID=<live_client_id>
     PAYPAL_SECRET=<live_secret>
     PAYPAL_ENV=live
     ```
5. In `components/paypal-buttons.tsx`, the SDK URL automatically uses production based on the domain.

---

## Sandbox Test Accounts

To test payments without real money:

1. Go to https://developer.paypal.com/dashboard → Sandbox → Accounts
2. You will see a **buyer** and **seller** test account
3. Use the **buyer** account to complete test payments:
   - Email: (shown in developer dashboard)
   - Password: (shown in developer dashboard)

### Default Sandbox Buyer Account
PayPal creates default sandbox accounts when you create an app. Check your Developer Dashboard for exact credentials.

---

## Frontend Implementation

**File:** `components/paypal-buttons.tsx`

```
SDK URL: https://www.sandbox.paypal.com/web-sdk/v6/core
```

### Flow:
1. SDK loads from PayPal CDN
2. `paypal.createInstance({ clientId, components: ["paypal-payments"] })`
3. `createPayPalOneTimePaymentSession({ onApprove, onCancel, onError })`
4. User clicks Pay → `session.start({ presentationMode: "auto" }, createOrder)`
5. `createOrder` calls `POST /api/paypal/create-order` on backend
6. On approval, `captureOrder` calls `POST /api/paypal/capture-order/:orderId`

### Props
```typescript
<PayPalButtons
  amount="150.00"
  description="Investment Advisory Consultation"
  currency="EUR"
  onSuccess={(orderId, details) => { /* move to next step */ }}
  onError={(message) => { /* show error */ }}
/>
```

---

## Backend Implementation

**File:** `backend/src/routes/paypal.js`

### Create Order
```
POST /api/paypal/create-order
Body: { amount: "150.00", currency: "EUR", description: "..." }
Returns: { orderId: "6GD..." }
```

### Capture Order
```
POST /api/paypal/capture-order/:orderId
Returns: { status: "COMPLETED", payer: {...}, purchase_units: [...] }
```

### How Authentication Works
The backend exchanges Client ID + Secret for a temporary **access token** from PayPal before every API call:
```
POST https://api-m.sandbox.paypal.com/v1/oauth2/token
Authorization: Basic base64(clientId:secret)
Body: grant_type=client_credentials
→ Returns: { access_token: "A21..." }
```

---

## Service Prices

| Service | Price (EUR) |
|---------|------------|
| Investment Advisory Consultation | 150.00 (configurable) |
| Tax Advisory | Set on booking page |

The amount is passed dynamically from the page to the `PayPalButtons` component.

---

## Webhooks (Optional — Advanced)

To receive real-time payment notifications:
1. Go to PayPal Developer Dashboard → Webhooks
2. Add endpoint: `https://your-backend.azurewebsites.net/api/paypal/webhook`
3. Select events: `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.DENIED`
4. Add handler in `backend/src/routes/paypal.js`

---

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| "PayPal failed to initialize" | Wrong Client ID or sandbox issue | Check `NEXT_PUBLIC_PAYPAL_CLIENT_ID` |
| "PayPal auth failed" | Wrong secret | Check `PAYPAL_SECRET` in backend `.env` |
| "Could not load PayPal" | Network/firewall | Check internet connection |
| Payment approved but capture failed | Backend down | Ensure backend is running on port 5000 |
