// RevenueCat and IAP code removed for crash isolation test
// Safe stub implementation for useIAP

export const useIAP = () => ({
  products: [],
  loading: false,
  isPurchasing: false,
  isProUser: false,
  customerInfo: null,
  purchaseProduct: async () => {},
  restorePurchases: async () => false,
  getProductPrice: () => '',
  checkProStatus: async () => {},
});
