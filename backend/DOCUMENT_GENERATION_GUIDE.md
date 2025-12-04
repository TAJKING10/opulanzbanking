# Document Generation & DocuSign Integration Guide

Complete guide for the automated document generation and electronic signature system for Opulanz Banking Platform.

---

## Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Setup Instructions](#setup-instructions)
4. [API Endpoints](#api-endpoints)
5. [Document Templates](#document-templates)
6. [DocuSign Integration](#docusign-integration)
7. [Testing the System](#testing-the-system)
8. [Troubleshooting](#troubleshooting)

---

## Overview

This system automates the complete client onboarding document workflow:

1. **Generate Documents** - Fill Word templates with client data
2. **Convert to PDF** - Transform DOCX files to PDF format
3. **Send for Signing** - Create DocuSign envelope and get signing URL
4. **Process Webhooks** - Handle DocuSign events (completed, declined, etc.)
5. **Download Signed Docs** - Retrieve and store signed documents

### Documents Generated

The system generates 6 types of onboarding documents based on MiFID compliance:

1. **DER** - Document d'Entrée en Relation
2. **Lettre de mission CIF** - Mission letter for investment advisory
3. **QCC + Profil PP** - Questionnaire for Personne Physique (Individual)
4. **QCC + Profil PM** - Questionnaire for Personne Morale (Company)
5. **Déclaration d'adéquation** - Suitability declaration
6. **Convention RTO** - Reception and Transmission of Orders agreement

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                        │
│  - Collects client data through forms                       │
│  - Calls backend API to generate documents                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ POST /api/document-generation/complete-onboarding
                       ↓
┌─────────────────────────────────────────────────────────────┐
│               Backend (Node.js/Express)                      │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  document-generator.js                             │    │
│  │  - Reads Word templates                            │    │
│  │  - Fills placeholders with client data             │    │
│  │  - Saves DOCX files to temp folder                 │    │
│  └─────────────────────┬──────────────────────────────┘    │
│                        │                                     │
│                        ↓                                     │
│  ┌────────────────────────────────────────────────────┐    │
│  │  pdf-converter.js                                  │    │
│  │  - Converts DOCX to PDF using LibreOffice         │    │
│  └─────────────────────┬──────────────────────────────┘    │
│                        │                                     │
│                        ↓                                     │
│  ┌────────────────────────────────────────────────────┐    │
│  │  docusign.js                                       │    │
│  │  - Creates envelope with PDF documents             │    │
│  │  - Adds signature tabs                             │    │
│  │  - Returns embedded signing URL                    │    │
│  └─────────────────────┬──────────────────────────────┘    │
│                        │                                     │
│                        ↓                                     │
│  ┌────────────────────────────────────────────────────┐    │
│  │  PostgreSQL - document_generations table           │    │
│  │  - Stores generation metadata                      │    │
│  │  - Tracks envelope status                          │    │
│  │  - Stores signed document paths                    │    │
│  └────────────────────────────────────────────────────┘    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Returns signing URL to frontend
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                   Client Browser                             │
│  - Opens DocuSign embedded signing URL                      │
│  - Client signs documents                                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Webhook: envelope completed
                       ↓
┌─────────────────────────────────────────────────────────────┐
│               Backend Webhook Handler                        │
│  - Receives DocuSign webhook event                          │
│  - Downloads signed documents                               │
│  - Updates database status to "completed"                   │
│  - Stores signed PDFs in signed_documents/ folder           │
└─────────────────────────────────────────────────────────────┘
```

---

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install docxtemplater pizzip docusign-esign
```

### 2. Copy Word Templates

Copy the 6 Word document templates to `backend/templates/`:

```
backend/templates/
├── 2022 09 08 - PARCOURS CLIENT_DER_CIF_vf - 16.11.2022.docx
├── 3-2022 09 08 - PARCOURS CLIENT_Lettre de mission_Vf - 16.11.2022.docx
├── PARCOURS CLIENT - QCC et profil de risques PP - CIF IAS.docx
├── PARCOURS CLIENT - QCC et profil de risques PM - CIF IAS.docx
├── 5-2022 09 08 - PARCOURS CLIENT_Déclaration d'adéquation CIF_vf.docx
└── 2021 02 16 - PARCOURS CLIENT - Procedure relative à la relation client.docx
```

### 3. Configure DocuSign

#### 3.1 Create DocuSign Developer Account
1. Go to https://developers.docusign.com/
2. Create free developer account
3. Create Integration Key (Client ID)
4. Generate RSA key pair

#### 3.2 Add Environment Variables

Add these to `backend/.env`:

```bash
# DocuSign Configuration
DOCUSIGN_INTEGRATION_KEY=your_integration_key_here
DOCUSIGN_USER_ID=your_user_id_here
DOCUSIGN_ACCOUNT_ID=your_account_id_here
DOCUSIGN_PRIVATE_KEY_PATH=./docusign_private.key
DOCUSIGN_OAUTH_BASE_PATH=account-d.docusign.com
DOCUSIGN_BASE_PATH=https://demo.docusign.net/restapi
DOCUSIGN_REDIRECT_URL=http://localhost:3000/signature-complete
```

#### 3.3 Save Private Key

Save your DocuSign RSA private key to:
```
backend/docusign_private.key
```

### 4. Install LibreOffice (for PDF conversion)

#### On Windows:
Download and install from: https://www.libreoffice.org/download

Make sure `soffice` is in your PATH, or update the command in `pdf-converter.js`.

#### On Linux/Mac:
```bash
# Ubuntu/Debian
sudo apt-get install libreoffice

# macOS
brew install libreoffice
```

### 5. Run Database Migration

```bash
cd backend
node -e "
const { pool } = require('./src/config/db');
const fs = require('fs');

async function runMigration() {
  const sql = fs.readFileSync('./src/migrations/006_create_document_generations_table.sql', 'utf8');
  await pool.query(sql);
  console.log('✅ Migration completed');
  await pool.end();
}

runMigration();
"
```

### 6. Start the Server

```bash
cd backend
node src/index.js
```

Server should display:
```
🚀 Opulanz Banking API Server Started
📡 Server running on: http://localhost:5000
```

---

## API Endpoints

### Base URL
```
http://localhost:5000/api/document-generation
```

### 1. Generate Documents
```http
POST /api/document-generation/generate
```

**Request Body:**
```json
{
  "clientData": {
    "client_type": "PP",
    "client": {
      "id": "client_123",
      "full_name": "Jean Dupont",
      "first_name": "Jean",
      "last_name": "Dupont",
      "email": "jean.dupont@example.com",
      "phone": "+352 123 456",
      "address": "123 Rue de Luxembourg",
      "city": "Luxembourg",
      "birthdate": "1985-03-15",
      "nationality": "LU"
    },
    "preferences": {
      "email": true,
      "mail": false,
      "phone": true
    },
    "objectives": {
      "preservation": 1,
      "growth": 2,
      "income": 3
    },
    "risk_profile": {
      "category": "Équilibré",
      "score": 50,
      "max_drawdown_accepted": 20,
      "horizon_years": 10
    },
    "financial_profile": {
      "income_range": "50k-100k",
      "patrimony_range": "500k-1M",
      "assets": {
        "cash": 100000,
        "financial": 250000,
        "real_estate": 500000,
        "professional": 0
      }
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Documents generated successfully",
  "generation": {
    "id": 1,
    "client_id": "client_123",
    "client_type": "PP",
    "status": "generated"
  },
  "documents": [
    {
      "path": "C:/backend/temp/client_123/der_client_123.docx",
      "filename": "der_client_123.docx",
      "templateName": "DER - Document d'Entrée en Relation"
    }
  ]
}
```

### 2. Send for Signing
```http
POST /api/document-generation/send-for-signing
```

**Request Body:**
```json
{
  "generationId": 1,
  "clientData": {
    "id": "client_123",
    "full_name": "Jean Dupont",
    "email": "jean.dupont@example.com"
  },
  "advisorData": {
    "name": "Marie Conseil",
    "email": "marie@opulanz.com"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Documents sent for signing",
  "envelopeId": "12345678-abcd-1234-abcd-1234567890ab",
  "signingUrl": "https://demo.docusign.net/Signing/MTRedeem/v1/...",
  "expiresAt": "2025-12-03T08:31:51.000Z"
}
```

### 3. Check Status
```http
GET /api/document-generation/status/:generationId
```

**Response:**
```json
{
  "success": true,
  "generation": {
    "id": 1,
    "clientId": "client_123",
    "status": "sent_for_signing",
    "envelopeId": "12345678-abcd-1234-abcd-1234567890ab",
    "signingUrl": "https://demo.docusign.net/...",
    "envelopeExpiresAt": "2025-12-03T08:31:51.000Z"
  },
  "envelopeStatus": {
    "status": "sent",
    "sentDateTime": "2025-12-02T08:31:51.000Z"
  }
}
```

### 4. Get Signed Documents
```http
GET /api/document-generation/signed/:clientId
```

**Response:**
```json
{
  "success": true,
  "count": 1,
  "documents": [
    {
      "id": 1,
      "client_id": "client_123",
      "status": "completed",
      "signed_documents": [
        {
          "documentId": "1",
          "name": "DER - Document d'Entrée en Relation",
          "path": "C:/backend/signed_documents/client_123/DER_signed.pdf"
        }
      ]
    }
  ]
}
```

### 5. DocuSign Webhook
```http
POST /api/document-generation/docusign-webhook
```

This endpoint is called by DocuSign when envelope status changes.

**DocuSign sends:**
```json
{
  "envelopeId": "12345678-abcd-1234-abcd-1234567890ab",
  "status": "completed",
  "data": {
    "clientId": "client_123"
  }
}
```

### 6. Complete Onboarding (All-in-One)
```http
POST /api/document-generation/complete-onboarding
```

This endpoint runs the entire workflow:
1. Generate documents
2. Convert to PDF
3. Send to DocuSign
4. Return signing URL

**Request:** Same as `/generate`

**Response:**
```json
{
  "success": true,
  "message": "Complete onboarding workflow completed",
  "generationId": 1,
  "envelopeId": "12345678-abcd-1234-abcd-1234567890ab",
  "signingUrl": "https://demo.docusign.net/...",
  "expiresAt": "2025-12-03T08:31:51.000Z",
  "documents": [
    {
      "filename": "der_client_123.pdf",
      "templateName": "DER - Document d'Entrée en Relation"
    }
  ]
}
```

---

## Document Templates

### Template Placeholders

Templates use `{placeholder}` syntax. The system automatically fills these with client data.

#### Common Placeholders (All Templates)
- `{client_full_name}` - Client's full name
- `{client_address}` - Client's address
- `{client_email}` - Client's email
- `{client_phone}` - Client's phone number
- `{date_der}` - Current date in French format

#### DER Template Placeholders
```javascript
{
  client_full_name: "Jean Dupont",
  client_address: "123 Rue de Luxembourg",
  client_email: "jean.dupont@example.com",
  client_phone: "+352 123 456",
  date_der: "02/12/2025",
  communication_channel_email_checked: "☒",
  communication_channel_mail_checked: "☐",
  communication_channel_phone_checked: "☒"
}
```

#### QCC PP (Personne Physique) Placeholders
```javascript
{
  pp1_first_name: "Jean",
  pp1_last_name: "Dupont",
  pp1_birthdate: "1985-03-15",
  pp1_nationality: "LU",
  pp1_address: "123 Rue de Luxembourg",
  pp1_email: "jean.dupont@example.com",
  pp1_phone: "+352 123 456",

  marital_status: "Marié",
  marriage_date: "2010-06-15",
  number_of_children: 2,

  household_income_range: "50k-100k",
  patrimony_range: "500k-1M",
  debt_ratio: "25",

  cash_amount: 100000,
  financial_assets: 250000,
  real_estate_value: 500000,
  professional_value: 0,

  objective_preservation_order: "1",
  objective_growth_order: "2",
  objective_income_order: "3",

  risk_profile: "Équilibré",
  risk_score: 50,
  max_drawdown_accepted: 20,
  horizon_years: 10,

  knowledge_stocks: "Oui",
  knowledge_bonds: "Oui",
  knowledge_funds: "Oui",
  knowledge_derivatives: "Non"
}
```

#### QCC PM (Personne Morale) Placeholders
```javascript
{
  company_name: "Entreprise SA",
  legal_form: "SA",
  head_office_address: "456 Boulevard Royal",
  country: "LU",
  rcs_number: "B123456",
  sector: "Technology",
  regulated_activity: "Non",
  regulator: "",

  rep_name: "Jean Dupont",
  rep_position: "CEO",
  rep_email: "jean.dupont@entreprise.lu",
  rep_phone: "+352 123 456",

  balance_sheet_total: 5000000,
  revenue: 2000000,
  equity: 1500000,
  debt_ratio: 30,

  cash_amount: 500000,
  financial_assets: 1000000,
  real_estate_value: 2000000,
  professional_value: 1500000,

  origin_of_funds: "Business revenue",
  bank_name: "Banque de Luxembourg",

  risk_profile: "Dynamique",
  objective_preservation_order: "2",
  objective_growth_order: "1"
}
```

### Adding Custom Templates

1. Create Word template with `{placeholder}` syntax
2. Save to `backend/templates/`
3. Add configuration to `document-generator.js`:

```javascript
const TEMPLATE_CONFIG = {
  // ... existing templates

  my_new_template: {
    file: 'my-template.docx',
    name: 'My Custom Template',
    placeholders: {
      custom_field: (data) => data.custom?.field || '',
      calculated_value: (data) => someCalculation(data),
    }
  }
};
```

4. Update `generateOnboardingDocuments()` to include the new template

---

## DocuSign Integration

### Envelope Structure

Each envelope contains:
- **Documents**: All PDFs to be signed
- **Recipients**: Signers (client + optional advisor)
- **Tabs**: Signature and date fields for each document

### Signature Tab Positioning

Current configuration places signature tabs at:
- **Page**: 1 (last page of each document)
- **X Position**: 100 pixels from left
- **Y Position**: 600 pixels from top

To customize, edit `createSignatureTabs()` in `docusign.js`:

```javascript
signHere.xPosition = '100';  // Horizontal position
signHere.yPosition = '600';  // Vertical position
signHere.pageNumber = '1';    // Page number
```

### Webhook Configuration

1. **In DocuSign Settings:**
   - Go to Settings > Connect
   - Add new webhook
   - URL: `https://yourdomain.com/api/document-generation/docusign-webhook`
   - Events: Select "Envelope Completed", "Envelope Declined", "Envelope Voided"

2. **For Local Testing:**
   - Use ngrok: `ngrok http 5000`
   - Use ngrok URL: `https://abc123.ngrok.io/api/document-generation/docusign-webhook`

### Webhook Events Handled

- `completed` - All signers have signed → Downloads signed documents
- `declined` - Client declined to sign → Updates status
- `voided` - Envelope was voided → Updates status

---

## Testing the System

### Test with Postman

#### 1. Generate Documents

```bash
POST http://localhost:5000/api/document-generation/generate
Content-Type: application/json

{
  "clientData": {
    "client_type": "PP",
    "client": {
      "id": "test_123",
      "full_name": "Test User",
      "first_name": "Test",
      "last_name": "User",
      "email": "test@example.com",
      "phone": "+352 123 456",
      "address": "123 Test Street",
      "city": "Luxembourg",
      "birthdate": "1990-01-01",
      "nationality": "LU"
    },
    "preferences": {
      "email": true,
      "mail": false,
      "phone": true
    },
    "objectives": {
      "preservation": 1,
      "growth": 2
    },
    "risk_profile": {
      "category": "Équilibré",
      "score": 50,
      "max_drawdown_accepted": 20,
      "horizon_years": 10
    },
    "financial_profile": {
      "income_range": "50k-100k",
      "patrimony_range": "500k-1M",
      "assets": {
        "cash": 100000,
        "financial": 250000,
        "real_estate": 500000
      }
    }
  }
}
```

#### 2. Check Generated Files

```bash
cd backend/temp/client_test_123/
ls -la
```

You should see:
```
der_test_123.docx
lettre_mission_test_123.docx
qcc_pp_test_123.docx
adequation_test_123.docx
```

#### 3. Complete Onboarding (Full Workflow)

```bash
POST http://localhost:5000/api/document-generation/complete-onboarding
Content-Type: application/json

{
  "clientData": {
    "client_type": "PP",
    "client": {
      "id": "test_456",
      "full_name": "Another Test",
      "email": "test456@example.com",
      ...
    },
    ...
  }
}
```

This will:
1. Generate DOCX files ✓
2. Convert to PDF ✓
3. Create DocuSign envelope ✓
4. Return signing URL ✓

---

## Troubleshooting

### 1. "Template not found" Error

**Problem:** Cannot find Word template file

**Solution:**
- Verify templates are in `backend/templates/`
- Check exact file names match `TEMPLATE_CONFIG`
- Ensure file extensions are `.docx` (not `.doc`)

```bash
ls backend/templates/
```

### 2. "LibreOffice conversion failed"

**Problem:** PDF conversion not working

**Solution:**
- Install LibreOffice: https://www.libreoffice.org/download
- Verify `soffice` command works:
  ```bash
  soffice --version
  ```
- On Windows, add LibreOffice to PATH or update command in `pdf-converter.js`:
  ```javascript
  const command = `"C:\\Program Files\\LibreOffice\\program\\soffice.exe" --headless --convert-to pdf ...`;
  ```

### 3. "DocuSign authentication failed"

**Problem:** JWT authentication error

**Solutions:**

**A. Verify Environment Variables:**
```bash
echo $DOCUSIGN_INTEGRATION_KEY
echo $DOCUSIGN_USER_ID
echo $DOCUSIGN_ACCOUNT_ID
```

**B. Check Private Key:**
```bash
cat backend/docusign_private.key
```

Should start with:
```
-----BEGIN RSA PRIVATE KEY-----
```

**C. Grant Consent:**

Visit (replace YOUR_INTEGRATION_KEY):
```
https://account-d.docusign.com/oauth/auth?response_type=code&scope=signature%20impersonation&client_id=YOUR_INTEGRATION_KEY&redirect_uri=http://localhost:3000
```

### 4. "Placeholder not found" Warning

**Problem:** Template placeholder doesn't exist in clientData

**Solution:**
This is just a warning - the field will be empty. To fix:

```javascript
// In TEMPLATE_CONFIG, add fallback:
placeholders: {
  field_name: (data) => data.field?.name || 'N/A',
}
```

### 5. Documents Not Downloading After Signing

**Problem:** Webhook not receiving events

**Solutions:**

**A. For Local Testing:**
- Use ngrok to expose localhost:
  ```bash
  ngrok http 5000
  ```
- Update DocuSign webhook URL to ngrok URL
- Check ngrok console for webhook calls

**B. For Production:**
- Ensure webhook URL is publicly accessible
- Check SSL certificate is valid
- Verify webhook is configured in DocuSign settings

### 6. Database Connection Error

**Problem:** Cannot connect to PostgreSQL

**Solution:**
```bash
# Test connection
node -e "const {testConnection} = require('./src/config/db'); testConnection();"

# Check environment variables
cat backend/.env | grep DB_
```

---

## File Structure

```
backend/
├── src/
│   ├── services/
│   │   ├── document-generator.js    # Template filling
│   │   ├── pdf-converter.js         # DOCX → PDF conversion
│   │   └── docusign.js              # DocuSign integration
│   ├── routes/
│   │   ├── documents.js             # Uploaded documents API
│   │   └── document-generation.js   # Generated documents API
│   └── migrations/
│       └── 006_create_document_generations_table.sql
├── templates/                        # Word templates (6 files)
├── temp/                            # Temporary DOCX/PDF files
│   └── client_{id}/                 # Per-client folders
├── signed_documents/                # Downloaded signed PDFs
│   └── client_{id}/
└── DOCUMENT_GENERATION_GUIDE.md     # This file
```

---

## Next Steps

1. **Copy Templates** - Copy 6 Word documents to `backend/templates/`
2. **Configure DocuSign** - Set up integration key and private key
3. **Install LibreOffice** - For PDF conversion
4. **Test Locally** - Use Postman to test endpoints
5. **Set Up Webhooks** - Configure DocuSign webhook (use ngrok for testing)
6. **Integrate Frontend** - Call API from account opening forms
7. **Deploy to Production** - Deploy with proper webhook URL

---

## Support

For questions or issues:
1. Check this guide's [Troubleshooting](#troubleshooting) section
2. Review server logs: `backend/src/index.js` console output
3. Check database: `SELECT * FROM document_generations ORDER BY created_at DESC;`
4. Test with Postman first before integrating with frontend

---

**Last Updated:** December 2, 2025
**Version:** 1.0.0
**Status:** ✅ System Ready - Pending Template Upload & DocuSign Configuration
