/**
 * TypeScript interfaces and types for the data fetcher service
 */

// Market data feed types
export interface FeedResponse {
  feeds: Record<string, FeedData>;
  timestamp: number;
}

export interface FeedData {
  ff?: {
    indexFF?: IndexFF | null;
    optionFF?: OptionFF | null;
    marketFF?: MarketFF | null;
  };
  ltp?: number;
  ltt?: number;
  ltq?: number;
  volume?: number;
  oi?: number;
  close?: number;
  open?: number;
  high?: number;
  low?: number;
  atp?: number;
  vwap?: number;
  lowerCircuit?: number;
  upperCircuit?: number;
  bidPrice?: number;
  bidQty?: number;
  askPrice?: number;
  askQty?: number;
  fullFeed?: {
    indexFF?: {
      ltpc?: {
        ltp?: number;
      };
    };
    marketFF?: {
      ltpc?: {
        ltp?: number;
      };
    };
  };
  ltpc?: {
    ltp?: number;
  };
}

export interface IndexFF {
  // Index-specific fields
  ltpc?: {
    ltp?: number;
  };
}

export interface MarketFF {
  // Market-specific fields
  ltpc?: {
    ltp?: number;
  };
}

export interface OptionFF {
  strikePrice: number;
  optionType: 'CE' | 'PE';
  expiryDate: string;
}

// Historical data types
export interface HistoricalCandle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  oi?: number;
}

export interface HistoricalData {
  candles: HistoricalCandle[];
  symbol: string;
  interval: string;
}

// ATM calculation types
export interface ATMKeys {
  atmStrike: number;
  atmCallKey: string;
  atmPutKey: string;
}

export interface ATMDetails {
  strike: number;
  callKey: string;
  putKey: string;
}

// WebSocket message types
export interface SubscriptionMessage {
  guid: string;
  method: 'sub' | 'unsub';
  data: {
    mode: 'full' | 'ltp' | 'quote';
    instrumentKeys: string[];
  };
}

// API response types
export interface UpstoxAuthResponse {
  data: {
    authorizedRedirectUri: string;
  };
}

export interface UpstoxError {
  message: string;
  code?: string;
  status?: number;
}

// Service response types
export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}