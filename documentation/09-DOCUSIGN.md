# 09 — DocuSign Integration

## Overview

DocuSign is used for **electronic signatures** on KYC documents, mission letters, and legal agreements. It is integrated via the DocuSign eSign SDK using **JWT authentication**.

---

## Accounts

| Setting | Value |
|---------|-------|
| DocuSign Environment | Sandbox (Demo) |
| Login Portal (Sandbox) | https://admindemo.docusign.com |
| Login Portal (Production) | https://admin.docusign.com |
| Developer Signup | https://go.docusign.com/sandbox/productshot/ |

---

## Configuration Required

All DocuSign values go in `backend/.env`:

```env
DOCUSIGN_INTEGRATION_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
DOCUSIGN_USER_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
DOCUSIGN_ACCOUNT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
DOCUSIGN_PRIVATE_KEY_PATH=C:/Users/Toufi/AndroidStudioProjects/azuree/docusign_private.pem
DOCUSIGN_BASE_PATH=https://demo.docusign.net/restapi
DOCUSIGN_AUTH_SERVER=account-d.docusign.com
```

The private key file already exists at:
`C:\Users\Toufi\AndroidStudioProjects\azuree\docusign_private.pem`

---

## Step-by-Step DocuSign Setup

### Step 1 — Create Developer Account

1. Go to https://go.docusign.com/sandbox/productshot/
2. Click **Start Free Trial** or **Sign Up**
3. Use a valid email address
4. Verify your email
5. Complete account setup

### Step 2 — Create Integration Key

1. Log in at https://admindemo.docusign.com
2. Click your name (top right) → **Settings**
3. In the left menu: **Apps and Keys**
4. Click **+ Add App and Integration Key**
5. App Name: `Opulanz Banking`
6. Copy the **Integration Key** (looks like a UUID)
7. Save it as `DOCUSIGN_INTEGRATION_KEY`

### Step 3 — Generate RSA Key Pair

1. In the same App configuration screen
2. Under **Authentication**, click **+ Generate RSA**
3. DocuSign shows you the private key — **copy it immediately** (shown only once)
4. Create/overwrite the file: `C:\Users\Toufi\AndroidStudioProjects\azuree\docusign_private.pem`
5. Paste the private key content there

### Step 4 — Add Redirect URIs

1. Still in App configuration
2. Under **Additional settings** → **Redirect URIs** → click **+ Add URI**
3. Add both:
   ```
   http://localhost:3000
   http://localhost:5000/api/docusign/callback
   https://rg-opulanz-frontend-hdd4ddcvd4gsc6cx.canadacentral-01.azurewebsites.net
   https://rg-opulanz-backend-ffa3bgfze4a4g6gf.canadacentral-01.azurewebsites.net/api/docusign/callback
   ```

### Step 5 — Get Your User ID

1. Go to your DocuSign profile
2. Click your name → **My Preferences** → **API and Keys**
3. Copy the **User ID** (UUID format)
4. Save as `DOCUSIGN_USER_ID`

### Step 6 — Get Your Account ID

1. Same page: **API and Keys**
2. Copy the **API Account ID**
3. Save as `DOCUSIGN_ACCOUNT_ID`

### Step 7 — Grant JWT Consent (CRITICAL)

Before the app can use JWT authentication, you must grant consent **once**:

1. Open this URL in your browser (replace `YOUR_INTEGRATION_KEY`):
   ```
   https://account-d.docusign.com/oauth/auth?response_type=code&scope=signature%20impersonation&client_id=YOUR_INTEGRATION_KEY&redirect_uri=http://localhost:3000
   ```
2. Log in with your DocuSign account
3. Click **Accept**
4. You will be redirected to localhost:3000 (which may show an error) — this is normal
5. Consent is now permanently granted for this integration key

---

## Private Key File

The private key file is already in the project:
`C:\Users\Toufi\AndroidStudioProjects\azuree\docusign_private.pem`

Format:
```
-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEA...
...
-----END RSA PRIVATE KEY-----
```

> **IMPORTANT:** Never commit this file to Git. It is in `.gitignore`.

---

## How DocuSign Works in the App

**File:** `backend/src/services/docusign.js`

### Flow:
```
1. Application is submitted (KYC/KYB)
2. Backend generates PDF (using pdfGenerator.js)
3. PDF is uploaded to Azure Blob Storage
4. Backend calls DocuSign API:
   - Creates envelope with PDF attached
   - Adds signer (customer email + name)
   - Sends envelope
5. Customer receives email from DocuSign with signing link
6. Customer signs the document
7. DocuSign webhook notifies backend (status = "completed")
8. Backend downloads signed document
9. Signed PDF stored in Azure Blob Storage
```

### Key Functions
```javascript
// Send document for signature
sendDocumentForSignature({
  signerEmail: "john@example.com",
  signerName: "John Doe",
  documentBase64: "<pdf as base64>",
  documentName: "KYC Questionnaire.pdf",
  emailSubject: "Please sign your Opulanz documents"
})

// Check signature status
getEnvelopeStatus(envelopeId)

// Download signed document
downloadSignedDocument(envelopeId)
```

---

## Switching to Production

When ready for real clients:

1. Change sandbox URLs to production:
   ```env
   DOCUSIGN_BASE_PATH=https://na4.docusign.net/restapi
   DOCUSIGN_AUTH_SERVER=account.docusign.com
   ```
2. Create a new Integration Key in the production admin console
3. Generate new RSA keys for production
4. Grant JWT consent on production
5. Update `DOCUSIGN_INTEGRATION_KEY`, `DOCUSIGN_USER_ID`, `DOCUSIGN_ACCOUNT_ID`

---

## Testing DocuSign

```bash
# Test sending a document
node test-docusign.js

# Or via API
curl -X POST http://localhost:5000/api/documents/send-for-signature \
  -H "Content-Type: application/json" \
  -d '{
    "documentId": 1,
    "signerEmail": "test@example.com",
    "signerName": "Test User"
  }'
```

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| `consent_required` | Go to the consent URL in Step 7 and accept |
| `invalid_grant` | Private key mismatch — regenerate RSA keys |
| `USER_LACKS_PERMISSIONS` | Wrong User ID or Account ID |
| `ENVELOPE_DOES_NOT_EXIST` | Wrong envelope ID in capture call |
| `invalid_client` | Wrong Integration Key |
