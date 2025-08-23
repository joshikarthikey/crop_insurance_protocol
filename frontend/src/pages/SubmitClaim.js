import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useContract } from '../contexts/ContractContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowLeft, 
  FileText, 
  Thermometer, 
  Droplets, 
  Wind, 
  MapPin,
  Info,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

const SubmitClaim = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { submitClaim, getPools } = useContract();
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [pools, setPools] = useState([]);
  const [selectedPool, setSelectedPool] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [claimStatus, setClaimStatus] = useState(null);

  useEffect(() => {
    loadPools();
  }, []);

  // Set pool from URL parameter
  useEffect(() => {
    const poolIdFromUrl = searchParams.get('poolId');
    if (poolIdFromUrl && pools.length > 0) {
      const pool = pools.find(p => p.id === parseInt(poolIdFromUrl));
      if (pool) {
        setSelectedPool(pool);
        checkEligibilityAndSubmit(pool);
      }
    }
  }, [searchParams, pools]);

  const loadPools = async () => {
    try {
      const poolsData = await getPools();
      setPools(poolsData);
    } catch (error) {
      console.error('Error loading pools:', error);
      toast.error('Failed to load insurance pools');
    }
  };

  const checkEligibilityAndSubmit = async (pool) => {
    if (!isAuthenticated) {
      toast.error('Please connect your wallet first');
      navigate('/pools');
      return;
    }

    // Check if user is a participant in this pool
    const isParticipant = pool.participants?.includes(user?.address);
    if (!isParticipant) {
      toast.error('You can only submit claims for pools you have joined');
      navigate('/pools');
      return;
    }

    setLoading(true);
    setClaimStatus('checking');

    try {
      // Get user's location (in real app, this would come from stored location)
      const mockUserLocation = {
        latitude: '40.7128',
        longitude: '-74.0060',
        locationName: 'New York, NY'
      };
      setUserLocation(mockUserLocation);

      // Fetch current weather for user's location
      const response = await fetch(
        `http://localhost:3001/api/weather/current?lat=${mockUserLocation.latitude}&lon=${mockUserLocation.longitude}`
      );
      const weatherResponse = await response.json();
      
      if (!weatherResponse.success) {
        throw new Error('Failed to fetch weather data');
      }

      setWeatherData(weatherResponse.data);
      setClaimStatus('weather-loaded');

      // Check if weather conditions trigger a claim
      const weather = weatherResponse.data;
      const params = pool['weather-params'];
      const alerts = [];

      if (weather.temperature < params['min-temp'] || weather.temperature > params['max-temp']) {
        alerts.push(`Temperature (${weather.temperature}°C) outside range (${params['min-temp']}°C - ${params['max-temp']}°C)`);
      }
      
      if (weather.rainfall < params['min-rainfall'] || weather.rainfall > params['max-rainfall']) {
        alerts.push(`Rainfall (${weather.rainfall}mm) outside range (${params['min-rainfall']}mm - ${params['max-rainfall']}mm)`);
      }
      
      if (weather.windSpeed > params['max-wind-speed']) {
        alerts.push(`Wind speed (${weather.windSpeed} km/h) exceeds maximum (${params['max-wind-speed']} km/h)`);
      }

      if (alerts.length > 0) {
        // Weather conditions trigger a claim
        setClaimStatus('claim-eligible');
        
        // Automatically submit the claim
        const claimParams = {
          poolId: pool.id,
          temperature: weather.temperature,
          rainfall: weather.rainfall,
          humidity: weather.humidity,
          windSpeed: weather.windSpeed,
          location: mockUserLocation.locationName
        };

        await submitClaim(claimParams);
        setClaimStatus('claim-submitted');
        toast.success('Claim automatically submitted due to adverse weather conditions!');
      } else {
        setClaimStatus('no-claim');
        toast.info('Current weather conditions do not trigger a claim');
      }

    } catch (error) {
      console.error('Error processing claim:', error);
      setClaimStatus('error');
      toast.error('Failed to process claim');
    } finally {
      setLoading(false);
    }
  };

  const getWeatherParamText = (params) => {
    if (!params) return '';
    const conditions = [];
    if (params['min-temp'] !== undefined) conditions.push(`Min Temp: ${params['min-temp']}°C`);
    if (params['max-temp'] !== undefined) conditions.push(`Max Temp: ${params['max-temp']}°C`);
    if (params['min-rainfall'] !== undefined) conditions.push(`Min Rainfall: ${params['min-rainfall']}mm`);
    if (params['max-rainfall'] !== undefined) conditions.push(`Max Rainfall: ${params['max-rainfall']}mm`);
    if (params['max-wind-speed'] !== undefined) conditions.push(`Max Wind: ${params['max-wind-speed']} km/h`);
    return conditions.join(', ');
  };

  const renderClaimStatus = () => {
    switch (claimStatus) {
      case 'checking':
        return (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Checking Eligibility</h3>
            <p className="text-gray-600">Verifying your participation and current weather conditions...</p>
          </div>
        );

      case 'weather-loaded':
        return (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Analyzing Weather Data</h3>
            <p className="text-gray-600">Comparing current conditions with pool parameters...</p>
          </div>
        );

      case 'claim-eligible':
        return (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Submitting Claim</h3>
            <p className="text-gray-600">Weather conditions trigger automatic claim submission...</p>
          </div>
        );

      case 'claim-submitted':
        return (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Claim Submitted Successfully!</h3>
            <p className="text-gray-600 mb-6">Your claim has been automatically submitted due to adverse weather conditions.</p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-green-900 mb-2">Claim Details</h4>
              <div className="text-sm text-green-800 space-y-1">
                <p>Pool: #{selectedPool?.id}</p>
                <p>Location: {userLocation?.locationName}</p>
                <p>Weather: {weatherData?.description}</p>
                <p>Amount: {(selectedPool?.['claim-amount'] / 1000000).toFixed(2)} STX</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/claims')}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              View All Claims
            </button>
          </div>
        );

      case 'no-claim':
        return (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Claim Triggered</h3>
            <p className="text-gray-600 mb-6">Current weather conditions are within acceptable parameters.</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-blue-900 mb-2">Current Weather</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>Location: {userLocation?.locationName}</p>
                <p>Temperature: {weatherData?.temperature}°C</p>
                <p>Rainfall: {weatherData?.rainfall}mm</p>
                <p>Wind Speed: {weatherData?.windSpeed} km/h</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/pools')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Pools
            </button>
          </div>
        );

      case 'error':
        return (
          <div className="text-center py-8">
            <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Processing Claim</h3>
            <p className="text-gray-600 mb-6">There was an error processing your claim. Please try again.</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Initializing Claim Process</h3>
            <p className="text-gray-600">Setting up automatic claim verification...</p>
          </div>
        );
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/claims')}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Claims
        </button>
      </div>

      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Automatic Claim Processing</h1>
        <p className="text-gray-600">
          Your claim is being automatically processed based on current weather conditions
        </p>
      </div>

            <div className="bg-white rounded-lg shadow-md p-6">
        {renderClaimStatus()}
      </div>
    </div>
  );
};

export default SubmitClaim;
