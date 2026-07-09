# 13 — All Accounts & Credentials

> ⚠️ **SECURITY NOTE:** Keep this file private. Do not commit it to Git. Do not share it publicly.
> For production deployments, use Azure App Service environment variables instead of files.

---

## Email Accounts

| Account | Password | Used For |
|---------|----------|---------|
| `opulanz.banking@gmail.com` | [Gmail password] | Admin email, Calendly login, email sending |

### Gmail App Password (for SMTP/Nodemailer)
```
dpbq smhg oqgb lbub
(no spaces when used in .env: dpbqsmhgoqgblbub)
```
If this stops working, generate a new one:
1. Go to https://myaccount.google.com/apppasswords
2. Sign in with opulanz.banking@gmail.com
3. Create → Copy the new 16-character password
4. Update `EMAIL_PASS` in `backend/.env`

---

## PayPal

| Setting | Value |
|---------|-------|
| Environment | Sandbox |
| Developer Dashboard | https://developer.paypal.com |
| Login email | The email used to create the PayPal business account |
| Client ID | `ASfDlkfY0QexOMLyaQl7LzQP00oDbv3I2j9EkPcBNfSSS6TdwotWY50J3IQWEN17mqpB92UbVY97u3bJ` |
| Secret | Stored in `backend/.env` as `PAYPAL_SECRET` |
| Currency | EUR |

**To find the Secret:**
1. Go to https://developer.paypal.com/dashboard
2. Apps & Credentials → Select your app
3. Click "Show" under Secret

---

## Calendly

| Setting | Value |
|---------|-------|
| Account handle | `opulanz-banking` |
| Base URL | `https://calendly.com/opulanz-banking` |
| Login | https://calendly.com (use opulanz.banking@gmail.com) |

### Event Type URLs
| Event | English | French |
|-------|---------|--------|
| Tax Advisory | `.../tax-advisory` | `.../conseil-fiscal` |
| Life Insurance | `.../investment-advisory-clone` | `.../assurance-vie` |
| Investment Advisory | `.../tax-advisory-clone` | `.../conseil-en-investissement` |

---

## Azure

| Setting | Value |
|---------|-------|
| Portal | https://portal.azure.com |
| Login | Microsoft account linked to Azure subscription |
| Region | Canada Central |

### Resources
| Resource | Name | Type |
|----------|------|------|
| Frontend App | `rg-opulanz-frontend` | App Service |
| Backend App | `rg-opulanz-backend` | App Service |
| Database | `opulanz-pg` | PostgreSQL Flexible Server |
| Storage | — | Blob Storage |

### PostgreSQL
| Setting | Value |
|---------|-------|
| Server | `opulanz-pg.postgres.database.azure.com` |
| Admin User | `opulanz_admin` |
| Password | `Advensys2025Secure!` |
| Database | `postgres` |
| Port | `5432` |

---

## DocuSign

| Setting | Value |
|---------|-------|
| Environment | Sandbox (Demo) |
| Portal | https://admindemo.docusign.com |
| Private Key File | `docusign_private.pem` (in project root) |
| Integration Key | Set in `backend/.env` as `DOCUSIGN_INTEGRATION_KEY` |
| User ID | Set in `backend/.env` as `DOCUSIGN_USER_ID` |
| Account ID | Set in `backend/.env` as `DOCUSIGN_ACCOUNT_ID` |

---

## Google OAuth

| Setting | Value |
|---------|-------|
| Client ID | `213751673679-2iucu4qt4itvq18kjnj7e4rvbe9tm3hs.apps.googleusercontent.com` |
| Client Secret | In `backend/.env` as `GOOGLE_CLIENT_SECRET` |
| Configuration file | `client_secret_213751673679-....json` |
| Console | https://console.cloud.google.com |

---

## Narvi Banking API

| Setting | Value |
|---------|-------|
| API URL | `https://api.narvi.com/rest/v1.0` |
| API Key ID | `EY66Z3MKPW4K26K6` |
| Private Key | `banking_private.pem` (in project root) |
| Public Key | `banking_pub.pem` (in project root) |
| IP Whitelist | `80.232.250.236` |

---

## Sumsub KYC

| Setting | Value |
|---------|-------|
| App Token | Set in `backend/.env` as `SUMSUB_APP_TOKEN` |
| Secret Key | Set in `backend/.env` as `SUMSUB_SECRET_KEY` |
| Dashboard | https://cockpit.sumsub.com |

---

## Anthropic (Claude AI)

| Setting | Value |
|---------|-------|
| API Key | `sk-ant-api03-...` (in root `.env` as `ANTHROPIC_API_KEY`) |
| Used For | AI chatbot feature |
| Console | https://console.anthropic.com |

---

## Azure DevOps

| Setting | Value |
|---------|-------|
| Pipeline files | `azure-pipelines-frontend.yml`, `azure-pipelines-backend.yml` |
| Triggers | Push to `main` branch |
| Service Connection | Configured in Azure DevOps project settings |

---

## GitHub

| Setting | Value |
|---------|-------|
| Repository | Linked to Azure DevOps for CI/CD |
| Main branch | `DocuSignWordfiles` |

---

## Important File Locations

| File | Location | Contains |
|------|----------|---------|
| Frontend env | `C:\Users\Toufi\AndroidStudioProjects\azuree\.env` | All frontend variables |
| Backend env | `C:\Users\Toufi\AndroidStudioProjects\azuree\backend\.env` | All backend secrets |
| DocuSign key | `C:\Users\Toufi\AndroidStudioProjects\azuree\docusign_private.pem` | RSA private key |
| Narvi key | `C:\Users\Toufi\AndroidStudioProjects\azuree\banking_private.pem` | RSA private key |
| Google OAuth | `C:\Users\Toufi\AndroidStudioProjects\azuree\client_secret_213751673679-....json` | Google credentials |
