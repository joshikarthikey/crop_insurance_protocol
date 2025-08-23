import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  Cloud, 
  Thermometer, 
  Droplets, 
  Wind, 
  MapPin,
  Search,
  RefreshCw
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const Weather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState({ lat: 40.7128, lon: -74.0060 });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Weather data fetching
  const fetchWeatherData = async (lat, lon) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/weather/current?lat=${lat}&lon=${lon}&units=metric`);
      const data = await response.json();
      
      if (data.success) {
        setWeatherData(data.data);
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchForecastData = async (lat, lon) => {
    try {
      const response = await fetch(`/api/weather/forecast?lat=${lat}&lon=${lon}&units=metric`);
      const data = await response.json();
      
      if (data.success) {
        setForecastData(data.data.slice(0, 24)); // First 24 hours
      }
    } catch (error) {
      console.error('Error fetching forecast data:', error);
    }
  };

  useEffect(() => {
    fetchWeatherData(selectedLocation.lat, selectedLocation.lon);
    fetchForecastData(selectedLocation.lat, selectedLocation.lon);
  }, [selectedLocation]);

  // Map click handler
  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        setSelectedLocation({ lat: e.latlng.lat, lon: e.latlng.lng });
      },
    });
    return null;
  };

  // Search location
  const handleSearch = async () => {
    if (!searchQuery) return;
    
    try {
      // This would typically use a geocoding service
      // For demo purposes, we'll use a simple approach
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      
      if (data.length > 0) {
        const location = data[0];
        setSelectedLocation({ lat: parseFloat(location.lat), lon: parseFloat(location.lon) });
      }
    } catch (error) {
      console.error('Error searching location:', error);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getWeatherIcon = (description) => {
    if (description.toLowerCase().includes('rain')) return '🌧️';
    if (description.toLowerCase().includes('cloud')) return '☁️';
    if (description.toLowerCase().includes('sun') || description.toLowerCase().includes('clear')) return '☀️';
    if (description.toLowerCase().includes('snow')) return '❄️';
    return '🌤️';
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Weather Data</h1>
          <p className="text-gray-600 mt-2">
            Real-time weather information for insurance claims
          </p>
        </div>
        
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <input
            type="text"
            placeholder="Search location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Current Weather Card */}
      {weatherData && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Current Weather</h2>
            <button
              onClick={() => fetchWeatherData(selectedLocation.lat, selectedLocation.lon)}
              disabled={loading}
              className="flex items-center text-green-600 hover:text-green-700 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-2">{getWeatherIcon(weatherData.description)}</div>
              <div className="text-2xl font-bold text-gray-900">{weatherData.temperature}°C</div>
              <div className="text-gray-600">{weatherData.description}</div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Thermometer className="w-8 h-8 text-red-500" />
              <div>
                <div className="text-sm text-gray-600">Temperature</div>
                <div className="text-lg font-semibold">{weatherData.temperature}°C</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Droplets className="w-8 h-8 text-blue-500" />
              <div>
                <div className="text-sm text-gray-600">Humidity</div>
                <div className="text-lg font-semibold">{weatherData.humidity}%</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Wind className="w-8 h-8 text-gray-500" />
              <div>
                <div className="text-sm text-gray-600">Wind Speed</div>
                <div className="text-lg font-semibold">{weatherData.windSpeed} km/h</div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            Data from: {weatherData.sources?.join(', ')} | 
            Confidence: {Math.round(weatherData.confidence * 100)}% |
            Last updated: {new Date(weatherData.timestamp).toLocaleString()}
          </div>
        </div>
      )}

      {/* Map */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Location Selection</h2>
        <div className="h-96 rounded-lg overflow-hidden">
          <MapContainer
            center={[selectedLocation.lat, selectedLocation.lon]}
            zoom={10}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={[selectedLocation.lat, selectedLocation.lon]}>
              <Popup>
                <div className="text-center">
                  <MapPin className="w-4 h-4 mx-auto mb-1" />
                  <div className="font-semibold">Selected Location</div>
                  <div className="text-sm text-gray-600">
                    {selectedLocation.lat.toFixed(4)}, {selectedLocation.lon.toFixed(4)}
                  </div>
                </div>
              </Popup>
            </Marker>
            <MapClickHandler />
          </MapContainer>
        </div>
      </div>

      {/* Forecast Chart */}
      {forecastData.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">24-Hour Forecast</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={formatTime}
                  interval="preserveStartEnd"
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={formatTime}
                  formatter={(value, name) => [
                    `${value}${name === 'temperature' ? '°C' : name === 'windSpeed' ? ' km/h' : '%'}`,
                    name.charAt(0).toUpperCase() + name.slice(1)
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="temperature" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="humidity" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="windSpeed" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Weather Alerts */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Weather Alerts</h2>
        <div className="text-center text-gray-500 py-8">
          <Cloud className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>No active weather alerts for this location</p>
        </div>
      </div>
    </div>
  );
};

export default Weather;
