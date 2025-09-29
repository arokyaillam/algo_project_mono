// packages/data-fetcher/src/services/websocket.service.ts

import WebSocket from 'ws';
import { getMarketFeedUrl } from './upstoxAuth.service';
import { decodeProtobuf } from './decode.service';
import { processFeedData } from './calculation.service';
import { FeedResponse, SubscriptionMessage } from '../types';
import { config, validateInstrumentKey } from '../config';

/**
 * Global WebSocket connection instance
 */
let ws: WebSocket | null = null;

/**
 * Connection state tracking
 */
let isConnecting = false;
let reconnectAttempts = 0;
const maxReconnectAttempts = config.websocket.reconnectAttempts;

/**
 * Handles incoming feed data from the WebSocket.
 *
 * @param data - The decoded feed data
 */
const onFeed = (data: FeedResponse): void => {
  try {
    processFeedData(data);
  } catch (error) {
    console.error('❌ Error processing feed data:', error);
  }
};

/**
 * Generates a unique identifier for subscription messages
 */
function generateGuid(): string {
  return 'ws-sub-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

/**
 * Validates all instrument keys before subscription
 */
function validateInstrumentKeys(instrumentKeys: string[]): string[] {
  const invalidKeys: string[] = [];
  const validKeys = instrumentKeys.filter(key => {
    if (!validateInstrumentKey(key)) {
      invalidKeys.push(key);
      return false;
    }
    return true;
  });

  if (invalidKeys.length > 0) {
    console.warn('⚠️ Invalid instrument keys found:', invalidKeys);
  }

  return validKeys;
}

/**
 * Establishes a WebSocket connection and subscribes to instruments.
 *
 * @param accessToken - The access token for authentication
 * @param instrumentKeys - An array of instrument keys to subscribe to
 * @throws {Error} If connection fails or invalid parameters are provided
 */
export const connectAndSubscribe = async (
  accessToken: string,
  instrumentKeys: string[]
): Promise<void> => {
  // Input validation
  if (!accessToken || typeof accessToken !== 'string') {
    throw new Error('Valid access token is required');
  }

  if (!Array.isArray(instrumentKeys) || instrumentKeys.length === 0) {
    throw new Error('At least one instrument key is required');
  }

  // Validate and filter instrument keys
  const validInstrumentKeys = validateInstrumentKeys(instrumentKeys);

  if (validInstrumentKeys.length === 0) {
    throw new Error('No valid instrument keys provided');
  }

  // Check if already connected or connecting
  if (ws?.readyState === WebSocket.OPEN) {
    console.log('ℹ️ WebSocket already connected, re-subscribing with new instruments');
    subscribeToInstruments(validInstrumentKeys);
    return;
  }

  if (isConnecting) {
    console.log('ℹ️ Connection attempt already in progress');
    return;
  }

  await establishConnection(accessToken, validInstrumentKeys);
};

/**
 * Establishes the WebSocket connection with retry logic
 */
async function establishConnection(
  accessToken: string,
  instrumentKeys: string[]
): Promise<void> {
  if (isConnecting) return;

  isConnecting = true;
  reconnectAttempts = 0;

  try {
    await attemptConnection(accessToken, instrumentKeys);
  } catch (error) {
    console.error('❌ Failed to establish WebSocket connection:', error);
    isConnecting = false;
    throw error;
  }
}

/**
 * Attempts to connect to the WebSocket with exponential backoff
 */
async function attemptConnection(
  accessToken: string,
  instrumentKeys: string[]
): Promise<void> {
  try {
    console.log(`🚀 Establishing WebSocket connection (attempt ${reconnectAttempts + 1})...`);

    const wsUrl = await getMarketFeedUrl(accessToken);
    console.log('✅ WebSocket URL obtained');

    ws = new WebSocket(wsUrl, {
      headers: {
        "Api-Version": config.upstox.apiVersion,
      },
      followRedirects: true,
    });

    setupWebSocketHandlers(ws, instrumentKeys);

  } catch (error) {
    reconnectAttempts++;

    if (reconnectAttempts < maxReconnectAttempts) {
      const delay = config.websocket.reconnectDelay * Math.pow(2, reconnectAttempts - 1);
      console.log(`⏳ Retrying connection in ${delay}ms (attempt ${reconnectAttempts + 1}/${maxReconnectAttempts})`);

      setTimeout(() => {
        attemptConnection(accessToken, instrumentKeys);
      }, delay);
    } else {
      isConnecting = false;
      throw new Error(`Failed to connect after ${maxReconnectAttempts} attempts`);
    }
  }
}

/**
 * Sets up WebSocket event handlers
 */
function setupWebSocketHandlers(ws: WebSocket, instrumentKeys: string[]): void {
  ws.on('open', () => {
    console.log('✅ WebSocket connection established');
    isConnecting = false;
    reconnectAttempts = 0;

    subscribeToInstruments(instrumentKeys);
  });

  ws.on('message', (data: Buffer) => {
    try {
      const decodedData = decodeProtobuf(data);

      if (decodedData) {
        onFeed(decodedData);
      } else {
        console.warn('⚠️ Failed to decode WebSocket message');
      }
    } catch (error) {
      console.error('❌ Error handling WebSocket message:', error);
    }
  });

  ws.on('close', (event: WebSocket.CloseEvent) => {
    console.log(`🔌 WebSocket connection closed. Code: ${event.code}, Reason: ${event.reason || 'No reason provided'}`);
    (ws as any) = null;
    isConnecting = false;
  });

  ws.on('error', (error: Error) => {
    console.error('❌ WebSocket error:', error.message);
    (ws as any) = null;
    isConnecting = false;
  });
}

/**
 * Subscribes to the specified instruments
 */
function subscribeToInstruments(instrumentKeys: string[]): void {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    console.error('❌ Cannot subscribe: WebSocket not connected');
    return;
  }

  const subscriptionMessage: SubscriptionMessage = {
    guid: generateGuid(),
    method: "sub",
    data: {
      mode: "full",
      instrumentKeys: instrumentKeys,
    },
  };

  try {
    ws.send(Buffer.from(JSON.stringify(subscriptionMessage)));
    console.log(`📡 Subscribed to instruments: ${instrumentKeys.join(', ')}`);
  } catch (error) {
    console.error('❌ Failed to send subscription message:', error);
  }
}

/**
 * Disconnects the WebSocket connection if it exists.
 */
export const disconnect = (): void => {
  if (ws) {
    ws.close();
  }
};