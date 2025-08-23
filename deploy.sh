#!/bin/bash

# Crop Insurance Protocol Deployment Script
echo "🚀 Deploying Crop Insurance Protocol..."

# Check if required tools are installed
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

if ! command -v clarinet &> /dev/null; then
    echo "❌ Clarinet is not installed. Please install Clarinet first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install dependencies
echo "📦 Installing dependencies..."

echo "Installing weather service dependencies..."
cd weather-service
npm install
cd ..

echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo "✅ Dependencies installed"

# Create environment files
echo "🔧 Setting up environment files..."

if [ ! -f weather-service/.env ]; then
    echo "Creating weather service .env file..."
    cp weather-service/env.example weather-service/.env
    echo "⚠️  Please update weather-service/.env with your API keys"
fi

if [ ! -f frontend/.env ]; then
    echo "Creating frontend .env file..."
    cat > frontend/.env << EOF
REACT_APP_CONTRACT_ADDRESS=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
REACT_APP_WEATHER_SERVICE_URL=http://localhost:3001
EOF
fi

echo "✅ Environment files created"

# Deploy smart contract
echo "📄 Deploying smart contract..."
echo "⚠️  Please make sure you have Clarinet configured and are on the correct network"
echo "Run 'clarinet deploy' to deploy the contract"
echo "Update contract-address.txt with the deployed contract address"

# Start services
echo "🚀 Starting services..."

echo "Starting weather service..."
cd weather-service
npm start &
WEATHER_PID=$!
cd ..

echo "Starting frontend..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo "✅ Services started"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🌤️  Weather Service: http://localhost:3001"
echo ""
echo "📝 Next steps:"
echo "1. Update weather-service/.env with your weather API keys"
echo "2. Deploy the smart contract using 'clarinet deploy'"
echo "3. Update contract-address.txt with the deployed contract address"
echo "4. Connect your Stacks wallet to the frontend"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap "echo '🛑 Stopping services...'; kill $WEATHER_PID $FRONTEND_PID; exit" INT
wait
