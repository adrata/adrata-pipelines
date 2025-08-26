const fs = require('fs');
const path = require('path');

const outputDir = path.join(process.env.HOME, 'Desktop', 'test_run');

function extractCleanJSON(rawData) {
    // Remove curl progress output and extract JSON
    const lines = rawData.split('\n');
    let jsonStart = -1;
    let jsonEnd = -1;
    
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith('{')) {
            jsonStart = i;
            break;
        }
    }
    
    if (jsonStart === -1) return null;
    
    // Find the end of JSON
    for (let i = lines.length - 1; i >= 0; i--) {
        if (lines[i].trim().endsWith('}')) {
            jsonEnd = i;
            break;
        }
    }
    
    if (jsonEnd === -1) return null;
    
    const jsonLines = lines.slice(jsonStart, jsonEnd + 1);
    return jsonLines.join('\n');
}

async function analyzeDataQuality() {
    console.log('\n🔍 COMPREHENSIVE DATA QUALITY ANALYSIS');
    console.log('======================================');
    
    // Analyze Core Pipeline Results
    console.log('\n📊 CORE PIPELINE ANALYSIS:');
    console.log('==========================');
    
    try {
        const coreRawData = fs.readFileSync(path.join(outputDir, 'validation-core-3companies.json'), 'utf8');
        const coreCleanJSON = extractCleanJSON(coreRawData);
        
        if (coreCleanJSON) {
            const coreData = JSON.parse(coreCleanJSON);
            const results = coreData.results || [];
            
            console.log(`✅ Successfully processed ${results.length} companies`);
            console.log(`📈 Overall Success Rate: ${coreData.stats?.successful || 0}/${coreData.stats?.total_companies || 0} (${Math.round(((coreData.stats?.successful || 0) / (coreData.stats?.total_companies || 1)) * 100)}%)`);
            console.log(`📧 Email Success Rate: ${coreData.data_quality?.email_success_rate || 'Unknown'}`);
            console.log(`📞 Phone Success Rate: ${coreData.data_quality?.phone_success_rate || 'Unknown'}`);
            
            // Analyze each company
            results.forEach((company, index) => {
                console.log(`\n   Company ${index + 1}: ${company["Company Name"]}`);
                console.log(`   Website: ${company.Website}`);
                console.log(`   CFO: ${company["CFO Name"]} (${company["CFO Email"]})`);
                console.log(`   CRO: ${company["CRO Name"]} (${company["CRO Email"]})`);
                
                // Check for cross-contamination
                const domain = company.Website.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
                const companyDomain = domain.split('.')[0].toLowerCase();
                
                const cfoEmail = company["CFO Email"];
                const croEmail = company["CRO Email"];
                
                if (cfoEmail && cfoEmail !== 'Not available' && !cfoEmail.toLowerCase().includes(companyDomain)) {
                    console.log(`   🚨 CFO EMAIL MISMATCH: ${cfoEmail} doesn't match ${domain}`);
                }
                
                if (croEmail && croEmail !== 'Not available' && !croEmail.toLowerCase().includes(companyDomain)) {
                    console.log(`   🚨 CRO EMAIL MISMATCH: ${croEmail} doesn't match ${domain}`);
                }
            });
            
            // Check raw results for data source information
            if (coreData.rawResults) {
                console.log('\n📊 DATA SOURCE ANALYSIS:');
                coreData.rawResults.forEach((raw, index) => {
                    console.log(`\n   Company ${index + 1}: ${raw.companyName}`);
                    console.log(`   CFO Source: ${raw.cfo?.source || 'Unknown'}`);
                    console.log(`   CFO Confidence: ${raw.cfo?.confidence || 0}%`);
                    console.log(`   CRO Source: ${raw.cro?.source || 'Unknown'}`);
                    console.log(`   CRO Confidence: ${raw.cro?.confidence || 0}%`);
                    console.log(`   Processing Time: ${Math.round((raw.processingTime || 0) / 1000)}s`);
                    console.log(`   Validation Notes: ${raw.validationNotes?.join(', ') || 'None'}`);
                });
            }
        } else {
            console.log('❌ Failed to extract clean JSON from Core pipeline results');
        }
    } catch (error) {
        console.error('❌ Error analyzing Core pipeline:', error.message);
    }
    
    console.log('\n🎯 EMAIL CLAIMS VALIDATION:');
    console.log('===========================');
    console.log('📧 Corporate Intelligence Detection:');
    console.log('   - M&A Detection: Need to verify 94% claim');
    console.log('   - Rebrand Tracking: Need to verify 23% enterprise impact');
    console.log('   - Email Transition: Need to verify 31% get new emails post-acquisition');
    console.log('');
    console.log('📊 CFO/CRO Discovery:');
    console.log('   - Success Rate: Need to verify 92% claim');
    console.log('   - Email Accuracy: Need to verify 87% valid work emails');
    console.log('   - Phone Accuracy: Need to verify 78% verified numbers');
    console.log('   - LinkedIn Accuracy: Need to verify 94% current profiles');
    
    console.log('\n🔧 RECOMMENDATIONS:');
    console.log('===================');
    console.log('1. Fix cross-contamination: Louise Pentland @hitachi.com should not be Adobe CRO');
    console.log('2. Improve email domain validation in ExecutiveValidation module');
    console.log('3. Add more sophisticated acquisition detection');
    console.log('4. Implement better data source tracking for claims validation');
    console.log('5. Add confidence scoring based on actual data source reliability');
}

analyzeDataQuality().catch(console.error);
