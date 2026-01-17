import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as RevenueCatService from '../services/revenueCatService';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function RootLayout() {
  useEffect(() => {
    // Log all config and env keys at startup (do NOT log secrets in production)
    try {
      // Expo Constants
      const expoConfig = require('expo-constants').default;
      const extra = expoConfig?.manifest?.extra || expoConfig?.expoConfig?.extra || {};
      console.log('[Startup] Expo extra config:', {
        eas: extra.eas,
        MASSIV_API_KEY: typeof extra.MASSIV_API_KEY === 'string' && extra.MASSIV_API_KEY.length > 0,
        OPENAI_API_KEY: typeof extra.OPENAI_API_KEY === 'string' && extra.OPENAI_API_KEY.length > 0,
        FINNHUB_API_KEY: typeof extra.FINNHUB_API_KEY === 'string' && extra.FINNHUB_API_KEY.length > 0,
        LOGODEV_API_KEY: typeof extra.LOGODEV_API_KEY === 'string' && extra.LOGODEV_API_KEY.length > 0,
      });
    } catch (e) {
      console.warn('[Startup] Could not read Expo config:', e);
    }

    // Defer RevenueCat initialization to avoid blocking app startup
    const initialize = async () => {
      // Wait 2 seconds before initializing to let the app load first
      await new Promise(resolve => setTimeout(resolve, 2000));
      try {
        await RevenueCatService.initializeRevenueCat();
        console.log('✅ RevenueCat initialized successfully');
      } catch (error) {
        // Silently fail in Expo Go - RevenueCat requires development build
        console.warn('⚠️ RevenueCat not available (Expo Go limitation)');
      }
    };
    initialize();
  }, []);

  return (
    <ErrorBoundary>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="paywall" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ErrorBoundary>
  );
}
