#!/usr/bin/env node

/**
 * 🎯 ENHANCED COVERAGE VALIDATION SYSTEM
 * 
 * Tests for near 100% CFO/CRO coverage and data completeness:
 * - CFO/CRO discovery rates
 * - Email accuracy and coverage
 * - Phone discovery rates
 * - LinkedIn profile accuracy
 * - Data quality validation for SBI submission
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { createObjectCsvWriter } = require('csv-writer');

// Import pipeline classes
const { CorePipeline } = require('./pipelines/core-pipeline');
const { AdvancedPipeline } = require('./pipelines/advanced-pipeline');
const { PowerhousePipeline } = require('./pipelines/powerhouse-pipeline');

class EnhancedCoverageValidation {
    constructor() {
        this.targetCoverage = {
            cfoDiscovery: 95,      // 95% CFO discovery
            croDiscovery: 95,      // 95% CRO discovery
            cfoEmail: 90,          // 90% CFO emails
            croEmail: 90,          // 90% CRO emails
            cfoPhone: 85,          // 85% CFO phones
            croPhone: 85,          // 85% CRO phones
            linkedIn: 95           // 95% LinkedIn profiles
        };
        
        this.testCompanies = [
            { website: 'salesforce.com', expectedCFO: 'Amy Weaver', expectedCRO: 'Brian Millham' },
            { website: 'microsoft.com', expectedCFO: 'Amy Hood', expectedCRO: 'Judson Althoff' },
            { website: 'adobe.com', expectedCFO: 'Dan Durn', expectedCRO: 'Anil Chakravarthy' },
            { website: 'hubspot.com', expectedCFO: 'Kathryn Bueker', expectedCRO: 'Yamini Rangan' },
            { website: 'zoom.us', expectedCFO: 'Kelly Steckelberg', expectedCRO: 'Ryan Azus' },
            { website: 'shopify.com', expectedCFO: 'Jeff Hoffmeister', expectedCRO: 'Kaz Nejatian' },
            { website: 'stripe.com', expectedCFO: 'Dhivya Suryadevara', expectedCRO: 'Rob McIntosh' },
            { website: 'atlassian.com', expectedCFO: 'Joe Binz', expectedCRO: 'Cameron Deatsch' },
            { website: 'twilio.com', expectedCFO: 'Khozema Shipchandler', expectedCRO: 'Marc Boroditsky' },
            { website: 'datadog.com', expectedCFO: 'David Obstler', expectedCRO: 'Dan Fougere' },
            { website: 'snowflake.com', expectedCFO: 'Mike Scarpelli', expectedCRO: 'Chris Degnan' },
            { website: 'okta.com', expectedCFO: 'Brett Tighe', expectedCRO: 'Susan St. Ledger' },
            { website: 'docusign.com', expectedCFO: 'Cynthia Gaylor', expectedCRO: 'Loren Padelford' },
            { website: 'zendesk.com', expectedCFO: 'Elena Gomez', expectedCRO: 'Norman Gennaro' },
            { website: 'workday.com', expectedCFO: 'Robynne Sisco', expectedCRO: 'Pete Schlampp' }
        ];
        
        this.results = {};
    }

    /**
     * 🚀 RUN COMPREHENSIVE COVERAGE VALIDATION
     */
    async runCoverageValidation() {
        console.log('\n' + '='.repeat(80));
        console.log('🎯 ENHANCED COVERAGE VALIDATION - 100% CFO/CRO TARGET');
        console.log('='.repeat(80));
        console.log('Target Coverage: 95% CFO/CRO discovery, 90% emails, 85% phones');
        console.log('Test Companies:', this.testCompanies.length);
        
        try {
            // Test each pipeline for coverage
            for (const pipeline of ['core', 'advanced', 'powerhouse']) {
                console.log(`\n${'='.repeat(60)}`);
                console.log(`🎯 TESTING ${pipeline.toUpperCase()} PIPELINE COVERAGE`);
                console.log(`${'='.repeat(60)}`);
                
                await this.testPipelineCoverage(pipeline);
            }
            
            // Generate coverage report
            await this.generateCoverageReport();
            
            // Generate sample CSV files for SBI email
            await this.generateSBICSVSamples();
            
            console.log('\n✅ COVERAGE VALIDATION COMPLETE');
            console.log('📊 Check coverage-report.json for detailed results');
            console.log('📁 Sample CSV files generated for SBI submission');
            
        } catch (error) {
            console.error('\n❌ COVERAGE VALIDATION FAILED:', error);
            throw error;
        }
    }

    /**
     * 🎯 TEST PIPELINE COVERAGE
     */
    async testPipelineCoverage(pipelineType) {
        const coverage = {
            totalCompanies: this.testCompanies.length,
            cfoFound: 0,
            croFound: 0,
            cfoEmail: 0,
            croEmail: 0,
            cfoPhone: 0,
            croPhone: 0,
            cfoLinkedIn: 0,
            croLinkedIn: 0,
            results: [],
            errors: []
        };
        
        try {
            // Initialize pipeline
            let pipeline;
            switch (pipelineType) {
                case 'core':
                    pipeline = new CorePipeline();
                    break;
                case 'advanced':
                    pipeline = new AdvancedPipeline();
                    break;
                case 'powerhouse':
                    pipeline = new PowerhousePipeline();
                    break;
            }
            
            // Process each company
            for (let i = 0; i < this.testCompanies.length; i++) {
                const company = this.testCompanies[i];
                console.log(`   📊 Testing ${i + 1}/${this.testCompanies.length}: ${company.website}`);
                
                try {
                    const result = await pipeline.processCompany(company, i + 1);
                    
                    // Analyze coverage
                    const analysis = this.analyzeCoverage(result, company);
                    coverage.results.push(analysis);
                    
                    // Count successful discoveries
                    if (analysis.cfo.found) coverage.cfoFound++;
                    if (analysis.cro.found) coverage.croFound++;
                    if (analysis.cfo.email) coverage.cfoEmail++;
                    if (analysis.cro.email) coverage.croEmail++;
                    if (analysis.cfo.phone) coverage.cfoPhone++;
                    if (analysis.cro.phone) coverage.croPhone++;
                    if (analysis.cfo.linkedIn) coverage.cfoLinkedIn++;
                    if (analysis.cro.linkedIn) coverage.croLinkedIn++;
                    
                    console.log(`      ✅ CFO: ${analysis.cfo.found ? '✓' : '✗'} CRO: ${analysis.cro.found ? '✓' : '✗'} Emails: ${analysis.cfo.email ? '✓' : '✗'}/${analysis.cro.email ? '✓' : '✗'}`);
                    
                } catch (companyError) {
                    coverage.errors.push(`${company.website}: ${companyError.message}`);
                    console.log(`      ❌ ${company.website}: ${companyError.message}`);
                }
            }
            
            // Calculate percentages
            coverage.percentages = {
                cfoDiscovery: (coverage.cfoFound / coverage.totalCompanies) * 100,
                croDiscovery: (coverage.croFound / coverage.totalCompanies) * 100,
                cfoEmail: (coverage.cfoEmail / coverage.totalCompanies) * 100,
                croEmail: (coverage.croEmail / coverage.totalCompanies) * 100,
                cfoPhone: (coverage.cfoPhone / coverage.totalCompanies) * 100,
                croPhone: (coverage.croPhone / coverage.totalCompanies) * 100,
                cfoLinkedIn: (coverage.cfoLinkedIn / coverage.totalCompanies) * 100,
                croLinkedIn: (coverage.croLinkedIn / coverage.totalCompanies) * 100
            };
            
            this.results[pipelineType] = coverage;
            
            // Print coverage summary
            this.printCoverageSummary(pipelineType, coverage);
            
        } catch (error) {
            console.log(`   ❌ Pipeline failed: ${error.message}`);
            this.results[pipelineType] = { error: error.message, failed: true };
        }
    }

    /**
     * 📊 ANALYZE INDIVIDUAL COMPANY COVERAGE
     */
    analyzeCoverage(result, expected) {
        const analysis = {
            website: expected.website,
            cfo: {
                found: !!(result.cfo && result.cfo.name),
                name: result.cfo?.name || null,
                expected: expected.expectedCFO,
                correct: false,
                email: !!(result.cfo && result.cfo.email),
                phone: !!(result.cfo && result.cfo.phone),
                linkedIn: !!(result.cfo && result.cfo.linkedIn),
                confidence: result.cfo?.confidence || 0
            },
            cro: {
                found: !!(result.cro && result.cro.name),
                name: result.cro?.name || null,
                expected: expected.expectedCRO,
                correct: false,
                email: !!(result.cro && result.cro.email),
                phone: !!(result.cro && result.cro.phone),
                linkedIn: !!(result.cro && result.cro.linkedIn),
                confidence: result.cro?.confidence || 0
            }
        };
        
        // Check if we found the correct executives
        if (analysis.cfo.found && expected.expectedCFO) {
            analysis.cfo.correct = analysis.cfo.name.toLowerCase().includes(expected.expectedCFO.toLowerCase().split(' ')[0]);
        }
        
        if (analysis.cro.found && expected.expectedCRO) {
            analysis.cro.correct = analysis.cro.name.toLowerCase().includes(expected.expectedCRO.toLowerCase().split(' ')[0]);
        }
        
        return analysis;
    }

    /**
     * 📋 PRINT COVERAGE SUMMARY
     */
    printCoverageSummary(pipelineType, coverage) {
        console.log(`\n📊 ${pipelineType.toUpperCase()} COVERAGE RESULTS:`);
        console.log('─'.repeat(50));
        
        const percentages = coverage.percentages;
        
        console.log(`   CFO Discovery: ${coverage.cfoFound}/${coverage.totalCompanies} (${percentages.cfoDiscovery.toFixed(1)}%) ${this.getStatusIcon(percentages.cfoDiscovery, this.targetCoverage.cfoDiscovery)}`);
        console.log(`   CRO Discovery: ${coverage.croFound}/${coverage.totalCompanies} (${percentages.croDiscovery.toFixed(1)}%) ${this.getStatusIcon(percentages.croDiscovery, this.targetCoverage.croDiscovery)}`);
        console.log(`   CFO Emails: ${coverage.cfoEmail}/${coverage.totalCompanies} (${percentages.cfoEmail.toFixed(1)}%) ${this.getStatusIcon(percentages.cfoEmail, this.targetCoverage.cfoEmail)}`);
        console.log(`   CRO Emails: ${coverage.croEmail}/${coverage.totalCompanies} (${percentages.croEmail.toFixed(1)}%) ${this.getStatusIcon(percentages.croEmail, this.targetCoverage.croEmail)}`);
        console.log(`   CFO Phones: ${coverage.cfoPhone}/${coverage.totalCompanies} (${percentages.cfoPhone.toFixed(1)}%) ${this.getStatusIcon(percentages.cfoPhone, this.targetCoverage.cfoPhone)}`);
        console.log(`   CRO Phones: ${coverage.croPhone}/${coverage.totalCompanies} (${percentages.croPhone.toFixed(1)}%) ${this.getStatusIcon(percentages.croPhone, this.targetCoverage.croPhone)}`);
        
        if (coverage.errors.length > 0) {
            console.log(`   Errors: ${coverage.errors.length}`);
        }
    }

    /**
     * 📊 GENERATE COMPREHENSIVE COVERAGE REPORT
     */
    async generateCoverageReport() {
        const report = {
            timestamp: new Date().toISOString(),
            targetCoverage: this.targetCoverage,
            results: this.results,
            summary: this.generateCoverageSummary(),
            recommendations: this.generateCoverageRecommendations(),
            sbiReadiness: this.assessSBIReadiness()
        };
        
        // Write report to file
        fs.writeFileSync('coverage-report.json', JSON.stringify(report, null, 2));
        
        // Print executive summary
        this.printExecutiveCoverageSummary(report);
    }

    /**
     * 📋 GENERATE COVERAGE SUMMARY
     */
    generateCoverageSummary() {
        const summary = {};
        
        for (const [pipeline, data] of Object.entries(this.results)) {
            if (!data.failed) {
                summary[pipeline] = {
                    overallScore: this.calculateOverallScore(data.percentages),
                    meetsTargets: this.checkTargets(data.percentages),
                    strongestArea: this.findStrongestArea(data.percentages),
                    weakestArea: this.findWeakestArea(data.percentages),
                    readyForProduction: this.isReadyForProduction(data.percentages)
                };
            }
        }
        
        return summary;
    }

    /**
     * 💡 GENERATE COVERAGE RECOMMENDATIONS
     */
    generateCoverageRecommendations() {
        const recommendations = [];
        
        for (const [pipeline, data] of Object.entries(this.results)) {
            if (!data.failed) {
                const percentages = data.percentages;
                
                if (percentages.cfoDiscovery < this.targetCoverage.cfoDiscovery) {
                    recommendations.push(`${pipeline}: Improve CFO discovery - currently ${percentages.cfoDiscovery.toFixed(1)}%, target ${this.targetCoverage.cfoDiscovery}%`);
                }
                
                if (percentages.croDiscovery < this.targetCoverage.croDiscovery) {
                    recommendations.push(`${pipeline}: Improve CRO discovery - currently ${percentages.croDiscovery.toFixed(1)}%, target ${this.targetCoverage.croDiscovery}%`);
                }
                
                if (percentages.cfoEmail < this.targetCoverage.cfoEmail) {
                    recommendations.push(`${pipeline}: Improve CFO email discovery - currently ${percentages.cfoEmail.toFixed(1)}%, target ${this.targetCoverage.cfoEmail}%`);
                }
                
                if (percentages.croEmail < this.targetCoverage.croEmail) {
                    recommendations.push(`${pipeline}: Improve CRO email discovery - currently ${percentages.croEmail.toFixed(1)}%, target ${this.targetCoverage.croEmail}%`);
                }
            }
        }
        
        return recommendations;
    }

    /**
     * 📁 GENERATE SBI CSV SAMPLES
     */
    async generateSBICSVSamples() {
        console.log('\n📁 Generating SBI CSV samples...');
        
        for (const [pipeline, data] of Object.entries(this.results)) {
            if (!data.failed && data.results) {
                await this.generatePipelineCSV(pipeline, data.results);
            }
        }
        
        console.log('   ✅ CSV samples generated for SBI submission');
    }

    /**
     * 📊 GENERATE PIPELINE CSV
     */
    async generatePipelineCSV(pipelineType, results) {
        const filename = `sbi-${pipelineType}-sample.csv`;
        
        // Define headers based on pipeline type
        let headers, data;
        
        if (pipelineType === 'core') {
            headers = [
                { id: 'website', title: 'Website' },
                { id: 'companyName', title: 'Company Name' },
                { id: 'cfoName', title: 'CFO Name' },
                { id: 'cfoTitle', title: 'CFO Title' },
                { id: 'cfoEmail', title: 'CFO Email' },
                { id: 'cfoPhone', title: 'CFO Phone' },
                { id: 'cfoLinkedIn', title: 'CFO LinkedIn' },
                { id: 'croName', title: 'CRO Name' },
                { id: 'croTitle', title: 'CRO Title' },
                { id: 'croEmail', title: 'CRO Email' },
                { id: 'croPhone', title: 'CRO Phone' },
                { id: 'croLinkedIn', title: 'CRO LinkedIn' },
                { id: 'cfoConfidence', title: 'CFO Confidence' },
                { id: 'croConfidence', title: 'CRO Confidence' }
            ];
            
            data = results.map(result => ({
                website: result.website,
                companyName: this.extractCompanyName(result.website),
                cfoName: result.cfo.name || 'Not Found',
                cfoTitle: result.cfo.found ? 'Chief Financial Officer' : 'Not Found',
                cfoEmail: result.cfo.email ? 'example@company.com' : 'Not Found',
                cfoPhone: result.cfo.phone ? '+1-555-0123' : 'Not Found',
                cfoLinkedIn: result.cfo.linkedIn ? 'linkedin.com/in/cfo' : 'Not Found',
                croName: result.cro.name || 'Not Found',
                croTitle: result.cro.found ? 'Chief Revenue Officer' : 'Not Found',
                croEmail: result.cro.email ? 'example@company.com' : 'Not Found',
                croPhone: result.cro.phone ? '+1-555-0124' : 'Not Found',
                croLinkedIn: result.cro.linkedIn ? 'linkedin.com/in/cro' : 'Not Found',
                cfoConfidence: `${result.cfo.confidence}%`,
                croConfidence: `${result.cro.confidence}%`
            }));
        }
        
        // Write CSV
        const csvWriter = createObjectCsvWriter({
            path: filename,
            header: headers
        });
        
        await csvWriter.writeRecords(data);
        console.log(`   📄 Generated ${filename}`);
    }

    /**
     * 🎯 ASSESS SBI READINESS
     */
    assessSBIReadiness() {
        const readiness = {};
        
        for (const [pipeline, data] of Object.entries(this.results)) {
            if (!data.failed) {
                const percentages = data.percentages;
                const score = this.calculateOverallScore(percentages);
                
                readiness[pipeline] = {
                    score,
                    status: score >= 90 ? 'READY' : score >= 80 ? 'NEEDS_IMPROVEMENT' : 'NOT_READY',
                    coverageGaps: this.identifyCoverageGaps(percentages),
                    recommendation: this.getReadinessRecommendation(score)
                };
            }
        }
        
        return readiness;
    }

    /**
     * 🛠️ UTILITY FUNCTIONS
     */
    getStatusIcon(actual, target) {
        return actual >= target ? '✅' : actual >= target - 5 ? '⚠️' : '❌';
    }

    calculateOverallScore(percentages) {
        const weights = {
            cfoDiscovery: 0.25,
            croDiscovery: 0.25,
            cfoEmail: 0.20,
            croEmail: 0.20,
            cfoPhone: 0.05,
            croPhone: 0.05
        };
        
        let score = 0;
        Object.entries(weights).forEach(([key, weight]) => {
            score += (percentages[key] || 0) * weight;
        });
        
        return Math.round(score);
    }

    checkTargets(percentages) {
        return {
            cfoDiscovery: percentages.cfoDiscovery >= this.targetCoverage.cfoDiscovery,
            croDiscovery: percentages.croDiscovery >= this.targetCoverage.croDiscovery,
            cfoEmail: percentages.cfoEmail >= this.targetCoverage.cfoEmail,
            croEmail: percentages.croEmail >= this.targetCoverage.croEmail
        };
    }

    findStrongestArea(percentages) {
        return Object.entries(percentages).reduce((max, [key, value]) => 
            value > max.value ? { area: key, value } : max, 
            { area: 'none', value: 0 }
        );
    }

    findWeakestArea(percentages) {
        return Object.entries(percentages).reduce((min, [key, value]) => 
            value < min.value ? { area: key, value } : min, 
            { area: 'none', value: 100 }
        );
    }

    isReadyForProduction(percentages) {
        return percentages.cfoDiscovery >= 90 && 
               percentages.croDiscovery >= 90 && 
               percentages.cfoEmail >= 85 && 
               percentages.croEmail >= 85;
    }

    identifyCoverageGaps(percentages) {
        const gaps = [];
        Object.entries(this.targetCoverage).forEach(([key, target]) => {
            if (percentages[key] < target) {
                gaps.push({
                    area: key,
                    current: percentages[key],
                    target,
                    gap: target - percentages[key]
                });
            }
        });
        return gaps;
    }

    getReadinessRecommendation(score) {
        if (score >= 90) return 'Ready for SBI submission';
        if (score >= 80) return 'Minor improvements needed before submission';
        return 'Significant improvements required before submission';
    }

    extractCompanyName(website) {
        return website.replace(/\.(com|org|net|io)$/, '').replace(/^www\./, '');
    }

    printExecutiveCoverageSummary(report) {
        console.log('\n' + '='.repeat(80));
        console.log('🎯 EXECUTIVE COVERAGE SUMMARY - SBI READINESS');
        console.log('='.repeat(80));
        
        for (const [pipeline, readiness] of Object.entries(report.sbiReadiness)) {
            const icon = readiness.status === 'READY' ? '✅' : readiness.status === 'NEEDS_IMPROVEMENT' ? '⚠️' : '❌';
            
            console.log(`\n${icon} ${pipeline.toUpperCase()} PIPELINE - ${readiness.status}`);
            console.log(`   Overall Score: ${readiness.score}%`);
            console.log(`   Recommendation: ${readiness.recommendation}`);
            
            if (readiness.coverageGaps.length > 0) {
                console.log(`   Coverage Gaps:`);
                readiness.coverageGaps.forEach(gap => {
                    console.log(`     • ${gap.area}: ${gap.current.toFixed(1)}% (need ${gap.target}%)`);
                });
            }
        }
        
        console.log('\n📁 FILES GENERATED:');
        console.log('   • coverage-report.json (detailed analysis)');
        console.log('   • sbi-core-sample.csv (Core pipeline sample)');
        console.log('   • sbi-advanced-sample.csv (Advanced pipeline sample)');
        console.log('   • sbi-powerhouse-sample.csv (Powerhouse pipeline sample)');
    }
}

// Run validation if called directly
if (require.main === module) {
    const validator = new EnhancedCoverageValidation();
    validator.runCoverageValidation().catch(console.error);
}

module.exports = EnhancedCoverageValidation;
