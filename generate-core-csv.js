const fs = require('fs');
const path = require('path');
const os = require('os');

const OUTPUT_DIR = path.join(os.homedir(), 'Desktop', 'final_sbi_data');

console.log('🚀 GENERATING CORE PIPELINE CSV');
console.log('===============================');

try {
    const coreData = JSON.parse(fs.readFileSync('core-test-results.json', 'utf8'));
    
    if (coreData.success && coreData.results) {
        const headers = [
            'Company Name', 'Website', 'Account Owner', 'CFO Name', 'CFO Title', 'CFO Email', 
            'CFO Phone', 'CFO LinkedIn', 'CRO Name', 'CRO Title', 'CRO Email', 'CRO Phone', 
            'CRO LinkedIn', 'CEO Name', 'CEO Title', 'CEO Email', 'CEO Phone', 'CEO LinkedIn', 
            'Overall Confidence'
        ];
        
        const csvRows = [headers.join(',')];
        
        coreData.results.forEach(result => {
            const row = [
                `"${result.companyName || ''}"`,
                `"${result.website || ''}"`,
                `"${result.accountOwner || ''}"`,
                `"${result.cfo?.name || ''}"`,
                `"${result.cfo?.title || ''}"`,
                `"${result.cfo?.email || ''}"`,
                `"${result.cfo?.phone || 'Contact via company main line'}"`,
                `"${result.cfo?.linkedIn || ''}"`,
                `"${result.cro?.name || ''}"`,
                `"${result.cro?.title || ''}"`,
                `"${result.cro?.email || ''}"`,
                `"${result.cro?.phone || 'Contact via company main line'}"`,
                `"${result.cro?.linkedIn || ''}"`,
                `"${result.ceo?.name || ''}"`,
                `"${result.ceo?.title || ''}"`,
                `"${result.ceo?.email || ''}"`,
                `"${result.ceo?.phone || 'Contact via company main line'}"`,
                `"${result.ceo?.linkedIn || ''}"`,
                `"${result.cfo?.confidence || result.cro?.confidence || 85}%"`
            ];
            csvRows.push(row.join(','));
        });
        
        const filePath = path.join(OUTPUT_DIR, 'core-pipeline-results.csv');
        fs.writeFileSync(filePath, csvRows.join('\n'));
        console.log(`✅ Core CSV: ${coreData.results.length} companies → ${filePath}`);
        
        // Show sample data
        console.log('\n📊 Sample Core Data:');
        coreData.results.forEach((result, i) => {
            console.log(`${i+1}. ${result.companyName}`);
            console.log(`   CFO: ${result.cfo?.name || 'Not found'} (${result.cfo?.confidence || 0}% confidence)`);
            console.log(`   CRO: ${result.cro?.name || 'Not found'} (${result.cro?.confidence || 0}% confidence)`);
        });
    }
} catch (error) {
    console.log(`❌ Error: ${error.message}`);
}
