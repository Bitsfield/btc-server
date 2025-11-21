# Ekoinx Bitcoin Server

A Bitcoin server application for processing Bitcoin transactions with HD wallet support.

## Features

- Express.js REST API
- Bitcoin transaction processing
- HD wallet address generation
- Async/await based architecture (migrated from callbacks)
- Comprehensive unit tests
- Token-based authentication
- MySQL database with Sequelize ORM

## Requirements

- Node.js 8.5.0 or higher
- MySQL database
- npm or yarn

## Installation

1. Clone the repository
```bash
git clone git://bitbucket.org/ekoinx/ekoin-btc-server
cd ekoin-btc-server
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Configure database connection in `configs/database.js`

5. Start the server
```bash
PORT=3000 npm start
```

## API Endpoints

### GET /
Homepage endpoint
```bash
curl http://localhost:3000/
```

### GET /status
Check server status
```bash
curl http://localhost:3000/status
```

### GET /token/:value/:addy/:userId/:email
Generate authentication token
```bash
curl http://localhost:3000/token/100/test-address/user123/test@test.com
```

### GET /addy/active
Get active addresses
```bash
curl http://localhost:3000/addy/active
```

### POST /transaction
Submit a transaction
```bash
curl -X POST http://localhost:3000/transaction \
  -H "Content-Type: application/json" \
  -H "Authorization: EKOINX <your-token>" \
  -d '{
    "value": 100,
    "addy": "recipient-address",
    "userId": "user123",
    "email": "user@example.com"
  }'
```

### GET /test
Test dispatcher functionality
```bash
curl http://localhost:3000/test
```

## Running Tests

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

View test coverage:
```bash
npm test
# Coverage report will be in coverage/ directory
```

## Architecture

### Modules

- **app.js** - Express application and API endpoints
- **modules/utils.js** - Utility functions for validation, responses, and encryption
- **modules/crypt.js** - Encryption/decryption functions
- **modules/processor.js** - Request processing logic
- **modules/dispatcher.js** - Transaction dispatching and processing
- **modules/database.js** - Database operations (async/await)
- **modules/btc-utils.js** - Bitcoin utilities and address generation
- **modules/btc-processor.js** - Bitcoin transaction processing

### Models

- **Wallet** - Wallet information
- **Addy** - Bitcoin addresses
- **Req** - Transaction requests
- **Tran** - Completed transactions

## Migration to Async/Await

This application has been refactored from callback-based functions to async/await for better code readability and error handling. All major modules now use async/await:

- ✅ btc-utils.js
- ✅ dispatcher.js  
- ✅ processor.js
- ✅ database.js
- ✅ app.js endpoints

## Testing

The application includes comprehensive unit tests covering:

- ✅ Utils module (validation, responses, token generation)
- ✅ Crypt module (encryption/decryption)
- ✅ Database operations
- ✅ Processor module
- ✅ Dispatcher module
- ✅ BTC Utils module
- ✅ API endpoints

Test coverage includes:
- Happy path scenarios
- Error handling
- Edge cases
- Async/await error propagation

## Security

- Helmet.js for security headers
- Token-based authentication
- AES-256-CBC encryption
- Request validation
- IP address tracking

## Database Schema

### addresses
- Stores HD wallet addresses
- Tracks balance, spent status, and active addresses

### requests
- Stores incoming transaction requests
- Tracks status (PENDING, PUSHED)

### transactions
- Stores completed transactions
- Includes transaction hash and hex data

### wallets
- Stores wallet information
- HD wallet support with xpub/xpriv

## License

ISC

## Author

Okezie Arukwe

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

