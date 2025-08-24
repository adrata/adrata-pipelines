#!/usr/bin/env node

/**
 * 🔍 ADVANCED PIPELINE LOGGER
 * 
 * Features:
 * - Individual record tracking with resume capability
 * - API usage monitoring and credit tracking
 * - Incremental CSV saving every N records
 * - Detailed error logging for debugging
 * - Performance metrics per record
 * - Cost tracking per API provider
 * - Resume from last successful record
 */

const fs = require('fs').promises;
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

class AdvancedPipelineLogger {
    constructor(pipelineType = 'core', batchId = null) {
        this.pipelineType = pipelineType;
        this.batchId = batchId || `${pipelineType}_${new Date().toISOString().replace(/[:.]/g, '-')}`;
        this.logDir = path.join(__dirname, 'logs');
        this.outputDir = path.join(__dirname, 'outputs');
        
        // Log files
        this.recordLogFile = path.join(this.logDir, `${this.batchId}_records.log`);
        this.apiLogFile = path.join(this.logDir, `${this.batchId}_api_usage.log`);
        this.errorLogFile = path.join(this.logDir, `${this.batchId}_errors.log`);
        this.progressFile = path.join(this.logDir, `${this.batchId}_progress.json`);
        
        // Output files
        this.outputFile = path.join(this.outputDir, `${this.batchId}_results.csv`);
        
        // Tracking
        this.processedRecords = 0;
        this.successfulRecords = 0;
        this.failedRecords = 0;
        this.startTime = Date.now();
        this.lastSaveTime = Date.now();
        this.saveInterval = 10; // Save every 10 records
        
        // API Usage Tracking
        this.apiUsage = {
            perplexity: { calls: 0, cost: 0, errors: 0 },
            coresignal: { calls: 0, cost: 0, errors: 0 },
            lusha: { calls: 0, cost: 0, errors: 0 },
            zerobounce: { calls: 0, cost: 0, errors: 0 },
            prospeo: { calls: 0, cost: 0, errors: 0 },
            myemailverifier: { calls: 0, cost: 0, errors: 0 },
            dropcontact: { calls: 0, cost: 0, errors: 0 }
        };
        
        // Cost per API call (approximate)
        this.apiCosts = {
            perplexity: 0.002,      // $0.002 per request
            coresignal: 0.01,       // $0.01 per search
            lusha: 0.08,            // $0.08 per contact
            zerobounce: 0.0007,     // $0.0007 per validation
            prospeo: 0.0198,        // $0.0198 per verified email
            myemailverifier: 0.0005, // $0.0005 per validation
            dropcontact: 0.02       // $0.02 per email
        };
        
        // Results storage
        this.results = [];
        this.csvWriter = null;
    }

    /**
     * 🚀 INITIALIZE LOGGER
     */
    async initialize() {
        // Create directories
        await fs.mkdir(this.logDir, { recursive: true });
        await fs.mkdir(this.outputDir, { recursive: true });
        
        // Initialize log files
        await this.logRecord('SYSTEM', 'Logger initialized', { batchId: this.batchId, pipelineType: this.pipelineType });
        await this.logAPI('SYSTEM', 'Logger started', { timestamp: new Date().toISOString() });
        
        console.log(`📊 Advanced Logger Initialized:`);
        console.log(`   Batch ID: ${this.batchId}`);
        console.log(`   Pipeline: ${this.pipelineType.toUpperCase()}`);
        console.log(`   Logs: ${this.logDir}`);
        console.log(`   Output: ${this.outputFile}`);
    }

    /**
     * 📝 LOG RECORD PROCESSING
     */
    async logRecord(companyName, status, data = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            batchId: this.batchId,
            recordNumber: this.processedRecords + 1,
            companyName,
            status, // 'STARTED', 'SUCCESS', 'FAILED', 'SKIPPED'
            processingTime: data.processingTime || null,
            confidence: data.confidence || null,
            executivesFound: data.executivesFound || null,
            contactsFound: data.contactsFound || null,
            apiCallsMade: data.apiCallsMade || null,
            errorMessage: data.errorMessage || null,
            ...data
        };
        
        const logLine = JSON.stringify(logEntry) + '\\n';
        await fs.appendFile(this.recordLogFile, logLine);
        
        // Update counters
        if (status === 'SUCCESS') {
            this.successfulRecords++;
        } else if (status === 'FAILED') {
            this.failedRecords++;
        }
        
        if (status !== 'STARTED') {
            this.processedRecords++;
        }
    }

    /**
     * 📊 LOG API USAGE
     */
    async logAPI(apiName, action, data = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            batchId: this.batchId,
            api: apiName.toLowerCase(),
            action, // 'CALL', 'SUCCESS', 'ERROR', 'RATE_LIMIT'
            cost: data.cost || this.apiCosts[apiName.toLowerCase()] || 0,
            responseTime: data.responseTime || null,
            statusCode: data.statusCode || null,
            errorMessage: data.errorMessage || null,
            creditsUsed: data.creditsUsed || null,
            creditsRemaining: data.creditsRemaining || null,
            ...data
        };
        
        const logLine = JSON.stringify(logEntry) + '\\n';
        await fs.appendFile(this.apiLogFile, logLine);
        
        // Update API usage tracking
        const api = apiName.toLowerCase();
        if (this.apiUsage[api]) {
            if (action === 'CALL' || action === 'SUCCESS') {
                this.apiUsage[api].calls++;
                this.apiUsage[api].cost += logEntry.cost;
            }
            if (action === 'ERROR') {
                this.apiUsage[api].errors++;
            }
        }
    }

    /**
     * ❌ LOG ERRORS
     */
    async logError(companyName, errorType, error, context = {}) {
        const errorEntry = {
            timestamp: new Date().toISOString(),
            batchId: this.batchId,
            recordNumber: this.processedRecords + 1,
            companyName,
            errorType, // 'API_ERROR', 'VALIDATION_ERROR', 'PROCESSING_ERROR', 'NETWORK_ERROR'
            errorMessage: error.message || error,
            errorStack: error.stack || null,
            context,
            severity: this.determineSeverity(errorType, error)
        };
        
        const logLine = JSON.stringify(errorEntry) + '\\n';
        await fs.appendFile(this.errorLogFile, logLine);
        
        console.log(`❌ ${errorType}: ${errorEntry.errorMessage}`);
    }

    /**
     * 💾 SAVE PROGRESS
     */
    async saveProgress(currentIndex, totalRecords, lastProcessedCompany = null) {
        const progress = {
            batchId: this.batchId,
            pipelineType: this.pipelineType,
            currentIndex,
            totalRecords,
            processedRecords: this.processedRecords,
            successfulRecords: this.successfulRecords,
            failedRecords: this.failedRecords,
            lastProcessedCompany,
            startTime: this.startTime,
            lastUpdateTime: Date.now(),
            estimatedTimeRemaining: this.calculateETA(currentIndex, totalRecords),
            apiUsage: this.apiUsage,
            totalCost: this.calculateTotalCost()
        };
        
        await fs.writeFile(this.progressFile, JSON.stringify(progress, null, 2));
    }

    /**
     * 📊 LOAD PROGRESS (FOR RESUME)
     */
    async loadProgress() {
        try {
            const progressData = await fs.readFile(this.progressFile, 'utf8');
            const progress = JSON.parse(progressData);
            
            // Restore state
            this.processedRecords = progress.processedRecords || 0;
            this.successfulRecords = progress.successfulRecords || 0;
            this.failedRecords = progress.failedRecords || 0;
            this.startTime = progress.startTime || Date.now();
            this.apiUsage = progress.apiUsage || this.apiUsage;
            
            console.log(`📊 Resuming from record ${progress.currentIndex + 1}/${progress.totalRecords}`);
            console.log(`   Processed: ${this.processedRecords}, Success: ${this.successfulRecords}, Failed: ${this.failedRecords}`);
            
            return progress.currentIndex || 0;
        } catch (error) {
            console.log('📊 No previous progress found, starting fresh');
            return 0;
        }
    }

    /**
     * 💾 INCREMENTAL CSV SAVE
     */
    async saveResults(results, headers = null) {
        if (!this.csvWriter && headers) {
            this.csvWriter = createCsvWriter({
                path: this.outputFile,
                header: headers.map(h => ({ id: h, title: h }))
            });
        }
        
        // Add new results to our collection
        this.results.push(...results);
        
        // Save incrementally every N records or if forced
        const shouldSave = this.results.length >= this.saveInterval || 
                          (Date.now() - this.lastSaveTime) > 60000; // Save every minute
        
        if (shouldSave && this.csvWriter) {
            await this.csvWriter.writeRecords(this.results);
            console.log(`💾 Saved ${this.results.length} records to ${path.basename(this.outputFile)}`);
            
            // Clear results after saving to prevent memory buildup
            this.results = [];
            this.lastSaveTime = Date.now();
        }
    }

    /**
     * 📊 GENERATE FINAL REPORT
     */
    async generateFinalReport() {
        const endTime = Date.now();
        const totalTime = endTime - this.startTime;
        const avgTimePerRecord = this.processedRecords > 0 ? totalTime / this.processedRecords : 0;
        
        const report = {
            batchId: this.batchId,
            pipelineType: this.pipelineType,
            summary: {
                totalRecords: this.processedRecords,
                successfulRecords: this.successfulRecords,
                failedRecords: this.failedRecords,
                successRate: this.processedRecords > 0 ? (this.successfulRecords / this.processedRecords * 100).toFixed(2) + '%' : '0%',
                totalProcessingTime: this.formatDuration(totalTime),
                avgTimePerRecord: this.formatDuration(avgTimePerRecord),
                startTime: new Date(this.startTime).toISOString(),
                endTime: new Date(endTime).toISOString()
            },
            apiUsage: Object.entries(this.apiUsage).map(([api, stats]) => ({
                api: api.toUpperCase(),
                calls: stats.calls,
                cost: `$${stats.cost.toFixed(4)}`,
                errors: stats.errors,
                successRate: stats.calls > 0 ? ((stats.calls - stats.errors) / stats.calls * 100).toFixed(1) + '%' : '0%'
            })),
            totalCost: `$${this.calculateTotalCost().toFixed(4)}`,
            files: {
                results: this.outputFile,
                recordLog: this.recordLogFile,
                apiLog: this.apiLogFile,
                errorLog: this.errorLogFile,
                progress: this.progressFile
            }
        };
        
        const reportFile = path.join(this.logDir, `${this.batchId}_final_report.json`);
        await fs.writeFile(reportFile, JSON.stringify(report, null, 2));
        
        // Print summary to console
        console.log('\\n📊 FINAL PROCESSING REPORT');
        console.log('==========================');
        console.log(`Batch ID: ${this.batchId}`);
        console.log(`Pipeline: ${this.pipelineType.toUpperCase()}`);
        console.log(`Total Records: ${this.processedRecords}`);
        console.log(`Success Rate: ${report.summary.successRate}`);
        console.log(`Total Time: ${report.summary.totalProcessingTime}`);
        console.log(`Avg Time/Record: ${report.summary.avgTimePerRecord}`);
        console.log(`Total Cost: ${report.totalCost}`);
        console.log(`\\nAPI Usage:`);
        report.apiUsage.forEach(api => {
            if (api.calls > 0) {
                console.log(`  ${api.api}: ${api.calls} calls, ${api.cost}, ${api.successRate} success`);
            }
        });
        console.log(`\\nFiles Generated:`);
        console.log(`  Results: ${path.basename(this.outputFile)}`);
        console.log(`  Report: ${path.basename(reportFile)}`);
        
        return report;
    }

    /**
     * 🔧 UTILITY METHODS
     */
    determineSeverity(errorType, error) {
        if (errorType === 'NETWORK_ERROR' || errorType === 'API_ERROR') {
            return 'HIGH';
        }
        if (errorType === 'VALIDATION_ERROR') {
            return 'MEDIUM';
        }
        return 'LOW';
    }

    calculateETA(currentIndex, totalRecords) {
        if (currentIndex === 0) return null;
        
        const elapsed = Date.now() - this.startTime;
        const avgTimePerRecord = elapsed / currentIndex;
        const remaining = totalRecords - currentIndex;
        
        return this.formatDuration(remaining * avgTimePerRecord);
    }

    calculateTotalCost() {
        return Object.values(this.apiUsage).reduce((total, api) => total + api.cost, 0);
    }

    formatDuration(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }

    /**
     * 🧹 CLEANUP
     */
    async cleanup() {
        // Final save of any remaining results
        if (this.results.length > 0 && this.csvWriter) {
            await this.csvWriter.writeRecords(this.results);
            console.log(`💾 Final save: ${this.results.length} records`);
        }
        
        // Generate final report
        await this.generateFinalReport();
        
        console.log('🧹 Logger cleanup complete');
    }
}

module.exports = { AdvancedPipelineLogger };
