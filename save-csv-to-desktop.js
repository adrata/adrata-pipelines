#!/usr/bin/env node

/**
 * 💾 SAVE CSV TO DESKTOP
 * Calls the Vercel pipeline API and saves CSV files to your desktop
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');

// Configuration
const VERCEL_URL = 'https://adrata-pipelines-92pp7p9gz-adrata.vercel.app/api/vercel-optimized';
const DESKTOP_PATH = path.join(os.homedir(), 'Desktop');

async function saveCSVToDesktop(pipelineType, companies, filename = null) {
    console.log(`🚀 Running ${pipelineType.toUpperCase()} pipeline for ${companies.length} companies...`);
    console.log(`📁 CSV will be saved to: ${DESKTOP_PATH}`);
    
    try {
        // Call the Vercel API
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
        
        // Save CSV to desktop
        const csvFilename = filename || result.csvFilename || `${pipelineType}-pipeline-${new Date().toISOString().split('T')[0]}.csv`;
        const csvPath = path.join(DESKTOP_PATH, csvFilename);
        
        await fs.writeFile(csvPath, result.csvData, 'utf8');
        
        console.log(`✅ CSV saved successfully!`);
        console.log(`📄 File: ${csvPath}`);
        console.log(`📊 Results: ${result.results.length} companies processed`);
        console.log(`🎯 Success Rate: ${result.stats.success_rate}%`);
        console.log(`⏱️  Duration: ${result.stats.total_duration_seconds.toFixed(1)} seconds`);
        console.log(`📧 Emails Found: ${result.data_quality.real_emails_found}`);
        
        return {
            success: true,
            csvPath: csvPath,
            stats: result.stats,
            dataQuality: result.data_quality
        };
        
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        return {
            success: false,
            error: error.message
        };
    }
}

// Example usage functions
async function runCorePipeline() {
    const companies = [
        {
            companyName: "HubSpot Inc.",
            domain: "hubspot.com",
            accountOwner: "Dan Mirolli"
        },
        {
            companyName: "Salesforce Inc.",
            domain: "salesforce.com", 
            accountOwner: "Dan Mirolli"
        }
    ];
    
    return await saveCSVToDesktop('core', companies, 'core-pipeline-test.csv');
}

async function runAdvancedPipeline() {
    const companies = [
        {
            companyName: "Microsoft Corporation",
            domain: "microsoft.com",
            accountOwner: "Dan Mirolli"
        }
    ];
    
    return await saveCSVToDesktop('advanced', companies, 'advanced-pipeline-test.csv');
}

async function runPowerhousePipeline() {
    const companies = [
        {
            companyName: "Apple Inc.",
            domain: "apple.com",
            accountOwner: "Dan Mirolli"
        }
    ];
    
    return await saveCSVToDesktop('powerhouse', companies, 'powerhouse-pipeline-test.csv');
}

// Main execution
async function main() {
    console.log('💾 CSV TO DESKTOP SCRIPT\n');
    
    // Test with Core pipeline
    console.log('🧪 Testing Core Pipeline...');
    const coreResult = await runCorePipeline();
    
    if (coreResult.success) {
        console.log('\n✅ Core pipeline test completed successfully!');
        console.log(`📄 CSV saved to: ${coreResult.csvPath}`);
    } else {
        console.log('\n❌ Core pipeline test failed');
    }
    
    console.log('\n🎯 Ready to run full production batches!');
    console.log('📝 Usage:');
    console.log('   node save-csv-to-desktop.js');
    console.log('   // Then call saveCSVToDesktop() with your company data');
}

// Export functions for use in other scripts
module.exports = {
    saveCSVToDesktop,
    runCorePipeline,
    runAdvancedPipeline,
    runPowerhousePipeline
};

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}
