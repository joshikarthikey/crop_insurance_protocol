# Smart Contract Deployment Guide

## 🚀 **Deploy Your Crop Insurance Smart Contract**

Your **Parametric Crop Insurance Protocol** is ready for deployment! Here's how to deploy the smart contract to Stacks testnet.

### **📋 Prerequisites**

1. **Install Clarinet**: The Stacks development tool
   ```bash
   curl -L https://raw.githubusercontent.com/hirosystems/clarinet/master/install.sh | bash
   ```

2. **Install Stacks CLI**: For wallet management
   ```bash
   npm install -g @stacks/cli
   ```

3. **Create a Stacks Wallet**: If you don't have one
   ```bash
   stacks make_keychain
   ```

### **🔧 Setup Clarinet Project**

1. **Initialize Clarinet** (if not already done):
   ```bash
   clarinet init crop-insurance-protocol
   cd crop-insurance-protocol
   ```

2. **Add Your Contract**:
   ```bash
   # Copy your contract.clar to contracts/
   cp ../contracts/contract.clar contracts/crop-insurance-protocol.clar
   ```

3. **Configure Clarinet.toml**:
   ```toml
   [project]
   name = "crop-insurance-protocol"
   description = "Parametric crop insurance using weather data"
   authors = ["Your Name"]
   license = "MIT"
   clarinet_version = "1.0.0"

   [contracts.crop-insurance-protocol]
   path = "contracts/crop-insurance-protocol.clar"

   [networks.testnet]
   name = "testnet"
   deployment_dir = "deployments/testnet"

   [networks.mainnet]
   name = "mainnet"
   deployment_dir = "deployments/mainnet"
   ```

### **🔑 Configure Wallet**

1. **Generate a New Wallet** (if you don't have one):
   ```bash
   # Generate a new keychain
   stacks make_keychain
   # This will output your private key and address
   ```

2. **Update Testnet Configuration**:
   ```bash
   # Edit settings/Testnet.toml
   # Replace the mnemonic with your 24-word seed phrase
   # Or use a private key directly
   ```

3. **Alternative: Use Private Key**:
   ```bash
   # If you have a private key, you can use it directly
   # Update settings/Testnet.toml with:
   [accounts.deployer]
   private_key = "your-private-key-here"
   ```

4. **Get Test STX**:
   - Visit [Stacks Testnet Faucet](https://explorer.stacks.co/sandbox/faucet)
   - Enter your testnet address
   - Request STX

### **🚀 Deploy to Testnet**

1. **Check Contract**:
   ```bash
   clarinet check
   ```

2. **Generate Deployment**:
   ```bash
   clarinet deployments generate --testnet
   ```

3. **Apply Deployment**:
   ```bash
   clarinet deployments apply --testnet
   ```

4. **Get Contract Address**:
   ```bash
   clarinet console
   # In the console, type:
   (contract-call? .crop-insurance-protocol get-contract-address)
   ```

### **🔗 Update Frontend Configuration**

1. **Update .env File**:
   ```bash
   cd ../frontend
   echo "REACT_APP_CONTRACT_ADDRESS=YOUR_DEPLOYED_CONTRACT_ADDRESS" > .env
   echo "REACT_APP_CONTRACT_NAME=crop-insurance-protocol" >> .env
   echo "REACT_APP_NETWORK=testnet" >> .env
   echo "REACT_APP_WEATHER_SERVICE_URL=http://localhost:3001" >> .env
   ```

2. **Restart Frontend**:
   ```bash
   npm start
   ```

### **✅ Verify Deployment**

1. **Check on Explorer**:
   - Visit [Stacks Testnet Explorer](https://explorer.stacks.co/?chain=testnet)
   - Search for your contract address

2. **Test Functions**:
   - Try creating an insurance pool
   - Test deposit functionality
   - Submit a claim

### **🔧 Troubleshooting**

**Deployment Fails**:
- Ensure you have sufficient STX for deployment fees
- Check contract syntax with `clarinet check`
- Verify network connectivity

**Contract Not Found**:
- Wait a few minutes for deployment to propagate
- Check the correct network (testnet vs mainnet)
- Verify contract address in .env file

**Function Calls Fail**:
- Ensure contract is deployed and active
- Check function names match the contract
- Verify sender has required permissions

### **🎯 Next Steps**

After successful deployment:

1. **Test All Features**:
   - Create insurance pools
   - Join pools with location tracking
   - Submit automatic claims
   - Monitor weather data

2. **Deploy to Mainnet** (when ready):
   ```bash
   clarinet deploy mainnet
   ```

3. **Update Production Config**:
   - Change network to mainnet
   - Update contract address
   - Configure production environment

### **📚 Resources**

- [Clarinet Documentation](https://docs.hiro.so/clarinet/)
- [Stacks Documentation](https://docs.stacks.co/)
- [Clarity Language Guide](https://docs.stacks.co/docs/write-smart-contracts/overview)

### **🎉 Ready to Deploy!**

Your smart contract is ready for deployment. Follow the steps above to get your **Parametric Crop Insurance Protocol** running on Stacks testnet!
