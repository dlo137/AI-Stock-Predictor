import React, { useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import { router } from 'expo-router';

interface RevenueCatPaywallProps {
  onDismiss?: () => void;
  onPurchaseCompleted?: () => void;
}

export const RevenueCatPaywall: React.FC<RevenueCatPaywallProps> = ({
  onDismiss,
  onPurchaseCompleted,
}) => {
  useEffect(() => {
    presentPaywall();
  }, []);

  const presentPaywall = async () => {
    try {
      const paywallResult = await RevenueCatUI.presentPaywall({
        // You can pass an offering identifier if you have multiple offerings
        // offering: 'your_offering_id',
      });

      // Handle the result
      if (paywallResult === PAYWALL_RESULT.PURCHASED) {
        console.log('✅ Purchase completed successfully');
        Alert.alert(
          '🎉 Welcome to Pro!',
          'You now have unlimited access to all premium features.',
          [
            {
              text: 'Get Started',
              onPress: () => {
                onPurchaseCompleted?.();
                router.replace('/(tabs)/home');
              },
            },
          ]
        );
      } else if (paywallResult === PAYWALL_RESULT.CANCELLED) {
        console.log('ℹ️ User cancelled paywall');
        onDismiss?.();
      } else if (paywallResult === PAYWALL_RESULT.RESTORED) {
        console.log('✅ Purchases restored');
        Alert.alert('Success', 'Your purchases have been restored!', [
          {
            text: 'OK',
            onPress: () => {
              onPurchaseCompleted?.();
              router.replace('/(tabs)/home');
            },
          },
        ]);
      }
    } catch (error) {
      console.error('❌ Error presenting paywall:', error);
      Alert.alert('Error', 'Unable to load subscription options');
      onDismiss?.();
    }
  };

  return <View style={styles.container} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

// Standalone function to present paywall from anywhere in the app
export const showPaywall = async () => {
  try {
    const paywallResult = await RevenueCatUI.presentPaywall();

    if (paywallResult === PAYWALL_RESULT.PURCHASED) {
      Alert.alert(
        '🎉 Welcome to Pro!',
        'You now have unlimited access to all premium features.'
      );
      return true;
    } else if (paywallResult === PAYWALL_RESULT.RESTORED) {
      Alert.alert('Success', 'Your purchases have been restored!');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('❌ Error presenting paywall:', error);
    Alert.alert('Error', 'Unable to load subscription options');
    return false;
  }
};
