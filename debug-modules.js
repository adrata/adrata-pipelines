#!/usr/bin/env node

/**
 * Debug script to test module initialization
 */

require('dotenv').config();

console.log('🔍 Testing module imports...');

try {
    console.log('1. Testing CompanyResolver...');
    const { CompanyResolver } = require("./modules/CompanyResolver");
    const companyResolver = new CompanyResolver();
    console.log('✅ CompanyResolver initialized');

    console.log('2. Testing ExecutiveResearch...');
    const { ExecutiveResearch } = require("./modules/ExecutiveResearch");
    const executiveResearch = new ExecutiveResearch();
    console.log('✅ ExecutiveResearch initialized');

    console.log('3. Testing CorePipeline...');
    const { CorePipeline } = require("./pipelines/core-pipeline");
    const pipeline = new CorePipeline();
    console.log('✅ CorePipeline initialized');

    console.log('4. Testing processSingleCompany method...');
    const testCompany = {
        website: 'microsoft.com',
        companyName: 'Microsoft',
        accountOwner: 'Dan Mirolli',
        isTop1000: false
    };

    console.log('🔄 Running processSingleCompany...');
    pipeline.processSingleCompany(testCompany)
        .then(result => {
            console.log('✅ Success! Result:', JSON.stringify(result, null, 2));
        })
        .catch(error => {
            console.log('❌ Error:', error.message);
            console.log('Stack:', error.stack);
        });

} catch (error) {
    console.log('❌ Module import error:', error.message);
    console.log('Stack:', error.stack);
}
