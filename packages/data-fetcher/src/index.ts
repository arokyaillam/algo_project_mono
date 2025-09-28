import { initProtobuf } from './services/decode.service';
import { connectAndSubscribe } from './services/websocket.service';
import { findAtmOptionKeys} from './services/instrument.service';
import { setAtmDetails } from './services/calculation.service';
import { getHistoricalCandles } from './services/historical.service'; // <-- புதிய சர்வீஸை import செய்யவும்




// --- Configuration ---
const accessToken = "eyJ0eXAiOiJKV1QiLCJrZXlfaWQiOiJza192MS4wIiwiYWxnIjoiSFMyNTYifQ.eyJzdWIiOiI3QkJSUkUiLCJqdGkiOiI2OGQ4YjAxMjZkZGZhZjZmNmEzZTNkNTIiLCJpc011bHRpQ2xpZW50IjpmYWxzZSwiaXNQbHVzUGxhbiI6dHJ1ZSwiaWF0IjoxNzU5MDMxMzE0LCJpc3MiOiJ1ZGFwaS1nYXRld2F5LXNlcnZpY2UiLCJleHAiOjE3NTkwOTY4MDB9.hiRMK-rSFBGPW1ole0kFQu2qI2E7NqPAFW2_vmx4ij4";
const expiryDate = '2025-09-30';

const instrumentsToWatch = ['NSE_INDEX|Nifty 50'];



/**
 * The main function to start the data fetcher service.
 */
const startDataFetcher = async () => {
  try {
    const niftyHistory = await getHistoricalCandles(
      accessToken,
      'NSE_INDEX|Nifty 50',
      'day', // தினசரி கேண்டில்கள்
      '2025-09-26',
      '2025-09-24'
    );

    if (niftyHistory && niftyHistory.length > 0) {
      const firstCandle = niftyHistory[0];
      if (firstCandle) {
        // முதல் கேண்டிலின் விவரங்களைக் காண்பிப்போம்
        console.log('Last available daily candle:', {
          date: firstCandle[0],
          open: firstCandle[1],
          high: firstCandle[2],
          low: firstCandle[3],
          close: firstCandle[4],
        });
      }
    }
    // A single call to find ATM strike and keys
    try {
      const atmKeys = await findAtmOptionKeys(accessToken, expiryDate);

      // If keys are found, add them to our watch list
      if (atmKeys) {
        instrumentsToWatch.push(atmKeys.atmCallKey);
        instrumentsToWatch.push(atmKeys.atmPutKey);
        setAtmDetails(atmKeys.atmStrike, atmKeys.atmCallKey, atmKeys.atmPutKey);
        console.log(`✅ ATM Keys found and configured`);
      } else {
        console.warn(`⚠️ ATM Keys not found, will use manual configuration if needed`);
      }
    } catch (error: any) {
      console.error(`❌ Error finding ATM keys:`, error?.message || error);
      console.log(`ℹ️ Continuing without ATM options - synthetic future will work when manually configured`);
    }
    
    // Initialize Protobuf and connect to WebSocket
    await initProtobuf();
    await connectAndSubscribe(accessToken, instrumentsToWatch);

  } catch (error) {
    console.error("❌ Fatal error starting the data fetcher:", error);
  }
};

// Start the service

startDataFetcher();

// Export all functions so the core-engine can use them later
export * from './services/upstoxAuth.service';
export * from './services/decode.service';
export * from './services/websocket.service';
export * from './services/instrument.service';
export * from './services/calculation.service';