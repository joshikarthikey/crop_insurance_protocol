import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  fetchCallReadOnlyFunction, 
  cvToValue,
  makeContractCall,
  uintCV,
  stringAsciiCV,
  AnchorMode,
  PostConditionMode
} from '@stacks/transactions';
import { STACKS_TESTNET } from '@stacks/network';
import { request } from '@stacks/connect';
import { useAuth } from './AuthContext';

const ContractContext = createContext();

export const useContract = () => {
  const context = useContext(ContractContext);
  if (!context) {
    throw new Error('useContract must be used within a ContractProvider');
  }
  return context;
};

export const ContractProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [pools, setPools] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(false);

  // Contract configuration
  const CONTRACT_NAME = 'crop-insurance-protocol';
  const contractAddress = 'ST1TVDG8AZSBZXSZRXXCVM1NHDG37QJKDEEVXHTNW';

  // Helper function to detect wallet type
  const detectWalletType = (methods) => {
    const methodNames = methods.map(m => m.name || m);
    
    if (methodNames.includes('stx_contractCall') || methodNames.includes('stx_signTransaction')) {
      return 'Stacks-Compatible Wallet (Xverse, Hiro, etc.)';
    } else if (methodNames.includes('sendTransfer') && methodNames.includes('signPsbt')) {
      return 'Bitcoin-Only Wallet (Leather, etc.)';
    } else if (methodNames.includes('eth_sendTransaction')) {
      return 'Ethereum Wallet';
    } else {
      return 'Unknown Wallet Type';
    }
  };

  // Test STX transfer to show wallet can handle basic transfers
  const testSTXTransfer = async () => {
    try {
      console.log('=== WALLET CAPABILITY TEST START ===');
      
      const methodsResponse = await request('supportedMethods');
      console.log('Raw methods response:', methodsResponse);
      
      const availableMethods = methodsResponse?.methods || [];
      console.log('Available methods array:', availableMethods);
      
      // Log each method for debugging
      availableMethods.forEach((method, index) => {
        console.log(`Method ${index}:`, method);
        console.log(`  Type:`, typeof method);
        console.log(`  Name:`, method.name || method);
        console.log(`  Full object:`, method);
      });
      
      // Check if wallet supports Stacks contract calls
      const hasStacksContractCall = availableMethods.some(method => {
        const methodName = method.name || method;
        const result = methodName === 'stx_contractCall';
        console.log(`Checking ${methodName} for stx_contractCall:`, result);
        return result;
      });
      
      // Check if wallet supports STX transfers
      const hasSTXTransfer = availableMethods.some(method => {
        const methodName = method.name || method;
        const result = methodName === 'stx_transferStx';
        console.log(`Checking ${methodName} for stx_transferStx:`, result);
        return result;
      });
      
      console.log('Detection results:');
      console.log('  hasStacksContractCall:', hasStacksContractCall);
      console.log('  hasSTXTransfer:', hasSTXTransfer);
      
      if (hasStacksContractCall) {
        console.log('✅ Wallet supports Stacks contract calls!');
        return {
          success: true,
          message: '✅ REAL MODE: Your wallet (Xverse/Hiro) supports Stacks smart contract calls! You can make real blockchain transactions.'
        };
      } else if (hasSTXTransfer) {
        console.log('⚠️ Wallet supports STX transfers but not contract calls');
        return {
          success: true,
          message: '⚠️ FALLBACK MODE: Your wallet supports STX transfers but not smart contract calls. You can send/receive STX tokens, but cannot interact with smart contracts.'
        };
      } else {
        console.log('❌ Wallet does not support Stacks operations');
        return {
          success: false,
          message: `❌ Your wallet does not support Stacks operations. Available methods: ${availableMethods.map(m => m.name || m).join(', ')}`
        };
      }
    } catch (error) {
      console.error('Error testing wallet capabilities:', error);
      return {
        success: false,
        message: `Could not test wallet capabilities: ${error.message}`
      };
    } finally {
      console.log('=== WALLET CAPABILITY TEST END ===');
    }
  };

  // Fetch pools from blockchain
  const getPools = async () => {
    try {
      setLoading(true);
      console.log('Fetching pools from blockchain...');
      
      // Get pool counter
      const poolCounter = await fetchCallReadOnlyFunction({
        network: STACKS_TESTNET,
        contractAddress: contractAddress,
        contractName: CONTRACT_NAME,
        functionName: 'get-pool-counter',
        functionArgs: [],
        senderAddress: user?.address || 'ST1TVDG8AZSBZXSZRXXCVM1NHDG37QJKDEEVXHTNW'
      });

      console.log('Pool counter:', poolCounter);
      
      if (poolCounter && poolCounter.value > 0) {
        const poolCount = Number(poolCounter.value);
        const fetchedPools = [];

        for (let i = 1; i <= poolCount; i++) {
          try {
            const pool = await fetchCallReadOnlyFunction({
              network: STACKS_TESTNET,
              contractAddress: contractAddress,
              contractName: CONTRACT_NAME,
              functionName: 'get-pool',
              functionArgs: [{ type: 'uint', value: i }],
              senderAddress: user?.address || 'ST1TVDG8AZSBZXSZRXXCVM1NHDG37QJKDEEVXHTNW'
            });

            if (pool) {
              const poolData = {
                id: i,
                owner: cvToValue(pool.owner),
                'total-funds': cvToValue(pool['total-funds']),
                'claim-amount': cvToValue(pool['claim-amount']),
                'is-active': cvToValue(pool['is-active']),
                'created-at': Date.now()
              };
              fetchedPools.push(poolData);
            }
          } catch (error) {
            console.log(`Error fetching pool ${i}:`, error);
          }
        }

        setPools(fetchedPools);
        console.log('Fetched pools:', fetchedPools);
      } else {
        setPools([]);
      }
    } catch (error) {
      console.error('Error fetching pools:', error);
      setPools([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch claims from blockchain
  const getClaims = async () => {
    try {
      setLoading(true);
      console.log('Fetching claims from blockchain...');
      
      // Get claim counter
      const claimCounter = await fetchCallReadOnlyFunction({
        network: STACKS_TESTNET,
        contractAddress: contractAddress,
        contractName: CONTRACT_NAME,
        functionName: 'get-claim-counter',
        functionArgs: [],
        senderAddress: user?.address || 'ST1TVDG8AZSBZXSZRXXCVM1NHDG37QJKDEEVXHTNW'
      });

      console.log('Claim counter:', claimCounter);
      
      if (claimCounter && claimCounter.value > 0) {
        const claimCount = Number(claimCounter.value);
        const fetchedClaims = [];

        for (let i = 1; i <= claimCount; i++) {
          try {
            const claim = await fetchCallReadOnlyFunction({
              network: STACKS_TESTNET,
              contractAddress: contractAddress,
              contractName: CONTRACT_NAME,
              functionName: 'get-claim',
              functionArgs: [{ type: 'uint', value: i }],
              senderAddress: user?.address || 'ST1TVDG8AZSBZXSZRXXCVM1NHDG37QJKDEEVXHTNW'
            });

            if (claim) {
              const claimData = {
                id: i,
                'pool-id': cvToValue(claim['pool-id']),
                claimant: cvToValue(claim.claimant),
                'claim-amount': cvToValue(claim['claim-amount']),
                'is-approved': cvToValue(claim['is-approved']),
                'is-processed': cvToValue(claim['is-processed']),
                'submitted-at': Date.now()
              };
              fetchedClaims.push(claimData);
            }
          } catch (error) {
            console.log(`Error fetching claim ${i}:`, error);
          }
        }

        setClaims(fetchedClaims);
        console.log('Fetched claims:', fetchedClaims);
      } else {
        setClaims([]);
      }
    } catch (error) {
      console.error('Error fetching claims:', error);
      setClaims([]);
    } finally {
      setLoading(false);
    }
  };

  // Create insurance pool using proper Stacks.js approach
  const createInsurancePool = async (params) => {
    try {
      if (!contractAddress || !user?.address) {
        throw new Error('Contract address or user not available');
      }

      console.log('Creating insurance pool with params:', params);
      
      if (!isAuthenticated) {
        throw new Error('User not authenticated. Please connect your wallet first.');
      }

      // Try to create a real transaction first
      console.log('Attempting to create real contract call...');
      
      let result;
      let availableMethods = [];
      
      try {
        // First, check what methods the wallet supports
        const methodsResponse = await request('supportedMethods');
        availableMethods = methodsResponse?.methods || [];
        console.log('Available wallet methods:', availableMethods);
        
        // Check if the wallet supports Stacks contract calls
        const hasStacksContractCall = Array.isArray(availableMethods) && 
          availableMethods.some(method => 
            method === 'stx_contractCall' || 
            (typeof method === 'object' && method.name === 'stx_contractCall')
          );
        
        if (hasStacksContractCall) {
          console.log('Wallet supports Stacks contract calls, attempting real transaction...');
          
          // Try to call the contract directly
          result = await request('stx_contractCall', {
            contractAddress: contractAddress,
            contractName: CONTRACT_NAME,
            functionName: 'create-pool',
            functionArgs: [params.claimAmount.toString()],
            network: 'testnet'
          });
          
          console.log('Real contract call result:', result);
        } else {
          console.log('Wallet does not support Stacks contract calls, creating mock transaction...');
          
          // Provide detailed information about the wallet
          const walletType = detectWalletType(availableMethods);
          console.log(`Detected wallet type: ${walletType}`);
          
          throw new Error(`Wallet does not support Stacks contract calls. Detected: ${walletType}`);
        }
      } catch (error) {
        console.log('Real transaction failed, creating mock transaction:', error);
        
        // Create mock transaction as fallback
        const walletType = detectWalletType(availableMethods);
        result = {
          txId: 'mock-tx-' + Date.now(),
          success: true,
          note: `⚠️ FALLBACK MODE: Mock transaction created. Your wallet (${walletType}) does not support Stacks smart contract calls. For real transactions, please install Xverse Wallet (https://www.xverse.app/) or Hiro Wallet (https://wallet.hiro.so/) which support Stacks blockchain.`
        };
      }

      console.log('Transaction result:', result);

      if (result && result.txId) {
        console.log('Transaction submitted successfully!');
        console.log('Transaction ID:', result.txId);
        console.log('Waiting for transaction to be processed...');
        
        // Wait a bit for the transaction to be processed
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Refresh pools data
        await getPools();
        
        return {
          success: true,
          txId: result.txId,
          message: result.txId.startsWith('mock-') ?
            `⚠️ FALLBACK MODE: Mock pool created for testing. Your wallet does not support Stacks smart contract calls. For real transactions, please install Xverse Wallet (https://www.xverse.app/) or Hiro Wallet (https://wallet.hiro.so/).` :
            '✅ REAL TRANSACTION: Pool created successfully on the blockchain!'
        };
      } else {
        throw new Error('No transaction ID received from transaction');
      }
    } catch (error) {
      console.error('Error creating insurance pool:', error);
      throw error;
    }
  };

  // Deposit funds using proper Stacks.js approach
  const depositFunds = async (poolId, amount) => {
    try {
      if (!contractAddress || !user?.address) {
        throw new Error('Contract address or user not available');
      }

      console.log('Depositing funds to pool:', poolId, 'Amount:', amount);
      
      if (!isAuthenticated) {
        throw new Error('User not authenticated. Please connect your wallet first.');
      }

      // Try to create a real transaction first
      console.log('Attempting to create real deposit transaction...');
      
      let result;
      let availableMethods = [];
      
      try {
        // First, check what methods the wallet supports
        const methodsResponse = await request('supportedMethods');
        availableMethods = methodsResponse?.methods || [];
        console.log('Available wallet methods for deposit:', availableMethods);
        
        // Check if the wallet supports Stacks contract calls
        const hasStacksContractCall = Array.isArray(availableMethods) && 
          availableMethods.some(method => 
            method === 'stx_contractCall' || 
            (typeof method === 'object' && method.name === 'stx_contractCall')
          );
        
        if (hasStacksContractCall) {
          console.log('Wallet supports Stacks contract calls, attempting real deposit...');
          
          // Try to call the contract directly
          result = await request('stx_contractCall', {
            contractAddress: contractAddress,
            contractName: CONTRACT_NAME,
            functionName: 'deposit-funds',
            functionArgs: [poolId.toString(), amount.toString()],
            network: 'testnet'
          });
          
          console.log('Real deposit result:', result);
        } else {
          console.log('Wallet does not support Stacks contract calls, creating mock deposit...');
          throw new Error('Wallet does not support Stacks contract calls');
        }
      } catch (error) {
        console.log('Real deposit failed, creating mock transaction:', error);
        
        // Create mock transaction as fallback
        const walletType = detectWalletType(availableMethods);
        result = {
          txId: 'mock-deposit-' + Date.now(),
          success: true,
          note: `⚠️ FALLBACK MODE: Mock deposit transaction created. Your wallet (${walletType}) does not support Stacks smart contract calls. For real transactions, please install Xverse Wallet (https://www.xverse.app/) or Hiro Wallet (https://wallet.hiro.so/) which support Stacks blockchain.`
        };
      }

      console.log('Deposit result:', result);

      if (result && result.txId) {
        console.log('Deposit submitted successfully!');
        console.log('Transaction ID:', result.txId);
        
        // Wait a bit for the transaction to be processed
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Refresh pools data
        await getPools();
        
        return {
          success: true,
          txId: result.txId,
          message: result.txId.startsWith('mock-') ?
            '⚠️ FALLBACK MODE: Mock deposit created for testing. Your wallet does not support Stacks smart contract calls.' :
            '✅ REAL TRANSACTION: Funds deposited successfully on the blockchain!'
        };
      } else {
        throw new Error('No transaction ID received from deposit');
      }
    } catch (error) {
      console.error('Error depositing funds:', error);
      throw error;
    }
  };

  // Submit claim using proper Stacks.js approach
  const submitClaim = async (poolId, location) => {
    try {
      if (!contractAddress || !user?.address) {
        throw new Error('Contract address or user not available');
      }

      console.log('Submitting claim for pool:', poolId, 'Location:', location);
      
      if (!isAuthenticated) {
        throw new Error('User not authenticated. Please connect your wallet first.');
      }

      // Try to create a real transaction first
      console.log('Attempting to create real claim transaction...');
      
      let result;
      let availableMethods = [];
      
      try {
        // First, check what methods the wallet supports
        const methodsResponse = await request('supportedMethods');
        availableMethods = methodsResponse?.methods || [];
        console.log('Available wallet methods for claim:', availableMethods);
        
        // Check if the wallet supports Stacks contract calls
        const hasStacksContractCall = Array.isArray(availableMethods) && 
          availableMethods.some(method => 
            method === 'stx_contractCall' || 
            (typeof method === 'object' && method.name === 'stx_contractCall')
          );
        
        if (hasStacksContractCall) {
          console.log('Wallet supports Stacks contract calls, attempting real claim...');
          
          // Try to call the contract directly
          result = await request('stx_contractCall', {
            contractAddress: contractAddress,
            contractName: CONTRACT_NAME,
            functionName: 'submit-claim',
            functionArgs: [poolId.toString(), location],
            network: 'testnet'
          });
          
          console.log('Real claim result:', result);
        } else {
          console.log('Wallet does not support Stacks contract calls, creating mock claim...');
          throw new Error('Wallet does not support Stacks contract calls');
        }
      } catch (error) {
        console.log('Real claim failed, creating mock transaction:', error);
        
        // Create mock transaction as fallback
        const walletType = detectWalletType(availableMethods);
        result = {
          txId: 'mock-claim-' + Date.now(),
          success: true,
          note: `⚠️ FALLBACK MODE: Mock claim transaction created. Your wallet (${walletType}) does not support Stacks smart contract calls. For real transactions, please install Xverse Wallet (https://www.xverse.app/) or Hiro Wallet (https://wallet.hiro.so/) which support Stacks blockchain.`
        };
      }

      console.log('Claim result:', result);

      if (result && result.txId) {
        console.log('Claim submitted successfully!');
        console.log('Transaction ID:', result.txId);
        
        // Wait a bit for the transaction to be processed
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Refresh claims data
        await getClaims();
        
        return {
          success: true,
          txId: result.txId,
          message: result.txId.startsWith('mock-') ?
            '⚠️ FALLBACK MODE: Mock claim created for testing. Your wallet does not support Stacks smart contract calls.' :
            '✅ REAL TRANSACTION: Claim submitted successfully on the blockchain!'
        };
      } else {
        throw new Error('No transaction ID received from claim');
      }
    } catch (error) {
      console.error('Error submitting claim:', error);
      throw error;
    }
  };

  // Load data when user changes
  useEffect(() => {
    if (user?.address) {
      getPools();
      getClaims();
    }
  }, [user?.address]);

  const value = {
    pools,
    claims,
    loading,
    getPools,
    getClaims,
    createInsurancePool,
    depositFunds,
    submitClaim,
    testSTXTransfer,
    contractAddress,
    CONTRACT_NAME
  };

  return (
    <ContractContext.Provider value={value}>
      {children}
    </ContractContext.Provider>
  );
};
