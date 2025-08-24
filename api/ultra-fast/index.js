/**
 * ULTRA-FAST BYPASS API
 * Bypasses the CorePipeline class and calls modules directly
 * This will help us identify if the issue is in CorePipeline or the modules
 */

// Direct module imports
const { CompanyResolver } = require('../../modules/CompanyResolver.js');
const { ExecutiveResearch } = require('../../modules/ExecutiveResearch.js');
const { ExecutiveContactIntelligence } = require('../../modules/ExecutiveContactIntelligence.js');

// Timeout wrapper
function withTimeout(promise, timeoutMs, operation) {
    return Promise.race([
        promise,
        new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`TIMEOUT: ${operation} exceeded ${timeoutMs}ms`)), timeoutMs)
        )
    ]);
}

// Process a single company using modules directly
async function processCompanyDirect(company, index, total) {
    const startTime = Date.now();
    const companyId = company.companyName || company.domain || `company-${index}`;
    
    try {
        console.log(`🚀 [${index + 1}/${total}] DIRECT: Starting ${companyId}`);
        
        // Step 1: Company Resolution (5 second timeout)
        console.log(`🔍 [${index + 1}/${total}] Resolving company...`);
        const resolver = new CompanyResolver({
            PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY?.trim(),
            OPENAI_API_KEY: process.env.OPENAI_API_KEY?.trim()
        });
        
        const website = company.Website || company.domain || company.companyName;
        const companyResult = await withTimeout(
            resolver.resolveCompany(website),
            10000,
            `Company resolution for ${companyId}`
        );
        
        console.log(`✅ [${index + 1}/${total}] Company resolved: ${companyResult?.companyName || 'Unknown'}`);
        
        // Step 2: Executive Research (10 second timeout)
        console.log(`🔍 [${index + 1}/${total}] Finding executives...`);
        const executiveResearch = new ExecutiveResearch({
            PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY?.trim(),
            OPENAI_API_KEY: process.env.OPENAI_API_KEY?.trim(),
            CORESIGNAL_API_KEY: process.env.CORESIGNAL_API_KEY?.trim()
        });
        
        const executives = await withTimeout(
            executiveResearch.findExecutives(companyResult?.companyName || website, website),
            15000,
            `Executive research for ${companyId}`
        );
        
        console.log(`✅ [${index + 1}/${total}] Executives found: CFO=${executives?.cfo?.name || 'None'}, CRO=${executives?.cro?.name || 'None'}`);
        
        // Step 3: Contact Intelligence (15 second timeout) - OPTIONAL
        let contactIntelligence = null;
        try {
            console.log(`🔍 [${index + 1}/${total}] Getting contact info...`);
            const contactModule = new ExecutiveContactIntelligence({
                CORESIGNAL_API_KEY: process.env.CORESIGNAL_API_KEY?.trim(),
                LUSHA_API_KEY: process.env.LUSHA_API_KEY?.trim(),
                PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY?.trim()
            });
            
            contactIntelligence = await withTimeout(
                contactModule.enhanceExecutiveContacts(companyResult, executives),
                20000,
                `Contact intelligence for ${companyId}`
            );
            
            console.log(`✅ [${index + 1}/${total}] Contact info enhanced`);
            
        } catch (contactError) {
            console.log(`⚠️ [${index + 1}/${total}] Contact intelligence failed: ${contactError.message}`);
            // Continue without contact intelligence
        }
        
        const processingTime = Date.now() - startTime;
        console.log(`✅ [${index + 1}/${total}] DIRECT: Completed ${companyId} (${processingTime}ms)`);
        
        // Merge results
        const finalCfo = {
            name: executives?.cfo?.name || null,
            title: executives?.cfo?.title || null,
            email: contactIntelligence?.cfo?.email || null,
            phone: contactIntelligence?.cfo?.phone || null,
            linkedIn: contactIntelligence?.cfo?.linkedIn || null
        };
        
        const finalCro = {
            name: executives?.cro?.name || null,
            title: executives?.cro?.title || null,
            email: contactIntelligence?.cro?.email || null,
            phone: contactIntelligence?.cro?.phone || null,
            linkedIn: contactIntelligence?.cro?.linkedIn || null
        };
        
        return {
            success: true,
            website: website,
            companyName: companyResult?.companyName || company.companyName || 'Unknown',
            accountOwner: company['Account Owner'] || 'Dan Mirolli',
            isTop1000: company['Top 1000'] === '1',
            
            // CFO Information
            cfoName: finalCfo.name,
            cfoTitle: finalCfo.title,
            cfoEmail: finalCfo.email,
            cfoPhone: finalCfo.phone,
            cfoLinkedIn: finalCfo.linkedIn,
            
            // CRO Information
            croName: finalCro.name,
            croTitle: finalCro.title,
            croEmail: finalCro.email,
            croPhone: finalCro.phone,
            croLinkedIn: finalCro.linkedIn,
            
            // Metadata
            processingTime: processingTime,
            confidence: executives?.confidence || 0,
            timestamp: new Date().toISOString(),
            method: 'direct-modules',
            index: index
        };
        
    } catch (error) {
        const processingTime = Date.now() - startTime;
        console.error(`❌ [${index + 1}/${total}] DIRECT: Failed ${companyId} - ${error.message} (${processingTime}ms)`);
        
        return {
            success: false,
            website: company.Website || company.domain || company.companyName,
            companyName: company.companyName || 'Error',
            accountOwner: company['Account Owner'] || 'Dan Mirolli',
            error: error.message,
            processingTime: processingTime,
            timestamp: new Date().toISOString(),
            method: 'direct-modules',
            index: index
        };
    }
}

module.exports = async (req, res) => {
    const startTime = Date.now();
    console.log('🚀 ULTRA-FAST BYPASS API: Request received');
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method === 'GET') {
        return res.status(200).json({
            pipeline: 'ultra-fast-bypass',
            status: 'ready',
            message: 'Ultra-Fast Bypass API is ready',
            method: 'Direct module calls, bypassing CorePipeline',
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
        
        console.log(`🚀 ULTRA-FAST: Processing ${companies.length} companies with direct module calls`);
        
        // Process all companies in parallel
        const promises = companies.map((company, index) => 
            processCompanyDirect(company, index, companies.length)
        );
        
        // Wait for all to complete with 2-minute total timeout
        const results = await withTimeout(
            Promise.allSettled(promises),
            120000,
            `Ultra-fast processing of ${companies.length} companies`
        );
        
        // Extract results
        const finalResults = results.map((result, index) => {
            if (result.status === 'fulfilled') {
                return result.value;
            } else {
                console.error(`❌ Promise rejected for company ${index}:`, result.reason);
                return {
                    success: false,
                    website: companies[index].domain || companies[index].companyName,
                    companyName: companies[index].companyName || 'Promise Error',
                    error: result.reason?.message || 'Promise rejection',
                    timestamp: new Date().toISOString(),
                    method: 'direct-modules',
                    index: index
                };
            }
        });
        
        const totalTime = Date.now() - startTime;
        const successCount = finalResults.filter(r => r.success).length;
        const errorCount = finalResults.filter(r => !r.success).length;
        
        console.log(`🎉 ULTRA-FAST: Completed in ${totalTime}ms`);
        console.log(`📊 Results: ${successCount} success, ${errorCount} errors`);
        
        return res.status(200).json({
            pipeline: 'ultra-fast-bypass',
            results: finalResults,
            summary: {
                totalCompanies: companies.length,
                successfulProcessing: successCount,
                errors: errorCount,
                totalProcessingTime: totalTime,
                averageTimePerCompany: Math.round(totalTime / companies.length),
                method: 'direct-modules'
            },
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        const totalTime = Date.now() - startTime;
        console.error('❌ ULTRA-FAST: Fatal error:', error.message);
        console.error('❌ Stack trace:', error.stack);
        
        return res.status(500).json({
            error: 'Ultra-fast processing failed',
            message: error.message,
            processingTime: totalTime,
            timestamp: new Date().toISOString()
        });
    }
};
