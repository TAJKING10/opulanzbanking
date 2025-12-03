# DocuSign Setup Guide

Quick setup guide for DocuSign integration with Opulanz Banking Platform.

---

## Step 1: Create DocuSign Developer Account

1. Go to https://developers.docusign.com/
2. Click "Get Started for Free"
3. Complete registration
4. Verify your email

---

## Step 2: Create Integration

1. Log in to DocuSign Admin (https://admindemo.docusign.com/)
2. Go to **Settings > Apps and Keys**
3. Click **Add App and Integration Key**
4. Name: "Opulanz Banking Document Generation"
5. **Save** - You'll get your Integration Key

---

## Step 3: Generate RSA Key Pair

1. In the same page, scroll to **Service Integration**
2. Under **Authentication**, click **+ Generate RSA**
3. **Copy the Private Key** - save it immediately (you won't see it again)
4. Save the private key to: `backend/docusign_private.key`

Example private key format:
```
-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEA...
... many lines of encrypted text ...
... ends with ...
-----END RSA PRIVATE KEY-----
```

5. Click **OK**

---

## Step 4: Get User ID and Account ID

### Get User ID
1. In DocuSign Admin, go to **Settings > Apps and Keys**
2. Scroll to **Service Integration**
3. Copy the **API Username (User ID)**
   - Format: `12345678-abcd-1234-abcd-123456789012`

### Get Account ID
1. In the same page, look for **Account ID**
2. Copy it (format: `12345678-abcd-1234-abcd-123456789012`)

---

## Step 5: Configure Redirect URI

1. Still in **Settings > Apps and Keys**
2. Scroll to **Redirect URIs**
3. Click **+ Add URI**
4. Enter: `http://localhost:3000/signature-complete`
5. Click **Save**

For production, also add:
- `https://yourdomain.com/signature-complete`

---

## Step 6: Add Environment Variables

Create or update `backend/.env`:

```bash
# DocuSign Configuration
DOCUSIGN_INTEGRATION_KEY=your_integration_key_from_step_2
DOCUSIGN_USER_ID=your_user_id_from_step_4
DOCUSIGN_ACCOUNT_ID=your_account_id_from_step_4
DOCUSIGN_PRIVATE_KEY_PATH=./docusign_private.key
DOCUSIGN_OAUTH_BASE_PATH=account-d.docusign.com
DOCUSIGN_BASE_PATH=https://demo.docusign.net/restapi
DOCUSIGN_REDIRECT_URL=http://localhost:3000/signature-complete
```

Replace:
- `your_integration_key_from_step_2` with Integration Key from Step 2
- `your_user_id_from_step_4` with User ID from Step 4
- `your_account_id_from_step_4` with Account ID from Step 4

---

## Step 7: Save Private Key File

1. Create file: `backend/docusign_private.key`
2. Paste the private key you copied in Step 3
3. Ensure it starts with `-----BEGIN RSA PRIVATE KEY-----`
4. Ensure it ends with `-----END RSA PRIVATE KEY-----`

**Security Note:**
- Never commit this file to Git
- Add to `.gitignore`: `docusign_private.key`

---

## Step 8: Grant Consent

Before the first API call, you need to grant consent:

1. Replace `YOUR_INTEGRATION_KEY` with your Integration Key
2. Visit this URL in your browser:

```
https://account-d.docusign.com/oauth/auth?response_type=code&scope=signature%20impersonation&client_id=YOUR_INTEGRATION_KEY&redirect_uri=http://localhost:3000
```

3. Log in with your DocuSign account
4. Click **Allow Access**
5. You'll be redirected (even if the page shows an error, consent is granted)

**You only need to do this once per environment.**

---

## Step 9: Configure Webhooks (Optional for Testing)

Webhooks are needed to receive notifications when documents are signed.

### For Local Testing (using ngrok):

1. Install ngrok: https://ngrok.com/download
2. Start ngrok:
   ```bash
   ngrok http 5000
   ```
3. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
4. In DocuSign Admin:
   - Go to **Settings > Connect**
   - Click **Add Configuration**
   - Name: "Opulanz Webhook"
   - URL: `https://abc123.ngrok.io/api/document-generation/docusign-webhook`
   - Events: Select "Envelope Sent", "Envelope Completed", "Envelope Declined"
   - Click **Save**

### For Production:

Use your production URL:
```
https://api.opulanz.com/api/document-generation/docusign-webhook
```

---

## Step 10: Test the Integration

### Test with Node.js:

```bash
cd backend
node -e "
const { getDocuSignClient } = require('./src/services/docusign');

async function test() {
  try {
    const client = await getDocuSignClient();
    console.log('✅ DocuSign authentication successful!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Authentication failed:', error.message);
    process.exit(1);
  }
}

test();
"
```

### Expected Output:
```
✅ DocuSign authentication successful!
```

### If you get an error:

**"consent_required"**
- Go back to Step 8 and grant consent

**"invalid_client"**
- Check Integration Key in .env is correct

**"invalid_grant"**
- Check User ID and Account ID are correct
- Ensure private key file exists and is valid

---

## Complete .env File

Here's your complete .env file with all DocuSign settings:

```bash
# ==========================================
# Backend Configuration
# ==========================================
PORT=5000
NODE_ENV=development

# ==========================================
# Database Configuration (Azure PostgreSQL)
# ==========================================
DB_HOST=opulanz-pg.postgres.database.azure.com
DB_USER=opulanz_admin
DB_PASSWORD=Advensys2025Secure!
DB_NAME=postgres
DB_PORT=5432

# ==========================================
# Frontend URL
# ==========================================
FRONTEND_URL=http://localhost:3000

# ==========================================
# Logging
# ==========================================
LOG_LEVEL=debug

# ==========================================
# Narvi Banking API
# ==========================================
NARVI_API_URL=https://api.narvi.com/rest/v1.0
NARVI_API_KEY_ID=EY66Z3MKPW4K26K6
NARVI_PRIVATE_KEY_PATH=C:/Users/Toufi/AndroidStudioProjects/opulanzbanking/banking_private.pem
NARVI_API_IP_WHITELIST=80.232.250.236

# ==========================================
# Email Configuration (Gmail SMTP)
# ==========================================
EMAIL_USER=opulanz.banking@gmail.com
EMAIL_PASS=dpbqsmhgoqgblbub
ADMIN_EMAIL=opulanz.banking@gmail.com

# ==========================================
# DocuSign Configuration
# ==========================================
DOCUSIGN_INTEGRATION_KEY=your_integration_key_here
DOCUSIGN_USER_ID=your_user_id_here
DOCUSIGN_ACCOUNT_ID=your_account_id_here
DOCUSIGN_PRIVATE_KEY_PATH=./docusign_private.key
DOCUSIGN_OAUTH_BASE_PATH=account-d.docusign.com
DOCUSIGN_BASE_PATH=https://demo.docusign.net/restapi
DOCUSIGN_REDIRECT_URL=http://localhost:3000/signature-complete
```

---

## Troubleshooting

### "Cannot read private key"

**Problem:** Private key file not found or invalid format

**Solution:**
1. Check file exists: `ls backend/docusign_private.key`
2. Check first line: `head -n 1 backend/docusign_private.key`
   - Should be: `-----BEGIN RSA PRIVATE KEY-----`
3. Regenerate key in DocuSign if needed

### "Invalid authentication"

**Problem:** User ID or Account ID incorrect

**Solution:**
1. Log into DocuSign Admin
2. Go to Settings > Apps and Keys
3. Copy API Username and Account ID again
4. Update .env file

### "Unauthorized"

**Problem:** Haven't granted consent

**Solution:**
Visit the consent URL (Step 8) and allow access

---

## Production Considerations

### Use Production Environment

For production, change to production API:

```bash
DOCUSIGN_OAUTH_BASE_PATH=account.docusign.com
DOCUSIGN_BASE_PATH=https://na3.docusign.net/restapi
```

**Note:** You'll need to:
1. Create production Integration Key
2. Generate new RSA key pair for production
3. Grant consent again for production

### Security

1. **Never commit secrets to Git:**
   ```bash
   # .gitignore
   .env
   .env.*
   docusign_private.key
   *.pem
   ```

2. **Use environment variables in production:**
   - Azure App Service: Configure in Application Settings
   - Heroku: Use Config Vars
   - AWS: Use Parameter Store or Secrets Manager

3. **Rotate keys periodically:**
   - Regenerate RSA keys every 6-12 months
   - Update in DocuSign Admin and .env file

---

## Summary Checklist

- [ ] Created DocuSign developer account
- [ ] Created Integration Key
- [ ] Generated RSA key pair
- [ ] Saved private key to `docusign_private.key`
- [ ] Got User ID and Account ID
- [ ] Added redirect URI
- [ ] Updated .env file with all variables
- [ ] Granted consent
- [ ] Tested authentication
- [ ] (Optional) Configured webhooks
- [ ] Added .env and private key to .gitignore

---

**You're all set!** 🎉

The document generation system is now ready to create and send documents for electronic signature.

Test it with:
```bash
POST http://localhost:5000/api/document-generation/complete-onboarding
```

---

**Last Updated:** December 2, 2025
**Status:** Ready for Configuration
