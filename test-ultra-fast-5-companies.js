#!/usr/bin/env node

/**
 * 🚀 ULTRA-FAST PIPELINE TEST - 5 Companies
 * 
 * Tests the ultra-fast core pipeline with 5 companies to measure speed improvements
 */

const fs = require('fs');
const csv = require('csv-parser');
const { UltraFastCorePipeline } = require('./pipelines/ultra-fast-core-pipeline.js');

async function testUltraFastPipeline() {
    console.log('🚀 ULTRA-FAST PIPELINE SPEED TEST');
    console.log('='.repeat(50));
    console.log('Testing with 5 companies for maximum speed comparison');
    
    // Create test data with 5 companies
    const testCompanies = [
        { Website: 'www.microsoft.com', 'Top 1000': '1', 'Account Owner': 'Test Owner 1' },
        { Website: 'www.salesforce.com', 'Top 1000': '1', 'Account Owner': 'Test Owner 2' },
        { Website: 'www.oracle.com', 'Top 1000': '1', 'Account Owner': 'Test Owner 3' },
        { Website: 'www.adobe.com', 'Top 1000': '1', 'Account Owner': 'Test Owner 4' },
        { Website: 'www.workday.com', 'Top 1000': '1', 'Account Owner': 'Test Owner 5' }
    ];

    // Write test CSV
    const testInputFile = './test-companies-5.csv';
    const csvHeader = 'Website,Top 1000,Account Owner\\n';
    const csvData = testCompanies.map(c => `${c.Website},${c['Top 1000']},${c['Account Owner']}`).join('\\n');
    fs.writeFileSync(testInputFile, csvHeader + csvData);

    console.log(`\\n📊 Test Configuration:`);
    console.log(`   Companies: ${testCompanies.length}`);
    console.log(`   Ultra-Fast Settings: 50x parallel companies, 8x parallel APIs`);
    console.log(`   Expected Time: 8-15 seconds (vs 18-25s normal)`);

    const startTime = Date.now();

    try {
        // Initialize ultra-fast pipeline
        const pipeline = new UltraFastCorePipeline({
            MAX_PARALLEL_COMPANIES: 50,
            MAX_PARALLEL_APIS: 8,
            MICRO_BATCH_SIZE: 10,
            IN_MEMORY_CACHE: true,
            STREAM_PROCESSING: true,
            AGGRESSIVE_CACHING: true,
            MEMORY_EFFICIENT: true
        });

        // Process companies
        const results = await pipeline.processCompanies(
            testInputFile,
            './outputs/ultra-fast-test-results.csv'
        );

        const totalTime = Date.now() - startTime;
        
        console.log('\\n' + '='.repeat(50));
        console.log('🎉 ULTRA-FAST PIPELINE TEST COMPLETED!');
        console.log('='.repeat(50));
        
        console.log(`\\n📊 SPEED RESULTS:`);
        console.log(`   Total Processing Time: ${(totalTime/1000).toFixed(1)} seconds`);
        console.log(`   Average per Company: ${(totalTime/testCompanies.length/1000).toFixed(2)} seconds`);
        console.log(`   Companies per Second: ${(testCompanies.length/(totalTime/1000)).toFixed(2)}`);
        
        console.log(`\\n🎯 PERFORMANCE ANALYSIS:`);
        if (totalTime < 15000) {
            console.log(`   ✅ EXCELLENT: Under 15 seconds target!`);
        } else if (totalTime < 20000) {
            console.log(`   ✅ GOOD: Under 20 seconds (better than normal)`);
        } else {
            console.log(`   ⚠️  SLOWER: Over 20 seconds (investigate bottlenecks)`);
        }
        
        console.log(`\\n📈 SPEED COMPARISON:`);
        console.log(`   Normal Pipeline Estimate: 18-25 seconds`);
        console.log(`   Ultra-Fast Actual: ${(totalTime/1000).toFixed(1)} seconds`);
        
        const normalEstimate = 21.5; // Average of 18-25 seconds
        const improvement = ((normalEstimate - (totalTime/1000)) / normalEstimate * 100);
        console.log(`   Speed Improvement: ${improvement > 0 ? '+' : ''}${improvement.toFixed(1)}%`);
        
        console.log(`\\n📋 RESULTS SUMMARY:`);
        console.log(`   Successful Results: ${results.length}/${testCompanies.length}`);
        console.log(`   Success Rate: ${Math.round((results.length/testCompanies.length)*100)}%`);
        console.log(`   Output File: ./outputs/ultra-fast-test-results.csv`);
        
        // Cleanup
        fs.unlinkSync(testInputFile);
        
        return {
            totalTimeSeconds: totalTime/1000,
            companiesProcessed: results.length,
            successRate: (results.length/testCompanies.length)*100,
            companiesPerSecond: testCompanies.length/(totalTime/1000),
            speedImprovement: improvement
        };

    } catch (error) {
        console.error('❌ Ultra-fast pipeline test failed:', error.message);
        console.error(error.stack);
        
        // Cleanup on error
        if (fs.existsSync(testInputFile)) {
            fs.unlinkSync(testInputFile);
        }
        
        throw error;
    }
}

// Run the test
if (require.main === module) {
    testUltraFastPipeline()
        .then(results => {
            console.log('\\n🎉 Test completed successfully!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\\n❌ Test failed:', error.message);
            process.exit(1);
        });
}

module.exports = { testUltraFastPipeline };
