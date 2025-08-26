#!/usr/bin/env node

/**
 * 🔍 TEST ENHANCE EXECUTIVE INTELLIGENCE
 * 
 * Test the enhanceExecutiveIntelligence method directly
 */

console.log('🔍 TESTING ENHANCE EXECUTIVE INTELLIGENCE');
console.log('==========================================');

(async () => {
try {
    console.log('📦 Loading ExecutiveContactIntelligence module...');
    const { ExecutiveContactIntelligence } = require("./modules/ExecutiveContactIntelligence");
    
    console.log('🔧 Creating instance...');
    const config = {
        CORESIGNAL_API_KEY: process.env.CORESIGNAL_API_KEY,
        LUSHA_API_KEY: process.env.LUSHA_API_KEY,
        PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY
    };
    
    console.log('🔑 API Keys Status:');
    console.log(`   CoreSignal: ${config.CORESIGNAL_API_KEY ? 'SET' : 'MISSING'}`);
    console.log(`   Lusha: ${config.LUSHA_API_KEY ? 'SET' : 'MISSING'}`);
    console.log(`   Perplexity: ${config.PERPLEXITY_API_KEY ? 'SET' : 'MISSING'}`);
    
    const instance = new ExecutiveContactIntelligence(config);
    
    console.log('\n🧪 Testing with sample data...');
    const sampleData = {
        companyName: "Salesforce Inc",
        website: "salesforce.com",
        cfo: { 
            name: "Robin Washington", 
            confidence: 95,
            email: "robin.washington@salesforce.com"
        },
        cro: { 
            name: "Miguel Milano", 
            confidence: 90,
            email: "mmilano@salesforce.com"
        }
    };
    
    console.log('📊 Sample data:');
    console.log(`   Company: ${sampleData.companyName}`);
    console.log(`   CFO: ${sampleData.cfo.name} (${sampleData.cfo.confidence}%)`);
    console.log(`   CRO: ${sampleData.cro.name} (${sampleData.cro.confidence}%)`);
    
    console.log('\n🚀 Calling enhanceExecutiveIntelligence...');
    
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Method timed out after 30 seconds')), 30000);
    });
    
    const resultPromise = instance.enhanceExecutiveIntelligence(sampleData);
    
    const result = await Promise.race([resultPromise, timeoutPromise]);
    
    console.log('\n✅ Method completed successfully!');
    console.log('📊 Result structure:');
    console.log(`   Type: ${typeof result}`);
    console.log(`   Keys: ${Object.keys(result || {}).join(', ')}`);
    
    if (result) {
        console.log('\n📋 Detailed result:');
        console.log(JSON.stringify(result, null, 2));
    }
    
} catch (error) {
    console.error('❌ TEST ERROR:', error.message);
    console.error('Stack trace:', error.stack);
}
})();
