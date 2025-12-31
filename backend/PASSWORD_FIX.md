# 🔑 Password Authentication Fix

## The Issue

Your connection test shows:
```
✓ DNS resolved (Azure server is reachable)
✓ IP allowed through firewall
✗ Password authentication failed
```

This means the password in `.env` doesn't match what's configured in Azure.

---

## 🎯 Quick Fix (Choose One)

### Option A: Verify & Update Password in .env (Easiest)

1. **Go to Azure Portal:**
   - https://portal.azure.com
   - Search for "opulanz-pg"
   - Click on your PostgreSQL server

2. **Find the correct username:**
   - Left sidebar → Settings → **Authentication**
   - Note the **Admin username** (should be `opulanz_admin`)

3. **Reset the password (if unsure):**
   - Still in Settings → Authentication
   - Click "Reset password"
   - Enter new password: `Advensys2025!` (changed `?` to `!` for compatibility)
   - Confirm and save

4. **Update your `.env` file:**
   ```env
   DB_PASSWORD=Advensys2025!
   ```

5. **Test again:**
   ```bash
   node test-connection.js
   ```

---

### Option B: Use the Existing Password (If You Remember It)

If you know the actual Azure password is different:

1. **Update `.env` with the correct password:**
   ```env
   DB_PASSWORD=YourActualPassword
   ```

2. **If password has special characters (`?!@#$%`), try these formats:**

   **Format 1: Quoted (recommended)**
   ```env
   DB_PASSWORD="Advensys2025?"
   ```

   **Format 2: URL-encoded**
   ```env
   DB_PASSWORD=Advensys2025%3F
   ```
   Common encodings:
   - `?` → `%3F`
   - `!` → `%21`
   - `@` → `%40`
   - `#` → `%23`
   - `$` → `%24`

3. **Test again:**
   ```bash
   node test-connection.js
   ```

---

### Option C: Create New Simple Password (Recommended for Development)

1. **Go to Azure Portal → opulanz-pg → Authentication**

2. **Reset password to something simple (for dev):**
   ```
   OpulanzDev2025
   ```
   (No special characters to avoid encoding issues)

3. **Update `.env`:**
   ```env
   DB_PASSWORD=OpulanzDev2025
   ```

4. **Test:**
   ```bash
   node test-connection.js
   ```

---

## ✅ After Password is Fixed

Once `test-connection.js` passes, you can:

1. **Run migration:**
   ```bash
   npm run migrate
   ```

2. **Start server:**
   ```bash
   npm start
   ```

3. **Test API:**
   ```bash
   curl http://localhost:5000/health
   ```

---

## 🔍 How to Find Current Azure Password

**Short answer:** You can't retrieve it from Azure.

Azure doesn't show existing passwords for security reasons. You can only:
- **Reset it** (recommended)
- **Try different formats** if you think you know it

---

## 🚨 Common Password Issues

### Issue 1: Special Characters Not Escaped

❌ **Wrong:**
```env
DB_PASSWORD=Pass?word!
```

✅ **Correct:**
```env
DB_PASSWORD="Pass?word!"
# OR
DB_PASSWORD=Pass%3Fword%21
```

### Issue 2: Spaces in Password

❌ **Wrong:**
```env
DB_PASSWORD=Pass word123
```

✅ **Correct:**
```env
DB_PASSWORD="Pass word123"
# OR
DB_PASSWORD=Pass%20word123
```

### Issue 3: Trailing Spaces

Check your `.env` file doesn't have hidden spaces:

❌ **Wrong:**
```env
DB_PASSWORD=Password123
```
(spaces after the password)

✅ **Correct:**
```env
DB_PASSWORD=Password123
```
(no trailing spaces)

---

## 🧪 Test Each Format

If unsure which format works, try each systematically:

```bash
# 1. Update .env
# 2. Run test
node test-connection.js

# If fails, try next format
# Repeat until it works
```

**Test formats to try:**
1. `Advensys2025?` (as-is)
2. `"Advensys2025?"` (quoted)
3. `Advensys2025%3F` (URL-encoded)
4. `Advensys2025!` (after resetting in Azure)
5. `OpulanzDev2025` (after resetting to simple password)

---

## 📝 Current Status

Your `.env` currently has:
```
DB_PASSWORD=Advensys2025?
```

**Next step:** Try one of the options above and run `node test-connection.js` again.

---

## ✨ Expected Success Output

When password is correct, you'll see:

```
============================================================
Azure PostgreSQL Connection Diagnostic Tool
============================================================

▶ Step 1: Checking environment variables...
✓ DB_HOST: opulanz-pg.postgres.database.azure.com
✓ DB_USER: opulanz_admin
✓ DB_PASSWORD: ***025?
✓ DB_NAME: postgres
✓ DB_PORT: 5432

▶ Step 2: Testing DNS resolution...
✓ DNS resolved: opulanz-pg.postgres.database.azure.com → 52.143.156.183

▶ Step 3: Testing basic connection (without SSL)...
✗ Basic connection failed: no encryption (expected)

▶ Step 4: Testing connection with SSL...
ℹ Connecting with SSL...
✓ SSL connection successful!

▶ Step 5: Running test query...
✓ Query executed successfully!

Server Information:
  Version: PostgreSQL 16.x...
  Time: 2025-11-04...

▶ Step 6: Checking for users table...
⚠ Users table does not exist yet.
ℹ Run: npm run migrate

============================================================
✓ All connection tests passed!
============================================================
```

Then proceed with migration and server startup!

---

**Need help?** See `AZURE_SETUP.md` for more troubleshooting steps.
