import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useContract } from '../contexts/ContractContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  Plus, 
  Shield, 
  Users, 
  DollarSign, 
  Calendar,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  MapPin
} from 'lucide-react';
import toast from 'react-hot-toast';

const InsurancePools = () => {
  const { pools, loading, getPools, depositFunds } = useContract();
  const { user, isAuthenticated } = useAuth();
  const [depositing, setDepositing] = useState(null);

  useEffect(() => {
    loadPools();
  }, []);

  const loadPools = async () => {
    try {
      await getPools();
    } catch (error) {
      console.error('Error loading pools:', error);
      toast.error('Failed to load insurance pools');
    }
  };

  const handleDeposit = async (poolId) => {
    if (!isAuthenticated) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setDepositing(poolId);
      await depositFunds(poolId);
      toast.success('Successfully deposited funds to pool');
      await loadPools(); // Refresh pools
    } catch (error) {
      console.error('Error depositing funds:', error);
      toast.error('Failed to deposit funds');
    } finally {
      setDepositing(null);
    }
  };

  const formatSTX = (amount) => {
    return (amount / 1000000).toFixed(2);
  };

  const getWeatherParamText = (params) => {
    // Handle real contract structure (no weather params) vs mock structure
    if (!params || typeof params !== 'object') {
      return 'Weather-based claims';
    }
    
    const conditions = [];
    if (params['min-temp'] !== undefined) conditions.push(`Min Temp: ${params['min-temp']}°C`);
    if (params['max-temp'] !== undefined) conditions.push(`Max Temp: ${params['max-temp']}°C`);
    if (params['min-rainfall'] !== undefined) conditions.push(`Min Rainfall: ${params['min-rainfall']}mm`);
    if (params['max-rainfall'] !== undefined) conditions.push(`Max Rainfall: ${params['max-rainfall']}mm`);
    if (params['max-wind-speed'] !== undefined) conditions.push(`Max Wind: ${params['max-wind-speed']} km/h`);
    
    return conditions.length > 0 ? conditions.join(', ') : 'Weather-based claims';
  };

  const getPoolStatus = (pool) => {
    if (!pool['is-active']) return { text: 'Inactive', color: 'text-red-600', bg: 'bg-red-100' };
    if (pool['total-funds'] > 0) return { text: 'Active', color: 'text-green-600', bg: 'bg-green-100' };
    return { text: 'New', color: 'text-blue-600', bg: 'bg-blue-100' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Insurance Pools</h1>
          <p className="text-gray-600 mt-2">
            Browse and join insurance pools for crop protection
          </p>
        </div>
        
        <Link
          to="/pools/create"
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors mt-4 md:mt-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Pool
        </Link>
      </div>

      {pools.length === 0 ? (
        <div className="text-center py-12">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Insurance Pools Found</h3>
          <p className="text-gray-600 mb-6">
            Be the first to create an insurance pool for crop protection.
          </p>
          <Link
            to="/pools/create"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create First Pool
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pools.map((pool) => {
            const status = getPoolStatus(pool);
            const isParticipant = pool.participants?.includes(user?.address) || false;
            
            return (
              <div
                key={pool.id}
                className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Pool #{pool.id}
                      </h3>
                      {(pool.participants?.length > 0 || pool['total-funds'] > 0) && (
                        <div className="flex items-center space-x-1 text-blue-600">
                          <MapPin className="w-4 h-4" />
                          <span className="text-xs font-medium">Monitoring</span>
                        </div>
                      )}
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.bg} ${status.color}`}>
                      {status.text}
                    </span>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Funds</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatSTX(pool['total-funds'])} STX
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Claim Amount</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatSTX(pool['claim-amount'])} STX
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Participants</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {pool.participants?.length || (pool['total-funds'] > 0 ? 1 : 0)}
                      </span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Weather Parameters</h4>
                    <p className="text-xs text-gray-600">
                      {getWeatherParamText(pool['weather-params'] || null)}
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <Link
                      to={`/pools/${pool.id}`}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      View Details
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                    
                    {pool['is-active'] && (
                      <button
                        onClick={() => handleDeposit(pool.id)}
                        disabled={depositing === pool.id}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {depositing === pool.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <>
                            <DollarSign className="w-4 h-4 mr-1" />
                            Join
                          </>
                        )}
                      </button>
                    )}
                    
                    {isParticipant && (
                      <span className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-green-100 text-green-800 text-sm font-medium rounded-md">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        Joined
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InsurancePools;
