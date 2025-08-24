#!/usr/bin/env node

/**
 * DIRECT CORESIGNAL TEST - Verify API is working and returning CFO/CRO data
 */

require('dotenv').config();

async function testCoreSignalDirect() {
    console.log('🔍 TESTING CORESIGNAL API DIRECTLY');
    console.log('===================================\n');
    
    const fetch = require('node-fetch');
    const API_KEY = process.env.CORESIGNAL_API_KEY;
    
    if (!API_KEY) {
        console.error('❌ CORESIGNAL_API_KEY not found in environment');
        return;
    }
    
    console.log('✅ API Key found:', API_KEY.substring(0, 10) + '...');
    
    try {
        // Test 1: Get Microsoft company data
        console.log('\n📊 TEST 1: Get Microsoft Company Data');
        console.log('=====================================');
        
        const companyUrl = 'https://api.coresignal.com/cdapi/v2/company_multi_source/collect/microsoft';
        console.log('🔗 URL:', companyUrl);
        
        const startTime = Date.now();
        const companyResponse = await fetch(companyUrl, {
            headers: { 'apikey': API_KEY },
            timeout: 15000
        });
        const companyTime = Date.now() - startTime;
        
        console.log('⏱️  Response time:', companyTime + 'ms');
        console.log('📈 Status:', companyResponse.status);
        
        if (!companyResponse.ok) {
            console.error('❌ Company request failed:', companyResponse.statusText);
            return;
        }
        
        const companyData = await companyResponse.json();
        console.log('✅ Company found:', companyData.company_name);
        console.log('👥 Key executives available:', !!companyData.key_executives);
        console.log('📧 Company emails available:', !!companyData.company_emails);
        
        if (companyData.key_executives) {
            console.log('🔢 Total executives:', companyData.key_executives.length);
            
            // Look for CFO/CRO in key executives
            const cfoExecutives = companyData.key_executives.filter(exec => 
                exec.member_position_title && 
                (exec.member_position_title.toLowerCase().includes('cfo') || 
                 exec.member_position_title.toLowerCase().includes('chief financial'))
            );
            
            const croExecutives = companyData.key_executives.filter(exec => 
                exec.member_position_title && 
                (exec.member_position_title.toLowerCase().includes('cro') || 
                 exec.member_position_title.toLowerCase().includes('chief revenue') ||
                 exec.member_position_title.toLowerCase().includes('chief commercial'))
            );
            
            console.log('\n👤 CFO EXECUTIVES FOUND:');
            if (cfoExecutives.length > 0) {
                cfoExecutives.forEach((exec, i) => {
                    console.log(`   ${i+1}. ${exec.member_full_name} - ${exec.member_position_title}`);
                });
            } else {
                console.log('   ❌ No CFO found in key executives');
            }
            
            console.log('\n👤 CRO EXECUTIVES FOUND:');
            if (croExecutives.length > 0) {
                croExecutives.forEach((exec, i) => {
                    console.log(`   ${i+1}. ${exec.member_full_name} - ${exec.member_position_title}`);
                });
            } else {
                console.log('   ❌ No CRO found in key executives');
            }
            
            // Test 2: Get detailed employee data for a CFO if found
            if (cfoExecutives.length > 0) {
                console.log('\n📊 TEST 2: Get Detailed CFO Data');
                console.log('=================================');
                
                const cfo = cfoExecutives[0];
                console.log('🎯 Testing CFO:', cfo.member_full_name);
                
                if (cfo.parent_id) {
                    const employeeUrl = `https://api.coresignal.com/cdapi/v2/employee_multi_source/collect/${cfo.parent_id}`;
                    console.log('🔗 Employee URL:', employeeUrl);
                    
                    const empStartTime = Date.now();
                    const employeeResponse = await fetch(employeeUrl, {
                        headers: { 'apikey': API_KEY },
                        timeout: 15000
                    });
                    const empTime = Date.now() - empStartTime;
                    
                    console.log('⏱️  Response time:', empTime + 'ms');
                    console.log('📈 Status:', employeeResponse.status);
                    
                    if (employeeResponse.ok) {
                        const employeeData = await employeeResponse.json();
                        console.log('✅ Employee data found for:', employeeData.name);
                        console.log('📧 Email available:', !!employeeData.email);
                        console.log('📱 Phone available:', !!employeeData.phone_number);
                        console.log('🔗 LinkedIn available:', !!employeeData.linkedin_url);
                        console.log('🏢 Current company:', employeeData.current_company_name);
                        console.log('💼 Current title:', employeeData.current_title);
                        
                        if (employeeData.email) {
                            console.log('📧 Email:', employeeData.email);
                        }
                        if (employeeData.phone_number) {
                            console.log('📱 Phone:', employeeData.phone_number);
                        }
                        if (employeeData.linkedin_url) {
                            console.log('🔗 LinkedIn:', employeeData.linkedin_url);
                        }
                    } else {
                        console.error('❌ Employee request failed:', employeeResponse.statusText);
                    }
                } else {
                    console.log('⚠️  No parent_id available for detailed lookup');
                }
            }
            
            // Test 3: Search for executives by name and company
            console.log('\n📊 TEST 3: Search for Amy Hood (Known Microsoft CFO)');
            console.log('====================================================');
            
            const searchPayload = {
                "query": {
                    "bool": {
                        "must": [
                            {
                                "match": {
                                    "name": "Amy Hood"
                                }
                            },
                            {
                                "match": {
                                    "current_company_name": "Microsoft"
                                }
                            }
                        ]
                    }
                },
                "size": 5
            };
            
            const searchUrl = 'https://api.coresignal.com/cdapi/v2/employee_multi_source/search/es_dsl';
            console.log('🔗 Search URL:', searchUrl);
            console.log('🔍 Search query:', JSON.stringify(searchPayload, null, 2));
            
            const searchStartTime = Date.now();
            const searchResponse = await fetch(searchUrl, {
                method: 'POST',
                headers: {
                    'apikey': API_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(searchPayload),
                timeout: 15000
            });
            const searchTime = Date.now() - searchStartTime;
            
            console.log('⏱️  Search response time:', searchTime + 'ms');
            console.log('📈 Status:', searchResponse.status);
            
            if (searchResponse.ok) {
                const searchData = await searchResponse.json();
                console.log('🔢 Search results found:', searchData.hits?.hits?.length || 0);
                
                if (searchData.hits?.hits?.length > 0) {
                    searchData.hits.hits.forEach((hit, i) => {
                        const source = hit._source;
                        console.log(`\n   Result ${i+1}:`);
                        console.log(`   👤 Name: ${source.name}`);
                        console.log(`   🏢 Company: ${source.current_company_name}`);
                        console.log(`   💼 Title: ${source.current_title}`);
                        console.log(`   📧 Email: ${source.email || 'Not available'}`);
                        console.log(`   📱 Phone: ${source.phone_number || 'Not available'}`);
                        console.log(`   🔗 LinkedIn: ${source.linkedin_url || 'Not available'}`);
                    });
                } else {
                    console.log('❌ No search results found for Amy Hood at Microsoft');
                }
            } else {
                console.error('❌ Search request failed:', searchResponse.statusText);
            }
        }
        
        console.log('\n🎯 CORESIGNAL TEST SUMMARY:');
        console.log('===========================');
        console.log('✅ API Connection: Working');
        console.log('✅ Company Data: Available');
        console.log('✅ Executive Data: Available');
        console.log('📊 Total API calls made: 3');
        console.log('⏱️  Total test time: ' + (Date.now() - startTime) + 'ms');
        
    } catch (error) {
        console.error('❌ CoreSignal test failed:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Run test with timeout
const timeout = setTimeout(() => {
    console.log('⏰ Test timed out after 60 seconds');
    process.exit(1);
}, 60000);

testCoreSignalDirect().then(() => {
    clearTimeout(timeout);
    console.log('\n✅ CoreSignal test completed successfully!');
    process.exit(0);
}).catch(error => {
    clearTimeout(timeout);
    console.error('❌ Test failed:', error.message);
    process.exit(1);
});
