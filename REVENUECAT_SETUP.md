# RevenueCat Integration Setup Guide

## Overview
This app uses RevenueCat for In-App Purchases (IAP) management. RevenueCat handles subscriptions, purchases, and entitlement checking across iOS and Android.

## Current Configuration

### API Keys
- **Test API Key**: `test_qyLrAiaMuauKadZhdwxiCBmzhXP`
- **Location**: `services/revenueCatService.ts`
- **Entitlement**: "Bullish Bearish Stocks Pro"

### Products
App Store Connect Product IDs:
- `yearly.stock` - Yearly subscription ($99.99/year)
- `monthly.stock` - Monthly subscription ($14.99/month)
- `weekly.stock` - Weekly subscription ($4.99/week)

RevenueCat Product IDs (must match in dashboard):
- `monthly` - Monthly subscription
- `yearly` - Yearly subscription
- `weekly` - Weekly subscription

## Setup Steps

### 1. RevenueCat Dashboard Setup

1. **Sign up/Login to RevenueCat**
   - Go to https://app.revenuecat.com
   - Create a new project: "Bullish Bearish Stocks"

2. **Add App**
   - Navigate to Project Settings → Apps
   - Add iOS app
   - Enter your Bundle ID from `app.json`
   - Enable App Store Connect API integration

3. **Configure Products**
   - Go to Products → Subscriptions
   - Add products with these identifiers:
     - `monthly` → Link to `monthly.stock` in App Store Connect
     - `yearly` → Link to `yearly.stock` in App Store Connect
     - `weekly` → Link to `weekly.stock` in App Store Connect

4. **Create Entitlement**
   - Go to Entitlements
   - Create entitlement: "Bullish Bearish Stocks Pro"
   - Attach all three products to this entitlement

5. **Create Offering**
   - Go to Offerings
   - Create new offering (e.g., "Default")
   - Add packages:
     - Weekly Package → `weekly` product
     - Monthly Package → `monthly` product
     - Yearly Package → `yearly` product (mark as default)
   - Set as current offering

6. **Get API Keys**
   - Go to API Keys
   - Copy iOS API key
   - Replace test key in `services/revenueCatService.ts`:
     ```typescript
     const REVENUECAT_API_KEY = 'YOUR_PRODUCTION_API_KEY';
     ```

### 2. App Store Connect Setup

1. **Configure Products** (if not already done)
   - Go to App Store Connect → My Apps → Your App
   - Navigate to Features → In-App Purchases
   - Create auto-renewable subscriptions:
     - Product ID: `yearly.stock`
       - Price: $99.99
       - Duration: 1 year
     - Product ID: `monthly.stock`
       - Price: $14.99
       - Duration: 1 month
     - Product ID: `weekly.stock`
       - Price: $4.99
       - Duration: 1 week

2. **Create Subscription Group**
   - Group all three subscriptions together
   - Set upgrade/downgrade paths

3. **Add Localizations**
   - Add display names and descriptions
   - Submit for review

### 3. Build Configuration

#### Development Build (for testing IAP)
```bash
# Install dependencies
npm install --legacy-peer-deps

# Create development build
npx eas build --profile development --platform ios

# Install on device
npx eas build:run -p ios
```

#### Production Build
```bash
# Create production build
npx eas build --profile production --platform ios

# Submit to App Store
npx eas submit --platform ios
```

### 4. Testing

#### Test in Development Build
1. Create development build (Expo Go doesn't support native IAP)
2. Install on physical device or simulator
3. Use sandbox test account from App Store Connect
4. Test all purchase flows:
   - New purchase
   - Restore purchases
   - Subscription management
   - Entitlement checking

#### Sandbox Testing
1. **Create Sandbox Tester**
   - Go to App Store Connect → Users and Access → Sandbox Testers
   - Create test account
   - Use this account to test purchases

2. **Sign in with Sandbox Account**
   - On device: Settings → App Store → Sandbox Account
   - Sign in with test account
   - Purchases will be free in sandbox

## Code Architecture

### Service Layer
**`services/revenueCatService.ts`**
- Centralized RevenueCat SDK interaction
- Functions:
  - `initializeRevenueCat()` - Configure SDK
  - `hasProAccess()` - Check entitlement
  - `getOfferings()` - Get subscription packages
  - `purchasePackage()` - Handle purchase
  - `restorePurchases()` - Restore previous purchases
  - `getCustomerInfo()` - Get user subscription status

### Hooks
**`hooks/useIAP.ts`**
- React hook for IAP functionality
- Returns: `{ products, loading, isPurchasing, isProUser, purchaseProduct, restorePurchases }`
- Used by paywall and other components

### Components

**`app/paywall.tsx`**
- Custom paywall UI with three pricing tiers
- Uses `useIAP()` hook
- Handles purchase flow

**`app/components/RevenueCatPaywall.tsx`**
- Native RevenueCat paywall (alternative)
- Uses RevenueCat's pre-built UI
- Function: `showPaywall()` - Present from anywhere

**`app/components/ProGate.tsx`**
- Entitlement gate component
- Wraps premium features
- Usage:
  ```tsx
  <ProGate showPaywallOnDenied={true}>
    <PremiumFeature />
  </ProGate>
  ```

**`app/components/CustomerCenter.tsx`**
- Subscription management
- Opens RevenueCat Customer Center
- Add to profile/settings screen

### Initialization
**`app/_layout.tsx`**
- RevenueCat initialized on app start
- Configures SDK with API key

## Usage Examples

### Check if User is Pro
```typescript
import * as RevenueCatService from '../services/revenueCatService';

const hasPro = await RevenueCatService.hasProAccess();
if (hasPro) {
  // Show premium feature
}
```

### Show Paywall
```typescript
import { showPaywall } from '../app/components/RevenueCatPaywall';

const purchased = await showPaywall();
if (purchased) {
  // User completed purchase
}
```

### Gate Premium Feature
```tsx
import { ProGate } from '../app/components/ProGate';

<ProGate showPaywallOnDenied={true}>
  <PremiumChart />
</ProGate>
```

### Manual Purchase Flow
```typescript
import { useIAP } from '../hooks/useIAP';

const { purchaseProduct, isProUser } = useIAP();

if (!isProUser) {
  await purchaseProduct('monthly');
}
```

## Important Notes

### Expo Go Limitations
- **Does NOT work in Expo Go** - native modules required
- Must use development or production build
- Use EAS Build for testing

### Product ID Mapping
- App Store Connect uses: `yearly.stock`, `monthly.stock`, `weekly.stock`
- RevenueCat dashboard uses: `yearly`, `monthly`, `weekly`
- Both must be configured correctly

### Debug Mode
- Debug logging enabled in `__DEV__` mode
- Check console for detailed IAP logs
- Use emoji prefixes: ✅ (success), ❌ (error), 📊 (info)

### Error Handling
- All service functions have try-catch blocks
- User-friendly alerts on errors
- Console logging for debugging

## Troubleshooting

### "No products available"
- Verify products configured in RevenueCat dashboard
- Check offering is set as current
- Ensure products linked to App Store Connect IDs

### "Purchase failed"
- Check sandbox test account is signed in
- Verify product IDs match exactly
- Check App Store Connect agreements are signed

### "Invalid API key"
- Confirm API key copied correctly
- Check using correct environment (test vs production)
- Verify project configured in RevenueCat

### "Native module not found"
- Not using development/production build
- Expo Go doesn't support native IAP
- Build with `npx eas build`

## Resources

- [RevenueCat Documentation](https://docs.revenuecat.com)
- [React Native SDK](https://docs.revenuecat.com/docs/reactnative)
- [App Store Connect](https://appstoreconnect.apple.com)
- [Expo EAS Build](https://docs.expo.dev/build/introduction/)

## Support

For issues with:
- **RevenueCat**: support@revenuecat.com
- **App Store**: Apple Developer Support
- **Expo**: https://forums.expo.dev
