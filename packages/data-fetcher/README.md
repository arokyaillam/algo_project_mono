# Data Fetcher Package

A robust TypeScript package for fetching real-time market data from Upstox WebSocket API with comprehensive error handling, retry mechanisms, and configuration management.

## Features

- 🔒 **Secure Configuration**: Environment-based configuration with no hardcoded credentials
- 🔄 **Retry Logic**: Automatic reconnection with exponential backoff
- 📝 **TypeScript Support**: Full type safety with comprehensive interfaces
- ⚡ **Performance Optimized**: Efficient WebSocket connection management
- 🛡️ **Input Validation**: Robust validation for all inputs and configurations
- 📊 **Real-time Data**: Live market data streaming with protobuf decoding

## Installation

```bash
pnpm install
```

## Configuration

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Configure your environment variables in `.env`:

```env
# Required: Your Upstox access token
UPSTOX_ACCESS_TOKEN=your_access_token_here

# Optional: API version (defaults to 3.0)
UPSTOX_API_VERSION=3.0

# Optional: Default expiry date for options (defaults to 2025-09-30)
DEFAULT_EXPIRY_DATE=2025-09-30

# Optional: Default instruments to watch (defaults to Nifty 50)
DEFAULT_INSTRUMENTS=NSE_INDEX|Nifty 50

# Optional: WebSocket reconnection settings
WS_RECONNECT_ATTEMPTS=3
WS_RECONNECT_DELAY=5000
```

## Usage

```typescript
import { startDataFetcher } from '@repo/data-fetcher';

// Start the data fetcher service
await startDataFetcher();
```

## API Reference

### Services

#### WebSocket Service
- `connectAndSubscribe(accessToken, instrumentKeys)`: Establishes WebSocket connection
- `disconnect()`: Closes WebSocket connection

#### Authentication Service
- `getMarketFeedUrl(accessToken)`: Gets WebSocket URL from Upstox API

#### Decode Service
- `initProtobuf()`: Initializes protobuf schema
- `decodeProtobuf(buffer)`: Decodes binary WebSocket data

### Types

All TypeScript interfaces are available in `src/types/index.ts`:

```typescript
import {
  FeedResponse,
  HistoricalCandle,
  ATMKeys,
  SubscriptionMessage
} from '@repo/data-fetcher/types';
```

## Development

### Scripts

```bash
# Start development server
pnpm dev

# Build the package
pnpm build

# Run linting
pnpm lint
```

### Project Structure

```
src/
├── config/          # Configuration management
├── types/           # TypeScript type definitions
├── services/        # Core business logic services
│   ├── upstoxAuth.service.ts
│   ├── websocket.service.ts
│   ├── decode.service.ts
│   ├── instrument.service.ts
│   ├── calculation.service.ts
│   └── historical.service.ts
└── index.ts         # Main entry point
```

## Security Features

- ✅ No hardcoded credentials
- ✅ Environment variable validation
- ✅ Input sanitization and validation
- ✅ Secure error handling without information leakage

## Error Handling

The package includes comprehensive error handling:

- **Connection Errors**: Automatic retry with exponential backoff
- **Authentication Errors**: Clear error messages with troubleshooting hints
- **Validation Errors**: Detailed validation feedback
- **Network Errors**: Graceful degradation and recovery

## Performance Optimizations

- **Connection Reuse**: Singleton WebSocket connection management
- **Efficient Decoding**: Optimized protobuf message processing
- **Memory Management**: Proper cleanup of resources
- **Rate Limiting**: Configurable retry delays to prevent API overload

## Contributing

1. Follow TypeScript strict mode guidelines
2. Add tests for new features
3. Update documentation for API changes
4. Ensure all environment variables are documented

## License

This package is part of the monorepo and follows the project's license terms.