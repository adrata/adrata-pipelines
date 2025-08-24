#!/usr/bin/env node

/**
 * Debug script to test the exact result structure returned by processSingleCompany
 */

require('dotenv').config();

async function testResultStructure() {
    try {
        console.log('🔍 Testing processSingleCompany result structure...');
        
        const { CorePipeline } = require("./pipelines/core-pipeline");
        const pipeline = new CorePipeline();
        
        const testCompany = {
            website: 'microsoft.com',
            companyName: 'Microsoft',
            accountOwner: 'Dan Mirolli',
            isTop1000: false
        };

        console.log('🔄 Calling processSingleCompany...');
        const result = await pipeline.processSingleCompany(testCompany);
        
        console.log('\n🎯 RESULT STRUCTURE ANALYSIS:');
        console.log('================================');
        console.log('Result exists:', !!result);
        console.log('Result type:', typeof result);
        console.log('Result keys:', Object.keys(result || {}));
        
        console.log('\n📊 CFO DATA:');
        console.log('CFO exists:', !!result?.cfo);
        console.log('CFO keys:', Object.keys(result?.cfo || {}));
        console.log('CFO name:', result?.cfo?.name);
        console.log('CFO email:', result?.cfo?.email);
        console.log('CFO phone:', result?.cfo?.phone);
        console.log('CFO LinkedIn:', result?.cfo?.linkedIn);
        
        console.log('\n📈 CRO DATA:');
        console.log('CRO exists:', !!result?.cro);
        console.log('CRO keys:', Object.keys(result?.cro || {}));
        console.log('CRO name:', result?.cro?.name);
        console.log('CRO email:', result?.cro?.email);
        console.log('CRO phone:', result?.cro?.phone);
        console.log('CRO LinkedIn:', result?.cro?.linkedIn);
        
        console.log('\n🏢 COMPANY DATA:');
        console.log('Company name:', result?.companyName);
        console.log('Processing time:', result?.processingTime);
        console.log('Overall confidence:', result?.overallConfidence);
        
        // Test the exact same extraction logic as the API
        console.log('\n🔧 API EXTRACTION TEST:');
        const apiResult = {
            cfoName: result?.cfo?.name || null,
            cfoTitle: result?.cfo?.title || null,
            cfoEmail: result?.cfo?.email || null,
            cfoPhone: result?.cfo?.phone || null,
            cfoLinkedIn: result?.cfo?.linkedIn || null,
            
            croName: result?.cro?.name || null,
            croTitle: result?.cro?.title || null,
            croEmail: result?.cro?.email || null,
            croPhone: result?.cro?.phone || null,
            croLinkedIn: result?.cro?.linkedIn || null
        };
        
        console.log('API extraction result:', JSON.stringify(apiResult, null, 2));
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Stack:', error.stack);
    }
}

testResultStructure();
