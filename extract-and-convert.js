const fs = require('fs');
const path = require('path');
const { parse } = require('json2csv');

const testDir = path.join(process.env.HOME, 'Desktop', 'test_1');

function extractJSONFromCurlOutput(rawData) {
    try {
        // Remove curl progress lines and extract JSON
        const lines = rawData.split('\n');
        let cleanLines = [];
        let inJSON = false;
        
        for (let line of lines) {
            // Skip curl progress lines
            if (line.includes('% Total') || line.includes('Dload') || line.includes('--:--:--') || line.trim() === '') {
                continue;
            }
            
            // Look for JSON start
            if (line.trim().startsWith('{')) {
                inJSON = true;
            }
            
            if (inJSON) {
                cleanLines.push(line);
            }
        }
        
        const jsonString = cleanLines.join('\n');
        
        // Try to parse the JSON
        if (jsonString.trim()) {
            return JSON.parse(jsonString);
        }
        
        return null;
    } catch (error) {
        console.error(`Error extracting JSON: ${error.message}`);
        
        // Fallback: try to find JSON pattern in the raw data
        try {
            const jsonMatch = rawData.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        } catch (fallbackError) {
            console.error(`Fallback parsing also failed: ${fallbackError.message}`);
        }
        
        return null;
    }
}

async function processAndCreateCSVs() {
    console.log('\n🎯 EXTRACTING AND CONVERTING TO CSV');
    console.log('===================================');
    
    const files = [
        {
            name: 'Core',
            rawFile: 'core-pipeline-raw.json',
            csvFile: 'Core-Pipeline-Results.csv',
            fields: [
                "Website", "Company Name", "CFO Name", "CFO Email", "CFO Phone", 
                "CFO LinkedIn", "CFO Title", "CRO Name", "CRO Email", "CRO Phone", 
                "CRO LinkedIn", "CRO Title", "Account Owner"
            ]
        },
        {
            name: 'Advanced',
            rawFile: 'advanced-pipeline-raw.json',
            csvFile: 'Advanced-Pipeline-Results.csv',
            fields: [
                "Website", "Company Name", "Industry", "Industry Vertical", 
                "Executive Stability Risk", "Deal Complexity Assessment", 
                "Account Owner"
            ]
        },
        {
            name: 'Powerhouse',
            rawFile: 'powerhouse-pipeline-raw.json',
            csvFile: 'Powerhouse-Pipeline-Results.csv',
            fields: [
                "Website", "Company Name", "Decision Maker", "Decision Maker Role",
                "Champion", "Champion Role", "Stakeholder", "Stakeholder Role",
                "Budget Authority Mapping", "Sales Cycle Prediction", "Account Owner"
            ]
        }
    ];

    for (const file of files) {
        const rawFilePath = path.join(testDir, file.rawFile);
        const csvFilePath = path.join(testDir, file.csvFile);

        try {
            console.log(`\n📊 Processing ${file.name} Pipeline...`);
            
            if (!fs.existsSync(rawFilePath)) {
                console.log(`   ❌ File not found: ${file.rawFile}`);
                continue;
            }

            const rawData = fs.readFileSync(rawFilePath, 'utf8');
            console.log(`   📄 Raw file size: ${rawData.length} characters`);
            
            const jsonData = extractJSONFromCurlOutput(rawData);
            
            if (!jsonData) {
                console.log(`   ❌ Could not extract valid JSON from ${file.rawFile}`);
                console.log(`   📝 Raw content preview: ${rawData.substring(0, 200)}...`);
                continue;
            }

            console.log(`   ✅ Successfully parsed JSON`);
            
            // Check for error in response
            if (jsonData.error) {
                console.log(`   ❌ API Error: ${jsonData.error.message}`);
                continue;
            }

            const results = jsonData.results || [];
            console.log(`   📊 Found ${results.length} companies in results`);

            if (results.length === 0) {
                console.log(`   ⚠️  No company results to process`);
                continue;
            }

            // Process results based on pipeline type
            const processedResults = results.map(item => {
                const row = {};

                if (file.name === 'Core') {
                    row["Website"] = item.website || 'Not available';
                    row["Company Name"] = item.companyName || 'Not available';
                    row["CFO Name"] = item.cfo?.name || 'Not available';
                    row["CFO Email"] = item.cfo?.email || 'Not available';
                    row["CFO Phone"] = item.cfo?.phone || 'Not available';
                    row["CFO LinkedIn"] = item.cfo?.linkedIn || 'Not available';
                    row["CFO Title"] = item.cfo?.title || 'Not available';
                    row["CRO Name"] = item.cro?.name || 'Not available';
                    row["CRO Email"] = item.cro?.email || 'Not available';
                    row["CRO Phone"] = item.cro?.phone || 'Not available';
                    row["CRO LinkedIn"] = item.cro?.linkedIn || 'Not available';
                    row["CRO Title"] = item.cro?.title || 'Not available';
                    row["Account Owner"] = item.accountOwner || 'Not available';
                } else if (file.name === 'Advanced') {
                    row["Website"] = item.website || 'Not available';
                    row["Company Name"] = item.companyName || 'Not available';
                    row["Industry"] = item.companyDetails?.industry || 'Not available';
                    row["Industry Vertical"] = item.industryIntelligence?.industryClassification?.businessVertical || 'Not available';
                    row["Executive Stability Risk"] = item.executiveContactIntelligence?.executiveStabilityScore || 'Not available';
                    row["Deal Complexity Assessment"] = item.buyerGroupIntelligence?.dealComplexityScore || 'Not available';
                    row["Account Owner"] = item.accountOwner || 'Not available';
                } else if (file.name === 'Powerhouse') {
                    row["Website"] = item.website || 'Not available';
                    row["Company Name"] = item.companyName || 'Not available';
                    row["Decision Maker"] = item.buyerGroupIntelligence?.buyerGroup?.decisionMaker?.name || 'Not available';
                    row["Decision Maker Role"] = item.buyerGroupIntelligence?.buyerGroup?.decisionMaker?.title || 'Not available';
                    row["Champion"] = item.buyerGroupIntelligence?.buyerGroup?.champion?.name || 'Not available';
                    row["Champion Role"] = item.buyerGroupIntelligence?.buyerGroup?.champion?.title || 'Not available';
                    row["Stakeholder"] = item.buyerGroupIntelligence?.buyerGroup?.stakeholder?.name || 'Not available';
                    row["Stakeholder Role"] = item.buyerGroupIntelligence?.buyerGroup?.stakeholder?.title || 'Not available';
                    row["Budget Authority Mapping"] = item.buyerGroupIntelligence?.salesStrategy?.budgetAuthorityMapping || 'Not available';
                    row["Sales Cycle Prediction"] = item.buyerGroupIntelligence?.salesStrategy?.salesCyclePrediction || 'Not available';
                    row["Account Owner"] = item.accountOwner || 'Not available';
                }

                return row;
            });

            // Generate CSV
            const csv = parse(processedResults, { fields: file.fields });
            fs.writeFileSync(csvFilePath, csv);
            
            console.log(`   ✅ Created CSV: ${file.csvFile} (${processedResults.length} rows)`);

        } catch (error) {
            console.error(`   ❌ Error processing ${file.name}: ${error.message}`);
        }
    }

    console.log('\n🎉 CSV CONVERSION COMPLETE!');
    console.log('==========================');
    console.log(`📁 Files saved to: ~/Desktop/test_1/`);
    
    // List final files
    const files_in_dir = fs.readdirSync(testDir);
    const csvFiles = files_in_dir.filter(f => f.endsWith('.csv'));
    
    console.log('\n📊 FINAL CSV FILES:');
    csvFiles.forEach(file => {
        const filePath = path.join(testDir, file);
        const stats = fs.statSync(filePath);
        console.log(`   ✅ ${file} (${stats.size} bytes)`);
    });
}

// Run the conversion
processAndCreateCSVs();
