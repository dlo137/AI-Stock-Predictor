# In-App Purchase Setup Guide

## ✅ What's Done
- RevenueCat SDK installed and configured
- IAP hook ready for production
- Graceful fallback to mock mode if not configured
- Full purchase and restore functionality

## 🚀 Next Steps to Enable Real Payments

### 1. Sign Up for RevenueCat (FREE)
1. Go to https://app.revenuecat.com
2. Create a free account
3. Create a new project

### 2. Get Your API Keys
1. In RevenueCat dashboard, go to your project
2. Navigate to **API Keys** section
3. Copy your **iOS API Key**

### 3. Add API Key to Your App
Open `hooks/useIAP.ts` and replace:
```typescript
const REVENUECAT_API_KEY = Platform.select({
  ios: 'YOUR_REVENUECAT_IOS_API_KEY', // Paste your iOS key here
  android: 'YOUR_REVENUECAT_ANDROID_API_KEY',
});
```

### 4. Configure Products in RevenueCat
1. In RevenueCat dashboard, go to **Products**
2. Link to your App Store Connect products:
   - `yearly.stock`
   - `monthly.stock`
   - `weekly.stock`
3. Create an **Offering** and add these products to it
4. Make it your **Current Offering**

### 5. Build for Production
Since RevenueCat requires native modules, you need a development/production build:

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build for iOS
eas build --platform ios
```

## 🎯 Current Behavior

**Without RevenueCat configured:**
- Shows mock prices ($4.99, $14.99, $99.99)
- Shows demo alert when purchasing
- Perfect for testing UI/UX

**With RevenueCat configured:**
- Loads real prices from App Store
- Processes real payments
- Full purchase and restore functionality

## 📱 Testing

1. **Development**: Works with mock data in Expo Go
2. **TestFlight**: Test real purchases with sandbox accounts
3. **Production**: Live purchases from real customers

## 💡 Why RevenueCat?

- ✅ Most stable IAP solution
- ✅ Works across iOS & Android
- ✅ Handles receipt validation
- ✅ Analytics and revenue tracking
- ✅ Free tier for most apps
- ✅ Excellent documentation

## 🆘 Need Help?

- RevenueCat Docs: https://docs.revenuecat.com/
- Expo Docs: https://docs.expo.dev/
- RevenueCat Support: support@revenuecat.com
