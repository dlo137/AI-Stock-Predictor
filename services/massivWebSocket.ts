// Safe environment variable access
let MASSIV_API_KEY: string = '';

try {
  const env = require('@env');
  MASSIV_API_KEY = env.MASSIV_API_KEY || '';
} catch (error) {
  console.log('UPDATE AND CONNECT API');
}

interface AggregateMessage {
  ev: 'AM' | 'T';
  sym: string;
  v?: number;
  o?: number;
  c?: number;
  h?: number;
  l?: number;
  a?: number;
  s?: number;
  e?: number;
  [key: string]: any;
}

interface PriceUpdate {
  symbol: string;
  price: number;
  open?: number;
  high?: number;
  low?: number;
  volume?: number;
}

type PriceUpdateCallback = (update: PriceUpdate) => void;

class MassivWebSocketService {
  private ws: WebSocket | null = null;
  private url: string = 'wss://socket.massive.com/stocks';
  private isAuthenticated: boolean = false;
  private subscriptions: Set<string> = new Set();
  private priceCallbacks: PriceUpdateCallback[] = [];
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 3000;
  private isManualClose: boolean = false;

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('[WebSocket] Connected');
          this.authenticate();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const messages = JSON.parse(event.data);
            this.handleMessages(Array.isArray(messages) ? messages : [messages]);
          } catch (error) {
            console.warn('[WebSocket] Failed to parse message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('[WebSocket] Error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('[WebSocket] Disconnected');
          this.isAuthenticated = false;
          if (!this.isManualClose && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.attemptReconnect();
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private authenticate(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    // Check if API key is available
    if (!MASSIV_API_KEY) {
      console.warn('[WebSocket] API key not configured, skipping authentication');
      return;
    }

    const authMessage = {
      action: 'auth',
      params: MASSIV_API_KEY,
    };

    try {
      this.ws.send(JSON.stringify(authMessage));
      console.log('[WebSocket] Authentication sent');
    } catch (error) {
      console.error('[WebSocket] Failed to send auth:', error);
    }
  }

  private handleMessages(messages: any[]): void {
    for (const msg of messages) {
      if (msg.ev === 'status') {
        if (msg.status === 'auth_success') {
          this.isAuthenticated = true;
          this.reconnectAttempts = 0;
          console.log('[WebSocket] Authenticated successfully');
          // Resubscribe after auth
          if (this.subscriptions.size > 0) {
            this.subscribeToSymbols(Array.from(this.subscriptions));
          }
        } else if (msg.status === 'connected') {
          console.log('[WebSocket] Connected to server');
        }
      } else if (msg.ev === 'AM') {
        // Aggregate minute bars
        this.handlePriceUpdate(msg);
      }
    }
  }

  private handlePriceUpdate(msg: AggregateMessage): void {
    if (!msg.sym || msg.c === undefined) return;

    const update: PriceUpdate = {
      symbol: msg.sym,
      price: msg.c, // Close price
      open: msg.o,
      high: msg.h,
      low: msg.l,
      volume: msg.v,
    };

    // Notify all callbacks
    this.priceCallbacks.forEach((callback) => {
      try {
        callback(update);
      } catch (error) {
        console.warn('[WebSocket] Callback error:', error);
      }
    });
  }

  subscribe(symbols: string[]): void {
    if (!this.isAuthenticated || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[WebSocket] Not authenticated or connected, queuing subscription');
      symbols.forEach((sym) => this.subscriptions.add(sym));
      return;
    }

    this.subscribeToSymbols(symbols);
  }

  private subscribeToSymbols(symbols: string[]): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    // Convert symbols to subscription format: AM.AAPL,AM.MSFT
    const subscriptionString = symbols.map((sym) => `AM.${sym}`).join(',');

    const subscribeMessage = {
      action: 'subscribe',
      params: subscriptionString,
    };

    try {
      this.ws.send(JSON.stringify(subscribeMessage));
      symbols.forEach((sym) => this.subscriptions.add(sym));
      console.log('[WebSocket] Subscribed to:', subscriptionString);
    } catch (error) {
      console.error('[WebSocket] Failed to subscribe:', error);
    }
  }

  unsubscribe(symbols: string[]): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      symbols.forEach((sym) => this.subscriptions.delete(sym));
      return;
    }

    const subscriptionString = symbols.map((sym) => `AM.${sym}`).join(',');

    const unsubscribeMessage = {
      action: 'unsubscribe',
      params: subscriptionString,
    };

    try {
      this.ws.send(JSON.stringify(unsubscribeMessage));
      symbols.forEach((sym) => this.subscriptions.delete(sym));
      console.log('[WebSocket] Unsubscribed from:', subscriptionString);
    } catch (error) {
      console.error('[WebSocket] Failed to unsubscribe:', error);
    }
  }

  onPriceUpdate(callback: PriceUpdateCallback): () => void {
    this.priceCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.priceCallbacks.indexOf(callback);
      if (index > -1) {
        this.priceCallbacks.splice(index, 1);
      }
    };
  }

  private attemptReconnect(): void {
    this.reconnectAttempts++;
    console.log(
      `[WebSocket] Attempting reconnection (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
    );

    setTimeout(() => {
      this.connect().catch((error) => {
        console.error('[WebSocket] Reconnection failed:', error);
      });
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  disconnect(): void {
    this.isManualClose = true;
    this.subscriptions.clear();
    this.priceCallbacks = [];

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    console.log('[WebSocket] Disconnected manually');
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN && this.isAuthenticated;
  }

  getSubscriptions(): string[] {
    return Array.from(this.subscriptions);
  }
}

// Singleton instance
let instance: MassivWebSocketService | null = null;

export function getMassivWebSocket(): MassivWebSocketService {
  if (!instance) {
    instance = new MassivWebSocketService();
  }
  return instance;
}
