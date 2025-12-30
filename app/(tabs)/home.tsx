import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import TopPicksCarousel from '../components/TopPicksCarousel';
import axios from 'axios';
import { STOCK_API_KEY } from '@env';

// Carousel data for each signal type
const shortBullData = [
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
    return: 35.6,
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

const longBullData = [
  {
    id: '1',
    company: 'Apple Inc',
    added: 'Added Dec 1, 2023',
    removed: 'Removed Jun 15, 2024',
    return: 78.4,
    icon: require('../../assets/app-icon.png'),
  },
  {
    id: '2',
    company: 'Alphabet Inc',
    added: 'Added Nov 10, 2023',
    removed: 'Removed May 20, 2024',
    return: 92.3,
    icon: require('../../assets/app-icon.png'),
  },
  {
    id: '3',
    company: 'Meta Platforms',
    added: 'Added Oct 5, 2023',
    removed: 'Removed Apr 30, 2024',
    return: 105.7,
    icon: require('../../assets/app-icon.png'),
  },
  {
    id: '4',
    company: 'Taiwan Semiconductor',
    added: 'Added Sep 20, 2023',
    removed: 'Removed May 10, 2024',
    return: 68.9,
    icon: require('../../assets/app-icon.png'),
  },
  {
    id: '5',
    company: 'Berkshire Hathaway',
    added: 'Added Aug 15, 2023',
    removed: 'Removed Apr 5, 2024',
    return: 54.2,
    icon: require('../../assets/app-icon.png'),
  },
];

const shortBearData = [
  {
    id: '1',
    company: 'GameStop Corp',
    added: 'Added Feb 20, 2024',
    removed: 'Removed Mar 15, 2024',
    return: -22.4,
    icon: require('../../assets/app-icon.png'),
  },
  {
    id: '2',
    company: 'Peloton Interactive',
    added: 'Added Mar 1, 2024',
    removed: 'Removed Apr 10, 2024',
    return: -31.8,
    icon: require('../../assets/app-icon.png'),
  },
  {
    id: '3',
    company: 'Carvana Co',
    added: 'Added Jan 25, 2024',
    removed: 'Removed Feb 28, 2024',
    return: -18.6,
    icon: require('../../assets/app-icon.png'),
  },
  {
    id: '4',
    company: 'Robinhood Markets',
    added: 'Added Feb 10, 2024',
    removed: 'Removed Mar 20, 2024',
    return: -15.3,
    icon: require('../../assets/app-icon.png'),
  },
  {
    id: '5',
    company: 'Rivian Automotive',
    added: 'Added Mar 5, 2024',
    removed: 'Removed Apr 5, 2024',
    return: -27.9,
    icon: require('../../assets/app-icon.png'),
  },
];

const longBearData = [
  {
    id: '1',
    company: 'Bed Bath & Beyond',
    added: 'Added Oct 1, 2023',
    removed: 'Removed May 30, 2024',
    return: -65.4,
    icon: require('../../assets/app-icon.png'),
  },
  {
    id: '2',
    company: 'WeWork Inc',
    added: 'Added Sep 15, 2023',
    removed: 'Removed Jun 10, 2024',
    return: -89.2,
    icon: require('../../assets/app-icon.png'),
  },
  {
    id: '3',
    company: 'Zillow Group',
    added: 'Added Nov 5, 2023',
    removed: 'Removed May 15, 2024',
    return: -42.7,
    icon: require('../../assets/app-icon.png'),
  },
  {
    id: '4',
    company: 'Teladoc Health',
    added: 'Added Aug 20, 2023',
    removed: 'Removed Apr 25, 2024',
    return: -58.3,
    icon: require('../../assets/app-icon.png'),
  },
  {
    id: '5',
    company: 'Coinbase Global',
    added: 'Added Dec 10, 2023',
    removed: 'Removed Jun 5, 2024',
    return: -71.5,
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
  const [ticker, setTicker] = useState('');
  const [stockData, setStockData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Select data based on active signal
  const getActiveData = () => {
    switch (activeSignal) {
      case 'short-bull':
        return shortBullData;
      case 'long-bull':
        return longBullData;
      case 'short-bear':
        return shortBearData;
      case 'long-bear':
        return longBearData;
      default:
        return shortBullData;
    }
  };

  // Fetch stock price from Alpha Vantage
  const fetchStockPrice = async () => {
    if (!ticker.trim()) {
      setError('Please enter a stock ticker');
      return;
    }

    setLoading(true);
    setError('');
    setStockData(null);

    try {
      const response = await axios.get(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker.toUpperCase()}&apikey=${STOCK_API_KEY}`
      );

      const quote = response.data['Global Quote'];

      if (!quote || Object.keys(quote).length === 0) {
        setError('Stock not found. Please check the ticker symbol.');
        setLoading(false);
        return;
      }

      setStockData({
        symbol: quote['01. symbol'],
        price: quote['05. price'],
        change: quote['09. change'],
        changePercent: quote['10. change percent'],
        open: quote['02. open'],
        high: quote['03. high'],
        low: quote['04. low'],
        volume: quote['06. volume'],
        latestTradingDay: quote['07. latest trading day'],
      });
    } catch (err) {
      setError('Failed to fetch stock data. Please try again.');
      console.error('Error fetching stock data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Top Section Container */}
      <View style={styles.topContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appTitle}>AI Stock Predictor</Text>
          <TouchableOpacity style={styles.chatButton}>
            <Ionicons name="chatbubble-outline" size={24} color="#34D399" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <View style={styles.plusIcon}>
              <Text style={styles.plusText}>+</Text>
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="Enter stock ticker (e.g. NVDA, AAPL)..."
              placeholderTextColor="#8E8E93"
              value={ticker}
              onChangeText={setTicker}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={fetchStockPrice}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#34D399" />
              ) : (
                <Ionicons name="send" size={20} color="#34D399" />
              )}
            </TouchableOpacity>
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
      </View>

      {/* Stock Price Display */}
      {(stockData || error) && (
        <View style={styles.stockResultContainer}>
          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={24} color="#FF453A" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : stockData ? (
            <View style={styles.stockCard}>
              <View style={styles.stockHeader}>
                <Text style={styles.stockSymbol}>{stockData.symbol}</Text>
                <Text style={styles.stockDate}>{stockData.latestTradingDay}</Text>
              </View>

              <View style={styles.priceContainer}>
                <Text style={styles.stockPrice}>${parseFloat(stockData.price).toFixed(2)}</Text>
                <View style={styles.changeContainer}>
                  <Text style={[
                    styles.stockChange,
                    parseFloat(stockData.change) >= 0 ? styles.positive : styles.negative
                  ]}>
                    {parseFloat(stockData.change) >= 0 ? '+' : ''}
                    ${parseFloat(stockData.change).toFixed(2)}
                  </Text>
                  <Text style={[
                    styles.stockChangePercent,
                    parseFloat(stockData.change) >= 0 ? styles.positive : styles.negative
                  ]}>
                    ({stockData.changePercent})
                  </Text>
                </View>
              </View>

              <View style={styles.stockDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Open</Text>
                  <Text style={styles.detailValue}>${parseFloat(stockData.open).toFixed(2)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>High</Text>
                  <Text style={styles.detailValue}>${parseFloat(stockData.high).toFixed(2)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Low</Text>
                  <Text style={styles.detailValue}>${parseFloat(stockData.low).toFixed(2)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Volume</Text>
                  <Text style={styles.detailValue}>{parseInt(stockData.volume).toLocaleString()}</Text>
                </View>
              </View>
            </View>
          ) : null}
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Carousels */}
        <TopPicksCarousel title="Top Picks" badgeText="NEW" data={getActiveData()} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  topContainer: {
    backgroundColor: 'rgba(141, 141, 141, 1)',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 8,
  },  appTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  chatButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },  headerLeft: {
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
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 30,
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
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signalContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
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
  stockResultContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: '#000000',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 69, 58, 0.1)',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#FF453A',
    fontWeight: '500',
  },
  stockCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  stockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  stockSymbol: {
    fontSize: 24,
    fontWeight: '700',
    color: '#34D399',
  },
  stockDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
  priceContainer: {
    marginBottom: 20,
  },
  stockPrice: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stockChange: {
    fontSize: 18,
    fontWeight: '600',
  },
  stockChangePercent: {
    fontSize: 16,
    fontWeight: '500',
  },
  stockDetails: {
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
    paddingTop: 16,
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
