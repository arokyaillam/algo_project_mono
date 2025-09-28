// packages/data-fetcher/src/services/websocket.service.ts

import WebSocket from 'ws';
import { getMarketFeedUrl } from './upstoxAuth.service';
import { decodeProtobuf } from './decode.service';
import { processFeedData } from './calculation.service';

const onFeed = (data: any) => {
  // The WebSocket service's only job is to pass the data to the calculation service.
  processFeedData(data);
};


// A function to handle the live feed data.
// In the future, this will send data to our core-engine.
// const onFeed = (data: any) => {
//   console.log('Received Feed:', JSON.stringify(data, null, 2));
// };

let ws: WebSocket | null = null;

/**
 * Establishes a WebSocket connection and subscribes to instruments.
 * @param accessToken The access token for authentication.
 * @param instrumentKeys An array of instrument keys to subscribe to.
 */
export const connectAndSubscribe = async (accessToken: string, instrumentKeys: string[]): Promise<void> => {
   console.log(`[DEBUG] connectAndSubscribe called with ${instrumentKeys.length} instruments`);

   if (ws) {
     console.log('[DEBUG] WebSocket connection already exists, current readyState:', ws.readyState);
     return;
   }

   try {
     console.log('[DEBUG] 🚀 Starting WebSocket connection...');
     const wsUrl = await getMarketFeedUrl(accessToken);
     console.log('[DEBUG] WebSocket URL obtained:', wsUrl.substring(0, 50) + '...');

    ws = new WebSocket(wsUrl, {
      headers: {
        "Api-Version": "3.0",
      },
      followRedirects: true,
    });

    ws.on('open', () => {
       console.log('[DEBUG] ✅ WebSocket connection opened, readyState:', ws?.readyState);
       // Subscribe to instruments once the connection is open
       const subscriptionMessage = {
         guid: "some-guid", // A unique identifier for the subscription
         method: "sub",
         data: {
           mode: "full", // We want full market data
           instrumentKeys: instrumentKeys,
         },
       };
       console.log('[DEBUG] Sending subscription message:', JSON.stringify(subscriptionMessage, null, 2));
       ws?.send(Buffer.from(JSON.stringify(subscriptionMessage)));
       console.log(`[DEBUG] 📡 Subscribed to: ${instrumentKeys.join(', ')}`);
     });

    ws.on('message', (data: Buffer) => {
       console.log(`[DEBUG] Received WebSocket message: ${data.length} bytes`);
       // We receive a binary buffer, so we decode it
       const decodedData = decodeProtobuf(data);
       if (decodedData) {
         console.log(`[DEBUG] Decoded data with ${Object.keys(decodedData.feeds || {}).length} feeds`);
         onFeed(decodedData);
       } else {
         console.warn('[DEBUG] Failed to decode WebSocket message');
       }
     });

     ws.on('close', (event: WebSocket.CloseEvent) => {
       console.log(`[DEBUG] 🔌 WebSocket connection closed. Code: ${event.code}, Reason: ${event.reason || 'No reason provided'}`);
       ws = null;
     });

     ws.on('error', (error: Error) => {
       console.error('[DEBUG] ❌ WebSocket error:', error.message);
       console.error('[DEBUG] Error stack:', error.stack);
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