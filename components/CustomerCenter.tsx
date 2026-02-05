import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import RevenueCatUI from 'react-native-purchases-ui';

export const CustomerCenter = () => {
  const handleOpenCustomerCenter = async () => {
    try {
      await RevenueCatUI.presentCustomerCenter();
    } catch (error) {
      console.error('❌ Error opening Customer Center:', error);
      Alert.alert('Error', 'Unable to open subscription management');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleOpenCustomerCenter}
      >
        <Text style={styles.buttonText}>Manage Subscription</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  button: {
    backgroundColor: '#2A5934',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
