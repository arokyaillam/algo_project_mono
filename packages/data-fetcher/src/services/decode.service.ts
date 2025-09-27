// packages/data-fetcher/src/services/decode.service.ts

import protobuf from 'protobufjs';
import path from 'path';

// Protobuf schema-வை ஒருமுறை load செய்த பிறகு, அதை இங்கே சேமிப்போம்.
let protobufRoot: protobuf.Root | null = null;

/**
 * Loads the .proto file and initializes the protobuf schema.
 * This must be called once when the application starts.
 */
export const initProtobuf = async (): Promise<void> => {
  try {
    const protoFilePath = path.resolve(__dirname, '../../MarketDataFeedV3.proto');
    protobufRoot = await protobuf.load(protoFilePath);
    console.log('✅ Protobuf schema loaded successfully.');
  } catch (error) {
    console.error('❌ Failed to load Protobuf schema:', error);
    throw new Error('Could not initialize Protobuf.');
  }
};

/**
 * Decodes a protobuf buffer into a JSON object.
 * @param buffer The binary buffer received from the WebSocket.
 * @returns The decoded message as a JSON object.
 */
export const decodeProtobuf = (buffer: Buffer): any => {
  if (!protobufRoot) {
    // This is a critical error, the app should not continue if this happens.
    console.error('FATAL: Protobuf schema is not initialized. Call initProtobuf() first.');
    return null;
  }

  try {
    // Look up the specific message type from the loaded schema
    const FeedResponse = protobufRoot.lookupType(
      "com.upstox.marketdatafeederv3udapi.rpc.proto.FeedResponse"
    );
    
    // Decode the buffer using the message type
    const decodedMessage = FeedResponse.decode(buffer);
    
    // Convert the decoded message to a plain JavaScript object
    return FeedResponse.toObject(decodedMessage);

  } catch (error) {
    console.error('❌ Error decoding protobuf message:', error);
    return null;
  }
};