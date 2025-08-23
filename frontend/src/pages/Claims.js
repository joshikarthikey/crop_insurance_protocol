import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useContract } from '../contexts/ContractContext';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Plus,
  Calendar,
  MapPin,
  Thermometer,
  Droplets,
  Wind,
  DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';

const Claims = () => {
  const { claims, loading, getClaims } = useContract();
  const [filteredClaims, setFilteredClaims] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadClaims();
  }, []);

  useEffect(() => {
    filterClaims();
  }, [claims, filter]);

  const loadClaims = async () => {
    try {
      await getClaims();
    } catch (error) {
      console.error('Error loading claims:', error);
      toast.error('Failed to load claims');
    }
  };

  const filterClaims = () => {
    if (filter === 'all') {
      setFilteredClaims(claims);
    } else {
      setFilteredClaims(claims.filter(claim => claim.status === filter));
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatSTX = (amount) => {
    return (amount / 1000000).toFixed(2);
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAddress = (address) => {
    return `${address.substring(0, 8)}...${address.substring(-6)}`;
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
          <h1 className="text-3xl font-bold text-gray-900">Insurance Claims</h1>
          <p className="text-gray-600 mt-2">
            View and manage insurance claims
          </p>
        </div>
        
        <Link
          to="/claims/submit"
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors mt-4 md:mt-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          Submit Claim
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex space-x-4">
          {[
            { key: 'all', label: 'All Claims', count: claims.length },
            { key: 'pending', label: 'Pending', count: claims.filter(c => c.status === 'pending').length },
            { key: 'approved', label: 'Approved', count: claims.filter(c => c.status === 'approved').length },
            { key: 'rejected', label: 'Rejected', count: claims.filter(c => c.status === 'rejected').length }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-green-100 text-green-800'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {filteredClaims.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Claims Found</h3>
          <p className="text-gray-600 mb-6">
            {filter === 'all' 
              ? 'No insurance claims have been submitted yet.'
              : `No ${filter} claims found.`
            }
          </p>
          <Link
            to="/claims/submit"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Submit First Claim
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredClaims.map((claim) => (
            <div
              key={claim.id}
              className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(claim.status)}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Claim #{claim.id}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Pool #{claim['pool-id']} • {formatAddress(claim.claimant)}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(claim.status)}`}>
                    {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-600">Amount:</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatSTX(claim.amount)} STX
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-600">Submitted:</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatDate(claim['submitted-at'])}
                    </span>
                  </div>

                  {claim['processed-at'] > 0 && (
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-purple-600" />
                      <span className="text-sm text-gray-600">Processed:</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatDate(claim['processed-at'])}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-gray-600">Location:</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {claim['weather-data'].location}
                    </span>
                  </div>
                </div>

                {/* Weather Data */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Weather Data</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-2">
                      <Thermometer className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-gray-600">Temperature:</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {claim['weather-data'].temperature}°C
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Droplets className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-600">Rainfall:</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {claim['weather-data'].rainfall}mm
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Droplets className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-gray-600">Humidity:</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {claim['weather-data'].humidity}%
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Wind className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Wind Speed:</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {claim['weather-data']['wind-speed']} km/h
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Claims;
