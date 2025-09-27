// packages/data-fetcher/src/services/upstoxAuth.service.ts

import axios from 'axios';

export const getMarketFeedUrl = async (accessToken: string): Promise<string> => {
  try {
    const headers = {
      'Accept': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    };

    const response = await axios.get(
      'https://api.upstox.com/v3/feed/market-data-feed/authorize',
      { headers }
    );

    return response.data.data.authorizedRedirectUri;

  } catch (error) {
    // Use the built-in Axios type guard
    if (axios.isAxiosError(error)) {
      // Inside this block, TypeScript knows `error` is a safe AxiosError.
      // No more "unknown" errors and no need for @ts-expect-error!
      console.error('❌ Axios Error:', error.response?.data || error.message);
    } else if (error instanceof Error) {
      // Handle other standard JavaScript errors
      console.error('❌ General Error:', error.message);
    } else {
      // Handle any other strange cases
      console.error('❌ Unexpected Error:', error);
    }
    
    // We re-throw a consistent error message for the calling function
    throw new Error('Failed to authorize Upstox market feed.');
  }
};