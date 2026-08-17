/**
 * Production In-Memory LRU & TTL Cache Manager for BotBlogs API
 * Protects against memory leaks, bounds key count, and provides high-speed caching
 */

class MemoryCache {
  constructor(maxEntries = 5000, defaultTtlMs = 60000) {
    this.cache = new Map();
    this.maxEntries = maxEntries;
    this.defaultTtlMs = defaultTtlMs;

    // Background cleanup timer every 60 seconds (unref'd to not block process exit)
    this.cleanupTimer = setInterval(() => {
      this.purgeExpired();
    }, 60000).unref();
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    // Refresh position for LRU
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.value;
  }

  set(key, value, ttlMs = this.defaultTtlMs) {
    if (this.cache.size >= this.maxEntries) {
      // Evict oldest entry (first item in Map)
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      value,
      expiry: Date.now() + ttlMs,
    });
    return true;
  }

  del(key) {
    return this.cache.delete(key);
  }

  delPrefix(prefix) {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  flush() {
    this.cache.clear();
  }

  purgeExpired() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

// Global singleton cache instances
const appCache = new MemoryCache(2000, 60000); // 1 minute general app cache
const viewThrottleCache = new MemoryCache(10000, 3600000); // 1 hour view throttle cache

module.exports = {
  MemoryCache,
  appCache,
  viewThrottleCache,
};
