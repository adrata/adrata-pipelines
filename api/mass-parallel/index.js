/**
 * MASS PARALLEL PROCESSING API
 * Designed to process 1000+ companies simultaneously using:
 * - Promise.allSettled for massive parallelization
 * - Chunked processing to avoid memory issues
 * - Aggressive timeouts and error handling
 * - Real-time progress reporting
 */

const { CorePipeline } = require('../../pipelines/core-pipeline.js');

// Configuration for mass parallel processing
const PARALLEL_CONFIG = {
    MAX_CONCURRENT_COMPANIES: 100,     // Process 100 companies at once
    CHUNK_SIZE: 50,                    // Break into chunks of 50
    COMPANY_TIMEOUT: 120000,           // 2 minutes per company max
    TOTAL_TIMEOUT: 600000,             // 10 minutes total max
    RETRY_ATTEMPTS: 1,                 // Retry failed companies once
    MEMORY_CLEANUP_INTERVAL: 25        // Force GC every 25 companies
};

// Timeout wrapper
function withTimeout(promise, timeoutMs, operation) {
    return Promise.race([
        promise,
        new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`TIMEOUT: ${operation} exceeded ${timeoutMs}ms`)), timeoutMs)
        )
    ]);
}

// Process a single company with full error handling
async function processSingleCompanyParallel(company, index, total) {
    const startTime = Date.now();
    const companyId = company.companyName || company.domain || `company-${index}`;
    
    try {
        console.log(`🚀 [${index + 1}/${total}] Starting: ${companyId}`);
        
        // Create fresh pipeline instance for each company
        const pipeline = new CorePipeline();
        
        const website = company.Website || company.domain || company.companyName;
        
        // Process with timeout
        const result = await withTimeout(
            pipeline.processSingleCompany({
                website: website,
                companyName: company.companyName,
                accountOwner: company['Account Owner'] || 'Dan Mirolli',
                isTop1000: company['Top 1000'] === '1'
            }),
            PARALLEL_CONFIG.COMPANY_TIMEOUT,
            `Company ${companyId}`
        );
        
        const processingTime = Date.now() - startTime;
        console.log(`✅ [${index + 1}/${total}] Completed: ${companyId} (${processingTime}ms)`);
        
        // Ensure result structure
        if (!result) {
            throw new Error('No result returned from pipeline');
        }
        
        // Add default values if missing
        const cfo = result.cfo || { name: null, title: null, email: null, phone: null, linkedIn: null };
        const cro = result.cro || { name: null, title: null, email: null, phone: null, linkedIn: null };
        
        return {
            success: true,
            website: website,
            companyName: result.companyName || company.companyName || 'Unknown',
            accountOwner: company['Account Owner'] || 'Dan Mirolli',
            isTop1000: company['Top 1000'] === '1',
            
            // CFO Information
            cfoName: cfo.name,
            cfoTitle: cfo.title,
            cfoEmail: cfo.email,
            cfoPhone: cfo.phone,
            cfoLinkedIn: cfo.linkedIn,
            
            // CRO Information
            croName: cro.name,
            croTitle: cro.title,
            croEmail: cro.email,
            croPhone: cro.phone,
            croLinkedIn: cro.linkedIn,
            
            // Metadata
            processingTime: processingTime,
            confidence: result.confidence || 0,
            timestamp: new Date().toISOString(),
            parallelMode: true,
            index: index
        };
        
    } catch (error) {
        const processingTime = Date.now() - startTime;
        console.error(`❌ [${index + 1}/${total}] Failed: ${companyId} - ${error.message} (${processingTime}ms)`);
        
        return {
            success: false,
            website: company.Website || company.domain || company.companyName,
            companyName: company.companyName || 'Error',
            accountOwner: company['Account Owner'] || 'Dan Mirolli',
            error: error.message,
            processingTime: processingTime,
            timestamp: new Date().toISOString(),
            parallelMode: true,
            index: index
        };
    }
}

// Process companies in parallel chunks
async function processCompaniesInParallel(companies) {
    const totalCompanies = companies.length;
    const results = [];
    let processedCount = 0;
    
    console.log(`🚀 MASS PARALLEL: Starting processing of ${totalCompanies} companies`);
    console.log(`📊 Config: ${PARALLEL_CONFIG.CHUNK_SIZE} per chunk, ${PARALLEL_CONFIG.MAX_CONCURRENT_COMPANIES} max concurrent`);
    
    // Process in chunks to avoid overwhelming the system
    for (let i = 0; i < totalCompanies; i += PARALLEL_CONFIG.CHUNK_SIZE) {
        const chunk = companies.slice(i, i + PARALLEL_CONFIG.CHUNK_SIZE);
        const chunkNumber = Math.floor(i / PARALLEL_CONFIG.CHUNK_SIZE) + 1;
        const totalChunks = Math.ceil(totalCompanies / PARALLEL_CONFIG.CHUNK_SIZE);
        
        console.log(`🔄 Processing chunk ${chunkNumber}/${totalChunks} (${chunk.length} companies)`);
        
        try {
            // Process all companies in this chunk simultaneously
            const chunkPromises = chunk.map((company, chunkIndex) => 
                processSingleCompanyParallel(company, i + chunkIndex, totalCompanies)
            );
            
            // Wait for all companies in chunk to complete (or fail)
            const chunkResults = await Promise.allSettled(chunkPromises);
            
            // Extract results and handle any Promise rejections
            const chunkData = chunkResults.map((result, chunkIndex) => {
                if (result.status === 'fulfilled') {
                    return result.value;
                } else {
                    console.error(`❌ Promise rejected for company ${i + chunkIndex}:`, result.reason);
                    return {
                        success: false,
                        website: chunk[chunkIndex].domain || chunk[chunkIndex].companyName,
                        companyName: chunk[chunkIndex].companyName || 'Promise Error',
                        error: result.reason?.message || 'Promise rejection',
                        timestamp: new Date().toISOString(),
                        parallelMode: true,
                        index: i + chunkIndex
                    };
                }
            });
            
            results.push(...chunkData);
            processedCount += chunk.length;
            
            console.log(`✅ Chunk ${chunkNumber}/${totalChunks} completed. Progress: ${processedCount}/${totalCompanies} (${Math.round(processedCount/totalCompanies*100)}%)`);
            
            // Force garbage collection every few chunks to prevent memory issues
            if (chunkNumber % PARALLEL_CONFIG.MEMORY_CLEANUP_INTERVAL === 0) {
                if (global.gc) {
                    console.log('🧹 Running garbage collection...');
                    global.gc();
                }
            }
            
        } catch (error) {
            console.error(`❌ Chunk ${chunkNumber} failed:`, error.message);
            
            // Add error results for all companies in failed chunk
            const errorResults = chunk.map((company, chunkIndex) => ({
                success: false,
                website: company.domain || company.companyName,
                companyName: company.companyName || 'Chunk Error',
                error: `Chunk processing failed: ${error.message}`,
                timestamp: new Date().toISOString(),
                parallelMode: true,
                index: i + chunkIndex
            }));
            
            results.push(...errorResults);
            processedCount += chunk.length;
        }
    }
    
    console.log(`🎉 MASS PARALLEL: Completed processing ${totalCompanies} companies`);
    return results;
}

module.exports = async (req, res) => {
    const startTime = Date.now();
    console.log('🚀 MASS PARALLEL API: Request received');
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method === 'GET') {
        return res.status(200).json({
            pipeline: 'mass-parallel',
            status: 'ready',
            message: 'Mass Parallel Processing API is ready',
            config: PARALLEL_CONFIG,
            timestamp: new Date().toISOString()
        });
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { companies } = req.body || {};
        
        if (!companies || !Array.isArray(companies)) {
            return res.status(400).json({
                error: 'Invalid request. Expected { companies: [...] } in the request body.'
            });
        }
        
        if (companies.length === 0) {
            return res.status(400).json({
                error: 'No companies provided for processing.'
            });
        }
        
        console.log(`🚀 MASS PARALLEL: Processing ${companies.length} companies with massive parallelization`);
        
        // Add total timeout for the entire operation
        const results = await withTimeout(
            processCompaniesInParallel(companies),
            PARALLEL_CONFIG.TOTAL_TIMEOUT,
            `Mass parallel processing of ${companies.length} companies`
        );
        
        const totalTime = Date.now() - startTime;
        const successCount = results.filter(r => r.success).length;
        const errorCount = results.filter(r => !r.success).length;
        const avgTimePerCompany = totalTime / companies.length;
        
        console.log(`🎉 MASS PARALLEL: Completed in ${totalTime}ms (${avgTimePerCompany.toFixed(0)}ms/company)`);
        console.log(`📊 Results: ${successCount} success, ${errorCount} errors`);
        
        const response = {
            pipeline: 'mass-parallel',
            results: results,
            summary: {
                totalCompanies: companies.length,
                successfulProcessing: successCount,
                errors: errorCount,
                totalProcessingTime: totalTime,
                averageTimePerCompany: Math.round(avgTimePerCompany),
                companiesPerSecond: Math.round(companies.length / (totalTime / 1000)),
                config: PARALLEL_CONFIG
            },
            timestamp: new Date().toISOString()
        };
        
        return res.status(200).json(response);
        
    } catch (error) {
        const totalTime = Date.now() - startTime;
        console.error('❌ MASS PARALLEL: Fatal error:', error.message);
        console.error('❌ Stack trace:', error.stack);
        
        return res.status(500).json({
            error: 'Mass parallel processing failed',
            message: error.message,
            processingTime: totalTime,
            timestamp: new Date().toISOString()
        });
    }
};
