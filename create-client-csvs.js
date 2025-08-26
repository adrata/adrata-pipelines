const fs = require('fs');
const path = require('path');
const { parse } = require('json2csv');

const outputDir = path.join(process.env.HOME, 'Desktop', 'test_run');

async function createClientCSVs() {
    console.log('\n🎯 CREATING CLIENT CSV FILES');
    console.log('============================');
    
    const pipelines = [
        { 
            name: 'core', 
            jsonFile: 'validation-core-3companies.json', 
            csvFile: 'SBI-Core-Pipeline-Results.csv',
            fields: ["Website", "Company Name", "CFO Name", "CFO Email", "CFO Phone", "CFO LinkedIn", "CFO Title", "CFO Time in Role", "CFO Country", "CRO Name", "CRO Email", "CRO Phone", "CRO LinkedIn", "CRO Title", "CRO Time in Role", "CRO Country", "CFO Selection Reason", "Email Source", "Account Owner"]
        },
        { 
            name: 'advanced', 
            jsonFile: 'validation-advanced-3companies.json', 
            csvFile: 'SBI-Advanced-Pipeline-Results.csv',
            fields: ["Website", "Company Name", "Industry", "Industry Vertical", "Executive Stability Risk", "Deal Complexity Assessment", "Competitive Context Analysis", "Account Owner"]
        },
        { 
            name: 'powerhouse', 
            jsonFile: 'validation-powerhouse-3companies.json', 
            csvFile: 'SBI-Powerhouse-Pipeline-Results.csv',
            fields: ["Website", "Company Name", "Decision Maker", "Decision Maker Role", "Champion", "Champion Role", "Stakeholder", "Stakeholder Role", "Blocker", "Blocker Role", "Introducer", "Introducer Role", "Budget Authority Mapping", "Procurement Maturity Score", "Decision Style Analysis", "Sales Cycle Prediction", "Buyer Group Flight Risk", "Routing Intelligence Strategy 1", "Routing Intelligence Strategy 2", "Routing Intelligence Strategy 3", "Routing Intelligence Explanation", "Account Owner"]
        }
    ];

    for (const pipeline of pipelines) {
        const jsonFilePath = path.join(outputDir, pipeline.jsonFile);
        const csvFilePath = path.join(outputDir, pipeline.csvFile);

        try {
            console.log(`\n📊 Processing ${pipeline.name.toUpperCase()} Pipeline...`);
            
            const rawData = fs.readFileSync(jsonFilePath, 'utf8');
            
            // Extract JSON part from potential curl output
            const jsonMatch = rawData.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error("No valid JSON found in file.");
            }
            
            const jsonData = JSON.parse(jsonMatch[0]);
            const results = jsonData.results || [];

            console.log(`   📈 Found ${results.length} companies`);
            
            // Analyze data quality
            let emailAccuracy = 0;
            let phoneAccuracy = 0;
            let crossContaminationIssues = [];
            
            results.forEach((result, index) => {
                const company = result["Company Name"] || result.companyName;
                const website = result.Website || result.website;
                const domain = website.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
                
                // Check CFO email domain
                const cfoEmail = result["CFO Email"] || result.cfo?.email;
                if (cfoEmail && cfoEmail !== 'Not available') {
                    emailAccuracy++;
                    const emailDomain = cfoEmail.split('@')[1];
                    if (emailDomain && !emailDomain.includes(domain.split('.')[0])) {
                        crossContaminationIssues.push(`${company}: CFO email ${cfoEmail} doesn't match domain ${domain}`);
                    }
                }
                
                // Check CRO email domain
                const croEmail = result["CRO Email"] || result.cro?.email;
                if (croEmail && croEmail !== 'Not available') {
                    const emailDomain = croEmail.split('@')[1];
                    if (emailDomain && !emailDomain.includes(domain.split('.')[0])) {
                        crossContaminationIssues.push(`${company}: CRO email ${croEmail} doesn't match domain ${domain}`);
                    }
                }
                
                // Check phone numbers
                const cfoPhone = result["CFO Phone"] || result.cfo?.phone;
                const croPhone = result["CRO Phone"] || result.cro?.phone;
                if ((cfoPhone && cfoPhone !== 'Not available') || (croPhone && croPhone !== 'Not available')) {
                    phoneAccuracy++;
                }
            });

            // Map to CSV structure based on pipeline
            let processedResults;
            if (pipeline.name === 'core') {
                processedResults = results.map(item => ({
                    "Website": item.Website || item.website || 'Not available',
                    "Company Name": item["Company Name"] || item.companyName || 'Not available',
                    "CFO Name": item["CFO Name"] || item.cfo?.name || 'Not available',
                    "CFO Email": item["CFO Email"] || item.cfo?.email || 'Not available',
                    "CFO Phone": item["CFO Phone"] || item.cfo?.phone || 'Not available',
                    "CFO LinkedIn": item["CFO LinkedIn"] || item.cfo?.linkedIn || 'Not available',
                    "CFO Title": item["CFO Title"] || item.cfo?.title || 'Not available',
                    "CFO Time in Role": 'Not available',
                    "CFO Country": 'Not available',
                    "CRO Name": item["CRO Name"] || item.cro?.name || 'Not available',
                    "CRO Email": item["CRO Email"] || item.cro?.email || 'Not available',
                    "CRO Phone": item["CRO Phone"] || item.cro?.phone || 'Not available',
                    "CRO LinkedIn": item["CRO LinkedIn"] || item.cro?.linkedIn || 'Not available',
                    "CRO Title": item["CRO Title"] || item.cro?.title || 'Not available',
                    "CRO Time in Role": 'Not available',
                    "CRO Country": 'Not available',
                    "CFO Selection Reason": item["CFO Selection Reason"] || item.cfo?.source || 'Not available',
                    "Email Source": item["Email Source"] || item.cfo?.source || 'Not available',
                    "Account Owner": item["Account Owner"] || item.accountOwner || 'Not available'
                }));
            } else if (pipeline.name === 'advanced') {
                processedResults = results.map(item => ({
                    "Website": item.Website || item.website || 'Not available',
                    "Company Name": item["Company Name"] || item.companyName || 'Not available',
                    "Industry": item.Industry || item.industryIntelligence?.industry || 'Not available',
                    "Industry Vertical": item["Industry Vertical"] || item.industryIntelligence?.industryVertical || 'Not available',
                    "Executive Stability Risk": item["Executive Stability Risk"] || 'Not available',
                    "Deal Complexity Assessment": item["Deal Complexity Assessment"] || 'Not available',
                    "Competitive Context Analysis": item["Competitive Context Analysis"] || 'Not available',
                    "Account Owner": item["Account Owner"] || item.accountOwner || 'Not available'
                }));
            } else if (pipeline.name === 'powerhouse') {
                processedResults = results.map(item => ({
                    "Website": item.Website || item.website || 'Not available',
                    "Company Name": item["Company Name"] || item.companyName || 'Not available',
                    "Decision Maker": item["Decision Maker"] || item.buyerGroup?.decisionMaker?.name || 'Not available',
                    "Decision Maker Role": item["Decision Maker Role"] || item.buyerGroup?.decisionMaker?.role || 'Not available',
                    "Champion": item.Champion || item.buyerGroup?.champion?.name || 'Not available',
                    "Champion Role": item["Champion Role"] || item.buyerGroup?.champion?.role || 'Not available',
                    "Stakeholder": item.Stakeholder || item.buyerGroup?.stakeholder?.name || 'Not available',
                    "Stakeholder Role": item["Stakeholder Role"] || item.buyerGroup?.stakeholder?.role || 'Not available',
                    "Blocker": item.Blocker || item.buyerGroup?.blocker?.name || 'Not available',
                    "Blocker Role": item["Blocker Role"] || item.buyerGroup?.blocker?.role || 'Not available',
                    "Introducer": item.Introducer || item.buyerGroup?.introducer?.name || 'Not available',
                    "Introducer Role": item["Introducer Role"] || item.buyerGroup?.introducer?.role || 'Not available',
                    "Budget Authority Mapping": item["Budget Authority Mapping"] || 'Not available',
                    "Procurement Maturity Score": item["Procurement Maturity Score"] || 'Not available',
                    "Decision Style Analysis": item["Decision Style Analysis"] || 'Not available',
                    "Sales Cycle Prediction": item["Sales Cycle Prediction"] || 'Not available',
                    "Buyer Group Flight Risk": item["Buyer Group Flight Risk"] || 'Not available',
                    "Routing Intelligence Strategy 1": item["Routing Intelligence Strategy 1"] || 'Not available',
                    "Routing Intelligence Strategy 2": item["Routing Intelligence Strategy 2"] || 'Not available',
                    "Routing Intelligence Strategy 3": item["Routing Intelligence Strategy 3"] || 'Not available',
                    "Routing Intelligence Explanation": item["Routing Intelligence Explanation"] || 'Not available',
                    "Account Owner": item["Account Owner"] || item.accountOwner || 'Not available'
                }));
            }

            const csv = parse(processedResults, { fields: pipeline.fields });
            fs.writeFileSync(csvFilePath, csv);
            
            console.log(`   ✅ Created: ${pipeline.csvFile}`);
            console.log(`   📊 Email Success Rate: ${Math.round((emailAccuracy / results.length) * 100)}%`);
            console.log(`   📞 Phone Success Rate: ${Math.round((phoneAccuracy / results.length) * 100)}%`);
            
            if (crossContaminationIssues.length > 0) {
                console.log(`   🚨 Cross-contamination issues found:`);
                crossContaminationIssues.forEach(issue => console.log(`      - ${issue}`));
            } else {
                console.log(`   ✅ No cross-contamination issues detected`);
            }
            
        } catch (error) {
            console.error(`❌ Error processing ${pipeline.name} results:`, error.message);
        }
    }
    
    console.log('\n🎉 CLIENT CSV FILES CREATED!');
    console.log('============================');
    console.log('✅ SBI-Core-Pipeline-Results.csv');
    console.log('✅ SBI-Advanced-Pipeline-Results.csv');
    console.log('✅ SBI-Powerhouse-Pipeline-Results.csv');
    console.log('');
    console.log('📁 Location: ~/Desktop/test_run/');
}

createClientCSVs().catch(console.error);
