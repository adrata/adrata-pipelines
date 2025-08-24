/**
 * DEBUG VERSION OF CORE API
 * This version adds extensive logging and timeouts to isolate the hanging issue
 */

const { CorePipeline } = require('../../pipelines/core-pipeline.js');

// Add timeout wrapper for any async operation
function withTimeout(promise, timeoutMs, operation) {
    return Promise.race([
        promise,
        new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`${operation} timed out after ${timeoutMs}ms`)), timeoutMs)
        )
    ]);
}

async function processCoreCompany(company) {
    console.log(`🔄 DEBUG: Starting processCoreCompany for ${company.companyName || company.domain}`);
    
    try {
        console.log('🔄 DEBUG: Creating CorePipeline instance...');
        const pipeline = new CorePipeline();
        console.log('✅ DEBUG: CorePipeline instance created successfully');

        const website = company.Website || company.domain || company.companyName;
        console.log(`🔄 DEBUG: Extracted website: ${website}`);

        console.log('🔄 DEBUG: Calling pipeline.processSingleCompany...');
        
        // Add 30-second timeout to the pipeline processing
        const result = await withTimeout(
            pipeline.processSingleCompany({
                website: website,
                companyName: company.companyName,
                accountOwner: company['Account Owner'] || 'Dan Mirolli',
                isTop1000: company['Top 1000'] === '1'
            }),
            30000, // 30 second timeout
            'pipeline.processSingleCompany'
        );
        
        console.log('✅ DEBUG: pipeline.processSingleCompany completed');
        console.log('🔍 DEBUG: Result keys:', Object.keys(result || {}));

        if (!result) {
            console.error('❌ DEBUG: processSingleCompany returned null/undefined');
            throw new Error('No result returned from processing');
        }

        // Ensure default values exist
        if (!result.cfo) {
            console.log('🔧 DEBUG: Adding default CFO object');
            result.cfo = { name: '', title: '', email: '', phone: '', linkedIn: '', confidence: 0, tier: null, role: 'N/A' };
        }
        if (!result.cro) {
            console.log('🔧 DEBUG: Adding default CRO object');
            result.cro = { name: '', title: '', email: '', phone: '', linkedIn: '', confidence: 0, tier: null, role: 'N/A' };
        }

        console.log('✅ DEBUG: Returning formatted result');
        return {
            website: website,
            companyName: result.companyName || company.companyName || 'Unknown',
            accountOwner: company['Account Owner'] || 'Dan Mirolli',
            isTop1000: company['Top 1000'] === '1',

            // CFO Information
            cfoName: result.cfo?.name || null,
            cfoTitle: result.cfo?.title || null,
            cfoEmail: result.cfo?.email || null,
            cfoPhone: result.cfo?.phone || null,
            cfoLinkedIn: result.cfo?.linkedIn || null,

            // CRO Information
            croName: result.cro?.name || null,
            croTitle: result.cro?.title || null,
            croEmail: result.cro?.email || null,
            croPhone: result.cro?.phone || null,
            croLinkedIn: result.cro?.linkedIn || null,

            // Metadata
            processingTime: result.processingTime || 0,
            confidence: result.confidence || 0,
            timestamp: new Date().toISOString(),
            debugMode: true
        };

    } catch (error) {
        const website = company.Website || company.domain || company.companyName;
        console.error(`❌ DEBUG: Error processing ${website}:`, error.message);
        console.error(`❌ DEBUG: Stack trace:`, error.stack);
        
        return {
            website: website,
            companyName: company.companyName || 'Error',
            accountOwner: company['Account Owner'] || 'Dan Mirolli',
            error: error.message,
            timestamp: new Date().toISOString(),
            debugMode: true
        };
    }
}

module.exports = async (req, res) => {
    console.log('🚀 DEBUG: Core Pipeline Debug API - Request received');
    console.log('🔍 DEBUG: Method:', req.method);
    console.log('🔍 DEBUG: User-Agent:', req.headers['user-agent']);
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        console.log('🔍 DEBUG: Handling OPTIONS request');
        return res.status(200).end();
    }
    
    if (req.method === 'GET') {
        console.log('🔍 DEBUG: Handling GET request - returning API info');
        return res.status(200).json({
            pipeline: 'core-debug',
            status: 'ready',
            message: 'Core Pipeline Debug API is ready',
            timestamp: new Date().toISOString(),
            environment: {
                nodeVersion: process.version,
                platform: process.platform,
                memoryUsage: process.memoryUsage()
            }
        });
    }
    
    if (req.method !== 'POST') {
        console.log('❌ DEBUG: Method not allowed:', req.method);
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        console.log('🔍 DEBUG: Parsing request body...');
        const { companies } = req.body || {};
        
        if (!companies || !Array.isArray(companies)) {
            console.log('❌ DEBUG: Invalid request body format');
            return res.status(400).json({
                error: 'Invalid request. Expected { companies: [...] } in the request body.'
            });
        }
        
        console.log(`🚀 DEBUG: Core Pipeline: Processing ${companies.length} companies`);
        
        const results = [];
        
        // Process companies sequentially to avoid overwhelming the system
        for (let i = 0; i < companies.length; i++) {
            const company = companies[i];
            console.log(`🔄 DEBUG: Processing company ${i + 1}/${companies.length}: ${company.companyName || company.domain}`);
            
            try {
                // Add timeout for each company processing
                const result = await withTimeout(
                    processCoreCompany(company),
                    60000, // 60 second timeout per company
                    `processCoreCompany for ${company.companyName || company.domain}`
                );
                
                results.push(result);
                console.log(`✅ DEBUG: Completed company ${i + 1}/${companies.length}`);
                
            } catch (error) {
                console.error(`❌ DEBUG: Error processing company ${i + 1}:`, error.message);
                results.push({
                    website: company.domain || company.companyName,
                    companyName: company.companyName || 'Error',
                    error: error.message,
                    timestamp: new Date().toISOString(),
                    debugMode: true
                });
            }
        }
        
        console.log('✅ DEBUG: All companies processed successfully');
        
        const response = {
            pipeline: 'core-debug',
            results,
            summary: {
                totalCompanies: companies.length,
                successfulProcessing: results.filter(r => !r.error).length,
                errors: results.filter(r => r.error).length,
                debugMode: true
            },
            timestamp: new Date().toISOString()
        };
        
        console.log('🔍 DEBUG: Sending response...');
        return res.status(200).json(response);
        
    } catch (error) {
        console.error('❌ DEBUG: Fatal error in core-debug API:', error.message);
        console.error('❌ DEBUG: Stack trace:', error.stack);
        
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message,
            timestamp: new Date().toISOString(),
            debugMode: true
        });
    }
};
