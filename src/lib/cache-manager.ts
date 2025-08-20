/**
 * Simple In-Memory Cache Manager
 * Provides caching for frequently accessed data to reduce database load
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class CacheManager {
  private cache = new Map<string, CacheEntry<any>>()
  private defaultTTL = 300000 // 5 minutes in milliseconds

  /**
   * Get data from cache or execute function if not cached
   */
  async getOrSet<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    options: { ttl?: number } = {}
  ): Promise<T> {
    const ttl = options.ttl || this.defaultTTL
    const cached = this.cache.get(key)

    // Check if cached data is still valid
    if (cached && (Date.now() - cached.timestamp) < cached.ttl) {
      console.log(`📦 Cache HIT for key: ${key}`)
      return cached.data
    }

    // Fetch fresh data
    console.log(`🔄 Cache MISS for key: ${key}, fetching fresh data`)
    const data = await fetchFunction()

    // Store in cache
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })

    return data
  }

  /**
   * Get data from cache
   */
  get<T>(key: string): T | null {
    const cached = this.cache.get(key)
    
    if (!cached) {
      return null
    }

    // Check if expired
    if ((Date.now() - cached.timestamp) >= cached.ttl) {
      this.cache.delete(key)
      return null
    }

    return cached.data
  }

  /**
   * Set data in cache
   */
  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    })
  }

  /**
   * Delete from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * Clear expired entries
   */
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if ((now - entry.timestamp) >= entry.ttl) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }

  /**
   * Generate cache key for company data
   */
  static companyKey(companyId: string): string {
    return `company:${companyId}`
  }

  /**
   * Generate cache key for employee data
   */
  static employeeKey(companyId: string, employeeId: string): string {
    return `employee:${companyId}:${employeeId}`
  }

  /**
   * Generate cache key for payroll record
   */
  static payrollRecordKey(companyId: string, employeeId: string, year: number, month: number): string {
    return `payroll:${companyId}:${employeeId}:${year}:${month}`
  }
}

// Export singleton instance
export const cache = new CacheManager()

// Auto-cleanup every 10 minutes
setInterval(() => {
  cache.cleanup()
  console.log('🧹 Cache cleanup completed, current size:', cache.getStats().size)
}, 600000)

export default CacheManager

