#!/usr/bin/env node

/**
 * 🧪 TEST CSV GENERATION
 * Test CSV generation from API response
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');

async function testCSVGeneration() {
    console.log('🧪 Testing CSV Generation...');
    
    try {
        // Call the API
        const response = await fetch('https://adrata-pipelines-92pp7p9gz-adrata.vercel.app/api/vercel-optimized', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                pipeline: 'core',
                companies: [
                    {
                        companyName: "HubSpot Inc.",
                        domain: "hubspot.com",
                        accountOwner: "Dan Mirolli"
                    }
                ]
            })
        });
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error('API call failed');
        }
        
        console.log(`✅ API Response: ${result.results.length} results`);
        
        // Manually generate CSV
        const csvHeaders = Object.keys(result.results[0] || {});
        console.log(`📋 Headers: ${csvHeaders.join(', ')}`);
        
        const csvRows = result.results.map(row => 
            csvHeaders.map(header => `"${(row[header] || '').toString().replace(/"/g, '""')}"`)
        );
        
        const csvContent = [csvHeaders, ...csvRows]
            .map(row => row.join(','))
            .join('\n');
        
        console.log(`📄 CSV Content Length: ${csvContent.length} characters`);
        console.log(`📄 CSV Preview:`);
        console.log(csvContent.substring(0, 500) + '...');
        
        // Save to desktop
        const desktopPath = path.join(os.homedir(), 'Desktop');
        const csvFilename = `test-csv-${new Date().toISOString().split('T')[0]}.csv`;
        const csvPath = path.join(desktopPath, csvFilename);
        
        await fs.writeFile(csvPath, csvContent, 'utf8');
        
        console.log(`✅ CSV saved to: ${csvPath}`);
        
        return {
            success: true,
            csvPath: csvPath,
            csvContent: csvContent.substring(0, 200) + '...'
        };
        
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        return {
            success: false,
            error: error.message
        };
    }
}

testCSVGeneration().catch(console.error);
