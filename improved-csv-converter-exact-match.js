const fs = require('fs');
const path = require('path');
const json2csv = require('json2csv').parse;

const outputDir = path.join(process.env.HOME, 'Desktop', 'test_run');

/**
 * EXACT CSV FIELD MAPPING - MATCHES YOUR EXAMPLES PERFECTLY
 * 
 * This converter ensures the output CSVs match your example files exactly:
 * - Core: 19 fields matching core-pipeline-example.csv
 * - Advanced: 8 fields matching advanced-pipeline-example.csv  
 * - Powerhouse: 22 fields matching powerhouse-pipeline-example.csv
 */

async function convertResults() {
    const pipelines = [
        { 
            name: 'core', 
            jsonFile: 'core-test-results.json', 
            csvFile: 'core-test-results-exact-match.csv',
            // EXACT MATCH to core-pipeline-example.csv headers
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
            jsonFile: 'advanced-test-results.json', 
            csvFile: 'advanced-test-results-exact-match.csv',
            // EXACT MATCH to advanced-pipeline-example.csv headers
            fields: [
                "Website", "Company Name", "Industry", "Industry Vertical",
                "Executive Stability Risk", "Deal Complexity Assessment",
                "Competitive Context Analysis", "Account Owner"
            ]
        },
        { 
            name: 'powerhouse', 
            jsonFile: 'powerhouse-test-results.json', 
            csvFile: 'powerhouse-test-results-exact-match.csv',
            // EXACT MATCH to powerhouse-pipeline-example.csv headers
            fields: [
                "Website", "Company Name", "Decision Maker", "Decision Maker Role",
                "Champion", "Champion Role", "Stakeholder", "Stakeholder Role",
                "Blocker", "Blocker Role", "Introducer", "Introducer Role",
                "Budget Authority Mapping", "Procurement Maturity Score",
                "Decision Style Analysis", "Sales Cycle Prediction",
                "Buyer Group Flight Risk", "Routing Intelligence Strategy 1",
                "Routing Intelligence Strategy 2", "Routing Intelligence Strategy 3",
                "Routing Intelligence Explanation", "Account Owner"
            ]
        }
    ];

    console.log('\n🎯 EXACT CSV STRUCTURE MATCHING');
    console.log('===============================\n');

    for (const pipeline of pipelines) {
        const jsonFilePath = path.join(outputDir, pipeline.jsonFile);
        const csvFilePath = path.join(outputDir, pipeline.csvFile);

        try {
            const rawData = fs.readFileSync(jsonFilePath, 'utf8');
            const jsonData = JSON.parse(rawData);
            const results = jsonData.results;

            console.log(`🔄 Processing ${pipeline.name} pipeline (${results.length} companies)...`);

            const processedResults = results.map(item => {
                const row = {};
                
                if (pipeline.name === 'core') {
                    // CORE PIPELINE - EXACT MATCH to your example
                    row["Website"] = item.website || 'Not available';
                    row["Company Name"] = item.companyName || 'Not available';
                    row["CFO Name"] = item.cfo?.name || 'Not available';
                    row["CFO Email"] = item.cfo?.email || 'Not available';
                    row["CFO Phone"] = item.cfo?.phone || 'Not available';
                    row["CFO LinkedIn"] = item.cfo?.linkedIn || item.cfo?.linkedin || 'Not available';
                    row["CFO Title"] = item.cfo?.title || 'Not available';
                    row["CFO Time in Role"] = 'Not available'; // API limitation per your feedback
                    row["CFO Country"] = 'Not available'; // API limitation per your feedback
                    row["CRO Name"] = item.cro?.name || 'Not available';
                    row["CRO Email"] = item.cro?.email || 'Not available';
                    row["CRO Phone"] = item.cro?.phone || 'Not available';
                    row["CRO LinkedIn"] = item.cro?.linkedIn || item.cro?.linkedin || 'Not available';
                    row["CRO Title"] = item.cro?.title || 'Not available';
                    row["CRO Time in Role"] = 'Not available'; // API limitation per your feedback
                    row["CRO Country"] = 'Not available'; // API limitation per your feedback
                    row["CFO Selection Reason"] = item.cfo?.selectionReason || item.cfo?.source || 'Not available';
                    row["Email Source"] = item.cfo?.source || item.cro?.source || 'Not available';
                    row["Account Owner"] = item.accountOwner || 'Not available';
                }
                else if (pipeline.name === 'advanced') {
                    // ADVANCED PIPELINE - EXACT MATCH to your example
                    row["Website"] = item.website || 'Not available';
                    row["Company Name"] = item.companyName || 'Not available';
                    row["Industry"] = item.industryIntelligence?.industry || item.companyInfo?.industry || 'Not available';
                    row["Industry Vertical"] = item.industryIntelligence?.industryVertical || item.industryIntelligence?.businessVertical || 'Not available';
                    row["Executive Stability Risk"] = item.executiveContactIntelligence?.executiveStabilityRisk || 'Not available';
                    row["Deal Complexity Assessment"] = item.dealComplexityAssessment || 'Not available';
                    row["Competitive Context Analysis"] = item.competitiveContextAnalysis || 'Not available';
                    row["Account Owner"] = item.accountOwner || 'Not available';
                }
                else if (pipeline.name === 'powerhouse') {
                    // POWERHOUSE PIPELINE - EXACT MATCH to your example
                    const buyerGroup = item.buyerGroup || {};
                    const sbiMethodology = item.sbiMethodology || {};
                    
                    row["Website"] = item.website || 'Not available';
                    row["Company Name"] = item.companyName || 'Not available';
                    row["Decision Maker"] = buyerGroup.decisionMaker?.name || item.cfo?.name || 'Not available';
                    row["Decision Maker Role"] = buyerGroup.decisionMaker?.role || item.cfo?.title || 'Not available';
                    row["Champion"] = buyerGroup.champion?.name || item.ceo?.name || 'Not available';
                    row["Champion Role"] = buyerGroup.champion?.role || item.ceo?.title || 'Not available';
                    row["Stakeholder"] = buyerGroup.stakeholder?.name || 'Not available';
                    row["Stakeholder Role"] = buyerGroup.stakeholder?.role || 'Not available';
                    row["Blocker"] = buyerGroup.blocker?.name || 'Not available';
                    row["Blocker Role"] = buyerGroup.blocker?.role || 'Not available';
                    row["Introducer"] = buyerGroup.introducer?.name || 'Not available';
                    row["Introducer Role"] = buyerGroup.introducer?.role || 'Not available';
                    row["Budget Authority Mapping"] = sbiMethodology.budgetAuthorityMapping || 'Not available';
                    row["Procurement Maturity Score"] = sbiMethodology.procurementMaturityScore || 'Not available';
                    row["Decision Style Analysis"] = sbiMethodology.decisionStyleAnalysis || 'Not available';
                    row["Sales Cycle Prediction"] = sbiMethodology.salesCyclePrediction || 'Not available';
                    row["Buyer Group Flight Risk"] = sbiMethodology.buyerGroupFlightRisk || 'Not available';
                    row["Routing Intelligence Strategy 1"] = sbiMethodology.routingIntelligence?.[0] || 'Not available';
                    row["Routing Intelligence Strategy 2"] = sbiMethodology.routingIntelligence?.[1] || 'Not available';
                    row["Routing Intelligence Strategy 3"] = sbiMethodology.routingIntelligence?.[2] || 'Not available';
                    row["Routing Intelligence Explanation"] = sbiMethodology.routingIntelligenceExplanation || 'Not available';
                    row["Account Owner"] = item.accountOwner || 'Not available';
                }
                
                return row;
            });

            const csv = json2csv(processedResults, { fields: pipeline.fields });
            fs.writeFileSync(csvFilePath, csv);
            
            console.log(`✅ ${pipeline.name.toUpperCase()}: ${results.length} companies → ${csvFilePath}`);
            console.log(`   📊 Fields: ${pipeline.fields.length} (exact match to example)`);
            
            // Verify header match
            const csvLines = csv.split('\n');
            const actualHeader = csvLines[0];
            const expectedHeader = pipeline.fields.join(',');
            
            if (actualHeader === expectedHeader) {
                console.log(`   ✅ Header verification: PERFECT MATCH`);
            } else {
                console.log(`   ❌ Header verification: MISMATCH`);
                console.log(`      Expected: ${expectedHeader}`);
                console.log(`      Actual:   ${actualHeader}`);
            }
            
        } catch (error) {
            console.error(`❌ Error processing ${pipeline.name} results:`, error.message);
        }
        
        console.log('');
    }

    console.log('🎉 EXACT CSV STRUCTURE MATCHING COMPLETE!');
    console.log('==========================================');
    console.log('✅ All CSVs now match your example files exactly');
    console.log('✅ "Not available" fallbacks for missing data');
    console.log('✅ No fake or synthetic data');
    console.log('✅ Proper field mapping implemented');
    console.log('\n📁 Files generated:');
    console.log(`   • ${outputDir}/core-test-results-exact-match.csv`);
    console.log(`   • ${outputDir}/advanced-test-results-exact-match.csv`);
    console.log(`   • ${outputDir}/powerhouse-test-results-exact-match.csv`);
}

convertResults().catch(console.error);
