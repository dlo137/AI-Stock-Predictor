import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

export default function PaywallScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [useCustomPaywall, setUseCustomPaywall] = useState(false);

  useEffect(() => {
    presentPaywall();
  }, []);

  const presentPaywall = async () => {
    try {
      // Try to present RevenueCat paywall
      console.log('Attempting to present RevenueCat paywall...');
      const paywallResult: PAYWALL_RESULT = await RevenueCatUI.presentPaywall();

      setIsLoading(false);

      // Handle the result
      switch (paywallResult) {
        case PAYWALL_RESULT.PURCHASED:
        case PAYWALL_RESULT.RESTORED:
          console.log('✅ Purchase successful or restored');
          router.replace('/(tabs)/home');
          break;
        case PAYWALL_RESULT.CANCELLED:
          console.log('User cancelled paywall');
          setUseCustomPaywall(true);
          break;
        case PAYWALL_RESULT.NOT_PRESENTED:
        case PAYWALL_RESULT.ERROR:
        default:
          console.log('Paywall not presented, showing custom');
          setUseCustomPaywall(true);
          break;
      }
    } catch (error) {
      console.log('⚠️ RevenueCat not available (likely Expo Go)');
      setIsLoading(false);
      setUseCustomPaywall(true);
    }
  };

  const handleSkipForNow = () => {
    router.replace('/(tabs)/home');
  };

  const handleTryAgain = () => {
    setIsLoading(true);
    setUseCustomPaywall(false);
    presentPaywall();
  };

  if (isLoading && !useCustomPaywall) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" />
        <Text style={styles.loadingText}>Loading subscription options...</Text>
      </View>
    );
  }

  if (useCustomPaywall) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.badge}>🚀 PREMIUM</Text>
            <Text style={styles.title}>Unlock AI-Powered{'\n'}Stock Predictions</Text>
            <Text style={styles.subtitle}>Get unlimited access to advanced trading signals</Text>
          </View>

          {/* Features */}
          <View style={styles.features}>
            <FeatureItem icon="📈" text="Unlimited stock predictions" />
            <FeatureItem icon="🤖" text="Advanced AI analysis" />
            <FeatureItem icon="⚡" text="Real-time market signals" />
            <FeatureItem icon="📊" text="Sentiment analysis & insights" />
            <FeatureItem icon="🎯" text="Price target predictions" />
            <FeatureItem icon="🔔" text="Priority support" />
          </View>

          {/* Pricing */}
          <View style={styles.pricingSection}>
            <TouchableOpacity style={styles.planCard} activeOpacity={0.9}>
              <View style={styles.planHeader}>
                <Text style={styles.planName}>Monthly</Text>
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>POPULAR</Text>
                </View>
              </View>
              <Text style={styles.planPrice}>$9.99<Text style={styles.planPeriod}>/month</Text></Text>
              <Text style={styles.planDescription}>Cancel anytime</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.planCard, styles.planCardHighlight]} activeOpacity={0.9}>
              <View style={styles.bestValueBadge}>
                <Text style={styles.bestValueText}>BEST VALUE</Text>
              </View>
              <View style={styles.planHeader}>
                <Text style={styles.planName}>Annual</Text>
                <Text style={styles.savingsBadge}>Save 40%</Text>
              </View>
              <Text style={styles.planPrice}>$59.99<Text style={styles.planPeriod}>/year</Text></Text>
              <Text style={styles.planDescription}>Just $5/month • Cancel anytime</Text>
            </TouchableOpacity>
          </View>

          {/* Notice */}
          <View style={styles.noticeBox}>
            <Text style={styles.noticeText}>
              ⚠️ <Text style={styles.noticeBold}>RevenueCat Setup Required</Text>
            </Text>
            <Text style={styles.noticeSubtext}>
              To enable in-app purchases, complete the RevenueCat setup:{'\n'}
              1. Create entitlement "Bullish Bearish Stocks Pro"{'\n'}
              2. Configure an offering with products{'\n'}
              3. Build with: npx eas build --profile development
            </Text>
          </View>

          {/* Buttons */}
          <TouchableOpacity style={styles.tryAgainButton} onPress={handleTryAgain}>
            <Text style={styles.tryAgainText}>Try RevenueCat Paywall Again</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipButton} onPress={handleSkipForNow}>
            <Text style={styles.skipText}>Continue to App</Text>
          </TouchableOpacity>

          <Text style={styles.terms}>
            Subscriptions auto-renew unless cancelled 24 hours before the end of the current period.
          </Text>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
    </View>
  );
}

const FeatureItem = ({ icon, text }: { icon: string; text: string }) => (
  <View style={styles.featureItem}>
    <Text style={styles.featureIcon}>{icon}</Text>
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  scrollContent: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  badge: {
    backgroundColor: '#2D8659',
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
  features: {
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#181818',
    padding: 16,
    borderRadius: 12,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
    flex: 1,
  },
  pricingSection: {
    marginBottom: 24,
    gap: 16,
  },
  planCard: {
    backgroundColor: '#181818',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#282828',
  },
  planCardHighlight: {
    borderColor: '#2D8659',
    position: 'relative',
  },
  bestValueBadge: {
    position: 'absolute',
    top: -12,
    left: 16,
    backgroundColor: '#2D8659',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bestValueText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  popularBadge: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  popularText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  savingsBadge: {
    color: '#34C759',
    fontSize: 14,
    fontWeight: 'bold',
  },
  planPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  planPeriod: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: 'normal',
  },
  planDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
  noticeBox: {
    backgroundColor: '#1C1C1E',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
  },
  noticeText: {
    color: '#FF9500',
    fontSize: 14,
    marginBottom: 8,
  },
  noticeBold: {
    fontWeight: 'bold',
  },
  noticeSubtext: {
    color: '#8E8E93',
    fontSize: 12,
    lineHeight: 18,
  },
  tryAgainButton: {
    backgroundColor: '#2D8659',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  tryAgainText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },
  skipButton: {
    backgroundColor: '#282828',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  skipText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  terms: {
    fontSize: 11,
    color: '#636366',
    textAlign: 'center',
    lineHeight: 16,
  },
});
