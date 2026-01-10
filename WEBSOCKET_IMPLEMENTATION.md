# WebSocket Real-Time Price Streaming Implementation

## Overview
Integrated Massive WebSocket API for real-time stock and crypto price streaming, replacing polling-based REST API calls.

## Files Created
- **services/massivWebSocket.ts** - WebSocket service with connection management, authentication, and subscription handling

## Files Modified
- **app/(tabs)/home.tsx** - Integrated WebSocket for real-time carousel price updates
- **.env** - Added FINNHUB_API_KEY for search bar fallback

## Architecture

### WebSocket Service (`services/massivWebSocket.ts`)
**Key Features:**
- **Singleton Pattern**: Single WebSocket instance per app session
- **Auto-Reconnection**: Up to 5 reconnect attempts with exponential backoff (3s base delay)
- **Authentication**: Automatic auth with Massiv API key after connection
- **Subscription Management**: Easy subscribe/unsubscribe to stock symbols
- **Price Callbacks**: Observer pattern for real-time price updates
- **Graceful Fallback**: Error logging for debugging, REST fallback available

**Main Methods:**
```typescript
connect(): Promise<void>              // Establish WebSocket connection
subscribe(symbols: string[]): void    // Subscribe to AM (aggregate minute) feeds
unsubscribe(symbols: string[]): void  // Unsubscribe from symbols
onPriceUpdate(callback): () => void   // Listen for price updates + return cleanup
disconnect(): void                    // Manual disconnect
isConnected(): boolean                // Check connection status
```

**Message Handling:**
- **Authentication**: `status: "auth_success"` triggers subscriptions
- **Reconnection**: Auto-reconnect on disconnect (unless manual close)
- **Price Updates**: AM (Aggregate Minute) events update carousel prices in real-time
  - Fields: `sym`, `c` (close price), `o`, `h`, `l`, `v` (volume)

### Home Component Integration (`app/(tabs)/home.tsx`)
**Changes:**
1. **Import WebSocket Service**: `import { getMassivWebSocket } from '../../services/massivWebSocket'`
2. **Initialize on Mount**: Connect to WebSocket and subscribe to 12 carousel symbols (6 stocks + 6 crypto)
3. **Real-Time Updates**: Price callbacks update state as messages arrive
4. **Lifecycle Management**: Cleanup subscription callbacks on component unmount
5. **Fallback Support**: Gracefully falls back to REST API (Finnhub) if WebSocket fails
6. **Search Bar**: Uses Finnhub REST API (unchanged) for custom ticker searches

**Data Flow:**
```
App Mount
  ↓
fetchCarouselData()
  ↓
Initial REST fetch (Finnhub) → Set carousel data
  ↓
Connect WebSocket → Authenticate → Subscribe to symbols
  ↓
Listen for AM updates → Update carousel prices in real-time
  ↓
App Unmount → Cleanup callback + optionally disconnect
```

## API Integration

### Massive WebSocket
- **URLs**: 
  - Real-time: `wss://socket.massive.com/stocks`
  - 15-min delayed: `wss://delayed.massive.com/stocks` (fallback)
- **Auth**: Send `{"action":"auth","params":"API_KEY"}`
- **Subscribe**: Send `{"action":"subscribe","params":"AM.AAPL,AM.MSFT"}`
- **Data**: Receive AM events with OHLCV data per minute

### Finnhub (Fallback)
- **Quote**: `https://finnhub.io/api/v1/quote?symbol=AAPL&token=KEY`
- **Used For**:
  - Initial carousel load (synchronous REST before WebSocket ready)
  - Search bar ticker queries (not in carousel subscription list)
  - Fallback if WebSocket connection fails

## Performance Benefits

| Metric | REST Polling | WebSocket |
|--------|--------------|-----------|
| Latency | 500ms-2s | <100ms |
| Updates | On-demand | Real-time per minute |
| Network | Higher (repeated requests) | Lower (continuous stream) |
| Server Load | High (many requests) | Low (persistent connection) |
| User Experience | Static prices | Live ticking prices |

## Error Handling

**WebSocket Failures:**
- Console warning logged
- App continues with REST API fallback
- No disruption to user experience

**Connection Issues:**
- Auto-reconnect with exponential backoff
- Max 5 reconnection attempts
- Returns to REST if max retries exceeded

**Message Parsing:**
- Invalid messages logged but don't crash app
- Missing price fields ignored silently
- Callback errors caught and logged per callback

## Monitoring
```typescript
// In browser/app console:
console.log('[WebSocket] Connected')
console.log('[WebSocket] Authenticated successfully')
console.log('[WebSocket] Subscribed to: AM.AAPL,AM.MSFT,...')
console.log('[Home] WebSocket connected')
```

## Future Enhancements
1. **Multiple Asset Classes**: Subscribe to crypto tickers separately (`wss://socket.massive.com/crypto`)
2. **Trade Events**: Handle `T` (trade) events for tick-by-tick updates
3. **Market Hours Awareness**: Reduce update frequency after market close
4. **Price Alerts**: Add callback for price threshold triggers
5. **Statistics**: Track average update latency, reconnection count

## Configuration
All configuration managed via environment variables:
```env
MASSIV_API_KEY=ndlwd_upWnRdTfeObmD2F3rp04uaSNTV
FINNHUB_API_KEY=d5gpik1r01qll3djsgagd5gpik1r01qll3djsgb0
```
