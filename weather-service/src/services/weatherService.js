const axios = require('axios');
const logger = require('../utils/logger');
const { getWeatherCache, setWeatherCache } = require('./weatherCache');

class WeatherService {
  constructor() {
    this.openWeatherApiKey = process.env.OPENWEATHER_API_KEY;
    this.weatherApiKey = process.env.WEATHERAPI_KEY;
    this.accuWeatherApiKey = process.env.ACCUWEATHER_API_KEY;
    
    this.openWeatherBaseUrl = 'https://api.openweathermap.org/data/2.5';
    this.weatherApiBaseUrl = 'http://api.weatherapi.com/v1';
    this.accuWeatherBaseUrl = 'http://dataservice.accuweather.com';
  }

  /**
   * Get current weather data from multiple sources and aggregate
   */
  async getCurrentWeather(lat, lon, units = 'metric') {
    try {
      const cacheKey = `current_${lat}_${lon}_${units}`;
      const cachedData = await getWeatherCache(cacheKey);
      
      if (cachedData) {
        logger.info('Returning cached weather data');
        return cachedData;
      }

      const [openWeatherData, weatherApiData, accuWeatherData] = await Promise.allSettled([
        this.getOpenWeatherCurrent(lat, lon, units),
        this.getWeatherApiCurrent(lat, lon, units),
        this.getAccuWeatherCurrent(lat, lon, units)
      ]);

      const aggregatedData = this.aggregateWeatherData([
        openWeatherData,
        weatherApiData,
        accuWeatherData
      ], 'current');

      // Cache for 10 minutes
      await setWeatherCache(cacheKey, aggregatedData, 600);
      
      return aggregatedData;
    } catch (error) {
      logger.error('Error getting current weather:', error);
      throw new Error('Failed to fetch current weather data');
    }
  }

  /**
   * Get weather forecast from multiple sources
   */
  async getWeatherForecast(lat, lon, units = 'metric') {
    try {
      const cacheKey = `forecast_${lat}_${lon}_${units}`;
      const cachedData = await getWeatherCache(cacheKey);
      
      if (cachedData) {
        return cachedData;
      }

      const [openWeatherForecast, weatherApiForecast] = await Promise.allSettled([
        this.getOpenWeatherForecast(lat, lon, units),
        this.getWeatherApiForecast(lat, lon, units)
      ]);

      const aggregatedForecast = this.aggregateForecastData([
        openWeatherForecast,
        weatherApiForecast
      ]);

      // Cache for 30 minutes
      await setWeatherCache(cacheKey, aggregatedForecast, 1800);
      
      return aggregatedForecast;
    } catch (error) {
      logger.error('Error getting weather forecast:', error);
      throw new Error('Failed to fetch weather forecast');
    }
  }

  /**
   * Get historical weather data
   */
  async getHistoricalWeather(lat, lon, startDate, endDate) {
    try {
      const cacheKey = `historical_${lat}_${lon}_${startDate}_${endDate}`;
      const cachedData = await getWeatherCache(cacheKey);
      
      if (cachedData) {
        return cachedData;
      }

      const historicalData = await this.getWeatherApiHistorical(lat, lon, startDate, endDate);
      
      // Cache for 1 hour
      await setWeatherCache(cacheKey, historicalData, 3600);
      
      return historicalData;
    } catch (error) {
      logger.error('Error getting historical weather:', error);
      throw new Error('Failed to fetch historical weather data');
    }
  }

  /**
   * Get weather alerts
   */
  async getWeatherAlerts(lat, lon) {
    try {
      const cacheKey = `alerts_${lat}_${lon}`;
      const cachedData = await getWeatherCache(cacheKey);
      
      if (cachedData) {
        return cachedData;
      }

      const alerts = await this.getWeatherApiAlerts(lat, lon);
      
      // Cache for 5 minutes
      await setWeatherCache(cacheKey, alerts, 300);
      
      return alerts;
    } catch (error) {
      logger.error('Error getting weather alerts:', error);
      throw new Error('Failed to fetch weather alerts');
    }
  }

  /**
   * Validate weather data for insurance claims
   */
  async validateWeatherData(weatherData, location, timestamp) {
    try {
      const { lat, lon } = location;
      
      // Get official weather data for the same time and location
      const officialData = await this.getHistoricalWeather(lat, lon, timestamp, timestamp);
      
      // Compare submitted data with official data
      const validation = {
        isValid: true,
        discrepancies: [],
        confidence: 1.0
      };

      const tolerance = {
        temperature: 2, // ±2°C
        rainfall: 5,    // ±5mm
        humidity: 10,   // ±10%
        windSpeed: 5    // ±5 km/h
      };

      if (officialData && officialData.length > 0) {
        const official = officialData[0];
        
        // Check temperature
        if (Math.abs(weatherData.temperature - official.temperature) > tolerance.temperature) {
          validation.discrepancies.push({
            field: 'temperature',
            submitted: weatherData.temperature,
            official: official.temperature,
            difference: Math.abs(weatherData.temperature - official.temperature)
          });
          validation.isValid = false;
        }

        // Check rainfall
        if (Math.abs(weatherData.rainfall - official.rainfall) > tolerance.rainfall) {
          validation.discrepancies.push({
            field: 'rainfall',
            submitted: weatherData.rainfall,
            official: official.rainfall,
            difference: Math.abs(weatherData.rainfall - official.rainfall)
          });
          validation.isValid = false;
        }

        // Check humidity
        if (Math.abs(weatherData.humidity - official.humidity) > tolerance.humidity) {
          validation.discrepancies.push({
            field: 'humidity',
            submitted: weatherData.humidity,
            official: official.humidity,
            difference: Math.abs(weatherData.humidity - official.humidity)
          });
          validation.isValid = false;
        }

        // Check wind speed
        if (Math.abs(weatherData.windSpeed - official.windSpeed) > tolerance.windSpeed) {
          validation.discrepancies.push({
            field: 'windSpeed',
            submitted: weatherData.windSpeed,
            official: official.windSpeed,
            difference: Math.abs(weatherData.windSpeed - official.windSpeed)
          });
          validation.isValid = false;
        }

        // Calculate confidence score
        const totalChecks = 4;
        const passedChecks = totalChecks - validation.discrepancies.length;
        validation.confidence = passedChecks / totalChecks;
      }

      return validation;
    } catch (error) {
      logger.error('Error validating weather data:', error);
      throw new Error('Failed to validate weather data');
    }
  }

  /**
   * Get nearby weather stations
   */
  async getNearbyStations(lat, lon) {
    try {
      const cacheKey = `stations_${lat}_${lon}`;
      const cachedData = await getWeatherCache(cacheKey);
      
      if (cachedData) {
        return cachedData;
      }

      // This would typically call a weather station API
      // For now, return mock data
      const stations = [
        {
          id: 'STATION_001',
          name: 'Central Weather Station',
          distance: 2.5,
          coordinates: { lat: lat + 0.01, lon: lon + 0.01 },
          elevation: 150,
          lastUpdate: new Date().toISOString()
        },
        {
          id: 'STATION_002',
          name: 'Agricultural Weather Station',
          distance: 5.2,
          coordinates: { lat: lat - 0.02, lon: lon + 0.03 },
          elevation: 145,
          lastUpdate: new Date().toISOString()
        }
      ];

      // Cache for 1 hour
      await setWeatherCache(cacheKey, stations, 3600);
      
      return stations;
    } catch (error) {
      logger.error('Error getting weather stations:', error);
      throw new Error('Failed to fetch weather stations');
    }
  }

  /**
   * Get aggregated weather data from multiple sources
   */
  async getAggregatedWeatherData(lat, lon, units = 'metric') {
    try {
      const [current, forecast, alerts] = await Promise.all([
        this.getCurrentWeather(lat, lon, units),
        this.getWeatherForecast(lat, lon, units),
        this.getWeatherAlerts(lat, lon)
      ]);

      return {
        current,
        forecast,
        alerts,
        metadata: {
          location: { lat, lon },
          units,
          sources: ['OpenWeatherMap', 'WeatherAPI', 'AccuWeather'],
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      logger.error('Error getting aggregated weather data:', error);
      throw new Error('Failed to fetch aggregated weather data');
    }
  }

  // Private methods for individual API calls

  async getOpenWeatherCurrent(lat, lon, units) {
    if (!this.openWeatherApiKey) {
      throw new Error('OpenWeather API key not configured');
    }

    const response = await axios.get(`${this.openWeatherBaseUrl}/weather`, {
      params: {
        lat,
        lon,
        units,
        appid: this.openWeatherApiKey
      }
    });

    return {
      source: 'OpenWeatherMap',
      temperature: response.data.main.temp,
      humidity: response.data.main.humidity,
      pressure: response.data.main.pressure,
      windSpeed: response.data.wind.speed,
      windDirection: response.data.wind.deg,
      description: response.data.weather[0].description,
      icon: response.data.weather[0].icon,
      timestamp: new Date(response.data.dt * 1000).toISOString()
    };
  }

  async getWeatherApiCurrent(lat, lon, units) {
    if (!this.weatherApiKey) {
      throw new Error('WeatherAPI key not configured');
    }

    const response = await axios.get(`${this.weatherApiBaseUrl}/current.json`, {
      params: {
        key: this.weatherApiKey,
        q: `${lat},${lon}`,
        aqi: 'no'
      }
    });

    return {
      source: 'WeatherAPI',
      temperature: response.data.current.temp_c,
      humidity: response.data.current.humidity,
      pressure: response.data.current.pressure_mb,
      windSpeed: response.data.current.wind_kph,
      windDirection: response.data.current.wind_degree,
      description: response.data.current.condition.text,
      icon: response.data.current.condition.icon,
      rainfall: response.data.current.precip_mm,
      timestamp: response.data.current.last_updated
    };
  }

  async getAccuWeatherCurrent(lat, lon, units) {
    if (!this.accuWeatherApiKey) {
      throw new Error('AccuWeather API key not configured');
    }

    // First get location key
    const locationResponse = await axios.get(`${this.accuWeatherBaseUrl}/locations/v1/cities/geoposition/search`, {
      params: {
        apikey: this.accuWeatherApiKey,
        q: `${lat},${lon}`
      }
    });

    const locationKey = locationResponse.data.Key;

    // Then get current conditions
    const weatherResponse = await axios.get(`${this.accuWeatherBaseUrl}/currentconditions/v1/${locationKey}`, {
      params: {
        apikey: this.accuWeatherApiKey,
        details: true
      }
    });

    const data = weatherResponse.data[0];
    return {
      source: 'AccuWeather',
      temperature: data.Temperature.Metric.Value,
      humidity: data.RelativeHumidity,
      pressure: data.Pressure.Metric.Value,
      windSpeed: data.Wind.Speed.Metric.Value,
      windDirection: data.Wind.Direction.Degrees,
      description: data.WeatherText,
      icon: data.WeatherIcon,
      rainfall: data.Precip1hr?.Metric?.Value || 0,
      timestamp: data.LocalObservationDateTime
    };
  }

  async getOpenWeatherForecast(lat, lon, units) {
    if (!this.openWeatherApiKey) {
      throw new Error('OpenWeather API key not configured');
    }

    const response = await axios.get(`${this.openWeatherBaseUrl}/forecast`, {
      params: {
        lat,
        lon,
        units,
        appid: this.openWeatherApiKey
      }
    });

    return response.data.list.map(item => ({
      source: 'OpenWeatherMap',
      timestamp: new Date(item.dt * 1000).toISOString(),
      temperature: item.main.temp,
      humidity: item.main.humidity,
      windSpeed: item.wind.speed,
      description: item.weather[0].description,
      rainfall: item.rain?.['3h'] || 0
    }));
  }

  async getWeatherApiForecast(lat, lon, units) {
    if (!this.weatherApiKey) {
      throw new Error('WeatherAPI key not configured');
    }

    const response = await axios.get(`${this.weatherApiBaseUrl}/forecast.json`, {
      params: {
        key: this.weatherApiKey,
        q: `${lat},${lon}`,
        days: 7,
        aqi: 'no'
      }
    });

    return response.data.forecast.forecastday.flatMap(day => 
      day.hour.map(hour => ({
        source: 'WeatherAPI',
        timestamp: hour.time,
        temperature: hour.temp_c,
        humidity: hour.humidity,
        windSpeed: hour.wind_kph,
        description: hour.condition.text,
        rainfall: hour.precip_mm
      }))
    );
  }

  async getWeatherApiHistorical(lat, lon, startDate, endDate) {
    if (!this.weatherApiKey) {
      throw new Error('WeatherAPI key not configured');
    }

    const response = await axios.get(`${this.weatherApiBaseUrl}/history.json`, {
      params: {
        key: this.weatherApiKey,
        q: `${lat},${lon}`,
        dt: startDate.split('T')[0]
      }
    });

    return [{
      source: 'WeatherAPI',
      timestamp: response.data.forecast.forecastday[0].date,
      temperature: response.data.forecast.forecastday[0].day.avgtemp_c,
      humidity: response.data.forecast.forecastday[0].day.avghumidity,
      windSpeed: response.data.forecast.forecastday[0].day.maxwind_kph,
      rainfall: response.data.forecast.forecastday[0].day.totalprecip_mm
    }];
  }

  async getWeatherApiAlerts(lat, lon) {
    if (!this.weatherApiKey) {
      throw new Error('WeatherAPI key not configured');
    }

    const response = await axios.get(`${this.weatherApiBaseUrl}/forecast.json`, {
      params: {
        key: this.weatherApiKey,
        q: `${lat},${lon}`,
        days: 1,
        aqi: 'no',
        alerts: 'yes'
      }
    });

    return response.data.alerts?.alert || [];
  }

  // Helper methods for data aggregation

  aggregateWeatherData(results, type) {
    const validResults = results
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value);

    if (validResults.length === 0) {
      throw new Error('No weather data available from any source');
    }

    const aggregated = {
      temperature: this.average(validResults.map(r => r.temperature)),
      humidity: this.average(validResults.map(r => r.humidity)),
      windSpeed: this.average(validResults.map(r => r.windSpeed)),
      rainfall: this.average(validResults.map(r => r.rainfall || 0)),
      sources: validResults.map(r => r.source),
      timestamp: new Date().toISOString(),
      confidence: validResults.length / results.length
    };

    if (type === 'current') {
      aggregated.description = validResults[0].description;
      aggregated.icon = validResults[0].icon;
    }

    return aggregated;
  }

  aggregateForecastData(results) {
    const validResults = results
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value);

    if (validResults.length === 0) {
      throw new Error('No forecast data available from any source');
    }

    // Group by timestamp and aggregate
    const timeGroups = {};
    
    validResults.forEach(forecast => {
      forecast.forEach(hour => {
        const timestamp = hour.timestamp;
        if (!timeGroups[timestamp]) {
          timeGroups[timestamp] = [];
        }
        timeGroups[timestamp].push(hour);
      });
    });

    return Object.entries(timeGroups).map(([timestamp, hours]) => ({
      timestamp,
      temperature: this.average(hours.map(h => h.temperature)),
      humidity: this.average(hours.map(h => h.humidity)),
      windSpeed: this.average(hours.map(h => h.windSpeed)),
      rainfall: this.average(hours.map(h => h.rainfall || 0)),
      sources: [...new Set(hours.map(h => h.source))],
      confidence: hours.length / validResults.length
    }));
  }

  average(numbers) {
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  }
}

module.exports = new WeatherService();
