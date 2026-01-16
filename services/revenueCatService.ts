import Purchases, { 
  CustomerInfo, 
  PurchasesOffering,
  LOG_LEVEL 
} from 'react-native-purchases';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// RevenueCat API Keys
const REVENUECAT_TEST_KEY = 'test_qyLrAiaMuauKadZhdwxiCBmzhXP'; // For Expo Go
const REVENUECAT_PRODUCTION_KEY = 'sk_jBFAmTiGOsZfyxzKEpHqCXtdTvKZm'; // For builds

// Check if running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

// Use test key in Expo Go, production key in builds
const REVENUECAT_API_KEY = isExpoGo ? REVENUECAT_TEST_KEY : REVENUECAT_PRODUCTION_KEY;

// Entitlement identifier
export const ENTITLEMENT_ID = 'Bullish Bearish Stocks Pro';

/**
 * Initialize RevenueCat SDK
 * Call this once when your app starts
 */
export const initializeRevenueCat = async (): Promise<void> => {
  try {
    // Enable debug logs for testing (disable in production)
    if (__DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    }

    // Configure RevenueCat
    Purchases.configure({
      apiKey: REVENUECAT_API_KEY,
    });

    console.log('✅ RevenueCat initialized successfully');
  } catch (error: any) {
    // Silently fail in Expo Go
    if (error.message?.includes('Expo Go')) {
      console.warn('⚠️ Running in Expo Go - IAP unavailable');
      return;
    }
    console.error('❌ Error initializing RevenueCat:', error);
    throw error;
  }
};

/**
 * Get current customer info including entitlements
 */
export const getCustomerInfo = async (): Promise<CustomerInfo> => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    console.log('📊 Customer Info:', {
      activeSubscriptions: Object.keys(customerInfo.activeSubscriptions),
      entitlements: Object.keys(customerInfo.entitlements.active),
    });
    return customerInfo;
  } catch (error) {
    console.error('❌ Error getting customer info:', error);
    throw error;
  }
};

/**
 * Check if user has Pro entitlement
 */
export const hasProAccess = async (): Promise<boolean> => {
  try {
    const customerInfo = await getCustomerInfo();
    const hasAccess = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
    console.log('🔒 Pro Access:', hasAccess);
    return hasAccess;
  } catch (error) {
    console.error('❌ Error checking Pro access:', error);
    return false;
  }
};

/**
 * Get available offerings (subscription packages)
 */
export const getOfferings = async (): Promise<PurchasesOffering | null> => {
  try {
    const offerings = await Purchases.getOfferings();
    
    if (offerings.current !== null) {
      console.log('📦 Available packages:', offerings.current.availablePackages.length);
      offerings.current.availablePackages.forEach(pkg => {
        console.log(`  - ${pkg.identifier}: ${pkg.product.priceString}`);
      });
      return offerings.current;
    } else {
      console.warn('⚠️ No offerings found');
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting offerings:', error);
    throw error;
  }
};

/**
 * Purchase a package
 */
export const purchasePackage = async (
  packageToPurchase: any
): Promise<{ customerInfo: CustomerInfo; userCancelled: boolean }> => {
  try {
    console.log('💳 Attempting to purchase:', packageToPurchase.identifier);
    const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
    
    console.log('✅ Purchase successful!');
    console.log('📊 Updated entitlements:', Object.keys(customerInfo.entitlements.active));
    
    return { customerInfo, userCancelled: false };
  } catch (error: any) {
    if (error.userCancelled) {
      console.log('🚫 User cancelled purchase');
      return { customerInfo: await getCustomerInfo(), userCancelled: true };
    } else {
      console.error('❌ Purchase error:', error);
      throw error;
    }
  }
};

/**
 * Restore purchases
 */
export const restorePurchases = async (): Promise<CustomerInfo> => {
  try {
    console.log('🔄 Restoring purchases...');
    const customerInfo = await Purchases.restorePurchases();
    
    const activeEntitlements = Object.keys(customerInfo.entitlements.active);
    if (activeEntitlements.length > 0) {
      console.log('✅ Purchases restored:', activeEntitlements);
    } else {
      console.log('ℹ️ No purchases to restore');
    }
    
    return customerInfo;
  } catch (error) {
    console.error('❌ Error restoring purchases:', error);
    throw error;
  }
};

/**
 * Set user attributes for analytics
 */
export const setUserAttributes = async (attributes: {
  email?: string;
  displayName?: string;
  [key: string]: string | undefined;
}): Promise<void> => {
  try {
    if (attributes.email) {
      await Purchases.setEmail(attributes.email);
    }
    if (attributes.displayName) {
      await Purchases.setDisplayName(attributes.displayName);
    }
    
    // Set custom attributes
    Object.keys(attributes).forEach(key => {
      if (key !== 'email' && key !== 'displayName' && attributes[key]) {
        Purchases.setAttributes({ [key]: attributes[key]! });
      }
    });
    
    console.log('✅ User attributes set');
  } catch (error) {
    console.error('❌ Error setting user attributes:', error);
  }
};

/**
 * Get customer info listener for real-time updates
 */
export const addCustomerInfoListener = (
  callback: (customerInfo: CustomerInfo) => void
): (() => void) => {
  Purchases.addCustomerInfoUpdateListener(callback);
  
  // Return cleanup function
  return () => {
    // RevenueCat automatically manages listeners
    console.log('🔌 Customer info listener cleaned up');
  };
};

/**
 * Log out current user (anonymous)
 */
export const logOut = async (): Promise<void> => {
  try {
    const customerInfo = await Purchases.logOut();
    console.log('👋 User logged out');
    return;
  } catch (error) {
    console.error('❌ Error logging out:', error);
    throw error;
  }
};

/**
 * Identify user with custom ID
 */
export const identifyUser = async (userId: string): Promise<void> => {
  try {
    const { customerInfo } = await Purchases.logIn(userId);
    console.log('👤 User identified:', userId);
    console.log('📊 Active subscriptions:', Object.keys(customerInfo.activeSubscriptions));
  } catch (error) {
    console.error('❌ Error identifying user:', error);
    throw error;
  }
};
