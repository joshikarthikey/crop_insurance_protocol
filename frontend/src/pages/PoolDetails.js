import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useContract } from '../contexts/ContractContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowLeft, 
  Shield, 
  Users, 
  DollarSign, 
  Thermometer, 
  Droplets, 
  Wind,
  Calendar,
  TrendingUp,
  AlertCircle,
  MapPin,
  Eye,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';

const PoolDetails = () => {
  const { poolId } = useParams();
  const navigate = useNavigate();
  const { getPool, depositFunds, withdrawFunds } = useContract();
  const { user, isAuthenticated } = useAuth();
  const [pool, setPool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [depositing, setDepositing] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showMonitoring, setShowMonitoring] = useState(false);
  const [participantLocations, setParticipantLocations] = useState([]);
  const [weatherData, setWeatherData] = useState({});

  useEffect(() => {
    loadPool();
  }, [poolId]);

  useEffect(() => {
    if (participantLocations.length > 0 && showMonitoring) {
      fetchWeatherForLocations();
    }
  }, [participantLocations, showMonitoring]);

  const loadPool = async () => {
    try {
      setLoading(true);
      const poolData = await getPool(poolId);
      setPool(poolData);
    } catch (error) {
      console.error('Error loading pool:', error);
      toast.error('Failed to load pool details');
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!isAuthenticated) {
      toast.error('Please connect your wallet first');
      return;
    }

    // Show location selection modal
    setShowLocationModal(true);
  };

  const handleLocationConfirm = async (location) => {
    try {
      setDepositing(true);
      setShowLocationModal(false);
      
      await depositFunds(parseInt(poolId), location);
      toast.success('Successfully deposited funds to pool with location tracking');
      await loadPool(); // Refresh pool data
    } catch (error) {
      console.error('Error depositing funds:', error);
      toast.error('Failed to deposit funds');
    } finally {
      setDepositing(false);
    }
  };

  const handleWithdraw = async (amount) => {
    if (!isAuthenticated) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setWithdrawing(true);
      await withdrawFunds(parseInt(poolId), amount);
      toast.success('Successfully withdrew funds from pool');
      await loadPool(); // Refresh pool data
    } catch (error) {
      console.error('Error withdrawing funds:', error);
      toast.error('Failed to withdraw funds');
    } finally {
      setWithdrawing(false);
    }
  };

  const formatSTX = (amount) => {
    return (amount / 1000000).toFixed(2);
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isPoolOwner = pool?.owner === user?.address;
  const isParticipant = pool?.participants?.includes(user?.address);

  // Mock participant locations for this specific pool
  const getPoolParticipantLocations = () => {
    if (!pool) return [];
    
    // In a real implementation, this would come from the smart contract
    const mockLocations = [
      {
        participant: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
        latitude: '40.7128',
        longitude: '-74.0060',
        locationName: 'New York, NY'
      },
      {
        participant: 'ST2NEB84ASENDXKYGJPQW86YXQCEFEX2ZQPG87ND',
        latitude: '34.0522',
        longitude: '-118.2437',
        locationName: 'Los Angeles, CA'
      },
      {
        participant: 'ST3ABC123DEF456GHI789JKL',
        latitude: '41.8781',
        longitude: '-87.6298',
        locationName: 'Chicago, IL'
      }
    ];
    
    // For demo purposes, always return some locations if pool has participants
    if (pool.participants?.length > 0) {
      return mockLocations.slice(0, Math.min(pool.participants.length, mockLocations.length));
    }
    
    return [];
  };

  const loadParticipantLocations = () => {
    const locations = getPoolParticipantLocations();
    setParticipantLocations(locations);
    console.log('Loaded participant locations:', locations);
  };

  const fetchWeatherForLocations = async () => {
    if (participantLocations.length === 0) {
      console.log('No participant locations to fetch weather for');
      return;
    }

    console.log('Fetching weather for locations:', participantLocations);
    
    try {
      const weatherPromises = participantLocations.map(async (location) => {
        try {
          console.log(`Fetching weather for ${location.locationName} at ${location.latitude}, ${location.longitude}`);
          const response = await fetch(
            `http://localhost:3001/api/weather/current?lat=${location.latitude}&lon=${location.longitude}`
          );
          const data = await response.json();
          console.log(`Weather data for ${location.locationName}:`, data);
          return {
            participant: location.participant,
            location: location.locationName,
            weather: data.success ? data.data : null
          };
        } catch (error) {
          console.error(`Error fetching weather for ${location.locationName}:`, error);
          return {
            participant: location.participant,
            location: location.locationName,
            weather: null
          };
        }
      });

      const results = await Promise.all(weatherPromises);
      const weatherMap = {};
      results.forEach(result => {
        weatherMap[result.participant] = result;
      });
      console.log('Final weather map:', weatherMap);
      setWeatherData(weatherMap);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };

  const checkWeatherAlerts = (location, weather) => {
    if (!weather || !pool) return [];
    
    const alerts = [];
    const params = pool['weather-params'];
    
    if (weather.temperature < params['min-temp'] || weather.temperature > params['max-temp']) {
      alerts.push(`Temperature (${weather.temperature}°C) outside range (${params['min-temp']}°C - ${params['max-temp']}°C)`);
    }
    
    if (weather.rainfall < params['min-rainfall'] || weather.rainfall > params['max-rainfall']) {
      alerts.push(`Rainfall (${weather.rainfall}mm) outside range (${params['min-rainfall']}mm - ${params['max-rainfall']}mm)`);
    }
    
    if (weather.windSpeed > params['max-wind-speed']) {
      alerts.push(`Wind speed (${weather.windSpeed} km/h) exceeds maximum (${params['max-wind-speed']} km/h)`);
    }
    
    return alerts;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!pool) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Pool Not Found</h3>
        <p className="text-gray-600 mb-6">
          The insurance pool you're looking for doesn't exist.
        </p>
        <button
          onClick={() => navigate('/pools')}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Pools
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/pools')}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Pools
        </button>
      </div>

      {/* Pool Overview */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pool #{pool.id}</h1>
            <p className="text-gray-600 mt-1">
              Created by {pool.owner.substring(0, 8)}...{pool.owner.substring(-6)}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              pool['is-active'] 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {pool['is-active'] ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Funds</p>
                <p className="text-xl font-semibold text-gray-900">
                  {formatSTX(pool['total-funds'])} STX
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Participants</p>
                <p className="text-xl font-semibold text-gray-900">
                  {pool.participants?.length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Claim Amount</p>
                <p className="text-xl font-semibold text-gray-900">
                  {formatSTX(pool['claim-amount'])} STX
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-orange-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Created</p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatDate(pool['created-at'])}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Weather Parameters */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Weather Parameters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <Thermometer className="w-6 h-6 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Temperature Range</p>
                <p className="text-sm font-semibold text-gray-900">
                  {pool['weather-params']['min-temp']}°C to {pool['weather-params']['max-temp']}°C
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Droplets className="w-6 h-6 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Rainfall Range</p>
                <p className="text-sm font-semibold text-gray-900">
                  {pool['weather-params']['min-rainfall']}mm to {pool['weather-params']['max-rainfall']}mm
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Wind className="w-6 h-6 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Max Wind Speed</p>
                <p className="text-sm font-semibold text-gray-900">
                  {pool['weather-params']['max-wind-speed']} km/h
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          {!isParticipant && pool['is-active'] && (
            <button
              onClick={handleDeposit}
              disabled={depositing}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {depositing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <TrendingUp className="w-4 h-4 mr-2" />
              )}
              Join Pool (1 STX)
            </button>
          )}

          {isParticipant && (
            <span className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-green-100 text-green-800 text-sm font-medium rounded-lg">
              <TrendingUp className="w-4 h-4 mr-2" />
              Already Joined
            </span>
          )}

          {isPoolOwner && (
            <div className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-500 text-sm font-medium rounded-lg">
              <Info className="w-4 h-4 mr-2" />
              Pool Owner (No Withdrawals)
            </div>
          )}

          <button
            onClick={() => navigate(`/claims/submit?poolId=${pool.id}`)}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Submit Claim
          </button>

          <button
            onClick={async () => {
              const newShowMonitoring = !showMonitoring;
              setShowMonitoring(newShowMonitoring);
              
              if (newShowMonitoring) {
                loadParticipantLocations();
                // Wait for state to update, then fetch weather
                setTimeout(() => {
                  fetchWeatherForLocations();
                }, 100);
              }
            }}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Eye className="w-4 h-4 mr-2" />
            {showMonitoring ? 'Hide Monitoring' : 'View Monitoring'}
          </button>
        </div>
      </div>

      {/* Pool Monitoring Section */}
      {showMonitoring && (
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Pool Monitoring</h2>
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-600">
                {participantLocations.length} participant{participantLocations.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {participantLocations.length > 0 ? (
            <div className="space-y-6">
              {/* Participant Weather Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {participantLocations.map((location, index) => {
                  const weather = weatherData[location.participant];
                  const alerts = checkWeatherAlerts(location, weather?.weather);
                  
                  return (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900">{location.locationName}</h3>
                          <p className="text-sm text-gray-600">
                            {location.participant.substring(0, 8)}...{location.participant.substring(-6)}
                          </p>
                        </div>
                        <MapPin className="w-4 h-4 text-blue-600" />
                      </div>

                      {weather?.weather ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center space-x-2">
                              <Thermometer className="w-4 h-4 text-red-500" />
                              <span className="text-sm text-gray-600">Temp:</span>
                              <span className="text-sm font-semibold text-gray-900">
                                {weather.weather.temperature}°C
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Droplets className="w-4 h-4 text-blue-500" />
                              <span className="text-sm text-gray-600">Rain:</span>
                              <span className="text-sm font-semibold text-gray-900">
                                {weather.weather.rainfall}mm
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Droplets className="w-4 h-4 text-blue-400" />
                              <span className="text-sm text-gray-600">Humidity:</span>
                              <span className="text-sm font-semibold text-gray-900">
                                {weather.weather.humidity}%
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Wind className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-600">Wind:</span>
                              <span className="text-sm font-semibold text-gray-900">
                                {weather.weather.windSpeed} km/h
                              </span>
                            </div>
                          </div>

                          {alerts.length > 0 && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                              <div className="flex items-center space-x-2 mb-2">
                                <AlertCircle className="w-4 h-4 text-red-600" />
                                <span className="text-sm font-medium text-red-900">Weather Alerts</span>
                              </div>
                              <ul className="text-xs text-red-800 space-y-1">
                                {alerts.map((alert, alertIndex) => (
                                  <li key={alertIndex}>• {alert}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className="text-xs text-gray-500">
                            Updated: {new Date(weather.weather.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                                             ) : (
                         <div className="text-center py-4">
                           <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mx-auto mb-2"></div>
                           <p className="text-xs text-gray-600">Loading weather...</p>
                           <button 
                             onClick={() => fetchWeatherForLocations()}
                             className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
                           >
                             Retry
                           </button>
                         </div>
                       )}
                    </div>
                  );
                })}
              </div>

              {/* Pool Weather Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Pool Weather Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Active Participants:</span>
                    <span className="font-semibold text-gray-900 ml-2">{participantLocations.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Locations Monitored:</span>
                    <span className="font-semibold text-gray-900 ml-2">{participantLocations.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Weather Alerts:</span>
                    <span className="font-semibold text-red-600 ml-2">
                      {participantLocations.reduce((total, location) => {
                        const weather = weatherData[location.participant];
                        return total + checkWeatherAlerts(location, weather?.weather).length;
                      }, 0)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="font-semibold text-gray-900 ml-2">
                      {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Participants Yet</h3>
              <p className="text-gray-600">
                When participants join this pool with location tracking, their weather conditions will be monitored here.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Location Selection Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Select Your Location
            </h3>
            <p className="text-gray-600 mb-4">
              We need your location to monitor weather conditions for your insurance coverage.
            </p>
            
            <div className="space-y-4">
              <button
                onClick={() => handleLocationConfirm({
                  latitude: '40.7128',
                  longitude: '-74.0060',
                  locationName: 'New York, NY'
                })}
                className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium text-gray-900">New York, NY</div>
                <div className="text-sm text-gray-600">40.7128°N, 74.0060°W</div>
              </button>
              
              <button
                onClick={() => handleLocationConfirm({
                  latitude: '34.0522',
                  longitude: '-118.2437',
                  locationName: 'Los Angeles, CA'
                })}
                className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium text-gray-900">Los Angeles, CA</div>
                <div className="text-sm text-gray-600">34.0522°N, 118.2437°W</div>
              </button>
              
              <button
                onClick={() => handleLocationConfirm({
                  latitude: '41.8781',
                  longitude: '-87.6298',
                  locationName: 'Chicago, IL'
                })}
                className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium text-gray-900">Chicago, IL</div>
                <div className="text-sm text-gray-600">41.8781°N, 87.6298°W</div>
              </button>
              
              <button
                onClick={() => handleLocationConfirm({
                  latitude: '29.7604',
                  longitude: '-95.3698',
                  locationName: 'Houston, TX'
                })}
                className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium text-gray-900">Houston, TX</div>
                <div className="text-sm text-gray-600">29.7604°N, 95.3698°W</div>
              </button>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowLocationModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PoolDetails;
