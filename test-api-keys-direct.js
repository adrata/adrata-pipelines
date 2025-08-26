#!/usr/bin/env node

/**
 * 🔍 DIRECT API KEY TEST
 * Test CoreSignal and Prospeo API keys directly
 */

require('dotenv').config();

async function testCoreSignal() {
    console.log('🔍 Testing CoreSignal API...');
    
    // Use the provided API key
    const API_KEY = 'hzwQmb13cF21if4arzLpx0SRWyoOUyzP';
    console.log(`   Using API Key: ${API_KEY.substring(0, 8)}...`);
    
    try {
        const response = await fetch('https://api.coresignal.com/cdapi/v2/employee_multi_source/search/es_dsl', {
            method: 'POST',
            headers: {
                'apikey': API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: {
                    bool: {
                        must: [
                            {
                                bool: {
                                    should: [
                                        { match: { "company_name": "Microsoft" } }
                                    ]
                                }
                            },
                            {
                                bool: {
                                    should: [
                                        { match: { "title": "CEO" } }
                                    ]
                                }
                            }
                        ]
                    }
                }
            })
        });
        
        console.log(`   Status: ${response.status}`);
        if (response.ok) {
            const data = await response.json();
            console.log(`   ✅ CoreSignal API Working - Found ${data.hits?.hits?.length || 0} results`);
            if (data.hits?.hits?.length > 0) {
                console.log(`   📊 Sample result: ${data.hits.hits[0]._source.name} - ${data.hits.hits[0]._source.title}`);
            }
        } else {
            const errorText = await response.text();
            console.log(`   ❌ CoreSignal API Error: ${errorText}`);
        }
    } catch (error) {
        console.log(`   ❌ CoreSignal Connection Error: ${error.message}`);
    }
}

async function testProspeo() {
    console.log('\n🔍 Testing Prospeo API...');
    
    // Use the provided API key
    const API_KEY = '6a1b513fda9e48728fcc134e4365e8eb';
    console.log(`   Using API Key: ${API_KEY.substring(0, 8)}...`);
    
    try {
        const response = await fetch('https://api.prospeo.io/email-finder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-KEY': API_KEY
            },
            body: JSON.stringify({
                first_name: 'Test',
                last_name: 'User',
                company: 'example.com'
            })
        });
        
        console.log(`   Status: ${response.status}`);
        if (response.ok || response.status === 400) {
            console.log(`   ✅ Prospeo API Working (${response.status} is expected for test data)`);
            if (response.ok) {
                const data = await response.json();
                console.log(`   📊 Response: ${JSON.stringify(data)}`);
            }
        } else {
            const errorText = await response.text();
            console.log(`   ❌ Prospeo API Error: ${errorText}`);
        }
    } catch (error) {
        console.log(`   ❌ Prospeo Connection Error: ${error.message}`);
    }
}

async function main() {
    console.log('🧪 DIRECT API KEY TESTING\n');
    
    await testCoreSignal();
    await testProspeo();
    
    console.log('\n✅ API testing completed!');
}

main().catch(console.error);
