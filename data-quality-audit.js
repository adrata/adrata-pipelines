const fs = require('fs');
const path = require('path');

const testDir = path.join(process.env.HOME, 'Desktop', 'test_1');

async function comprehensiveDataAudit() {
    console.log('\n🔍 COMPREHENSIVE DATA QUALITY AUDIT');
    console.log('===================================');
    console.log('🎯 GOAL: World-class, consultant-level intelligence');
    console.log('🚨 STANDARD: Zero tolerance for inaccurate data');
    
    const auditResults = {
        criticalIssues: [],
        dataAccuracy: {},
        recommendations: []
    };

    // Audit Core Pipeline
    try {
        console.log('\n📊 AUDITING CORE PIPELINE DATA');
        console.log('==============================');
        
        const coreData = JSON.parse(fs.readFileSync(path.join(testDir, 'core-clean.json'), 'utf8'));
        const coreResults = coreData.results || [];
        
        console.log(`✅ Found ${coreResults.length} companies in Core pipeline`);
        
        for (let i = 0; i < coreResults.length; i++) {
            const company = coreResults[i];
            console.log(`\n🏢 COMPANY ${i + 1}: ${company['Company Name']}`);
            console.log('=====================================');
            
            // Audit CFO Data
            const cfoName = company['CFO Name'];
            const cfoTitle = company['CFO Title'];
            const cfoEmail = company['CFO Email'];
            
            console.log(`👤 CFO: ${cfoName}`);
            console.log(`📋 Title: ${cfoTitle}`);
            console.log(`📧 Email: ${cfoEmail}`);
            
            // Check for role accuracy
            if (cfoName === 'Marc Benioff') {
                auditResults.criticalIssues.push({
                    company: company['Company Name'],
                    issue: 'WRONG EXECUTIVE ROLE',
                    details: 'Marc Benioff is CEO, not CFO',
                    severity: 'CRITICAL',
                    impact: 'Client credibility damage'
                });
                console.log('   ❌ CRITICAL: Marc Benioff is CEO, not CFO!');
            }
            
            if (cfoName === 'Amy Coleman' && cfoTitle.includes('Chief Human Resources')) {
                auditResults.criticalIssues.push({
                    company: company['Company Name'],
                    issue: 'WRONG EXECUTIVE ROLE',
                    details: 'Amy Coleman is Chief People Officer, not CFO',
                    severity: 'CRITICAL',
                    impact: 'Incorrect targeting'
                });
                console.log('   ❌ CRITICAL: Amy Coleman is Chief People Officer, not CFO!');
            }
            
            // Check email quality
            if (cfoEmail === 'pr@salesforce.com') {
                auditResults.criticalIssues.push({
                    company: company['Company Name'],
                    issue: 'GENERIC EMAIL ADDRESS',
                    details: 'Using generic PR email instead of executive email',
                    severity: 'HIGH',
                    impact: 'Email will not reach executive'
                });
                console.log('   ❌ HIGH: Generic PR email instead of executive email!');
            }
            
            // Audit CRO Data
            const croName = company['CRO Name'];
            const croTitle = company['CRO Title'];
            const croEmail = company['CRO Email'];
            
            console.log(`👤 CRO: ${croName}`);
            console.log(`📋 Title: ${croTitle}`);
            console.log(`📧 Email: ${croEmail}`);
            
            // Check for duplicate executives (CFO = CRO)
            if (cfoName === croName && cfoName !== 'Not available') {
                auditResults.criticalIssues.push({
                    company: company['Company Name'],
                    issue: 'DUPLICATE EXECUTIVES',
                    details: `Same person (${cfoName}) listed as both CFO and CRO`,
                    severity: 'HIGH',
                    impact: 'Redundant outreach, unprofessional'
                });
                console.log(`   ❌ HIGH: Same person listed as both CFO and CRO!`);
            }
        }
        
    } catch (error) {
        console.error(`❌ Error auditing Core pipeline: ${error.message}`);
    }

    // Audit Advanced Pipeline
    try {
        console.log('\n📊 AUDITING ADVANCED PIPELINE DATA');
        console.log('==================================');
        
        const advancedData = JSON.parse(fs.readFileSync(path.join(testDir, 'advanced-clean.json'), 'utf8'));
        const advancedResults = advancedData.results || [];
        
        console.log(`✅ Found ${advancedResults.length} companies in Advanced pipeline`);
        
        let emptyFieldCount = 0;
        const totalFields = advancedResults.length * 6; // 6 main fields per company
        
        for (const company of advancedResults) {
            console.log(`\n🏢 ${company['Company Name']}:`);
            
            const fields = ['Industry', 'Industry Vertical', 'Executive Stability Risk', 
                          'Deal Complexity Assessment', 'Competitive Context Analysis'];
            
            for (const field of fields) {
                if (company[field] === 'Not available') {
                    emptyFieldCount++;
                    console.log(`   ❌ Missing: ${field}`);
                }
            }
        }
        
        const dataCompleteness = ((totalFields - emptyFieldCount) / totalFields * 100).toFixed(1);
        console.log(`\n📊 Data Completeness: ${dataCompleteness}%`);
        
        if (dataCompleteness < 70) {
            auditResults.criticalIssues.push({
                pipeline: 'Advanced',
                issue: 'INSUFFICIENT DATA DEPTH',
                details: `Only ${dataCompleteness}% data completeness`,
                severity: 'CRITICAL',
                impact: 'Not consultant-level intelligence'
            });
        }
        
    } catch (error) {
        console.error(`❌ Error auditing Advanced pipeline: ${error.message}`);
    }

    // Generate Audit Report
    console.log('\n🚨 CRITICAL ISSUES SUMMARY');
    console.log('==========================');
    
    if (auditResults.criticalIssues.length === 0) {
        console.log('✅ No critical issues found - data meets consultant standards');
    } else {
        console.log(`❌ Found ${auditResults.criticalIssues.length} critical issues:`);
        
        auditResults.criticalIssues.forEach((issue, index) => {
            console.log(`\n${index + 1}. ${issue.issue} [${issue.severity}]`);
            console.log(`   Company: ${issue.company || issue.pipeline}`);
            console.log(`   Details: ${issue.details}`);
            console.log(`   Impact: ${issue.impact}`);
        });
    }

    // Recommendations
    console.log('\n🎯 RECOMMENDATIONS FOR WORLD-CLASS DATA');
    console.log('======================================');
    
    const recommendations = [
        '1. FIX EXECUTIVE ROLE ACCURACY: Implement stricter title validation',
        '2. ELIMINATE GENERIC EMAILS: Find actual executive email addresses',
        '3. PREVENT DUPLICATE EXECUTIVES: Add logic to find distinct CFO/CRO',
        '4. ENHANCE DATA DEPTH: Ensure Advanced pipeline provides real intelligence',
        '5. ADD VERIFICATION LAYER: Cross-check all executives against official sources',
        '6. IMPLEMENT CONFIDENCE SCORING: Only return high-confidence results'
    ];
    
    recommendations.forEach(rec => console.log(rec));
    
    console.log('\n⚠️  CURRENT STATUS: NOT READY FOR CLIENT DELIVERY');
    console.log('🎯 TARGET: World-class, consultant-level intelligence');
    console.log('🚨 ACTION REQUIRED: Fix critical issues before client delivery');
    
    return auditResults;
}

// Run the audit
comprehensiveDataAudit();
