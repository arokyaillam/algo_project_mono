// packages/data-fetcher/src/services/calculation.service.ts

import { FeedResponse } from '../types';

/**
 * State variables for real-time calculation
 */
let atmStrike: number | null = null;
let atmCallKey: string | null = null;
let atmPutKey: string | null = null;
const latestPrices = new Map<string, number>(); // To store the last price of each instrument

/**
 * Sets the ATM details for real-time calculation.
 *
 * @param strike - The ATM strike price
 * @param callKey - The ATM call option instrument key
 * @param putKey - The ATM put option instrument key
 */
export const setAtmDetails = (strike: number, callKey: string, putKey: string): void => {
  atmStrike = strike;
  atmCallKey = callKey;
  atmPutKey = putKey;
  console.log(`ATM details set for real-time calculation: Strike ${strike}`);
};

/**
 * Processes incoming feed data and calculates synthetic future.
 *
 * @param data - The decoded feed data from the WebSocket
 */
export const processFeedData = (data: FeedResponse): void => {
   console.log(`[DEBUG] processFeedData called with ${Object.keys(data.feeds || {}).length} instruments`);
   console.log(`[DEBUG] Raw data structure:`, JSON.stringify(data, null, 2));

   // Update the latest prices from the incoming feed
   for (const instrumentKey in data.feeds) {
     console.log(`[DEBUG] Processing instrument: ${instrumentKey}`);
     const feedData = data.feeds[instrumentKey];
     console.log(`[DEBUG] Feed data for ${instrumentKey}:`, JSON.stringify(feedData, null, 2));

     // Try LTP paths based on instrument type
     let ltp;

     // For indices (NSE_INDEX), use indexFF path
     if (instrumentKey.includes('NSE_INDEX')) {
       ltp = feedData?.fullFeed?.indexFF?.ltpc?.ltp;
       console.log(`[DEBUG] Index LTP path:`, ltp);
     } else {
       // For options (NSE_FO), use marketFF path
       ltp = feedData?.fullFeed?.marketFF?.ltpc?.ltp;
       console.log(`[DEBUG] Options LTP path:`, ltp);
     }

     if (!ltp) {
       // Final fallback
       ltp = feedData?.ltpc?.ltp;
       console.log(`[DEBUG] Fallback LTP path:`, ltp);
     }

     if (typeof ltp === 'number' && !isNaN(ltp)) {
       const oldPrice = latestPrices.get(instrumentKey);
       latestPrices.set(instrumentKey, ltp);
       console.log(`[DEBUG] Price updated: ${instrumentKey}: ${oldPrice} → ${ltp}`);
     } else {
       console.warn(`[DEBUG] Invalid LTP for ${instrumentKey}:`, ltp, `Type: ${typeof ltp}`);
     }
   }

  // --- Synthetic Future Calculation ---
  if (atmStrike && atmCallKey && atmPutKey) {
    const callLtp = latestPrices.get(atmCallKey);
    const putLtp = latestPrices.get(atmPutKey);

    if (typeof callLtp === 'number' && typeof putLtp === 'number') {
      const syntheticFuture = atmStrike + (callLtp - putLtp);
      // \r moves the cursor to the beginning of the line, creating a live update effect
      process.stdout.write(`\r📈 Synthetic Future: ${syntheticFuture.toFixed(2)} | Call: ${callLtp} | Put: ${putLtp}  `);
    }
  }
};