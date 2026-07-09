import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.opulanz.banking',
  appName: 'Opulanz',
  // Points to the Next.js static export output directory
  webDir: 'out',
  server: {
    // In development, point to your local Next.js dev server for live reload.
    // Comment out for production builds.
    // url: 'http://192.168.1.x:3000',
    // cleartext: true,
  },
  android: {
    // Allow cleartext HTTP traffic to the backend during development
    allowMixedContent: true,
    backgroundColor: '#ffffff',
  },
  ios: {
    backgroundColor: '#ffffff',
    contentInset: 'always',
    // Scroll the web content under the status bar for a native feel
    scrollEnabled: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#ffffff',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DEFAULT',
      backgroundColor: '#ffffff',
    },
  },
};

export default config;
