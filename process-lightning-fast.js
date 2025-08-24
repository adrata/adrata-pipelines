#!/usr/bin/env node

/**
 * LIGHTNING-FAST MASS PROCESSOR
 * Process all 1233 companies using the lightning-fast API
 * Target: Complete processing in 15-30 minutes
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const fetch = require('node-fetch');

// Lightning-fast configuration
const CONFIG = {
    API_URL: 'https://adrata-pipelines-l9r4pncfm-adrata.vercel.app/api/lightning-fast',
    INPUT_FILE: './inputs/all-1233-companies.csv',
    OUTPUT_DIR: './outputs',
    BATCH_SIZE: 50,               // 50 companies per API call
    MAX_RETRIES: 1,               // Minimal retries for speed
    RETRY_DELAY: 2000,            // 2 seconds between retries
    REQUEST_TIMEOUT: 300000,      // 5 minutes per batch
    PIPELINE_TYPES: ['core', 'advanced', 'powerhouse']
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
                    industry: row.industry || row.Industry || row.sector || 'Technology',
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
async function processBatch(companies, pipelineType, batchNumber, totalBatches) {
    console.log(`⚡ Processing batch ${batchNumber}/${totalBatches} (${companies.length} companies) - ${pipelineType} pipeline`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT);
    
    try {
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ 
                companies: companies,
                pipelineType: pipelineType
            }),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log(`✅ Batch ${batchNumber} (${pipelineType}): ${result.summary?.successfulProcessing || 0} success, ${result.summary?.errors || 0} errors`);
        
        return result;
        
    } catch (error) {
        clearTimeout(timeoutId);
        console.error(`❌ Batch ${batchNumber} (${pipelineType}) failed:`, error.message);
        throw error;
    }
}

// Convert results to CSV format
function convertToCSV(results, pipelineType) {
    if (!results || results.length === 0) return '';
    
    let headers = [];
    let rows = [];
    
    if (pipelineType === 'core') {
        headers = [
            'Website', 'Company Name', 'CFO Name', 'CFO Email', 'CFO Phone', 'CFO LinkedIn', 
            'CFO Title', 'CFO Time in Role', 'CFO Country', 'CRO Name', 'CRO Email', 
            'CRO Phone', 'CRO LinkedIn', 'CRO Title', 'CRO Time in Role', 'CRO Country', 
            'CFO Selection Reason', 'Email Source', 'Account Owner'
        ];
        
        rows = results.map(r => [
            r.website || '', r.companyName || '', r.cfoName || '', r.cfoEmail || '', 
            r.cfoPhone || '', r.cfoLinkedIn || '', r.cfoTitle || '', r.cfoTimeInRole || '', 
            r.cfoCountry || '', r.croName || '', r.croEmail || '', r.croPhone || '', 
            r.croLinkedIn || '', r.croTitle || '', r.croTimeInRole || '', r.croCountry || '', 
            r.cfoSelectionReason || '', r.emailSource || '', r.accountOwner || ''
        ]);
    } else if (pipelineType === 'advanced') {
        headers = [
            'Website', 'Company Name', 'Industry', 'Industry Vertical', 'Executive Stability Risk', 
            'Deal Complexity Assessment', 'Competitive Context Analysis', 'Account Owner'
        ];
        
        rows = results.map(r => [
            r.website || '', r.companyName || '', r.industry || '', r.industryVertical || '', 
            r.executiveStabilityRisk || '', r.dealComplexityAssessment || '', 
            r.competitiveContextAnalysis || '', r.accountOwner || ''
        ]);
    } else if (pipelineType === 'powerhouse') {
        headers = [
            'Website', 'Company Name', 'Decision Maker', 'Decision Maker Role', 'Champion', 
            'Champion Role', 'Stakeholder', 'Stakeholder Role', 'Blocker', 'Blocker Role', 
            'Introducer', 'Introducer Role', 'Budget Authority Mapping', 'Procurement Maturity Score', 
            'Decision Style Analysis', 'Sales Cycle Prediction', 'Buyer Group Flight Risk', 
            'Routing Intelligence Strategy 1', 'Routing Intelligence Strategy 2', 
            'Routing Intelligence Strategy 3', 'Routing Intelligence Explanation', 'Account Owner'
        ];
        
        rows = results.map(r => [
            r.website || '', r.companyName || '', r.decisionMaker || '', r.decisionMakerRole || '', 
            r.champion || '', r.championRole || '', r.stakeholder || '', r.stakeholderRole || '', 
            r.blocker || '', r.blockerRole || '', r.introducer || '', r.introducerRole || '', 
            r.budgetAuthorityMapping || '', r.procurementMaturityScore || '', r.decisionStyleAnalysis || '', 
            r.salesCyclePrediction || '', r.buyerGroupFlightRisk || '', r.routingIntelligenceStrategy1 || '', 
            r.routingIntelligenceStrategy2 || '', r.routingIntelligenceStrategy3 || '', 
            r.routingIntelligenceExplanation || '', r.accountOwner || ''
        ]);
    }
    
    // Convert to CSV string
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    return csvContent;
}

// Process all companies for all pipeline types
async function processAllPipelines() {
    const startTime = Date.now();
    
    try {
        // Read companies from CSV
        const allCompanies = await readCompaniesFromCSV();
        
        if (allCompanies.length === 0) {
            throw new Error('No companies found in CSV file');
        }
        
        console.log(`⚡ LIGHTNING-FAST MASS PROCESSING: ${allCompanies.length} companies`);
        console.log(`📊 Configuration: ${CONFIG.BATCH_SIZE} companies per batch, ${CONFIG.PIPELINE_TYPES.length} pipeline types`);
        
        // Ensure output directory exists
        if (!fs.existsSync(CONFIG.OUTPUT_DIR)) {
            fs.mkdirSync(CONFIG.OUTPUT_DIR, { recursive: true });
        }
        
        // Process each pipeline type
        for (const pipelineType of CONFIG.PIPELINE_TYPES) {
            console.log(`\n🚀 Starting ${pipelineType.toUpperCase()} pipeline processing...`);
            
            // Split into batches
            const batches = [];
            for (let i = 0; i < allCompanies.length; i += CONFIG.BATCH_SIZE) {
                batches.push(allCompanies.slice(i, i + CONFIG.BATCH_SIZE));
            }
            
            console.log(`📦 Created ${batches.length} batches for ${pipelineType} pipeline`);
            
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
                        
                        batchResult = await processBatch(batch, pipelineType, i + 1, batches.length);
                        
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
                                    accountOwner: company['Account Owner'] || 'Dan Mirolli'
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
                
                console.log(`📊 ${pipelineType} Progress: ${i + 1}/${batches.length} batches (${progress}%) - ETA: ${Math.round(estimatedTimeRemaining / 1000 / 60)}min`);
            }
            
            // Save results to CSV
            const csvContent = convertToCSV(allResults.filter(r => r.success), pipelineType);
            const outputFile = path.join(CONFIG.OUTPUT_DIR, `${pipelineType}-pipeline-results.csv`);
            fs.writeFileSync(outputFile, csvContent);
            
            console.log(`✅ ${pipelineType.toUpperCase()} pipeline completed!`);
            console.log(`   • Total Companies: ${allCompanies.length}`);
            console.log(`   • Successful: ${totalSuccess}`);
            console.log(`   • Errors: ${totalErrors}`);
            console.log(`   • Success Rate: ${Math.round((totalSuccess / allCompanies.length) * 100)}%`);
            console.log(`   • Output: ${outputFile}`);
        }
        
        const totalTime = Date.now() - startTime;
        
        console.log(`\n🎉 ALL PIPELINES COMPLETED!`);
        console.log(`📊 Final Summary:`);
        console.log(`   • Total Processing Time: ${Math.round(totalTime / 1000 / 60)} minutes`);
        console.log(`   • Companies Processed: ${allCompanies.length}`);
        console.log(`   • Pipeline Types: ${CONFIG.PIPELINE_TYPES.length}`);
        console.log(`   • Average Speed: ${Math.round(allCompanies.length / (totalTime / 1000 / 60))} companies/minute`);
        console.log(`   • Output Files: ${CONFIG.PIPELINE_TYPES.map(p => `${p}-pipeline-results.csv`).join(', ')}`);
        
        return true;
        
    } catch (error) {
        console.error('❌ Mass processing failed:', error.message);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    console.log('⚡ LIGHTNING-FAST MASS PROCESSOR');
    console.log('=================================');
    processAllPipelines();
}

module.exports = { processAllPipelines };
