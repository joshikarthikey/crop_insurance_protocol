const express = require('express');
const router = express.Router();
const weatherService = require('../services/weatherService');
const logger = require('../utils/logger');

/**
 * @route GET /api/health
 * @desc Health check endpoint
 * @access Public
 */
router.get('/', async (req, res) => {
  try {
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0'
    };

    res.json(healthStatus);
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route GET /api/health/weather
 * @desc Weather service health check
 * @access Public
 */
router.get('/weather', async (req, res) => {
  try {
    // Test weather service with a known location
    const testLocation = { lat: 40.7128, lon: -74.0060 }; // New York
    const weatherData = await weatherService.getCurrentWeather(
      testLocation.lat,
      testLocation.lon,
      'metric'
    );

    res.json({
      status: 'healthy',
      weatherService: 'operational',
      testLocation,
      sampleData: {
        temperature: weatherData.temperature,
        humidity: weatherData.humidity,
        sources: weatherData.sources,
        confidence: weatherData.confidence
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Weather service health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      weatherService: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route GET /api/health/detailed
 * @desc Detailed health check with all services
 * @access Public
 */
router.get('/detailed', async (req, res) => {
  try {
    const checks = {
      server: true,
      weatherService: false,
      cache: false,
      apis: {
        openWeather: false,
        weatherApi: false,
        accuWeather: false
      }
    };

    // Test weather service
    try {
      const testLocation = { lat: 40.7128, lon: -74.0060 };
      await weatherService.getCurrentWeather(testLocation.lat, testLocation.lon, 'metric');
      checks.weatherService = true;
    } catch (error) {
      logger.error('Weather service check failed:', error);
    }

    // Test individual APIs
    try {
      const testLocation = { lat: 40.7128, lon: -74.0060 };
      await weatherService.getOpenWeatherCurrent(testLocation.lat, testLocation.lon, 'metric');
      checks.apis.openWeather = true;
    } catch (error) {
      logger.error('OpenWeather API check failed:', error);
    }

    try {
      const testLocation = { lat: 40.7128, lon: -74.0060 };
      await weatherService.getWeatherApiCurrent(testLocation.lat, testLocation.lon, 'metric');
      checks.apis.weatherApi = true;
    } catch (error) {
      logger.error('WeatherAPI check failed:', error);
    }

    try {
      const testLocation = { lat: 40.7128, lon: -74.0060 };
      await weatherService.getAccuWeatherCurrent(testLocation.lat, testLocation.lon, 'metric');
      checks.apis.accuWeather = true;
    } catch (error) {
      logger.error('AccuWeather API check failed:', error);
    }

    // Test cache
    try {
      const { getWeatherCache, setWeatherCache } = require('../services/weatherCache');
      await setWeatherCache('health_test', { test: true }, 60);
      const cached = await getWeatherCache('health_test');
      checks.cache = cached && cached.test === true;
    } catch (error) {
      logger.error('Cache check failed:', error);
    }

    const overallStatus = checks.server && checks.weatherService && checks.cache;

    res.json({
      status: overallStatus ? 'healthy' : 'degraded',
      checks,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage()
    });
  } catch (error) {
    logger.error('Detailed health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
