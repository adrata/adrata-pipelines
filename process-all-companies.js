#!/usr/bin/env node

/**
 * MASS COMPANY PROCESSOR
 * Process all 1233 companies from the CSV using the mass parallel API
 * This script handles the full dataset and provides real-time progress
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const fetch = require('node-fetch');

// Configuration
const CONFIG = {
    API_URL: 'https://adrata-pipelines-2n96l8wil-adrata.vercel.app/api/mass-parallel',
    INPUT_FILE: './inputs/all-1233-companies.csv',
    OUTPUT_FILE: './outputs/mass-parallel-results.json',
    BATCH_SIZE: 100,              // Process 100 companies per API call
    MAX_RETRIES: 2,               // Retry failed batches
    RETRY_DELAY: 5000,            // 5 seconds between retries
    REQUEST_TIMEOUT: 900000       // 15 minutes per batch
};

// Read companies from CSV
async function readCompaniesFromCSV() {
    console.log(`📖 Reading companies from: ${CONFIG.INPUT_FILE}`);
    
    return new Promise((resolve, reject) => {
        const companies = [];
        
        if (!fs.existsSync(CONFIG.INPUT_FILE)) {
            reject(new Error(`Input file not found: ${CONFIG.INPUT_FILE}`));
            return;
        }
        
        fs.createReadStream(CONFIG.INPUT_FILE)
            .pipe(csv())
            .on('data', (row) => {
                // Handle different CSV column formats
                const company = {
                    companyName: row.companyName || row['Company Name'] || row.company || row.name,
                    domain: row.domain || row.website || row.Website || row.url,
                    industry: row.industry || row.Industry || row.sector,
                    'Account Owner': row['Account Owner'] || row.accountOwner || 'Dan Mirolli',
                    'Top 1000': row['Top 1000'] || row.isTop1000 || '0'
                };
                
                // Only add if we have at least a company name or domain
                if (company.companyName || company.domain) {
                    companies.push(company);
                }
            })
            .on('end', () => {
                console.log(`✅ Loaded ${companies.length} companies from CSV`);
                resolve(companies);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
}

// Process a batch of companies
async function processBatch(companies, batchNumber, totalBatches) {
    console.log(`🚀 Processing batch ${batchNumber}/${totalBatches} (${companies.length} companies)`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT);
    
    try {
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ companies }),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log(`✅ Batch ${batchNumber} completed: ${result.summary?.successfulProcessing || 0} success, ${result.summary?.errors || 0} errors`);
        
        return result;
        
    } catch (error) {
        clearTimeout(timeoutId);
        console.error(`❌ Batch ${batchNumber} failed:`, error.message);
        throw error;
    }
}

// Process all companies with batching and retries
async function processAllCompanies() {
    const startTime = Date.now();
    
    try {
        // Read companies from CSV
        const allCompanies = await readCompaniesFromCSV();
        
        if (allCompanies.length === 0) {
            throw new Error('No companies found in CSV file');
        }
        
        console.log(`🎯 Starting mass processing of ${allCompanies.length} companies`);
        console.log(`📊 Configuration: ${CONFIG.BATCH_SIZE} companies per batch, ${CONFIG.MAX_RETRIES} max retries`);
        
        // Split into batches
        const batches = [];
        for (let i = 0; i < allCompanies.length; i += CONFIG.BATCH_SIZE) {
            batches.push(allCompanies.slice(i, i + CONFIG.BATCH_SIZE));
        }
        
        console.log(`📦 Created ${batches.length} batches for processing`);
        
        const allResults = [];
        let totalSuccess = 0;
        let totalErrors = 0;
        
        // Process each batch
        for (let i = 0; i < batches.length; i++) {
            const batch = batches[i];
            let batchResult = null;
            let retryCount = 0;
            
            // Retry logic for failed batches
            while (retryCount <= CONFIG.MAX_RETRIES && !batchResult) {
                try {
                    if (retryCount > 0) {
                        console.log(`🔄 Retrying batch ${i + 1} (attempt ${retryCount + 1}/${CONFIG.MAX_RETRIES + 1})`);
                        await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY));
                    }
                    
                    batchResult = await processBatch(batch, i + 1, batches.length);
                    
                } catch (error) {
                    retryCount++;
                    if (retryCount > CONFIG.MAX_RETRIES) {
                        console.error(`❌ Batch ${i + 1} failed after ${CONFIG.MAX_RETRIES} retries`);
                        
                        // Create error results for failed batch
                        batchResult = {
                            results: batch.map((company, index) => ({
                                success: false,
                                website: company.domain || company.companyName,
                                companyName: company.companyName || 'Batch Failed',
                                error: `Batch processing failed: ${error.message}`,
                                timestamp: new Date().toISOString(),
                                batchNumber: i + 1
                            })),
                            summary: {
                                totalCompanies: batch.length,
                                successfulProcessing: 0,
                                errors: batch.length
                            }
                        };
                    }
                }
            }
            
            // Collect results
            if (batchResult && batchResult.results) {
                allResults.push(...batchResult.results);
                totalSuccess += batchResult.summary?.successfulProcessing || 0;
                totalErrors += batchResult.summary?.errors || 0;
            }
            
            // Progress update
            const progress = Math.round(((i + 1) / batches.length) * 100);
            const elapsed = Date.now() - startTime;
            const avgTimePerBatch = elapsed / (i + 1);
            const estimatedTimeRemaining = avgTimePerBatch * (batches.length - i - 1);
            
            console.log(`📊 Progress: ${i + 1}/${batches.length} batches (${progress}%) - ETA: ${Math.round(estimatedTimeRemaining / 1000 / 60)}min`);
        }
        
        const totalTime = Date.now() - startTime;
        
        console.log(`🎉 MASS PROCESSING COMPLETED!`);
        console.log(`📊 Final Results:`);
        console.log(`   • Total Companies: ${allCompanies.length}`);
        console.log(`   • Successful: ${totalSuccess}`);
        console.log(`   • Errors: ${totalErrors}`);
        console.log(`   • Success Rate: ${Math.round((totalSuccess / allCompanies.length) * 100)}%`);
        console.log(`   • Total Time: ${Math.round(totalTime / 1000 / 60)} minutes`);
        console.log(`   • Average Time: ${Math.round(totalTime / allCompanies.length)}ms per company`);
        console.log(`   • Throughput: ${Math.round(allCompanies.length / (totalTime / 1000 / 60))} companies/minute`);
        
        // Save results to file
        const outputDir = path.dirname(CONFIG.OUTPUT_FILE);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        const finalResults = {
            summary: {
                totalCompanies: allCompanies.length,
                successfulProcessing: totalSuccess,
                errors: totalErrors,
                successRate: Math.round((totalSuccess / allCompanies.length) * 100),
                totalProcessingTime: totalTime,
                averageTimePerCompany: Math.round(totalTime / allCompanies.length),
                companiesPerMinute: Math.round(allCompanies.length / (totalTime / 1000 / 60)),
                timestamp: new Date().toISOString(),
                config: CONFIG
            },
            results: allResults
        };
        
        fs.writeFileSync(CONFIG.OUTPUT_FILE, JSON.stringify(finalResults, null, 2));
        console.log(`💾 Results saved to: ${CONFIG.OUTPUT_FILE}`);
        
        return finalResults;
        
    } catch (error) {
        console.error('❌ Mass processing failed:', error.message);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    console.log('🚀 ADRATA MASS COMPANY PROCESSOR');
    console.log('================================');
    processAllCompanies();
}

module.exports = { processAllCompanies, readCompaniesFromCSV };
