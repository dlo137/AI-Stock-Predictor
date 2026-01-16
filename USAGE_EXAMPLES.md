# RevenueCat Integration - Usage Examples

## Quick Start

Your app is now fully integrated with RevenueCat! Here's how to use the IAP features:

## 1. Check if User Has Pro Access

```typescript
import * as RevenueCatService from './services/revenueCatService';

// Anywhere in your app
const checkAccess = async () => {
  const hasPro = await RevenueCatService.hasProAccess();
  
  if (hasPro) {
    console.log('User has Pro access!');
    // Show premium features
  } else {
    console.log('User needs to upgrade');
    // Show paywall or locked state
  }
};
```

## 2. Show Paywall (Two Options)

### Option A: Use RevenueCat's Native Paywall (Recommended)
```typescript
import { showPaywall } from './app/components/RevenueCatPaywall';

// Show paywall and check result
const handleUpgrade = async () => {
  const purchased = await showPaywall();
  
  if (purchased) {
    // User completed purchase or restored
    console.log('User is now Pro!');
  }
};
```

### Option B: Use Custom Paywall UI
```typescript
import { router } from 'expo-router';

// Navigate to custom paywall screen
const handleUpgrade = () => {
  router.push('/paywall');
};
```

## 3. Use ProGate Component

Wrap any premium feature with ProGate to automatically check entitlement:

```typescript
import { ProGate } from './app/components/ProGate';

function MyScreen() {
  return (
    <View>
      {/* Free content - always visible */}
      <BasicFeature />
      
      {/* Premium content - only for Pro users */}
      <ProGate showPaywallOnDenied={true}>
        <PremiumFeature />
      </ProGate>
      
      {/* Premium with custom fallback */}
      <ProGate 
        fallback={
          <TouchableOpacity onPress={() => showPaywall()}>
            <Text>Upgrade to Pro to unlock</Text>
          </TouchableOpacity>
        }
      >
        <AdvancedChart />
      </ProGate>
    </View>
  );
}
```

## 4. Add Subscription Management

The Customer Center is already added to the Profile screen. To add it elsewhere:

```typescript
import RevenueCatUI from 'react-native-purchases-ui';

const handleManageSubscription = async () => {
  try {
    await RevenueCatUI.presentCustomerCenter();
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## 5. Listen for Subscription Changes

```typescript
import { useEffect, useState } from 'react';
import * as RevenueCatService from './services/revenueCatService';

function MyComponent() {
  const [isProUser, setIsProUser] = useState(false);

  useEffect(() => {
    // Add real-time listener
    const cleanup = RevenueCatService.addCustomerInfoListener((info) => {
      const hasPro = info.entitlements.active[RevenueCatService.ENTITLEMENT_ID] !== undefined;
      setIsProUser(hasPro);
      
      if (hasPro) {
        console.log('User became Pro!');
      }
    });

    // Cleanup on unmount
    return cleanup;
  }, []);

  return (
    <Text>{isProUser ? '⭐ Pro User' : '👤 Free User'}</Text>
  );
}
```

## 6. Using the useIAP Hook

The custom hook provides all IAP functionality:

```typescript
import { useIAP } from './hooks/useIAP';

function PaywallScreen() {
  const {
    products,           // Available subscription products
    loading,           // Loading state
    isPurchasing,      // Purchase in progress
    isProUser,         // User has Pro access
    customerInfo,      // Full customer info
    purchaseProduct,   // Function to purchase
    restorePurchases,  // Function to restore
    getProductPrice,   // Get formatted price
    checkProStatus,    // Manually check status
  } = useIAP();

  return (
    <View>
      {loading ? (
        <ActivityIndicator />
      ) : (
        products.map((product) => (
          <TouchableOpacity
            key={product.productId}
            onPress={() => purchaseProduct(product.productId)}
            disabled={isPurchasing}
          >
            <Text>{product.title}</Text>
            <Text>{product.price}</Text>
          </TouchableOpacity>
        ))
      )}
      
      <TouchableOpacity onPress={restorePurchases}>
        <Text>Restore Purchases</Text>
      </TouchableOpacity>
    </View>
  );
}
```

## 7. Manual Purchase Flow

For advanced use cases:

```typescript
import * as RevenueCatService from './services/revenueCatService';

const handleManualPurchase = async () => {
  try {
    // 1. Get available offerings
    const offering = await RevenueCatService.getOfferings();
    
    if (!offering) {
      console.log('No offerings available');
      return;
    }

    // 2. Find the package you want
    const monthlyPackage = offering.availablePackages.find(
      pkg => pkg.identifier === 'monthly'
    );

    if (!monthlyPackage) {
      console.log('Monthly package not found');
      return;
    }

    // 3. Purchase the package
    const { customerInfo, userCancelled } = await RevenueCatService.purchasePackage(monthlyPackage);

    if (userCancelled) {
      console.log('User cancelled purchase');
      return;
    }

    // 4. Check if purchase granted entitlement
    if (customerInfo.entitlements.active[RevenueCatService.ENTITLEMENT_ID]) {
      console.log('Purchase successful! User is now Pro');
    }
  } catch (error) {
    console.error('Purchase error:', error);
  }
};
```

## 8. Set User Attributes

Track user information in RevenueCat:

```typescript
import * as RevenueCatService from './services/revenueCatService';

// Set user attributes
await RevenueCatService.setUserAttributes({
  email: 'user@example.com',
  displayName: 'John Doe',
  customAttribute: 'value',
});
```

## 9. Identify User

Link purchases to your user ID:

```typescript
import * as RevenueCatService from './services/revenueCatService';

// When user logs in
await RevenueCatService.identifyUser('your-user-id-123');

// When user logs out
await RevenueCatService.logOut();
```

## 10. Check Specific Entitlements

```typescript
import * as RevenueCatService from './services/revenueCatService';

const checkEntitlement = async () => {
  const customerInfo = await RevenueCatService.getCustomerInfo();
  
  // Check if specific entitlement is active
  const proEntitlement = customerInfo.entitlements.active['Bullish Bearish Stocks Pro'];
  
  if (proEntitlement) {
    console.log('Entitlement active since:', proEntitlement.latestPurchaseDate);
    console.log('Will renew on:', proEntitlement.expirationDate);
    console.log('Product ID:', proEntitlement.productIdentifier);
  }
};
```

## Common Patterns

### Lock Feature Behind Paywall
```typescript
const LockedFeature = () => {
  const { isProUser } = useIAP();

  if (!isProUser) {
    return (
      <TouchableOpacity onPress={() => showPaywall()}>
        <View style={styles.lockedCard}>
          <Text>🔒 Premium Feature</Text>
          <Text>Upgrade to Pro to unlock</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return <PremiumFeatureContent />;
};
```

### Show Pro Badge
```typescript
const ProBadge = () => {
  const { isProUser } = useIAP();

  if (!isProUser) return null;

  return (
    <View style={styles.badge}>
      <Text>⭐ PRO</Text>
    </View>
  );
};
```

### Trial Period Check
```typescript
const checkTrialStatus = async () => {
  const customerInfo = await RevenueCatService.getCustomerInfo();
  const entitlement = customerInfo.entitlements.active[RevenueCatService.ENTITLEMENT_ID];

  if (entitlement) {
    const isInTrialPeriod = entitlement.periodType === 'trial';
    
    if (isInTrialPeriod) {
      console.log('User is in trial period');
      console.log('Trial ends:', entitlement.expirationDate);
    }
  }
};
```

## Testing Checklist

Before submitting to App Store:

- [ ] Products configured in RevenueCat dashboard
- [ ] Products linked to App Store Connect IDs
- [ ] Entitlement created and products attached
- [ ] Offering created and set as current
- [ ] Production API key replaced in revenueCatService.ts
- [ ] Tested purchase flow with sandbox account
- [ ] Tested restore purchases
- [ ] Tested subscription management (Customer Center)
- [ ] Tested entitlement checking
- [ ] Verified Pro features are gated correctly
- [ ] Created development build (not using Expo Go)
- [ ] Tested on physical device

## Next Steps

1. **Configure RevenueCat Dashboard**
   - Follow steps in REVENUECAT_SETUP.md
   - Link products to App Store Connect
   - Create offering and set as current

2. **Replace Test API Key**
   - Get production key from RevenueCat
   - Update in services/revenueCatService.ts

3. **Build & Test**
   ```bash
   npx eas build --profile development --platform ios
   ```

4. **Customize Paywall**
   - Use custom paywall.tsx (already created)
   - Or use RevenueCat's native paywall (recommended)

5. **Gate Premium Features**
   - Add ProGate to premium features
   - Check isProUser throughout app

## Support

Check logs for detailed IAP activity:
- ✅ = Success
- ❌ = Error
- 📊 = Info
- 💰 = Purchase events

All RevenueCat operations log to console with these prefixes.
