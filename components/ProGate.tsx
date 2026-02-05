import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import * as RevenueCatService from '../services/revenueCatService';
import { showPaywall } from './RevenueCatPaywall';

interface ProGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showPaywallOnDenied?: boolean;
}

/**
 * ProGate component - wraps premium features and checks entitlement
 * 
 * Usage:
 * <ProGate showPaywallOnDenied={true}>
 *   <PremiumFeature />
 * </ProGate>
 */
export const ProGate: React.FC<ProGateProps> = ({
  children,
  fallback,
  showPaywallOnDenied = false,
}) => {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      const hasPro = await RevenueCatService.hasProAccess();
      setHasAccess(hasPro);

      if (!hasPro && showPaywallOnDenied) {
        // Show paywall if user doesn't have access
        await showPaywall();
        // Re-check after paywall
        const hasProNow = await RevenueCatService.hasProAccess();
        setHasAccess(hasProNow);
      }
    } catch (error) {
      console.error('Error checking Pro access:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#34D399" />
      </View>
    );
  }

  if (!hasAccess) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
});
