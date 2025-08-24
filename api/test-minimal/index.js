/**
 * MINIMAL TEST API - No AI processing, just basic response
 * This will help us isolate if the issue is with Vercel setup or the pipeline logic
 */

module.exports = async (req, res) => {
    console.log('🔍 MINIMAL TEST: Request received');
    console.log('🔍 Method:', req.method);
    console.log('🔍 Headers:', JSON.stringify(req.headers, null, 2));
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        console.log('🔍 MINIMAL TEST: Handling OPTIONS request');
        return res.status(200).end();
    }
    
    if (req.method === 'GET') {
        console.log('🔍 MINIMAL TEST: Handling GET request');
        return res.status(200).json({
            status: 'success',
            message: 'Minimal test API is working',
            timestamp: new Date().toISOString(),
            environment: {
                nodeVersion: process.version,
                platform: process.platform,
                memoryUsage: process.memoryUsage(),
                uptime: process.uptime()
            }
        });
    }
    
    if (req.method === 'POST') {
        console.log('🔍 MINIMAL TEST: Handling POST request');
        console.log('🔍 Body:', JSON.stringify(req.body, null, 2));
        
        try {
            const { companies } = req.body || {};
            
            if (!companies || !Array.isArray(companies)) {
                console.log('❌ MINIMAL TEST: Invalid request body');
                return res.status(400).json({
                    error: 'Invalid request. Expected { companies: [...] } in the request body.'
                });
            }
            
            console.log(`🔍 MINIMAL TEST: Processing ${companies.length} companies`);
            
            // Simulate minimal processing without any external API calls
            const results = companies.map((company, index) => {
                console.log(`🔍 MINIMAL TEST: Processing company ${index + 1}: ${company.companyName || company.domain}`);
                
                return {
                    website: company.domain || company.companyName,
                    companyName: company.companyName || 'Unknown',
                    accountOwner: company['Account Owner'] || 'Dan Mirolli',
                    isTop1000: company['Top 1000'] === '1',
                    
                    // Mock CFO data
                    cfoName: 'Test CFO',
                    cfoTitle: 'Chief Financial Officer',
                    cfoEmail: 'cfo@example.com',
                    cfoPhone: '+1-555-0123',
                    cfoLinkedIn: 'https://linkedin.com/in/test-cfo',
                    
                    // Mock CRO data
                    croName: 'Test CRO',
                    croTitle: 'Chief Revenue Officer',
                    croEmail: 'cro@example.com',
                    croPhone: '+1-555-0124',
                    croLinkedIn: 'https://linkedin.com/in/test-cro',
                    
                    // Metadata
                    processingTime: 50,
                    confidence: 95,
                    timestamp: new Date().toISOString(),
                    testMode: true
                };
            });
            
            console.log('✅ MINIMAL TEST: Successfully processed all companies');
            
            return res.status(200).json({
                pipeline: 'minimal-test',
                results,
                summary: {
                    totalCompanies: companies.length,
                    successfulProcessing: companies.length,
                    errors: 0,
                    testMode: true
                },
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('❌ MINIMAL TEST: Error:', error.message);
            console.error('❌ MINIMAL TEST: Stack:', error.stack);
            
            return res.status(500).json({
                error: 'Internal server error in minimal test',
                message: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }
    
    console.log('❌ MINIMAL TEST: Method not allowed');
    return res.status(405).json({
        error: 'Method not allowed',
        allowedMethods: ['GET', 'POST', 'OPTIONS']
    });
};
