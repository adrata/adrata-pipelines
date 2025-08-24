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
        this.recordLogFile = path.join(this.logDir, `${this.batchId}_records.jsonl`);
        this.apiUsageFile = path.join(this.logDir, `${this.batchId}_api_usage.jsonl`);
        this.errorLogFile = path.join(this.logDir, `${this.batchId}_errors.jsonl`);
        this.summaryFile = path.join(this.logDir, `${this.batchId}_summary.json`);
        
        // Output CSV file
        this.outputCsvFile = path.join(this.outputDir, `${this.batchId}_results.csv`);
        
        // Tracking variables
        this.totalRecords = 0;
        this.processedRecords = 0;
        this.successfulRecords = 0;
        this.failedRecords = 0;
        this.startTime = null;
        this.apiCalls = {};
        this.apiCosts = {};
        this.currentRecord = null;
        this.csvWriter = null;
        this.saveInterval = 10; // Save every 10 records
        this.results = [];
    }

    /**
     * 🚀 INITIALIZE LOGGER
     */
    async initialize() {
        try {
            // Create directories
            await fs.mkdir(this.logDir, { recursive: true });
            await fs.mkdir(this.outputDir, { recursive: true });
            
            this.startTime = new Date();
            
            // Initialize CSV writer
            this.setupCsvWriter();
            
            console.log(`📊 Advanced Logger initialized: ${this.batchId}`);
            console.log(`📁 Logs: ${this.logDir}`);
            console.log(`📁 Output: ${this.outputCsvFile}`);
            
            // Log initialization
            await this.logEvent('system', 'Logger initialized', {
                batchId: this.batchId,
                pipelineType: this.pipelineType,
                startTime: this.startTime.toISOString()
            });
            
        } catch (error) {
            console.error('❌ Failed to initialize logger:', error.message);
            throw error;
        }
    }

    /**
     * 🎯 SETUP CSV WRITER
     */
    setupCsvWriter() {
        let headers;
        
        if (this.pipelineType === 'core') {
            headers = [
                { id: 'recordIndex', title: 'Record Index' },
                { id: 'website', title: 'Website' },
                { id: 'companyName', title: 'Company Name' },
                { id: 'accountOwner', title: 'Account Owner' },
                { id: 'isTop1000', title: 'Top 1000' },
                { id: 'cfoName', title: 'CFO Name' },
                { id: 'cfoTitle', title: 'CFO Title' },
                { id: 'cfoEmail', title: 'CFO Email' },
                { id: 'cfoPhone', title: 'CFO Phone' },
                { id: 'cfoLinkedIn', title: 'CFO LinkedIn' },
                { id: 'cfoSelectionReason', title: 'CFO Selection Reason' },
                { id: 'croName', title: 'CRO Name' },
                { id: 'croTitle', title: 'CRO Title' },
                { id: 'croEmail', title: 'CRO Email' },
                { id: 'croPhone', title: 'CRO Phone' },
                { id: 'croLinkedIn', title: 'CRO LinkedIn' },
                { id: 'croSelectionReason', title: 'CRO Selection Reason' },
                { id: 'overallConfidence', title: 'Overall Confidence' },
                { id: 'processingTime', title: 'Processing Time (ms)' },
                { id: 'timestamp', title: 'Processed At' },
                { id: 'apiCallsUsed', title: 'API Calls Used' },
                { id: 'estimatedCost', title: 'Estimated Cost ($)' }
            ];
        } else if (this.pipelineType === 'advanced') {
            headers = [
                { id: 'recordIndex', title: 'Record Index' },
                { id: 'website', title: 'Website' },
                { id: 'companyName', title: 'Company Name' },
                { id: 'industry', title: 'Industry' },
                { id: 'industryVertical', title: 'Industry Vertical' },
                { id: 'executiveStabilityRisk', title: 'Executive Stability Risk' },
                { id: 'dealComplexityAssessment', title: 'Deal Complexity Assessment' },
                { id: 'competitiveContextAnalysis', title: 'Competitive Context Analysis' },
                { id: 'corporateStructureIntelligence', title: 'Corporate Structure Intelligence' },
                { id: 'leadershipChangeDetection', title: 'Leadership Change Detection' },
                { id: 'marketPositionAnalysis', title: 'Market Position Analysis' },
                { id: 'accountOwner', title: 'Account Owner' },
                { id: 'timestamp', title: 'Processed At' },
                { id: 'apiCallsUsed', title: 'API Calls Used' },
                { id: 'estimatedCost', title: 'Estimated Cost ($)' }
            ];
        } else if (this.pipelineType === 'powerhouse') {
            headers = [
                { id: 'recordIndex', title: 'Record Index' },
                { id: 'website', title: 'Website' },
                { id: 'companyName', title: 'Company Name' },
                { id: 'decisionMaker', title: 'Decision Maker' },
                { id: 'champion', title: 'Champion' },
                { id: 'influencer', title: 'Influencer' },
                { id: 'blocker', title: 'Blocker' },
                { id: 'introducer', title: 'Introducer' },
                { id: 'budgetAuthorityMapping', title: 'Budget Authority Mapping' },
                { id: 'procurementMaturityScore', title: 'Procurement Maturity Score' },
                { id: 'decisionStyleAnalysis', title: 'Decision Style Analysis' },
                { id: 'salesCyclePrediction', title: 'Sales Cycle Prediction' },
                { id: 'buyerGroupFlightRisk', title: 'Buyer Group Flight Risk' },
                { id: 'routingIntelligence', title: 'Routing Intelligence' },
                { id: 'accountOwner', title: 'Account Owner' },
                { id: 'timestamp', title: 'Processed At' },
                { id: 'apiCallsUsed', title: 'API Calls Used' },
                { id: 'estimatedCost', title: 'Estimated Cost ($)' }
            ];
        }
        
        this.csvWriter = createCsvWriter({
            path: this.outputCsvFile,
            header: headers
        });
    }

    /**
     * 📊 SET TOTAL RECORDS
     */
    setTotalRecords(total) {
        this.totalRecords = total;
        console.log(`📊 Total records to process: ${total}`);
    }

    /**
     * 🎯 START PROCESSING RECORD
     */
    async startRecord(company, index) {
        this.currentRecord = {
            index: index,
            company: company,
            startTime: new Date(),
            apiCalls: [],
            errors: []
        };
        
        console.log(`\n🏢 PROCESSING ${index + 1}/${this.totalRecords}: ${company.Website || company['Company Name']}`);
        
        await this.logEvent('record_start', 'Started processing record', {
            index: index,
            company: company,
            timestamp: this.currentRecord.startTime.toISOString()
        });
    }

    /**
     * 📞 LOG API CALL
     */
    async logApiCall(provider, endpoint, cost = 0, success = true, response = null, error = null) {
        const apiCall = {
            provider: provider,
            endpoint: endpoint,
            cost: cost,
            success: success,
            timestamp: new Date().toISOString(),
            response: response ? JSON.stringify(response).substring(0, 500) : null,
            error: error ? error.message : null
        };
        
        // Track API usage
        if (!this.apiCalls[provider]) {
            this.apiCalls[provider] = 0;
            this.apiCosts[provider] = 0;
        }
        
        this.apiCalls[provider]++;
        this.apiCosts[provider] += cost;
        
        // Add to current record
        if (this.currentRecord) {
            this.currentRecord.apiCalls.push(apiCall);
        }
        
        // Log API call
        await this.appendToFile(this.apiUsageFile, JSON.stringify(apiCall) + '\n');
        
        // Check for API limits
        if (!success && error) {
            if (error.message.includes('rate limit') || error.message.includes('quota') || error.message.includes('credits')) {
                console.log(`⚠️  API LIMIT WARNING: ${provider} - ${error.message}`);
                await this.logEvent('api_limit', 'API limit reached', {
                    provider: provider,
                    endpoint: endpoint,
                    error: error.message,
                    totalCalls: this.apiCalls[provider],
                    totalCost: this.apiCosts[provider]
                });
            }
        }
    }

    /**
     * 📋 LOG RESULTS
     */
    logResults(result) {
        if (this.currentRecord) {
            this.currentRecord.result = result;
        }
    }

    /**
     * ✅ COMPLETE RECORD PROCESSING
     */
    async completeRecord(status = 'success', error = null) {
        if (!this.currentRecord) return;
        
        const endTime = new Date();
        const processingTime = endTime - this.currentRecord.startTime;
        
        this.processedRecords++;
        
        if (status === 'success') {
            this.successfulRecords++;
        } else {
            this.failedRecords++;
            if (error) {
                this.currentRecord.errors.push({
                    message: error.message,
                    stack: error.stack,
                    timestamp: endTime.toISOString()
                });
            }
        }
        
        // Calculate API usage for this record
        const recordApiCalls = this.currentRecord.apiCalls.length;
        const recordCost = this.currentRecord.apiCalls.reduce((sum, call) => sum + call.cost, 0);
        
        // Prepare result for CSV
        const csvResult = {
            recordIndex: this.currentRecord.index,
            ...this.currentRecord.result,
            timestamp: endTime.toISOString(),
            apiCallsUsed: recordApiCalls,
            estimatedCost: recordCost.toFixed(4)
        };
        
        this.results.push(csvResult);
        
        // Log record completion
        const recordLog = {
            index: this.currentRecord.index,
            company: this.currentRecord.company,
            status: status,
            processingTime: processingTime,
            apiCalls: recordApiCalls,
            cost: recordCost,
            errors: this.currentRecord.errors,
            timestamp: endTime.toISOString()
        };
        
        await this.appendToFile(this.recordLogFile, JSON.stringify(recordLog) + '\n');
        
        if (error) {
            await this.appendToFile(this.errorLogFile, JSON.stringify({
                index: this.currentRecord.index,
                company: this.currentRecord.company,
                error: error.message,
                stack: error.stack,
                timestamp: endTime.toISOString()
            }) + '\n');
        }
        
        // Incremental save every N records
        if (this.results.length % this.saveInterval === 0) {
            await this.saveIncrementalResults();
            console.log(`💾 Incremental save: ${this.results.length} records saved`);
        }
        
        console.log(`   ✅ Record ${this.currentRecord.index + 1} completed (${status}) - ${processingTime}ms`);
        console.log(`   📊 Progress: ${this.processedRecords}/${this.totalRecords} (${(this.processedRecords/this.totalRecords*100).toFixed(1)}%)`);
        
        this.currentRecord = null;
    }

    /**
     * 💾 SAVE INCREMENTAL RESULTS
     */
    async saveIncrementalResults() {
        try {
            if (this.results.length === 0) return;
            
            // Write all results to CSV (overwrites file)
            await this.csvWriter.writeRecords(this.results);
            
        } catch (error) {
            console.error('❌ Failed to save incremental results:', error.message);
        }
    }

    /**
     * 🔄 CHECK IF SHOULD RESUME
     */
    async shouldResume() {
        try {
            await fs.access(this.recordLogFile);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * 📍 GET RESUME POINT
     */
    async getResumePoint() {
        try {
            const logData = await fs.readFile(this.recordLogFile, 'utf8');
            const lines = logData.trim().split('\n').filter(line => line.trim());
            
            if (lines.length === 0) return 0;
            
            // Find the last successful record
            let lastSuccessfulIndex = -1;
            
            for (const line of lines) {
                const record = JSON.parse(line);
                if (record.status === 'success') {
                    lastSuccessfulIndex = Math.max(lastSuccessfulIndex, record.index);
                }
            }
            
            return lastSuccessfulIndex + 1;
            
        } catch (error) {
            console.error('❌ Failed to determine resume point:', error.message);
            return 0;
        }
    }

    /**
     * 📊 PRINT FINAL SUMMARY
     */
    async printFinalSummary() {
        const endTime = new Date();
        const totalTime = endTime - this.startTime;
        const totalCost = Object.values(this.apiCosts).reduce((sum, cost) => sum + cost, 0);
        const totalApiCalls = Object.values(this.apiCalls).reduce((sum, calls) => sum + calls, 0);
        
        const summary = {
            batchId: this.batchId,
            pipelineType: this.pipelineType,
            startTime: this.startTime.toISOString(),
            endTime: endTime.toISOString(),
            totalTime: totalTime,
            totalRecords: this.totalRecords,
            processedRecords: this.processedRecords,
            successfulRecords: this.successfulRecords,
            failedRecords: this.failedRecords,
            successRate: ((this.successfulRecords / this.processedRecords) * 100).toFixed(2),
            totalApiCalls: totalApiCalls,
            totalCost: totalCost,
            apiBreakdown: this.apiCalls,
            costBreakdown: this.apiCosts,
            averageProcessingTime: totalTime / this.processedRecords,
            outputFile: this.outputCsvFile
        };
        
        // Save summary
        await fs.writeFile(this.summaryFile, JSON.stringify(summary, null, 2));
        
        // Print summary
        console.log(`\n📊 FINAL SUMMARY - ${this.batchId}`);
        console.log(`=====================================`);
        console.log(`⏱️  Total Time: ${(totalTime / 1000).toFixed(1)}s`);
        console.log(`📊 Records Processed: ${this.processedRecords}/${this.totalRecords}`);
        console.log(`✅ Success Rate: ${summary.successRate}%`);
        console.log(`📞 Total API Calls: ${totalApiCalls}`);
        console.log(`💰 Total Cost: $${totalCost.toFixed(4)}`);
        console.log(`📁 Output: ${this.outputCsvFile}`);
        console.log(`📋 Summary: ${this.summaryFile}`);
        
        console.log(`\n📞 API USAGE BREAKDOWN:`);
        Object.entries(this.apiCalls).forEach(([provider, calls]) => {
            const cost = this.apiCosts[provider] || 0;
            console.log(`   ${provider}: ${calls} calls, $${cost.toFixed(4)}`);
        });
        
        // Final save
        await this.saveIncrementalResults();
    }

    /**
     * 📝 LOG GENERAL EVENT
     */
    async logEvent(type, message, data = {}) {
        const event = {
            type: type,
            message: message,
            data: data,
            timestamp: new Date().toISOString()
        };
        
        const logFile = path.join(this.logDir, `${this.batchId}_events.jsonl`);
        await this.appendToFile(logFile, JSON.stringify(event) + '\n');
    }

    /**
     * 📄 APPEND TO FILE
     */
    async appendToFile(filePath, content) {
        try {
            await fs.appendFile(filePath, content);
        } catch (error) {
            console.error(`❌ Failed to write to ${filePath}:`, error.message);
        }
    }
}

module.exports = { AdvancedPipelineLogger };
