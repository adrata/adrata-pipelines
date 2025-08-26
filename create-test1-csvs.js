const fs = require('fs');
const path = require('path');
const { parse } = require('json2csv');

const testDir = path.join(process.env.HOME, 'Desktop', 'test_1');

function extractCleanJSON(rawData) {
    try {
        // Remove curl progress output and extract JSON
        const lines = rawData.split('\n');
        let jsonStart = -1;
        let jsonEnd = -1;
        
        // Find start of JSON
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim().startsWith('{')) {
                jsonStart = i;
                break;
            }
        }
        
        if (jsonStart === -1) {
            // Try to find JSON in the middle of the content
            const jsonMatch = rawData.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return jsonMatch[0];
            }
            return null;
        }
        
        // Find end of JSON
        for (let i = lines.length - 1; i >= 0; i--) {
            if (lines[i].trim().endsWith('}')) {
                jsonEnd = i;
                break;
            }
        }
        
        if (jsonEnd === -1) return null;
        
        const jsonLines = lines.slice(jsonStart, jsonEnd + 1);
        return jsonLines.join('\n');
    } catch (error) {
        console.error(`Error extracting JSON: ${error.message}`);
        return null;
    }
}

async function createCleanCSVs() {
    console.log('\n🎯 CREATING CLEAN CSV FILES FOR TEST_1');
    console.log('======================================');
    
    const pipelines = [
        {
            name: 'core',
            rawFile: 'core-pipeline-raw.json',
            csvFile: 'Core-Pipeline-Results.csv',
            fields: [
                "Website", "Company Name", "CFO Name", "CFO Email", "CFO Phone", 
                "CFO LinkedIn", "CFO Title", "CFO Time in Role", "CFO Country",
                "CRO Name", "CRO Email", "CRO Phone", "CRO LinkedIn", "CRO Title", 
                "CRO Time in Role", "CRO Country", "CFO Selection Reason", 
                "Email Source", "Account Owner"
            ]
        },
        {
            name: 'advanced',
            rawFile: 'advanced-pipeline-raw.json',
            csvFile: 'Advanced-Pipeline-Results.csv',
            fields: [
                "Website", "Company Name", "Industry", "Industry Vertical", 
                "Executive Stability Risk", "Deal Complexity Assessment", 
                "Competitive Context Analysis", "Corporate Structure", 
                "Acquisition History", "PE Ownership", "Strategic Partnerships",
                "Decision Hierarchy", "Procurement Maturity", "Account Owner"
            ]
        },
        {
            name: 'powerhouse',
            rawFile: 'powerhouse-pipeline-raw.json',
            csvFile: 'Powerhouse-Pipeline-Results.csv',
            fields: [
                "Website", "Company Name", "Decision Maker", "Decision Maker Role",
                "Champion", "Champion Role", "Stakeholder", "Stakeholder Role",
                "Blocker", "Blocker Role", "Introducer", "Introducer Role",
                "Budget Authority Mapping", "Procurement Maturity Score",
                "Decision Style Analysis", "Sales Cycle Prediction",
                "Buyer Group Flight Risk", "Routing Intelligence Strategy 1",
                "Routing Intelligence Strategy 2", "Routing Intelligence Strategy 3",
                "Routing Intelligence Explanation", "Deal Complexity Score",
                "Executive Stability Score", "Competitive Position", "Account Owner"
            ]
        }
    ];

    for (const pipeline of pipelines) {
        const rawFilePath = path.join(testDir, pipeline.rawFile);
        const csvFilePath = path.join(testDir, pipeline.csvFile);

        try {
            console.log(`\n📊 Processing ${pipeline.name.toUpperCase()} Pipeline...`);
            
            if (!fs.existsSync(rawFilePath)) {
                console.log(`   ⏳ Waiting for ${pipeline.rawFile}...`);
                continue;
            }

            const rawData = fs.readFileSync(rawFilePath, 'utf8');
            const cleanJSON = extractCleanJSON(rawData);
            
            if (!cleanJSON) {
                console.log(`   ❌ No valid JSON found in ${pipeline.rawFile}`);
                continue;
            }

            const jsonData = JSON.parse(cleanJSON);
            const results = jsonData.results || [];

            if (results.length === 0) {
                console.log(`   ❌ No results found in ${pipeline.name} pipeline`);
                continue;
            }

            console.log(`   ✅ Found ${results.length} companies in results`);

            const processedResults = results.map(item => {
                const row = {};

                if (pipeline.name === 'core') {
                    // Core Pipeline Mapping
                    row["Website"] = item.website || 'Not available';
                    row["Company Name"] = item.companyName || 'Not available';
                    row["CFO Name"] = item.cfo?.name || 'Not available';
                    row["CFO Email"] = item.cfo?.email || 'Not available';
                    row["CFO Phone"] = item.cfo?.phone || 'Not available';
                    row["CFO LinkedIn"] = item.cfo?.linkedIn || 'Not available';
                    row["CFO Title"] = item.cfo?.title || 'Not available';
                    row["CFO Time in Role"] = 'Not available'; // API limitation
                    row["CFO Country"] = 'Not available'; // API limitation
                    row["CRO Name"] = item.cro?.name || 'Not available';
                    row["CRO Email"] = item.cro?.email || 'Not available';
                    row["CRO Phone"] = item.cro?.phone || 'Not available';
                    row["CRO LinkedIn"] = item.cro?.linkedIn || 'Not available';
                    row["CRO Title"] = item.cro?.title || 'Not available';
                    row["CRO Time in Role"] = 'Not available'; // API limitation
                    row["CRO Country"] = 'Not available'; // API limitation
                    row["CFO Selection Reason"] = item.cfo?.source || 'Not available';
                    row["Email Source"] = item.cfo?.source || 'Not available';
                    row["Account Owner"] = item.accountOwner || 'Not available';
                } else if (pipeline.name === 'advanced') {
                    // Advanced Pipeline Mapping
                    row["Website"] = item.website || 'Not available';
                    row["Company Name"] = item.companyName || 'Not available';
                    row["Industry"] = item.companyDetails?.industry || item.industryIntelligence?.industryClassification?.primaryIndustry || 'Not available';
                    row["Industry Vertical"] = item.industryIntelligence?.industryClassification?.businessVertical || 'Not available';
                    row["Executive Stability Risk"] = item.executiveContactIntelligence?.executiveMovements?.executiveStabilityScore || 'Not available';
                    row["Deal Complexity Assessment"] = item.buyerGroupIntelligence?.buyerGroup?.complexity || item.industryIntelligence?.dealComplexity || 'Not available';
                    row["Competitive Context Analysis"] = item.industryIntelligence?.competitorIntelligence?.competitivePosition || 'Not available';
                    row["Corporate Structure"] = item.corporateStructure?.structure || 'Not available';
                    row["Acquisition History"] = item.corporateStructure?.acquisitions?.length > 0 ? `${item.corporateStructure.acquisitions.length} acquisitions` : 'Not available';
                    row["PE Ownership"] = item.corporateStructure?.peOwnership || 'Not available';
                    row["Strategic Partnerships"] = item.corporateStructure?.partnerships?.length > 0 ? `${item.corporateStructure.partnerships.length} partnerships` : 'Not available';
                    row["Decision Hierarchy"] = item.buyerGroupIntelligence?.decisionHierarchy || 'Not available';
                    row["Procurement Maturity"] = item.buyerGroupIntelligence?.procurementMaturity || 'Not available';
                    row["Account Owner"] = item.accountOwner || 'Not available';
                } else if (pipeline.name === 'powerhouse') {
                    // Powerhouse Pipeline Mapping
                    row["Website"] = item.website || 'Not available';
                    row["Company Name"] = item.companyName || 'Not available';
                    row["Decision Maker"] = item.buyerGroupIntelligence?.buyerGroup?.decisionMaker?.name || 'Not available';
                    row["Decision Maker Role"] = item.buyerGroupIntelligence?.buyerGroup?.decisionMaker?.title || 'Not available';
                    row["Champion"] = item.buyerGroupIntelligence?.buyerGroup?.champion?.name || 'Not available';
                    row["Champion Role"] = item.buyerGroupIntelligence?.buyerGroup?.champion?.title || 'Not available';
                    row["Stakeholder"] = item.buyerGroupIntelligence?.buyerGroup?.stakeholder?.name || 'Not available';
                    row["Stakeholder Role"] = item.buyerGroupIntelligence?.buyerGroup?.stakeholder?.title || 'Not available';
                    row["Blocker"] = item.buyerGroupIntelligence?.buyerGroup?.blocker?.name || 'Not available';
                    row["Blocker Role"] = item.buyerGroupIntelligence?.buyerGroup?.blocker?.title || 'Not available';
                    row["Introducer"] = item.buyerGroupIntelligence?.buyerGroup?.introducer?.name || 'Not available';
                    row["Introducer Role"] = item.buyerGroupIntelligence?.buyerGroup?.introducer?.title || 'Not available';
                    row["Budget Authority Mapping"] = item.buyerGroupIntelligence?.salesStrategy?.budgetAuthorityMapping || 'Not available';
                    row["Procurement Maturity Score"] = item.buyerGroupIntelligence?.salesStrategy?.procurementMaturityScore || 'Not available';
                    row["Decision Style Analysis"] = item.buyerGroupIntelligence?.salesStrategy?.decisionStyleAnalysis || 'Not available';
                    row["Sales Cycle Prediction"] = item.buyerGroupIntelligence?.salesStrategy?.salesCyclePrediction || 'Not available';
                    row["Buyer Group Flight Risk"] = item.buyerGroupIntelligence?.salesStrategy?.buyerGroupFlightRisk || 'Not available';
                    row["Routing Intelligence Strategy 1"] = item.buyerGroupIntelligence?.salesStrategy?.routingIntelligence?.[0] || 'Not available';
                    row["Routing Intelligence Strategy 2"] = item.buyerGroupIntelligence?.salesStrategy?.routingIntelligence?.[1] || 'Not available';
                    row["Routing Intelligence Strategy 3"] = item.buyerGroupIntelligence?.salesStrategy?.routingIntelligence?.[2] || 'Not available';
                    row["Routing Intelligence Explanation"] = item.buyerGroupIntelligence?.salesStrategy?.routingIntelligenceExplanation || 'Not available';
                    row["Deal Complexity Score"] = item.buyerGroupIntelligence?.dealComplexityScore || 'Not available';
                    row["Executive Stability Score"] = item.executiveContactIntelligence?.executiveStabilityScore || 'Not available';
                    row["Competitive Position"] = item.industryIntelligence?.competitivePosition || 'Not available';
                    row["Account Owner"] = item.accountOwner || 'Not available';
                }

                return row;
            });

            const csv = parse(processedResults, { fields: pipeline.fields });
            fs.writeFileSync(csvFilePath, csv);
            
            console.log(`   ✅ Created: ${pipeline.csvFile} (${processedResults.length} rows)`);

        } catch (error) {
            console.error(`   ❌ Error processing ${pipeline.name}: ${error.message}`);
        }
    }

    console.log('\n🎉 CSV GENERATION COMPLETE!');
    console.log('===========================');
    console.log(`📁 All files saved to: ~/Desktop/test_1/`);
    console.log('📊 Ready for client delivery!');
}

// Run the CSV creation
createCleanCSVs();
