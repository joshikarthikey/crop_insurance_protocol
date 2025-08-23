import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useContract } from '../contexts/ContractContext';
import { useNavigate } from 'react-router-dom';
import { 
  HomeIcon, 
  CurrencyDollarIcon, 
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  ClockIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const { pools, claims, loading, testSTXTransfer } = useContract();
  const navigate = useNavigate();
  const [transferTestResult, setTransferTestResult] = useState(null);
  const [stats, setStats] = useState({
    totalPools: 0,
    totalClaims: 0,
    totalFunds: 0,
    totalParticipants: 0,
    pendingClaims: 0,
    approvedClaims: 0,
    rejectedClaims: 0
  });

  // Helper functions
  const formatSTX = (amount) => {
    return (amount / 1000000).toFixed(2);
  };

  const getClaimStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'approved':
        return 'text-green-600 bg-green-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // Calculate stats when pools or claims change
  useEffect(() => {
    const totalFunds = pools.reduce((sum, pool) => sum + (pool['total-funds'] || 0), 0);
    const totalParticipants = pools.reduce((sum, pool) => sum + (pool.participants?.length || 0), 0);
    const pendingClaims = claims.filter(claim => claim.status === 'pending').length;
    const approvedClaims = claims.filter(claim => claim.status === 'approved').length;
    const rejectedClaims = claims.filter(claim => claim.status === 'rejected').length;

    setStats({
      totalPools: pools.length,
      totalClaims: claims.length,
      totalFunds,
      totalParticipants,
      pendingClaims,
      approvedClaims,
      rejectedClaims
    });
  }, [pools, claims]);

  // Test STX transfer capability
  const handleTestTransfer = async () => {
    console.log('Test button clicked!');
    console.log('testSTXTransfer function:', testSTXTransfer);
    
    try {
      if (!testSTXTransfer) {
        throw new Error('testSTXTransfer function is not available');
      }
      
      const result = await testSTXTransfer();
      console.log('Test result:', result);
      setTransferTestResult(result);
    } catch (error) {
      console.error('Error testing transfer:', error);
      setTransferTestResult({
        success: false,
        message: `Error testing transfer capability: ${error.message}`
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Connect Your Wallet</h2>
          <p className="text-gray-600">You need to connect your wallet to view the dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Overview of the crop insurance protocol
        </p>
      </div>

      {/* Wallet Status Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <InformationCircleIcon className="w-6 h-6 text-blue-600 mr-2" />
          Wallet Status & Capabilities
        </h2>
        <div className="space-y-4">
          <div className={`rounded-md p-4 ${
            transferTestResult?.success && transferTestResult?.message?.includes('supports STX transfers but not smart contract calls')
              ? 'bg-yellow-50 border border-yellow-200'
              : transferTestResult?.success
              ? 'bg-green-50 border border-green-200'
              : 'bg-yellow-50 border border-yellow-200'
          }`}>
            <div className="flex items-center">
              {transferTestResult?.success && !transferTestResult?.message?.includes('supports STX transfers but not smart contract calls') ? (
                <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
              ) : (
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mr-2" />
              )}
              <div>
                <h3 className={`text-sm font-medium ${
                  transferTestResult?.success && !transferTestResult?.message?.includes('supports STX transfers but not smart contract calls')
                    ? 'text-green-800'
                    : 'text-yellow-800'
                }`}>
                  Current Status: {transferTestResult?.success && !transferTestResult?.message?.includes('supports STX transfers but not smart contract calls') ? 'Real Mode' : 'Fallback Mode'}
                </h3>
                <p className={`text-sm mt-1 ${
                  transferTestResult?.success && !transferTestResult?.message?.includes('supports STX transfers but not smart contract calls')
                    ? 'text-green-700'
                    : 'text-yellow-700'
                }`}>
                  {transferTestResult?.message || 'Test your wallet capabilities to see current status.'}
                </p>
              </div>
            </div>
          </div>
          <p className="text-gray-600">
            Test your wallet's capabilities to understand what operations it supports.
          </p>
          <div className="space-y-2">
            <button
              onClick={handleTestTransfer}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Test STX Transfer Capability
            </button>
            <button
              onClick={() => {
                console.log('Simple test clicked!');
                setTransferTestResult({
                  success: true,
                  message: 'Simple test works! Your wallet test function might not be available.'
                });
              }}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors ml-2"
            >
              Simple Test
            </button>
          </div>
          {transferTestResult && (
            <div className={`p-4 rounded-md ${
              transferTestResult.success 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center">
                {transferTestResult.success ? (
                  <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
                ) : (
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-2" />
                )}
                <p className="text-sm font-medium">
                  {transferTestResult.message}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <ShieldCheckIcon className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Pools</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPools}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <CurrencyDollarIcon className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Funds</p>
              <p className="text-2xl font-bold text-gray-900">{formatSTX(stats.totalFunds)} STX</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <UserGroupIcon className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Participants</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalParticipants}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <DocumentTextIcon className="w-8 h-8 text-orange-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Claims</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalClaims}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Claims Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Claims Status */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Claims Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ClockIcon className="w-5 h-5 text-yellow-500 mr-2" />
                <span className="text-gray-700">Pending</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">{stats.pendingClaims}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-gray-700">Approved</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">{stats.approvedClaims}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <XCircleIcon className="w-5 h-5 text-red-500 mr-2" />
                <span className="text-gray-700">Rejected</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">{stats.rejectedClaims}</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Claims</h2>
          <div className="space-y-3">
            {claims.slice(0, 5).map((claim) => (
              <div key={claim.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">Claim #{claim.id}</p>
                  <p className="text-xs text-gray-600">
                    Pool #{claim['pool-id']} • {new Date(claim['submitted-at']).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getClaimStatusColor(claim.status)}`}>
                  {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                </span>
              </div>
            ))}
            {claims.length === 0 && (
              <p className="text-gray-500 text-center py-4">No claims yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Insurance Pools */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Insurance Pools</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pool ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Funds
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Participants
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Claim Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pools.map((pool) => (
                <tr key={pool.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Pool #{pool.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatSTX(pool['total-funds'])} STX
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {pool.participants?.length || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatSTX(pool['claim-amount'])} STX
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      pool['is-active'] 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {pool['is-active'] ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
              {pools.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No insurance pools found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
