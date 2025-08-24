#!/usr/bin/env node

/**
 * CSV COLUMN VALIDATION SCRIPT
 * Validates that our API output matches the exact core-pipeline-example.csv format
 */

const fetch = require('node-fetch');

// Expected columns from core-pipeline-example.csv
const EXPECTED_COLUMNS = [
    'Website',
    'Company Name', 
    'CFO Name',
    'CFO Email',
    'CFO Phone',
    'CFO LinkedIn',
    'CFO Title',
    'CFO Time in Role',
    'CFO Country',
    'CRO Name',
    'CRO Email', 
    'CRO Phone',
    'CRO LinkedIn',
    'CRO Title',
    'CRO Time in Role',
    'CRO Country',
    'CFO Selection Reason',
    'Email Source',
    'Account Owner'
];

async function validateCSVColumns() {
    console.log('📊 CSV COLUMN VALIDATION');
    console.log('========================');
    console.log(`Expected columns (${EXPECTED_COLUMNS.length}):`, EXPECTED_COLUMNS);
    console.log('');
    
    try {
        const response = await fetch('https://adrata-pipelines-1u4z03p4x-adrata.vercel.app/api/complete-csv', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                companies: [
                    {
                        companyName: 'Salesforce',
                        domain: 'salesforce.com',
                        'Account Owner': 'Dan Mirolli'
                    }
                ],
                pipelineType: 'core'
            }),
            timeout: 60000
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.results || data.results.length === 0) {
            throw new Error('No results returned');
        }
        
        const result = data.results[0];
        const actualColumns = Object.keys(result).filter(key => 
            !['success', 'processingTime', 'confidence', 'timestamp', 'method', 'index'].includes(key)
        );
        
        console.log(`Actual columns (${actualColumns.length}):`, actualColumns);
        console.log('');
        
        // Check for missing columns
        const missingColumns = EXPECTED_COLUMNS.filter(col => !actualColumns.includes(col));
        const extraColumns = actualColumns.filter(col => !EXPECTED_COLUMNS.includes(col));
        
        console.log('📋 VALIDATION RESULTS:');
        console.log('======================');
        
        if (missingColumns.length === 0 && extraColumns.length === 0) {
            console.log('✅ PERFECT MATCH! All columns present and correct.');
        } else {
            if (missingColumns.length > 0) {
                console.log('❌ Missing columns:', missingColumns);
            }
            if (extraColumns.length > 0) {
                console.log('⚠️ Extra columns:', extraColumns);
            }
        }
        
        console.log('');
        console.log('📊 SAMPLE DATA:');
        console.log('================');
        EXPECTED_COLUMNS.forEach(col => {
            const value = result[col];
            console.log(`${col}: ${value || 'NULL'}`);
        });
        
        console.log('');
        console.log('📈 SUMMARY:');
        console.log(`• Expected: ${EXPECTED_COLUMNS.length} columns`);
        console.log(`• Actual: ${actualColumns.length} columns`);
        console.log(`• Missing: ${missingColumns.length}`);
        console.log(`• Extra: ${extraColumns.length}`);
        console.log(`• Match: ${missingColumns.length === 0 && extraColumns.length === 0 ? 'YES' : 'NO'}`);
        
    } catch (error) {
        console.error('❌ Validation failed:', error.message);
        process.exit(1);
    }
}

// Run validation
validateCSVColumns();
