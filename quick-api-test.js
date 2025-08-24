#!/usr/bin/env node

/**
 * Quick test to simulate the exact API flow
 */

require('dotenv').config();

async function testApiFlow() {
    try {
        console.log('🔍 Testing API flow simulation...');
        
        // Simulate the exact API call
        const { CorePipeline } = require("./pipelines/core-pipeline");
        const pipeline = new CorePipeline();
        
        // Exact same data structure as API receives
        const company = {
            companyName: "Microsoft", 
            domain: "microsoft.com", 
            industry: "Technology"
        };
        
        console.log('📥 Input company:', company);
        
        // Exact same processing as API
        const website = company.Website || company.domain || company.companyName;
        console.log('🌐 Extracted website:', website);
        
        const result = await pipeline.processSingleCompany({
            website: website,
            companyName: company.companyName,
            accountOwner: company['Account Owner'] || 'Dan Mirolli',
            isTop1000: company['Top 1000'] === '1'
        });
        
        console.log('\n🎯 PIPELINE RESULT:');
        console.log('Result exists:', !!result);
        if (result) {
            console.log('CFO name:', result.cfo?.name);
            console.log('CFO email:', result.cfo?.email);
            console.log('CRO name:', result.cro?.name);
            console.log('CRO email:', result.cro?.email);
        }
        
        // Exact same API response generation
        const apiResponse = {
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
            timestamp: new Date().toISOString()
        };
        
        console.log('\n📤 API RESPONSE:');
        console.log(JSON.stringify(apiResponse, null, 2));
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Run with timeout
const timeout = setTimeout(() => {
    console.log('⏰ Test timed out after 30 seconds');
    process.exit(1);
}, 30000);

testApiFlow().then(() => {
    clearTimeout(timeout);
    process.exit(0);
}).catch(error => {
    clearTimeout(timeout);
    console.error('❌ Test failed:', error.message);
    process.exit(1);
});
