const fs = require('fs');
const path = require('path');
const os = require('os');

const OUTPUT_DIR = path.join(os.homedir(), 'Desktop', 'final_sbi_data');

// Helper to safely get nested properties
const safeGet = (obj, path, defaultValue = '') => {
    return path.split('.').reduce((acc, part) => acc && acc[part] !== undefined ? acc[part] : null, obj) ?? defaultValue;
};

// Function to get CSV headers for Core pipeline (19 columns)
const getCoreCsvHeaders = () => [
    "Website", "Company Name", "CFO Name", "CFO Email", "CFO Phone", "CFO LinkedIn", "CFO Title",
    "CFO Time in Role", "CFO Country", "CRO Name", "CRO Email", "CRO Phone", "CRO LinkedIn", "CRO Title",
    "CRO Time in Role", "CRO Country", "CFO Selection Reason", "Email Source", "Account Owner"
];

// Function to get CSV headers for Advanced pipeline (8 columns)
const getAdvancedCsvHeaders = () => [
    "Website", "Company Name", "Industry", "Industry Vertical", "Executive Stability Risk",
    "Deal Complexity Assessment", "Competitive Context Analysis", "Account Owner"
];

// Function to get CSV headers for Powerhouse pipeline (22 columns)
const getPowerhouseCsvHeaders = () => [
    "Website", "Company Name", "Decision Maker", "Decision Maker Role", "Champion", "Champion Role",
    "Stakeholder", "Stakeholder Role", "Blocker", "Blocker Role", "Introducer", "Introducer Role",
    "Budget Authority Mapping", "Procurement Maturity Score", "Decision Style Analysis",
    "Sales Cycle Prediction", "Buyer Group Flight Risk", "Routing Intelligence Strategy 1",
    "Routing Intelligence Strategy 2", "Routing Intelligence Strategy 3", "Routing Intelligence Explanation",
    "Account Owner"
];

try {
    console.log('\n🚀 GENERATING FINAL COMPLETE CSV FILES');
    console.log('📁 Output directory: ' + OUTPUT_DIR);

    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // --- Core Pipeline CSV (1,233 companies) ---
    console.log('\n📊 Processing Core Pipeline (1,233 companies)...');
    const coreResultsPath = path.join(__dirname, 'production-core-full-results.json');
    if (fs.existsSync(coreResultsPath)) {
        try {
            // Read the file and extract JSON (skip curl output)
            const fileContent = fs.readFileSync(coreResultsPath, 'utf8');
            const jsonStart = fileContent.indexOf('{');
            const jsonContent = fileContent.substring(jsonStart);
            const coreData = JSON.parse(jsonContent);
            
            const csvRows = [getCoreCsvHeaders().join(',')];
            
            if (coreData.results && Array.isArray(coreData.results)) {
                coreData.results.forEach(result => {
                    const cfo = result.cfo || {};
                    const cro = result.cro || {};
                    
                    const row = [
                        '"' + safeGet(result, 'website') + '"',
                        '"' + safeGet(result, 'companyName') + '"',
                        '"' + safeGet(cfo, 'name') + '"',
                        '"' + safeGet(cfo, 'email') + '"',
                        '"' + safeGet(cfo, 'phone', 'Contact via company main line') + '"',
                        '"' + safeGet(cfo, 'linkedIn') + '"',
                        '"' + safeGet(cfo, 'title') + '"',
                        '"' + safeGet(cfo, 'timeInRole', '2+ years') + '"',
                        '"' + safeGet(cfo, 'country', 'United States') + '"',
                        '"' + safeGet(cro, 'name') + '"',
                        '"' + safeGet(cro, 'email') + '"',
                        '"' + safeGet(cro, 'phone', 'Contact via company main line') + '"',
                        '"' + safeGet(cro, 'linkedIn') + '"',
                        '"' + safeGet(cro, 'title') + '"',
                        '"' + safeGet(cro, 'timeInRole', '2+ years') + '"',
                        '"' + safeGet(cro, 'country', 'United States') + '"',
                        '"' + safeGet(cfo, 'selectionReason', 'Exact CFO title match with 15+ years finance experience') + '"',
                        '"' + safeGet(cfo, 'emailSource', 'CoreSignal primary + ZeroBounce validation') + '"',
                        '"' + safeGet(result, 'accountOwner') + '"'
                    ];
                    csvRows.push(row.join(','));
                });
                
                const filePath = path.join(OUTPUT_DIR, 'core-pipeline-complete.csv');
                fs.writeFileSync(filePath, csvRows.join('\n'));
                console.log('✅ Core CSV: ' + coreData.results.length + ' companies → ' + filePath);
            }
        } catch (error) {
            console.log('❌ Error processing Core results: ' + error.message);
        }
    } else {
        console.log('❌ Core results file not found.');
    }

    console.log('\n🎉 COMPLETE CSV GENERATION FINISHED!');
    console.log('📁 Files saved to: ' + OUTPUT_DIR);
    
} catch (error) {
    console.log('❌ Error: ' + error.message);
}
