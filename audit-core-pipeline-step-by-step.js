#!/usr/bin/env node

/**
 * 🔍 CORE PIPELINE STEP-BY-STEP AUDIT
 * 
 * Comprehensive audit system that traces:
 * - Every API call made
 * - Data returned from each API
 * - Module execution flow
 * - Data transformation steps
 * - Final output generation
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

// Audit log storage
const auditLog = {
    timestamp: new Date().toISOString(),
    company: TEST_COMPANY,
    pipeline: 'core',
    steps: [],
    apiCalls: [],
    dataFlow: [],
    errors: [],
    finalResult: null
};

function logStep(step, details) {
    const stepLog = {
        timestamp: new Date().toISOString(),
        step: step,
        details: details
    };
    auditLog.steps.push(stepLog);
    console.log(`\n🔍 STEP ${auditLog.steps.length}: ${step}`);
    console.log(`   ${JSON.stringify(details, null, 2)}`);
}

function logAPICall(api, request, response, duration) {
    const apiLog = {
        timestamp: new Date().toISOString(),
        api: api,
        request: request,
        response: response,
        duration: duration,
        status: response?.status || 'unknown'
    };
    auditLog.apiCalls.push(apiLog);
    console.log(`\n📡 API CALL: ${api}`);
    console.log(`   Duration: ${duration}ms`);
    console.log(`   Status: ${apiLog.status}`);
    console.log(`   Request: ${JSON.stringify(request, null, 2)}`);
    console.log(`   Response: ${JSON.stringify(response, null, 2)}`);
}

function logDataFlow(from, to, data) {
    const flowLog = {
        timestamp: new Date().toISOString(),
        from: from,
        to: to,
        data: data
    };
    auditLog.dataFlow.push(flowLog);
    console.log(`\n🔄 DATA FLOW: ${from} → ${to}`);
    console.log(`   Data: ${JSON.stringify(data, null, 2)}`);
}

async function auditCorePipeline() {
    console.log('🔍 CORE PIPELINE STEP-BY-STEP AUDIT');
    console.log('====================================');
    console.log(`🏢 Company: ${TEST_COMPANY.companyName} (${TEST_COMPANY.domain})`);
    console.log(`🎯 Objective: Trace every step of the Core pipeline execution`);
    
    try {
        // Step 1: Initialize API call
        logStep('INITIALIZE', {
            action: 'Preparing API request to Vercel',
            url: VERCEL_URL,
            method: 'POST',
            company: TEST_COMPANY
        });

        const startTime = Date.now();
        
        // Step 2: Make API call
        logStep('API_REQUEST', {
            action: 'Sending request to Vercel API',
            pipeline: 'core',
            companies: [TEST_COMPANY]
        });

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

        // Step 3: Log API response
        logAPICall('VERCEL_API', {
            method: 'POST',
            url: VERCEL_URL,
            body: { pipeline: 'core', companies: [TEST_COMPANY] }
        }, {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries())
        }, duration);

        if (!response.ok) {
            throw new Error(`API call failed: ${response.status} ${response.statusText}`);
        }

        // Step 4: Parse response
        logStep('PARSE_RESPONSE', {
            action: 'Parsing JSON response from Vercel API'
        });

        const result = await response.json();
        
        // Step 5: Log final result
        logStep('FINAL_RESULT', {
            action: 'Received final pipeline result',
            success: result.success,
            companiesProcessed: result.results?.length || 0,
            duration: result.stats?.total_duration_seconds || 0,
            successRate: result.stats?.success_rate || 0
        });

        auditLog.finalResult = result;

        // Step 6: Analyze data flow
        if (result.success && result.results && result.results.length > 0) {
            const companyResult = result.results[0];
            
            logDataFlow('PIPELINE_OUTPUT', 'CSV_MAPPING', {
                rawData: companyResult,
                mappedData: {
                    website: companyResult.Website,
                    companyName: companyResult['Company Name'],
                    cfoName: companyResult['CFO Name'],
                    cfoEmail: companyResult['CFO Email'],
                    cfoPhone: companyResult['CFO Phone'],
                    cfoLinkedIn: companyResult['CFO LinkedIn'],
                    cfoTitle: companyResult['CFO Title'],
                    cfoTimeInRole: companyResult['CFO Time in Role'],
                    cfoCountry: companyResult['CFO Country'],
                    croName: companyResult['CRO Name'],
                    croEmail: companyResult['CRO Email'],
                    croPhone: companyResult['CRO Phone'],
                    croLinkedIn: companyResult['CRO LinkedIn'],
                    croTitle: companyResult['CRO Title'],
                    croTimeInRole: companyResult['CRO Time in Role'],
                    croCountry: companyResult['CRO Country']
                }
            });

            // Step 7: Data quality analysis
            logStep('DATA_QUALITY_ANALYSIS', {
                action: 'Analyzing data quality and completeness',
                cfoData: {
                    name: companyResult['CFO Name'],
                    email: companyResult['CFO Email'],
                    phone: companyResult['CFO Phone'],
                    linkedIn: companyResult['CFO LinkedIn'],
                    title: companyResult['CFO Title'],
                    timeInRole: companyResult['CFO Time in Role'],
                    country: companyResult['CFO Country']
                },
                croData: {
                    name: companyResult['CRO Name'],
                    email: companyResult['CRO Email'],
                    phone: companyResult['CRO Phone'],
                    linkedIn: companyResult['CRO LinkedIn'],
                    title: companyResult['CRO Title'],
                    timeInRole: companyResult['CRO Time in Role'],
                    country: companyResult['CRO Country']
                },
                dataQuality: {
                    cfoComplete: !!(companyResult['CFO Name'] && companyResult['CFO Email']),
                    croComplete: !!(companyResult['CRO Name'] && companyResult['CRO Email']),
                    phoneFound: !!(companyResult['CFO Phone'] || companyResult['CRO Phone']),
                    linkedInFound: !!(companyResult['CFO LinkedIn'] || companyResult['CRO LinkedIn']),
                    timeInRoleFound: !!(companyResult['CFO Time in Role'] && companyResult['CFO Time in Role'] !== 'Not available'),
                    countryFound: !!(companyResult['CFO Country'] && companyResult['CFO Country'] !== 'Not available')
                }
            });

            // Step 8: Identify missing data sources
            logStep('MISSING_DATA_ANALYSIS', {
                action: 'Identifying why certain fields show "Not available"',
                missingFields: {
                    cfoTimeInRole: companyResult['CFO Time in Role'] === 'Not available' ? 'Missing from pipeline modules' : 'Found',
                    cfoCountry: companyResult['CFO Country'] === 'Not available' ? 'Missing from pipeline modules' : 'Found',
                    croPhone: companyResult['CRO Phone'] === 'Not available' ? 'Missing from pipeline modules' : 'Found',
                    croLinkedIn: companyResult['CRO LinkedIn'] === 'Not available' ? 'Missing from pipeline modules' : 'Found',
                    croTimeInRole: companyResult['CRO Time in Role'] === 'Not available' ? 'Missing from pipeline modules' : 'Found',
                    croCountry: companyResult['CRO Country'] === 'Not available' ? 'Missing from pipeline modules' : 'Found'
                },
                recommendations: [
                    'Check ExecutiveResearch module for timeInRole data',
                    'Check ContactIntelligence module for country data',
                    'Check ContactValidator module for phone/LinkedIn data',
                    'Verify API responses from CoreSignal, Lusha, Prospeo'
                ]
            });

        } else {
            logStep('ERROR_ANALYSIS', {
                action: 'Pipeline execution failed',
                error: result.error || 'Unknown error',
                details: result
            });
            auditLog.errors.push(result.error || 'Unknown error');
        }

        // Step 9: Save audit log
        const timestamp = new Date().toISOString().split('T')[0];
        const auditPath = path.join(DESKTOP_PATH, `core-pipeline-audit-${timestamp}.json`);
        await fs.writeFile(auditPath, JSON.stringify(auditLog, null, 2), 'utf8');

        console.log(`\n📄 AUDIT LOG SAVED: ${auditPath}`);
        console.log(`📊 AUDIT SUMMARY:`);
        console.log(`   • Total Steps: ${auditLog.steps.length}`);
        console.log(`   • API Calls: ${auditLog.apiCalls.length}`);
        console.log(`   • Data Flows: ${auditLog.dataFlow.length}`);
        console.log(`   • Errors: ${auditLog.errors.length}`);
        console.log(`   • Success: ${result.success ? '✅' : '❌'}`);

        return auditLog;

    } catch (error) {
        console.error('❌ AUDIT ERROR:', error);
        auditLog.errors.push(error.message);
        
        const timestamp = new Date().toISOString().split('T')[0];
        const auditPath = path.join(DESKTOP_PATH, `core-pipeline-audit-error-${timestamp}.json`);
        await fs.writeFile(auditPath, JSON.stringify(auditLog, null, 2), 'utf8');
        
        throw error;
    }
}

// Run the audit
auditCorePipeline().catch(console.error);
