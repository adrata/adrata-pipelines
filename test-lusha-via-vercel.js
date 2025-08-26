#!/usr/bin/env node

/**
 * 🔍 TEST LUSHA API VIA VERCEL
 * 
 * Test Lusha API functionality through the Vercel deployment
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');

// Configuration
const VERCEL_URL = 'https://adrata-pipelines-92pp7p9gz-adrata.vercel.app/api/vercel-optimized';
const DESKTOP_PATH = path.join(os.homedir(), 'Desktop');

async function testLushaViaVercel() {
    console.log('🔍 TESTING LUSHA API VIA VERCEL');
    console.log('=================================');
    
    // Test companies with different executives
    const testCases = [
        {
            companyName: "Salesforce Inc",
            domain: "salesforce.com",
            accountOwner: "Dan Mirolli",
            description: "Salesforce - CFO working, CRO missing"
        },
        {
            companyName: "Microsoft Corp",
            domain: "microsoft.com", 
            accountOwner: "Dan Mirolli",
            description: "Microsoft - Test different company"
        }
    ];
    
    for (const testCase of testCases) {
        console.log(`\n🧪 TESTING: ${testCase.description}`);
        console.log(`   Company: ${testCase.companyName}`);
        console.log(`   Domain: ${testCase.domain}`);
        
        try {
            // Call Vercel API
            console.log(`   🚀 Calling Vercel API...`);
            
            const response = await fetch(VERCEL_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    pipeline: 'core',
                    companies: [testCase]
                })
            });

            if (!response.ok) {
                throw new Error(`API call failed: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            
            if (result.success && result.rawResults && result.rawResults.length > 0) {
                const rawResult = result.rawResults[0];
                
                console.log(`   ✅ API call successful`);
                console.log(`   📊 Results for ${rawResult.companyName}:`);
                
                // Check CFO data
                if (rawResult.cfo) {
                    console.log(`   💰 CFO: ${rawResult.cfo.name}`);
                    console.log(`      Email: ${rawResult.cfo.email || 'MISSING'}`);
                    console.log(`      Phone: ${rawResult.cfo.phone || 'MISSING'}`);
                    console.log(`      LinkedIn: ${rawResult.cfo.linkedIn || 'MISSING'}`);
                    console.log(`      Confidence: ${rawResult.cfo.confidence || 'N/A'}%`);
                } else {
                    console.log(`   💰 CFO: NOT FOUND`);
                }
                
                // Check CRO data
                if (rawResult.cro) {
                    console.log(`   📈 CRO: ${rawResult.cro.name}`);
                    console.log(`      Email: ${rawResult.cro.email || 'MISSING'}`);
                    console.log(`      Phone: ${rawResult.cro.phone || 'MISSING'}`);
                    console.log(`      LinkedIn: ${rawResult.cro.linkedIn || 'MISSING'}`);
                    console.log(`      Confidence: ${rawResult.cro.confidence || 'N/A'}%`);
                } else {
                    console.log(`   📈 CRO: NOT FOUND`);
                }
                
                // Check if contact intelligence was called
                if (rawResult.contactIntelligence) {
                    console.log(`   🔍 Contact Intelligence: CALLED`);
                    console.log(`      Keys: ${Object.keys(rawResult.contactIntelligence).join(', ')}`);
                } else {
                    console.log(`   🔍 Contact Intelligence: NOT CALLED`);
                }
                
                // Save detailed results
                const timestamp = new Date().toISOString().split('T')[0];
                const testPath = path.join(DESKTOP_PATH, `lusha-test-${testCase.companyName.replace(/\s+/g, '-')}-${timestamp}.json`);
                await fs.writeFile(testPath, JSON.stringify({
                    timestamp: new Date().toISOString(),
                    testCase: testCase,
                    result: rawResult,
                    analysis: {
                        cfoHasPhone: !!rawResult.cfo?.phone,
                        cfoHasLinkedIn: !!rawResult.cfo?.linkedIn,
                        croHasPhone: !!rawResult.cro?.phone,
                        croHasLinkedIn: !!rawResult.cro?.linkedIn,
                        contactIntelligenceCalled: !!rawResult.contactIntelligence
                    }
                }, null, 2), 'utf8');
                
                console.log(`   📄 Detailed results saved: ${testPath}`);
                
            } else {
                console.log(`   ❌ No results returned`);
            }
            
        } catch (error) {
            console.log(`   ❌ TEST ERROR: ${error.message}`);
        }
        
        // Add delay between tests
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('\n📊 SUMMARY:');
    console.log('===========');
    console.log('This test will show us:');
    console.log('1. If Lusha API is working in Vercel environment');
    console.log('2. If CFO data includes phone and LinkedIn');
    console.log('3. If CRO data includes phone and LinkedIn');
    console.log('4. If Contact Intelligence module is being called');
    console.log('5. Compare results between different companies');
}

// Run the test
testLushaViaVercel().catch(console.error);
