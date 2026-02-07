import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as RevenueCatService from '../services/revenueCatService';

export default function RootLayout() {
  useEffect(() => {
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
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="paywall"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
