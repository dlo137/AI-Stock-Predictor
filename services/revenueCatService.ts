
// RevenueCat and IAP code removed for crash isolation test
// All functions are now stubs

export const initializeRevenueCat = async (): Promise<void> => {
  // IAP removed
};

export const ENTITLEMENT_ID = '';

export const getCustomerInfo = async (): Promise<any> => {
  // Stub: always return null
  return null;
};

export const getOfferings = async (): Promise<null> => {
  // Stub: always return null
  return null;
};

export const purchasePackage = async (
  packageToPurchase: any
): Promise<{ customerInfo: null; userCancelled: boolean }> => {
  // Stub: always return not purchased
  return { customerInfo: null, userCancelled: false };
};

export const setUserAttributes = async (attributes: {
  email?: string;
  displayName?: string;
  [key: string]: string | undefined;
}): Promise<void> => {
  // Stub: do nothing
};

export const addCustomerInfoListener = (
  callback: (customerInfo: any) => void
): (() => void) => {
  // Stub: do nothing, return cleanup
  return () => {
    // No-op
  };
};

export const logOut = async (): Promise<void> => {
  // Stub: do nothing
};

export const identifyUser = async (userId: string): Promise<void> => {
  // Stub: do nothing
};

export const hasProAccess = async (): Promise<boolean> => {
  // Stub: always return false (no pro access in test mode)
  return false;
};
