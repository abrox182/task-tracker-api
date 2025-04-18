const cacheService = require('../services/cacheService');
const logger = require('../utils/logger');

/**
 * Middleware to cache responses
 * @param {string} key - Cache key or prefix
 * @param {number} ttl - Time to live in seconds
 */
exports.cacheMiddleware = (key, ttl = 300) => {
  return (req, res, next) => {
    // Create a unique cache key based on the provided key and request parameters
    const cacheKey = `${key}:${JSON.stringify(req.params)}:${JSON.stringify(req.query)}`;
    
    // Check if we have a cached response
    const cachedData = cacheService.get(cacheKey);
    
    if (cachedData) {
      logger.debug(`Cache hit for ${cacheKey}`);
      return res.json(cachedData);
    }
    
    // If no cache hit, capture the response
    const originalSend = res.json;
    
    res.json = function(data) {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        logger.debug(`Caching response for ${cacheKey}`);
        cacheService.set(cacheKey, data, ttl);
      }
      
      // Call the original json method
      return originalSend.call(this, data);
    };
    
    next();
  };
};

/**
 * Middleware to clear cache on write operations
 * @param {string} keyPrefix - Cache key prefix to clear
 */
exports.clearCache = (keyPrefix) => {
  return (req, res, next) => {
    // Store the original end function
    const originalEnd = res.end;
    
    // Override end to clear cache after successful response
    res.end = function() {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        logger.debug(`Clearing cache with prefix ${keyPrefix}`);
        cacheService.clearByPrefix(keyPrefix);
      }
      
      // Call the original end function
      return originalEnd.apply(this, arguments);
    };
    
    next();
  };
};
