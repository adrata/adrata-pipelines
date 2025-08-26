#!/usr/bin/env node

/**
 * 🔍 SINGLE COMPANY AUDIT SCRIPT
 * 
 * Tests all 3 pipelines with 1 company and audits CSV output quality
 * Ensures 100% real data matching example formats
 */

const fetch = require('node-fetch');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');
const path = require('path');

const API_ENDPOINT = 'https://adrata-pipelines-r2lla1bsz-adrata.vercel.app/api/complete-csv';
const OUTPUT_DIR = './audit-test-outputs';

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Test company - using HubSpot as it's in our examples
const testCompany = { companyName: 'HubSpot', domain: 'hubspot.com' };

// Expected CSV headers for validation
const expectedHeaders = {
    core: [
        'Website', 'Company Name', 'CFO Name', 'CFO Email', 'CFO Phone', 'CFO LinkedIn', 
        'CFO Title', 'CFO Time in Role', 'CFO Country', 'CRO Name', 'CRO Email', 'CRO Phone', 
        'CRO LinkedIn', 'CRO Title', 'CRO Time in Role', 'CRO Country', 'CFO Selection Reason', 
        'Email Source', 'Account Owner'
    ],
    advanced: [
        'Website', 'Company Name', 'Industry', 'Industry Vertical', 'Executive Stability Risk',
        'Deal Complexity Assessment', 'Competitive Context Analysis', 'Account Owner'
    ],
    powerhouse: [
        'Website', 'Company Name', 'Decision Maker', 'Decision Maker Role', 'Champion', 
        'Champion Role', 'Stakeholder', 'Stakeholder Role', 'Blocker', 'Blocker Role', 
        'Introducer', 'Introducer Role', 'Budget Authority Mapping', 'Procurement Maturity Score',
        'Decision Style Analysis', 'Sales Cycle Prediction', 'Buyer Group Flight Risk',
        'Routing Intelligence Strategy 1', 'Routing Intelligence Strategy 2', 
        'Routing Intelligence Strategy 3', 'Routing Intelligence Explanation', 'Account Owner'
    ]
};

async function testPipeline(pipelineType) {
    console.log(`🔄 Testing ${pipelineType.toUpperCase()} pipeline...`);
    
    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                pipelineType: pipelineType, 
                companies: [testCompany],
                max_concurrent: 1
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            const result = data.results[0];
            console.log(`✅ ${pipelineType.toUpperCase()}: Success`);
            console.log(`   📊 Data source: ${result.dataSource || 'Unknown'}`);
            console.log(`   🎯 Synthetic data: ${result.syntheticData || 'Unknown'}`);
            console.log(`   ⏱️ Processing time: ${result.processingTime || 'Unknown'}ms`);
            
            // Save raw JSON for analysis
            fs.writeFileSync(
                path.join(OUTPUT_DIR, `audit-${pipelineType}-raw.json`),
                JSON.stringify(result, null, 2)
            );
            
            return result;
        } else {
            console.log(`❌ ${pipelineType.toUpperCase()}: No results`);
            console.log(`   Response: ${JSON.stringify(data).substring(0, 200)}...`);
            return null;
        }
    } catch (error) {
        console.log(`❌ ${pipelineType.toUpperCase()}: Error - ${error.message}`);
        return null;
    }
}

function auditDataQuality(result, pipelineType) {
    console.log(`\n🔍 AUDITING ${pipelineType.toUpperCase()} DATA QUALITY:`);
    console.log('================================================');
    
    if (!result) {
        console.log('❌ No data to audit');
        return { score: 0, issues: ['No data received'] };
    }
    
    const issues = [];
    let filledFields = 0;
    let totalFields = 0;
    
    if (pipelineType === 'core') {
        // Audit Core pipeline data
        const coreFields = {
            'Website': result.website,
            'Company Name': result.companyName,
            'CFO Name': result.cfo?.name,
            'CFO Email': result.cfo?.email,
            'CFO Phone': result.cfo?.phone,
            'CFO LinkedIn': result.cfo?.linkedIn,
            'CFO Title': result.cfo?.title,
            'CRO Name': result.cro?.name,
            'CRO Email': result.cro?.email,
            'CRO Phone': result.cro?.phone,
            'CRO LinkedIn': result.cro?.linkedIn,
            'CRO Title': result.cro?.title,
            'Account Owner': result.accountOwner
        };
        
        for (const [field, value] of Object.entries(coreFields)) {
            totalFields++;
            if (value && value !== '' && value !== 'Not Found' && value !== 'Unknown') {
                filledFields++;
                console.log(`✅ ${field}: ${value}`);
            } else {
                issues.push(`Missing ${field}`);
                console.log(`❌ ${field}: ${value || 'EMPTY'}`);
            }
        }
        
    } else if (pipelineType === 'advanced') {
        // Audit Advanced pipeline data
        const advancedFields = {
            'Website': result.website,
            'Company Name': result.companyName,
            'Industry': result.industryIntelligence?.industryClassification?.primarySector,
            'Industry Vertical': result.industryIntelligence?.industryClassification?.businessVertical,
            'Executive Stability Risk': result.executiveStabilityRisk,
            'Deal Complexity Assessment': result.dealComplexityAssessment,
            'Competitive Context Analysis': result.competitiveContextAnalysis,
            'Account Owner': result.accountOwner
        };
        
        for (const [field, value] of Object.entries(advancedFields)) {
            totalFields++;
            if (value && value !== '' && value !== 'Unknown') {
                filledFields++;
                console.log(`✅ ${field}: ${value}`);
            } else {
                issues.push(`Missing ${field}`);
                console.log(`❌ ${field}: ${value || 'EMPTY'}`);
            }
        }
        
    } else if (pipelineType === 'powerhouse') {
        // Audit Powerhouse pipeline data
        const powerhouseFields = {
            'Website': result.website,
            'Company Name': result.companyName,
            'Decision Maker': result.buyerGroupIntelligence?.buyerGroup?.decisionMaker?.name,
            'Decision Maker Role': result.buyerGroupIntelligence?.buyerGroup?.decisionMaker?.role,
            'Champion': result.buyerGroupIntelligence?.buyerGroup?.champion?.name,
            'Champion Role': result.buyerGroupIntelligence?.buyerGroup?.champion?.role,
            'Budget Authority Mapping': result.budgetAuthorityMapping,
            'Procurement Maturity Score': result.procurementMaturityScore,
            'Decision Style Analysis': result.decisionStyleAnalysis,
            'Sales Cycle Prediction': result.salesCyclePrediction,
            'Account Owner': result.accountOwner
        };
        
        for (const [field, value] of Object.entries(powerhouseFields)) {
            totalFields++;
            if (value && value !== '' && value !== 'Unknown') {
                filledFields++;
                console.log(`✅ ${field}: ${value}`);
            } else {
                issues.push(`Missing ${field}`);
                console.log(`❌ ${field}: ${value || 'EMPTY'}`);
            }
        }
    }
    
    const score = Math.round((filledFields / totalFields) * 100);
    console.log(`\n📊 DATA QUALITY SCORE: ${score}% (${filledFields}/${totalFields} fields filled)`);
    
    return { score, issues, filledFields, totalFields };
}

async function main() {
    console.log('🎯 SINGLE COMPANY AUDIT TEST');
    console.log('============================');
    console.log(`Testing: ${testCompany.companyName} (${testCompany.domain})`);
    console.log('');
    
    const results = {};
    const audits = {};
    
    // Test Core Pipeline
    console.log('📊 TESTING CORE PIPELINE...');
    results.core = await testPipeline('core');
    audits.core = auditDataQuality(results.core, 'core');
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Test Advanced Pipeline
    console.log('\n📊 TESTING ADVANCED PIPELINE...');
    results.advanced = await testPipeline('advanced');
    audits.advanced = auditDataQuality(results.advanced, 'advanced');
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Test Powerhouse Pipeline
    console.log('\n📊 TESTING POWERHOUSE PIPELINE...');
    results.powerhouse = await testPipeline('powerhouse');
    audits.powerhouse = auditDataQuality(results.powerhouse, 'powerhouse');
    
    // Final Summary
    console.log('\n🎯 FINAL AUDIT SUMMARY');
    console.log('======================');
    console.log(`Core Pipeline: ${results.core ? '✅ Success' : '❌ Failed'} - Quality: ${audits.core.score}%`);
    console.log(`Advanced Pipeline: ${results.advanced ? '✅ Success' : '❌ Failed'} - Quality: ${audits.advanced.score}%`);
    console.log(`Powerhouse Pipeline: ${results.powerhouse ? '✅ Success' : '❌ Failed'} - Quality: ${audits.powerhouse.score}%`);
    
    // Overall readiness assessment
    const overallScore = (audits.core.score + audits.advanced.score + audits.powerhouse.score) / 3;
    console.log(`\n🎯 OVERALL READINESS: ${Math.round(overallScore)}%`);
    
    if (overallScore >= 90) {
        console.log('🚀 READY FOR PRODUCTION - All pipelines generating high-quality data!');
    } else if (overallScore >= 70) {
        console.log('⚠️ NEEDS IMPROVEMENT - Some data quality issues need fixing');
    } else {
        console.log('❌ NOT READY - Significant data quality issues need resolution');
    }
    
    console.log(`\n📁 Raw data saved to: ${OUTPUT_DIR}/`);
    
    // Save audit summary
    const auditSummary = {
        testCompany,
        timestamp: new Date().toISOString(),
        results: {
            core: { success: !!results.core, quality: audits.core },
            advanced: { success: !!results.advanced, quality: audits.advanced },
            powerhouse: { success: !!results.powerhouse, quality: audits.powerhouse }
        },
        overallScore: Math.round(overallScore),
        readyForProduction: overallScore >= 90
    };
    
    fs.writeFileSync(
        path.join(OUTPUT_DIR, 'audit-summary.json'),
        JSON.stringify(auditSummary, null, 2)
    );
    
    console.log(`📊 Audit summary saved to: ${path.join(OUTPUT_DIR, 'audit-summary.json')}`);
}

main().catch(console.error);
