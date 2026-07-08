# 03 — Environment Variables

All environment variables explained, where they come from, and what they do.

---

## Frontend Variables (root `.env`)

These go in `C:\Users\Toufi\AndroidStudioProjects\azuree\.env`

Variables starting with `NEXT_PUBLIC_` are visible in the browser. Never put secrets in them.

| Variable | Example Value | What It Does |
|----------|--------------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:5000` | Where the frontend sends API requests. Change to Azure backend URL for production. |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | The public URL of the website. |
| `NEXT_PUBLIC_APP_NAME` | `Opulanz Banking` | App name used in meta tags. |
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | `ASfDlk...` | PayPal sandbox Client ID. Get from PayPal Developer Dashboard. |
| `NEXT_PUBLIC_PAYPAL_CURRENCY` | `EUR` | Currency for PayPal payments. |
| `NEXT_PUBLIC_ENVIRONMENT` | `development` | Controls debug features. Use `production` on live. |
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | `false` | Enable/disable analytics tracking. |
| `NEXT_PUBLIC_ENABLE_DEBUG` | `true` | Show debug logs in browser console. |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | `213751673679-...` | Google OAuth Client ID for login with Google. |
| `ANTHROPIC_API_KEY` | `sk-ant-api03-...` | Claude AI key for the chatbot feature. |

---

## Backend Variables (`backend/.env`)

These go in `C:\Users\Toufi\AndroidStudioProjects\azuree\backend\.env`

These are NEVER visible to the browser. They are server-side secrets.

### Server

| Variable | Example Value | What It Does |
|----------|--------------|-------------|
| `PORT` | `5000` | Port the backend listens on. |
| `NODE_ENV` | `development` | Environment mode. Use `production` on Azure. |

### Database

| Variable | Example Value | What It Does |
|----------|--------------|-------------|
| `DB_HOST` | `opulanz-pg.postgres.database.azure.com` | Azure PostgreSQL server hostname. |
| `DB_USER` | `opulanz_admin` | Database username. |
| `DB_PASSWORD` | `Advensys2025Secure!` | Database password. |
| `DB_NAME` | `postgres` | Database name. |
| `DB_PORT` | `5432` | PostgreSQL port (always 5432). |

### CORS

| Variable | Example Value | What It Does |
|----------|--------------|-------------|
| `FRONTEND_URL` | `http://localhost:3000` | Allowed origin for API requests. Set to Azure frontend URL in production. |

### Email (Gmail SMTP)

| Variable | Example Value | What It Does |
|----------|--------------|-------------|
| `EMAIL_USER` | `opulanz.banking@gmail.com` | Gmail address used to send emails. |
| `EMAIL_PASS` | `dpbqsmhgoqgblbub` | Gmail **App Password** (NOT the Gmail login password). |
| `ADMIN_EMAIL` | `opulanz.banking@gmail.com` | Where admin notifications are sent. |

### PayPal

| Variable | Example Value | What It Does |
|----------|--------------|-------------|
| `PAYPAL_CLIENT_ID` | `ASfDlk...` | PayPal Client ID. From PayPal Developer Dashboard. |
| `PAYPAL_SECRET` | `EH...` | PayPal Secret. From PayPal Developer Dashboard. **Never expose this.** |
| `PAYPAL_ENV` | `sandbox` | Use `sandbox` for testing, `live` for real money. |

### DocuSign

| Variable | Example Value | What It Does |
|----------|--------------|-------------|
| `DOCUSIGN_INTEGRATION_KEY` | `xxxxxxxx-xxxx-...` | Your DocuSign app's integration key (client ID). |
| `DOCUSIGN_USER_ID` | `xxxxxxxx-xxxx-...` | Your DocuSign account's user GUID. |
| `DOCUSIGN_ACCOUNT_ID` | `xxxxxxxx-xxxx-...` | Your DocuSign account ID. |
| `DOCUSIGN_PRIVATE_KEY_PATH` | `C:/Users/.../docusign_private.pem` | Path to RSA private key file for JWT auth. |
| `DOCUSIGN_BASE_PATH` | `https://demo.docusign.net/restapi` | Sandbox API URL. Use `https://na4.docusign.net/restapi` for production. |
| `DOCUSIGN_AUTH_SERVER` | `account-d.docusign.com` | Sandbox auth server. Use `account.docusign.com` for production. |

### Azure Storage

| Variable | Example Value | What It Does |
|----------|--------------|-------------|
| `AZURE_STORAGE_CONNECTION_STRING` | `DefaultEndpointsProtocol=https;...` | Connection string from Azure Portal → Storage Account → Access keys. |
| `AZURE_STORAGE_CONTAINER_NAME` | `opulanz-documents` | Blob container name where documents are stored. |

### Narvi Banking API

| Variable | Example Value | What It Does |
|----------|--------------|-------------|
| `NARVI_API_URL` | `https://api.narvi.com/rest/v1.0` | Narvi banking API base URL. |
| `NARVI_API_KEY_ID` | `EY66Z3MKPW4K26K6` | API key ID for Narvi. |
| `NARVI_PRIVATE_KEY_PATH` | `C:/Users/.../banking_private.pem` | RSA private key for Narvi API signing. |

### Authentication (JWT)

| Variable | Example Value | What It Does |
|----------|--------------|-------------|
| `JWT_SECRET` | `your-secret-key` | Secret used to sign JWT tokens for user authentication. Use a long random string. |
| `JWT_EXPIRES_IN` | `7d` | How long login tokens stay valid. |

### Sumsub KYC

| Variable | Example Value | What It Does |
|----------|--------------|-------------|
| `SUMSUB_APP_TOKEN` | `sbx:...` | Sumsub API token for identity verification. |
| `SUMSUB_SECRET_KEY` | `...` | Sumsub secret key. |

### Google OAuth

| Variable | Example Value | What It Does |
|----------|--------------|-------------|
| `GOOGLE_CLIENT_ID` | `213751673679-...` | Google OAuth Client ID (same as frontend). |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-...` | Google OAuth Client Secret (backend only, never expose). |

---

## Environment Files Summary

| File | Used Where | Purpose |
|------|-----------|---------|
| `.env` | Root folder | Default development settings |
| `.env.local` | Root folder | Local overrides (production URLs) — gitignored |
| `.env.development.local` | Root folder | Dev-only overrides |
| `.env.production` | Root folder | Production frontend settings |
| `backend/.env` | Backend folder | Backend secrets — gitignored |

> **Rule:** Never commit `.env` files with real passwords to Git. Use Azure App Service environment variables for production.
