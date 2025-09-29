// packages/data-fetcher/src/services/decode.service.ts

import protobuf from 'protobufjs';
import path from 'path';
import { FeedResponse } from '../types';

/**
 * Protobuf root instance - cached after initial load
 */
let protobufRoot: protobuf.Root | null = null;

/**
 * Loads the .proto file and initializes the protobuf schema.
 * This must be called once when the application starts.
 *
 * @throws {Error} If the protobuf schema cannot be loaded
 */
export const initProtobuf = async (): Promise<void> => {
  try {
    const protoFilePath = path.resolve(__dirname, '../../MarketDataFeedV3.proto');
    protobufRoot = await protobuf.load(protoFilePath);
    console.log('✅ Protobuf schema loaded successfully.');
  } catch (error) {
    console.error('❌ Failed to load Protobuf schema:', error);
    throw new Error('Could not initialize Protobuf schema. Please check the .proto file path.');
  }
};

/**
 * Decodes a protobuf buffer into a structured object.
 *
 * @param buffer - The binary buffer received from the WebSocket
 * @returns The decoded message as a structured object or null if decoding fails
 */
export const decodeProtobuf = (buffer: Buffer): FeedResponse | null => {
  if (!protobufRoot) {
    console.error('FATAL: Protobuf schema is not initialized. Call initProtobuf() first.');
    return null;
  }

  try {
    // Look up the specific message type from the loaded schema
    const FeedResponseType = protobufRoot.lookupType(
      "com.upstox.marketdatafeederv3udapi.rpc.proto.FeedResponse"
    );

    // Decode the buffer using the message type
    const decodedMessage = FeedResponseType.decode(buffer);

    // Convert the decoded message to a plain JavaScript object
    return FeedResponseType.toObject(decodedMessage) as FeedResponse;

  } catch (error) {
    console.error('❌ Error decoding protobuf message:', error);
    return null;
  }
};