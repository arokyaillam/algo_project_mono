// packages/data-fetcher/src/services/websocket.service.ts

import WebSocket from 'ws';
import { getMarketFeedUrl } from './upstoxAuth.service';
import { decodeProtobuf } from './decode.service';

// A function to handle the live feed data.
// In the future, this will send data to our core-engine.
const onFeed = (data: any) => {
  console.log('Received Feed:', JSON.stringify(data, null, 2));
};

let ws: WebSocket | null = null;

/**
 * Establishes a WebSocket connection and subscribes to instruments.
 * @param accessToken The access token for authentication.
 * @param instrumentKeys An array of instrument keys to subscribe to.
 */
export const connectAndSubscribe = async (accessToken: string, instrumentKeys: string[]): Promise<void> => {
  if (ws) {
    console.log('WebSocket connection already exists.');
    return;
  }

  try {
    console.log('🚀 Starting WebSocket connection...');
    const wsUrl = await getMarketFeedUrl(accessToken);

    ws = new WebSocket(wsUrl, {
      headers: {
        "Api-Version": "2.0",
      },
      followRedirects: true,
    });

    ws.on('open', () => {
      console.log('✅ WebSocket connection opened.');
      // Subscribe to instruments once the connection is open
      const subscriptionMessage = {
        guid: "some-guid", // A unique identifier for the subscription
        method: "sub",
        data: {
          mode: "full", // We want full market data
          instrumentKeys: instrumentKeys,
        },
      };
      ws?.send(Buffer.from(JSON.stringify(subscriptionMessage)));
      console.log(`📡 Subscribed to: ${instrumentKeys.join(', ')}`);
    });

    ws.on('message', (data: Buffer) => {
      // We receive a binary buffer, so we decode it
      const decodedData = decodeProtobuf(data);
      if (decodedData) {
        onFeed(decodedData);
      }
    });

    ws.on('close', () => {
      console.log('🔌 WebSocket connection closed.');
      ws = null;
    });

    ws.on('error', (error: Error) => {
      console.error('❌ WebSocket error:', error);
      ws = null;
    });

  } catch (error) {
    console.error('❌ Failed to establish WebSocket connection:', error);
    ws = null;
  }
};

/**
 * Disconnects the WebSocket connection if it exists.
 */
export const disconnect = (): void => {
  if (ws) {
    ws.close();
  }
};