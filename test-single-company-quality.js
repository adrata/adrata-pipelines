#!/usr/bin/env node

/**
 * 🧪 SINGLE COMPANY QUALITY TEST
 * Tests all 3 pipelines with 1 company to validate data quality
 * Ensures each pipeline produces accurate, valuable intelligence
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');

// Configuration
const VERCEL_URL = 'https://adrata-pipelines-92pp7p9gz-adrata.vercel.app/api/vercel-optimized';
const DESKTOP_PATH = path.join(os.homedir(), 'Desktop');

// Single company test - Salesforce (well-known data)
const TEST_COMPANY = {
    companyName: "Salesforce Inc",
    domain: "salesforce.com",
    accountOwner: "Dan Mirolli"
};

async function runPipeline(pipelineType, companies, filename) {
    console.log(`\n🚀 Running ${pipelineType.toUpperCase()} pipeline for ${companies.length} company...`);
    
    try {
        const response = await fetch(VERCEL_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                pipeline: pipelineType,
                companies: companies
            })
        });
        
        if (!response.ok) {
            throw new Error(`API call failed: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error('Pipeline execution failed');
        }
        
        // Generate CSV manually
        const csvHeaders = Object.keys(result.results[0] || {});
        const csvRows = result.results.map(row => 
            csvHeaders.map(header => `"${(row[header] || '').toString().replace(/"/g, '""')}"`)
        );
        
        const csvContent = [csvHeaders, ...csvRows]
            .map(row => row.join(','))
            .join('\n');
        
        // Save to desktop
        const csvPath = path.join(DESKTOP_PATH, filename);
        await fs.writeFile(csvPath, csvContent, 'utf8');
        
        console.log(`✅ ${pipelineType.toUpperCase()} Pipeline Results:`);
        console.log(`   📄 CSV saved: ${csvPath}`);
        console.log(`   📊 Companies processed: ${result.results.length}`);
        console.log(`   🎯 Success rate: ${result.stats.success_rate}%`);
        console.log(`   ⏱️  Duration: ${result.stats.total_duration_seconds.toFixed(1)}s`);
        console.log(`   📧 Emails found: ${result.data_quality.real_emails_found}`);
        console.log(`   📱 Phones found: ${result.data_quality.real_phones_found}`);
        
        // Detailed data quality validation
        console.log(`\n🔍 DETAILED DATA QUALITY ANALYSIS:`);
        result.results.forEach((company, index) => {
            console.log(`   ${index + 1}. ${company['Company Name'] || company['Website']}:`);
            
            if (pipelineType === 'core') {
                const cfoName = company['CFO Name'];
                const cfoEmail = company['CFO Email'];
                const cfoTitle = company['CFO Title'];
                const croName = company['CRO Name'];
                const croEmail = company['CRO Email'];
                const croTitle = company['CRO Title'];
                
                console.log(`      CFO: ${cfoName || 'NOT FOUND'} - ${cfoTitle || 'NO TITLE'}`);
                console.log(`      CFO Email: ${cfoEmail || 'NO EMAIL'}`);
                console.log(`      CRO: ${croName || 'NOT FOUND'} - ${croTitle || 'NO TITLE'}`);
                console.log(`      CRO Email: ${croEmail || 'NO EMAIL'}`);
                
                // Validate against known Salesforce data
                if (company['Website'] === 'salesforce.com') {
                    console.log(`\n      ✅ EXPECTED SALESFORCE DATA:`);
                    console.log(`         CFO: Amy Weaver (Chief Financial Officer)`);
                    console.log(`         CFO Email: amy.weaver@salesforce.com`);
                    console.log(`         CRO: Gavin Patterson (President & Chief Revenue Officer)`);
                    console.log(`         CRO Email: gavin.patterson@salesforce.com`);
                    
                    // Quality assessment
                    const cfoMatch = cfoName && cfoName.toLowerCase().includes('weaver');
                    const cfoEmailMatch = cfoEmail && cfoEmail.includes('amy.weaver');
                    const croMatch = croName && croName.toLowerCase().includes('patterson');
                    const croEmailMatch = croEmail && croEmail.includes('gavin.patterson');
                    
                    console.log(`\n      🎯 QUALITY ASSESSMENT:`);
                    console.log(`         CFO Name Match: ${cfoMatch ? '✅' : '❌'}`);
                    console.log(`         CFO Email Match: ${cfoEmailMatch ? '✅' : '❌'}`);
                    console.log(`         CRO Name Match: ${croMatch ? '✅' : '❌'}`);
                    console.log(`         CRO Email Match: ${croEmailMatch ? '✅' : '❌'}`);
                    
                    const accuracy = [cfoMatch, cfoEmailMatch, croMatch, croEmailMatch].filter(Boolean).length / 4 * 100;
                    console.log(`         Overall Accuracy: ${accuracy}%`);
                }
            } else if (pipelineType === 'advanced') {
                const industry = company['Industry'];
                const vertical = company['Industry Vertical'];
                const stability = company['Executive Stability Risk'];
                const complexity = company['Deal Complexity Assessment'];
                const competitive = company['Competitive Context Analysis'];
                
                console.log(`      Industry: ${industry || 'NOT FOUND'}`);
                console.log(`      Vertical: ${vertical || 'NOT FOUND'}`);
                console.log(`      Stability Risk: ${stability || 'NOT FOUND'}`);
                console.log(`      Deal Complexity: ${complexity || 'NOT FOUND'}`);
                console.log(`      Competitive Context: ${competitive || 'NOT FOUND'}`);
                
                // Validate against expected Salesforce intelligence
                if (company['Website'] === 'salesforce.com') {
                    console.log(`\n      ✅ EXPECTED SALESFORCE INTELLIGENCE:`);
                    console.log(`         Industry: Cloud Software or Customer Relationship Management`);
                    console.log(`         Vertical: CRM or Business Applications`);
                    console.log(`         Stability: Low (Stable C-suite)`);
                    console.log(`         Complexity: Complex (Enterprise deals)`);
                    console.log(`         Competitive: Market Leader (CRM market share)`);
                    
                    // Quality assessment
                    const hasIndustry = industry && industry.length > 5;
                    const hasVertical = vertical && vertical.length > 5;
                    const hasStability = stability && stability.length > 10;
                    const hasComplexity = complexity && complexity.length > 10;
                    const hasCompetitive = competitive && competitive.length > 10;
                    
                    console.log(`\n      🎯 QUALITY ASSESSMENT:`);
                    console.log(`         Industry Intelligence: ${hasIndustry ? '✅' : '❌'}`);
                    console.log(`         Vertical Intelligence: ${hasVertical ? '✅' : '❌'}`);
                    console.log(`         Stability Analysis: ${hasStability ? '✅' : '❌'}`);
                    console.log(`         Complexity Analysis: ${hasComplexity ? '✅' : '❌'}`);
                    console.log(`         Competitive Analysis: ${hasCompetitive ? '✅' : '❌'}`);
                    
                    const intelligenceScore = [hasIndustry, hasVertical, hasStability, hasComplexity, hasCompetitive].filter(Boolean).length / 5 * 100;
                    console.log(`         Intelligence Quality: ${intelligenceScore}%`);
                }
            } else if (pipelineType === 'powerhouse') {
                const decisionMaker = company['Decision Maker'];
                const champion = company['Champion'];
                const budgetAuth = company['Budget Authority Mapping'];
                const procurement = company['Procurement Maturity Score'];
                const decisionStyle = company['Decision Style Analysis'];
                const routingStrategy = company['Routing Intelligence Strategy 1'];
                
                console.log(`      Decision Maker: ${decisionMaker || 'NOT FOUND'}`);
                console.log(`      Champion: ${champion || 'NOT FOUND'}`);
                console.log(`      Budget Authority: ${budgetAuth ? 'FOUND' : 'NOT FOUND'}`);
                console.log(`      Procurement Score: ${procurement || 'NOT FOUND'}`);
                console.log(`      Decision Style: ${decisionStyle || 'NOT FOUND'}`);
                console.log(`      Routing Strategy: ${routingStrategy || 'NOT FOUND'}`);
                
                // Validate against expected Salesforce buyer group intelligence
                if (company['Website'] === 'salesforce.com') {
                    console.log(`\n      ✅ EXPECTED SALESFORCE BUYER GROUP:`);
                    console.log(`         Decision Maker: Amy Weaver (CFO)`);
                    console.log(`         Champion: Marc Benioff (CEO)`);
                    console.log(`         Budget Authority: CFO controls budget`);
                    console.log(`         Procurement: High maturity (9/10)`);
                    console.log(`         Decision Style: Consensus-driven`);
                    console.log(`         Routing: Board-first engagement`);
                    
                    // Quality assessment
                    const hasDecisionMaker = decisionMaker && decisionMaker.length > 5;
                    const hasChampion = champion && champion.length > 5;
                    const hasBudgetAuth = budgetAuth && budgetAuth.length > 20;
                    const hasProcurement = procurement && procurement.includes('/');
                    const hasDecisionStyle = decisionStyle && decisionStyle.length > 15;
                    const hasRoutingStrategy = routingStrategy && routingStrategy.length > 20;
                    
                    console.log(`\n      🎯 QUALITY ASSESSMENT:`);
                    console.log(`         Decision Maker: ${hasDecisionMaker ? '✅' : '❌'}`);
                    console.log(`         Champion: ${hasChampion ? '✅' : '❌'}`);
                    console.log(`         Budget Authority: ${hasBudgetAuth ? '✅' : '❌'}`);
                    console.log(`         Procurement Score: ${hasProcurement ? '✅' : '❌'}`);
                    console.log(`         Decision Style: ${hasDecisionStyle ? '✅' : '❌'}`);
                    console.log(`         Routing Strategy: ${hasRoutingStrategy ? '✅' : '❌'}`);
                    
                    const buyerGroupScore = [hasDecisionMaker, hasChampion, hasBudgetAuth, hasProcurement, hasDecisionStyle, hasRoutingStrategy].filter(Boolean).length / 6 * 100;
                    console.log(`         Buyer Group Intelligence: ${buyerGroupScore}%`);
                }
            }
        });
        
        return {
            success: true,
            csvPath: csvPath,
            stats: result.stats,
            dataQuality: result.data_quality,
            results: result.results
        };
        
    } catch (error) {
        console.error(`❌ ${pipelineType.toUpperCase()} Pipeline Error: ${error.message}`);
        return {
            success: false,
            error: error.message
        };
    }
}

async function testSingleCompanyQuality() {
    console.log('🧪 SINGLE COMPANY QUALITY TEST');
    console.log('==============================');
    console.log(`📁 CSV files will be saved to: ${DESKTOP_PATH}`);
    console.log(`🏢 Testing with: ${TEST_COMPANY.companyName} (${TEST_COMPANY.domain})`);
    console.log(`🎯 Objective: Validate data quality and pipeline functionality`);
    
    const timestamp = new Date().toISOString().split('T')[0];
    const results = {};
    
    // Test Core Pipeline (CFO/CRO data)
    console.log('\n🎯 TESTING CORE PIPELINE (CFO/CRO Data)');
    results.core = await runPipeline('core', [TEST_COMPANY], `quality-core-${timestamp}.csv`);
    
    // Test Advanced Pipeline (Industry intelligence)
    console.log('\n🎯 TESTING ADVANCED PIPELINE (Industry Intelligence)');
    results.advanced = await runPipeline('advanced', [TEST_COMPANY], `quality-advanced-${timestamp}.csv`);
    
    // Test Powerhouse Pipeline (Buyer group intelligence)
    console.log('\n🎯 TESTING POWERHOUSE PIPELINE (Buyer Group Intelligence)');
    results.powerhouse = await runPipeline('powerhouse', [TEST_COMPANY], `quality-powerhouse-${timestamp}.csv`);
    
    // Summary
    console.log('\n📊 QUALITY TEST SUMMARY:');
    console.log('========================');
    
    Object.entries(results).forEach(([pipeline, result]) => {
        if (result.success) {
            console.log(`✅ ${pipeline.toUpperCase()}:`);
            console.log(`   📄 File: ${path.basename(result.csvPath)}`);
            console.log(`   ⏱️  Time: ${result.stats.total_duration_seconds.toFixed(1)}s`);
            console.log(`   📧 Emails: ${result.dataQuality.real_emails_found}`);
            console.log(`   📱 Phones: ${result.dataQuality.real_phones_found}`);
            console.log(`   🎯 Success Rate: ${result.stats.success_rate}%`);
        } else {
            console.log(`❌ ${pipeline.toUpperCase()}: ${result.error}`);
        }
    });
    
    console.log('\n🎯 QUALITY VALIDATION COMPLETE!');
    console.log('All CSV files have been saved to your desktop for review.');
    console.log('Compare the data quality against the expected Salesforce data.');
    
    return results;
}

// Run the quality test
testSingleCompanyQuality().catch(console.error);
