import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.highseas.tv',
  appName: 'HighSeas TV',
  webDir: 'build',
  server: {
    androidScheme: 'https',
    allowNavigation: ['*']
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
    // TV-specific settings
    hideLogs: false,
    usesCleartextTraffic: true,
    // Performance optimizations for TV
    hardwareAcceleration: true
  }
};

export default config;
