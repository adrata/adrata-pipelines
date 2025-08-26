#!/usr/bin/env node

/**
 * 🔍 TEST CONTACT INTELLIGENCE STRUCTURE
 * 
 * Check what structure is actually returned by the contact intelligence module
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

async function testContactIntelligenceStructure() {
    console.log('🔍 TESTING CONTACT INTELLIGENCE STRUCTURE');
    console.log('==========================================');
    console.log(`🏢 Company: ${TEST_COMPANY.companyName} (${TEST_COMPANY.domain})`);
    
    try {
        // Step 1: Call the API
        console.log('\n🚀 STEP 1: Calling Vercel API...');
        
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

        if (!response.ok) {
            throw new Error(`API call failed: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        
        if (result.success && result.rawResults && result.rawResults.length > 0) {
            const rawResult = result.rawResults[0];
            
            console.log('\n📊 CONTACT INTELLIGENCE STRUCTURE ANALYSIS:');
            console.log('============================================');
            
            // Check if contactIntelligence exists
            if (rawResult.contactIntelligence) {
                console.log('✅ Contact Intelligence object found');
                console.log(`   Keys: ${Object.keys(rawResult.contactIntelligence).join(', ')}`);
                
                // Check executiveContacts structure
                if (rawResult.contactIntelligence.executiveContacts) {
                    console.log('\n📋 Executive Contacts Structure:');
                    console.log(`   Type: ${typeof rawResult.contactIntelligence.executiveContacts}`);
                    console.log(`   Keys: ${Object.keys(rawResult.contactIntelligence.executiveContacts).join(', ')}`);
                    
                    // Check if it's an array
                    if (Array.isArray(rawResult.contactIntelligence.executiveContacts.executives)) {
                        console.log(`   ✅ Executives array found with ${rawResult.contactIntelligence.executiveContacts.executives.length} items`);
                        
                        rawResult.contactIntelligence.executiveContacts.executives.forEach((exec, index) => {
                            console.log(`\n   👤 Executive ${index + 1}:`);
                            console.log(`      Name: ${exec.name}`);
                            console.log(`      Role: ${exec.role}`);
                            console.log(`      Email: ${exec.email || 'Not found'}`);
                            console.log(`      Phone: ${exec.phone || 'Not found'}`);
                            console.log(`      LinkedIn: ${exec.linkedinUrl || 'Not found'}`);
                            console.log(`      Confidence: ${exec.confidence || 'Not found'}`);
                        });
                    } else {
                        console.log('   ❌ Executives is not an array');
                    }
                    
                    // Check for direct CFO/CRO properties
                    if (rawResult.contactIntelligence.executiveContacts.cfo) {
                        console.log('\n💰 CFO Contact Data:');
                        console.log(`   Name: ${rawResult.contactIntelligence.executiveContacts.cfo.name}`);
                        console.log(`   Email: ${rawResult.contactIntelligence.executiveContacts.cfo.email || 'Not found'}`);
                        console.log(`   Phone: ${rawResult.contactIntelligence.executiveContacts.cfo.phone || 'Not found'}`);
                        console.log(`   LinkedIn: ${rawResult.contactIntelligence.executiveContacts.cfo.linkedinUrl || 'Not found'}`);
                    } else {
                        console.log('\n💰 CFO Contact Data: Not found in direct property');
                    }
                    
                    if (rawResult.contactIntelligence.executiveContacts.cro) {
                        console.log('\n💼 CRO Contact Data:');
                        console.log(`   Name: ${rawResult.contactIntelligence.executiveContacts.cro.name}`);
                        console.log(`   Email: ${rawResult.contactIntelligence.executiveContacts.cro.email || 'Not found'}`);
                        console.log(`   Phone: ${rawResult.contactIntelligence.executiveContacts.cro.phone || 'Not found'}`);
                        console.log(`   LinkedIn: ${rawResult.contactIntelligence.executiveContacts.cro.linkedinUrl || 'Not found'}`);
                    } else {
                        console.log('\n💼 CRO Contact Data: Not found in direct property');
                    }
                } else {
                    console.log('❌ Executive Contacts not found');
                }
            } else {
                console.log('❌ Contact Intelligence object not found');
            }
            
            // Check final result structure
            console.log('\n📊 FINAL RESULT STRUCTURE:');
            console.log('==========================');
            console.log(`   CFO Name: ${rawResult.cfo?.name}`);
            console.log(`   CFO Email: ${rawResult.cfo?.email}`);
            console.log(`   CFO Phone: ${rawResult.cfo?.phone || 'MISSING'}`);
            console.log(`   CFO LinkedIn: ${rawResult.cfo?.linkedIn || 'MISSING'}`);
            console.log(`   CRO Name: ${rawResult.cro?.name}`);
            console.log(`   CRO Email: ${rawResult.cro?.email}`);
            console.log(`   CRO Phone: ${rawResult.cro?.phone || 'MISSING'}`);
            console.log(`   CRO LinkedIn: ${rawResult.cro?.linkedIn || 'MISSING'}`);
            
            // Save detailed structure for analysis
            const analysisData = {
                timestamp: new Date().toISOString(),
                company: TEST_COMPANY,
                contactIntelligenceStructure: rawResult.contactIntelligence,
                finalResult: {
                    cfo: rawResult.cfo,
                    cro: rawResult.cro
                },
                analysis: {
                    hasContactIntelligence: !!rawResult.contactIntelligence,
                    hasExecutiveContacts: !!(rawResult.contactIntelligence?.executiveContacts),
                    executivesArrayLength: rawResult.contactIntelligence?.executiveContacts?.executives?.length || 0,
                    hasDirectCFO: !!rawResult.contactIntelligence?.executiveContacts?.cfo,
                    hasDirectCRO: !!rawResult.contactIntelligence?.executiveContacts?.cro
                }
            };
            
            const timestamp = new Date().toISOString().split('T')[0];
            const analysisPath = path.join(DESKTOP_PATH, `contact-intelligence-structure-${timestamp}.json`);
            await fs.writeFile(analysisPath, JSON.stringify(analysisData, null, 2), 'utf8');
            
            console.log(`\n📄 ANALYSIS DATA SAVED: ${analysisPath}`);
            
            return analysisData;
            
        } else {
            console.log('❌ No results found');
            return null;
        }

    } catch (error) {
        console.error('❌ TEST ERROR:', error);
        throw error;
    }
}

// Run the test
testContactIntelligenceStructure().catch(console.error);
