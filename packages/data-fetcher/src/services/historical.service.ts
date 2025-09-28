// packages/data-fetcher/src/services/historical.service.ts

import axios from 'axios';

// API-இலிருந்து வரும் டேட்டாவிற்கான TypeScript வகை
// [timestamp, open, high, low, close, volume, openInterest]
type OHLCCandle = [string, number, number, number, number, number, number];

/**
 * Fetches historical OHLC candle data for a given instrument.
 * @param accessToken The access token for authentication.
 * @param instrumentKey The key of the instrument (e.g., 'NSE_INDEX|Nifty 50').
 * @param interval The timeframe for the candles (e.g., '1minute', '30minute', 'day').
 * @param toDate The end date in 'YYYY-MM-DD' format.
 * @param fromDate The start date in 'YYYY-MM-DD' format.
 * @returns An array of OHLC candles, or null on failure.
 */
export const getHistoricalCandles = async (
  accessToken: string,
  instrumentKey: string,
  interval: '1minute' | '5minute' | '30minute' | 'day' | 'week' | 'month',
  toDate: string,
  fromDate: string
): Promise<OHLCCandle[] | null> => {
  try {
    console.log(`📊 Fetching historical data for ${instrumentKey} from ${fromDate} to ${toDate}...`);

    // Parse interval to extract unit and numeric interval
    let unit: string;
    let numericInterval: string;

    if (interval === 'day') {
      unit = 'days';
      numericInterval = '1';
    } else if (interval === 'week') {
      unit = 'weeks';
      numericInterval = '1';
    } else if (interval === 'month') {
      unit = 'months';
      numericInterval = '1';
    } else {
      // Handle minute intervals like '1minute', '5minute', '30minute'
      unit = 'minutes';
      numericInterval = interval.replace('minute', '');
    }

    console.log(`[DEBUG] Parsed interval: ${interval} → unit: ${unit}, interval: ${numericInterval}`);

    const headers = {
      'Accept': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    };

    // API URL structure: /instrumentKey/unit/interval/toDate/fromDate
    const url = `https://api.upstox.com/v3/historical-candle/${instrumentKey}/${unit}/${numericInterval}/${toDate}/${fromDate}`;

    console.log(`[DEBUG] API URL: ${url}`);
    const response = await axios.get(url, { headers });

    const candles: OHLCCandle[] = response.data.data.candles;
    console.log(`✅ Successfully fetched ${candles.length} candles.`);
    return candles;

  } catch (error) {
    console.error('[DEBUG] Historical API error details:', {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });

    if (axios.isAxiosError(error)) {
        console.error('❌ Error fetching historical data:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers
        });
    } else {
        console.error('❌ An unexpected error occurred:', error);
    }
    return null;
  }
};