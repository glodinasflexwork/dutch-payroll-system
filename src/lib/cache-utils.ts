// Cache utility functions for performance optimization

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>()
  
  set<T>(key: string, data: T, ttlMinutes: number = 5): void {
    const ttl = ttlMinutes * 60 * 1000 // Convert to milliseconds
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }
  
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }
    
    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data as T
  }
  
  delete(key: string): boolean {
    return this.cache.delete(key)
  }
  
  clear(): void {
    this.cache.clear()
  }
  
  // Clean up expired entries
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

// Global cache instance
export const appCache = new MemoryCache()

// Cache key generators
export const cacheKeys = {
  dashboardStats: (companyId: string) => `dashboard-stats-${companyId}`,
  employeeList: (companyId: string, page?: number, search?: string) => 
    `employees-${companyId}-${page || 'all'}-${search || 'none'}`,
  employeeProfile: (employeeId: string) => `employee-${employeeId}`,
  payrollRecords: (companyId: string, year?: number, month?: number) =>
    `payroll-${companyId}-${year || 'all'}-${month || 'all'}`,
  companyInfo: (companyId: string) => `company-${companyId}`
}

// Cache invalidation helpers
export const invalidateCache = {
  employee: (companyId: string, employeeId?: string) => {
    appCache.delete(cacheKeys.dashboardStats(companyId))
    appCache.delete(cacheKeys.employeeList(companyId))
    if (employeeId) {
      appCache.delete(cacheKeys.employeeProfile(employeeId))
    }
  },
  
  payroll: (companyId: string) => {
    appCache.delete(cacheKeys.dashboardStats(companyId))
    appCache.delete(cacheKeys.payrollRecords(companyId))
  },
  
  company: (companyId: string) => {
    appCache.delete(cacheKeys.companyInfo(companyId))
    appCache.delete(cacheKeys.dashboardStats(companyId))
  }
}

// Automatic cleanup every 10 minutes
setInterval(() => {
  appCache.cleanup()
}, 10 * 60 * 1000)

// Cache wrapper for async functions
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMinutes: number = 5
): Promise<T> {
  // Try to get from cache first
  const cached = appCache.get<T>(key)
  if (cached !== null) {
    return cached
  }
  
  // Fetch fresh data
  const data = await fetcher()
  
  // Cache the result
  appCache.set(key, data, ttlMinutes)
  
  return data
}

