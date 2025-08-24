/**
 * 💾 DATA CACHE MODULE
 * 
 * Prevents re-purchasing API data by caching results
 * Supports multiple storage backends (Redis, PostgreSQL, File system)
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class DataCache {
    constructor(config = {}) {
        // Use /tmp for Vercel serverless compatibility
        const defaultCacheDir = process.env.VERCEL ? '/tmp/cache' : path.join(__dirname, '../cache');
        
        this.config = {
            CACHE_DIR: config.CACHE_DIR || defaultCacheDir,
            CACHE_TTL_DAYS: config.CACHE_TTL_DAYS || 30,
            USE_FILE_CACHE: config.USE_FILE_CACHE !== false,
            ...config
        };
        
        this.cacheStats = {
            hits: 0,
            misses: 0,
            saves: 0
        };
        
        this.initializeCache();
    }

    /**
     * Initialize cache directory
     */
    initializeCache() {
        if (this.config.USE_FILE_CACHE && !fs.existsSync(this.config.CACHE_DIR)) {
            fs.mkdirSync(this.config.CACHE_DIR, { recursive: true });
            console.log(`   📁 Cache directory created: ${this.config.CACHE_DIR}`);
        }
    }

    /**
     * Generate cache key from input data
     */
    generateCacheKey(service, identifier) {
        const key = `${service}:${identifier}`.toLowerCase();
        return crypto.createHash('md5').update(key).digest('hex');
    }

    /**
     * Get cached data
     */
    async get(service, identifier) {
        const cacheKey = this.generateCacheKey(service, identifier);
        const cacheFile = path.join(this.config.CACHE_DIR, `${cacheKey}.json`);
        
        try {
            if (fs.existsSync(cacheFile)) {
                const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
                
                // Check if cache is expired
                const ageInDays = (Date.now() - cached.timestamp) / (1000 * 60 * 60 * 24);
                if (ageInDays < this.config.CACHE_TTL_DAYS) {
                    this.cacheStats.hits++;
                    console.log(`   💾 Cache HIT: ${service}:${identifier} (${Math.round(ageInDays)}d old)`);
                    return cached.data;
                } else {
                    // Remove expired cache
                    fs.unlinkSync(cacheFile);
                    console.log(`   🗑️ Cache EXPIRED: ${service}:${identifier} (${Math.round(ageInDays)}d old)`);
                }
            }
        } catch (error) {
            console.log(`   ⚠️ Cache read error: ${error.message}`);
        }
        
        this.cacheStats.misses++;
        console.log(`   💸 Cache MISS: ${service}:${identifier}`);
        return null;
    }

    /**
     * Save data to cache
     */
    async set(service, identifier, data) {
        const cacheKey = this.generateCacheKey(service, identifier);
        const cacheFile = path.join(this.config.CACHE_DIR, `${cacheKey}.json`);
        
        const cacheData = {
            service,
            identifier,
            timestamp: Date.now(),
            data
        };
        
        try {
            fs.writeFileSync(cacheFile, JSON.stringify(cacheData, null, 2));
            this.cacheStats.saves++;
            console.log(`   💾 Cache SAVED: ${service}:${identifier}`);
        } catch (error) {
            console.log(`   ⚠️ Cache save error: ${error.message}`);
        }
    }

    /**
     * Check if we have cached data for a company
     */
    async hasCompanyData(companyDomain) {
        const services = ['lusha', 'zerobounce', 'coresignal', 'perplexity'];
        const cachedServices = [];
        
        for (const service of services) {
            const cached = await this.get(service, companyDomain);
            if (cached) {
                cachedServices.push(service);
            }
        }
        
        return {
            hasCachedData: cachedServices.length > 0,
            cachedServices,
            coverage: Math.round((cachedServices.length / services.length) * 100)
        };
    }

    /**
     * Get cache statistics
     */
    getStats() {
        const total = this.cacheStats.hits + this.cacheStats.misses;
        const hitRate = total > 0 ? Math.round((this.cacheStats.hits / total) * 100) : 0;
        
        return {
            ...this.cacheStats,
            hitRate: `${hitRate}%`,
            totalRequests: total
        };
    }

    /**
     * Clear expired cache entries
     */
    async clearExpired() {
        if (!fs.existsSync(this.config.CACHE_DIR)) return;
        
        const files = fs.readdirSync(this.config.CACHE_DIR);
        let clearedCount = 0;
        
        for (const file of files) {
            if (!file.endsWith('.json')) continue;
            
            const filePath = path.join(this.config.CACHE_DIR, file);
            try {
                const cached = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                const ageInDays = (Date.now() - cached.timestamp) / (1000 * 60 * 60 * 24);
                
                if (ageInDays >= this.config.CACHE_TTL_DAYS) {
                    fs.unlinkSync(filePath);
                    clearedCount++;
                }
            } catch (error) {
                // Remove corrupted cache files
                fs.unlinkSync(filePath);
                clearedCount++;
            }
        }
        
        console.log(`   🗑️ Cleared ${clearedCount} expired cache entries`);
        return clearedCount;
    }

    /**
     * Get cache size information
     */
    getCacheSize() {
        if (!fs.existsSync(this.config.CACHE_DIR)) return { files: 0, sizeMB: 0 };
        
        const files = fs.readdirSync(this.config.CACHE_DIR);
        let totalSize = 0;
        
        for (const file of files) {
            if (file.endsWith('.json')) {
                const filePath = path.join(this.config.CACHE_DIR, file);
                totalSize += fs.statSync(filePath).size;
            }
        }
        
        return {
            files: files.filter(f => f.endsWith('.json')).length,
            sizeMB: Math.round(totalSize / (1024 * 1024) * 100) / 100
        };
    }
}

module.exports = { DataCache };
