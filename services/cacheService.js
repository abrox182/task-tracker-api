class InMemoryCache {
    constructor() {
      this.cache = new Map();
      this.ttl = new Map();
    }
    
    /**
     * Set a value in the cache with an optional TTL (time to live) in seconds
     */
    set(key, value, ttlSeconds = 300) {
      this.cache.set(key, value);
      
      // Set expiration time
      if (ttlSeconds > 0) {
        const expires = Date.now() + (ttlSeconds * 1000);
        this.ttl.set(key, expires);
        
        // Auto-delete after TTL
        setTimeout(() => {
          if (this.ttl.get(key) === expires) {
            this.delete(key);
          }
        }, ttlSeconds * 1000);
      }
    }
    
    /**
     * Get a value from the cache
     */
    get(key) {
      // Check if the key exists and hasn't expired
      if (this.has(key)) {
        return this.cache.get(key);
      }
      return null;
    }
    
    /**
     * Check if a key exists in the cache and hasn't expired
     */
    has(key) {
      if (!this.cache.has(key)) {
        return false;
      }
      
      // Check if the key has expired
      const expires = this.ttl.get(key);
      if (expires && expires < Date.now()) {
        this.delete(key);
        return false;
      }
      
      return true;
    }
    
    /**
     * Delete a key from the cache
     */
    delete(key) {
      this.cache.delete(key);
      this.ttl.delete(key);
    }
    
    /**
     * Clear all keys from the cache
     */
    clear() {
      this.cache.clear();
      this.ttl.clear();
    }
    
    /**
     * Clear cache keys by pattern (prefix matching)
     */
    clearByPrefix(prefix) {
      for (const key of this.cache.keys()) {
        if (key.startsWith(prefix)) {
          this.delete(key);
        }
      }
    }
  }
  
  // Create and export a singleton instance
  const cacheInstance = new InMemoryCache();
  module.exports = cacheInstance;
  