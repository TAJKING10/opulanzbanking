# 🎯 Opulanz Banking - Action Plan

**Created:** November 13, 2025
**Status:** Ready to Execute
**Timeline:** Today → Production

---

## 📅 PATH A: IMMEDIATE (TODAY)

### ✅ Step 1: Demo for Boss (30 minutes)

**Script to follow:**

#### A. Live Money Transfer Demo (5 min)
```bash
cd C:\Users\Toufi\AndroidStudioProjects\opulanzbanking\backend
node test-vop-flow.js
```

**Show him:**
- ✅ Real €1.00 SEPA transfer created
- ✅ Transaction ID: [will be generated]
- ✅ VOP verification: MTCH/CMTC/NMTC
- ✅ Status tracking: PENDING → DONE

#### B. Live Dashboard (5 min)
Open: http://localhost:3000/en/dashboard

**Show him:**
- ✅ Real IBAN: FI1879600179463555
- ✅ Live balance: €869.11 (from Narvi)
- ✅ 4-5 transaction history
- ✅ Professional banking UI

#### C. Onboarding Forms (10 min)

**Individual Account:**
http://localhost:3000/en/open-account/individual

Fill with test data:
- Name: Demo User
- Email: demo@opulanz.com
- DOB: 01/15/1990
- Address: 123 Avenue de la Liberté, Luxembourg, L-1009
- Submit → Saves to database

**Company Account:**
http://localhost:3000/en/open-account/company

Fill with test data:
- Company: Opulanz Demo SARL
- Registration: LU12345678
- Submit → Saves to database

**Show him the expected BaaS error is normal.**

#### D. Database Verification (5 min)
```bash
psql "postgresql://opulanz_admin:Advensys2025Secure!@opulanz-pg.postgres.database.azure.com:5432/postgres?sslmode=require" -c "SELECT id, type, status, created_at FROM applications ORDER BY created_at DESC LIMIT 5;"
```

**Show him:**
- ✅ All applications stored
- ✅ Data structured correctly
- ✅ Ready for IBAN linking

#### E. Multi-Language (2 min)
- English: http://localhost:3000/en
- French: http://localhost:3000/fr

**Show him:**
- ✅ Complete translation
- ✅ Ready for FR/LU markets

**Expected Reaction:**
- ✅ Impressed by functionality
- ✅ Understands only BaaS is needed
- ✅ Approves moving forward

---

### ✅ Step 2: Email Narvi Support (10 minutes)

**Action:** Send this email NOW

**To:** support@narvi.com
**Subject:** BaaS API Access Request - Opulanz Banking Platform

**Email Body:**
```
Hello Narvi Support Team,

We are Opulanz Banking and have successfully integrated with your Narvi REST
API v1.0. All account management and transaction features are working perfectly
in our platform.

We now need BaaS (Banking as a Service) permissions enabled to complete our
automated customer onboarding workflow.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API CREDENTIALS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API Key ID:         EY66Z3MKPW4K26K6
IP Whitelist:       80.232.250.236
Private Key:        Configured (EC 256-bit)
Public Key:         Uploaded to Developer Portal

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REQUIRED ENDPOINTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
We need access to the following BaaS endpoints:

1. POST /baas/v1.0/entity/private/create
   (For creating individual customer entities)

2. POST /baas/v1.0/entity/business/create
   (For creating business customer entities)

3. POST /baas/v1.0/account/create
   (For issuing IBANs to customers)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CURRENT STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ REST API v1.0 working correctly
✅ Account management operational
✅ Transaction processing functional
✅ VOP verification implemented
✅ Cryptographic authentication working

❌ BaaS endpoints returning:
   Error: "Entity does not have permission to baas settings"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUR PLATFORM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Platform:       Opulanz Banking
Target Market:  France & Luxembourg
Services:       Individual & Business Banking
Launch Date:    Q1 2026
Website:        opulanz.com (in development)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REQUEST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Please enable BaaS API access for our API key and provide:

1. Timeline for activation
2. Any additional documentation required
3. Pricing information for BaaS tier
4. Any compliance requirements we should complete

We have completed our integration testing and are ready to proceed with
production deployment as soon as BaaS access is enabled.

Thank you for your assistance!

Best regards,
Opulanz Banking Development Team

Contact: [Your Name]
Email: [Your Email]
Phone: [Your Phone]
```

**Expected Response Time:** 1-3 business days

**What to track:**
- [ ] Email sent
- [ ] Confirmation received
- [ ] BaaS enabled
- [ ] Testing completed

---

### ✅ Step 3: UI/UX Polish (This Week)

While waiting for Narvi, improve the platform:

#### Priority 1: Dashboard Enhancements
**File:** `app/[locale]/dashboard/page.tsx`

**Add:**
1. ✅ Account balance card with better styling
2. ✅ Transaction chart (last 30 days)
3. ✅ Quick action buttons (New Transfer, View Transactions)
4. ✅ Recent activity timeline
5. ✅ Account details section

**Estimated Time:** 4-6 hours

#### Priority 2: Transaction Page
**Create:** `app/[locale]/transactions/page.tsx`

**Add:**
1. ✅ Transaction history table
2. ✅ Filters (date, type, status)
3. ✅ Search functionality
4. ✅ Export to CSV
5. ✅ Transaction details modal

**Estimated Time:** 6-8 hours

#### Priority 3: Success Screens
**Files to enhance:**
- `app/[locale]/open-account/individual/page.tsx`
- `app/[locale]/open-account/company/page.tsx`

**Add:**
1. ✅ Better success animation
2. ✅ Next steps guidance
3. ✅ Email confirmation
4. ✅ Application tracking number
5. ✅ Estimated processing time

**Estimated Time:** 2-3 hours

#### Priority 4: Branding
**Files to update:**
- All pages
- Email templates
- Error pages

**Add:**
1. ✅ Opulanz color scheme consistency
2. ✅ Logo placement optimization
3. ✅ Footer with company info
4. ✅ Legal pages (Terms, Privacy, etc.)
5. ✅ Contact information

**Estimated Time:** 3-4 hours

**Total Estimated Time:** 15-21 hours (2-3 days of work)

---

### ✅ Step 4: Prepare Deployment (This Week)

#### A. Environment Setup

**Create Production Environment Files:**

1. **Backend Production Config**
   ```bash
   # Create: backend/.env.production

   PORT=5000
   NODE_ENV=production

   # Production Database
   DB_HOST=opulanz-pg-prod.postgres.database.azure.com
   DB_USER=opulanz_admin
   DB_PASSWORD=[PRODUCTION_PASSWORD]
   DB_NAME=opulanz_banking
   DB_PORT=5432

   # Narvi Production API
   NARVI_API_URL=https://api.narvi.com/rest/v1.0
   NARVI_API_KEY_ID=[PRODUCTION_KEY_ID]
   NARVI_PRIVATE_KEY_PATH=/secrets/narvi_prod_private.pem

   # Frontend URL
   FRONTEND_URL=https://opulanz.com

   # Security
   JWT_SECRET=[GENERATE_STRONG_SECRET]
   SESSION_SECRET=[GENERATE_STRONG_SECRET]
   ENCRYPTION_KEY=[GENERATE_STRONG_KEY]
   ```

2. **Frontend Production Config**
   ```bash
   # Create: .env.production

   NEXT_PUBLIC_API_URL=https://api.opulanz.com
   NEXT_PUBLIC_ENVIRONMENT=production
   ```

#### B. Hosting Selection

**Recommended Stack:**

1. **Frontend:** Vercel
   - ✅ Automatic Next.js optimization
   - ✅ Global CDN
   - ✅ Free SSL
   - ✅ Automatic deployments from GitHub
   - ✅ Cost: $0/month (Hobby) or $20/month (Pro)

2. **Backend:** Azure App Service
   - ✅ Already using Azure for database
   - ✅ Easy scaling
   - ✅ Built-in monitoring
   - ✅ Integration with Azure services
   - ✅ Cost: ~$50-100/month (B1 tier)

3. **Database:** Azure PostgreSQL (Current)
   - ✅ Already set up
   - ✅ Automatic backups
   - ✅ High availability
   - ✅ Cost: Current tier

**Alternative Stack (Lower Cost):**

1. **Frontend:** Netlify or GitHub Pages
2. **Backend:** Render.com or Railway.app
3. **Database:** Keep Azure PostgreSQL

#### C. Domain Setup

**Purchase/Configure:**
1. Buy domain: opulanz.com
2. Configure DNS:
   ```
   A     @           → [Vercel IP]
   CNAME www         → opulanz.com
   CNAME api         → [Azure App Service URL]
   TXT   @           → [Domain verification]
   ```

3. SSL Certificates: Automatic with Vercel/Azure

#### D. Production Checklist

**Before Go-Live:**
```
□ Production database created and secured
□ Environment variables configured
□ SSL certificates active
□ Domain DNS propagated
□ Narvi production API key obtained
□ BaaS permissions confirmed
□ Backend deployed and tested
□ Frontend deployed and tested
□ End-to-end testing completed
□ Monitoring and logging configured
□ Backup strategy implemented
□ Security audit completed
□ Legal pages published (Terms, Privacy)
□ Contact information added
□ Support email configured
□ Error tracking setup (Sentry)
□ Performance monitoring (New Relic or similar)
```

---

## 📅 PATH B: AFTER NARVI ENABLES BAAS

### ✅ Step 5: Test Real Onboarding (1-2 hours)

**When:** Immediately after Narvi confirms BaaS is enabled

#### A. Create Test Script
**File:** `backend/test-complete-onboarding.js`

```javascript
/**
 * Test Complete Onboarding Flow with BaaS
 *
 * This script tests the full customer onboarding workflow:
 * 1. Create individual customer entity in Narvi
 * 2. Issue EUR IBAN to customer
 * 3. Save customer data to our database
 * 4. Link Narvi entity PID and IBAN
 */

const narviService = require('./src/services/narvi');
const { pool } = require('./src/config/db');

async function testCompleteOnboarding() {
  console.log('🧪 Testing Complete Onboarding with BaaS\n');
  console.log('═'.repeat(80));

  try {
    // Test 1: Create Private Entity
    console.log('\n📝 TEST 1: Create Private Entity');
    console.log('─'.repeat(80));

    const testCustomer = {
      firstName: 'Jean',
      lastName: 'Dupont',
      birthdate: '1990-05-15',
      address: '123 Avenue de la Liberté',
      zipCode: 'L-1009',
      city: 'Luxembourg',
      country: 'LU',
      citizenshipCountries: ['FR'],
      birthCountry: 'FR',
      isPoliticallyExposed: false,
      wealthSource: ['SALARY'],
      openingAccountReason: ['SAVINGS', 'TRANSACTIONS']
    };

    console.log('Creating private entity...');
    const entityResult = await narviService.createPrivateEntity(testCustomer);

    if (!entityResult.success) {
      console.log('❌ FAILED: Could not create private entity');
      console.log('Error:', entityResult.error);
      return;
    }

    console.log('✅ SUCCESS: Private entity created');
    console.log('Entity PID:', entityResult.data.pid);

    // Test 2: Issue Account
    console.log('\n📝 TEST 2: Issue EUR Account');
    console.log('─'.repeat(80));

    console.log('Issuing EUR IBAN...');
    const accountResult = await narviService.issueAccount(
      'PRIVATE',
      entityResult.data.pid,
      'EUR'
    );

    if (!accountResult.success) {
      console.log('❌ FAILED: Could not issue account');
      console.log('Error:', accountResult.error);
      return;
    }

    console.log('✅ SUCCESS: Account issued');
    console.log('IBAN:', accountResult.data.number);
    console.log('Account PID:', accountResult.data.pid);
    console.log('BIC:', accountResult.data.bic);

    // Test 3: Save to Database
    console.log('\n📝 TEST 3: Save to Database');
    console.log('─'.repeat(80));

    const dbResult = await pool.query(
      `INSERT INTO applications (
        type, status, payload, narvi_customer_id
      ) VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [
        'individual',
        'approved',
        JSON.stringify({
          ...testCustomer,
          narvi_entity_pid: entityResult.data.pid,
          narvi_account_pid: accountResult.data.pid,
          iban: accountResult.data.number,
          bic: accountResult.data.bic
        }),
        entityResult.data.pid
      ]
    );

    console.log('✅ SUCCESS: Saved to database');
    console.log('Application ID:', dbResult.rows[0].id);

    // Summary
    console.log('\n' + '═'.repeat(80));
    console.log('🎉 COMPLETE ONBOARDING TEST PASSED');
    console.log('═'.repeat(80));
    console.log('\n✅ Summary:');
    console.log(`   1. Created private entity: ${entityResult.data.pid}`);
    console.log(`   2. Issued IBAN: ${accountResult.data.number}`);
    console.log(`   3. Saved to database: Application #${dbResult.rows[0].id}`);
    console.log('\n🎯 Next Step: Enable automatic onboarding in production!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run test
testCompleteOnboarding();
```

#### B. Run Test
```bash
cd backend
node test-complete-onboarding.js
```

**Expected Result:**
```
✅ Private entity created: [PID]
✅ IBAN issued: FI##############
✅ Saved to database: Application #26
```

#### C. Verify in Narvi Dashboard
1. Log into https://my.narvi.com
2. Navigate to Customers
3. Find new customer: Jean Dupont
4. Verify IBAN issued
5. Check account status: ACTIVE

---

### ✅ Step 6: Enable Automatic IBAN Creation (2-3 hours)

**When:** After Step 5 passes successfully

#### A. Update Individual Account Form

**File:** `app/[locale]/open-account/individual/page.tsx`

**Change the `onSubmit` function:**

```typescript
const onSubmit = async (data: WhitelabelKYCFormData) => {
  setIsSubmitting(true);

  try {
    // Submit to backend
    const response = await fetch('http://localhost:5000/api/applications/onboard-individual', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (result.success && result.narvi && result.narvi.iban) {
      // SUCCESS: IBAN issued
      toast({
        title: "Account Created Successfully!",
        description: `Your IBAN: ${result.narvi.iban}`,
      });

      // Redirect to dashboard or success page
      router.push(`/${locale}/dashboard?new_account=${result.data.id}`);
    } else if (result.success && !result.narvi.iban) {
      // Application saved but IBAN pending manual review
      toast({
        title: "Application Submitted",
        description: "Your application is under review. We'll contact you within 24 hours.",
      });
    } else {
      toast({
        title: "Submission Error",
        description: result.error || "Please try again",
        variant: "destructive"
      });
    }
  } catch (error) {
    toast({
      title: "Connection Error",
      description: "Please check your connection and try again",
      variant: "destructive"
    });
  } finally {
    setIsSubmitting(false);
  }
};
```

#### B. Create New Backend Endpoint

**File:** `backend/src/routes/applications.js`

Add new route:

```javascript
router.post('/onboard-individual', async (req, res) => {
  try {
    const customerData = req.body;

    // Step 1: Create entity in Narvi
    const entityResult = await narviService.createPrivateEntity({
      firstName: customerData.firstName,
      lastName: customerData.lastName,
      birthdate: customerData.dateOfBirth,
      address: customerData.address,
      zipCode: customerData.postalCode,
      city: customerData.city,
      country: customerData.country,
      citizenshipCountries: [customerData.nationality],
      birthCountry: customerData.nationality,
      isPoliticallyExposed: customerData.isPEP || false,
      wealthSource: [mapSourceOfFunds(customerData.sourceOfFunds)],
      openingAccountReason: ['SAVINGS', 'TRANSACTIONS']
    });

    if (!entityResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Failed to create customer entity',
        details: entityResult.error
      });
    }

    // Step 2: Issue EUR account
    const accountResult = await narviService.issueAccount(
      'PRIVATE',
      entityResult.data.pid,
      'EUR'
    );

    if (!accountResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Failed to issue IBAN',
        details: accountResult.error,
        entityPid: entityResult.data.pid
      });
    }

    // Step 3: Save to database
    const dbResult = await pool.query(
      `INSERT INTO applications (
        type, status, payload, narvi_customer_id
      ) VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [
        'individual',
        'approved',
        JSON.stringify({
          ...customerData,
          narvi_entity_pid: entityResult.data.pid,
          narvi_account_pid: accountResult.data.pid,
          iban: accountResult.data.number,
          bic: accountResult.data.bic,
          created_at: new Date().toISOString()
        }),
        entityResult.data.pid
      ]
    );

    // Step 4: Send confirmation email (optional)
    // await sendConfirmationEmail(customerData.email, accountResult.data.number);

    // Return success
    res.status(201).json({
      success: true,
      data: dbResult.rows[0],
      narvi: {
        entityPid: entityResult.data.pid,
        accountPid: accountResult.data.pid,
        iban: accountResult.data.number,
        bic: accountResult.data.bic
      }
    });

  } catch (error) {
    console.error('Onboarding error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

#### C. Test End-to-End

1. Fill out form: http://localhost:3000/en/open-account/individual
2. Submit
3. Verify:
   - ✅ Success message shows
   - ✅ IBAN displayed
   - ✅ Redirect to dashboard
   - ✅ New account visible in dashboard
   - ✅ Data in database
   - ✅ Customer in Narvi dashboard

---

### ✅ Step 7: Deploy to Production (4-6 hours)

**When:** After all tests pass

#### A. Backend Deployment (Azure App Service)

```bash
# 1. Create Azure App Service
az webapp create \
  --resource-group opulanz-prod \
  --plan opulanz-backend-plan \
  --name opulanz-api \
  --runtime "NODE:18-lts"

# 2. Configure environment variables
az webapp config appsettings set \
  --resource-group opulanz-prod \
  --name opulanz-api \
  --settings \
    NODE_ENV=production \
    DB_HOST=opulanz-pg-prod.postgres.database.azure.com \
    # ... (add all production variables)

# 3. Deploy code
cd backend
zip -r deploy.zip .
az webapp deployment source config-zip \
  --resource-group opulanz-prod \
  --name opulanz-api \
  --src deploy.zip
```

#### B. Frontend Deployment (Vercel)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy
cd C:\Users\Toufi\AndroidStudioProjects\opulanzbanking
vercel --prod

# 4. Configure environment variables in Vercel dashboard
# https://vercel.com/dashboard → Settings → Environment Variables
```

#### C. Configure Custom Domain

**Vercel (Frontend):**
1. Go to Vercel Dashboard → Settings → Domains
2. Add domain: opulanz.com
3. Add DNS records as instructed
4. Wait for SSL provisioning (automatic)

**Azure (Backend API):**
1. Go to Azure Portal → App Service → Custom Domains
2. Add domain: api.opulanz.com
3. Configure DNS CNAME
4. Enable SSL (automatic with Azure)

#### D. Final Testing

**Production URLs:**
- Frontend: https://opulanz.com
- Backend API: https://api.opulanz.com

**Test:**
1. ✅ Homepage loads
2. ✅ Forms submit correctly
3. ✅ IBAN creation works
4. ✅ Transactions processed
5. ✅ SSL certificates active
6. ✅ All API calls successful
7. ✅ Database connected
8. ✅ Monitoring active

---

## 📊 Timeline Summary

```
WEEK 1 (This Week)
──────────────────────────────────────────────────
Day 1 (Today):    Demo to boss + Email Narvi
Day 2-3:          UI/UX improvements
Day 4-5:          Deployment preparation
Day 6-7:          Wait for Narvi response

WEEK 2 (After BaaS Enabled)
──────────────────────────────────────────────────
Day 1:            Test complete onboarding
Day 2:            Enable automatic IBAN creation
Day 3:            End-to-end testing
Day 4:            Deploy to production
Day 5:            Final testing & monitoring
Day 6-7:          Soft launch

WEEK 3 (Production)
──────────────────────────────────────────────────
Day 1:            Official launch
Day 2-7:          Monitor, fix issues, scale
```

---

## ✅ Success Criteria

**Phase 1: Complete** ✅
- [x] Backend API working
- [x] Frontend UI complete
- [x] Database integrated
- [x] Narvi REST API working
- [x] Transactions functional
- [x] VOP implemented

**Phase 2: In Progress** ⏳
- [ ] BaaS permissions obtained
- [ ] Automatic IBAN issuance working
- [ ] End-to-end onboarding tested

**Phase 3: Pending** 🎯
- [ ] Production deployment complete
- [ ] Custom domain configured
- [ ] Monitoring active
- [ ] First real customers onboarded

---

## 📞 Support & Resources

### Documentation
- `TESTING_GUIDE.md` - Complete testing instructions
- `NARVI_INTEGRATION_STATUS.md` - Technical details
- `BOSS_QUICK_START.md` - Quick demo guide
- `DEPLOYMENT_GUIDE.md` - Production deployment (to be created)

### Test Scripts
- `test-complete-demo.js` - Full platform demo
- `test-vop-flow.js` - Transaction testing
- `test-complete-onboarding.js` - BaaS testing (after enabled)

### Key URLs
- **Development Frontend:** http://localhost:3000
- **Development Backend:** http://localhost:5000
- **Narvi Dashboard:** https://my.narvi.com
- **Azure Portal:** https://portal.azure.com
- **Documentation:** This file

---

## 🎯 Your Roadmap is Clear

```
TODAY
  ├─ Show demo to boss ✅
  ├─ Email Narvi ✅
  ├─ Polish UI ⏳
  └─ Prepare deployment ⏳

THIS WEEK
  └─ Wait for Narvi response ⏳

NEXT WEEK (After BaaS)
  ├─ Test onboarding ⏳
  ├─ Enable automatic IBAN ⏳
  └─ Deploy to production ⏳

PRODUCTION
  └─ Launch Opulanz! 🚀
```

**You're on the right track. Execute this plan and you'll be live in 2-3 weeks!**

---

**Created:** November 13, 2025
**Version:** 1.0
**Status:** Ready to Execute
