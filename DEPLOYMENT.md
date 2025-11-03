# GitHub Pages Deployment Guide for Opulanz Banking

## ⚠️ IMPORTANT: GitHub Pages Configuration Required

Before the site will work, you MUST configure GitHub Pages in your repository settings.

### Steps to Enable GitHub Pages:

1. **Go to Repository Settings:**
   - Navigate to: https://github.com/TAJKING10/opulanzbanking/settings/pages

2. **Configure the Source:**
   - Under "Build and deployment"
   - Find the **"Source"** dropdown
   - Select **"GitHub Actions"** (NOT "Deploy from a branch")
   - Click Save if prompted

3. **Trigger Deployment:**
   - The workflow will run automatically after configuration
   - Or manually trigger it from: https://github.com/TAJKING10/opulanzbanking/actions

4. **Verify:**
   - Once deployed, your site will be at: https://tajking10.github.io/opulanzbanking/

## Prerequisites

1. A GitHub account with access to the repository
2. GitHub Pages enabled for the repository (see above)
3. GitHub Actions workflow permissions enabled

## Deployment Configuration

### Next.js Configuration

The application is configured for static export with GitHub Pages support in `next.config.js`:

- **basePath:** `/opulanzbanking` (matches repository name)
- **assetPrefix:** `/opulanzbanking/`
- **output:** `export` (static export)
- **images.unoptimized:** `true` (required for static export)

**Important:** All routes will be prefixed with `/opulanzbanking` when deployed.

### GitHub Actions Workflow

The automated deployment workflow (`.github/workflows/deploy.yml`):

1. Triggers on pushes to the `main` branch
2. Can be manually triggered via GitHub UI
3. Builds the Next.js application as a static export
4. Adds a `.nojekyll` file to prevent Jekyll processing
5. Deploys to GitHub Pages

## Automatic Deployment

### Push to Main Branch

```bash
git add .
git commit -m "Your commit message"
git push origin main
```

The GitHub Actions workflow will automatically build and deploy.

### Manual Deployment via GitHub UI

1. Go to: https://github.com/TAJKING10/opulanzbanking/actions
2. Click "Deploy to GitHub Pages" workflow
3. Click "Run workflow"
4. Select the `main` branch
5. Click "Run workflow"

## Live URLs

### Main Pages

- **Homepage (EN):** https://tajking10.github.io/opulanzbanking/en
- **Homepage (FR):** https://tajking10.github.io/opulanzbanking/fr
- **About Us:** https://tajking10.github.io/opulanzbanking/en/about
- **Services:** https://tajking10.github.io/opulanzbanking/en/services
- **Support:** https://tajking10.github.io/opulanzbanking/en/support

### Account Opening

- **Open Account:** https://tajking10.github.io/opulanzbanking/en/open-account
- **Individual Account:** https://tajking10.github.io/opulanzbanking/en/open-account/individual
- **Company Account:** https://tajking10.github.io/opulanzbanking/en/open-account/company

### Services

- **Tax Advisory:** https://tajking10.github.io/opulanzbanking/en/tax-advisory
- **Tax Advisory Schedule:** https://tajking10.github.io/opulanzbanking/en/tax-advisory/schedule
- **Investment Advisory:** https://tajking10.github.io/opulanzbanking/en/investment-advisory
- **Investment Advisory Schedule:** https://tajking10.github.io/opulanzbanking/en/investment-advisory/schedule
- **Accounting & Invoicing:** https://tajking10.github.io/opulanzbanking/en/invoicing-accounting
- **Accounting Get Started:** https://tajking10.github.io/opulanzbanking/en/invoicing-accounting/get-started
- **Life Insurance:** https://tajking10.github.io/opulanzbanking/en/life-insurance
- **Company Formation:** https://tajking10.github.io/opulanzbanking/en/company-formation

### Legal Pages

- **Terms & Conditions:** https://tajking10.github.io/opulanzbanking/en/legal/terms
- **Privacy Policy:** https://tajking10.github.io/opulanzbanking/en/legal/privacy
- **Disclaimers:** https://tajking10.github.io/opulanzbanking/en/legal/disclaimers
- **Regulatory:** https://tajking10.github.io/opulanzbanking/en/legal/regulatory

## Local Build Testing

Test the production build locally before deploying:

```bash
# Build the application
NODE_ENV=production npm run build

# Serve the build output
npx serve out
```

The site will be available at `http://localhost:3000` with the base path included.

## Troubleshooting

### 404 Errors on Service Pages

**Problem:** Pages like tax advisory or investment advisory show 404 errors.

**Solution:** This has been fixed. All pages now use Next.js `<Link>` components instead of `<a>` tags, which properly handle the base path.

**Files Fixed (November 2024):**
- `app/[locale]/tax-advisory/page.tsx`
- `app/[locale]/investment-advisory/page.tsx`
- `app/[locale]/invoicing-accounting/page.tsx`

### Assets Not Loading

**Problem:** Images, CSS, or JavaScript files return 404 errors.

**Solution:**
- Ensure `assetPrefix: '/opulanzbanking/'` is set in `next.config.js`
- Set `images.unoptimized: true` for static export
- The `.nojekyll` file is automatically added to prevent Jekyll processing

### Navigation Links Not Working

**Problem:** Internal links navigate to wrong path or show 404.

**Solution:** Always use Next.js `<Link>` component:

```tsx
// ✅ Correct
import Link from 'next/link';
<Link href={`/${locale}/tax-advisory`}>Tax Advisory</Link>

// ❌ Wrong
<a href={`/${locale}/tax-advisory`}>Tax Advisory</a>
```

### Build Failures

**Check Workflow Logs:**
1. Go to: https://github.com/TAJKING10/opulanzbanking/actions
2. Click on the failed workflow run
3. Review the build logs for specific errors

**Common Issues:**
- Missing dependencies: Run `npm install` and commit `package-lock.json`
- TypeScript errors: Run `npm run type-check`
- Translation errors: Check `messages/en.json` and `messages/fr.json`

### Calendly Integration Issues

**Problem:** Calendly booking widget doesn't load.

**Current Configuration:**
- Script loading strategy: `lazyOnload`
- Calendly link: `https://calendly.com/advansystradingait/new-meeting`
- Primary brand color: `#ae7f06`
- Both tax advisory and investment advisory use the same Calendly link

**Files:**
- `app/[locale]/tax-advisory/schedule/page.tsx`
- `app/[locale]/investment-advisory/schedule/page.tsx`

## Making Updates

### Adding New Pages

1. Create the page in `app/[locale]/your-page/page.tsx`
2. Use Next.js `<Link>` components for all internal navigation
3. Test locally: `npm run dev`
4. Test production build: `NODE_ENV=production npm run build`
5. Commit and push to trigger deployment

### Updating Existing Pages

1. Make your changes
2. Test locally: `npm run dev`
3. Test production build: `NODE_ENV=production npm run build`
4. Commit and push

### Important Rules

- **Always use Next.js `<Link>` components** for internal navigation
- **Test production builds locally** before pushing
- **Avoid absolute URLs** for internal links
- **Check all routes** after deployment

## Deployment Process

### Timeline

- **Build time:** 2-5 minutes
- **Deployment time:** 1-2 minutes
- **Total:** 3-7 minutes from push to live

### Monitoring

1. Go to Actions tab: https://github.com/TAJKING10/opulanzbanking/actions
2. Look for "Deploy to GitHub Pages" workflow
3. ✅ Green checkmark = successful
4. ❌ Red X = failed (click to see logs)

### Verification Checklist

After deployment:

1. ✅ Visit homepage: https://tajking10.github.io/opulanzbanking/en
2. ✅ Test all service pages (Tax, Investment, Accounting)
3. ✅ Test Calendly integrations on scheduling pages
4. ✅ Verify all internal links work
5. ✅ Test language switching (EN/FR)
6. ✅ Test account opening flows
7. ✅ Check legal pages load correctly

## Recent Fixes (November 2024)

### 1. Fixed Navigation Links

**Issue:** Service pages showing 404 errors on GitHub Pages

**Fix:** Replaced `<a href>` with Next.js `<Link>` components

**Impact:** All internal navigation now handles the base path correctly

### 2. Added .nojekyll File

**Issue:** GitHub Pages ignoring `_next` directory (Jekyll processing)

**Fix:** Workflow automatically creates `.nojekyll` file

**Impact:** All static assets load correctly

### 3. Updated Workflow

**Fix:** Added `.nojekyll` creation step before artifact upload

**Impact:** Consistent deployments without Jekyll issues

## Summary

✅ Application configured for GitHub Pages
✅ Automatic deployment on push to `main`
✅ Manual deployment available via GitHub Actions
✅ All navigation uses Next.js `<Link>` components
✅ Jekyll processing disabled
✅ Calendly integrations working
✅ Production build tested and verified

**Your application is ready for deployment!**

Push to the `main` branch or manually trigger the workflow to deploy.
