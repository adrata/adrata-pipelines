/**
 * DATA VALIDATION API
 * 
 * Validates that we're getting REAL data from APIs, not synthetic fallbacks
 * Shows exactly which data sources are being used and their accuracy
 */

const { ExecutiveResearch } = require('../../modules/ExecutiveResearch.js');

// Test with known companies and their actual executives
const VALIDATION_COMPANIES = [
    {
        companyName: 'Salesforce',
        domain: 'salesforce.com',
        expectedCFO: 'Amy Weaver',
        expectedCRO: 'Gavin Patterson'
    },
    {
        companyName: 'Microsoft',
        domain: 'microsoft.com', 
        expectedCFO: 'Amy Hood',
        expectedCRO: 'Judson Althoff'
    },
    {
        companyName: 'Adobe',
        domain: 'adobe.com',
        expectedCFO: 'Dan Durn',
        expectedCRO: 'David Wadhwani'
    },
    {
        companyName: 'HubSpot',
        domain: 'hubspot.com',
        expectedCFO: 'Kathryn Bueker', 
        expectedCRO: 'Yamini Rangan'
    },
    {
        companyName: 'Zoom',
        domain: 'zoom.us',
        expectedCFO: 'Kelly Steckelberg',
        expectedCRO: 'Ryan Azus'
    }
];

// Validate a single company's data
async function validateCompanyData(company) {
    const startTime = Date.now();
    console.log(`🔍 Validating: ${company.companyName}`);
    
    try {
        const executiveResearch = new ExecutiveResearch({
            PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY?.trim(),
            OPENAI_API_KEY: process.env.OPENAI_API_KEY?.trim(),
            CORESIGNAL_API_KEY: process.env.CORESIGNAL_API_KEY?.trim()
        });
        
        const result = await executiveResearch.researchExecutives({
            companyName: company.companyName,
            website: company.domain
        });
        
        const processingTime = Date.now() - startTime;
        
        // Check accuracy
        const cfoMatch = result.cfo?.name?.toLowerCase().includes(company.expectedCFO.toLowerCase().split(' ')[1]);
        const croMatch = result.cro?.name?.toLowerCase().includes(company.expectedCRO.toLowerCase().split(' ')[1]);
        
        return {
            company: company.companyName,
            domain: company.domain,
            processingTime: processingTime,
            
            // API Status
            apiStatus: {
                perplexityAvailable: !!process.env.PERPLEXITY_API_KEY,
                coreSignalAvailable: !!process.env.CORESIGNAL_API_KEY,
                openAIAvailable: !!process.env.OPENAI_API_KEY
            },
            
            // Executive Results
            executives: {
                cfo: {
                    found: result.cfo?.name || null,
                    expected: company.expectedCFO,
                    accurate: cfoMatch,
                    title: result.cfo?.title || null,
                    confidence: result.cfo?.confidence || 0,
                    source: result.cfo?.source || 'unknown',
                    tier: result.cfo?.tier || null
                },
                cro: {
                    found: result.cro?.name || null,
                    expected: company.expectedCRO,
                    accurate: croMatch,
                    title: result.cro?.title || null,
                    confidence: result.cro?.confidence || 0,
                    source: result.cro?.source || 'unknown',
                    tier: result.cro?.tier || null
                }
            },
            
            // Research Methods Used
            researchMethods: result.researchMethods || [],
            overallConfidence: result.overallConfidence || 0,
            
            // Data Quality Assessment
            dataQuality: {
                realData: !!(result.cfo?.name && result.cro?.name),
                accurateData: cfoMatch && croMatch,
                completeness: (result.cfo ? 50 : 0) + (result.cro ? 50 : 0),
                freshness: result.timestamp,
                sources: Array.from(new Set([
                    result.cfo?.source,
                    result.cro?.source
                ].filter(Boolean)))
            },
            
            success: true,
            timestamp: new Date().toISOString()
        };
        
    } catch (error) {
        console.error(`❌ Validation failed for ${company.companyName}:`, error.message);
        
        return {
            company: company.companyName,
            domain: company.domain,
            error: error.message,
            success: false,
            timestamp: new Date().toISOString()
        };
    }
}

// Validate all test companies
async function validateAllCompanies() {
    console.log('🔍 DATA VALIDATION: Starting comprehensive validation...');
    
    const results = [];
    
    for (const company of VALIDATION_COMPANIES) {
        const result = await validateCompanyData(company);
        results.push(result);
        
        // Brief pause between companies
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Calculate overall statistics
    const successfulResults = results.filter(r => r.success);
    const totalAccurate = successfulResults.filter(r => 
        r.dataQuality?.accurateData
    ).length;
    
    const summary = {
        totalCompanies: VALIDATION_COMPANIES.length,
        successfulProcessing: successfulResults.length,
        accurateResults: totalAccurate,
        accuracyRate: Math.round((totalAccurate / VALIDATION_COMPANIES.length) * 100),
        
        // API Status Summary
        apiStatus: {
            perplexityWorking: successfulResults.some(r => r.apiStatus?.perplexityAvailable),
            coreSignalWorking: successfulResults.some(r => r.apiStatus?.coreSignalAvailable),
            openAIWorking: successfulResults.some(r => r.apiStatus?.openAIAvailable)
        },
        
        // Data Source Analysis
        dataSources: {
            realAPIData: successfulResults.filter(r => 
                r.researchMethods?.includes('perplexity_search') || 
                r.researchMethods?.includes('coresignal_search')
            ).length,
            fallbackData: successfulResults.filter(r => 
                r.researchMethods?.includes('fallback_database')
            ).length,
            syntheticData: successfulResults.filter(r => 
                r.researchMethods?.includes('synthetic_generation')
            ).length
        },
        
        // Performance Metrics
        performance: {
            averageProcessingTime: Math.round(
                successfulResults.reduce((sum, r) => sum + (r.processingTime || 0), 0) / 
                successfulResults.length
            ),
            fastestCompany: Math.min(...successfulResults.map(r => r.processingTime || Infinity)),
            slowestCompany: Math.max(...successfulResults.map(r => r.processingTime || 0))
        }
    };
    
    return { results, summary };
}

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method === 'GET') {
        return res.status(200).json({
            endpoint: 'data-validation',
            description: 'Validates pipeline data accuracy against known executives',
            testCompanies: VALIDATION_COMPANIES.map(c => ({
                company: c.companyName,
                expectedCFO: c.expectedCFO,
                expectedCRO: c.expectedCRO
            })),
            usage: 'POST to run validation tests',
            timestamp: new Date().toISOString()
        });
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const startTime = Date.now();
    console.log('🔍 DATA VALIDATION API: Starting validation tests...');
    
    try {
        const { results, summary } = await validateAllCompanies();
        
        const totalTime = Date.now() - startTime;
        
        console.log(`✅ Validation completed in ${totalTime}ms`);
        console.log(`📊 Accuracy Rate: ${summary.accuracyRate}%`);
        console.log(`🔍 Real API Data: ${summary.dataSources.realAPIData}/${VALIDATION_COMPANIES.length}`);
        
        return res.status(200).json({
            validation: 'complete',
            summary: {
                ...summary,
                totalProcessingTime: totalTime,
                timestamp: new Date().toISOString()
            },
            results: results,
            recommendations: {
                dataAccuracy: summary.accuracyRate >= 80 ? 'EXCELLENT' : 
                             summary.accuracyRate >= 60 ? 'GOOD' : 'NEEDS_IMPROVEMENT',
                apiStatus: summary.apiStatus.perplexityWorking ? 'APIs_WORKING' : 'API_ISSUES',
                dataSource: summary.dataSources.realAPIData >= 3 ? 'REAL_DATA' : 'FALLBACK_DATA',
                readyForProduction: summary.accuracyRate >= 70 && summary.dataSources.realAPIData >= 3
            }
        });
        
    } catch (error) {
        const totalTime = Date.now() - startTime;
        console.error('❌ Validation failed:', error.message);
        
        return res.status(500).json({
            error: 'Validation failed',
            message: error.message,
            processingTime: totalTime,
            timestamp: new Date().toISOString()
        });
    }
};
