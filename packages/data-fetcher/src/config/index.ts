/**
 * Configuration management for the data fetcher service
 */

export interface DataFetcherConfig {
  upstox: {
    accessToken: string;
    apiVersion: string;
  };
  trading: {
    defaultExpiryDate: string;
    defaultInstruments: string[];
  };
  websocket: {
    reconnectAttempts: number;
    reconnectDelay: number;
  };
}

/**
 * Validates required environment variables and configuration
 */
function validateConfig(): DataFetcherConfig {
  const accessToken = process.env.UPSTOX_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error(
      'UPSTOX_ACCESS_TOKEN environment variable is required. ' +
      'Please set it in your .env file or environment.'
    );
  }

  return {
    upstox: {
      accessToken,
      apiVersion: process.env.UPSTOX_API_VERSION || '3.0',
    },
    trading: {
      defaultExpiryDate: process.env.DEFAULT_EXPIRY_DATE || '2025-09-30',
      defaultInstruments: process.env.DEFAULT_INSTRUMENTS
        ? process.env.DEFAULT_INSTRUMENTS.split(',')
        : ['NSE_INDEX|Nifty 50'],
    },
    websocket: {
      reconnectAttempts: parseInt(process.env.WS_RECONNECT_ATTEMPTS || '3'),
      reconnectDelay: parseInt(process.env.WS_RECONNECT_DELAY || '5000'),
    },
  };
}

/**
 * Application configuration instance
 */
export const config: DataFetcherConfig = validateConfig();

/**
 * Validates instrument key format
 */
export function validateInstrumentKey(key: string): boolean {
  return typeof key === 'string' && key.includes('|') && key.length > 3;
}

/**
 * Validates date format (YYYY-MM-DD)
 */
export function validateDate(date: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;

  const parsedDate = new Date(date);
  return parsedDate instanceof Date && !isNaN(parsedDate.getTime());
}