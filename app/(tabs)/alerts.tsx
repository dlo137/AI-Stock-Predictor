import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';

const alertsData = [
  {
    id: 1,
    type: 'price',
    stock: 'AAPL',
    message: 'Apple reached your target price of $180',
    time: '2 hours ago',
    read: false,
  },
  {
    id: 2,
    type: 'prediction',
    stock: 'TSLA',
    message: 'New AI prediction available for Tesla',
    time: '5 hours ago',
    read: false,
  },
  {
    id: 3,
    type: 'news',
    stock: 'GOOGL',
    message: 'Major news update affecting Alphabet',
    time: '1 day ago',
    read: true,
  },
  {
    id: 4,
    type: 'price',
    stock: 'NVDA',
    message: 'NVIDIA dropped 3% - Consider reviewing position',
    time: '2 days ago',
    read: true,
  },
];

export default function AlertsScreen() {
  const [priceAlerts, setPriceAlerts] = useState(true);
  const [predictionAlerts, setPredictionAlerts] = useState(true);
  const [newsAlerts, setNewsAlerts] = useState(false);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'price':
        return '💰';
      case 'prediction':
        return '🤖';
      case 'news':
        return '📰';
      default:
        return '🔔';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Alert Settings</Text>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>💰</Text>
                <View>
                  <Text style={styles.settingTitle}>Price Alerts</Text>
                  <Text style={styles.settingDescription}>
                    Notify when stocks reach target prices
                  </Text>
                </View>
              </View>
              <Switch
                value={priceAlerts}
                onValueChange={setPriceAlerts}
                trackColor={{ false: '#2C2C2E', true: '#34D399' }}
                thumbColor="#fff"
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>🤖</Text>
                <View>
                  <Text style={styles.settingTitle}>AI Predictions</Text>
                  <Text style={styles.settingDescription}>New stock predictions available</Text>
                </View>
              </View>
              <Switch
                value={predictionAlerts}
                onValueChange={setPredictionAlerts}
                trackColor={{ false: '#2C2C2E', true: '#34D399' }}
                thumbColor="#fff"
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>📰</Text>
                <View>
                  <Text style={styles.settingTitle}>News Updates</Text>
                  <Text style={styles.settingDescription}>Breaking news for your stocks</Text>
                </View>
              </View>
              <Switch
                value={newsAlerts}
                onValueChange={setNewsAlerts}
                trackColor={{ false: '#2C2C2E', true: '#34D399' }}
                thumbColor="#fff"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Alerts</Text>

          {alertsData.map((alert) => (
            <TouchableOpacity
              key={alert.id}
              style={[styles.alertCard, !alert.read && styles.unreadAlert]}
            >
              <View style={styles.alertLeft}>
                <Text style={styles.alertIcon}>{getAlertIcon(alert.type)}</Text>
                <View style={styles.alertContent}>
                  <Text style={styles.alertStock}>{alert.stock}</Text>
                  <Text style={styles.alertMessage}>{alert.message}</Text>
                  <Text style={styles.alertTime}>{alert.time}</Text>
                </View>
              </View>
              {!alert.read && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.clearButton}>
          <Text style={styles.clearButtonText}>Clear All Read Alerts</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    padding: 20,
    backgroundColor: '#000000',
  },
  settingsSection: {
    marginBottom: 30,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  settingCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#8E8E93',
  },
  alertCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  unreadAlert: {
    borderLeftWidth: 4,
    borderLeftColor: '#34D399',
  },
  alertLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  alertIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertStock: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#34D399',
    marginBottom: 4,
  },
  alertMessage: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 4,
    lineHeight: 20,
  },
  alertTime: {
    fontSize: 12,
    color: '#8E8E93',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#34D399',
    marginLeft: 8,
  },
  clearButton: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
  },
});
