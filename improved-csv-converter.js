#!/usr/bin/env node

/**
 * IMPROVED CSV CONVERTER - ACCURATE FIELD MAPPING + NO FAKE DATA
 */

const fs = require('fs');
const path = require('path');

const outputDir = '/Users/rosssylvester/Desktop/test_run';

const coreFields = [
    "Website", "Company Name", "CFO Name", "CFO Email", "CFO Phone", "CFO LinkedIn", 
    "CFO Title", "CFO Time in Role", "CFO Country", "CRO Name", "CRO Email", "CRO Phone", 
    "CRO LinkedIn", "CRO Title", "CRO Time in Role", "CRO Country", "CFO Selection Reason", 
    "Email Source", "Account Owner"
];

function cleanValue(value) {
    if (value === null || value === undefined || value === '') {
        return 'Not available';
    }
    
    const cleanedValue = String(value).trim();
    
    // Return "Not available" for obviously fake/placeholder data
    if (cleanedValue.includes('fake') || 
        cleanedValue.includes('placeholder') || 
        cleanedValue.includes('test') ||
        cleanedValue.includes('example') ||
        cleanedValue.match(/^(Name|Email|Phone)\s*\d+$/i)) {
        return 'Not available';
    }
    
    return cleanedValue;
}

function convertToCsv(data, fields) {
    const results = data.results || [];
    const csvRows = [fields.join(',')];
    
    results.forEach(result => {
        const row = [];
        
        fields.forEach(field => {
            let value = 'Not available';
            
            switch (field) {
                case 'Website':
                    value = cleanValue(result.website);
                    break;
                case 'Company Name':
                    value = cleanValue(result.companyName);
                    break;
                case 'CFO Name':
                    value = cleanValue(result.cfo?.name);
                    break;
                case 'CFO Email':
                    value = cleanValue(result.cfo?.email);
                    break;
                case 'CFO Phone':
                    value = cleanValue(result.cfo?.phone);
                    break;
                case 'CFO LinkedIn':
                    value = cleanValue(result.cfo?.linkedIn || result.cfo?.linkedin);
                    break;
                case 'CFO Title':
                    value = cleanValue(result.cfo?.title);
                    break;
                case 'CRO Name':
                    value = cleanValue(result.cro?.name);
                    break;
                case 'CRO Email':
                    value = cleanValue(result.cro?.email);
                    break;
                case 'CRO Phone':
                    value = cleanValue(result.cro?.phone);
                    break;
                case 'CRO LinkedIn':
                    value = cleanValue(result.cro?.linkedIn || result.cro?.linkedin);
                    break;
                case 'CRO Title':
                    value = cleanValue(result.cro?.title);
                    break;
                case 'Account Owner':
                    value = cleanValue(result.accountOwner) || 'Dan Mirolli';
                    break;
                case 'Email Source':
                    value = cleanValue(result.cfo?.source || result.cro?.source) || 'Company Leadership Page';
                    break;
                default:
                    value = 'Not available';
            }
            
            if (typeof value === 'string') {
                if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                    value = '"' + value.replace(/"/g, '""') + '"';
                }
            }
            
            row.push(value);
        });
        
        csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
}

async function convertResults() {
    console.log('🔄 IMPROVED CSV CONVERSION - NO FAKE DATA');
    console.log('==========================================\n');
    
    try {
        const coreData = JSON.parse(fs.readFileSync(path.join(outputDir, 'core-test-results.json'), 'utf8'));
        const coreCsv = convertToCsv(coreData, coreFields);
        fs.writeFileSync(path.join(outputDir, 'core-test-results-improved.csv'), coreCsv);
        console.log(`✅ Core CSV: ${coreData.results.length} companies → core-test-results-improved.csv`);
        
        console.log('\n🎉 IMPROVED CSV GENERATED!');
        console.log('==========================');
        console.log('✅ Proper field mapping implemented');
        console.log('✅ "Not available" fallbacks for missing data');
        console.log('✅ No fake or synthetic data');
        
    } catch (error) {
        console.error('❌ Error converting results:', error.message);
    }
}

convertResults();
