import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContract } from '../contexts/ContractContext';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { 
  Shield, 
  Thermometer, 
  Droplets, 
  Wind, 
  DollarSign,
  ArrowLeft,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';

const CreatePool = () => {
  const { createInsurancePool } = useContract();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const watchClaimAmount = watch('claimAmount', 1);

  const onSubmit = async (data) => {
    if (!isAuthenticated) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setLoading(true);
      
      // Convert to contract format (STX to microSTX)
      const params = {
        minTemp: parseInt(data.minTemp),
        maxTemp: parseInt(data.maxTemp),
        minRainfall: parseInt(data.minRainfall),
        maxRainfall: parseInt(data.maxRainfall),
        maxWindSpeed: parseInt(data.maxWindSpeed),
        claimAmount: parseInt(data.claimAmount) * 1000000 // Convert to microSTX
      };

      await createInsurancePool(params);
      toast.success('Insurance pool created successfully!');
      navigate('/pools');
    } catch (error) {
      console.error('Error creating pool:', error);
      
      // Show specific error message if available
      if (error.message && error.message.includes('Leather wallet version')) {
        toast.error(error.message, {
          duration: 8000, // Show for 8 seconds
          position: 'top-center'
        });
      } else {
        toast.error('Failed to create insurance pool');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/pools')}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Pools
        </button>
      </div>

      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Insurance Pool</h1>
        <p className="text-gray-600">
          Set up weather parameters and claim amounts for your crop insurance pool
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Weather Parameters */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Thermometer className="w-5 h-5 mr-2 text-red-500" />
              Temperature Parameters
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Temperature (°C)
                </label>
                <input
                  type="number"
                  {...register('minTemp', { 
                    required: 'Minimum temperature is required',
                    min: { value: -50, message: 'Minimum temperature must be at least -50°C' },
                    max: { value: 60, message: 'Minimum temperature must be at most 60°C' }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="-10"
                />
                {errors.minTemp && (
                  <p className="mt-1 text-sm text-red-600">{errors.minTemp.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Temperature (°C)
                </label>
                <input
                  type="number"
                  {...register('maxTemp', { 
                    required: 'Maximum temperature is required',
                    min: { value: -50, message: 'Maximum temperature must be at least -50°C' },
                    max: { value: 60, message: 'Maximum temperature must be at most 60°C' }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="35"
                />
                {errors.maxTemp && (
                  <p className="mt-1 text-sm text-red-600">{errors.maxTemp.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Rainfall Parameters */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Droplets className="w-5 h-5 mr-2 text-blue-500" />
              Rainfall Parameters
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Rainfall (mm)
                </label>
                <input
                  type="number"
                  {...register('minRainfall', { 
                    required: 'Minimum rainfall is required',
                    min: { value: 0, message: 'Minimum rainfall must be at least 0mm' },
                    max: { value: 1000, message: 'Minimum rainfall must be at most 1000mm' }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="10"
                />
                {errors.minRainfall && (
                  <p className="mt-1 text-sm text-red-600">{errors.minRainfall.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Rainfall (mm)
                </label>
                <input
                  type="number"
                  {...register('maxRainfall', { 
                    required: 'Maximum rainfall is required',
                    min: { value: 0, message: 'Maximum rainfall must be at least 0mm' },
                    max: { value: 1000, message: 'Maximum rainfall must be at most 1000mm' }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="200"
                />
                {errors.maxRainfall && (
                  <p className="mt-1 text-sm text-red-600">{errors.maxRainfall.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Wind Speed Parameter */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Wind className="w-5 h-5 mr-2 text-gray-500" />
              Wind Speed Parameter
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Wind Speed (km/h)
              </label>
              <input
                type="number"
                {...register('maxWindSpeed', { 
                  required: 'Maximum wind speed is required',
                  min: { value: 0, message: 'Maximum wind speed must be at least 0 km/h' },
                  max: { value: 200, message: 'Maximum wind speed must be at most 200 km/h' }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="50"
              />
              {errors.maxWindSpeed && (
                <p className="mt-1 text-sm text-red-600">{errors.maxWindSpeed.message}</p>
              )}
            </div>
          </div>

          {/* Claim Amount */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-green-500" />
              Claim Amount
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Claim Amount (STX)
              </label>
              <input
                type="number"
                step="0.1"
                {...register('claimAmount', { 
                  required: 'Claim amount is required',
                  min: { value: 1, message: 'Claim amount must be at least 1 STX' },
                  max: { value: 1000, message: 'Claim amount must be at most 1000 STX' }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="10"
              />
              {errors.claimAmount && (
                <p className="mt-1 text-sm text-red-600">{errors.claimAmount.message}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Amount that will be paid out when weather conditions are met
              </p>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-blue-900 mb-1">
                  How Parametric Insurance Works
                </h3>
                <p className="text-sm text-blue-700">
                  Claims are automatically approved when weather conditions fall outside the specified ranges. 
                  For example, if temperature goes below {watchClaimAmount}°C or above the maximum, 
                  or if rainfall is outside the specified range, the claim will be automatically processed.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/pools')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </div>
              ) : (
                'Create Pool'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePool;
