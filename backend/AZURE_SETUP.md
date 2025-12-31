# Azure PostgreSQL Setup Guide

## 🚨 Connection Timeout Error?

If you're seeing "Connection terminated due to connection timeout", it means Azure is blocking your IP address.

### Quick Fix Steps

#### Step 1: Get Your Current IP Address

**Windows:**
```powershell
Invoke-RestMethod -Uri "https://api.ipify.org?format=text"
```

Or visit: https://whatismyipaddress.com/

#### Step 2: Add Your IP to Azure Firewall

**Option A: Using Azure Portal (Recommended)**

1. Go to https://portal.azure.com
2. Navigate to your PostgreSQL server: `opulanz-pg`
3. Click **"Networking"** in the left sidebar (under Security)
4. Click **"+ Add current client IP address"** button (top right)
5. Click **"Save"** at the top

**Option B: Using Azure CLI**

```bash
# Install Azure CLI if needed: https://aka.ms/installazurecli

# Login
az login

# Add your IP
az postgres flexible-server firewall-rule create \
  --resource-group YOUR_RESOURCE_GROUP \
  --name opulanz-pg \
  --rule-name "MyLocalIP" \
  --start-ip-address YOUR_IP \
  --end-ip-address YOUR_IP
```

**Option C: Allow All Azure IPs (For Testing Only - Not Recommended for Production)**

In Azure Portal > Networking:
- Enable "Allow public access from any Azure service within Azure to this server"

⚠️ **Security Warning:** This allows any Azure service to connect. Use only for testing!

#### Step 3: Verify SSL Settings

In Azure Portal > Server parameters:
- Search for `ssl_enforcement`
- Should be set to `ON` (our code already handles this)

#### Step 4: Test Connection Again

```bash
npm run migrate
```

You should now see:
```
✅ Database connection established
✅ Migration completed successfully
```

---

## 🔍 Detailed Troubleshooting

### Issue 1: Connection Timeout

**Error:**
```
Error: Connection terminated due to connection timeout
```

**Cause:** Your IP is not allowed in Azure firewall

**Solution:** Add your IP address in Azure Portal > Networking

---

### Issue 2: Password Authentication Failed

**Error:**
```
error: password authentication failed for user "opulanz_admin"
```

**Cause:** Incorrect password in `.env` file

**Solution:**
1. Verify password in `.env` matches Azure
2. Check for special characters that need escaping
3. Reset password in Azure if needed:
   - Azure Portal > opulanz-pg > Settings > Authentication

---

### Issue 3: SSL Connection Required

**Error:**
```
error: no pg_hba.conf entry for host "X.X.X.X", SSL off
```

**Cause:** SSL not enabled

**Solution:** Already configured in `db.js`:
```javascript
ssl: {
  rejectUnauthorized: false
}
```

If issue persists, set in `.env`:
```
PGSSLMODE=require
```

---

### Issue 4: Database Does Not Exist

**Error:**
```
error: database "postgres" does not exist
```

**Cause:** Database name incorrect

**Solution:**
1. Check available databases in Azure Portal
2. Update `.env` with correct `DB_NAME`

Default Azure PostgreSQL has a `postgres` database, so this is unlikely.

---

### Issue 5: Host Not Found

**Error:**
```
error: getaddrinfo ENOTFOUND opulanz-pg.postgres.database.azure.com
```

**Cause:**
- Typo in hostname
- Network connectivity issue

**Solution:**
1. Verify hostname in Azure Portal
2. Test DNS resolution:
   ```bash
   nslookup opulanz-pg.postgres.database.azure.com
   ```

---

## 🧪 Test Connection Manually

### Using psql (Command Line)

**Install psql:**
- Windows: https://www.postgresql.org/download/windows/
- Mac: `brew install postgresql`
- Linux: `sudo apt-get install postgresql-client`

**Connect:**
```bash
psql "host=opulanz-pg.postgres.database.azure.com port=5432 dbname=postgres user=opulanz_admin password=Advensys2025? sslmode=require"
```

If successful, you'll see:
```
postgres=>
```

Try a query:
```sql
SELECT version();
\dt  -- List tables
\q   -- Quit
```

### Using Azure Data Studio (GUI)

1. Download: https://aka.ms/azuredatastudio
2. Click "New Connection"
3. Fill in:
   - **Server:** opulanz-pg.postgres.database.azure.com
   - **Authentication type:** PostgreSQL
   - **User name:** opulanz_admin
   - **Password:** Advensys2025?
   - **Database:** postgres
   - **Encrypt:** Required
4. Click "Connect"

---

## 🌐 Check Azure PostgreSQL Status

### In Azure Portal

1. Go to https://portal.azure.com
2. Search for "opulanz-pg"
3. Check **Overview** tab:
   - Status should be "Available"
   - Server name: `opulanz-pg.postgres.database.azure.com`
   - PostgreSQL version: (e.g., 14, 15, 16)

### Check Firewall Rules

**Portal > opulanz-pg > Networking**

You should see:
- ✅ At least one firewall rule with your IP
- ✅ SSL enforcement: ON
- ✅ Public access: Enabled (or from selected networks)

---

## 🔑 Update Connection Settings

If your Azure details are different, update `.env`:

```env
DB_HOST=your-actual-server.postgres.database.azure.com
DB_USER=your_admin_username
DB_PASSWORD=your_actual_password
DB_NAME=postgres
DB_PORT=5432
```

**Finding your values:**
- Azure Portal > opulanz-pg > Overview
- **Host:** Server name (ends with `.postgres.database.azure.com`)
- **User:** Settings > Authentication
- **Port:** Always 5432 for PostgreSQL

---

## ✅ Verify Setup Checklist

Before running migration:

- [ ] Azure PostgreSQL server status is "Available"
- [ ] Your current IP is added to firewall rules
- [ ] `.env` file exists with correct credentials
- [ ] `npm install` completed successfully
- [ ] Can ping/resolve the Azure hostname
- [ ] SSL enforcement is ON in Azure
- [ ] Database "postgres" exists (default)

---

## 🚀 Once Connected

After successful connection, run:

```bash
# Run migration
npm run migrate

# Start server
npm start

# Test API
curl http://localhost:5000/health
```

Expected output:
```
✅ Database connection established
✅ Database connection test successful
Server time: 2025-11-04T...
✅ Migration completed successfully!
```

---

## 🆘 Still Having Issues?

1. **Check Azure Status:** https://status.azure.com/
2. **Review Azure Logs:**
   - Portal > opulanz-pg > Monitoring > Logs
3. **Check Resource Group:**
   - Ensure server is in correct region
4. **Review Network Settings:**
   - Virtual Network integration
   - Private endpoints
5. **Contact Support:**
   - Azure Portal > Help + support

---

## 📞 Common Azure Portal Locations

- **Server Overview:** Portal > opulanz-pg > Overview
- **Firewall:** Portal > opulanz-pg > Networking
- **Authentication:** Portal > opulanz-pg > Settings > Authentication
- **Databases:** Portal > opulanz-pg > Databases
- **Monitoring:** Portal > opulanz-pg > Monitoring

---

**Need more help?** Check the main README.md or Azure PostgreSQL docs:
https://learn.microsoft.com/azure/postgresql/
