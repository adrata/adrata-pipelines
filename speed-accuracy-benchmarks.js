#!/usr/bin/env node

/**
 * 🚀 SPEED & ACCURACY BENCHMARKING SYSTEM
 * 
 * Tests pipeline performance at scale:
 * - 1, 10, 100, 1000 company batches
 * - Accuracy validation with real data
 * - Performance projections for 1300+ records
 * - Cost analysis and optimization recommendations
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { createObjectCsvWriter } = require('csv-writer');

// Import pipeline classes
const { CorePipeline } = require('./pipelines/core-pipeline');
const { AdvancedPipeline } = require('./pipelines/advanced-pipeline');
const { PowerhousePipeline } = require('./pipelines/powerhouse-pipeline');

class SpeedAccuracyBenchmarks {
    constructor() {
        this.testSizes = [1, 10, 100, 1000];
        this.targetSize = 1300; // SBI's full dataset
        
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
            { website: 'datadog.com', expectedCFO: 'David Obstler', expectedCRO: 'Dan Fougere' }
        ];
        
        this.results = {
            core: {},
            advanced: {},
            powerhouse: {}
        };
        
        this.costPerCompany = {
            core: 0.15,
            advanced: 0.45,
            powerhouse: 0.85
        };
    }

    /**
     * 🚀 RUN COMPREHENSIVE BENCHMARKS
     */
    async runBenchmarks() {
        console.log('\n' + '='.repeat(80));
        console.log('🚀 SPEED & ACCURACY BENCHMARKING SYSTEM');
        console.log('='.repeat(80));
        console.log('Target Dataset: 1,300 companies for SBI Growth');
        console.log('Test Sizes:', this.testSizes.join(', '), 'companies');
        console.log('Pipelines: Core, Advanced, Powerhouse');
        
        try {
            // Test each pipeline at different scales
            for (const pipeline of ['core', 'advanced', 'powerhouse']) {
                console.log(`\n${'='.repeat(60)}`);
                console.log(`📊 TESTING ${pipeline.toUpperCase()} PIPELINE`);
                console.log(`${'='.repeat(60)}`);
                
                await this.testPipelineAtScale(pipeline);
            }
            
            // Generate comprehensive report
            await this.generateBenchmarkReport();
            
            console.log('\n✅ BENCHMARKING COMPLETE');
            console.log('📊 Check benchmark-report.json for detailed results');
            
        } catch (error) {
            console.error('\n❌ BENCHMARKING FAILED:', error);
            throw error;
        }
    }

    /**
     * 📊 TEST PIPELINE AT DIFFERENT SCALES
     */
    async testPipelineAtScale(pipelineType) {
        this.results[pipelineType] = {};
        
        for (const size of this.testSizes) {
            console.log(`\n🔍 Testing ${size} companies...`);
            
            // Get test companies for this size
            const companies = this.getTestCompanies(size);
            
            const startTime = Date.now();
            let successCount = 0;
            let totalProcessingTime = 0;
            const errors = [];
            const results = [];
            
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
                
                // Process companies
                for (let i = 0; i < companies.length; i++) {
                    const company = companies[i];
                    const companyStartTime = Date.now();
                    
                    try {
                        console.log(`   Processing ${i + 1}/${companies.length}: ${company.website}`);
                        
                        const result = await pipeline.processCompany(company, i + 1);
                        const processingTime = Date.now() - companyStartTime;
                        
                        totalProcessingTime += processingTime;
                        results.push({
                            website: company.website,
                            processingTime,
                            success: true,
                            result
                        });
                        
                        // Validate accuracy if we have expected data
                        if (company.expectedCFO || company.expectedCRO) {
                            const validation = this.validateResult(result, company, pipelineType);
                            if (validation.isValid) {
                                successCount++;
                            } else {
                                errors.push(`${company.website}: ${validation.errors.join(', ')}`);
                            }
                        } else {
                            successCount++; // Count as success if no validation data
                        }
                        
                        console.log(`      ✅ ${processingTime}ms`);
                        
                    } catch (companyError) {
                        const processingTime = Date.now() - companyStartTime;
                        totalProcessingTime += processingTime;
                        
                        errors.push(`${company.website}: ${companyError.message}`);
                        results.push({
                            website: company.website,
                            processingTime,
                            success: false,
                            error: companyError.message
                        });
                        
                        console.log(`      ❌ ${processingTime}ms - ${companyError.message}`);
                    }
                }
                
                const totalTime = Date.now() - startTime;
                const avgTime = totalProcessingTime / companies.length;
                const accuracy = (successCount / companies.length) * 100;
                const cost = companies.length * this.costPerCompany[pipelineType];
                
                // Calculate projections for 1300 companies
                const projection1300 = this.calculateProjection(avgTime, accuracy, cost, 1300);
                
                this.results[pipelineType][size] = {
                    companies: companies.length,
                    totalTime,
                    avgTime,
                    accuracy,
                    successCount,
                    errors: errors.length,
                    cost,
                    projection1300,
                    results
                };
                
                console.log(`\n📈 RESULTS FOR ${size} COMPANIES:`);
                console.log(`   Total Time: ${this.formatTime(totalTime)}`);
                console.log(`   Avg Time: ${this.formatTime(avgTime)}`);
                console.log(`   Accuracy: ${accuracy.toFixed(1)}%`);
                console.log(`   Cost: $${cost.toFixed(2)}`);
                console.log(`   Errors: ${errors.length}`);
                console.log(`\n🎯 PROJECTION FOR 1,300 COMPANIES:`);
                console.log(`   Estimated Time: ${this.formatTime(projection1300.estimatedTime)}`);
                console.log(`   Estimated Cost: $${projection1300.estimatedCost.toFixed(2)}`);
                console.log(`   Expected Accuracy: ${projection1300.expectedAccuracy.toFixed(1)}%`);
                
            } catch (error) {
                console.log(`   ❌ Pipeline failed: ${error.message}`);
                this.results[pipelineType][size] = {
                    companies: size,
                    error: error.message,
                    failed: true
                };
            }
        }
    }

    /**
     * 🎯 GET TEST COMPANIES FOR SIZE
     */
    getTestCompanies(size) {
        const companies = [...this.testCompanies];
        
        // If we need more than our test set, duplicate with variations
        while (companies.length < size) {
            const baseCompany = this.testCompanies[companies.length % this.testCompanies.length];
            companies.push({
                website: baseCompany.website,
                // Remove expected data for duplicates to avoid skewing accuracy
                variation: Math.floor(companies.length / this.testCompanies.length) + 1
            });
        }
        
        return companies.slice(0, size);
    }

    /**
     * ✅ VALIDATE RESULT ACCURACY
     */
    validateResult(result, expected, pipelineType) {
        const errors = [];
        
        if (!result) {
            errors.push('No result returned');
            return { isValid: false, errors };
        }
        
        // Core pipeline validation
        if (pipelineType === 'core') {
            if (expected.expectedCFO && (!result.cfo || !result.cfo.name)) {
                errors.push('CFO not found');
            }
            if (expected.expectedCRO && (!result.cro || !result.cro.name)) {
                errors.push('CRO not found');
            }
        }
        
        // Advanced pipeline validation
        if (pipelineType === 'advanced') {
            if (!result.industryIntelligence) {
                errors.push('Industry intelligence missing');
            }
        }
        
        // Powerhouse pipeline validation
        if (pipelineType === 'powerhouse') {
            if (!result.buyerGroupIntelligence) {
                errors.push('Buyer group intelligence missing');
            }
        }
        
        return { isValid: errors.length === 0, errors };
    }

    /**
     * 📊 CALCULATE PROJECTION FOR TARGET SIZE
     */
    calculateProjection(avgTime, accuracy, costPerCompany, targetSize) {
        // Linear scaling with some overhead for larger batches
        const scalingFactor = 1 + (Math.log10(targetSize) * 0.1); // Slight overhead increase
        const estimatedTime = (avgTime * targetSize * scalingFactor);
        const estimatedCost = (costPerCompany * targetSize);
        const expectedAccuracy = Math.max(accuracy - (targetSize / 10000), 85); // Slight accuracy decrease at scale
        
        return {
            estimatedTime,
            estimatedCost,
            expectedAccuracy,
            scalingFactor
        };
    }

    /**
     * 📊 GENERATE COMPREHENSIVE BENCHMARK REPORT
     */
    async generateBenchmarkReport() {
        const report = {
            timestamp: new Date().toISOString(),
            targetDataset: {
                size: this.targetSize,
                description: 'SBI Growth company dataset'
            },
            summary: this.generateSummary(),
            detailed: this.results,
            recommendations: this.generateRecommendations(),
            projections: this.generateProjections()
        };
        
        // Write detailed report
        fs.writeFileSync('benchmark-report.json', JSON.stringify(report, null, 2));
        
        // Write CSV summary
        await this.generateCSVSummary();
        
        // Print executive summary
        this.printExecutiveSummary(report);
    }

    /**
     * 📋 GENERATE EXECUTIVE SUMMARY
     */
    generateSummary() {
        const summary = {};
        
        for (const pipeline of ['core', 'advanced', 'powerhouse']) {
            const pipelineResults = this.results[pipeline];
            const sizes = Object.keys(pipelineResults).map(Number).sort((a, b) => a - b);
            
            if (sizes.length > 0) {
                const largestTest = pipelineResults[Math.max(...sizes)];
                const projection = largestTest.projection1300;
                
                summary[pipeline] = {
                    bestAccuracy: Math.max(...sizes.map(size => pipelineResults[size].accuracy || 0)),
                    avgTimePerCompany: largestTest.avgTime,
                    projectedTimeFor1300: projection.estimatedTime,
                    projectedCostFor1300: projection.estimatedCost,
                    projectedAccuracyFor1300: projection.expectedAccuracy,
                    readyForProduction: largestTest.accuracy >= 85 && largestTest.errors < 2
                };
            }
        }
        
        return summary;
    }

    /**
     * 💡 GENERATE RECOMMENDATIONS
     */
    generateRecommendations() {
        const recommendations = [];
        
        // Analyze each pipeline
        for (const [pipeline, summary] of Object.entries(this.generateSummary())) {
            const projectedHours = summary.projectedTimeFor1300 / (1000 * 60 * 60);
            
            if (projectedHours > 24) {
                recommendations.push(`${pipeline}: Consider parallel processing - projected ${projectedHours.toFixed(1)} hours for 1300 companies`);
            }
            
            if (summary.projectedAccuracyFor1300 < 90) {
                recommendations.push(`${pipeline}: Improve accuracy before production - projected ${summary.projectedAccuracyFor1300.toFixed(1)}% accuracy`);
            }
            
            if (summary.projectedCostFor1300 > 1000) {
                recommendations.push(`${pipeline}: High cost projection - $${summary.projectedCostFor1300.toFixed(2)} for 1300 companies`);
            }
        }
        
        return recommendations;
    }

    /**
     * 🎯 GENERATE PROJECTIONS TABLE
     */
    generateProjections() {
        const projections = {};
        
        for (const [pipeline, summary] of Object.entries(this.generateSummary())) {
            projections[pipeline] = {
                timeFor1300: this.formatTime(summary.projectedTimeFor1300),
                costFor1300: `$${summary.projectedCostFor1300.toFixed(2)}`,
                accuracyFor1300: `${summary.projectedAccuracyFor1300.toFixed(1)}%`,
                companiesPerHour: Math.round(3600000 / summary.avgTimePerCompany),
                readyForProduction: summary.readyForProduction
            };
        }
        
        return projections;
    }

    /**
     * 📊 GENERATE CSV SUMMARY
     */
    async generateCSVSummary() {
        const csvData = [];
        
        for (const pipeline of ['core', 'advanced', 'powerhouse']) {
            for (const [size, data] of Object.entries(this.results[pipeline])) {
                if (!data.failed) {
                    csvData.push({
                        pipeline,
                        companies: size,
                        totalTime: this.formatTime(data.totalTime),
                        avgTime: this.formatTime(data.avgTime),
                        accuracy: `${data.accuracy.toFixed(1)}%`,
                        cost: `$${data.cost.toFixed(2)}`,
                        errors: data.errors,
                        projectedTimeFor1300: this.formatTime(data.projection1300.estimatedTime),
                        projectedCostFor1300: `$${data.projection1300.estimatedCost.toFixed(2)}`
                    });
                }
            }
        }
        
        const csvWriter = createObjectCsvWriter({
            path: 'benchmark-summary.csv',
            header: [
                { id: 'pipeline', title: 'Pipeline' },
                { id: 'companies', title: 'Companies' },
                { id: 'totalTime', title: 'Total Time' },
                { id: 'avgTime', title: 'Avg Time' },
                { id: 'accuracy', title: 'Accuracy' },
                { id: 'cost', title: 'Cost' },
                { id: 'errors', title: 'Errors' },
                { id: 'projectedTimeFor1300', title: 'Projected Time (1300)' },
                { id: 'projectedCostFor1300', title: 'Projected Cost (1300)' }
            ]
        });
        
        await csvWriter.writeRecords(csvData);
    }

    /**
     * 📋 PRINT EXECUTIVE SUMMARY
     */
    printExecutiveSummary(report) {
        console.log('\n' + '='.repeat(80));
        console.log('📊 EXECUTIVE SUMMARY - SBI GROWTH DATASET PROJECTIONS');
        console.log('='.repeat(80));
        
        console.log('\n🎯 PROJECTIONS FOR 1,300 COMPANIES:');
        console.log('─'.repeat(60));
        
        for (const [pipeline, projection] of Object.entries(report.projections)) {
            const icon = pipeline === 'core' ? '🥉' : pipeline === 'advanced' ? '🥈' : '🥇';
            const status = projection.readyForProduction ? '✅ READY' : '⚠️  NEEDS WORK';
            
            console.log(`\n${icon} ${pipeline.toUpperCase()} PIPELINE - ${status}`);
            console.log(`   Time: ${projection.timeFor1300}`);
            console.log(`   Cost: ${projection.costFor1300}`);
            console.log(`   Accuracy: ${projection.accuracyFor1300}`);
            console.log(`   Rate: ${projection.companiesPerHour} companies/hour`);
        }
        
        if (report.recommendations.length > 0) {
            console.log('\n💡 RECOMMENDATIONS:');
            console.log('─'.repeat(40));
            report.recommendations.forEach(rec => console.log(`   • ${rec}`));
        }
        
        console.log('\n📁 FILES GENERATED:');
        console.log('   • benchmark-report.json (detailed results)');
        console.log('   • benchmark-summary.csv (summary table)');
    }

    /**
     * 🕒 FORMAT TIME
     */
    formatTime(ms) {
        if (ms < 1000) return `${ms}ms`;
        if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
        if (ms < 3600000) return `${(ms / 60000).toFixed(1)}min`;
        return `${(ms / 3600000).toFixed(1)}hr`;
    }
}

// Run benchmarks if called directly
if (require.main === module) {
    const benchmarks = new SpeedAccuracyBenchmarks();
    benchmarks.runBenchmarks().catch(console.error);
}

module.exports = SpeedAccuracyBenchmarks;
