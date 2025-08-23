const express = require('express');
const router = express.Router();
const Joi = require('joi');

const weatherService = require('../services/weatherService');
const { validateRequest } = require('../middleware/validation');
const logger = require('../utils/logger');

// Validation schemas
const locationSchema = Joi.object({
  lat: Joi.number().min(-90).max(90).required(),
  lon: Joi.number().min(-180).max(180).required()
});

const dateRangeSchema = Joi.object({
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).required()
});

const weatherParamsSchema = Joi.object({
  lat: Joi.number().min(-90).max(90).required(),
  lon: Joi.number().min(-180).max(180).required(),
  units: Joi.string().valid('metric', 'imperial').default('metric')
});

/**
 * @route GET /api/weather/current
 * @desc Get current weather data for a location
 * @access Public
 */
router.get('/current', validateRequest(weatherParamsSchema, 'query'), async (req, res) => {
  try {
    const { lat, lon, units = 'metric' } = req.query;
    
    logger.info('Fetching current weather data', { lat, lon, units });
    
    const weatherData = await weatherService.getCurrentWeather(lat, lon, units);
    
    res.json({
      success: true,
      data: weatherData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching current weather:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch weather data',
      message: error.message
    });
  }
});

/**
 * @route GET /api/weather/forecast
 * @desc Get weather forecast for a location
 * @access Public
 */
router.get('/forecast', validateRequest(weatherParamsSchema, 'query'), async (req, res) => {
  try {
    const { lat, lon, units = 'metric' } = req.query;
    
    logger.info('Fetching weather forecast', { lat, lon, units });
    
    const forecastData = await weatherService.getWeatherForecast(lat, lon, units);
    
    res.json({
      success: true,
      data: forecastData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching weather forecast:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch forecast data',
      message: error.message
    });
  }
});

/**
 * @route GET /api/weather/historical
 * @desc Get historical weather data for a location and date range
 * @access Public
 */
router.get('/historical', validateRequest({
  ...locationSchema,
  ...dateRangeSchema
}, 'query'), async (req, res) => {
  try {
    const { lat, lon, startDate, endDate } = req.query;
    
    logger.info('Fetching historical weather data', { lat, lon, startDate, endDate });
    
    const historicalData = await weatherService.getHistoricalWeather(lat, lon, startDate, endDate);
    
    res.json({
      success: true,
      data: historicalData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching historical weather:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch historical data',
      message: error.message
    });
  }
});

/**
 * @route GET /api/weather/alerts
 * @desc Get weather alerts for a location
 * @access Public
 */
router.get('/alerts', validateRequest(locationSchema, 'query'), async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    logger.info('Fetching weather alerts', { lat, lon });
    
    const alerts = await weatherService.getWeatherAlerts(lat, lon);
    
    res.json({
      success: true,
      data: alerts,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching weather alerts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch weather alerts',
      message: error.message
    });
  }
});

/**
 * @route POST /api/weather/validate
 * @desc Validate weather data for insurance claims
 * @access Public
 */
router.post('/validate', async (req, res) => {
  try {
    const { weatherData, location, timestamp } = req.body;
    
    logger.info('Validating weather data for insurance claim', { location, timestamp });
    
    const validationResult = await weatherService.validateWeatherData(weatherData, location, timestamp);
    
    res.json({
      success: true,
      data: validationResult,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error validating weather data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate weather data',
      message: error.message
    });
  }
});

/**
 * @route GET /api/weather/stations
 * @desc Get nearby weather stations for a location
 * @access Public
 */
router.get('/stations', validateRequest(locationSchema, 'query'), async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    logger.info('Fetching nearby weather stations', { lat, lon });
    
    const stations = await weatherService.getNearbyStations(lat, lon);
    
    res.json({
      success: true,
      data: stations,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching weather stations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch weather stations',
      message: error.message
    });
  }
});

/**
 * @route GET /api/weather/aggregated
 * @desc Get aggregated weather data from multiple sources
 * @access Public
 */
router.get('/aggregated', validateRequest(weatherParamsSchema, 'query'), async (req, res) => {
  try {
    const { lat, lon, units = 'metric' } = req.query;
    
    logger.info('Fetching aggregated weather data', { lat, lon, units });
    
    const aggregatedData = await weatherService.getAggregatedWeatherData(lat, lon, units);
    
    res.json({
      success: true,
      data: aggregatedData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching aggregated weather data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch aggregated weather data',
      message: error.message
    });
  }
});

module.exports = router;
