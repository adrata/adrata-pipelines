#!/usr/bin/env node

/**
 * 🔍 DEBUG CRO CONTACT DATA FLOW
 * 
 * Investigate why CRO phone and LinkedIn data is missing
 * Trace through the entire pipeline execution for CRO data
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');

// Configuration
const VERCEL_URL = 'https://adrata-pipelines-92pp7p9gz-adrata.vercel.app/api/vercel-optimized';
const DESKTOP_PATH = path.join(os.homedir(), 'Desktop');

// Test company
const TEST_COMPANY = {
    companyName: "Salesforce Inc",
    domain: "salesforce.com",
    accountOwner: "Dan Mirolli"
};

async function debugCROContactData() {
    console.log('🔍 DEBUG CRO CONTACT DATA FLOW');
    console.log('================================');
    console.log(`🏢 Company: ${TEST_COMPANY.companyName} (${TEST_COMPANY.domain})`);
    console.log(`🎯 Objective: Find why CRO phone and LinkedIn data is missing`);
    
    try {
        // Step 1: Call the Vercel API
        console.log('\n🚀 STEP 1: Calling Vercel API...');
        
        const startTime = Date.now();
        const response = await fetch(VERCEL_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                pipeline: 'core',
                companies: [TEST_COMPANY]
            })
        });

        const endTime = Date.now();
        const duration = endTime - startTime;

        if (!response.ok) {
            throw new Error(`API call failed: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        console.log(`✅ API call completed in ${duration}ms`);

        // Step 2: Analyze raw pipeline data
        console.log('\n🔍 STEP 2: Analyzing raw pipeline data...');
        
        if (result.success && result.rawResults && result.rawResults.length > 0) {
            const rawResult = result.rawResults[0];
            
            console.log('\n📊 RAW PIPELINE DATA ANALYSIS:');
            console.log(`   Company: ${rawResult.companyName}`);
            console.log(`   Website: ${rawResult.website}`);
            
            // Analyze CFO data
            console.log('\n👔 CFO DATA:');
            if (rawResult.cfo) {
                console.log(`   Name: ${rawResult.cfo.name}`);
                console.log(`   Title: ${rawResult.cfo.title}`);
                console.log(`   Email: ${rawResult.cfo.email}`);
                console.log(`   Phone: ${rawResult.cfo.phone || 'MISSING'}`);
                console.log(`   LinkedIn: ${rawResult.cfo.linkedIn || rawResult.cfo.linkedin || 'MISSING'}`);
                console.log(`   Confidence: ${rawResult.cfo.confidence}%`);
                console.log(`   Source: ${rawResult.cfo.source}`);
                console.log(`   Validated: ${rawResult.cfo.validated}`);
            } else {
                console.log(`   ❌ NO CFO DATA FOUND`);
            }
            
            // Analyze CRO data
            console.log('\n💰 CRO DATA:');
            if (rawResult.cro) {
                console.log(`   Name: ${rawResult.cro.name}`);
                console.log(`   Title: ${rawResult.cro.title}`);
                console.log(`   Email: ${rawResult.cro.email}`);
                console.log(`   Phone: ${rawResult.cro.phone || 'MISSING'}`);
                console.log(`   LinkedIn: ${rawResult.cro.linkedIn || rawResult.cro.linkedin || 'MISSING'}`);
                console.log(`   Confidence: ${rawResult.cro.confidence}%`);
                console.log(`   Source: ${rawResult.cro.source}`);
                console.log(`   Validated: ${rawResult.cro.validated}`);
            } else {
                console.log(`   ❌ NO CRO DATA FOUND`);
            }
            
            // Step 3: Analyze CSV mapping
            console.log('\n🔍 STEP 3: Analyzing CSV mapping...');
            
            const csvResult = result.results[0];
            console.log('\n📄 CSV MAPPED DATA:');
            console.log(`   CFO Phone: ${csvResult['CFO Phone']}`);
            console.log(`   CFO LinkedIn: ${csvResult['CFO LinkedIn']}`);
            console.log(`   CRO Phone: ${csvResult['CRO Phone']}`);
            console.log(`   CRO LinkedIn: ${csvResult['CRO LinkedIn']}`);
            
            // Step 4: Identify the problem
            console.log('\n🔍 STEP 4: Problem identification...');
            
            const problems = [];
            
            if (rawResult.cfo && !rawResult.cfo.phone) {
                problems.push('CFO phone missing from pipeline data');
            }
            if (rawResult.cfo && !rawResult.cfo.linkedIn && !rawResult.cfo.linkedin) {
                problems.push('CFO LinkedIn missing from pipeline data');
            }
            if (rawResult.cro && !rawResult.cro.phone) {
                problems.push('CRO phone missing from pipeline data');
            }
            if (rawResult.cro && !rawResult.cro.linkedIn && !rawResult.cro.linkedin) {
                problems.push('CRO LinkedIn missing from pipeline data');
            }
            
            if (problems.length === 0) {
                console.log('✅ No problems identified - all data present');
            } else {
                console.log('❌ PROBLEMS IDENTIFIED:');
                problems.forEach((problem, index) => {
                    console.log(`   ${index + 1}. ${problem}`);
                });
            }
            
            // Step 5: Root cause analysis
            console.log('\n🔍 STEP 5: Root cause analysis...');
            
            if (rawResult.cro && !rawResult.cro.phone) {
                console.log('\n🔍 CRO PHONE MISSING - POSSIBLE CAUSES:');
                console.log('   1. ExecutiveContactIntelligence module not called for CRO');
                console.log('   2. Lusha API not finding CRO contact data');
                console.log('   3. CoreSignal API not returning phone data');
                console.log('   4. Contact validation failing for CRO');
                console.log('   5. Pipeline module execution order issue');
            }
            
            if (rawResult.cro && !rawResult.cro.linkedIn && !rawResult.cro.linkedin) {
                console.log('\n🔍 CRO LINKEDIN MISSING - POSSIBLE CAUSES:');
                console.log('   1. ExecutiveContactIntelligence module not called for CRO');
                console.log('   2. Lusha API not finding CRO LinkedIn profile');
                console.log('   3. CoreSignal API not returning LinkedIn data');
                console.log('   4. LinkedIn URL generation failing');
                console.log('   5. Pipeline module execution order issue');
            }
            
            // Step 6: Recommendations
            console.log('\n💡 STEP 6: Recommendations...');
            
            console.log('\n🔧 IMMEDIATE FIXES:');
            console.log('   1. Check if ExecutiveContactIntelligence.enhanceExecutiveIntelligence() is called for CRO');
            console.log('   2. Verify Lusha API calls for CRO executive search');
            console.log('   3. Check CoreSignal API calls for CRO contact data');
            console.log('   4. Ensure mergeContactData() processes CRO data correctly');
            console.log('   5. Add fallback LinkedIn URL generation for CRO');
            
            console.log('\n🔧 LONG-TERM FIXES:');
            console.log('   1. Enhance ExecutiveContactIntelligence module to prioritize CRO data');
            console.log('   2. Add multiple API fallbacks for CRO contact discovery');
            console.log('   3. Implement CRO-specific contact validation');
            console.log('   4. Add debugging logs to trace CRO data flow');
            
            // Save debug data
            const debugData = {
                timestamp: new Date().toISOString(),
                company: TEST_COMPANY,
                rawResult: rawResult,
                csvResult: csvResult,
                problems: problems,
                analysis: {
                    cfoComplete: !!(rawResult.cfo?.name && rawResult.cfo?.email && rawResult.cfo?.phone && rawResult.cfo?.linkedIn),
                    croComplete: !!(rawResult.cro?.name && rawResult.cro?.email && rawResult.cro?.phone && rawResult.cro?.linkedIn),
                    cfoPhoneMissing: !rawResult.cfo?.phone,
                    cfoLinkedInMissing: !(rawResult.cfo?.linkedIn || rawResult.cfo?.linkedin),
                    croPhoneMissing: !rawResult.cro?.phone,
                    croLinkedInMissing: !(rawResult.cro?.linkedIn || rawResult.cro?.linkedin)
                }
            };
            
            const timestamp = new Date().toISOString().split('T')[0];
            const debugPath = path.join(DESKTOP_PATH, `cro-contact-debug-${timestamp}.json`);
            await fs.writeFile(debugPath, JSON.stringify(debugData, null, 2), 'utf8');
            
            console.log(`\n📄 DEBUG DATA SAVED: ${debugPath}`);
            
            return debugData;
            
        } else {
            console.log('❌ No raw results found');
            return null;
        }

    } catch (error) {
        console.error('❌ DEBUG ERROR:', error);
        throw error;
    }
}

// Run the debug
debugCROContactData().catch(console.error);
