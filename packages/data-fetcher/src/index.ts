import 'dotenv/config';
import { initProtobuf } from './services/decode.service';
import { connectAndSubscribe } from './services/websocket.service';
import { findAtmOptionKeys} from './services/instrument.service';
import { setAtmDetails } from './services/calculation.service';
import { getHistoricalCandles } from './services/historical.service';
import { config } from './config';



/**
 * The main function to start the data fetcher service.
 */
const startDataFetcher = async (): Promise<void> => {
  try {
    // Get historical candles for analysis
    const niftyHistory = await getHistoricalCandles(
      config.upstox.accessToken,
      'NSE_INDEX|Nifty 50',
      'day', // Daily candles
      '2025-09-26',
      '2025-09-24'
    );

    if (niftyHistory && niftyHistory.length > 0) {
      const firstCandle = niftyHistory[0];
      if (firstCandle) {
        // Display the first candle details
        console.log('Last available daily candle:', {
          date: firstCandle[0],
          open: firstCandle[1],
          high: firstCandle[2],
          low: firstCandle[3],
          close: firstCandle[4],
        });
      }
    }

    // Initialize instruments to watch with default values
    const instrumentsToWatch = [...config.trading.defaultInstruments];

    // Find ATM strike and keys
    try {
      const atmKeys = await findAtmOptionKeys(
        config.upstox.accessToken,
        config.trading.defaultExpiryDate
      );

      // If keys are found, add them to our watch list
      if (atmKeys) {
        instrumentsToWatch.push(atmKeys.atmCallKey);
        instrumentsToWatch.push(atmKeys.atmPutKey);
        setAtmDetails(atmKeys.atmStrike, atmKeys.atmCallKey, atmKeys.atmPutKey);
        console.log('✅ ATM Keys found and configured');
      } else {
        console.warn('⚠️ ATM Keys not found, will use manual configuration if needed');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ Error finding ATM keys:', errorMessage);
      console.log('ℹ️ Continuing without ATM options - synthetic future will work when manually configured');
    }

    // Initialize Protobuf and connect to WebSocket
    await initProtobuf();
    await connectAndSubscribe(config.upstox.accessToken, instrumentsToWatch);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Fatal error starting the data fetcher:', errorMessage);
    process.exit(1);
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