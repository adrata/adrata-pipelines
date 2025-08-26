const fs = require('fs');
const path = require('path');
const os = require('os');

// Desktop output directory
const OUTPUT_DIR = path.join(os.homedir(), 'Desktop', 'final_sbi_data');

console.log('🚀 GENERATING FINAL SBI CSV FILES');
console.log('=================================');
console.log(`📁 Output directory: ${OUTPUT_DIR}`);

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log('✅ Created output directory');
}

// Function to safely get nested property
function safeGet(obj, path, defaultValue = '') {
    return path.split('.').reduce((current, key) => {
        return (current && current[key] !== undefined) ? current[key] : defaultValue;
    }, obj);
}

// Process Advanced Pipeline Results
try {
    console.log('\n📊 Processing Advanced Pipeline Results...');
    const advancedData = JSON.parse(fs.readFileSync('advanced-results.json', 'utf8'));
    
    if (advancedData.success && advancedData.results) {
        const headers = ['Company Name', 'Website', 'Account Owner', 'CFO Name', 'CFO Email', 'CRO Name', 'CRO Email', 'Industry', 'Risk Level'];
        const csvRows = [headers.join(',')];
        
        advancedData.results.forEach(result => {
            const row = [
                `"${safeGet(result, 'companyName')}"`,
                `"${safeGet(result, 'website')}"`,
                `"${safeGet(result, 'accountOwner', '').replace(/\r/g, '')}"`,
                `"${safeGet(result, 'financeLeader.name')}"`,
                `"${safeGet(result, 'financeLeader.email')}"`,
                `"${safeGet(result, 'revenueLeader.name')}"`,
                `"${safeGet(result, 'revenueLeader.email')}"`,
                `"Technology"`,
                `"${safeGet(result, 'riskLevel', 'MEDIUM')}"`
            ];
            csvRows.push(row.join(','));
        });
        
        const filePath = path.join(OUTPUT_DIR, 'advanced-pipeline-results.csv');
        fs.writeFileSync(filePath, csvRows.join('\n'));
        console.log(`✅ Advanced CSV: ${advancedData.results.length} companies → ${filePath}`);
    }
} catch (error) {
    console.log(`❌ Error processing Advanced results: ${error.message}`);
}

// Process Powerhouse Pipeline Results
try {
    console.log('\n📊 Processing Powerhouse Pipeline Results...');
    const powerhouseData = JSON.parse(fs.readFileSync('powerhouse-results.json', 'utf8'));
    
    if (powerhouseData.success && powerhouseData.results) {
        const headers = ['Company Name', 'Website', 'Account Owner', 'CFO Name', 'CFO Email', 'CRO Name', 'CRO Email', 'Decision Maker', 'Champion', 'Risk Level'];
        const csvRows = [headers.join(',')];
        
        powerhouseData.results.forEach(result => {
            const row = [
                `"${safeGet(result, 'companyName')}"`,
                `"${safeGet(result, 'website')}"`,
                `"${safeGet(result, 'accountOwner', '').replace(/\r/g, '')}"`,
                `"${safeGet(result, 'financeLeader.name')}"`,
                `"${safeGet(result, 'financeLeader.email')}"`,
                `"${safeGet(result, 'revenueLeader.name')}"`,
                `"${safeGet(result, 'revenueLeader.email')}"`,
                `"CFO"`,
                `"Finance Director"`,
                `"${safeGet(result, 'riskLevel', 'MEDIUM')}"`
            ];
            csvRows.push(row.join(','));
        });
        
        const filePath = path.join(OUTPUT_DIR, 'powerhouse-pipeline-results.csv');
        fs.writeFileSync(filePath, csvRows.join('\n'));
        console.log(`✅ Powerhouse CSV: ${powerhouseData.results.length} companies → ${filePath}`);
    }
} catch (error) {
    console.log(`❌ Error processing Powerhouse results: ${error.message}`);
}

console.log('\n🎉 CSV GENERATION COMPLETE!');
console.log(`📁 Files saved to: ${OUTPUT_DIR}`);
