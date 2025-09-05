// Advanced Caching System with Redis-like capabilities
// Provides sophisticated caching strategies for production-scale performance

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  accessCount: number
  lastAccessed: number
  tags: string[]
}

interface CacheStats {
  hits: number
  misses: number
  evictions: number
  totalEntries: number
  memoryUsage: number
}

interface CacheOptions {
  ttl?: number // Time to live in minutes
  tags?: string[] // Tags for cache invalidation
  priority?: 'low' | 'normal' | 'high' // Priority for eviction
  compress?: boolean // Compress large objects
}

class AdvancedMemoryCache {
  private cache = new Map<string, CacheEntry<any>>()
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    totalEntries: 0,
    memoryUsage: 0
  }
  
  private maxSize: number = 1000 // Maximum number of entries
  private maxMemoryMB: number = 100 // Maximum memory usage in MB
  
  constructor(maxSize: number = 1000, maxMemoryMB: number = 100) {
    this.maxSize = maxSize
    this.maxMemoryMB = maxMemoryMB
    
    // Cleanup expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000)
    
    // Memory pressure cleanup every minute
    setInterval(() => this.memoryPressureCleanup(), 60 * 1000)
  }
  
  /**
   * Set a value in cache with advanced options
   */
  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const {
      ttl = 5, // Default 5 minutes
      tags = [],
      priority = 'normal',
      compress = false
    } = options
    
    // Estimate memory usage (rough calculation)
    const dataSize = this.estimateSize(data)
    
    // Check if we need to evict entries
    this.evictIfNecessary(dataSize)
    
    const entry: CacheEntry<T> = {
      data: compress ? this.compress(data) : data,
      timestamp: Date.now(),
      ttl: ttl * 60 * 1000, // Convert to milliseconds
      accessCount: 0,
      lastAccessed: Date.now(),
      tags: [...tags, `priority:${priority}`]
    }
    
    this.cache.set(key, entry)
    this.stats.totalEntries = this.cache.size
    this.updateMemoryUsage()
  }
  
  /**
   * Get a value from cache with hit/miss tracking
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      this.stats.misses++
      return null
    }
    
    // Check if expired
    if (this.isExpired(entry)) {
      this.cache.delete(key)
      this.stats.misses++
      this.stats.evictions++
      return null
    }
    
    // Update access statistics
    entry.accessCount++
    entry.lastAccessed = Date.now()
    this.stats.hits++
    
    // Decompress if needed
    const data = this.isCompressed(entry.data) ? this.decompress(entry.data) : entry.data
    return data as T
  }
  
  /**
   * Get multiple values at once (batch operation)
   */
  mget<T>(keys: string[]): Map<string, T | null> {
    const results = new Map<string, T | null>()
    
    for (const key of keys) {
      results.set(key, this.get<T>(key))
    }
    
    return results
  }
  
  /**
   * Set multiple values at once (batch operation)
   */
  mset<T>(entries: Map<string, { data: T; options?: CacheOptions }>): void {
    for (const [key, { data, options }] of entries) {
      this.set(key, data, options)
    }
  }
  
  /**
   * Delete a specific key
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key)
    if (deleted) {
      this.stats.totalEntries = this.cache.size
      this.updateMemoryUsage()
    }
    return deleted
  }
  
  /**
   * Delete all keys matching a pattern
   */
  deletePattern(pattern: string): number {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'))
    let deletedCount = 0
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
        deletedCount++
      }
    }
    
    this.stats.totalEntries = this.cache.size
    this.updateMemoryUsage()
    return deletedCount
  }
  
  /**
   * Delete all keys with specific tags
   */
  deleteByTags(tags: string[]): number {
    let deletedCount = 0
    
    for (const [key, entry] of this.cache.entries()) {
      const hasMatchingTag = tags.some(tag => entry.tags.includes(tag))
      if (hasMatchingTag) {
        this.cache.delete(key)
        deletedCount++
      }
    }
    
    this.stats.totalEntries = this.cache.size
    this.updateMemoryUsage()
    return deletedCount
  }
  
  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear()
    this.stats.totalEntries = 0
    this.stats.memoryUsage = 0
  }
  
  /**
   * Get cache statistics
   */
  getStats(): CacheStats & { hitRate: number } {
    const total = this.stats.hits + this.stats.misses
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0
    
    return {
      ...this.stats,
      hitRate: Math.round(hitRate * 100) / 100
    }
  }
  
  /**
   * Get all keys matching a pattern
   */
  keys(pattern?: string): string[] {
    const allKeys = Array.from(this.cache.keys())
    
    if (!pattern) {
      return allKeys
    }
    
    const regex = new RegExp(pattern.replace(/\*/g, '.*'))
    return allKeys.filter(key => regex.test(key))
  }
  
  /**
   * Check if a key exists
   */
  exists(key: string): boolean {
    const entry = this.cache.get(key)
    return entry !== undefined && !this.isExpired(entry)
  }
  
  /**
   * Set expiration time for an existing key
   */
  expire(key: string, ttlMinutes: number): boolean {
    const entry = this.cache.get(key)
    if (!entry) {
      return false
    }
    
    entry.ttl = ttlMinutes * 60 * 1000
    entry.timestamp = Date.now()
    return true
  }
  
  /**
   * Get time to live for a key (in seconds)
   */
  ttl(key: string): number {
    const entry = this.cache.get(key)
    if (!entry) {
      return -2 // Key doesn't exist
    }
    
    if (this.isExpired(entry)) {
      return -1 // Key expired
    }
    
    const remaining = entry.ttl - (Date.now() - entry.timestamp)
    return Math.ceil(remaining / 1000)
  }
  
  // Private helper methods
  
  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > entry.ttl
  }
  
  private cleanup(): void {
    const now = Date.now()
    let cleanedCount = 0
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
        cleanedCount++
      }
    }
    
    if (cleanedCount > 0) {
      this.stats.evictions += cleanedCount
      this.stats.totalEntries = this.cache.size
      this.updateMemoryUsage()
      console.log(`Cache cleanup: removed ${cleanedCount} expired entries`)
    }
  }
  
  private memoryPressureCleanup(): void {
    const currentMemoryMB = this.stats.memoryUsage / (1024 * 1024)
    
    if (currentMemoryMB > this.maxMemoryMB) {
      this.evictLRU(Math.ceil(this.cache.size * 0.1)) // Evict 10% of entries
    }
  }
  
  private evictIfNecessary(newDataSize: number): void {
    // Check size limit
    if (this.cache.size >= this.maxSize) {
      this.evictLRU(1)
    }
    
    // Check memory limit
    const currentMemoryMB = (this.stats.memoryUsage + newDataSize) / (1024 * 1024)
    if (currentMemoryMB > this.maxMemoryMB) {
      this.evictLRU(Math.ceil(this.cache.size * 0.05)) // Evict 5% of entries
    }
  }
  
  private evictLRU(count: number): void {
    // Sort entries by last accessed time and priority
    const entries = Array.from(this.cache.entries())
      .map(([key, entry]) => ({
        key,
        entry,
        priority: this.getPriorityScore(entry)
      }))
      .sort((a, b) => {
        // First sort by priority (low priority evicted first)
        if (a.priority !== b.priority) {
          return a.priority - b.priority
        }
        // Then by last accessed time (oldest first)
        return a.entry.lastAccessed - b.entry.lastAccessed
      })
    
    for (let i = 0; i < Math.min(count, entries.length); i++) {
      this.cache.delete(entries[i].key)
      this.stats.evictions++
    }
    
    this.stats.totalEntries = this.cache.size
    this.updateMemoryUsage()
  }
  
  private getPriorityScore(entry: CacheEntry<any>): number {
    const priorityTag = entry.tags.find(tag => tag.startsWith('priority:'))
    const priority = priorityTag?.split(':')[1] || 'normal'
    
    switch (priority) {
      case 'high': return 3
      case 'normal': return 2
      case 'low': return 1
      default: return 2
    }
  }
  
  private estimateSize(data: any): number {
    // Rough estimation of object size in bytes
    const jsonString = JSON.stringify(data)
    return jsonString.length * 2 // Rough estimate for UTF-16
  }
  
  private updateMemoryUsage(): void {
    let totalSize = 0
    for (const entry of this.cache.values()) {
      totalSize += this.estimateSize(entry)
    }
    this.stats.memoryUsage = totalSize
  }
  
  private compress(data: any): any {
    // Simple compression simulation (in real implementation, use actual compression)
    return {
      __compressed: true,
      data: JSON.stringify(data)
    }
  }
  
  private decompress(data: any): any {
    if (this.isCompressed(data)) {
      return JSON.parse(data.data)
    }
    return data
  }
  
  private isCompressed(data: any): boolean {
    return data && typeof data === 'object' && data.__compressed === true
  }
}

// Global advanced cache instance
export const advancedCache = new AdvancedMemoryCache(2000, 200) // 2000 entries, 200MB max

// Specialized cache instances for different data types
export const dashboardCache = new AdvancedMemoryCache(500, 50) // Dashboard data
export const employeeCache = new AdvancedMemoryCache(1000, 100) // Employee data
export const payrollCache = new AdvancedMemoryCache(1500, 150) // Payroll data

// Cache key generators with advanced patterns
export const advancedCacheKeys = {
  // Dashboard keys
  dashboardStats: (companyId: string) => `dashboard:stats:${companyId}`,
  dashboardCharts: (companyId: string, period: string) => `dashboard:charts:${companyId}:${period}`,
  
  // Employee keys
  employeeList: (companyId: string, filters: string) => `employees:list:${companyId}:${filters}`,
  employeeProfile: (employeeId: string) => `employees:profile:${employeeId}`,
  employeeSearch: (companyId: string, query: string) => `employees:search:${companyId}:${query}`,
  
  // Payroll keys
  payrollRecords: (companyId: string, period: string) => `payroll:records:${companyId}:${period}`,
  payrollCalculation: (employeeId: string, period: string) => `payroll:calc:${employeeId}:${period}`,
  payrollAnalytics: (companyId: string, year: number) => `payroll:analytics:${companyId}:${year}`,
  
  // Compliance keys
  complianceData: (companyId: string) => `compliance:data:${companyId}`,
  taxCalculations: (employeeId: string, year: number) => `tax:calc:${employeeId}:${year}`
}

// Advanced cache invalidation with tags
export const advancedInvalidation = {
  employee: (companyId: string, employeeId?: string) => {
    const tags = [`company:${companyId}`, 'employees']
    if (employeeId) {
      tags.push(`employee:${employeeId}`)
    }
    
    employeeCache.deleteByTags(tags)
    dashboardCache.deleteByTags([`company:${companyId}`])
  },
  
  payroll: (companyId: string, employeeId?: string) => {
    const tags = [`company:${companyId}`, 'payroll']
    if (employeeId) {
      tags.push(`employee:${employeeId}`)
    }
    
    payrollCache.deleteByTags(tags)
    dashboardCache.deleteByTags([`company:${companyId}`])
  },
  
  company: (companyId: string) => {
    const companyTag = `company:${companyId}`
    
    dashboardCache.deleteByTags([companyTag])
    employeeCache.deleteByTags([companyTag])
    payrollCache.deleteByTags([companyTag])
  },
  
  all: () => {
    advancedCache.clear()
    dashboardCache.clear()
    employeeCache.clear()
    payrollCache.clear()
  }
}

// Advanced cache wrapper with automatic tagging
export async function withAdvancedCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions & { cacheInstance?: AdvancedMemoryCache } = {}
): Promise<T> {
  const {
    cacheInstance = advancedCache,
    ttl = 5,
    tags = [],
    priority = 'normal'
  } = options
  
  // Try to get from cache first
  const cached = cacheInstance.get<T>(key)
  if (cached !== null) {
    return cached
  }
  
  // Fetch fresh data
  const data = await fetcher()
  
  // Cache the result with tags
  cacheInstance.set(key, data, { ttl, tags, priority })
  
  return data
}

// Cache warming utilities
export const cacheWarming = {
  async warmDashboard(companyId: string) {
    console.log(`Warming dashboard cache for company: ${companyId}`)
    
    // Pre-load common dashboard data
    const keys = [
      advancedCacheKeys.dashboardStats(companyId),
      advancedCacheKeys.dashboardCharts(companyId, 'current-month'),
      advancedCacheKeys.employeeList(companyId, 'active')
    ]
    
    // This would typically call the actual data fetching functions
    console.log(`Cache warming initiated for keys:`, keys)
  },
  
  async warmEmployee(employeeId: string) {
    console.log(`Warming employee cache for: ${employeeId}`)
    
    const keys = [
      advancedCacheKeys.employeeProfile(employeeId),
      advancedCacheKeys.payrollRecords(employeeId, 'current-year')
    ]
    
    console.log(`Employee cache warming initiated for keys:`, keys)
  }
}

// Cache monitoring and health checks
export const cacheMonitoring = {
  getHealthStatus() {
    const stats = {
      advanced: advancedCache.getStats(),
      dashboard: dashboardCache.getStats(),
      employee: employeeCache.getStats(),
      payroll: payrollCache.getStats()
    }
    
    const overallHitRate = Object.values(stats).reduce((sum, stat) => sum + stat.hitRate, 0) / 4
    const totalMemoryMB = Object.values(stats).reduce((sum, stat) => sum + stat.memoryUsage, 0) / (1024 * 1024)
    
    return {
      overall: {
        hitRate: Math.round(overallHitRate * 100) / 100,
        totalMemoryMB: Math.round(totalMemoryMB * 100) / 100,
        status: overallHitRate > 70 ? 'healthy' : overallHitRate > 50 ? 'warning' : 'critical'
      },
      instances: stats
    }
  },
  
  logCacheStats() {
    const health = this.getHealthStatus()
    console.log('Cache Health Status:', JSON.stringify(health, null, 2))
  }
}

// Auto-monitoring every 10 minutes
setInterval(() => {
  cacheMonitoring.logCacheStats()
}, 10 * 60 * 1000)

