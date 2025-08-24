#!/usr/bin/env node

/**
 * 🚀 PRODUCTION PIPELINE RUNNER
 * 
 * Features:
 * - Resume capability from last processed record
 * - Incremental CSV saving every 10 records
 * - Advanced logging and monitoring
 * - API usage tracking and cost monitoring
 * - Account owner distribution for Advanced/Powerhouse
 * - Real-time progress reporting
 * - Error recovery and retry logic
 */

require('dotenv').config();
const { AdvancedPipelineLogger } = require('./advanced-pipeline-logger');
const fs = require('fs').promises;
const path = require('path');

class ProductionPipelineRunner {
    constructor(pipelineType = 'core') {
        this.pipelineType = pipelineType;
        this.logger = new AdvancedPipelineLogger(pipelineType);
        this.companies = [];
        this.currentIndex = 0;
        this.maxRetries = 3;
        this.retryDelay = 5000; // 5 seconds
        
        // Pipeline-specific settings
        this.settings = {
            core: {
                maxCompanies: 1300,
                saveInterval: 10,
                headers: [
                    'Website', 'Company Name', 'Account Owner',
                    'CFO Name', 'CFO Title', 'CFO Email', 'CFO Phone', 'CFO LinkedIn',
                    'CRO Name', 'CRO Title', 'CRO Email', 'CRO Phone', 'CRO LinkedIn',
                    'Overall Confidence', 'Processing Time', 'Research Methods', 'Final URL'
                ]
            },
            advanced: {
                maxCompanies: 100,
                saveInterval: 5,
                headers: [
                    'Website', 'Company Name', 'Account Owner',
                    'Industry', 'Industry Vertical', 'Executive Stability Risk',
                    'Deal Complexity Assessment', 'Competitive Context Analysis',
                    'Location', 'Time in Role', 'Title'
                ]
            },
            powerhouse: {
                maxCompanies: 10,
                saveInterval: 1,
                headers: [
                    'Website', 'Company Name', 'Account Owner',
                    'Budget Authority Mapping', 'Procurement Maturity Score',
                    'Decision Style Analysis', 'Sales Cycle Prediction',
                    'Buyer Group Flight Risk', 'Routing Intelligence'
                ]
            }
        };
    }

    /**
     * 🚀 INITIALIZE RUNNER
     */
    async initialize() {
        await this.logger.initialize();
        
        // Load companies from input file
        await this.loadCompanies();
        
        // Check for resume capability
        this.currentIndex = await this.logger.loadProgress();
        
        console.log(`🚀 Production Pipeline Runner Initialized`);
        console.log(`   Pipeline: ${this.pipelineType.toUpperCase()}`);
        console.log(`   Total Companies: ${this.companies.length}`);
        console.log(`   Starting from: ${this.currentIndex + 1}`);
        console.log(`   Remaining: ${this.companies.length - this.currentIndex}`);
    }

    /**
     * 📂 LOAD COMPANIES FROM CSV
     */
    async loadCompanies() {
        const inputFile = path.join(__dirname, 'inputs', 'all-1233-companies.csv');
        
        try {
            const csvData = await fs.readFile(inputFile, 'utf8');
            const lines = csvData.trim().split('\\n');
            const headers = lines[0].split(',');
            
            this.companies = lines.slice(1).map(line => {
                const values = this.parseCSVLine(line);
                const company = {};
                headers.forEach((header, index) => {
                    company[header.trim()] = values[index]?.trim() || '';
                });
                return company;
            });
            
            // Apply pipeline-specific limits and distribution
            this.applyPipelineDistribution();
            
            console.log(`📂 Loaded ${this.companies.length} companies from ${path.basename(inputFile)}`);
            
        } catch (error) {
            throw new Error(`Failed to load companies: ${error.message}`);
        }
    }

    /**
     * 📊 APPLY PIPELINE-SPECIFIC DISTRIBUTION
     */
    applyPipelineDistribution() {
        const settings = this.settings[this.pipelineType];
        
        if (this.pipelineType === 'advanced') {
            // Advanced: 100 companies with equal seller distribution
            this.companies = this.distributeByAccountOwner(this.companies, 100);
        } else if (this.pipelineType === 'powerhouse') {
            // Powerhouse: 10 companies with equal seller distribution
            this.companies = this.distributeByAccountOwner(this.companies, 10);
        } else {
            // Core: All 1300 companies
            this.companies = this.companies.slice(0, settings.maxCompanies);
        }
    }

    /**
     * 👥 DISTRIBUTE COMPANIES BY ACCOUNT OWNER
     */
    distributeByAccountOwner(companies, targetCount) {
        // Group by account owner
        const byOwner = {};
        companies.forEach(company => {
            const owner = company['Account Owner'] || 'Unknown';
            if (!byOwner[owner]) byOwner[owner] = [];
            byOwner[owner].push(company);
        });
        
        const owners = Object.keys(byOwner);
        const companiesPerOwner = Math.floor(targetCount / owners.length);
        const remainder = targetCount % owners.length;
        
        const distributed = [];
        owners.forEach((owner, index) => {
            const count = companiesPerOwner + (index < remainder ? 1 : 0);
            distributed.push(...byOwner[owner].slice(0, count));
        });
        
        console.log(`👥 Distributed ${targetCount} companies across ${owners.length} account owners`);
        owners.forEach(owner => {
            const count = distributed.filter(c => c['Account Owner'] === owner).length;
            console.log(`   ${owner}: ${count} companies`);
        });
        
        return distributed.slice(0, targetCount);
    }

    /**
     * 🏃 RUN PIPELINE
     */
    async run() {
        console.log(`\\n🏃 Starting ${this.pipelineType.toUpperCase()} Pipeline Processing`);
        console.log('='.repeat(60));
        
        const startTime = Date.now();
        let successCount = 0;
        let errorCount = 0;
        
        try {
            // Import pipeline modules dynamically
            const pipelineModule = await this.loadPipelineModule();
            
            for (let i = this.currentIndex; i < this.companies.length; i++) {
                const company = this.companies[i];
                this.currentIndex = i;
                
                console.log(`\\n🏢 Processing ${i + 1}/${this.companies.length}: ${company['Company Name'] || company.Website}`);
                
                await this.logger.logRecord(company['Company Name'] || company.Website, 'STARTED', {
                    website: company.Website,
                    accountOwner: company['Account Owner']
                });
                
                try {
                    // Process company with retry logic
                    const result = await this.processCompanyWithRetry(pipelineModule, company);
                    
                    if (result) {
                        await this.logger.logRecord(company['Company Name'] || company.Website, 'SUCCESS', {
                            confidence: result.overallConfidence,
                            executivesFound: (result.cfoName ? 1 : 0) + (result.croName ? 1 : 0),
                            processingTime: result.processingTime
                        });
                        
                        // Save result incrementally
                        await this.logger.saveResults([result], this.settings[this.pipelineType].headers);
                        
                        successCount++;
                        console.log(`   ✅ Success (${result.overallConfidence}% confidence)`);
                    } else {
                        throw new Error('No result returned from pipeline');
                    }
                    
                } catch (error) {
                    await this.logger.logError(company['Company Name'] || company.Website, 'PROCESSING_ERROR', error, {
                        website: company.Website,
                        accountOwner: company['Account Owner']
                    });
                    
                    await this.logger.logRecord(company['Company Name'] || company.Website, 'FAILED', {
                        errorMessage: error.message
                    });
                    
                    errorCount++;
                    console.log(`   ❌ Failed: ${error.message}`);
                }
                
                // Save progress
                await this.logger.saveProgress(i, this.companies.length, company['Company Name'] || company.Website);
                
                // Progress reporting
                if ((i + 1) % 10 === 0) {
                    const elapsed = Date.now() - startTime;
                    const avgTime = elapsed / (i + 1 - this.currentIndex);
                    const remaining = this.companies.length - i - 1;
                    const eta = remaining * avgTime;
                    
                    console.log(`\\n📊 Progress: ${i + 1}/${this.companies.length} (${((i + 1) / this.companies.length * 100).toFixed(1)}%)`);
                    console.log(`   Success Rate: ${(successCount / (successCount + errorCount) * 100).toFixed(1)}%`);
                    console.log(`   ETA: ${this.formatDuration(eta)}`);
                    console.log(`   Total Cost: $${this.logger.calculateTotalCost().toFixed(4)}`);
                }
                
                // Rate limiting
                await this.sleep(1000); // 1 second between requests
            }
            
        } catch (error) {
            console.error(`❌ Pipeline execution failed: ${error.message}`);
            await this.logger.logError('SYSTEM', 'PIPELINE_ERROR', error);
        } finally {
            await this.logger.cleanup();
            
            const totalTime = Date.now() - startTime;
            console.log(`\\n🎯 Pipeline Complete!`);
            console.log(`   Total Time: ${this.formatDuration(totalTime)}`);
            console.log(`   Success: ${successCount}, Failed: ${errorCount}`);
            console.log(`   Success Rate: ${(successCount / (successCount + errorCount) * 100).toFixed(1)}%`);
        }
    }

    /**
     * 🔄 PROCESS COMPANY WITH RETRY LOGIC
     */
    async processCompanyWithRetry(pipelineModule, company, attempt = 1) {
        try {
            return await pipelineModule.processCompany(company);
        } catch (error) {
            if (attempt < this.maxRetries && this.isRetryableError(error)) {
                console.log(`   ⚠️ Attempt ${attempt} failed, retrying in ${this.retryDelay / 1000}s...`);
                await this.sleep(this.retryDelay);
                return this.processCompanyWithRetry(pipelineModule, company, attempt + 1);
            }
            throw error;
        }
    }

    /**
     * 📦 LOAD PIPELINE MODULE
     */
    async loadPipelineModule() {
        const modulePath = path.join(__dirname, 'pipelines', `${this.pipelineType}-pipeline.js`);
        
        try {
            const module = require(modulePath);
            return module;
        } catch (error) {
            throw new Error(`Failed to load pipeline module: ${error.message}`);
        }
    }

    /**
     * 🔧 UTILITY METHODS
     */
    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current);
        return result;
    }

    isRetryableError(error) {
        const retryableErrors = ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'Rate limit'];
        return retryableErrors.some(err => error.message.includes(err));
    }

    formatDuration(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// CLI Interface
async function main() {
    const args = process.argv.slice(2);
    const pipelineType = args[0] || 'core';
    
    if (!['core', 'advanced', 'powerhouse'].includes(pipelineType)) {
        console.error('❌ Invalid pipeline type. Use: core, advanced, or powerhouse');
        process.exit(1);
    }
    
    const runner = new ProductionPipelineRunner(pipelineType);
    
    try {
        await runner.initialize();
        await runner.run();
    } catch (error) {
        console.error(`❌ Runner failed: ${error.message}`);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\\n🛑 Graceful shutdown initiated...');
    // Logger cleanup will be handled in the finally block
    process.exit(0);
});

if (require.main === module) {
    main();
}

module.exports = { ProductionPipelineRunner };
