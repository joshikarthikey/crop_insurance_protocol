const Redis = require('redis');
const logger = require('../utils/logger');

let redisClient = null;
let redisConnected = false;

/**
 * Initialize Redis client
 */
async function initializeWeatherCache() {
  try {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    redisClient = Redis.createClient({
      url: redisUrl,
      retry_strategy: (options) => {
        if (options.error && options.error.code === 'ECONNREFUSED') {
          logger.info('Redis server not available, using in-memory cache');
          return new Error('Redis server refused connection');
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
          logger.info('Redis retry time exhausted, using in-memory cache');
          return new Error('Redis retry time exhausted');
        }
        if (options.attempt > 3) {
          logger.info('Redis max retry attempts reached, using in-memory cache');
          return undefined;
        }
        return Math.min(options.attempt * 100, 3000);
      }
    });

    redisClient.on('error', (err) => {
      if (err.code !== 'ECONNREFUSED') {
        logger.error('Redis Client Error:', err);
      }
      redisConnected = false;
    });

    redisClient.on('connect', () => {
      logger.info('Redis client connected');
      redisConnected = true;
    });

    redisClient.on('ready', () => {
      logger.info('Redis client ready');
      redisConnected = true;
    });

    redisClient.on('end', () => {
      logger.info('Redis client disconnected');
      redisConnected = false;
    });

    await redisClient.connect();
    
    // Test connection
    await redisClient.ping();
    logger.info('Redis connection test successful');
    redisConnected = true;
    
  } catch (error) {
    logger.info('Failed to initialize Redis cache, using in-memory cache');
    // Fallback to in-memory cache if Redis is not available
    initializeInMemoryCache();
  }
}

// In-memory cache fallback
let inMemoryCache = new Map();

function initializeInMemoryCache() {
  // Clear cache every hour to prevent memory leaks
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of inMemoryCache.entries()) {
      if (value.expiry && now > value.expiry) {
        inMemoryCache.delete(key);
      }
    }
  }, 3600000); // 1 hour
}

/**
 * Get weather data from cache
 */
async function getWeatherCache(key) {
  try {
    if (redisClient && redisConnected && redisClient.isReady) {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } else {
      // Fallback to in-memory cache
      const cached = inMemoryCache.get(key);
      if (cached && (!cached.expiry || Date.now() < cached.expiry)) {
        return cached.data;
      }
      return null;
    }
  } catch (error) {
    // Fallback to in-memory cache on error
    const cached = inMemoryCache.get(key);
    if (cached && (!cached.expiry || Date.now() < cached.expiry)) {
      return cached.data;
    }
    return null;
  }
}

/**
 * Set weather data in cache
 */
async function setWeatherCache(key, data, ttlSeconds = 600) {
  try {
    if (redisClient && redisConnected && redisClient.isReady) {
      await redisClient.setEx(key, ttlSeconds, JSON.stringify(data));
    } else {
      // Fallback to in-memory cache
      inMemoryCache.set(key, {
        data,
        expiry: Date.now() + (ttlSeconds * 1000)
      });
    }
  } catch (error) {
    // Fallback to in-memory cache on error
    inMemoryCache.set(key, {
      data,
      expiry: Date.now() + (ttlSeconds * 1000)
    });
  }
}

/**
 * Delete weather data from cache
 */
async function deleteWeatherCache(key) {
  try {
    if (redisClient && redisConnected && redisClient.isReady) {
      await redisClient.del(key);
    } else {
      // Fallback to in-memory cache
      inMemoryCache.delete(key);
    }
  } catch (error) {
    // Fallback to in-memory cache on error
    inMemoryCache.delete(key);
  }
}

/**
 * Clear all weather cache
 */
async function clearWeatherCache() {
  try {
    if (redisClient && redisConnected && redisClient.isReady) {
      await redisClient.flushDb();
    } else {
      // Fallback to in-memory cache
      inMemoryCache.clear();
    }
    logger.info('Weather cache cleared');
  } catch (error) {
    logger.error('Error clearing weather cache:', error);
  }
}

/**
 * Get cache statistics
 */
async function getCacheStats() {
  try {
    if (redisClient && redisConnected && redisClient.isReady) {
      const info = await redisClient.info();
      const keys = await redisClient.dbSize();
      return {
        type: 'redis',
        keys,
        info: info.split('\r\n').filter(line => line.includes(':'))
      };
    } else {
      return {
        type: 'in-memory',
        keys: inMemoryCache.size,
        info: ['Using in-memory cache fallback']
      };
    }
  } catch (error) {
    return {
      type: 'in-memory',
      keys: inMemoryCache.size,
      info: ['Using in-memory cache fallback due to error']
    };
  }
}

/**
 * Close Redis connection
 */
async function closeWeatherCache() {
  try {
    if (redisClient && redisConnected && redisClient.isReady) {
      await redisClient.quit();
      logger.info('Redis connection closed');
    }
  } catch (error) {
    logger.error('Error closing Redis connection:', error);
  }
}

module.exports = {
  initializeWeatherCache,
  getWeatherCache,
  setWeatherCache,
  deleteWeatherCache,
  clearWeatherCache,
  getCacheStats,
  closeWeatherCache
};
