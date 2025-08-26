#!/usr/bin/env node

/**
 * 🐛 DEBUG SINGLE COMPANY TEST
 * Test one company to see what's happening with the pipeline
 */

const fetch = require('node-fetch');

async function debugSingleCompany() {
    console.log('🐛 DEBUGGING SINGLE COMPANY TEST');
    console.log('================================');
    
    const testCompany = {
        companyName: "Salesforce Inc",
        domain: "salesforce.com",
        accountOwner: "Dan Mirolli"
    };
    
    console.log(`🏢 Testing: ${testCompany.companyName} (${testCompany.domain})`);
    
    try {
        console.log('\n🚀 Making API call to Vercel...');
        const response = await fetch('https://adrata-pipelines-92pp7p9gz-adrata.vercel.app/api/vercel-optimized', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                pipeline: 'core',
                companies: [testCompany]
            })
        });
        
        console.log(`📡 Response status: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.log(`❌ Error response: ${errorText}`);
            return;
        }
        
        const result = await response.json();
        console.log('\n📊 API Response:');
        console.log(`   Success: ${result.success}`);
        console.log(`   Companies processed: ${result.results?.length || 0}`);
        console.log(`   Duration: ${result.stats?.total_duration_seconds || 'N/A'}s`);
        console.log(`   Success rate: ${result.stats?.success_rate || 'N/A'}%`);
        
        if (result.results && result.results.length > 0) {
            console.log('\n🔍 First Company Result:');
            const company = result.results[0];
            console.log(`   Company Name: ${company['Company Name'] || 'N/A'}`);
            console.log(`   Website: ${company['Website'] || 'N/A'}`);
            console.log(`   CFO Name: ${company['CFO Name'] || 'NOT FOUND'}`);
            console.log(`   CFO Email: ${company['CFO Email'] || 'NOT FOUND'}`);
            console.log(`   CRO Name: ${company['CRO Name'] || 'NOT FOUND'}`);
            console.log(`   CRO Email: ${company['CRO Email'] || 'NOT FOUND'}`);
        }
        
        if (result.errors && result.errors.length > 0) {
            console.log('\n❌ Errors:');
            result.errors.forEach((error, index) => {
                console.log(`   ${index + 1}. ${error}`);
            });
        }
        
    } catch (error) {
        console.error(`❌ Exception: ${error.message}`);
    }
}

debugSingleCompany().catch(console.error);
