#!/usr/bin/env node

/**
 * 🧪 TEST ALL 3 PIPELINES WITH CSV OUTPUT
 * Tests Core, Advanced, and Powerhouse pipelines with real data
 * Saves CSV files to desktop for audit
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');

// Configuration
const VERCEL_URL = 'https://adrata-pipelines-92pp7p9gz-adrata.vercel.app/api/vercel-optimized';
const DESKTOP_PATH = path.join(os.homedir(), 'Desktop');

// Test company - using a well-known company for consistent results
const TEST_COMPANY = {
    companyName: "Microsoft Corporation",
    domain: "microsoft.com",
    accountOwner: "Dan Mirolli"
};

async function runPipeline(pipelineType, companies, filename) {
    console.log(`\n🚀 Running ${pipelineType.toUpperCase()} pipeline...`);
    
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
        
        // Generate CSV manually (in case API CSV generation has issues)
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
        
        // Show sample data
        if (result.results.length > 0) {
            const sample = result.results[0];
            console.log(`   📋 Sample CFO: ${sample['CFO Name']} - ${sample['CFO Title']}`);
            console.log(`   📋 Sample CRO: ${sample['CRO Name']} - ${sample['CRO Title']}`);
        }
        
        return {
            success: true,
            csvPath: csvPath,
            stats: result.stats,
            dataQuality: result.data_quality,
            sampleData: result.results[0] || {}
        };
        
    } catch (error) {
        console.error(`❌ ${pipelineType.toUpperCase()} Pipeline Error: ${error.message}`);
        return {
            success: false,
            error: error.message
        };
    }
}

async function testAllPipelines() {
    console.log('🧪 TESTING ALL 3 PIPELINES WITH REAL DATA');
    console.log('==========================================');
    console.log(`📁 CSV files will be saved to: ${DESKTOP_PATH}`);
    console.log(`🏢 Test company: ${TEST_COMPANY.companyName} (${TEST_COMPANY.domain})`);
    
    const timestamp = new Date().toISOString().split('T')[0];
    const results = {};
    
    // Test Core Pipeline
    results.core = await runPipeline('core', [TEST_COMPANY], `core-pipeline-${timestamp}.csv`);
    
    // Test Advanced Pipeline  
    results.advanced = await runPipeline('advanced', [TEST_COMPANY], `advanced-pipeline-${timestamp}.csv`);
    
    // Test Powerhouse Pipeline
    results.powerhouse = await runPipeline('powerhouse', [TEST_COMPANY], `powerhouse-pipeline-${timestamp}.csv`);
    
    // Summary
    console.log('\n📊 PIPELINE COMPARISON SUMMARY:');
    console.log('================================');
    
    Object.entries(results).forEach(([pipeline, result]) => {
        if (result.success) {
            console.log(`✅ ${pipeline.toUpperCase()}:`);
            console.log(`   📄 File: ${path.basename(result.csvPath)}`);
            console.log(`   ⏱️  Time: ${result.stats.total_duration_seconds.toFixed(1)}s`);
            console.log(`   📧 Emails: ${result.dataQuality.real_emails_found}`);
            console.log(`   📱 Phones: ${result.dataQuality.real_phones_found}`);
        } else {
            console.log(`❌ ${pipeline.toUpperCase()}: ${result.error}`);
        }
    });
    
    console.log('\n🎯 AUDIT READY!');
    console.log('All CSV files have been saved to your desktop for review.');
    console.log('You can now compare the data quality and completeness across all 3 pipeline types.');
    
    return results;
}

// Run the test
testAllPipelines().catch(console.error);
