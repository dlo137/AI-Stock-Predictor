import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Keyboard, TouchableWithoutFeedback } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';

// Safe environment variable access
let FINNHUB_API_KEY: string = '';
let LOGODEV_API_KEY: string = '';

try {
  const env = require('@env');
  FINNHUB_API_KEY = env.FINNHUB_API_KEY || '';
  LOGODEV_API_KEY = env.LOGODEV_API_KEY || '';
} catch (error) {
  console.warn('Environment variables not loaded');
}

type Stock = {
  symbol: string;
  name: string;
  price: number | null;
  change: number | null;
  iconUrl?: string;
  logoUrl?: string;
  error?: string;
};

  // List of Fortune 500 tickers (expand as needed)
const FORTUNE_500_TICKERS = [
  'AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX', 'PEP', 'KO', 'WMT', 'DIS', 'V', 'MA', 'JPM', 'BAC', 'UNH', 'HD', 'PG', 'CVX', 'XOM', 'MCD', 'CSCO', 'ORCL', 'ABT', 'LLY', 'MRK', 'T', 'VZ', 'ADBE', 'CRM'
  // ...add more for full index
];

// Mapping from stock tickers to domain names for Brandfetch
const TICKER_TO_DOMAIN: Record<string, string> = {
  'AAPL': 'apple.com',
  'GOOGL': 'google.com',
  'MSFT': 'microsoft.com',
  'AMZN': 'amazon.com',
  'TSLA': 'tesla.com',
  'NVDA': 'nvidia.com',
  'META': 'meta.com',
  'NFLX': 'netflix.com',
  'PEP': 'pepsi.com',
  'KO': 'coca-cola.com',
  'WMT': 'walmart.com',
  'DIS': 'disney.com',
  'V': 'visa.com',
  'MA': 'mastercard.com',
  'JPM': 'jpmorganchase.com',
  'BAC': 'bankofamerica.com',
  'UNH': 'unitedhealthgroup.com',
  'HD': 'homedepot.com',
  'PG': 'pg.com',
  'CVX': 'chevron.com',
  'XOM': 'exxonmobil.com',
  'MCD': 'mcdonalds.com',
  'CSCO': 'cisco.com',
  'ORCL': 'oracle.com',
  'ABT': 'abbott.com',
  'LLY': 'lilly.com',
  'MRK': 'merck.com',
  'T': 'att.com',
  'VZ': 'verizon.com',
  'ADBE': 'adobe.com',
  'CRM': 'salesforce.com',
};

export default function StocksScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(8);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Debug env vars
  console.log('LOGODEV_API_KEY:', LOGODEV_API_KEY);
  console.log('FINNHUB_API_KEY:', FINNHUB_API_KEY);

  // Fetch stocks from Massive API
  useEffect(() => {
    const fetchStocks = async () => {
      console.log('Stocks Screen: Starting to fetch stocks...');
      // Only show top loading on initial load
      if (visibleCount === 8) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      // Determine which stocks to fetch
      const startIndex = visibleCount === 8 ? 0 : stocks.length;
      const endIndex = Math.min(visibleCount, FORTUNE_500_TICKERS.length);
      const results: Stock[] = [];
      
      for (let i = startIndex; i < endIndex; i++) {
        const symbol = FORTUNE_500_TICKERS[i];
        console.log(`Fetching data for ${symbol}...`);
        try {
          // Fetch logo from Logo.dev using domain name
          let iconUrl = undefined;
          let logoUrl = undefined;
          
          try {
            // Logo.dev requires domain names, not tickers
            const domain = TICKER_TO_DOMAIN[symbol];
            if (domain) {
              const logoUrl = `https://img.logo.dev/${domain}?token=${LOGODEV_API_KEY}`;
              iconUrl = logoUrl;
              console.log(`Logo URL for ${symbol}: ${logoUrl}`);
            } else {
              console.log(`No domain mapping for ${symbol}`);
            }
          } catch (brandError) {
            console.log(`Logo.dev error for ${symbol}:`, brandError);
          }
          
          // Fetch current quote from Finnhub (since Massive quotes work differently)
          let price = null;
          let change = null;
          let companyName = symbol; // default to symbol
          
          try {
            const quoteResponse = await fetch(
              `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`
            );
            
            if (quoteResponse.ok) {
              const quote = await quoteResponse.json();
              price = quote.c; // current price
              change = quote.dp; // percent change
            }
          } catch (quoteError) {
            console.log(`Quote error for ${symbol}:`, quoteError);
          }
          
          // Fetch company profile to get the actual company name
          try {
            const profileResponse = await fetch(
              `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`
            );
            
            if (profileResponse.ok) {
              const profile = await profileResponse.json();
              if (profile.name) {
                companyName = profile.name;
                console.log(`Got company name for ${symbol}: ${companyName}`);
              }
            }
          } catch (profileError) {
            console.log(`Profile error for ${symbol}:`, profileError);
          }
          
          results.push({
            symbol,
            name: companyName,
            price: price ? parseFloat(price) : null,
            change: change ? parseFloat(change) : null,
            iconUrl: iconUrl,
            logoUrl: logoUrl,
          });
        } catch (error) {
          console.error(`Error fetching ${symbol}:`, error);
          // Fallback to mock data
          const basePrice = Math.random() * 500 + 50;
          const changeVal = (Math.random() - 0.5) * 10;
          results.push({
            symbol,
            name: symbol,
            price: parseFloat(basePrice.toFixed(2)),
            change: parseFloat(changeVal.toFixed(2)),
          });
        }
        // Small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Append new results to existing stocks or replace on initial load
      if (visibleCount === 8) {
        setStocks(results);
      } else {
        setStocks((prevStocks: Stock[]) => [...prevStocks, ...results]);
      }
      
      setLoading(false);
      setLoadingMore(false);
    };
    fetchStocks();
  }, [visibleCount]);

  // Filter stocks by search
  const filteredStocks = stocks.filter(
    (stock) =>
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (stock.name && stock.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const canShowMore = visibleCount < FORTUNE_500_TICKERS.length;
  const handleSeeMore = () => setVisibleCount(v => Math.min(v + 20, FORTUNE_500_TICKERS.length));

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <TextInput
              style={styles.searchInput}
              placeholder={isSearchFocused ? "" : "Search stocks..."}
              placeholderTextColor="#8E8E93"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              returnKeyType="search"
              blurOnSubmit={true}
              onSubmitEditing={() => {}}
            />
            {!isSearchFocused && (
              <TouchableOpacity style={styles.sendButton}>
                <Ionicons name="send" size={20} color="#34D399" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trending</Text>
          {loading && stocks.length === 0 && <ActivityIndicator size="large" color="#34D399" style={{ marginVertical: 20 }} />}
          {filteredStocks.map((stock, index) => (
            <TouchableOpacity key={index} style={styles.stockCard}>
              <View style={styles.stockLogoContainer}>
                {stock.iconUrl ? (
                  <Image
                    source={{ uri: stock.iconUrl }}
                    style={styles.stockLogo}
                    onError={(error) => {
                      console.log(`Image failed to load for ${stock.symbol}:`, error.nativeEvent.error);
                    }}
                    onLoad={() => {
                      console.log(`Image loaded successfully for ${stock.symbol}`);
                    }}
                  />
                ) : (
                  <View style={[styles.stockLogo, styles.stockLogoPlaceholder]}>
                    <Text style={styles.stockLogoText}>{stock.symbol.substring(0, 2)}</Text>
                  </View>
                )}
              </View>
              <View style={styles.stockLeft}>
                <Text style={styles.stockSymbol}>{stock.symbol}</Text>
                <Text style={styles.stockName}>{stock.name}</Text>
              </View>
              <View style={styles.stockRight}>
                <Text style={styles.stockPrice}>{stock.price !== null ? `$${stock.price.toFixed(2)}` : 'N/A'}</Text>
                <Text
                  style={[
                    styles.stockChange,
                    stock.change !== null && stock.change >= 0 ? styles.positive : styles.negative,
                  ]}
                >
                  {stock.change !== null ? `${stock.change >= 0 ? '+' : ''}${stock.change.toFixed(2)}%` : 'N/A'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
          {canShowMore && (
            loadingMore ? (
              <ActivityIndicator size="large" color="#34D399" style={{ marginVertical: 20 }} />
            ) : (
              <TouchableOpacity style={styles.seeMoreButton} onPress={handleSeeMore}>
                <Text style={styles.seeMoreButtonText}>+ More</Text>
              </TouchableOpacity>
            )
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    paddingHorizontal: 8,
    width: '100%',
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: 'transparent',
    padding: 4,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
    seeMoreButton: {
      marginTop: 10,
      backgroundColor: '#175d43ff',
      borderRadius: 999,
      paddingVertical: 12,
      paddingHorizontal: 36,
      alignItems: 'center',
      alignSelf: 'center',
      minWidth: 120,
    },
    seeMoreButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 75,
    paddingBottom: 10,
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C1E',
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 0,
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
  stockLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#2C2C2E',
  },
  stockLogoContainer: {
    marginRight: 0,
  },
  stockLogoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#34D399',
  },
  stockLogoText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
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
