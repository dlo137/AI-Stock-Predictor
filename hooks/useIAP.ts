import { useEffect, useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { CustomerInfo } from 'react-native-purchases';
import * as RevenueCatService from '../services/revenueCatService';

interface Product {
  productId: string;
  price: string;
  title: string;
}

export const useIAP = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isProUser, setIsProUser] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);

  // Initialize RevenueCat on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        await RevenueCatService.initializeRevenueCat();
        await checkProStatus();
        await loadProducts();
      } catch (error) {
        console.error('Error initializing IAP:', error);
      }
    };

    initialize();

    // Listen for customer info updates
    const cleanup = RevenueCatService.addCustomerInfoListener((info) => {
      setCustomerInfo(info);
      setIsProUser(info.entitlements.active[RevenueCatService.ENTITLEMENT_ID] !== undefined);
    });

    return cleanup;
  }, []);

  // Check if user has Pro access
  const checkProStatus = useCallback(async () => {
    try {
      const hasPro = await RevenueCatService.hasProAccess();
      setIsProUser(hasPro);
      
      const info = await RevenueCatService.getCustomerInfo();
      setCustomerInfo(info);
    } catch (error) {
      console.error('Error checking Pro status:', error);
    }
  }, []);

  // Load available products
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const offering = await RevenueCatService.getOfferings();
      
      if (offering) {
        const loadedProducts: Product[] = offering.availablePackages.map((pkg) => ({
          productId: pkg.product.identifier,
          price: pkg.product.priceString,
          title: pkg.product.title,
        }));
        
        setProducts(loadedProducts);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Purchase a product
  const purchaseProduct = useCallback(async (productId: string) => {
    try {
      setIsPurchasing(true);
      
      const offering = await RevenueCatService.getOfferings();
      if (!offering) {
        Alert.alert('Error', 'No products available');
        return;
      }

      const packageToPurchase = offering.availablePackages.find(
        (pkg) => pkg.product.identifier === productId
      );

      if (!packageToPurchase) {
        Alert.alert('Error', 'Product not found');
        return;
      }

      const { customerInfo, userCancelled } = await RevenueCatService.purchasePackage(packageToPurchase);
      
      if (!userCancelled) {
        setCustomerInfo(customerInfo);
        
        // Check if purchase granted Pro access
        if (customerInfo.entitlements.active[RevenueCatService.ENTITLEMENT_ID]) {
          setIsProUser(true);
          Alert.alert(
            '🎉 Welcome to Pro!',
            'You now have unlimited access to all premium features.',
            [{ text: 'Get Started', onPress: () => {} }]
          );
        }
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      Alert.alert('Purchase Error', error.message || 'Something went wrong');
    } finally {
      setIsPurchasing(false);
    }
  }, []);

  // Restore purchases
  const restorePurchases = useCallback(async () => {
    try {
      setLoading(true);
      const customerInfo = await RevenueCatService.restorePurchases();
      setCustomerInfo(customerInfo);
      
      const activeEntitlements = Object.keys(customerInfo.entitlements.active);
      if (activeEntitlements.length > 0) {
        setIsProUser(true);
        Alert.alert('Success', 'Your purchases have been restored!');
        return true;
      } else {
        Alert.alert('No Purchases Found', 'No active subscriptions to restore.');
        return false;
      }
    } catch (error: any) {
      console.error('Restore error:', error);
      Alert.alert('Error', 'Failed to restore purchases');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get product price
  const getProductPrice = useCallback((productId: string): string => {
    const product = products.find((p) => p.productId === productId);
    return product?.price || '';
  }, [products]);

  return {
    products,
    loading,
    isPurchasing,
    isProUser,
    customerInfo,
    purchaseProduct,
    restorePurchases,
    getProductPrice,
    checkProStatus,
  };
};

