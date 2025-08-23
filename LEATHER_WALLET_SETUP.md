# Leather Wallet Setup Guide

## 🚀 **Direct Leather Wallet Integration**

This guide will help you set up and connect your Leather wallet to the Crop Insurance Protocol dApp.

## 📋 **Prerequisites**

1. **Leather Wallet Extension**: Install the Leather wallet browser extension
   - [Chrome Extension](https://chrome.google.com/webstore/detail/leather/hmeobnfnfcmdkdcmlblgagmfpfboieaf)
   - [Firefox Extension](https://addons.mozilla.org/en-US/firefox/addon/leather/)

2. **Testnet STX**: Get some testnet STX for testing
   - Visit [Stacks Testnet Faucet](https://explorer.stacks.co/sandbox/faucet)
   - Enter your testnet address to receive test STX

## 🔧 **Setup Steps**

### 1. **Install Leather Wallet Extension**

1. Click on the extension link above for your browser
2. Install the extension
3. Create a new wallet or import existing one
4. **Important**: Switch to **Testnet** mode in Leather settings

### 2. **Configure Testnet**

1. Open Leather wallet extension
2. Click on the settings gear icon
3. Select **"Testnet"** as the network
4. Save the settings

### 3. **Connect to the dApp**

1. Open the Crop Insurance Protocol dApp: `http://localhost:3000`
2. Click **"Connect Wallet"** in the navigation bar
3. Leather wallet will prompt you to connect
4. Click **"Connect"** to authorize the connection
5. Your wallet address will appear in the navigation

## 🔗 **Direct API Integration Features**

### **Real Blockchain Transactions**

The dApp now uses Leather's direct API for:
- ✅ **Pool Creation**: Real contract calls to create insurance pools
- ✅ **Fund Deposits**: Real STX deposits to insurance pools
- ✅ **Claim Submissions**: Real claim submissions to the blockchain
- ✅ **Transaction Signing**: Secure transaction signing through Leather
- ✅ **Network Integration**: Direct testnet/mainnet connectivity

### **Transaction Flow**

1. **User Action**: Click create pool, deposit, or submit claim
2. **Leather Prompt**: Wallet extension opens for transaction signing
3. **User Approval**: Review and approve the transaction
4. **Blockchain Submission**: Transaction is submitted to Stacks network
5. **Confirmation**: Transaction ID returned and displayed

## 🛠 **Troubleshooting**

### **Common Issues**

#### **"Leather wallet not installed"**
- **Solution**: Install the Leather wallet extension
- **Alternative**: Use the mnemonic fallback option

#### **"Transaction was rejected"**
- **Solution**: Check if you have sufficient STX balance
- **Check**: Ensure you're on testnet mode

#### **"Network error"**
- **Solution**: Verify you're connected to testnet
- **Check**: Refresh the page and reconnect wallet

#### **"Contract not found"**
- **Solution**: Ensure the contract is deployed to testnet
- **Check**: Verify contract address in settings

### **Fallback Options**

If Leather wallet is not available:
1. Click "Connect Wallet"
2. Select "Connect Test Wallet" option
3. Enter your mnemonic phrase
4. Use the test wallet for development

## 🔒 **Security Notes**

- **Never share your private keys or mnemonic phrases**
- **Always verify transaction details before signing**
- **Use testnet for development and testing**
- **Keep your Leather wallet updated**

## 📱 **Mobile Support**

For mobile testing:
1. Install Leather mobile app
2. Use the same testnet configuration
3. Connect via QR code or deep link

## 🎯 **Next Steps**

After successful wallet connection:
1. **Create Insurance Pools**: Deploy new insurance contracts
2. **Deposit Funds**: Add STX to insurance pools
3. **Submit Claims**: Test automatic claim processing
4. **Monitor Transactions**: Track all blockchain activity

## 📞 **Support**

If you encounter issues:
1. Check the browser console for error messages
2. Verify Leather wallet is properly installed
3. Ensure you're on the correct network (testnet)
4. Check your STX balance for sufficient funds

---

**🎉 You're now ready to use the Crop Insurance Protocol with real blockchain transactions!**
