#!/usr/bin/env node

/**
 * 🔍 TEST MODULE LOAD
 * 
 * Check if the ExecutiveContactIntelligence module can be loaded properly
 */

console.log('🔍 TESTING MODULE LOAD');
console.log('======================');

try {
    console.log('📦 Loading ExecutiveContactIntelligence module...');
    const { ExecutiveContactIntelligence } = require("./modules/ExecutiveContactIntelligence");
    console.log('✅ Module loaded successfully');
    
    console.log('🔧 Creating instance...');
    const config = {
        CORESIGNAL_API_KEY: process.env.CORESIGNAL_API_KEY,
        LUSHA_API_KEY: process.env.LUSHA_API_KEY,
        PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY
    };
    
    const instance = new ExecutiveContactIntelligence(config);
    console.log('✅ Instance created successfully');
    
    console.log('🔍 Checking methods...');
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(instance));
    console.log(`   Available methods: ${methods.join(', ')}`);
    
    console.log('🔍 Checking if enhanceExecutiveIntelligence exists...');
    if (typeof instance.enhanceExecutiveIntelligence === 'function') {
        console.log('✅ enhanceExecutiveIntelligence method exists');
    } else {
        console.log('❌ enhanceExecutiveIntelligence method not found');
    }
    
    console.log('🔍 Testing with sample data...');
    const sampleData = {
        companyName: "Test Company",
        website: "test.com",
        cfo: { name: "John Doe", confidence: 95 },
        cro: { name: "Jane Smith", confidence: 90 }
    };
    
    console.log('   Sample data prepared');
    console.log('   This test will not actually call APIs, just verify the module works');
    
} catch (error) {
    console.error('❌ MODULE LOAD ERROR:', error.message);
    console.error('Stack trace:', error.stack);
}
