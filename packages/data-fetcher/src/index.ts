// packages/data-fetcher/src/index.ts

import { initProtobuf } from './services/decode.service';
import { connectAndSubscribe } from './services/websocket.service';

// --- Configuration ---
const accessToken = "eyJ0eXAiOiJKV1QiLCJrZXlfaWQiOiJza192MS4wIiwiYWxnIjoiSFMyNTYifQ.eyJzdWIiOiI3QkJSUkUiLCJqdGkiOiI2OGQ3N2VhZTcyOGJjMjdkMmFjY2I1MTgiLCJpc011bHRpQ2xpZW50IjpmYWxzZSwiaXNQbHVzUGxhbiI6dHJ1ZSwiaWF0IjoxNzU4OTUzMTM0LCJpc3MiOiJ1ZGFwaS1nYXRld2F5LXNlcnZpY2UiLCJleHAiOjE3NTkwMTA0MDB9.XQfZQP9z5tsa8uWdyvhSFSpZGBBBvoWMQ78qyeSLXhY"; // IMPORTANT: Replace with your actual token
const instrumentsToWatch = ["NSE_INDEX|Nifty 50", "NSE_INDEX|Nifty Bank"];

/**
 * The main function to start the data fetcher service.
 */
const startDataFetcher = async () => {
  try {
    // Step 1: Load the protobuf schema first. This is essential.
    await initProtobuf();

    // Step 2: Connect to the WebSocket and subscribe to instruments.
    await connectAndSubscribe(accessToken, instrumentsToWatch);

  } catch (error) {
    console.error("❌ Fatal error starting the data fetcher:", error);
  }
};

// Start the service
startDataFetcher();

// We also export our functions so the core-engine can use them later.
export * from './services/upstoxAuth.services';
export * from './services/decode.service';
export * from './services/websocket.service';