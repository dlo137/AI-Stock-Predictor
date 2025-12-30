import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import TopPicksCarousel from '../components/TopPicksCarousel';

// Carousel data
const topPicksData = [
  {
    id: '1',
    company: 'Cipher Mining Inc',
    added: 'Added Jan 15, 2024',
    removed: 'Removed Mar 22, 2024',
    return: 47.8,
    icon: require('../../assets/app-icon.png'),
  },
  {
    id: '2',
    company: 'Tesla Inc',
    added: 'Added Feb 3, 2024',
    removed: 'Removed Apr 10, 2024',
    return: 23.5,
    icon: require('../../assets/app-icon.png'),
  },
  {
    id: '3',
    company: 'NVIDIA Corporation',
    added: 'Added Dec 8, 2023',
    removed: 'Removed Feb 28, 2024',
    return: 61.2,
    icon: require('../../assets/app-icon.png'),
  },
  {
    id: '4',
    company: 'Amazon.com Inc',
    added: 'Added Mar 12, 2024',
    removed: 'Removed May 5, 2024',
    return: -8.4,
    icon: require('../../assets/app-icon.png'),
  },
  {
    id: '5',
    company: 'Microsoft Corporation',
    added: 'Added Jan 29, 2024',
    removed: 'Removed Apr 18, 2024',
    return: 18.9,
    icon: require('../../assets/app-icon.png'),
  },
];

const stocksData = [
  {
    id: '1',
    company: 'Apple Inc',
    added: 'Added Feb 10, 2024',
    removed: 'Removed Apr 25, 2024',
    return: 32.4,
    icon: require('../../assets/app-icon.png'),
  },
  {
    id: '2',
    company: 'Alphabet Inc',
    added: 'Added Jan 5, 2024',
    removed: 'Removed Mar 15, 2024',
    return: 28.7,
    icon: require('../../assets/app-icon.png'),
  },
  {
    id: '3',
    company: 'Meta Platforms',
    added: 'Added Feb 20, 2024',
    removed: 'Removed May 1, 2024',
    return: 41.3,
    icon: require('../../assets/app-icon.png'),
  },
  {
    id: '4',
    company: 'Netflix Inc',
    added: 'Added Mar 5, 2024',
    removed: 'Removed Apr 30, 2024',
    return: -12.6,
    icon: require('../../assets/app-icon.png'),
  },
  {
    id: '5',
    company: 'Adobe Inc',
    added: 'Added Jan 18, 2024',
    removed: 'Removed Mar 28, 2024',
    return: 15.2,
    icon: require('../../assets/app-icon.png'),
  },
];

const cryptoData = [
  {
    id: '1',
    company: 'Bitcoin',
    added: 'Added Jan 8, 2024',
    removed: 'Removed Apr 12, 2024',
    return: 89.3,
    icon: require('../../assets/app-icon.png'),
  },
  {
    id: '2',
    company: 'Ethereum',
    added: 'Added Feb 15, 2024',
    removed: 'Removed May 3, 2024',
    return: 67.8,
    icon: require('../../assets/app-icon.png'),
  },
  {
    id: '3',
    company: 'Solana',
    added: 'Added Jan 22, 2024',
    removed: 'Removed Mar 10, 2024',
    return: 124.5,
    icon: require('../../assets/app-icon.png'),
  },
  {
    id: '4',
    company: 'Cardano',
    added: 'Added Feb 28, 2024',
    removed: 'Removed Apr 20, 2024',
    return: -18.2,
    icon: require('../../assets/app-icon.png'),
  },
  {
    id: '5',
    company: 'Avalanche',
    added: 'Added Mar 8, 2024',
    removed: 'Removed May 8, 2024',
    return: 45.9,
    icon: require('../../assets/app-icon.png'),
  },
];

const etfData = [
  {
    id: '1',
    company: 'SPDR S&P 500 ETF',
    added: 'Added Jan 12, 2024',
    removed: 'Removed Apr 5, 2024',
    return: 12.8,
    icon: require('../../assets/app-icon.png'),
  },
  {
    id: '2',
    company: 'Vanguard Total Stock',
    added: 'Added Feb 8, 2024',
    removed: 'Removed Apr 28, 2024',
    return: 14.3,
    icon: require('../../assets/app-icon.png'),
  },
  {
    id: '3',
    company: 'iShares MSCI EAFE',
    added: 'Added Jan 25, 2024',
    removed: 'Removed Mar 20, 2024',
    return: 9.7,
    icon: require('../../assets/app-icon.png'),
  },
  {
    id: '4',
    company: 'ARK Innovation ETF',
    added: 'Added Mar 3, 2024',
    removed: 'Removed May 10, 2024',
    return: -6.4,
    icon: require('../../assets/app-icon.png'),
  },
  {
    id: '5',
    company: 'Invesco QQQ Trust',
    added: 'Added Feb 18, 2024',
    removed: 'Removed Apr 22, 2024',
    return: 19.6,
    icon: require('../../assets/app-icon.png'),
  },
];

export default function HomeScreen() {
  const [activeSignal, setActiveSignal] = useState('short-bull');

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Text style={styles.iconText}>💬</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Text style={styles.iconText}>🔔</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <View style={styles.plusIcon}>
            <Text style={styles.plusText}>+</Text>
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="How might Nvidia perform..."
            placeholderTextColor="#8E8E93"
          />
        </View>
      </View>

      {/* Signal Selector */}
      <View style={styles.signalContainer}>
        <View style={styles.signalBar}>
          <TouchableOpacity
            style={[styles.signalOption, activeSignal === 'short-bull' && styles.signalOptionActive]}
            onPress={() => setActiveSignal('short-bull')}
          >
            <Text style={styles.signalTitle}>Short-Term</Text>
            <Text style={[styles.signalValue, styles.bullText]}>Bull</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.signalOption, activeSignal === 'long-bull' && styles.signalOptionActive]}
            onPress={() => setActiveSignal('long-bull')}
          >
            <Text style={styles.signalTitle}>Long-Term</Text>
            <Text style={[styles.signalValue, styles.bullText]}>Bull</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.signalOption, activeSignal === 'short-bear' && styles.signalOptionActive]}
            onPress={() => setActiveSignal('short-bear')}
          >
            <Text style={styles.signalTitle}>Short-Term</Text>
            <Text style={[styles.signalValue, styles.bearText]}>Bear</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.signalOption, activeSignal === 'long-bear' && styles.signalOptionActive]}
            onPress={() => setActiveSignal('long-bear')}
          >
            <Text style={styles.signalTitle}>Long-Term</Text>
            <Text style={[styles.signalValue, styles.bearText]}>Bear</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Carousels */}
        <TopPicksCarousel title="Top Picks" badgeText="NEW" data={topPicksData} />
        <TopPicksCarousel title="Stocks" data={stocksData} />
        <TopPicksCarousel title="Crypto" data={cryptoData} />
        <TopPicksCarousel title="ETF" data={etfData} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#000000',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    marginRight: 10,
  },
  appName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#34D399',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  iconText: {
    fontSize: 20,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#000000',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  plusIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2D8659',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  plusText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  signalContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#000000',
  },
  signalBar: {
    flexDirection: 'row',
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  signalOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderRadius: 12,
  },
  signalOptionActive: {
    backgroundColor: '#2C2C2E',
    shadowColor: '#34D399',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  signalTitle: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '600',
    marginBottom: 4,
  },
  signalValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  bullText: {
    color: '#34D399',
  },
  bearText: {
    color: '#FF453A',
  },
  scrollContent: {
    padding: 20,
    backgroundColor: '#000000',
  },
  welcomeSection: {
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  dateText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  statsContainer: {
    marginBottom: 25,
  },
  statCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  statChange: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  marketCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
  },
  marketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  marketIndex: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  marketValue: {
    fontSize: 16,
    color: '#8E8E93',
    flex: 1,
    textAlign: 'center',
  },
  marketChange: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  positive: {
    color: '#34D399',
  },
  negative: {
    color: '#FF453A',
  },
  predictionCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  predictionStock: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34D399',
    marginBottom: 8,
  },
  predictionText: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
    marginBottom: 12,
  },
  viewButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
  },
  viewButtonText: {
    fontSize: 14,
    color: '#34D399',
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '600',
  },
});
