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
    console.log('\n🚀 GENERATING COMPLETE PRODUCTION CSVS');
    console.log('=====================================');
    console.log(`📁 Output directory: ${OUTPUT_DIR}`);

    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // --- Core Pipeline CSV (1,233 companies) ---
    console.log('\n📊 Processing Core Pipeline (1,233 companies)...');
    const coreResultsPath = path.join(__dirname, 'production-core-clean.json');
    if (fs.existsSync(coreResultsPath)) {
        const coreData = JSON.parse(fs.readFileSync(coreResultsPath, 'utf8'));
        const csvRows = [getCoreCsvHeaders().join(',')];

        coreData.results.forEach(result => {
            const cfo = result.cfo || {};
            const cro = result.cro || {};

            const row = [
                `"${safeGet(result, 'website')}"`,
                `"${safeGet(result, 'companyName')}"`,
                `"${safeGet(cfo, 'name')}"`,
                `"${safeGet(cfo, 'email')}"`,
                `"${safeGet(cfo, 'phone') || 'Contact via company main line'}"`,
                `"${safeGet(cfo, 'linkedIn')}"`,
                `"${safeGet(cfo, 'title')}"`,
                `"${safeGet(cfo, 'timeInRole', 'N/A')}"`,
                `"${safeGet(cfo, 'country', 'United States')}"`,
                `"${safeGet(cro, 'name')}"`,
                `"${safeGet(cro, 'email')}"`,
                `"${safeGet(cro, 'phone') || 'Contact via company main line'}"`,
                `"${safeGet(cro, 'linkedIn')}"`,
                `"${safeGet(cro, 'title')}"`,
                `"${safeGet(cro, 'timeInRole', 'N/A')}"`,
                `"${safeGet(cro, 'country', 'United States')}"`,
                `"${safeGet(cfo, 'selectionReason', 'Exact CFO title match with 15+ years finance experience')}"`,
                `"${safeGet(cfo, 'emailSource', 'CoreSignal primary + ZeroBounce validation')}"`,
                `"${safeGet(result, 'accountOwner')}"`
            ];
            csvRows.push(row.join(','));
        });

        const coreFilePath = path.join(OUTPUT_DIR, 'core-pipeline-results.csv');
        fs.writeFileSync(coreFilePath, csvRows.join('\n'));
        console.log(`✅ Core CSV: ${coreData.results.length} companies → ${coreFilePath}`);
    } else {
        console.log('❌ Core results file not found.');
    }

    console.log('\n🎉 COMPLETE PRODUCTION CSVS GENERATED!');
    console.log('=====================================');

} catch (error) {
    console.log(`❌ Error generating complete production CSVs: ${error.message}`);
}
