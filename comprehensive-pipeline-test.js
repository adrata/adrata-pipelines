#!/usr/bin/env node

/**
 * 🧪 COMPREHENSIVE PIPELINE TEST
 * 
 * Tests all three pipelines (Core, Advanced, Powerhouse) with real companies
 * from the CSV file and validates output format matches expected examples.
 */

const fs = require('fs');
const csv = require('csv-parser');
const { CorePipeline } = require('./pipelines/core-pipeline.js');
const { AdvancedPipeline } = require('./pipelines/advanced-pipeline.js');
const { PowerhousePipeline } = require('./pipelines/powerhouse-pipeline.js');

// Test configuration
const TEST_CONFIG = {
    MAX_COMPANIES: 3, // Test with first 3 companies
    TIMEOUT: 60000,   // 60 second timeout per company
    VALIDATE_FORMAT: true
};

// Expected output formats from example CSVs
const EXPECTED_FORMATS = {
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

class PipelineTestSuite {
    constructor() {
        this.results = {
            core: [],
            advanced: [],
            powerhouse: []
        };
        this.errors = [];
        this.testCompanies = [];
    }

    async loadTestCompanies() {
        console.log('📋 Loading test companies from CSV...');
        
        return new Promise((resolve, reject) => {
            const companies = [];
            
            fs.createReadStream('./inputs/all-1233-companies.csv')
                .pipe(csv())
                .on('data', (row) => {
                    if (companies.length < TEST_CONFIG.MAX_COMPANIES) {
                        companies.push({
                            // Original CSV format for API routes
                            Website: row.Website,
                            'Top 1000': row['Top 1000'],
                            'Account Owner': row['Account Owner'],
                            // Pipeline format (lowercase)
                            website: row.Website,
                            accountOwner: row['Account Owner'],
                            isTop1000: row['Top 1000'] === '1'
                        });
                    }
                })
                .on('end', () => {
                    this.testCompanies = companies;
                    console.log(`✅ Loaded ${companies.length} test companies:`);
                    companies.forEach((company, i) => {
                        console.log(`   ${i + 1}. ${company.Website} (${company['Account Owner']})`);
                    });
                    resolve();
                })
                .on('error', reject);
        });
    }

    async testCorePipeline() {
        console.log('\n🥉 TESTING CORE PIPELINE (Bronze)');
        console.log('=' .repeat(50));
        
        const corePipeline = new CorePipeline();
        
        for (let i = 0; i < this.testCompanies.length; i++) {
            const company = this.testCompanies[i];
            console.log(`\n📊 Processing ${i + 1}/${this.testCompanies.length}: ${company.Website}`);
            
            try {
                const startTime = Date.now();
                const result = await Promise.race([
                    corePipeline.processCompany(company, i),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Timeout')), TEST_CONFIG.TIMEOUT)
                    )
                ]);
                
                const processingTime = Date.now() - startTime;
                console.log(`   ✅ Completed in ${processingTime}ms`);
                console.log(`   📈 Company: ${result.companyName || 'Unknown'}`);
                console.log(`   👔 CFO: ${result.cfoName || 'Not Found'}`);
                console.log(`   💼 CRO: ${result.croName || 'Not Found'}`);
                
                this.results.core.push({
                    ...result,
                    processingTime,
                    testIndex: i
                });
                
            } catch (error) {
                console.log(`   ❌ Error: ${error.message}`);
                this.errors.push({
                    pipeline: 'core',
                    company: company.Website,
                    error: error.message
                });
            }
        }
    }

    async testAdvancedPipeline() {
        console.log('\n🥈 TESTING ADVANCED PIPELINE (Silver)');
        console.log('=' .repeat(50));
        
        const advancedPipeline = new AdvancedPipeline();
        
        for (let i = 0; i < this.testCompanies.length; i++) {
            const company = this.testCompanies[i];
            console.log(`\n📊 Processing ${i + 1}/${this.testCompanies.length}: ${company.Website}`);
            
            try {
                const startTime = Date.now();
                const result = await Promise.race([
                    advancedPipeline.processCompany(company, i),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Timeout')), TEST_CONFIG.TIMEOUT)
                    )
                ]);
                
                const processingTime = Date.now() - startTime;
                console.log(`   ✅ Completed in ${processingTime}ms`);
                console.log(`   📈 Company: ${result.companyName || 'Unknown'}`);
                console.log(`   🏭 Industry: ${result.industry || 'Unknown'}`);
                console.log(`   📊 Confidence: ${result.overallConfidence || 0}%`);
                
                this.results.advanced.push({
                    ...result,
                    processingTime,
                    testIndex: i
                });
                
            } catch (error) {
                console.log(`   ❌ Error: ${error.message}`);
                this.errors.push({
                    pipeline: 'advanced',
                    company: company.Website,
                    error: error.message
                });
            }
        }
    }

    async testPowerhousePipeline() {
        console.log('\n🥇 TESTING POWERHOUSE PIPELINE (Gold)');
        console.log('=' .repeat(50));
        
        const powerhousePipeline = new PowerhousePipeline();
        
        for (let i = 0; i < this.testCompanies.length; i++) {
            const company = this.testCompanies[i];
            console.log(`\n📊 Processing ${i + 1}/${this.testCompanies.length}: ${company.Website}`);
            
            try {
                const startTime = Date.now();
                const result = await Promise.race([
                    powerhousePipeline.processCompany(company, i),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Timeout')), TEST_CONFIG.TIMEOUT)
                    )
                ]);
                
                const processingTime = Date.now() - startTime;
                console.log(`   ✅ Completed in ${processingTime}ms`);
                console.log(`   📈 Company: ${result.companyName || 'Unknown'}`);
                console.log(`   👑 Decision Maker: ${result.decisionMaker || 'Not Found'}`);
                console.log(`   🎯 Champion: ${result.champion || 'Not Found'}`);
                
                this.results.powerhouse.push({
                    ...result,
                    processingTime,
                    testIndex: i
                });
                
            } catch (error) {
                console.log(`   ❌ Error: ${error.message}`);
                this.errors.push({
                    pipeline: 'powerhouse',
                    company: company.Website,
                    error: error.message
                });
            }
        }
    }

    validateOutputFormat(pipelineName, result) {
        const expectedFields = EXPECTED_FORMATS[pipelineName];
        const resultFields = Object.keys(result);
        
        const missingFields = expectedFields.filter(field => !resultFields.includes(field));
        const extraFields = resultFields.filter(field => !expectedFields.includes(field));
        
        return {
            isValid: missingFields.length === 0,
            missingFields,
            extraFields,
            fieldCount: resultFields.length,
            expectedCount: expectedFields.length
        };
    }

    generateReport() {
        console.log('\n📊 COMPREHENSIVE TEST REPORT');
        console.log('=' .repeat(60));
        
        // Summary Statistics
        const totalTests = this.testCompanies.length * 3; // 3 pipelines
        const successfulTests = this.results.core.length + this.results.advanced.length + this.results.powerhouse.length;
        const failedTests = this.errors.length;
        
        console.log(`\n📈 SUMMARY STATISTICS:`);
        console.log(`   Total Tests: ${totalTests}`);
        console.log(`   Successful: ${successfulTests} (${Math.round(successfulTests/totalTests*100)}%)`);
        console.log(`   Failed: ${failedTests} (${Math.round(failedTests/totalTests*100)}%)`);
        
        // Pipeline Performance
        console.log(`\n⚡ PIPELINE PERFORMANCE:`);
        ['core', 'advanced', 'powerhouse'].forEach(pipeline => {
            const results = this.results[pipeline];
            if (results.length > 0) {
                const avgTime = results.reduce((sum, r) => sum + r.processingTime, 0) / results.length;
                console.log(`   ${pipeline.toUpperCase()}: ${results.length} successful, avg ${Math.round(avgTime)}ms`);
            } else {
                console.log(`   ${pipeline.toUpperCase()}: 0 successful`);
            }
        });
        
        // Error Analysis
        if (this.errors.length > 0) {
            console.log(`\n❌ ERROR ANALYSIS:`);
            this.errors.forEach(error => {
                console.log(`   ${error.pipeline}: ${error.company} - ${error.error}`);
            });
        }
        
        // Format Validation
        if (TEST_CONFIG.VALIDATE_FORMAT) {
            console.log(`\n📋 FORMAT VALIDATION:`);
            ['core', 'advanced', 'powerhouse'].forEach(pipeline => {
                const results = this.results[pipeline];
                if (results.length > 0) {
                    const validation = this.validateOutputFormat(pipeline, results[0]);
                    console.log(`   ${pipeline.toUpperCase()}: ${validation.isValid ? '✅ Valid' : '❌ Invalid'}`);
                    if (!validation.isValid) {
                        console.log(`     Missing: ${validation.missingFields.join(', ')}`);
                        console.log(`     Extra: ${validation.extraFields.join(', ')}`);
                    }
                }
            });
        }
        
        // Overall Status
        console.log(`\n🎯 OVERALL STATUS:`);
        const overallSuccess = failedTests === 0 && successfulTests > 0;
        console.log(`   ${overallSuccess ? '✅ PIPELINE SYSTEM READY' : '❌ ISSUES DETECTED'}`);
        
        return {
            success: overallSuccess,
            totalTests,
            successfulTests,
            failedTests,
            results: this.results,
            errors: this.errors
        };
    }

    async saveResults() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const reportPath = `./outputs/pipeline-test-report-${timestamp}.json`;
        
        const report = {
            timestamp: new Date().toISOString(),
            testConfig: TEST_CONFIG,
            testCompanies: this.testCompanies,
            results: this.results,
            errors: this.errors,
            summary: this.generateReport()
        };
        
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`\n💾 Test report saved: ${reportPath}`);
        
        return reportPath;
    }
}

async function main() {
    console.log('🚀 ADRATA PIPELINE COMPREHENSIVE TEST SUITE');
    console.log('Testing Core, Advanced, and Powerhouse pipelines with real companies');
    console.log('=' .repeat(70));
    
    const testSuite = new PipelineTestSuite();
    
    try {
        // Load test companies
        await testSuite.loadTestCompanies();
        
        // Test all pipelines
        await testSuite.testCorePipeline();
        await testSuite.testAdvancedPipeline();
        await testSuite.testPowerhousePipeline();
        
        // Generate and save report
        const report = testSuite.generateReport();
        await testSuite.saveResults();
        
        // Exit with appropriate code
        process.exit(report.success ? 0 : 1);
        
    } catch (error) {
        console.error('❌ Test suite failed:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { PipelineTestSuite };
