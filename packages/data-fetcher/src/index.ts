import { initProtobuf } from './services/decode.service';
import { connectAndSubscribe } from './services/websocket.service';
import { findAtmOptionKeys} from './services/instrument.service';

// --- Configuration ---
const accessToken = "eyJ0eXAiOiJKV1QiLCJrZXlfaWQiOiJza192MS4wIiwiYWxnIjoiSFMyNTYifQ.eyJzdWIiOiI3QkJSUkUiLCJqdGkiOiI2OGQ3Y2MyMjcyOGJjMjdkMmFjY2I2YzgiLCJpc011bHRpQ2xpZW50IjpmYWxzZSwiaXNQbHVzUGxhbiI6dHJ1ZSwiaWF0IjoxNzU4OTcyOTYyLCJpc3MiOiJ1ZGFwaS1nYXRld2F5LXNlcnZpY2UiLCJleHAiOjE3NTkwMTA0MDB9.AJLAOv8RUrn59BaGql3anRZsCmrVp65vocFbew0QD3I";
const expiryDate = '2025-09-30';

const instrumentsToWatch = ['NSE_INDEX|Nifty 50'];

/**
 * The main function to start the data fetcher service.
 */
const startDataFetcher = async () => {
  try {
    // A single call to find ATM strike and keys
    const atmKeys = await findAtmOptionKeys(accessToken, expiryDate);

    // If keys are found, add them to our watch list
    if (atmKeys) {
      instrumentsToWatch.push(atmKeys.atmCallKey);
      instrumentsToWatch.push(atmKeys.atmPutKey);
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