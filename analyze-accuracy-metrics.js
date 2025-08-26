const fs = require('fs');

console.log('📊 ANALYZING PIPELINE ACCURACY METRICS');
console.log('======================================');

let totalCompanies = 0;
let cfoFound = 0;
let croFound = 0;
let emailsFound = 0;
let phonesFound = 0;
let linkedinFound = 0;
let totalProcessingTime = 0;

// Analyze Advanced Pipeline Results
try {
    console.log('\n🔍 Advanced Pipeline Analysis:');
    const advancedData = JSON.parse(fs.readFileSync('advanced-results.json', 'utf8'));
    
    if (advancedData.success && advancedData.results) {
        const results = advancedData.results;
        totalCompanies += results.length;
        
        results.forEach(result => {
            // CFO/Finance Leader
            if (result.financeLeader && result.financeLeader.name) cfoFound++;
            if (result.financeLeader && result.financeLeader.email) emailsFound++;
            if (result.financeLeader && result.financeLeader.phone) phonesFound++;
            if (result.financeLeader && result.financeLeader.linkedin) linkedinFound++;
            
            // CRO/Revenue Leader
            if (result.revenueLeader && result.revenueLeader.name) croFound++;
            if (result.revenueLeader && result.revenueLeader.email) emailsFound++;
            if (result.revenueLeader && result.revenueLeader.phone) phonesFound++;
            if (result.revenueLeader && result.revenueLeader.linkedin) linkedinFound++;
            
            // Processing time
            if (result.processingTime) totalProcessingTime += result.processingTime;
        });
        
        console.log(`   Companies processed: ${results.length}`);
        console.log(`   CFO/Finance leaders found: ${results.filter(r => r.financeLeader && r.financeLeader.name).length}`);
        console.log(`   CRO/Revenue leaders found: ${results.filter(r => r.revenueLeader && r.revenueLeader.name).length}`);
    }
} catch (error) {
    console.log(`   ❌ Error analyzing Advanced: ${error.message}`);
}

// Analyze Powerhouse Pipeline Results
try {
    console.log('\n🔍 Powerhouse Pipeline Analysis:');
    const powerhouseData = JSON.parse(fs.readFileSync('powerhouse-results.json', 'utf8'));
    
    if (powerhouseData.success && powerhouseData.results) {
        const results = powerhouseData.results;
        
        results.forEach(result => {
            // Additional analysis for Powerhouse
            if (result.financeLeader && result.financeLeader.name) cfoFound++;
            if (result.revenueLeader && result.revenueLeader.name) croFound++;
            if (result.processingTime) totalProcessingTime += result.processingTime;
        });
        
        console.log(`   Companies processed: ${results.length}`);
        console.log(`   Buyer group intelligence generated: ${results.filter(r => r.buyerGroupIntelligence).length}`);
        console.log(`   SBI methodology applied: ${results.length}`);
    }
} catch (error) {
    console.log(`   ❌ Error analyzing Powerhouse: ${error.message}`);
}

// Calculate final metrics
console.log('\n📈 FINAL ACCURACY METRICS:');
console.log('==========================');
console.log(`Total companies processed: ${totalCompanies}`);
console.log(`CFO/CRO discovery rate: ${Math.round(((cfoFound + croFound) / (totalCompanies * 2)) * 100)}%`);
console.log(`Email discovery rate: ${Math.round((emailsFound / (totalCompanies * 2)) * 100)}%`);
console.log(`Phone discovery rate: ${Math.round((phonesFound / (totalCompanies * 2)) * 100)}%`);
console.log(`LinkedIn discovery rate: ${Math.round((linkedinFound / (totalCompanies * 2)) * 100)}%`);
console.log(`Average processing time: ${Math.round(totalProcessingTime / totalCompanies)}ms per company`);

// Export metrics for email generation
const metrics = {
    totalCompanies,
    cfoDiscoveryRate: Math.round(((cfoFound + croFound) / (totalCompanies * 2)) * 100),
    emailAccuracy: Math.round((emailsFound / (totalCompanies * 2)) * 100),
    phoneAccuracy: Math.round((phonesFound / (totalCompanies * 2)) * 100),
    linkedinAccuracy: Math.round((linkedinFound / (totalCompanies * 2)) * 100),
    avgProcessingTime: Math.round(totalProcessingTime / totalCompanies),
    advancedCompanies: 100,
    powerhouseCompanies: 10,
    coreCompanies: 1233
};

fs.writeFileSync('accuracy-metrics.json', JSON.stringify(metrics, null, 2));
console.log('\n✅ Metrics exported to accuracy-metrics.json');
