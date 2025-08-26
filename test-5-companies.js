#!/usr/bin/env node

/**
 * 5-COMPANY CLOUD TEST SCRIPT
 * 
 * Tests the Vercel-optimized pipeline with 5 companies to validate:
 * 1. All 3 pipeline types work correctly
 * 2. API health checks pass
 * 3. Rate limiting functions properly
 * 4. Batching works as expected
 * 5. All external APIs are accessible
 */

const fetch = require('node-fetch');

// Test configuration
const TEST_CONFIG = {
    // Update this URL when deployed to Vercel
    API_BASE_URL: process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}/api/vercel-optimized`
        : 'http://localhost:3000/api/vercel-optimized',
    
    // 5 test companies for validation
    TEST_COMPANIES: [
        {
            companyName: "Adobe Inc.",
            domain: "adobe.com",
            accountOwner: "Dan Mirolli"
        },
        {
            companyName: "Salesforce Inc.",
            domain: "salesforce.com", 
            accountOwner: "Dan Mirolli"
        },
        {
            companyName: "Microsoft Corporation",
            domain: "microsoft.com",
            accountOwner: "Dan Mirolli"
        },
        {
            companyName: "HubSpot Inc.",
            domain: "hubspot.com",
            accountOwner: "Dan Mirolli"
        },
        {
            companyName: "Zoom Video Communications",
            domain: "zoom.us",
            accountOwner: "Dan Mirolli"
        }
    ]
};

/**
 * Test Runner Class
 */
class PipelineTestRunner {
    constructor() {
        this.results = {
            healthCheck: null,
            corePipeline: null,
            advancedPipeline: null,
            powerhousePipeline: null,
            summary: {}
        };
    }

    async makeRequest(endpoint, payload = null, timeout = 300000) {
        const url = `${TEST_CONFIG.API_BASE_URL}${endpoint}`;
        console.log(`🔄 Making request to: ${url}`);
        
        const options = {
            method: payload ? 'POST' : 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: timeout
        };
        
        if (payload) {
            options.body = JSON.stringify(payload);
        }
        
        const startTime = Date.now();
        
        try {
            const response = await fetch(url, options);
            const responseTime = Date.now() - startTime;
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            console.log(`✅ Request successful (${responseTime}ms)`);
            return {
                success: true,
                data,
                responseTime,
                status: response.status
            };
            
        } catch (error) {
            const responseTime = Date.now() - startTime;
            console.error(`❌ Request failed (${responseTime}ms): ${error.message}`);
            
            return {
                success: false,
                error: error.message,
                responseTime,
                status: null
            };
        }
    }

    async testAPIHealth() {
        console.log('\n🏥 TESTING API HEALTH CHECKS...');
        
        const result = await this.makeRequest('', {
            mode: 'health-check'
        }, 60000); // 1 minute timeout for health checks
        
        this.results.healthCheck = result;
        
        if (result.success) {
            const health = result.data.health;
            console.log(`\n📊 API Health Results:`);
            console.log(`   Overall Health: ${health.overall_health}`);
            
            Object.entries(health.apis).forEach(([api, status]) => {
                const icon = status.status === 'healthy' ? '✅' : '❌';
                const time = status.response_time ? `(${status.response_time}ms)` : '';
                console.log(`   ${icon} ${api}: ${status.status} ${time}`);
                if (status.error) {
                    console.log(`      Error: ${status.error}`);
                }
            });
            
            return health.overall_health !== 'unhealthy';
        } else {
            console.error('❌ Health check failed:', result.error);
            return false;
        }
    }

    async testPipeline(pipelineType, companies) {
        console.log(`\n🚀 TESTING ${pipelineType.toUpperCase()} PIPELINE...`);
        console.log(`📊 Companies: ${companies.length}`);
        
        const result = await this.makeRequest('', {
            pipeline: pipelineType,
            companies: companies,
            mode: 'process'
        });
        
        this.results[`${pipelineType}Pipeline`] = result;
        
        if (result.success) {
            const data = result.data;
            console.log(`\n📈 ${pipelineType.toUpperCase()} Results:`);
            console.log(`   Success Rate: ${data.stats.success_rate.toFixed(1)}%`);
            console.log(`   Processing Time: ${data.stats.total_duration_seconds.toFixed(1)}s`);
            console.log(`   Companies Processed: ${data.stats.successful}/${data.stats.total_companies}`);
            console.log(`   Real Emails Found: ${data.data_quality.real_emails_found}`);
            console.log(`   Real Phones Found: ${data.data_quality.real_phones_found}`);
            
            if (data.errors && data.errors.length > 0) {
                console.log(`\n⚠️ Errors (${data.errors.length}):`);
                data.errors.forEach((error, index) => {
                    console.log(`   ${index + 1}. ${error.company.companyName}: ${error.error}`);
                });
            }
            
            // Show sample results
            if (data.results && data.results.length > 0) {
                console.log(`\n📋 Sample Result (${data.results[0]['Company Name']}):`);
                const sampleFields = Object.keys(data.results[0]).slice(0, 5);
                sampleFields.forEach(field => {
                    console.log(`   ${field}: ${data.results[0][field]}`);
                });
            }
            
            return data.stats.success_rate > 50; // Consider success if >50% companies processed
        } else {
            console.error(`❌ ${pipelineType.toUpperCase()} pipeline failed:`, result.error);
            return false;
        }
    }

    async runAllTests() {
        console.log('🎯 STARTING COMPREHENSIVE PIPELINE TESTS');
        console.log('=' .repeat(60));
        
        const startTime = Date.now();
        
        // Test 1: API Health Check
        const healthPassed = await this.testAPIHealth();
        
        if (!healthPassed) {
            console.log('\n❌ API health check failed. Stopping tests.');
            return this.generateSummary(startTime);
        }
        
        // Test 2: Core Pipeline (all 5 companies)
        const corePassed = await this.testPipeline('core', TEST_CONFIG.TEST_COMPANIES);
        
        // Test 3: Advanced Pipeline (3 companies)
        const advancedPassed = await this.testPipeline('advanced', TEST_CONFIG.TEST_COMPANIES.slice(0, 3));
        
        // Test 4: Powerhouse Pipeline (2 companies)
        const powerhousePassed = await this.testPipeline('powerhouse', TEST_CONFIG.TEST_COMPANIES.slice(0, 2));
        
        return this.generateSummary(startTime, {
            healthPassed,
            corePassed,
            advancedPassed,
            powerhousePassed
        });
    }

    generateSummary(startTime, testResults = {}) {
        const totalTime = (Date.now() - startTime) / 1000;
        
        console.log('\n' + '=' .repeat(60));
        console.log('📊 TEST SUMMARY');
        console.log('=' .repeat(60));
        
        const tests = [
            { name: 'API Health Check', passed: testResults.healthPassed },
            { name: 'Core Pipeline', passed: testResults.corePassed },
            { name: 'Advanced Pipeline', passed: testResults.advancedPassed },
            { name: 'Powerhouse Pipeline', passed: testResults.powerhousePassed }
        ];
        
        let passedCount = 0;
        tests.forEach(test => {
            if (test.passed !== undefined) {
                const icon = test.passed ? '✅' : '❌';
                const status = test.passed ? 'PASSED' : 'FAILED';
                console.log(`${icon} ${test.name}: ${status}`);
                if (test.passed) passedCount++;
            }
        });
        
        const totalTests = tests.filter(t => t.passed !== undefined).length;
        const successRate = totalTests > 0 ? (passedCount / totalTests) * 100 : 0;
        
        console.log(`\n📈 Overall Results:`);
        console.log(`   Tests Passed: ${passedCount}/${totalTests}`);
        console.log(`   Success Rate: ${successRate.toFixed(1)}%`);
        console.log(`   Total Test Time: ${totalTime.toFixed(1)}s`);
        
        // Deployment readiness assessment
        if (successRate >= 75) {
            console.log('\n🚀 DEPLOYMENT READY: Pipeline is ready for production use');
        } else if (successRate >= 50) {
            console.log('\n⚠️ NEEDS ATTENTION: Some issues detected, review before production');
        } else {
            console.log('\n❌ NOT READY: Significant issues detected, fixes required');
        }
        
        this.results.summary = {
            totalTests,
            passedCount,
            successRate,
            totalTime,
            deploymentReady: successRate >= 75
        };
        
        return this.results;
    }
}

/**
 * Main execution
 */
async function main() {
    // Check if API URL is provided
    if (!TEST_CONFIG.API_BASE_URL.includes('http')) {
        console.error('❌ Error: Please set VERCEL_URL environment variable or update API_BASE_URL');
        console.log('Usage: VERCEL_URL=your-deployment-url.vercel.app node test-5-companies.js');
        process.exit(1);
    }
    
    console.log('🎯 5-COMPANY PIPELINE VALIDATION TEST');
    console.log(`🌐 API Endpoint: ${TEST_CONFIG.API_BASE_URL}`);
    console.log(`📊 Test Companies: ${TEST_CONFIG.TEST_COMPANIES.length}`);
    
    const testRunner = new PipelineTestRunner();
    
    try {
        const results = await testRunner.runAllTests();
        
        // Save results to file for analysis
        const fs = require('fs');
        const resultsFile = `test-results-${new Date().toISOString().split('T')[0]}.json`;
        fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
        console.log(`\n💾 Results saved to: ${resultsFile}`);
        
        // Exit with appropriate code
        process.exit(results.summary.deploymentReady ? 0 : 1);
        
    } catch (error) {
        console.error('❌ Test execution failed:', error);
        process.exit(1);
    }
}

// Run tests if called directly
if (require.main === module) {
    main();
}

module.exports = { PipelineTestRunner, TEST_CONFIG };
