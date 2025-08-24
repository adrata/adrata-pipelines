/**
 * SUPER-FAST MINIMAL API
 * Bypasses CompanyResolver entirely and focuses on executive research
 * This will process 1000+ companies by skipping the hanging CompanyResolver
 */

const { ExecutiveResearch } = require('../../modules/ExecutiveResearch.js');

// Timeout wrapper
function withTimeout(promise, timeoutMs, operation) {
    return Promise.race([
        promise,
        new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`TIMEOUT: ${operation} exceeded ${timeoutMs}ms`)), timeoutMs)
        )
    ]);
}

// Process a single company with minimal overhead
async function processCompanyMinimal(company, index, total) {
    const startTime = Date.now();
    const companyId = company.companyName || company.domain || `company-${index}`;
    
    try {
        console.log(`🚀 [${index + 1}/${total}] MINIMAL: Starting ${companyId}`);
        
        const website = company.Website || company.domain || company.companyName;
        const companyName = company.companyName || website;
        
        // Skip CompanyResolver - go straight to ExecutiveResearch
        console.log(`🔍 [${index + 1}/${total}] Finding executives directly...`);
        const executiveResearch = new ExecutiveResearch({
            PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY?.trim(),
            OPENAI_API_KEY: process.env.OPENAI_API_KEY?.trim(),
            CORESIGNAL_API_KEY: process.env.CORESIGNAL_API_KEY?.trim()
        });
        
        const executives = await withTimeout(
            executiveResearch.researchExecutives({ companyName, website }),
            30000, // 30 second timeout
            `Executive research for ${companyId}`
        );
        
        const processingTime = Date.now() - startTime;
        console.log(`✅ [${index + 1}/${total}] MINIMAL: Completed ${companyId} (${processingTime}ms)`);
        console.log(`   CFO: ${executives?.cfo?.name || 'None'}, CRO: ${executives?.cro?.name || 'None'}`);
        
        return {
            success: true,
            website: website,
            companyName: companyName,
            accountOwner: company['Account Owner'] || 'Dan Mirolli',
            isTop1000: company['Top 1000'] === '1',
            
            // CFO Information
            cfoName: executives?.cfo?.name || null,
            cfoTitle: executives?.cfo?.title || null,
            cfoEmail: executives?.cfo?.email || null,
            cfoPhone: executives?.cfo?.phone || null,
            cfoLinkedIn: executives?.cfo?.linkedIn || null,
            
            // CRO Information
            croName: executives?.cro?.name || null,
            croTitle: executives?.cro?.title || null,
            croEmail: executives?.cro?.email || null,
            croPhone: executives?.cro?.phone || null,
            croLinkedIn: executives?.cro?.linkedIn || null,
            
            // Metadata
            processingTime: processingTime,
            confidence: executives?.confidence || 0,
            timestamp: new Date().toISOString(),
            method: 'minimal-bypass',
            index: index
        };
        
    } catch (error) {
        const processingTime = Date.now() - startTime;
        console.error(`❌ [${index + 1}/${total}] MINIMAL: Failed ${companyId} - ${error.message} (${processingTime}ms)`);
        
        return {
            success: false,
            website: company.Website || company.domain || company.companyName,
            companyName: company.companyName || 'Error',
            accountOwner: company['Account Owner'] || 'Dan Mirolli',
            error: error.message,
            processingTime: processingTime,
            timestamp: new Date().toISOString(),
            method: 'minimal-bypass',
            index: index
        };
    }
}

module.exports = async (req, res) => {
    const startTime = Date.now();
    console.log('🚀 SUPER-FAST MINIMAL API: Request received');
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method === 'GET') {
        return res.status(200).json({
            pipeline: 'super-fast-minimal',
            status: 'ready',
            message: 'Super-Fast Minimal API is ready',
            method: 'Direct ExecutiveResearch, bypassing CompanyResolver',
            maxParallel: 100,
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
        
        console.log(`🚀 SUPER-FAST: Processing ${companies.length} companies with minimal overhead`);
        
        // Process companies in parallel with chunking for large batches
        const CHUNK_SIZE = 50; // Process 50 at a time to avoid overwhelming
        const results = [];
        
        for (let i = 0; i < companies.length; i += CHUNK_SIZE) {
            const chunk = companies.slice(i, i + CHUNK_SIZE);
            const chunkNumber = Math.floor(i / CHUNK_SIZE) + 1;
            const totalChunks = Math.ceil(companies.length / CHUNK_SIZE);
            
            console.log(`🔄 Processing chunk ${chunkNumber}/${totalChunks} (${chunk.length} companies)`);
            
            // Process chunk in parallel
            const chunkPromises = chunk.map((company, chunkIndex) => 
                processCompanyMinimal(company, i + chunkIndex, companies.length)
            );
            
            const chunkResults = await withTimeout(
                Promise.allSettled(chunkPromises),
                180000, // 3 minutes per chunk
                `Chunk ${chunkNumber} processing`
            );
            
            // Extract results
            const chunkData = chunkResults.map((result, chunkIndex) => {
                if (result.status === 'fulfilled') {
                    return result.value;
                } else {
                    console.error(`❌ Promise rejected in chunk ${chunkNumber}:`, result.reason);
                    return {
                        success: false,
                        website: chunk[chunkIndex].domain || chunk[chunkIndex].companyName,
                        companyName: chunk[chunkIndex].companyName || 'Promise Error',
                        error: result.reason?.message || 'Promise rejection',
                        timestamp: new Date().toISOString(),
                        method: 'minimal-bypass',
                        index: i + chunkIndex
                    };
                }
            });
            
            results.push(...chunkData);
            
            const progress = Math.round(((i + chunk.length) / companies.length) * 100);
            console.log(`✅ Chunk ${chunkNumber}/${totalChunks} completed. Progress: ${progress}%`);
        }
        
        const totalTime = Date.now() - startTime;
        const successCount = results.filter(r => r.success).length;
        const errorCount = results.filter(r => !r.success).length;
        
        console.log(`🎉 SUPER-FAST: Completed in ${totalTime}ms (${Math.round(totalTime/companies.length)}ms/company)`);
        console.log(`📊 Results: ${successCount} success, ${errorCount} errors`);
        
        return res.status(200).json({
            pipeline: 'super-fast-minimal',
            results: results,
            summary: {
                totalCompanies: companies.length,
                successfulProcessing: successCount,
                errors: errorCount,
                totalProcessingTime: totalTime,
                averageTimePerCompany: Math.round(totalTime / companies.length),
                companiesPerSecond: Math.round(companies.length / (totalTime / 1000)),
                method: 'minimal-bypass'
            },
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        const totalTime = Date.now() - startTime;
        console.error('❌ SUPER-FAST: Fatal error:', error.message);
        console.error('❌ Stack trace:', error.stack);
        
        return res.status(500).json({
            error: 'Super-fast processing failed',
            message: error.message,
            processingTime: totalTime,
            timestamp: new Date().toISOString()
        });
    }
};
