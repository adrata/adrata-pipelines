#!/usr/bin/env node

const fetch = require('node-fetch');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

async function runPowerhouse() {
    console.log('🚀 Running POWERHOUSE pipeline...');
    
    const response = await fetch('https://adrata-pipelines-92pp7p9gz-adrata.vercel.app/api/vercel-optimized', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            pipeline: 'powerhouse',
            companies: [{
                companyName: 'Microsoft Corporation',
                domain: 'microsoft.com',
                accountOwner: 'Dan Mirolli'
            }]
        })
    });
    
    const result = await response.json();
    
    if (result.success) {
        const csvHeaders = Object.keys(result.results[0] || {});
        const csvRows = result.results.map(row => 
            csvHeaders.map(header => `"${(row[header] || '').toString().replace(/"/g, '""')}"`)
        );
        
        const csvContent = [csvHeaders, ...csvRows]
            .map(row => row.join(','))
            .join('\n');
        
        const csvPath = path.join(os.homedir(), 'Desktop', 'powerhouse-pipeline-2025-08-26.csv');
        await fs.writeFile(csvPath, csvContent, 'utf8');
        
        console.log('✅ POWERHOUSE Pipeline Results:');
        console.log('   📄 CSV saved:', csvPath);
        console.log('   📊 Companies processed:', result.results.length);
        console.log('   🎯 Success rate:', result.stats.success_rate + '%');
        console.log('   ⏱️  Duration:', result.stats.total_duration_seconds.toFixed(1) + 's');
        
        if (result.results.length > 0) {
            const sample = result.results[0];
            console.log('   📋 Sample data keys:', Object.keys(sample).join(', '));
        }
    } else {
        console.log('❌ Powerhouse pipeline failed');
    }
}

runPowerhouse().catch(console.error);
