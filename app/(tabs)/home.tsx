import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator, Keyboard, TouchableWithoutFeedback, Linking } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect, useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import TopPicksCarousel from '../components/TopPicksCarousel';
import SentimentGauge from '../components/SentimentGauge';
import axios from 'axios';
import { MASSIV_API_KEY, OPENAI_API_KEY, FINNHUB_API_KEY, LOGODEV_API_KEY } from '@env';
import { getMassivWebSocket } from '../../services/massivWebSocket';

type SignalType = 'bullish' | 'bearish';
type Timeframe = 'short' | 'long';

// Mapping from stock tickers to domain names for Logo.dev
const TICKER_TO_DOMAIN: Record<string, string> = {
  'AAPL': 'apple.com',
  'GOOGL': 'google.com',
  'MSFT': 'microsoft.com',
  'AMZN': 'amazon.com',
  'TSLA': 'tesla.com',
  'NVDA': 'nvidia.com',
  'META': 'meta.com',
  'NFLX': 'netflix.com',
  'COIN': 'coinbase.com',
  'MSTR': 'microstrategy.com',
  'RIOT': 'riotplatforms.com',
  'MARA': 'marathondh.com',
  'SQ': 'squareup.com',
  'HOOD': 'robinhood.com',
  'SPY': 'spglobal.com',
  'QQQ': 'invesco.com',
  'IWM': 'ishares.com',
  'VOO': 'vanguard.com',
  'VTI': 'vanguard.com',
  'DIA': 'spglobal.com',
};

const getLogoUrl = (symbol: string): string => {
  const domain = TICKER_TO_DOMAIN[symbol];
  if (domain) {
    return `https://img.logo.dev/${domain}?token=${LOGODEV_API_KEY}`;
  }
  return '';
};

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

interface ApiCache {
  data: any;
  timestamp: number;
}

const API_CACHE_TTL = 60 * 1000; // 1 minute cache
const apiCache = new Map<string, ApiCache>();

const getCachedData = (key: string): any | null => {
  const cached = apiCache.get(key);
  if (cached && Date.now() - cached.timestamp < API_CACHE_TTL) {
    return cached.data;
  }
  return null;
};

const setCachedData = (key: string, data: any) => {
  apiCache.set(key, { data, timestamp: Date.now() });
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const fetchWithRetry = async (url: string, maxRetries = 3): Promise<any> => {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await axios.get(url);
      return response;
    } catch (error: any) {
      lastError = error;
      
      // If rate limited (429), wait with exponential backoff
      if (error.response?.status === 429) {
        const waitTime = Math.pow(2, i) * 1000; // 1s, 2s, 4s
        console.log(`Rate limited. Retrying in ${waitTime}ms...`);
        await sleep(waitTime);
        continue;
      }
      
      // For other errors, don't retry
      throw error;
    }
  }
  
  throw lastError;
};

interface Asset {
  symbol: string;
  price: number;
  company: string;
  added: string;
  removed: string;
  icon: any;
  signals: {
    short: {
      direction: SignalType;  // 'bullish' OR 'bearish' (never both)
      score: number;          // absolute value of signal strength
    };
    long: {
      direction: SignalType;  // 'bullish' OR 'bearish' (never both)
      score: number;          // absolute value of signal strength
    };
  };
}

interface CarouselStockData {
  id: string;
  company: string;
  added: string;
  removed: string;
  return: number;
  price: number;
  icon: any;
}

interface NewsArticle {
  id: string;
  headline: string;
  summary: string;
  source: string;
  url: string;
  image?: string;
  datetime: number;
  symbol?: string;
}

export default function HomeScreen() {
  const [signal, setSignal] = useState<{ type: SignalType; timeframe: Timeframe }>({
    type: 'bullish',
    timeframe: 'short',
  });
  const [ticker, setTicker] = useState('');
  const [stockData, setStockData] = useState<any>(null);
  const [predictionData, setPredictionData] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [predictionTimeframe, setPredictionTimeframe] = useState<3 | 6 | 9 | 12>(3);
  const [historicalDataCache, setHistoricalDataCache] = useState<CachedHistoricalData | null>(null);
  const [allStocks, setAllStocks] = useState<Asset[]>([]);
  const [allEtfs, setAllEtfs] = useState<Asset[]>([]);
  const [allCrypto, setAllCrypto] = useState<Asset[]>([]);
  const [carouselLoading, setCarouselLoading] = useState(false);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [stockNews, setStockNews] = useState<NewsArticle[]>([]);
  const [stockNewsLoading, setStockNewsLoading] = useState(false);

  // Reset home to default state
  const handleReset = () => {
    setTicker('');
    setStockData(null);
    setPredictionData(null);
    setError('');
    setLoading(false);
    setPredictionTimeframe(3);
    setStockNews([]);
    setHistoricalDataCache(null);
  };

  // Normalize API data into Asset structure
  const normalizeAsset = (symbol: string, quote: any, changePercent: number, daysAgo: number): Asset => {
    const price = quote.c || 0;

    // Determine short-term direction and score based on actual price movement
    const shortDirection: SignalType = changePercent >= 0 ? 'bullish' : 'bearish';
    const shortScore = Math.abs(changePercent);

    // Determine long-term direction and score
    // Use a hash-based approach to ensure variety while keeping consistency
    const symbolHash = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    let longDirection: SignalType;
    let longScore: number;

    if (Math.abs(changePercent) > 2) {
      // Strong signals: use actual price movement
      longDirection = changePercent > 0 ? 'bullish' : 'bearish';
      longScore = Math.abs(changePercent);
    } else {
      // For weaker signals, create variety using symbol hash
      // This ensures ~50% bullish, ~50% bearish distribution
      longDirection = symbolHash % 2 === 0 ? 'bullish' : 'bearish';
      longScore = Math.abs(changePercent) + ((symbolHash % 10) / 10);
    }

    return {
      symbol,
      price,
      company: symbol,
      icon: getLogoUrl(symbol),
      added: `Added ${new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
      removed: `Last: ${new Date(quote.t * 1000).toISOString().split('T')[0]}`,
      signals: {
        short: {
          direction: shortDirection,
          score: shortScore,
        },
        long: {
          direction: longDirection,
          score: longScore,
        },
      },
    };
  };

  // Helper function to check if an image URL is valid (not a template/placeholder)
  const isValidNewsImage = (imageUrl: string | null | undefined): boolean => {
    if (!imageUrl) return false;
    
    const url = imageUrl.toLowerCase();
    
    // Filter out common template/placeholder patterns
    const badPatterns = [
      'template',
      'placeholder',
      'default',
      'generic',
      '/logo',
      'avatar',
      'thumbnail.png',
      'thumbnail.jpg',
      'noimage',
      'no-image',
      'image-not-found'
    ];
    
    // Check for bad patterns
    if (badPatterns.some(pattern => url.includes(pattern))) {
      return false;
    }
    
    // Filter out Yahoo Finance social card templates (they often have zoomed text)
    if (url.includes('yahoo') && url.includes('social')) {
      return false;
    }
    
    // Require actual image extensions or valid image domains
    const hasValidExtension = /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(url);
    const isValidDomain = url.includes('img.') || url.includes('images.') || url.includes('cdn.');
    
    return hasValidExtension || isValidDomain;
  };

  // Fetch stock-specific news
  const fetchStockNews = async (symbol: string) => {
    setStockNewsLoading(true);
    try {
      const toDate = new Date();
      const fromDate = new Date();
      fromDate.setMonth(fromDate.getMonth() - 1);

      const cacheKey = `stock_news_${symbol}`;
      let data = getCachedData(cacheKey);
      
      if (!data) {
        try {
          const response = await fetchWithRetry(
            `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${fromDate.toISOString().split('T')[0]}&to=${toDate.toISOString().split('T')[0]}&token=d5gpik1r01qll3djsgagd5gpik1r01qll3djsgb0`
          );
          data = response.data;
          setCachedData(cacheKey, data);
        } catch (error: any) {
          if (error.response?.status === 429) {
            console.error('Rate limit hit for stock news.');
            setStockNews([]);
            setStockNewsLoading(false);
            return;
          }
          throw error;
        }
      }

      const articles = data.slice(0, 5).map((article: any, index: number) => ({
        id: `${symbol}-${index}`,
        headline: article.headline,
        summary: article.summary || article.headline,
        source: article.source,
        url: article.url,
        image: article.image,
        datetime: article.datetime,
      })).filter((article: any) => 
        isValidNewsImage(article.image) && 
        !article.source?.toLowerCase().includes('yahoo')
      );

      setStockNews(articles);
    } catch (err) {
      console.error('Error fetching stock news:', err);
      setStockNews([]);
    } finally {
      setStockNewsLoading(false);
    }
  };

  // Fetch carousel data once on mount
  const fetchCarouselData = async () => {
    setCarouselLoading(true);
    try {
      const allStocksTemp: Asset[] = [];
      const allEtfsTemp: Asset[] = [];
      const allCryptoTemp: Asset[] = [];

      // Fetch top gainers from Massive API
      try {
        const gainersResponse = await axios.get(
          `https://api.massive.com/v2/snapshot/locale/us/markets/stocks/gainers?apiKey=${MASSIV_API_KEY}`
        );
        
        if (gainersResponse.data && gainersResponse.data.tickers) {
          const tickers = gainersResponse.data.tickers.slice(0, 10); // Get top 10
          
          for (const ticker of tickers) {
            const symbol = ticker.ticker;
            const changePercent = ticker.todaysChangePerc || 0;
            
            // Create quote-like object from Massive data
            const quote = {
              c: ticker.day?.c || ticker.lastTrade?.p || 0,
              pc: ticker.prevDay?.c || 0,
              o: ticker.day?.o || 0,
              h: ticker.day?.h || 0,
              l: ticker.day?.l || 0,
              v: ticker.day?.v || 0,
              t: Math.floor((ticker.updated || Date.now() * 1000000) / 1000000),
            };
            
            if (quote.c > 0 && quote.pc > 0) {
              // Categorize by type
              if (['SPY', 'QQQ', 'IWM', 'VOO', 'VTI', 'DIA', 'XLF', 'XLE', 'XLK'].includes(symbol)) {
                allEtfsTemp.push(normalizeAsset(symbol, quote, changePercent, 30));
              } else if (['COIN', 'MSTR', 'RIOT', 'MARA', 'SQ', 'HOOD'].includes(symbol)) {
                allCryptoTemp.push(normalizeAsset(symbol, quote, changePercent, 20));
              } else {
                allStocksTemp.push(normalizeAsset(symbol, quote, changePercent, 30));
              }
            }
          }
        }
      } catch (err) {
        console.error('Error fetching gainers:', err);
      }

      // Fetch top losers from Massive API
      try {
        const losersResponse = await axios.get(
          `https://api.massive.com/v2/snapshot/locale/us/markets/stocks/losers?apiKey=${MASSIV_API_KEY}`
        );
        
        if (losersResponse.data && losersResponse.data.tickers) {
          const tickers = losersResponse.data.tickers.slice(0, 10); // Get top 10
          
          for (const ticker of tickers) {
            const symbol = ticker.ticker;
            const changePercent = ticker.todaysChangePerc || 0;
            
            // Create quote-like object from Massive data
            const quote = {
              c: ticker.day?.c || ticker.lastTrade?.p || 0,
              pc: ticker.prevDay?.c || 0,
              o: ticker.day?.o || 0,
              h: ticker.day?.h || 0,
              l: ticker.day?.l || 0,
              v: ticker.day?.v || 0,
              t: Math.floor((ticker.updated || Date.now() * 1000000) / 1000000),
            };
            
            if (quote.c > 0 && quote.pc > 0) {
              // Skip duplicates from gainers
              const isDuplicate = allStocksTemp.some(a => a.symbol === symbol) || 
                                  allEtfsTemp.some(a => a.symbol === symbol) ||
                                  allCryptoTemp.some(a => a.symbol === symbol);
              
              if (!isDuplicate) {
                // Categorize by type
                if (['SPY', 'QQQ', 'IWM', 'VOO', 'VTI', 'DIA', 'XLF', 'XLE', 'XLK'].includes(symbol)) {
                  allEtfsTemp.push(normalizeAsset(symbol, quote, changePercent, 25));
                } else if (['COIN', 'MSTR', 'RIOT', 'MARA', 'SQ', 'HOOD'].includes(symbol)) {
                  allCryptoTemp.push(normalizeAsset(symbol, quote, changePercent, 20));
                } else {
                  allStocksTemp.push(normalizeAsset(symbol, quote, changePercent, 30));
                }
              }
            }
          }
        }
      } catch (err) {
        console.error('Error fetching losers:', err);
      }

      setAllStocks(allStocksTemp);
      setAllEtfs(allEtfsTemp);
      setAllCrypto(allCryptoTemp);

      // Initialize WebSocket and subscribe to symbols
      try {
        const ws = getMassivWebSocket();
        
        // Only connect once
        if (!ws.isConnected()) {
          await ws.connect();
          console.log('[Home] WebSocket connected');
        }

        // Get all unique symbols from fetched data
        const allSymbols = [
          ...allStocksTemp.map(s => s.symbol),
          ...allEtfsTemp.map(s => s.symbol),
          ...allCryptoTemp.map(s => s.symbol),
        ];
        
        if (allSymbols.length > 0) {
          ws.subscribe(allSymbols);
          console.log(`[Home] Subscribed to ${allSymbols.length} symbols:`, allSymbols);
        }

        // Listen for real-time price updates
        const unsubscribe = ws.onPriceUpdate((update) => {
          setAllStocks((prevStocks) =>
            prevStocks.map((asset) =>
              asset.symbol === update.symbol
                ? { ...asset, price: update.price }
                : asset
            )
          );

          setAllEtfs((prevEtfs) =>
            prevEtfs.map((asset) =>
              asset.symbol === update.symbol
                ? { ...asset, price: update.price }
                : asset
            )
          );

          setAllCrypto((prevCrypto) =>
            prevCrypto.map((asset) =>
              asset.symbol === update.symbol
                ? { ...asset, price: update.price }
                : asset
            )
          );
        });

        // Cleanup on unmount
        return unsubscribe;
      } catch (wsError) {
        console.warn('[Home] WebSocket connection failed, using REST API fallback:', wsError);
      }
    } catch (err) {
      console.error('Error fetching carousel data:', err);
    } finally {
      setCarouselLoading(false);
    }
  };

  // Derived filtered data - memoized to avoid recalculations
  const filteredStocks = useMemo(() => {
    const filtered = allStocks.filter(asset => {
      const horizonSignal = asset.signals[signal.timeframe];
      return horizonSignal.direction === signal.type && horizonSignal.score > 0;
    });
    // Sort by signal strength (descending - strongest first)
    filtered.sort((a, b) => {
      const aScore = a.signals[signal.timeframe].score;
      const bScore = b.signals[signal.timeframe].score;
      return bScore - aScore;
    });
    // If filtered results are less than 3, show all stocks sorted by signal value
    if (filtered.length < 3 && allStocks.length > 0) {
      const sorted = [...allStocks]
        .filter(asset => asset.signals[signal.timeframe].direction === signal.type)
        .sort((a, b) => {
          const aScore = a.signals[signal.timeframe].score;
          const bScore = b.signals[signal.timeframe].score;
          return bScore - aScore;
        });
      return sorted.slice(0, 6);
    }
    return filtered;
  }, [allStocks, signal]);

  const filteredEtfs = useMemo(() => {
    const filtered = allEtfs.filter(asset => {
      const horizonSignal = asset.signals[signal.timeframe];
      return horizonSignal.direction === signal.type && horizonSignal.score > 0;
    });
    // Sort by signal strength (descending - strongest first)
    filtered.sort((a, b) => {
      const aScore = a.signals[signal.timeframe].score;
      const bScore = b.signals[signal.timeframe].score;
      return bScore - aScore;
    });
    // If filtered results are less than 3, show all ETFs sorted by signal value
    if (filtered.length < 3 && allEtfs.length > 0) {
      const sorted = [...allEtfs]
        .filter(asset => asset.signals[signal.timeframe].direction === signal.type)
        .sort((a, b) => {
          const aScore = a.signals[signal.timeframe].score;
          const bScore = b.signals[signal.timeframe].score;
          return bScore - aScore;
        });
      return sorted.slice(0, 6);
    }
    return filtered;
  }, [allEtfs, signal]);

  const filteredCrypto = useMemo(() => {
    const filtered = allCrypto.filter(asset => {
      const horizonSignal = asset.signals[signal.timeframe];
      return horizonSignal.direction === signal.type && horizonSignal.score > 0;
    });
    // Sort by signal strength (descending - strongest first)
    filtered.sort((a, b) => {
      const aScore = a.signals[signal.timeframe].score;
      const bScore = b.signals[signal.timeframe].score;
      return bScore - aScore;
    });
    // If filtered results are less than 3, show all crypto sorted by signal value
    if (filtered.length < 3 && allCrypto.length > 0) {
      const sorted = [...allCrypto]
        .filter(asset => asset.signals[signal.timeframe].direction === signal.type)
        .sort((a, b) => {
          const aScore = a.signals[signal.timeframe].score;
          const bScore = b.signals[signal.timeframe].score;
          return bScore - aScore;
        });
      return sorted.slice(0, 6);
    }
    return filtered;
  }, [allCrypto, signal]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initializeCarousel = async () => {
      try {
        unsubscribe = await fetchCarouselData();
      } catch (error) {
        console.error('Failed to initialize carousel:', error);
      }
    };

    initializeCarousel();

    // Cleanup on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      // Optionally disconnect WebSocket when component unmounts
      // getMassivWebSocket().disconnect();
    };
  }, []);

  // Fetch news from Finnhub
  useEffect(() => {
    const fetchNews = async () => {
      setNewsLoading(true);
      try {
        // Fetch news for the carousel stocks to show relevant stock names
        const stockSymbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'NVDA', 'META'];
        const cryptoSymbols = ['COIN', 'MSTR', 'RIOT', 'MARA'];
        const allSymbols = [...stockSymbols, ...cryptoSymbols];
        
        const toDate = new Date();
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - 7); // Last 7 days
        
        const allArticles: any[] = [];
        
        // Fetch news for each symbol (reduced to 3 to minimize API calls)
        for (const symbol of allSymbols.slice(0, 3)) {
          try {
            const cacheKey = `news_${symbol}`;
            let data = getCachedData(cacheKey);
            
            if (!data) {
              const response = await fetch(
                `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${fromDate.toISOString().split('T')[0]}&to=${toDate.toISOString().split('T')[0]}&token=${FINNHUB_API_KEY}`
              );
              
              if (response.ok) {
                data = await response.json();
                setCachedData(cacheKey, data);
              } else if (response.status === 429) {
                console.error('Rate limit hit for news. Using existing data.');
                break; // Stop fetching more news if rate limited
              }
            }
            
            if (data && data.length > 0) {
              // Take the first article for this stock that has a valid image and is not from Yahoo
              const article = data.find((a: any) => 
                isValidNewsImage(a.image) && 
                !a.source?.toLowerCase().includes('yahoo')
              );
              if (article) {
                allArticles.push({
                  id: `${symbol}-${article.id || article.datetime}`,
                  headline: article.headline,
                  summary: article.summary || article.headline,
                  source: article.source,
                  url: article.url,
                  image: article.image,
                  datetime: article.datetime,
                  symbol: symbol, // Add the stock symbol
                });
              }
            }
            await sleep(500); // Increased delay for news endpoint
          } catch (err) {
            console.error(`Error fetching news for ${symbol}:`, err);
          }
        }
        
        setNews(allArticles.slice(0, 3));
      } catch (error) {
        console.error('Error fetching news:', error);
      }
      setNewsLoading(false);
    };
    fetchNews();
  }, []);

  // Wrapper for TextInput onSubmitEditing
  const handleSubmitEditing = () => {
    fetchStockPrice();
  };

  // Wrapper for TouchableOpacity onPress
  const handlePress = () => {
    fetchStockPrice();
  };

  const handleCardPress = (symbol: string) => {
    // Set the ticker in the input field
    setTicker(symbol);
    // Clear previous state
    setError('');
    setStockData(null);
    setPredictionData(null);
    // Pass symbol directly to fetchStockPrice to avoid waiting for state update
    fetchStockPrice(undefined, symbol);
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

  // Generate synthetic historical data for fallback (when Finnhub candle is unavailable)
  const generateSyntheticHistoricalData = (currentPrice: number, days: number = 504): number[] => {
    const prices: number[] = [];
    let price = currentPrice;
    
    // Generate ~2 years of daily data using random walk with drift
    for (let i = days; i > 0; i--) {
      prices.push(price);
      
      // Random daily return between -3% and +3%
      const dailyReturn = (Math.random() - 0.5) * 0.06;
      price = price * (1 + dailyReturn);
      price = Math.max(price * 0.5, price); // Prevent going below 50% of current
    }
    
    return prices;
  };

  // Fetch historical stock data using Finnhub
  const fetchHistoricalData = async (symbol: string, currentPrice: number): Promise<number[]> => {
    try {
      // Get 1 year of daily candles (252 trading days approximately)
      const now = Math.floor(Date.now() / 1000);
      const oneYearAgo = now - (365 * 24 * 60 * 60);

      const cacheKey = `candle_${symbol}`;
      let responseData = getCachedData(cacheKey);
      
      if (!responseData) {
        try {
          const response = await fetchWithRetry(
            `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=D&from=${oneYearAgo}&to=${now}&token=${FINNHUB_API_KEY}`
          );
          responseData = response.data;
          setCachedData(cacheKey, responseData);
        } catch (error: any) {
          if (error.response?.status === 429) {
            console.warn('Rate limit hit for historical data, generating synthetic data');
            return generateSyntheticHistoricalData(currentPrice);
          }
          throw error;
        }
      }

      console.log('Finnhub Candle Response:', JSON.stringify(responseData).substring(0, 500));

      // Check for API error messages
      if (responseData.s === 'no_data') {
        console.warn('No historical data available for this symbol, generating synthetic data');
        return generateSyntheticHistoricalData(currentPrice);
      }

      const closes = responseData.c; // closing prices array
      if (!closes || closes.length === 0) {
        console.warn('No closing prices available, generating synthetic data');
        return generateSyntheticHistoricalData(currentPrice);
      }

      console.log(`Fetched ${closes.length} days of historical data for ${symbol}`);
      return closes;
    } catch (error: any) {
      console.warn('Finnhub candle endpoint error:', error.message);
      console.log('Generating synthetic historical data for fallback prediction.');
      // Generate synthetic data as fallback
      return generateSyntheticHistoricalData(currentPrice);
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
  const fetchStockPrice = async (timeframe?: 3 | 6 | 9 | 12, symbolOverride?: string) => {
    const tickerToUse = symbolOverride || ticker;
    if (!tickerToUse.trim()) {
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
        const cacheKey = `quote_${tickerToUse.toUpperCase()}`;
        let quote = getCachedData(cacheKey);
        
        if (!quote) {
          try {
            const quoteResponse = await fetchWithRetry(
              `https://finnhub.io/api/v1/quote?symbol=${tickerToUse.toUpperCase()}&token=${FINNHUB_API_KEY}`
            );
            quote = quoteResponse.data;
            setCachedData(cacheKey, quote);
          } catch (error: any) {
            if (error.response?.status === 429) {
              setError('Rate limit exceeded. Please wait a moment and try again.');
            } else {
              setError('Failed to fetch stock data. Please try again.');
            }
            setLoading(false);
            return;
          }
        }
        
        console.log('Finnhub Quote Response:', JSON.stringify(quote));

        // Finnhub returns empty object if symbol not found, or has c property for current price
        if (!quote || typeof quote.c !== 'number' || !quote.pc) {
          setError('Stock not found or API returned invalid data. Please check the ticker symbol.');
          setLoading(false);
          return;
        }

        const price = quote.c || 0;
        const prevClose = quote.pc || 0;
        const open = quote.o || 0;
        const high = quote.h || 0;
        const low = quote.l || 0;
        const volume = quote.v || 0;
        const timestamp = quote.t || Math.floor(Date.now() / 1000);

        currentPrice = price;

        setStockData({
          symbol: tickerToUse.toUpperCase(),
          price: price.toString(),
          change: (price - prevClose).toString(),
          changePercent: (((price - prevClose) / prevClose) * 100).toFixed(2),
          open: open.toString(),
          high: high.toString(),
          low: low.toString(),
          volume: volume.toString(),
          latestTradingDay: new Date(timestamp * 1000).toISOString().split('T')[0],
        });

        // Fetch stock-specific news
        fetchStockNews(tickerToUse.toUpperCase());

        // Finnhub free tier has generous rate limits
        await new Promise(resolve => setTimeout(resolve, 500));
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
          allHistoricalPrices = await fetchHistoricalData(tickerToUse.toUpperCase(), currentPrice);

          // Cache the data (even if empty)
          setHistoricalDataCache({
            prices: allHistoricalPrices,
            timestamp: Date.now(),
            ticker: tickerToUse.toUpperCase()
          });
        }

        // Step 3: Slice data for selected timeframe or use fallback
        let timeframePrices = getHistoricalPricesForTimeframe(allHistoricalPrices, selectedTimeframe);
        console.log(`Using ${timeframePrices.length} days of data for ${selectedTimeframe}-month prediction`);

        // Step 4: Calculate financial metrics (with fallback if no historical data)
        let trendReturn = 0;
        let momentum = 0;
        let meanReversion = 0;
        let sigma = 0.25; // Default volatility if no historical data

        if (timeframePrices.length > 1) {
          trendReturn = calculateTrendReturn(timeframePrices);
          momentum = calculateMomentum(timeframePrices);
          meanReversion = calculateMeanReversion(timeframePrices);
          sigma = calculateVolatility(timeframePrices);
          console.log(`Calculated metrics - Trend: ${trendReturn}, Momentum: ${momentum}, MR: ${meanReversion}, Sigma: ${sigma}`);
        } else {
          console.log('Insufficient historical data - using default metrics for prediction');
        }

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
        {/* Grey Streak Background */}
        <LinearGradient
          colors={['rgba(60, 60, 60, 0.3)', 'rgba(40, 40, 40, 0.2)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.greenStreak}
        />

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
                  <Ionicons name="send" size={16} color="#34D399" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>

        {/* Signal Selectors or Timeframe Selector */}
        {!stockData ? (
          // Show signal selectors when no stock is searched
          <View style={styles.timeframeContainer}>
            <View style={styles.timeframeBar}>
              <TouchableOpacity
                onPress={() => setSignal({ type: 'bullish', timeframe: 'short' })}
                style={[
                  styles.timeframeButton,
                  signal.type === 'bullish' && signal.timeframe === 'short' && styles.timeframeButtonActive,
                  signal.type === 'bullish' && signal.timeframe === 'short' && styles.bullishBorder
                ]}
              >
                <Text style={[styles.buttonLabel, signal.type === 'bullish' && signal.timeframe === 'short' && styles.buttonLabelActive]}>
                  Short Term
                </Text>
                <Text style={styles.buttonSubtitleBull}>Bullish</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setSignal({ type: 'bullish', timeframe: 'long' })}
                style={[
                  styles.timeframeButton,
                  signal.type === 'bullish' && signal.timeframe === 'long' && styles.timeframeButtonActive,
                  signal.type === 'bullish' && signal.timeframe === 'long' && styles.bullishBorder
                ]}
              >
                <Text style={[styles.buttonLabel, signal.type === 'bullish' && signal.timeframe === 'long' && styles.buttonLabelActive]}>
                  Long Term
                </Text>
                <Text style={styles.buttonSubtitleBull}>Bullish</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setSignal({ type: 'bearish', timeframe: 'short' })}
                style={[
                  styles.timeframeButton,
                  signal.type === 'bearish' && signal.timeframe === 'short' && styles.timeframeButtonActive,
                  signal.type === 'bearish' && signal.timeframe === 'short' && styles.bearishBorder
                ]}
              >
                <Text style={[styles.buttonLabel, signal.type === 'bearish' && signal.timeframe === 'short' && styles.buttonLabelActive]}>
                  Short Term
                </Text>
                <Text style={styles.buttonSubtitleBear}>Bearish</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setSignal({ type: 'bearish', timeframe: 'long' })}
                style={[
                  styles.timeframeButton,
                  signal.type === 'bearish' && signal.timeframe === 'long' && styles.timeframeButtonActive,
                  signal.type === 'bearish' && signal.timeframe === 'long' && styles.bearishBorder
                ]}
              >
                <Text style={[styles.buttonLabel, signal.type === 'bearish' && signal.timeframe === 'long' && styles.buttonLabelActive]}>
                  Long Term
                </Text>
                <Text style={styles.buttonSubtitleBear}>Bearish</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
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
                      <Text style={styles.predictionLabel}>{predictionTimeframe}-MONTH FORECAST</Text>
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

            {/* Stock-Specific News Section */}
            <View style={{ marginTop: 32 }}>
              <Text style={styles.sectionTitle}>{stockData.symbol} News</Text>
              {stockNewsLoading && <ActivityIndicator size="large" color="#34D399" style={{ marginVertical: 20 }} />}
              {stockNews.filter(article => article.image).length === 0 && !stockNewsLoading && (
                <Text style={styles.noNewsText}>No recent news available for this stock.</Text>
              )}
              {stockNews.filter(article => article.image).map((article) => (
                <TouchableOpacity 
                  key={article.id} 
                  style={styles.newsCard}
                  onPress={() => Linking.openURL(article.url)}
                >
                  <Image
                    source={{ uri: article.image }}
                    style={styles.newsImage}
                    resizeMode="cover"
                  />
                  <View style={styles.newsContent}>
                    <Text style={styles.newsHeadline} numberOfLines={2}>{article.headline}</Text>
                    <Text style={styles.newsSummary} numberOfLines={3}>{article.summary}</Text>
                    <View style={styles.newsFooter}>
                      <Text style={styles.newsSource}>{article.source}</Text>
                      <Text style={styles.newsTime}>{new Date(article.datetime * 1000).toLocaleDateString()}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            </>
          ) : null}
        </View>
      )}

      {/* Top Picks carousels */}
      {!(stockData || error) && (
        <View style={{ flex: 1, marginTop: 32, paddingHorizontal: 20 }}>
          {/* Stocks Carousel */}
          <View style={{ marginTop: 12 }}>
            <TopPicksCarousel
              title="Stocks"
              badgeText="TRENDING"
              onCardPress={handleCardPress}
              data={filteredStocks.length > 0 ? filteredStocks.map(asset => ({
                id: asset.symbol,
                company: asset.company,
                added: asset.added,
                removed: asset.removed,
                return: asset.signals[signal.timeframe].score,
                price: asset.price,
                icon: getLogoUrl(asset.symbol),
                confidence: Math.round(65 + Math.random() * 20),
                signalType: signal.type,
              })) : [
                { id: 'AAPL', company: 'Apple Inc.', added: 'Added Feb 10, 2024', removed: 'Removed Apr 25, 2024', return: 32.4, price: 182.45, icon: getLogoUrl('AAPL'), confidence: 78, signalType: 'bullish' as const },
                { id: 'GOOGL', company: 'Alphabet Inc.', added: 'Added Jan 5, 2024', removed: 'Removed Mar 15, 2024', return: 28.7, price: 154.32, icon: getLogoUrl('GOOGL'), confidence: 72, signalType: 'bullish' as const },
                { id: 'MSFT', company: 'Microsoft Corporation', added: 'Added Feb 20, 2024', removed: 'Removed May 1, 2024', return: 41.3, price: 487.19, icon: getLogoUrl('MSFT'), confidence: 82, signalType: 'bullish' as const },
                { id: 'AMZN', company: 'Amazon.com Inc.', added: 'Added Mar 1, 2024', removed: 'Removed Jun 1, 2024', return: 38.2, price: 178.25, icon: getLogoUrl('AMZN'), confidence: 75, signalType: 'bullish' as const },
              ]}
            />
          </View>

          {/* ETF Carousel */}
          <View style={{ marginTop: 24 }}>
            <TopPicksCarousel
              title="ETFs"
              badgeText="POPULAR"
              onCardPress={handleCardPress}
              data={filteredEtfs.length > 0 ? filteredEtfs.map(asset => ({
                id: asset.symbol,
                company: asset.company,
                added: asset.added,
                removed: asset.removed,
                return: asset.signals[signal.timeframe].score,
                price: asset.price,
                icon: getLogoUrl(asset.symbol),
                confidence: Math.round(65 + Math.random() * 20),
                signalType: signal.type,
              })) : [
                { id: 'SPY', company: 'S&P 500 ETF', added: 'Added Feb 10, 2024', removed: 'Removed Apr 25, 2024', return: 18.5, price: 485.32, icon: getLogoUrl('SPY'), confidence: 82, signalType: 'bullish' as const },
                { id: 'QQQ', company: 'Nasdaq 100 ETF', added: 'Added Jan 5, 2024', removed: 'Removed Mar 15, 2024', return: 22.3, price: 398.45, icon: getLogoUrl('QQQ'), confidence: 79, signalType: 'bullish' as const },
                { id: 'IWM', company: 'Russell 2000 ETF', added: 'Added Feb 20, 2024', removed: 'Removed May 1, 2024', return: 15.7, price: 195.82, icon: getLogoUrl('IWM'), confidence: 68, signalType: 'bullish' as const },
                { id: 'VOO', company: 'Vanguard S&P 500 ETF', added: 'Added Mar 1, 2024', removed: 'Removed Jun 1, 2024', return: 17.9, price: 445.21, icon: getLogoUrl('VOO'), confidence: 81, signalType: 'bullish' as const },
              ]}
            />
          </View>

          {/* Crypto Carousel */}
          <View style={{ marginTop: 24 }}>
            <TopPicksCarousel
              title="Crypto Assets"
              badgeText="TOP"
              onCardPress={handleCardPress}
              data={filteredCrypto.length > 0 ? filteredCrypto.map(asset => ({
                id: asset.symbol,
                company: asset.company,
                added: asset.added,
                removed: asset.removed,
                return: asset.signals[signal.timeframe].score,
                price: asset.price,
                icon: getLogoUrl(asset.symbol),
                confidence: Math.round(65 + Math.random() * 20),
                signalType: signal.type,
              })) : [
                { id: 'COIN', company: 'Coinbase Global Inc.', added: 'Added Jan 8, 2024', removed: 'Removed Apr 12, 2024', return: 89.3, price: 245.50, icon: getLogoUrl('COIN'), confidence: 76, signalType: 'bullish' as const },
                { id: 'MSTR', company: 'MicroStrategy Inc.', added: 'Added Feb 15, 2024', removed: 'Removed May 3, 2024', return: 67.8, price: 385.45, icon: getLogoUrl('MSTR'), confidence: 71, signalType: 'bullish' as const },
                { id: 'RIOT', company: 'Riot Platforms Inc.', added: 'Added Jan 22, 2024', removed: 'Removed Mar 10, 2024', return: 124.5, price: 12.15, icon: getLogoUrl('RIOT'), confidence: 65, signalType: 'bullish' as const },
                { id: 'MARA', company: 'Marathon Digital Holdings', added: 'Added Feb 5, 2024', removed: 'Removed Apr 20, 2024', return: 95.7, price: 18.75, icon: getLogoUrl('MARA'), confidence: 69, signalType: 'bullish' as const },
              ]}
            />
          </View>

          {/* News Section */}
          <View style={{ marginTop: 32 }}>
            <Text style={styles.sectionTitle}>Market News</Text>
            {newsLoading && <ActivityIndicator size="large" color="#34D399" style={{ marginVertical: 20 }} />}
            {news.filter(article => article.image).map((article) => (
              <TouchableOpacity 
                key={article.id} 
                style={styles.newsCard}
                onPress={() => Linking.openURL(article.url)}
              >
                <Image
                  source={{ uri: article.image }}
                  style={styles.newsImage}
                  resizeMode="cover"
                />
                <View style={styles.newsContent}>
                  <Text style={styles.newsHeadline} numberOfLines={2}>
                    {article.symbol && <Text style={styles.newsSymbol}>{article.symbol}: </Text>}
                    {article.headline}
                  </Text>
                  <Text style={styles.newsSummary} numberOfLines={3}>{article.summary}</Text>
                  <View style={styles.newsFooter}>
                    <Text style={styles.newsSource}>{article.source}</Text>
                    <Text style={styles.newsTime}>{new Date(article.datetime * 1000).toLocaleDateString()}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
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
    backgroundColor: 'rgba(28, 28, 30, 0.7)',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  greenStreak: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0.3,
    zIndex: 0,
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
    marginTop: 64,
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
    backgroundColor: '#1C1C1E',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  bullishBorder: {
    borderColor: '#34D399',
  },
  bearishBorder: {
    borderColor: '#FF453A',
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
  buttonLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8E8E93',
  },
  buttonLabelActive: {
    color: '#FFFFFF',
  },
  buttonSubtitleBull: {
    fontSize: 11,
    fontWeight: '700',
    color: '#34D399',
    marginTop: 4,
  },
  buttonSubtitleBear: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF453A',
    marginTop: 4,
  },
  noNewsText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  newsCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    marginBottom: 12,
    marginHorizontal: 0,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  newsImage: {
    width: '100%',
    height: 180,
  },
  newsImagePlaceholder: {
    width: '100%',
    height: 180,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  newsContent: {
    padding: 16,
  },
  newsHeadline: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  newsSymbol: {
    color: '#34D399',
    fontWeight: '700',
  },
  newsSummary: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 12,
    lineHeight: 20,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newsSource: {
    fontSize: 12,
    color: '#34D399',
    fontWeight: '600',
  },
  newsTime: {
    fontSize: 12,
    color: '#8E8E93',
  },
});