# 12 — Mobile App (Android & iOS)

## Overview

The Opulanz web app is wrapped as a native mobile app using **Capacitor**. The same Next.js code becomes an Android APK and iOS app.

---

## Tools Required

| Tool | Required For | Download |
|------|-------------|----------|
| Node.js 18+ | Build process | https://nodejs.org |
| Android Studio | Android build | https://developer.android.com/studio |
| Xcode | iOS build (Mac only) | Mac App Store |
| Java JDK 17+ | Android build | https://adoptium.net |

---

## Configuration File

**File:** `capacitor.config.ts`

```typescript
{
  appId: 'com.opulanz.banking',
  appName: 'Opulanz',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  }
}
```

---

## Building for Android

### Step 1 — Build the static export
```bash
cd C:\Users\Toufi\AndroidStudioProjects\azuree

# Windows
npm run build:mobile:win

# This runs: set NEXT_OUTPUT=export && next build
# Output goes to the /out folder
```

### Step 2 — Sync to Capacitor
```bash
npx cap sync android
```

### Step 3 — Open in Android Studio
```bash
npx cap open android
# OR
npm run cap:android
```

### Step 4 — Build in Android Studio
1. Android Studio opens automatically
2. Wait for Gradle to sync (first time: 5-10 minutes)
3. Click **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
4. APK saved to: `android/app/build/outputs/apk/debug/app-debug.apk`

### One-Command Deploy to Android (if device connected)
```bash
npm run deploy:android
```

---

## Building for iOS (Mac Only)

### Step 1 — Build
```bash
npm run build:mobile
```

### Step 2 — Sync
```bash
npx cap sync ios
```

### Step 3 — Open in Xcode
```bash
npx cap open ios
# OR
npm run cap:ios
```

### Step 4 — Build in Xcode
1. Xcode opens automatically
2. Select your target device or simulator
3. Click **▶ Run** to build and run

### One-Command
```bash
npm run deploy:ios
```

---

## APK Files

Pre-built APK files are in the project root:
- `opulanz-android-20260608.zip` — Android build from June 8, 2026
- `opulanz-android-20260615.apk` — Android APK from June 15, 2026
- `Opulanz-Android.zip` — Full Android project archive

To install on an Android device:
1. Transfer the `.apk` file to the phone
2. On the phone: Settings → Security → Allow installation from unknown sources
3. Tap the APK file to install

---

## API URL for Mobile

The mobile app uses the **backend API URL directly** (not a proxy), because Capacitor doesn't support same-origin proxies.

In `components/paypal-buttons.tsx`:
```javascript
const PAYPAL_API = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/paypal`;
```

For production mobile app builds, `NEXT_PUBLIC_API_URL` must be set to the Azure backend URL:
```
NEXT_PUBLIC_API_URL=https://rg-opulanz-backend-ffa3bgfze4a4g6gf.canadacentral-01.azurewebsites.net
```

---

## App Details

| Setting | Value |
|---------|-------|
| App ID | `com.opulanz.banking` |
| App Name | `Opulanz` |
| iOS Scheme | `Opulanz` |
| Min Android SDK | 22 (Android 5.1) |
| Target Android SDK | 34 |

---

## Publishing to App Stores

### Google Play Store
1. Generate a signed APK (Release mode) in Android Studio
2. Create a Google Play Console account at https://play.google.com/console
3. Create new app → Upload APK/AAB
4. Fill in store listing, screenshots, description
5. Submit for review

### Apple App Store
1. Build archive in Xcode (Product → Archive)
2. Open Organizer → Distribute App → App Store Connect
3. Sign in with Apple Developer account ($99/year)
4. Submit for review in App Store Connect
