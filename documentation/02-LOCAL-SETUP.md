# 02 — Local Setup Guide

Follow these steps exactly to run the full project on your computer.

---

## Prerequisites

Install these tools first (if not already installed):

| Tool | Version | Download |
|------|---------|----------|
| Node.js | 18 or 20 LTS | https://nodejs.org |
| npm | 9+ (comes with Node) | — |
| Git | Any | https://git-scm.com |

To verify they are installed, open a terminal and run:
```bash
node --version    # should show v18.x.x or v20.x.x
npm --version     # should show 9.x.x or higher
git --version     # should show git version x.x.x
```

---

## Step 1 — Get the Code

```bash
# Navigate to where you want the project
cd C:\Users\YourName\Projects

# Clone the repository
git clone https://github.com/YOUR_REPO_URL azuree

# Enter the project folder
cd azuree
```

> If you already have the code, just open a terminal in `C:\Users\Toufi\AndroidStudioProjects\azuree`.

---

## Step 2 — Install Frontend Dependencies

```bash
# Make sure you are in the root project folder
cd C:\Users\Toufi\AndroidStudioProjects\azuree

# Install all packages
npm install
```

This installs ~200 packages. Takes 1–3 minutes.

---

## Step 3 — Install Backend Dependencies

```bash
# Go to the backend folder
cd C:\Users\Toufi\AndroidStudioProjects\azuree\backend

# Install backend packages
npm install

# Go back to root
cd ..
```

---

## Step 4 — Set Up Environment Files

### Frontend `.env` (development)

The file `.env` in the root folder already exists. For local development, make sure it has:

```env
# Backend URL (local)
NEXT_PUBLIC_API_URL=http://localhost:5000

# Application URL (local)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# PayPal (sandbox)
NEXT_PUBLIC_PAYPAL_CLIENT_ID=ASfDlkfY0QexOMLyaQl7LzQP00oDbv3I2j9EkPcBNfSSS6TdwotWY50J3IQWEN17mqpB92UbVY97u3bJ
NEXT_PUBLIC_PAYPAL_CURRENCY=EUR

# Environment
NEXT_PUBLIC_ENVIRONMENT=development
```

### Backend `.env` (inside `backend/` folder)

Create or verify `backend/.env` with:

```env
PORT=5000
NODE_ENV=development

# Database
DB_HOST=opulanz-pg.postgres.database.azure.com
DB_USER=opulanz_admin
DB_PASSWORD=Advensys2025Secure!
DB_NAME=postgres
DB_PORT=5432

# Frontend CORS
FRONTEND_URL=http://localhost:3000

# Email
EMAIL_USER=opulanz.banking@gmail.com
EMAIL_PASS=dpbqsmhgoqgblbub
ADMIN_EMAIL=opulanz.banking@gmail.com

# PayPal
PAYPAL_CLIENT_ID=ASfDlkfY0QexOMLyaQl7LzQP00oDbv3I2j9EkPcBNfSSS6TdwotWY50J3IQWEN17mqpB92UbVY97u3bJ
PAYPAL_SECRET=YOUR_PAYPAL_SECRET_HERE
PAYPAL_ENV=sandbox
```

---

## Step 5 — Run the Backend

Open a **new terminal window**:

```bash
cd C:\Users\Toufi\AndroidStudioProjects\azuree\backend
npm start
```

You should see:
```
🚀 Opulanz Banking API running on port 5000
✅ Connected to Azure PostgreSQL
```

> Keep this terminal open. If you close it, the backend stops.

---

## Step 6 — Run the Frontend

Open another **new terminal window**:

```bash
cd C:\Users\Toufi\AndroidStudioProjects\azuree
npm run dev
```

You should see:
```
▲ Next.js 14.2.33
- Local: http://localhost:3000
✓ Ready in 1393ms
```

> If port 3000 is taken, it will try 3001, 3002, 3003, etc. automatically.

---

## Step 7 — Open in Browser

Open your browser and go to:

| URL | Page |
|-----|------|
| http://localhost:3000/en | Homepage (English) |
| http://localhost:3000/fr | Homepage (French) |
| http://localhost:3000/en/investment-advisory/schedule | Investment Advisory booking |
| http://localhost:3000/en/tax-advisory/schedule | Tax Advisory booking |
| http://localhost:3000/en/life-insurance/schedule | Life Insurance booking |
| http://localhost:3000/en/open-account/individual | Individual account opening |
| http://localhost:3000/en/open-account/company | Company account opening |
| http://localhost:3000/en/company-formation | Company formation wizard |
| http://localhost:3000/en/dashboard | Dashboard |
| http://localhost:3000/en/admin | Admin panel |

---

## How to Stop

- **Frontend:** Press `Ctrl + C` in the frontend terminal
- **Backend:** Press `Ctrl + C` in the backend terminal

---

## How to Restart After a Bug

If you see the webpack error `TypeError: Cannot read properties of undefined (reading 'call')`:

```bash
# 1. Kill all Node processes
taskkill /F /IM node.exe

# 2. Delete the build cache
cd C:\Users\Toufi\AndroidStudioProjects\azuree
rm -rf .next

# 3. Restart backend (in one terminal)
cd backend && npm start

# 4. Restart frontend (in another terminal)
cd .. && npm run dev
```

---

## Running Migrations (First Time Only)

If the database tables don't exist yet:

```bash
cd C:\Users\Toufi\AndroidStudioProjects\azuree\backend
node src/migrations/run-all-migrations.js
```

This creates all 19 database tables automatically.
