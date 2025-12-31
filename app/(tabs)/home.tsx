import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import TopPicksCarousel from '../components/TopPicksCarousel';
import axios from 'axios';
import { ALPHA_VANTAGE_API_KEY, OPENAI_API_KEY } from '@env';

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

interface PredictionData {
  expectedPrice: number;
  upperBand: number;
  lowerBand: number;
  expectedReturn: number;
  confidence: number;
  explanation: string;
}

interface CachedHistoricalData {
  prices: number[];
  timestamp: number;
  ticker: string;
}

export default function HomeScreen() {
  const [activeSignal, setActiveSignal] = useState('short-bull');
  const [ticker, setTicker] = useState('');
  const [stockData, setStockData] = useState<any>(null);
  const [predictionData, setPredictionData] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [predictionTimeframe, setPredictionTimeframe] = useState<3 | 6 | 9 | 12>(3);
  const [historicalDataCache, setHistoricalDataCache] = useState<CachedHistoricalData | null>(null);

  // Reset home to default state
  const handleReset = () => {
    setTicker('');
    setStockData(null);
    setPredictionData(null);
    setError('');
    setLoading(false);
    setPredictionTimeframe(3);
    setHistoricalDataCache(null);
  };

  // Wrapper for TextInput onSubmitEditing
  const handleSubmitEditing = () => {
    fetchStockPrice();
  };

  // Wrapper for TouchableOpacity onPress
  const handlePress = () => {
    fetchStockPrice();
  };

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

  // Calculate trend return from historical data
  const calculateTrendReturn = (prices: number[]): number => {
    if (prices.length < 2) return 0;
    const firstPrice = prices[0];
    const lastPrice = prices[prices.length - 1];
    return (lastPrice - firstPrice) / firstPrice;
  };

  // Calculate momentum (recent performance)
  const calculateMomentum = (prices: number[]): number => {
    if (prices.length < 30) return 0;
    const recentPrices = prices.slice(-30);
    const firstPrice = recentPrices[0];
    const lastPrice = recentPrices[recentPrices.length - 1];
    return (lastPrice - firstPrice) / firstPrice;
  };

  // Calculate mean reversion
  const calculateMeanReversion = (prices: number[]): number => {
    if (prices.length < 2) return 0;
    const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const currentPrice = prices[prices.length - 1];
    return (mean - currentPrice) / currentPrice;
  };

  // Calculate annualized volatility
  const calculateVolatility = (prices: number[]): number => {
    if (prices.length < 2) return 0.35; // default volatility

    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push(Math.log(prices[i] / prices[i - 1]));
    }

    const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / returns.length;
    const dailyVolatility = Math.sqrt(variance);

    // Annualize (assuming 252 trading days)
    return dailyVolatility * Math.sqrt(252);
  };

  // Fetch historical stock data
  const fetchHistoricalData = async (symbol: string): Promise<number[]> => {
    try {
      const response = await axios.get(
        `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=compact&apikey=${ALPHA_VANTAGE_API_KEY}`
      );

      console.log('Alpha Vantage Response:', JSON.stringify(response.data).substring(0, 500));

      // Check for API error messages
      if (response.data['Error Message']) {
        throw new Error(`Alpha Vantage Error: ${response.data['Error Message']}`);
      }

      if (response.data['Note']) {
        throw new Error('API rate limit reached. Please wait a minute and try again.');
      }

      if (response.data['Information']) {
        throw new Error('API call frequency limit reached. Please wait and try again.');
      }

      const timeSeries = response.data['Time Series (Daily)'];
      if (!timeSeries || Object.keys(timeSeries).length === 0) {
        console.error('Full response:', JSON.stringify(response.data));
        throw new Error('No historical data available. The API may be rate limited.');
      }

      const prices: number[] = [];
      const dates = Object.keys(timeSeries).sort();

      // Get available data (up to 252 days if available)
      const recentDates = dates.slice(-Math.min(252, dates.length));
      for (const date of recentDates) {
        prices.push(parseFloat(timeSeries[date]['4. close']));
      }

      console.log(`Fetched ${prices.length} days of historical data`);
      return prices;
    } catch (error: any) {
      console.error('Error fetching historical data:', error);
      throw error;
    }
  };

  // Call OpenAI API to analyze the prediction
  const callOpenAI = async (
    currentPrice: number,
    mu: number,
    sigma: number,
    T: number
  ): Promise<{ expectedPrice: number; upperBand: number; lowerBand: number; explanation: string; confidence: number }> => {
    try {
      const prompt = `Inputs:
- Current price (P0): ${currentPrice.toFixed(2)}
- Expected return (μ): ${mu.toFixed(4)}
- Volatility (σ): ${sigma.toFixed(4)}
- Time horizon (T): ${T} years

Formula:
Expected Price = P0 × e^(μ × T)
Upper Band = P0 × e^((μ + σ) × T)
Lower Band = P0 × e^((μ - σ) × T)

Tasks:
1. Compute expected price, upper band, and lower band using the formulas above
2. Round to 2 decimals
3. Provide a brief 2-sentence explanation of what this forecast means for an investor
4. Estimate a confidence level (0-100%) based on the volatility

Respond ONLY with a JSON object in this exact format:
{
  "expectedPrice": <number>,
  "upperBand": <number>,
  "lowerBand": <number>,
  "explanation": "<2-sentence explanation>",
  "confidence": <number 0-100>
}`;

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a financial analysis assistant. Always respond with valid JSON only.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
          }
        }
      );

      const text = response.data.choices[0].message.content;
      const result = JSON.parse(text);
      return result;
    } catch (error: any) {
      console.error('Error calling OpenAI API:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', JSON.stringify(error.response.data));
      }
      throw error;
    }
  };

  // Check if cached data is still valid (< 24 hours old)
  const isCacheValid = (cache: CachedHistoricalData | null, currentTicker: string): boolean => {
    if (!cache || cache.ticker !== currentTicker.toUpperCase()) {
      return false;
    }
    const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    const now = Date.now();
    return (now - cache.timestamp) < CACHE_TTL;
  };

  // Slice historical data based on timeframe
  const getHistoricalPricesForTimeframe = (allPrices: number[], months: number): number[] => {
    // Approximate trading days per month: 21
    const tradingDays = months * 21;
    return allPrices.slice(-tradingDays);
  };

  // Fetch stock price and calculate forecast
  const fetchStockPrice = async (timeframe?: 3 | 6 | 9 | 12) => {
    if (!ticker.trim()) {
      setError('Please enter a stock ticker');
      return;
    }

    const selectedTimeframe = timeframe || predictionTimeframe;
    const T = selectedTimeframe / 12; // Convert months to years

    if (timeframe) {
      setPredictionTimeframe(timeframe);
    }

    setLoading(true);
    setError('');

    // Only clear stock data if it's a new ticker search
    if (!stockData || !timeframe) {
      setStockData(null);
    }
    setPredictionData(null);

    try {
      // Step 1: Fetch current stock quote (only if we don't have stock data or it's a new search)
      let currentPrice: number;

      if (!stockData || !timeframe) {
        const quoteResponse = await axios.get(
          `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker.toUpperCase()}&apikey=${ALPHA_VANTAGE_API_KEY}`
        );

        const quote = quoteResponse.data['Global Quote'];

        if (!quote || Object.keys(quote).length === 0) {
          setError('Stock not found. Please check the ticker symbol.');
          setLoading(false);
          return;
        }

        currentPrice = parseFloat(quote['05. price']);

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

        // Wait 1 second before next API call (Alpha Vantage rate limit: 1 request/second)
        await new Promise(resolve => setTimeout(resolve, 1200));
      } else {
        currentPrice = parseFloat(stockData.price);
      }

      // Step 2: Get historical data (from cache or fetch)
      try {
        let allHistoricalPrices: number[];

        // Check cache validity
        if (isCacheValid(historicalDataCache, ticker)) {
          console.log('Using cached historical data');
          allHistoricalPrices = historicalDataCache!.prices;
        } else {
          console.log('Fetching new historical data');
          allHistoricalPrices = await fetchHistoricalData(ticker.toUpperCase());

          // Cache the data
          setHistoricalDataCache({
            prices: allHistoricalPrices,
            timestamp: Date.now(),
            ticker: ticker.toUpperCase()
          });
        }

        // Step 3: Slice data for selected timeframe
        const timeframePrices = getHistoricalPricesForTimeframe(allHistoricalPrices, selectedTimeframe);
        console.log(`Using ${timeframePrices.length} days of data for ${selectedTimeframe}-month prediction`);

        // Step 4: Calculate financial metrics
        const trendReturn = calculateTrendReturn(timeframePrices);
        const momentum = calculateMomentum(timeframePrices);
        const meanReversion = calculateMeanReversion(timeframePrices);
        const sigma = calculateVolatility(timeframePrices);

        // Step 5: Compute expected return (mu)
        const mu = (0.5 * trendReturn) + (0.3 * momentum) + (0.2 * meanReversion);

        // Step 6: Call OpenAI API for prediction
        const aiResult = await callOpenAI(currentPrice, mu, sigma, T);

        setPredictionData({
          expectedPrice: aiResult.expectedPrice,
          upperBand: aiResult.upperBand,
          lowerBand: aiResult.lowerBand,
          expectedReturn: mu,
          confidence: aiResult.confidence,
          explanation: aiResult.explanation,
        });
      } catch (histError: any) {
        console.warn('Could not generate prediction:', histError.message);
        // Stock data is still available, just no prediction
        setPredictionData(null);
      }

    } catch (err: any) {
      setError(err.message || 'Failed to fetch stock data. Please try again.');
      console.error('Error fetching stock data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{flexGrow: 1}} keyboardShouldPersistTaps="handled">
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
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
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
                returnKeyType="send"
                onSubmitEditing={handleSubmitEditing}
                blurOnSubmit={true}
              />
              <TouchableOpacity
                style={styles.sendButton}
                onPress={stockData || error ? handleReset : handlePress}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#34D399" />
                ) : stockData || error ? (
                  <Ionicons name="close" size={24} color="#FF453A" />
                ) : (
                  <Ionicons name="send" size={20} color="#34D399" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>

        {/* Timeframe Selector or Signal Selector */}
        {stockData ? (
          // Show timeframe selector when stock is searched
          <View style={styles.timeframeContainer}>
            <View style={styles.timeframeBar}>
              <TouchableOpacity
                style={[styles.timeframeButton, predictionTimeframe === 3 && styles.timeframeButtonActive]}
                onPress={() => fetchStockPrice(3)}
                disabled={loading}
              >
                <Text style={[styles.timeframeText, predictionTimeframe === 3 && styles.timeframeTextActive]}>
                  3 Month
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.timeframeButton, predictionTimeframe === 6 && styles.timeframeButtonActive]}
                onPress={() => fetchStockPrice(6)}
                disabled={loading}
              >
                <Text style={[styles.timeframeText, predictionTimeframe === 6 && styles.timeframeTextActive]}>
                  6 Month
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.timeframeButton, predictionTimeframe === 9 && styles.timeframeButtonActive]}
                onPress={() => fetchStockPrice(9)}
                disabled={loading}
              >
                <Text style={[styles.timeframeText, predictionTimeframe === 9 && styles.timeframeTextActive]}>
                  9 Month
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.timeframeButton, predictionTimeframe === 12 && styles.timeframeButtonActive]}
                onPress={() => fetchStockPrice(12)}
                disabled={loading}
              >
                <Text style={[styles.timeframeText, predictionTimeframe === 12 && styles.timeframeTextActive]}>
                  12 Month
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          // Show signal selector when no stock is searched
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
        )}
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
            <>
              {/* 3-Month Prediction Card */}
              {predictionData ? (
                <View style={styles.predictionCard}>
                  <View style={styles.predictionHeader}>
                    <View>
                      <Text style={styles.predictionLabel}>{predictionTimeframe}-MONTH FORECAST</Text>
                      <Text style={styles.predictionDate}>
                        Est. {new Date(Date.now() + predictionTimeframe * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </Text>
                    </View>
                    <View style={styles.aiBadge}>
                      <Ionicons name="sparkles" size={14} color="#5E5CE6" />
                      <Text style={styles.aiBadgeText}>AI Powered</Text>
                    </View>
                  </View>

                  <View style={styles.predictionContent}>
                    <View style={styles.predictionLeft}>
                      <Text style={styles.predictionValue}>
                        {predictionData && typeof predictionData.expectedPrice === 'number' && !isNaN(predictionData.expectedPrice)
                          ? `$${predictionData.expectedPrice.toFixed(2)}`
                          : 'N/A'}
                      </Text>
                      <Text style={styles.predictionSubtext}>Estimated Value</Text>
                    </View>
                    <View style={styles.predictionRight}>
                      <View style={styles.predictionChangeContainer}>
                        <Text style={styles.predictionChangeIcon}>
                          {predictionData && typeof predictionData.expectedReturn === 'number' && !isNaN(predictionData.expectedReturn)
                            ? (predictionData.expectedReturn >= 0 ? '📈' : '📉')
                            : ''}
                        </Text>
                        <Text style={[
                          styles.predictionChange,
                          predictionData && typeof predictionData.expectedReturn === 'number' && !isNaN(predictionData.expectedReturn) && predictionData.expectedReturn >= 0 ? styles.positive : styles.negative
                        ]}>
                          {predictionData && typeof predictionData.expectedReturn === 'number' && !isNaN(predictionData.expectedReturn)
                            ? `${predictionData.expectedReturn >= 0 ? '+' : ''}${(predictionData.expectedReturn * 100).toFixed(2)}%`
                            : 'N/A'}
                        </Text>
                      </View>
                      <Text style={styles.predictionConfidence}>
                        Confidence: {predictionData && typeof predictionData.confidence === 'number' && !isNaN(predictionData.confidence)
                          ? `${predictionData.confidence}%`
                          : 'N/A'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.predictionRangeContainer}>
                    <View style={styles.rangeRow}>
                      <Text style={styles.rangeLabel}>Upper Band:</Text>
                      <Text style={styles.rangeValue}>
                        {predictionData && typeof predictionData.upperBand === 'number' && !isNaN(predictionData.upperBand)
                          ? `$${predictionData.upperBand.toFixed(2)}`
                          : 'N/A'}
                      </Text>
                    </View>
                    <View style={styles.rangeRow}>
                      <Text style={styles.rangeLabel}>Lower Band:</Text>
                      <Text style={styles.rangeValue}>
                        {predictionData && typeof predictionData.lowerBand === 'number' && !isNaN(predictionData.lowerBand)
                          ? `$${predictionData.lowerBand.toFixed(2)}`
                          : 'N/A'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.predictionFooter}>
                    <Ionicons name="information-circle-outline" size={14} color="#636366" />
                    <Text style={styles.predictionDisclaimer}>
                      {predictionData && typeof predictionData.explanation === 'string' && predictionData.explanation.trim() !== ''
                        ? predictionData.explanation
                        : 'No explanation available.'}
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.predictionCard}>
                  <View style={styles.predictionHeader}>
                    <View>
                      <Text style={styles.predictionLabel}>3-MONTH FORECAST</Text>
                      <Text style={styles.predictionDate}>Calculating...</Text>
                    </View>
                    <View style={styles.aiBadge}>
                      <Ionicons name="sparkles" size={14} color="#5E5CE6" />
                      <Text style={styles.aiBadgeText}>AI Powered</Text>
                    </View>
                  </View>
                  <View style={styles.predictionContent}>
                    <ActivityIndicator size="large" color="#5E5CE6" />
                  </View>
                </View>
              )}

              {/* Current Stock Info Card */}
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
            </>
          ) : null}
        </View>
      )}

      {!(stockData || error) && (
        <View style={{ flex: 1 }}>
          <TopPicksCarousel title="Top Picks" badgeText="NEW" data={getActiveData()} />
        </View>
      )}
    </ScrollView>
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
  timeframeContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  timeframeBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  timeframeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#1C1C1E',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#2C2C2E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  timeframeButtonActive: {
    backgroundColor: '#5E5CE6',
    borderColor: '#5E5CE6',
    shadowColor: '#5E5CE6',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  timeframeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
  },
  timeframeTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
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
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#5E5CE6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(94, 92, 230, 0.2)',
  },
  predictionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  predictionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8E8E93',
    letterSpacing: 1,
    marginBottom: 4,
  },
  predictionDate: {
    fontSize: 11,
    color: '#636366',
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(94, 92, 230, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  aiBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#5E5CE6',
  },
  predictionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  predictionLeft: {
    flex: 1,
  },
  predictionValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#5E5CE6',
    marginBottom: 4,
  },
  predictionSubtext: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
  },
  predictionRight: {
    alignItems: 'flex-end',
  },
  predictionChangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  predictionChangeIcon: {
    fontSize: 20,
    marginRight: 4,
  },
  predictionChange: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#34D399',
  },
  predictionConfidence: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  predictionRangeContainer: {
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    gap: 8,
  },
  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rangeLabel: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
  },
  rangeValue: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  predictionFooter: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#2C2C2E',
    padding: 10,
    borderRadius: 8,
    gap: 6,
  },
  predictionDisclaimer: {
    fontSize: 11,
    color: '#636366',
    flex: 1,
    lineHeight: 16,
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
