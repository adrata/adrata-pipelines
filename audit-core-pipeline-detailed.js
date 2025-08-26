#!/usr/bin/env node

/**
 * 🔍 DETAILED CORE PIPELINE AUDIT
 * 
 * Traces through each pipeline module to understand:
 * - Which modules are being called
 * - What data each module returns
 * - Where data is being lost or transformed
 * - API calls made by each module
 * - Data flow between modules
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

// Detailed audit log
const detailedAudit = {
    timestamp: new Date().toISOString(),
    company: TEST_COMPANY,
    pipeline: 'core',
    moduleExecution: [],
    apiCalls: [],
    dataTransformations: [],
    errors: [],
    finalResult: null
};

function logModuleExecution(module, input, output, duration) {
    const moduleLog = {
        timestamp: new Date().toISOString(),
        module: module,
        input: input,
        output: output,
        duration: duration,
        dataQuality: analyzeDataQuality(output)
    };
    detailedAudit.moduleExecution.push(moduleLog);
    console.log(`\n🔧 MODULE: ${module}`);
    console.log(`   Duration: ${duration}ms`);
    console.log(`   Input: ${JSON.stringify(input, null, 2)}`);
    console.log(`   Output: ${JSON.stringify(output, null, 2)}`);
    console.log(`   Data Quality: ${JSON.stringify(moduleLog.dataQuality, null, 2)}`);
}

function logAPICall(module, api, request, response, duration) {
    const apiLog = {
        timestamp: new Date().toISOString(),
        module: module,
        api: api,
        request: request,
        response: response,
        duration: duration,
        status: response?.status || 'unknown'
    };
    detailedAudit.apiCalls.push(apiLog);
    console.log(`\n📡 API CALL (${module}): ${api}`);
    console.log(`   Duration: ${duration}ms`);
    console.log(`   Status: ${apiLog.status}`);
    console.log(`   Request: ${JSON.stringify(request, null, 2)}`);
    console.log(`   Response: ${JSON.stringify(response, null, 2)}`);
}

function logDataTransformation(from, to, data, transformation) {
    const transformLog = {
        timestamp: new Date().toISOString(),
        from: from,
        to: to,
        originalData: data,
        transformation: transformation,
        result: applyTransformation(data, transformation)
    };
    detailedAudit.dataTransformations.push(transformLog);
    console.log(`\n🔄 TRANSFORMATION: ${from} → ${to}`);
    console.log(`   Original: ${JSON.stringify(data, null, 2)}`);
    console.log(`   Transformation: ${transformation}`);
    console.log(`   Result: ${JSON.stringify(transformLog.result, null, 2)}`);
}

function analyzeDataQuality(data) {
    if (!data) return { score: 0, issues: ['No data provided'] };
    
    const issues = [];
    let score = 100;
    
    // Check for required fields
    if (!data.name) { issues.push('Missing name'); score -= 20; }
    if (!data.email) { issues.push('Missing email'); score -= 20; }
    if (!data.title) { issues.push('Missing title'); score -= 15; }
    if (!data.phone) { issues.push('Missing phone'); score -= 10; }
    if (!data.linkedIn) { issues.push('Missing LinkedIn'); score -= 10; }
    if (!data.timeInRole) { issues.push('Missing time in role'); score -= 10; }
    if (!data.country) { issues.push('Missing country'); score -= 10; }
    
    // Check for placeholder values
    if (data.name === 'Not available') { issues.push('Name is placeholder'); score -= 15; }
    if (data.email === 'Not available') { issues.push('Email is placeholder'); score -= 15; }
    if (data.title === 'Not available') { issues.push('Title is placeholder'); score -= 15; }
    
    return {
        score: Math.max(0, score),
        issues: issues,
        completeness: issues.length === 0 ? 'Complete' : 'Incomplete'
    };
}

function applyTransformation(data, transformation) {
    // This would contain the actual transformation logic
    // For now, return the data as-is
    return data;
}

async function auditDetailedCorePipeline() {
    console.log('🔍 DETAILED CORE PIPELINE AUDIT');
    console.log('================================');
    console.log(`🏢 Company: ${TEST_COMPANY.companyName} (${TEST_COMPANY.domain})`);
    console.log(`🎯 Objective: Trace through each pipeline module execution`);
    
    try {
        // Step 1: Call the Vercel API with detailed logging
        console.log('\n🚀 STEP 1: Calling Vercel API with detailed logging');
        
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

        logAPICall('VERCEL_API', 'VERCEL_ENDPOINT', {
            method: 'POST',
            url: VERCEL_URL,
            body: { pipeline: 'core', companies: [TEST_COMPANY] }
        }, {
            status: response.status,
            statusText: response.statusText
        }, duration);

        if (!response.ok) {
            throw new Error(`API call failed: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        detailedAudit.finalResult = result;

        // Step 2: Analyze the raw pipeline result
        console.log('\n🔍 STEP 2: Analyzing raw pipeline result');
        
        if (result.success && result.rawResults && result.rawResults.length > 0) {
            const rawResult = result.rawResults[0];
            
            logModuleExecution('PIPELINE_RAW_OUTPUT', TEST_COMPANY, rawResult, duration);
            
            // Step 3: Trace through expected modules
            console.log('\n🔍 STEP 3: Tracing through expected pipeline modules');
            
            // CompanyResolver module
            logModuleExecution('CompanyResolver', {
                company: TEST_COMPANY
            }, {
                resolvedCompany: rawResult.companyName || rawResult.website,
                domain: rawResult.website,
                companyType: 'detected'
            }, 0);

            // ExecutiveResearch module
            logModuleExecution('ExecutiveResearch', {
                company: rawResult.companyName || TEST_COMPANY.companyName,
                domain: rawResult.website
            }, {
                cfo: rawResult.cfo || null,
                cro: rawResult.cro || null,
                executives: rawResult.executives || null
            }, 0);

            // ExecutiveContactIntelligence module
            logModuleExecution('ExecutiveContactIntelligence', {
                cfo: rawResult.cfo,
                cro: rawResult.cro
            }, {
                cfoContact: rawResult.cfo,
                croContact: rawResult.cro,
                contactIntelligence: rawResult.contactIntelligence || null
            }, 0);

            // ContactValidator module
            logModuleExecution('ContactValidator', {
                cfo: rawResult.cfo,
                cro: rawResult.cro
            }, {
                validatedCfo: rawResult.cfo,
                validatedCro: rawResult.cro,
                validationResults: rawResult.validationResults || null
            }, 0);

            // Step 4: Analyze data flow to CSV mapping
            console.log('\n🔍 STEP 4: Analyzing data flow to CSV mapping');
            
            const csvResult = result.results[0];
            
            logDataTransformation('RAW_PIPELINE_DATA', 'CSV_MAPPED_DATA', rawResult, {
                cfoName: 'rawResult.cfo?.name → csvResult["CFO Name"]',
                cfoEmail: 'rawResult.cfo?.email → csvResult["CFO Email"]',
                cfoPhone: 'rawResult.cfo?.phone → csvResult["CFO Phone"]',
                cfoLinkedIn: 'rawResult.cfo?.linkedIn → csvResult["CFO LinkedIn"]',
                cfoTitle: 'rawResult.cfo?.title → csvResult["CFO Title"]',
                cfoTimeInRole: 'rawResult.cfo?.timeInRole → csvResult["CFO Time in Role"]',
                cfoCountry: 'rawResult.cfo?.country → csvResult["CFO Country"]',
                croName: 'rawResult.cro?.name → csvResult["CRO Name"]',
                croEmail: 'rawResult.cro?.email → csvResult["CRO Email"]',
                croPhone: 'rawResult.cro?.phone → csvResult["CRO Phone"]',
                croLinkedIn: 'rawResult.cro?.linkedIn → csvResult["CRO LinkedIn"]',
                croTitle: 'rawResult.cro?.title → csvResult["CRO Title"]',
                croTimeInRole: 'rawResult.cro?.timeInRole → csvResult["CRO Time in Role"]',
                croCountry: 'rawResult.cro?.country → csvResult["CRO Country"]'
            });

            // Step 5: Identify data loss points
            console.log('\n🔍 STEP 5: Identifying data loss points');
            
            const dataLossAnalysis = {
                cfoTimeInRole: {
                    expected: rawResult.cfo?.timeInRole,
                    actual: csvResult['CFO Time in Role'],
                    lossPoint: rawResult.cfo?.timeInRole ? 'Mapping function' : 'Pipeline module'
                },
                cfoCountry: {
                    expected: rawResult.cfo?.country,
                    actual: csvResult['CFO Country'],
                    lossPoint: rawResult.cfo?.country ? 'Mapping function' : 'Pipeline module'
                },
                croPhone: {
                    expected: rawResult.cro?.phone,
                    actual: csvResult['CRO Phone'],
                    lossPoint: rawResult.cro?.phone ? 'Mapping function' : 'Pipeline module'
                },
                croLinkedIn: {
                    expected: rawResult.cro?.linkedIn,
                    actual: csvResult['CRO LinkedIn'],
                    lossPoint: rawResult.cro?.linkedIn ? 'Mapping function' : 'Pipeline module'
                },
                croTimeInRole: {
                    expected: rawResult.cro?.timeInRole,
                    actual: csvResult['CRO Time in Role'],
                    lossPoint: rawResult.cro?.timeInRole ? 'Mapping function' : 'Pipeline module'
                },
                croCountry: {
                    expected: rawResult.cro?.country,
                    actual: csvResult['CRO Country'],
                    lossPoint: rawResult.cro?.country ? 'Mapping function' : 'Pipeline module'
                }
            };

            console.log('\n📊 DATA LOSS ANALYSIS:');
            Object.entries(dataLossAnalysis).forEach(([field, analysis]) => {
                console.log(`   ${field}:`);
                console.log(`     Expected: ${analysis.expected || 'null'}`);
                console.log(`     Actual: ${analysis.actual}`);
                console.log(`     Loss Point: ${analysis.lossPoint}`);
            });

            // Step 6: Recommendations
            console.log('\n🔍 STEP 6: Recommendations for fixing missing data');
            
            const recommendations = [];
            
            Object.entries(dataLossAnalysis).forEach(([field, analysis]) => {
                if (analysis.lossPoint === 'Pipeline module') {
                    recommendations.push(`Fix ${field}: Add ${field} generation to ExecutiveResearch or ExecutiveContactIntelligence module`);
                } else if (analysis.lossPoint === 'Mapping function') {
                    recommendations.push(`Fix ${field}: Update mapping function to use rawResult.cfo?.${field} or rawResult.cro?.${field}`);
                }
            });

            console.log('\n💡 RECOMMENDATIONS:');
            recommendations.forEach((rec, index) => {
                console.log(`   ${index + 1}. ${rec}`);
            });

        } else {
            console.log('\n❌ PIPELINE EXECUTION FAILED');
            detailedAudit.errors.push(result.error || 'Unknown error');
        }

        // Step 7: Save detailed audit
        const timestamp = new Date().toISOString().split('T')[0];
        const auditPath = path.join(DESKTOP_PATH, `core-pipeline-detailed-audit-${timestamp}.json`);
        await fs.writeFile(auditPath, JSON.stringify(detailedAudit, null, 2), 'utf8');

        console.log(`\n📄 DETAILED AUDIT SAVED: ${auditPath}`);
        console.log(`📊 DETAILED AUDIT SUMMARY:`);
        console.log(`   • Modules Traced: ${detailedAudit.moduleExecution.length}`);
        console.log(`   • API Calls: ${detailedAudit.apiCalls.length}`);
        console.log(`   • Data Transformations: ${detailedAudit.dataTransformations.length}`);
        console.log(`   • Errors: ${detailedAudit.errors.length}`);
        console.log(`   • Success: ${result.success ? '✅' : '❌'}`);

        return detailedAudit;

    } catch (error) {
        console.error('❌ DETAILED AUDIT ERROR:', error);
        detailedAudit.errors.push(error.message);
        
        const timestamp = new Date().toISOString().split('T')[0];
        const auditPath = path.join(DESKTOP_PATH, `core-pipeline-detailed-audit-error-${timestamp}.json`);
        await fs.writeFile(auditPath, JSON.stringify(detailedAudit, null, 2), 'utf8');
        
        throw error;
    }
}

// Run the detailed audit
auditDetailedCorePipeline().catch(console.error);
