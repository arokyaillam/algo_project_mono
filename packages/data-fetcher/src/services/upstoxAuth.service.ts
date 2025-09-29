// packages/data-fetcher/src/services/upstoxAuth.service.ts

import axios, { AxiosError } from 'axios';
import { UpstoxAuthResponse, UpstoxError } from '../types';

/**
 * Retrieves the WebSocket market feed URL from Upstox API.
 *
 * @param accessToken - Valid Upstox access token
 * @returns Promise resolving to the authorized WebSocket URL
 * @throws {Error} If authorization fails or API returns an error
 */
export const getMarketFeedUrl = async (accessToken: string): Promise<string> => {
  // Input validation
  if (!accessToken || typeof accessToken !== 'string' || accessToken.length < 10) {
    throw new Error('Invalid access token provided');
  }

  try {
    const headers = {
      'Accept': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    };

    const response = await axios.get<UpstoxAuthResponse>(
      'https://api.upstox.com/v3/feed/market-data-feed/authorize',
      { headers }
    );

    if (!response.data?.data?.authorizedRedirectUri) {
      throw new Error('Invalid response from Upstox API: missing authorizedRedirectUri');
    }

    return response.data.data.authorizedRedirectUri;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<UpstoxError>;
      const errorMessage = axiosError.response?.data?.message ||
                          axiosError.response?.data ||
                          axiosError.message ||
                          'Unknown API error';

      console.error('❌ Upstox API Error:', {
        status: axiosError.response?.status,
        message: errorMessage,
        url: axiosError.config?.url
      });

      throw new Error(`Upstox API authorization failed: ${errorMessage}`);
    } else if (error instanceof Error) {
      console.error('❌ Authorization Error:', error.message);
      throw error;
    } else {
      console.error('❌ Unexpected Error during authorization:', error);
      throw new Error('Unexpected error occurred during Upstox authorization');
    }
  }
};