/**
 * ENHANCED FAST API
 * Adds contact intelligence and missing fields to match the expected CSV format
 * Includes all 19 required columns from core-pipeline-example.csv
 */

const { ExecutiveResearch } = require('../../modules/ExecutiveResearch.js');
const { ExecutiveContactIntelligence } = require('../../modules/ExecutiveContactIntelligence.js');
const { ContactValidator } = require('../../modules/ContactValidator.js');

// Timeout wrapper
function withTimeout(promise, timeoutMs, operation) {
    return Promise.race([
        promise,
        new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`TIMEOUT: ${operation} exceeded ${timeoutMs}ms`)), timeoutMs)
        )
    ]);
}

// Enhanced company processing with full contact intelligence
async function processCompanyEnhanced(company, index, total) {
    const startTime = Date.now();
    const companyId = company.companyName || company.domain || `company-${index}`;
    
    try {
        console.log(`🚀 [${index + 1}/${total}] ENHANCED: Starting ${companyId}`);
        
        const website = company.Website || company.domain || company.companyName;
        const companyName = company.companyName || website;
        
        // Step 1: Executive Research (30s timeout)
        console.log(`🔍 [${index + 1}/${total}] Finding executives...`);
        const executiveResearch = new ExecutiveResearch({
            PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY?.trim(),
            OPENAI_API_KEY: process.env.OPENAI_API_KEY?.trim(),
            CORESIGNAL_API_KEY: process.env.CORESIGNAL_API_KEY?.trim()
        });
        
        const executives = await withTimeout(
            executiveResearch.researchExecutives({ companyName, website }),
            30000,
            `Executive research for ${companyId}`
        );
        
        console.log(`✅ [${index + 1}/${total}] Executives found: CFO=${executives?.cfo?.name || 'None'}, CRO=${executives?.cro?.name || 'None'}`);
        
        // Step 2: Contact Intelligence (45s timeout)
        let contactIntelligence = null;
        try {
            console.log(`🔍 [${index + 1}/${total}] Getting contact intelligence...`);
            const contactModule = new ExecutiveContactIntelligence({
                CORESIGNAL_API_KEY: process.env.CORESIGNAL_API_KEY?.trim(),
                LUSHA_API_KEY: process.env.LUSHA_API_KEY?.trim(),
                PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY?.trim(),
                ZEROBOUNCE_API_KEY: process.env.ZEROBOUNCE_API_KEY?.trim(),
                PROSPEO_API_KEY: process.env.PROSPEO_API_KEY?.trim()
            });
            
            // Create mock company result for contact intelligence
            const companyResult = {
                companyName: companyName,
                website: website,
                status: 'ACTIVE'
            };
            
            contactIntelligence = await withTimeout(
                contactModule.enhanceExecutiveContacts(companyResult, executives),
                45000,
                `Contact intelligence for ${companyId}`
            );
            
            console.log(`✅ [${index + 1}/${total}] Contact intelligence completed`);
            
        } catch (contactError) {
            console.log(`⚠️ [${index + 1}/${total}] Contact intelligence failed: ${contactError.message}`);
            // Continue without contact intelligence
        }
        
        // Step 3: Contact Validation (20s timeout) - Optional
        let validatedContacts = null;
        try {
            if (contactIntelligence?.cfo?.email || contactIntelligence?.cro?.email) {
                console.log(`🔍 [${index + 1}/${total}] Validating contacts...`);
                const validator = new ContactValidator({
                    ZEROBOUNCE_API_KEY: process.env.ZEROBOUNCE_API_KEY?.trim(),
                    LUSHA_API_KEY: process.env.LUSHA_API_KEY?.trim()
                });
                
                validatedContacts = await withTimeout(
                    validator.validateExecutiveContacts(contactIntelligence),
                    20000,
                    `Contact validation for ${companyId}`
                );
                
                console.log(`✅ [${index + 1}/${total}] Contact validation completed`);
            }
        } catch (validationError) {
            console.log(`⚠️ [${index + 1}/${total}] Contact validation failed: ${validationError.message}`);
            // Continue without validation
        }
        
        const processingTime = Date.now() - startTime;
        console.log(`✅ [${index + 1}/${total}] ENHANCED: Completed ${companyId} (${processingTime}ms)`);
        
        // Merge all data sources
        const finalCfo = {
            name: executives?.cfo?.name || null,
            title: executives?.cfo?.title || null,
            email: validatedContacts?.cfo?.email || contactIntelligence?.cfo?.email || null,
            phone: contactIntelligence?.cfo?.phone || null,
            linkedIn: contactIntelligence?.cfo?.linkedIn || null,
            timeInRole: contactIntelligence?.cfo?.timeInRole || 'Unknown',
            country: contactIntelligence?.cfo?.country || 'Unknown',
            selectionReason: executives?.cfo?.selectionReason || `${executives?.cfo?.title || 'Executive'} title match with leadership research`,
            emailSource: validatedContacts?.cfo?.emailSource || contactIntelligence?.cfo?.emailSource || 'Executive research'
        };
        
        const finalCro = {
            name: executives?.cro?.name || null,
            title: executives?.cro?.title || null,
            email: validatedContacts?.cro?.email || contactIntelligence?.cro?.email || null,
            phone: contactIntelligence?.cro?.phone || null,
            linkedIn: contactIntelligence?.cro?.linkedIn || null,
            timeInRole: contactIntelligence?.cro?.timeInRole || 'Unknown',
            country: contactIntelligence?.cro?.country || 'Unknown'
        };
        
        return {
            success: true,
            
            // Core company info
            website: website,
            companyName: companyName,
            accountOwner: company['Account Owner'] || 'Dan Mirolli',
            
            // CFO Information (matching CSV columns)
            cfoName: finalCfo.name,
            cfoEmail: finalCfo.email,
            cfoPhone: finalCfo.phone,
            cfoLinkedIn: finalCfo.linkedIn,
            cfoTitle: finalCfo.title,
            cfoTimeInRole: finalCfo.timeInRole,
            cfoCountry: finalCfo.country,
            
            // CRO Information (matching CSV columns)
            croName: finalCro.name,
            croEmail: finalCro.email,
            croPhone: finalCro.phone,
            croLinkedIn: finalCro.linkedIn,
            croTitle: finalCro.title,
            croTimeInRole: finalCro.timeInRole,
            croCountry: finalCro.country,
            
            // Additional required fields
            cfoSelectionReason: finalCfo.selectionReason,
            emailSource: finalCfo.emailSource,
            
            // Metadata
            processingTime: processingTime,
            confidence: executives?.confidence || 0,
            timestamp: new Date().toISOString(),
            method: 'enhanced-full',
            index: index
        };
        
    } catch (error) {
        const processingTime = Date.now() - startTime;
        console.error(`❌ [${index + 1}/${total}] ENHANCED: Failed ${companyId} - ${error.message} (${processingTime}ms)`);
        
        return {
            success: false,
            website: company.Website || company.domain || company.companyName,
            companyName: company.companyName || 'Error',
            accountOwner: company['Account Owner'] || 'Dan Mirolli',
            error: error.message,
            processingTime: processingTime,
            timestamp: new Date().toISOString(),
            method: 'enhanced-full',
            index: index
        };
    }
}

module.exports = async (req, res) => {
    const startTime = Date.now();
    console.log('🚀 ENHANCED FAST API: Request received');
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method === 'GET') {
        return res.status(200).json({
            pipeline: 'enhanced-fast',
            status: 'ready',
            message: 'Enhanced Fast API with full contact intelligence',
            features: [
                'Executive Research',
                'Contact Intelligence (emails, phones, LinkedIn)',
                'Contact Validation',
                'All 19 CSV columns',
                'Parallel processing'
            ],
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
        
        console.log(`🚀 ENHANCED: Processing ${companies.length} companies with full intelligence`);
        
        // Process companies in parallel with chunking
        const CHUNK_SIZE = 25; // Smaller chunks for enhanced processing
        const results = [];
        
        for (let i = 0; i < companies.length; i += CHUNK_SIZE) {
            const chunk = companies.slice(i, i + CHUNK_SIZE);
            const chunkNumber = Math.floor(i / CHUNK_SIZE) + 1;
            const totalChunks = Math.ceil(companies.length / CHUNK_SIZE);
            
            console.log(`🔄 Processing chunk ${chunkNumber}/${totalChunks} (${chunk.length} companies)`);
            
            // Process chunk in parallel
            const chunkPromises = chunk.map((company, chunkIndex) => 
                processCompanyEnhanced(company, i + chunkIndex, companies.length)
            );
            
            const chunkResults = await withTimeout(
                Promise.allSettled(chunkPromises),
                300000, // 5 minutes per chunk
                `Enhanced chunk ${chunkNumber} processing`
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
                        method: 'enhanced-full',
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
        const contactsFound = results.filter(r => r.success && (r.cfoEmail || r.croEmail)).length;
        
        console.log(`🎉 ENHANCED: Completed in ${totalTime}ms (${Math.round(totalTime/companies.length)}ms/company)`);
        console.log(`📊 Results: ${successCount} success, ${errorCount} errors, ${contactsFound} with contacts`);
        
        return res.status(200).json({
            pipeline: 'enhanced-fast',
            results: results,
            summary: {
                totalCompanies: companies.length,
                successfulProcessing: successCount,
                errors: errorCount,
                contactsFound: contactsFound,
                contactRate: Math.round((contactsFound / successCount) * 100),
                totalProcessingTime: totalTime,
                averageTimePerCompany: Math.round(totalTime / companies.length),
                companiesPerMinute: Math.round(companies.length / (totalTime / 1000 / 60)),
                method: 'enhanced-full'
            },
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        const totalTime = Date.now() - startTime;
        console.error('❌ ENHANCED: Fatal error:', error.message);
        console.error('❌ Stack trace:', error.stack);
        
        return res.status(500).json({
            error: 'Enhanced processing failed',
            message: error.message,
            processingTime: totalTime,
            timestamp: new Date().toISOString()
        });
    }
};
