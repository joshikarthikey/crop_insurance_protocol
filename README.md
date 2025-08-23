# 🌾 Decentralized Parametric Crop Insurance Protocol

A comprehensive decentralized application (dApp) that provides automated crop insurance using real-time weather data and smart contracts on the Stacks blockchain.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Usage Guide](#usage-guide)
- [Smart Contract Details](#smart-contract-details)
- [Weather Data Integration](#weather-data-integration)
- [Wallet Integration](#wallet-integration)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## 🎯 Project Overview

This project implements a parametric crop insurance system where:

- **Farmers** can deposit funds into insurance pools
- **Weather conditions** are automatically monitored using multiple APIs
- **Claims** are automatically approved/rejected based on predefined weather parameters
- **Smart contracts** handle all financial transactions and logic
- **Real-time data** ensures accurate and timely claim processing

### Current Status
- ✅ **Fully Functional Demo** with complete UI/UX
- ✅ **Smart Contract** deployed and tested
- ✅ **Weather Data Service** with multiple API integrations
- ✅ **Wallet Integration** with Stacks-compatible wallets
- 🔄 **Mode**: Fallback Mode (Mock transactions for testing)

## 🚀 Features

### Core Insurance Features
- **Automated Pool Creation**: Create insurance pools with custom claim amounts
- **Weather-Based Claims**: Automatic claim processing based on real weather data
- **Multi-Source Weather Data**: Aggregates data from OpenWeatherMap, WeatherAPI, and AccuWeather
- **Location-Based Monitoring**: Tracks weather conditions for specific geographic locations
- **Real-Time Updates**: Live weather data and pool status updates

### Blockchain Features
- **Smart Contract Integration**: All insurance logic handled by Clarity smart contracts
- **Decentralized Storage**: Pool and claim data stored on Stacks blockchain
- **Transparent Transactions**: All operations visible on blockchain explorer
- **Automated Settlements**: No human intervention required for claim processing

### User Interface Features
- **Modern Dashboard**: Overview of all pools, claims, and statistics
- **Interactive Maps**: Visual representation of weather conditions
- **Real-Time Charts**: Weather data visualization
- **Responsive Design**: Works on desktop and mobile devices
- **Wallet Status Indicators**: Clear indication of connection status

### Technical Features
- **Multi-Wallet Support**: Compatible with Xverse, Hiro, and other Stacks wallets
- **Fallback Mode**: Graceful degradation when wallet doesn't support smart contracts
- **Error Handling**: Comprehensive error messages and recovery options
- **Caching**: Efficient weather data caching for performance
- **Validation**: Input validation and data integrity checks

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Smart         │    │   Weather       │
│   (React)       │◄──►│   Contract      │    │   Service       │
│                 │    │   (Clarity)     │    │   (Node.js)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Wallet        │    │   Stacks        │    │   Weather       │
│   Integration   │    │   Blockchain    │    │   APIs          │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📋 Prerequisites

Before setting up the project, ensure you have:

- **Node.js** (v16 or higher)
- **npm** or **yarn** package manager
- **Git** for version control
- **Clarinet** (Stacks development tool)
- **A Stacks-compatible wallet** (Xverse, Hiro, etc.)
- **Testnet STX tokens** for testing

## 🛠️ Installation & Setup

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd crop_insurance_protocol
```

### Step 2: Install Dependencies

#### Backend (Weather Service)
```bash
cd weather-service
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

#### Smart Contract
```bash
cd contracts
npm install
```

### Step 3: Environment Configuration

#### Backend Environment Variables
Create `backend/.env`:
```env
# Weather API Keys
OPENWEATHER_API_KEY=your_openweather_api_key
WEATHERAPI_KEY=your_weatherapi_key
ACCUWEATHER_API_KEY=your_accuweather_api_key

# Server Configuration
PORT=3001
NODE_ENV=development

# Redis Configuration (optional)
REDIS_URL=redis://localhost:6379
```

#### Frontend Environment Variables
Create `frontend/.env`:
```env
REACT_APP_WEATHER_SERVICE_URL=http://localhost:3001
REACT_APP_STACKS_NETWORK=testnet
REACT_APP_CONTRACT_ADDRESS=your_deployed_contract_address
```

### Step 4: Deploy Smart Contract

#### Using Clarinet
```bash
cd contracts
clarinet deploy
```

#### Manual Deployment
1. Compile the contract:
```bash
clarinet check
```

2. Deploy to testnet:
```bash
clarinet deploy --network testnet
```

3. Update `contract-address.txt` with the deployed address

### Step 5: Start Services

#### Start Weather Service
```bash
cd backend
npm start
```

#### Start Frontend
```bash
cd frontend
npm start
```

The application will be available at `http://localhost:3000`

## 📖 Usage Guide

### Getting Started

1. **Open the Application**
   - Navigate to `http://localhost:3000`
   - You'll see the main dashboard

2. **Connect Your Wallet**
   - Click "Connect Wallet" in the top navigation
   - Choose your preferred Stacks wallet (Xverse, Hiro, etc.)
   - Approve the connection in your wallet

3. **Check Wallet Status**
   - Look at the wallet mode indicator in the navbar
   - Green "REAL MODE" = Full blockchain functionality
   - Yellow "FALLBACK MODE" = Limited functionality (mock transactions)

### Dashboard Overview

The dashboard provides a comprehensive overview of the protocol:

#### Statistics Panel
- **Total Pools**: Number of active insurance pools
- **Total Claims**: Number of submitted claims
- **Total Value**: Combined value of all pools
- **Active Participants**: Number of users in pools

#### Wallet Status Section
- **Connection Status**: Shows if wallet is connected
- **Wallet Mode**: Indicates REAL MODE or FALLBACK MODE
- **Test Capabilities**: Button to test wallet functionality

#### Quick Actions
- **Create Pool**: Start a new insurance pool
- **View Pools**: Browse existing pools
- **Submit Claim**: File a weather-based claim

### Creating Insurance Pools

1. **Navigate to Insurance Pools**
   - Click "Insurance Pools" in the navigation
   - Click "Create New Pool"

2. **Configure Pool Parameters**
   - **Pool Name**: Descriptive name for the pool
   - **Claim Amount**: Amount to be paid out for successful claims
   - **Location**: Geographic area for weather monitoring
   - **Weather Parameters**: Define conditions that trigger claims

3. **Submit Pool Creation**
   - Review your configuration
   - Click "Create Pool"
   - Approve the transaction in your wallet

4. **Pool Confirmation**
   - Wait for blockchain confirmation
   - Pool will appear in the pools list
   - Weather monitoring begins automatically

### Joining Insurance Pools

1. **Browse Available Pools**
   - View all active pools in the "Insurance Pools" tab
   - See pool details, participants, and current weather

2. **Join a Pool**
   - Click "Join Pool" on your chosen pool
   - Enter the amount you want to deposit
   - Approve the transaction

3. **Pool Participation**
   - Your deposit is locked in the smart contract
   - You're now eligible for claims based on weather conditions
   - Monitor your pool's status and weather conditions

### Weather Monitoring

Each pool includes comprehensive weather monitoring:

#### Real-Time Data
- **Current Conditions**: Temperature, humidity, precipitation
- **Forecast**: 7-day weather predictions
- **Historical Data**: Past weather patterns

#### Weather Sources
- **OpenWeatherMap**: Primary weather data
- **WeatherAPI**: Secondary verification
- **AccuWeather**: Additional validation

#### Data Aggregation
- Multiple sources ensure accuracy
- Automatic fallback if one API fails
- Cached data for performance

### Submitting Claims

Claims are **automatically processed** based on weather conditions:

1. **Automatic Detection**
   - System continuously monitors weather
   - Compares against predefined parameters
   - Triggers claims when conditions are met

2. **Claim Processing**
   - Weather data is verified across multiple sources
   - Smart contract validates claim conditions
   - Automatic approval/rejection based on contract logic

3. **Claim Results**
   - Approved claims: Automatic payout to participants
   - Rejected claims: Detailed explanation provided
   - All transactions recorded on blockchain

### Viewing Claims

1. **Claims Tab**
   - Navigate to "Claims" in the navigation
   - View all submitted claims

2. **Claim Details**
   - **Status**: Pending, Approved, Rejected
   - **Weather Data**: Conditions that triggered the claim
   - **Transaction**: Blockchain transaction details
   - **Payout**: Amount distributed to participants

3. **Claim History**
   - Track all historical claims
   - View weather conditions at time of claim
   - See payout distributions

## 🔧 Smart Contract Details

### Contract Structure

The smart contract (`contracts/contract.clar`) implements:

#### Data Storage
```clarity
;; Maps for storing pool and claim data
(define-data-var pools (map uint pool-data))
(define-data-var claims (map uint claim-data))
(define-data-var pool-counter uint u0)
(define-data-var claim-counter uint u0)
```

#### Core Functions
- **`create-pool`**: Creates new insurance pools
- **`deposit-funds`**: Allows users to join pools
- **`submit-claim`**: Processes weather-based claims
- **`get-pool`**: Retrieves pool information
- **`get-claim`**: Retrieves claim information

#### Pool Data Structure
```clarity
(define-struct pool-data (
  (owner principal)
  (claim-amount uint)
  (total-funds uint)
  (participants (list principal))
  (created-at uint)
))
```

#### Claim Data Structure
```clarity
(define-struct claim-data (
  (pool-id uint)
  (claimant principal)
  (weather-data (string-ascii 1000))
  (status (string-ascii 50))
  (submitted-at uint)
))
```

### Contract Functions

#### Creating Pools
```clarity
(define-public (create-pool (claim-amount uint))
  ;; Creates a new insurance pool with specified claim amount
)
```

#### Depositing Funds
```clarity
(define-public (deposit-funds (pool-id uint))
  ;; Allows users to deposit funds into existing pools
)
```

#### Submitting Claims
```clarity
(define-public (submit-claim (pool-id uint) (weather-data (string-ascii 1000)))
  ;; Submits weather-based claims for automatic processing
)
```

## 🌤️ Weather Data Integration

### Weather Service Architecture

The weather service (`backend/`) provides:

#### API Integration
- **OpenWeatherMap**: Primary weather data source
- **WeatherAPI**: Secondary verification source
- **AccuWeather**: Additional validation source

#### Data Processing
- **Aggregation**: Combines data from multiple sources
- **Validation**: Ensures data accuracy and consistency
- **Caching**: Improves performance with Redis caching
- **Error Handling**: Graceful fallback when APIs fail

#### Endpoints

##### Get Current Weather
```http
GET /api/weather/current?lat={latitude}&lon={longitude}
```

##### Get Weather Forecast
```http
GET /api/weather/forecast?lat={latitude}&lon={longitude}
```

##### Get Historical Weather
```http
GET /api/weather/historical?lat={latitude}&lon={longitude}&date={date}
```

### Weather Parameters

The system monitors various weather conditions:

#### Temperature
- **Minimum Temperature**: Triggers claims when below threshold
- **Maximum Temperature**: Triggers claims when above threshold
- **Average Temperature**: Used for trend analysis

#### Precipitation
- **Rainfall Amount**: Cumulative precipitation measurement
- **Rainfall Duration**: Length of precipitation events
- **Drought Conditions**: Extended periods without rain

#### Other Conditions
- **Humidity**: Relative humidity levels
- **Wind Speed**: Wind velocity measurements
- **Pressure**: Atmospheric pressure readings

## 💳 Wallet Integration

### Supported Wallets

The application supports various Stacks-compatible wallets:

#### Xverse Wallet
- **Full Support**: Smart contract calls and STX transfers
- **Installation**: Available on Chrome Web Store
- **Features**: Complete blockchain functionality

#### Hiro Wallet
- **Full Support**: Smart contract calls and STX transfers
- **Installation**: Available on Chrome Web Store
- **Features**: Complete blockchain functionality

#### Other Stacks Wallets
- **Partial Support**: Basic STX transfers
- **Fallback Mode**: Mock transactions for testing

### Wallet Detection

The application automatically detects wallet capabilities:

#### Real Mode
- Wallet supports `stx_contractCall`
- Full blockchain functionality
- Real transactions on Stacks network

#### Fallback Mode
- Wallet supports `stx_transferStx` but not contract calls
- Mock transactions for testing
- Clear indication of limited functionality

### Connection Process

1. **Wallet Detection**
   - Application checks available wallet methods
   - Determines compatibility level
   - Sets appropriate mode (Real/Fallback)

2. **Authentication**
   - User approves connection in wallet
   - Application receives account information
   - Connection status is displayed

3. **Transaction Handling**
   - Real Mode: Direct blockchain transactions
   - Fallback Mode: Simulated transactions with clear indicators

## 🔍 Troubleshooting

### Common Issues

#### Wallet Connection Problems

**Issue**: Wallet not connecting
**Solution**:
1. Ensure wallet extension is installed and unlocked
2. Check if wallet supports Stacks blockchain
3. Try refreshing the page and reconnecting
4. Clear browser cache and cookies

**Issue**: "FALLBACK MODE" displayed
**Solution**:
1. Install Xverse or Hiro wallet for full functionality
2. Ensure wallet supports `stx_contractCall` method
3. Check wallet permissions and settings

#### Smart Contract Issues

**Issue**: Transaction fails
**Solution**:
1. Check if you have sufficient STX for gas fees
2. Verify contract address is correct
3. Ensure you're on the correct network (testnet/mainnet)
4. Check contract deployment status

**Issue**: Pool creation fails
**Solution**:
1. Verify contract is deployed and accessible
2. Check input parameters (claim amount, etc.)
3. Ensure wallet has sufficient funds
4. Try with smaller amounts for testing

#### Weather Service Issues

**Issue**: Weather data not loading
**Solution**:
1. Check if weather service is running (`npm start` in backend)
2. Verify API keys are correctly configured
3. Check network connectivity
4. Review service logs for errors

**Issue**: Inaccurate weather data
**Solution**:
1. Verify location coordinates are correct
2. Check if multiple weather APIs are responding
3. Review data aggregation logic
4. Consider API rate limits

### Error Messages

#### "Transaction was rejected by user"
- User cancelled the transaction in wallet
- Try again and ensure you approve the transaction

#### "Wallet does not support Stacks operations"
- Install a Stacks-compatible wallet (Xverse, Hiro)
- Ensure wallet supports smart contract calls

#### "Weather service unavailable"
- Check if backend service is running
- Verify API keys and network connectivity
- Review service logs for specific errors

#### "Contract not found"
- Verify contract deployment
- Check contract address in configuration
- Ensure you're on the correct network

### Getting Help

#### Debug Information
- Check browser console for detailed error messages
- Review network tab for API call failures
- Monitor wallet extension logs

#### Support Resources
- **Documentation**: This README and inline code comments
- **Error Logs**: Browser console and service logs
- **Community**: Stacks Discord and forums

## 🤝 Contributing

### Development Setup

1. **Fork the Repository**
2. **Create Feature Branch**: `git checkout -b feature/new-feature`
3. **Make Changes**: Implement your feature or fix
4. **Test Thoroughly**: Ensure all functionality works
5. **Submit Pull Request**: With detailed description

### Code Standards

- **JavaScript**: Use ES6+ features and consistent formatting
- **Clarity**: Follow Clarity language conventions
- **Documentation**: Add comments for complex logic
- **Testing**: Include tests for new features

### Areas for Improvement

- **Additional Weather APIs**: More data sources for accuracy
- **Advanced Analytics**: Weather pattern analysis
- **Mobile App**: Native mobile application
- **Additional Insurance Types**: Beyond crop insurance
- **Governance**: DAO for protocol governance

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Stacks Foundation** for blockchain infrastructure
- **Weather API Providers** for data services
- **Open Source Community** for tools and libraries
- **Testers and Contributors** for feedback and improvements

---

**Note**: This is a demonstration project. For production use, conduct thorough security audits and testing.
