# GitHub Pages Deployment Guide

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

## Live URLs:

- **Homepage:** https://tajking10.github.io/opulanzbanking/en
- **Open Account:** https://tajking10.github.io/opulanzbanking/en/open-account
- **Individual Form:** https://tajking10.github.io/opulanzbanking/en/open-account/individual

## Navigation Flow:

All "Open Account" and "Get Started" buttons navigate to:
- `/en/open-account` - Account selection page (Individual or Company)

From there, users can choose:
- Individual Account → Full KYC form
- Company Account → Company KYB form
