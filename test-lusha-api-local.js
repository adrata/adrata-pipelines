#!/usr/bin/env node

/**
 * 🔍 TEST LUSHA API LOCALLY
 * 
 * Test Lusha API to see if it can find Miguel Milano's data
 */

require('dotenv').config();

async function testLushaAPILocal() {
    console.log('🔍 TESTING LUSHA API LOCALLY');
    console.log('=============================');
    
    // Check if Lusha API key is available
    const LUSHA_API_KEY = process.env.LUSHA_API_KEY;
    console.log(`🔑 Lusha API Key: ${LUSHA_API_KEY ? 'SET' : 'MISSING'}`);
    
    if (!LUSHA_API_KEY) {
        console.log('❌ Lusha API key not found in environment variables');
        return;
    }
    
    // Test data
    const testCases = [
        {
            name: 'Robin Washington',
            company: 'Salesforce Inc',
            role: 'CFO',
            description: 'CFO (working example)'
        },
        {
            name: 'Miguel Milano',
            company: 'Salesforce Inc',
            role: 'CRO',
            description: 'CRO (missing data example)'
        }
    ];
    
    for (const testCase of testCases) {
        console.log(`\n🧪 TESTING: ${testCase.description}`);
        console.log(`   Name: ${testCase.name}`);
        console.log(`   Company: ${testCase.company}`);
        console.log(`   Role: ${testCase.role}`);
        
        try {
            // Split name into first and last
            const nameParts = testCase.name.split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts[nameParts.length - 1];
            
            console.log(`   First Name: ${firstName}`);
            console.log(`   Last Name: ${lastName}`);
            
            // Test Lusha v2 Person API
            const url = 'https://api.lusha.com/v2/person';
            const params = new URLSearchParams({
                firstName: firstName,
                lastName: lastName,
                companyName: testCase.company,
                companyDomain: 'salesforce.com',
                refreshJobInfo: 'true',
                revealEmails: 'true',
                revealPhones: 'true'
            });
            
            console.log(`   🔍 API URL: ${url}?${params}`);
            
            const response = await fetch(`${url}?${params}`, {
                method: 'GET',
                headers: {
                    'api_key': LUSHA_API_KEY,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log(`   📊 Response Status: ${response.status}`);
            
            if (response.ok) {
                const data = await response.json();
                console.log(`   ✅ SUCCESS: Found data for ${testCase.name}`);
                console.log(`   📧 Email: ${data.emailAddresses?.[0]?.email || 'Not found'}`);
                console.log(`   📱 Phone: ${data.phoneNumbers?.[0]?.number || 'Not found'}`);
                console.log(`   🔗 LinkedIn: ${data.linkedinUrl || 'Not found'}`);
                console.log(`   💼 Title: ${data.jobTitle || 'Not found'}`);
                console.log(`   🏢 Company: ${data.company?.name || 'Not found'}`);
                
                // Check if we have any contact data
                const hasEmail = data.emailAddresses && data.emailAddresses.length > 0;
                const hasPhone = data.phoneNumbers && data.phoneNumbers.length > 0;
                const hasLinkedIn = !!data.linkedinUrl;
                
                console.log(`   📊 Contact Summary:`);
                console.log(`      Email: ${hasEmail ? '✅' : '❌'}`);
                console.log(`      Phone: ${hasPhone ? '✅' : '❌'}`);
                console.log(`      LinkedIn: ${hasLinkedIn ? '✅' : '❌'}`);
                
            } else if (response.status === 404) {
                console.log(`   ⚠️ NOT FOUND: ${testCase.name} not found in Lusha database`);
            } else {
                const errorText = await response.text();
                console.log(`   ❌ ERROR: ${response.status} - ${errorText}`);
            }
            
        } catch (error) {
            console.log(`   ❌ EXCEPTION: ${error.message}`);
        }
        
        // Add delay between requests to be respectful
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n📊 SUMMARY:');
    console.log('===========');
    console.log('This test will show us:');
    console.log('1. If Lusha API is working correctly');
    console.log('2. If Robin Washington (CFO) data is available');
    console.log('3. If Miguel Milano (CRO) data is available');
    console.log('4. What specific data is missing for the CRO');
}

// Run the test
testLushaAPILocal().catch(console.error);
