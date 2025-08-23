import React, { createContext, useContext, useState, useEffect } from 'react';
import { connect, disconnect, isConnected, getLocalStorage, request } from '@stacks/connect';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showMnemonicModal, setShowMnemonicModal] = useState(false);

  // Check authentication status on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const authenticated = isConnected();
      if (authenticated) {
        const userData = getLocalStorage();
        if (userData?.addresses) {
          const stxAddress = userData.addresses.stx[0].address;
          setUser({
            address: stxAddress,
            profile: {
              name: 'Stacks User',
              email: null
            }
          });
          setIsAuthenticated(true);
          console.log('User already authenticated:', stxAddress);
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  };

  const login = async () => {
    setIsLoading(true);
    try {
      console.log('Initiating Stacks Connect...');
      
      // Check if already connected
      if (isConnected()) {
        console.log('Already authenticated');
        await checkAuthStatus();
        return;
      }

      // Connect to wallet using Stacks Connect
      const response = await connect();
      console.log('Stacks Connect response:', response);
      
      if (response && response.addresses) {
        const stxAddress = response.addresses.stx[0].address;
        const btcAddress = response.addresses.btc[0].address;
        
        setUser({
          address: stxAddress,
          profile: {
            name: 'Stacks User',
            email: null
          }
        });
        setIsAuthenticated(true);
        
        console.log('Connected successfully!');
        console.log('STX Address:', stxAddress);
        console.log('BTC Address:', btcAddress);
      } else {
        throw new Error('No addresses received from wallet connection');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('Disconnecting from Stacks wallet...');
      disconnect(); // Clears storage and wallet selection
      
      setUser(null);
      setIsAuthenticated(false);
      
      console.log('User disconnected successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if disconnect fails
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const getAccountInfo = async () => {
    try {
      if (!isAuthenticated) {
        throw new Error('User not authenticated');
      }

      // Request full account details
      const accounts = await request('stx_getAccounts');
      const account = accounts.addresses[0];
      
      console.log('Account details:', {
        address: account.address,
        publicKey: account.publicKey,
        gaiaHubUrl: account.gaiaHubUrl
      });
      
      return account;
    } catch (error) {
      console.error('Error getting account info:', error);
      throw error;
    }
  };

  const sendTransaction = async (transactionParams) => {
    try {
      if (!isAuthenticated) {
        throw new Error('User not authenticated');
      }

      console.log('Sending transaction with params:', transactionParams);
      
      // Use Stacks Connect request method for transactions
      const response = await request('stx_transferStx', transactionParams);
      
      console.log('Transaction response:', response);
      return response;
    } catch (error) {
      console.error('Transaction error:', error);
      throw error;
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    showMnemonicModal,
    setShowMnemonicModal,
    login,
    logout,
    getAccountInfo,
    sendTransaction,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
