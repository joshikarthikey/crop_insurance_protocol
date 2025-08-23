import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { request } from '@stacks/connect';
import { 
  HomeIcon, 
  ShieldCheckIcon, 
  DocumentTextIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const { user, isAuthenticated, login, logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [walletMode, setWalletMode] = useState('FALLBACK MODE');
  const [isStacksCompatible, setIsStacksCompatible] = useState(false);

  // Detect wallet capabilities
  useEffect(() => {
    const detectWalletCapabilities = async () => {
      if (!isAuthenticated) {
        setWalletMode('FALLBACK MODE');
        setIsStacksCompatible(false);
        return;
      }

      try {
        console.log('=== NAVBAR WALLET DETECTION START ===');
        const methodsResponse = await request('supportedMethods');
        console.log('Navbar methods response:', methodsResponse);
        
        const availableMethods = methodsResponse?.methods || [];
        console.log('Navbar available methods:', availableMethods);
        
        // Log each method for debugging
        availableMethods.forEach((method, index) => {
          console.log(`Navbar Method ${index}:`, method);
          console.log(`  Type:`, typeof method);
          console.log(`  Name:`, method.name || method);
        });
        
        // Check if wallet supports Stacks contract calls
        const hasStacksContractCall = availableMethods.some(method => {
          const methodName = method.name || method;
          const result = methodName === 'stx_contractCall';
          console.log(`Navbar checking ${methodName} for stx_contractCall:`, result);
          return result;
        });
        
        console.log('Navbar detection result - hasStacksContractCall:', hasStacksContractCall);
        
        if (hasStacksContractCall) {
          console.log('Navbar: Setting to REAL MODE');
          setWalletMode('REAL MODE');
          setIsStacksCompatible(true);
        } else {
          console.log('Navbar: Setting to FALLBACK MODE');
          setWalletMode('FALLBACK MODE');
          setIsStacksCompatible(false);
        }
      } catch (error) {
        console.log('Navbar: Could not detect wallet capabilities:', error);
        setWalletMode('FALLBACK MODE');
        setIsStacksCompatible(false);
      } finally {
        console.log('=== NAVBAR WALLET DETECTION END ===');
      }
    };

    detectWalletCapabilities();
  }, [isAuthenticated]);

  const navigation = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Dashboard', href: '/dashboard', icon: InformationCircleIcon },
    { name: 'Insurance Pools', href: '/pools', icon: ShieldCheckIcon },
    { name: 'Claims', href: '/claims', icon: DocumentTextIcon },
  ];

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <ShieldCheckIcon className="h-8 w-8 text-green-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Crop Insurance</span>
            </Link>
            
            {/* Wallet Mode Indicator */}
            <div className="ml-4 flex items-center">
              <div className={`rounded-md px-3 py-1 flex items-center ${
                isStacksCompatible 
                  ? 'bg-green-100 border border-green-300' 
                  : 'bg-yellow-100 border border-yellow-300'
              }`}>
                {isStacksCompatible ? (
                  <CheckCircleIcon className="h-4 w-4 text-green-600 mr-1" />
                ) : (
                  <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600 mr-1" />
                )}
                <span className={`text-xs font-medium ${
                  isStacksCompatible ? 'text-green-800' : 'text-yellow-800'
                }`}>
                  {walletMode}
                </span>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === item.href
                      ? 'text-green-600 bg-green-50'
                      : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-1" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  {user?.address?.slice(0, 8)}...{user?.address?.slice(-6)}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  location.pathname === item.href
                    ? 'text-green-600 bg-green-50'
                    : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                }`}
              >
                <Icon className="h-5 w-5 mr-2" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
