# DocuSign & Document Management Setup Guide

## ✅ Completed Components

1. **Azure Blob Storage Service** (`backend/src/services/azureStorage.js`)
   - Upload/download/delete documents
   - Secure cloud storage integration

2. **PDF Generator Service** (`backend/src/services/pdfGenerator.js`)
   - Generate KYC questionnaires from form data
   - Create mission letters
   - Support for both Individual (PP) and Company (PM) types

3. **DocuSign Service** (`backend/src/services/docusign.js`)
   - JWT authentication
   - Send envelopes for signature
   - Track signature status
   - Download signed documents

## 🔧 Configuration Required

### 1. Azure Blob Storage Setup

1. Go to Azure Portal (https://portal.azure.com)
2. Create a Storage Account (or use existing)
3. Get your connection string from "Access keys"
4. Update `backend/.env`:
   ```
   AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=YOUR_ACCOUNT;AccountKey=YOUR_KEY;EndpointSuffix=core.windows.net
   AZURE_STORAGE_CONTAINER_NAME=opulanz-documents
   ```

### 2. DocuSign Setup

#### Step 1: Create Integration Key

1. Log in to DocuSign Admin Console:
   - Sandbox: https://admindemo.docusign.com
   - Production: https://admin.docusign.com

2. Go to **Settings** > **Apps and Keys**

3. Click **Add App and Integration Key**
   - App Name: "Opulanz Banking"
   - Copy the **Integration Key** (this is your Client ID)

#### Step 2: Generate RSA Key Pair

1. In the same app configuration, click **Generate RSA**
2. Download the private key file
3. Save it as `docusign_private.pem` in your project root:
   ```
   C:\Users\Toufi\AndroidStudioProjects\opulanzbanking\docusign_private.pem
   ```

#### Step 3: Add Redirect URI

1. In App configuration, add Redirect URI:
   ```
   http://localhost:3000
   http://localhost:5000/api/docusign/callback
   ```

#### Step 4: Get User ID

1. In DocuSign Admin, go to **My Account** or use API explorer
2. Your User ID (GUID) is shown in your profile
3. Format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

#### Step 5: Get Account ID

1. API Account ID can be found in:
   - Settings > API and Keys > API Account ID
2. Or call the UserInfo API after authentication

#### Step 6: Grant Consent (IMPORTANT!)

Before the app can use JWT, you must grant consent:

1. Visit this URL in your browser (replace YOUR_INTEGRATION_KEY):
   ```
   https://account-d.docusign.com/oauth/auth?response_type=code&scope=signature%20impersonation&client_id=YOUR_INTEGRATION_KEY&redirect_uri=http://localhost:3000
   ```

2. Log in and click **Accept**
3. You'll be redirected - that's normal, consent is now granted

#### Step 7: Update .env File

```bash
# DocuSign Configuration
DOCUSIGN_INTEGRATION_KEY=your-integration-key-here
DOCUSIGN_USER_ID=your-user-guid-here
DOCUSIGN_ACCOUNT_ID=your-account-id-here
DOCUSIGN_PRIVATE_KEY_PATH=C:/Users/Toufi/AndroidStudioProjects/opulanzbanking/docusign_private.pem
DOCUSIGN_BASE_PATH=https://demo.docusign.net/restapi
DOCUSIGN_AUTH_SERVER=account-d.docusign.com
```

### 3. Troubleshooting DocuSign Login Issues

If you're having trouble logging in:

1. **Use Incognito/Private Browser Window**
2. **Check Email Verification**:
   - DocuSign sends verification emails
   - Check spam folder

3. **Password Reset**:
   - Go to https://account-d.docusign.com (sandbox)
   - Click "Forgot Password"

4. **Create New Account** (if needed):
   - Go to https://go.docusign.com/sandbox/productshot/
   - Sign up for free developer account

## 📋 Next Steps

### 1. Update Documents Table

Run this migration to update the documents table schema:

```sql
-- Add columns for DocuSign integration
ALTER TABLE documents ADD COLUMN IF NOT EXISTS docusign_envelope_id VARCHAR(255);
ALTER TABLE documents ADD COLUMN IF NOT EXISTS docusign_status VARCHAR(50);
ALTER TABLE documents ADD COLUMN IF NOT EXISTS signed_document_url TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS sent_for_signature_at TIMESTAMP;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS signed_at TIMESTAMP;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_documents_envelope_id ON documents(docusign_envelope_id);
```

### 2. Test the System

Once configured, test the flow:

1. **Generate PDF**:
   ```bash
   curl -X POST http://localhost:5000/api/documents/generate \
     -H "Content-Type: application/json" \
     -d '{"applicationId": 1}'
   ```

2. **Send to DocuSign**:
   ```bash
   curl -X POST http://localhost:5000/api/documents/send-for-signature \
     -H "Content-Type: application/json" \
     -d '{"documentId": 1, "signerEmail": "test@example.com", "signerName": "Test User"}'
   ```

3. **Check Status**:
   ```bash
   curl http://localhost:5000/api/documents/1
   ```

## 🎯 Integration with KYC Wizard

The system will automatically:
1. Generate PDFs when KYC wizard is completed
2. Upload PDFs to Azure Blob Storage
3. Send documents to DocuSign for signature
4. Update database with envelope ID and status
5. Download signed documents when completed
6. Store signed versions in Azure

## 📞 Support

If you encounter issues:
- DocuSign Support: https://support.docusign.com
- Azure Support: https://azure.microsoft.com/en-us/support/
