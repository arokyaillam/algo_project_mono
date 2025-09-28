// packages/data-fetcher/src/services/instrument.service.ts

import axios from 'axios';

// Interfaces to match the exact JSON structure you received
interface MarketData {
  ltp: number;
}
interface OptionDetails {
  instrument_key: string;
  market_data: MarketData;
}
interface OptionChainItem {
  strike_price: number;
  call_options?: OptionDetails;
  put_options?: OptionDetails;
}

/**
 * Fetches the option chain and finds the ATM strike and its instrument keys.
 * This is based on the successful API response you provided.
 * @param accessToken The access token for authentication.
 * @param expiryDate The expiry date in 'YYYY-MM-DD' format.
 * @returns An object with the ATM strike and keys, or null on failure.
 */
export const findAtmOptionKeys = async (
  accessToken: string,
  expiryDate: string
): Promise<{ atmStrike: number; atmCallKey: string; atmPutKey: string } | null> => {
  try {
    console.log(`🔎 Fetching Nifty option chain for expiry ${expiryDate}...`);
    
    const headers = {
      'Accept': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    };
    
    const params = {
      instrument_key: 'NSE_INDEX|Nifty 50',
      expiry_date: expiryDate,
    };

    // Use the correct v2 option chain endpoint with query parameters
    const endpoint = 'https://api.upstox.com/v2/option/chain';

    console.log(`🔎 Fetching option chain from correct endpoint: ${endpoint}`);
    console.log(`[DEBUG] Query params: instrument_key=${params.instrument_key}, expiry_date=${params.expiry_date}`);

    const response = await axios.get(endpoint, { headers, params });

    if (!response) {
      throw new Error('No response received from any endpoint');
    }

    const optionChain: OptionChainItem[] = response.data.data;
    
    let minDifference = Infinity;
    let bestStrikeData: OptionChainItem | null = null;

    // Loop through each strike in the data array
    for (const strikeData of optionChain) {
      const callLtp = strikeData.call_options?.market_data?.ltp;
      const putLtp = strikeData.put_options?.market_data?.ltp;

      // Check if both call and put data exist for the strike
      if (typeof callLtp === 'number' && typeof putLtp === 'number') {
        const difference = Math.abs(callLtp - putLtp);
        if (difference < minDifference) {
          minDifference = difference;
          bestStrikeData = strikeData;
        }
      }
    }

    if (bestStrikeData && bestStrikeData.call_options && bestStrikeData.put_options) {
      console.log(`✅ ATM Strike Found: ${bestStrikeData.strike_price}`);
      return {
        atmStrike: bestStrikeData.strike_price,
        atmCallKey: bestStrikeData.call_options.instrument_key,
        atmPutKey: bestStrikeData.put_options.instrument_key
      };
    }

    console.warn('⚠️ Could not determine ATM strike and keys from the option chain.');
    return null;
  } catch (error) {
    if (axios.isAxiosError(error)) {
        console.error('❌ Error fetching option chain:', error.response?.data || error.message);
    } else {
        console.error('❌ An unexpected error occurred:', error);
    }
    return null;
  }
};