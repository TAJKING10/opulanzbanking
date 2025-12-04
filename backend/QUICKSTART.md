# ⚡ Quick Start Guide

Get your Opulanz Banking API running in 5 minutes!

---

## 🎯 Step-by-Step Setup

### Step 1: Fix Azure Password (REQUIRED FIRST)

Your connection test showed **password authentication failed**.

**Quick Fix:**
1. Go to: https://portal.azure.com
2. Search: **opulanz-pg**
3. Left sidebar: **Settings** → **Authentication**
4. Click: **"Reset password"**
5. Enter new password: `OpulanzDev2025` (no special characters)
6. Save

**Update `.env`:**
```bash
cd backend
notepad .env  # or use VS Code
```

Change this line:
```env
DB_PASSWORD=OpulanzDev2025
```

Save and close.

**Test connection:**
```bash
node test-connection.js
```

✅ You should see: "All connection tests passed!"

---

### Step 2: Run Database Migration

```bash
npm run migrate
```

✅ Expected: "Migration completed successfully!"

This creates the `users` table in Azure.

---

### Step 3: Start the Server

```bash
npm start
```

✅ You should see:
```
✅ Database connection established
🚀 Opulanz Banking API Server Started
📡 Server running on: http://localhost:5000
```

**Keep this terminal open!**

---

### Step 4: Test the API

Open a **new terminal** and run:

```bash
# Test 1: Health check
curl http://localhost:5000/health

# Test 2: Get all users (empty array at first)
curl http://localhost:5000/api/users
```

✅ Expected:
```json
{
  "status": "ok",
  "message": "Opulanz Banking API is running"
}
```

---

### Step 5: Create Your First User

```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Toufic Jandah\",\"email\":\"toufic@advensys-trading.lv\",\"role\":\"admin\"}"
```

✅ Expected:
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 1,
    "name": "Toufic Jandah",
    "email": "toufic@advensys-trading.lv",
    "role": "admin"
  }
}
```

---

### Step 6: Verify User Created

```bash
curl http://localhost:5000/api/users
```

✅ You should see your user in the array!

---

## 🎉 Success!

Your backend is now running locally and connected to Azure PostgreSQL!

**What you have:**
- ✅ Node.js + Express server
- ✅ Connected to Azure PostgreSQL (with SSL)
- ✅ Users table created
- ✅ Full CRUD API working
- ✅ First user created

---

## 🚀 Next: Deploy to Azure (Optional)

Want your API live on the internet?

**Quick Deploy (3 methods):**

### Method A: GitHub Actions (Auto-deploy on push)
See: `DEPLOYMENT.md` → Method 1

### Method B: Azure CLI Script
```bash
chmod +x azure-deploy.sh
./azure-deploy.sh
```

### Method C: Manual Portal
See: `DEPLOYMENT.md` → Method 3

**Full guide:** See `DEPLOYMENT.md`

---

## 📚 What's Available

| File | Purpose |
|------|---------|
| `README.md` | Full documentation |
| `QUICKSTART.md` | This file - fast setup |
| `DEPLOYMENT.md` | Deploy to Azure guide |
| `AZURE_SETUP.md` | Azure firewall & connection help |
| `PASSWORD_FIX.md` | Password troubleshooting |
| `API_TESTING.md` | All API endpoints with curl examples |
| `test-connection.js` | Diagnose connection issues |
| `check-credentials.js` | Verify .env format |

---

## ❓ Troubleshooting

### Still can't connect?

```bash
node test-connection.js
```

Follow the error messages - they tell you exactly what's wrong.

### Password still failing?

See: `PASSWORD_FIX.md`

### Need Azure setup help?

See: `AZURE_SETUP.md`

---

## 🎯 Your Current Status Checklist

- [x] Backend dependencies installed
- [ ] Azure password fixed (← **DO THIS FIRST**)
- [ ] Connection test passes
- [ ] Database migration completed
- [ ] Server starts successfully
- [ ] API endpoints tested
- [ ] First user created
- [ ] Ready to deploy (optional)

---

## 📞 Quick Commands Reference

```bash
# Install dependencies
npm install

# Test Azure connection
node test-connection.js

# Run migration
npm run migrate

# Start server
npm start

# Start with auto-reload (dev)
npm run dev

# Deploy to Azure
./azure-deploy.sh
```

---

## 🔗 API Endpoints (Local)

```
Health:      http://localhost:5000/health
Users List:  http://localhost:5000/api/users
Get User:    http://localhost:5000/api/users/1
Create User: POST http://localhost:5000/api/users
Update User: PUT http://localhost:5000/api/users/1
Delete User: DELETE http://localhost:5000/api/users/1
```

Full API docs: `API_TESTING.md`

---

## 🌐 API Endpoints (After Deployment)

```
Health:      https://opulanz-banking-api.azurewebsites.net/health
Users List:  https://opulanz-banking-api.azurewebsites.net/api/users
...etc
```

---

**Need more help?** Read the detailed guides or check the troubleshooting sections!

**Ready to code?** Start building features! The backend is production-ready. 🚀
