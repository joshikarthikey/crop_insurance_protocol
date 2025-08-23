import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Shield, 
  Cloud, 
  TrendingUp, 
  Users, 
  Zap, 
  Globe,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const Home = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: Shield,
      title: 'Parametric Insurance',
      description: 'Automatic claim settlements based on weather data without manual intervention.'
    },
    {
      icon: Cloud,
      title: 'Weather Data Integration',
      description: 'Real-time weather data from multiple sources for accurate claim processing.'
    },
    {
      icon: TrendingUp,
      title: 'Transparent Payouts',
      description: 'All transactions and settlements are recorded on the blockchain for transparency.'
    },
    {
      icon: Users,
      title: 'Community Pools',
      description: 'Join insurance pools with other farmers to share risk and reduce costs.'
    },
    {
      icon: Zap,
      title: 'Instant Processing',
      description: 'Claims are automatically processed and settled within 24 hours.'
    },
    {
      icon: Globe,
      title: 'Global Coverage',
      description: 'Access to weather data and insurance coverage worldwide.'
    }
  ];

  const benefits = [
    'No manual claim processing required',
    'Transparent and auditable transactions',
    'Lower costs compared to traditional insurance',
    'Real-time weather monitoring',
    'Automatic payout triggers',
    'Community-driven risk sharing'
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
            Parametric Crop Insurance
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
            Decentralized insurance protocol that automatically settles claims based on weather data
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {!isAuthenticated ? (
            <Link
              to="/pools"
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white text-lg font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              Get Started
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          ) : (
            <Link
              to="/pools"
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white text-lg font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              View Insurance Pools
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          )}
          <Link
            to="/weather"
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 text-lg font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Check Weather Data
            <Cloud className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our protocol uses smart contracts and real-time weather data to provide 
            automatic crop insurance with transparent settlements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-green-50 rounded-2xl p-8 md:p-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Why Choose Parametric Insurance?
          </h2>
          <p className="text-lg text-gray-600">
            Traditional crop insurance is slow, expensive, and prone to fraud. 
            Our parametric approach solves these problems.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">{benefit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center space-y-6">
        <h2 className="text-3xl font-bold text-gray-900">
          Ready to Get Started?
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Join the future of crop insurance. Create or join an insurance pool 
          and protect your crops with automated weather-based settlements.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/pools/create"
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white text-lg font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            Create Insurance Pool
            <Shield className="ml-2 w-5 h-5" />
          </Link>
          <Link
            to="/pools"
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 text-lg font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Browse Existing Pools
            <Users className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">24h</div>
          <div className="text-gray-600">Claim Processing Time</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">100%</div>
          <div className="text-gray-600">Automated Processing</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">Global</div>
          <div className="text-gray-600">Weather Coverage</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">Transparent</div>
          <div className="text-gray-600">Blockchain Records</div>
        </div>
      </div>
    </div>
  );
};

export default Home;
