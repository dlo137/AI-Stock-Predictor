import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';

const stockData = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 178.50, change: 2.5 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.30, change: -1.2 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.91, change: 1.8 },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 151.94, change: 3.1 },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 242.84, change: -0.5 },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 495.22, change: 4.2 },
  { symbol: 'META', name: 'Meta Platforms', price: 352.45, change: 1.5 },
  { symbol: 'NFLX', name: 'Netflix Inc.', price: 445.73, change: -2.1 },
];

export default function StocksScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStocks = stockData.filter(
    (stock) =>
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search stocks..."
          placeholderTextColor="#8E8E93"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trending Stocks</Text>

          {filteredStocks.map((stock, index) => (
            <TouchableOpacity key={index} style={styles.stockCard}>
              <View style={styles.stockLeft}>
                <Text style={styles.stockSymbol}>{stock.symbol}</Text>
                <Text style={styles.stockName}>{stock.name}</Text>
              </View>
              <View style={styles.stockRight}>
                <Text style={styles.stockPrice}>${stock.price.toFixed(2)}</Text>
                <Text
                  style={[
                    styles.stockChange,
                    stock.change >= 0 ? styles.positive : styles.negative,
                  ]}
                >
                  {stock.change >= 0 ? '+' : ''}
                  {stock.change.toFixed(2)}%
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  searchContainer: {
    padding: 20,
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C1E',
  },
  searchInput: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 20,
    backgroundColor: '#000000',
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
  stockCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  stockLeft: {
    flex: 1,
  },
  stockSymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  stockName: {
    fontSize: 14,
    color: '#8E8E93',
  },
  stockRight: {
    alignItems: 'flex-end',
  },
  stockPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  stockChange: {
    fontSize: 14,
    fontWeight: '600',
  },
  positive: {
    color: '#34D399',
  },
  negative: {
    color: '#FF453A',
  },
});
