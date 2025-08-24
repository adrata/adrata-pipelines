#!/usr/bin/env node

/**
 * REAL DATA VALIDATION SCRIPT
 * Validates that our pipeline returns 100% real API data with no fallbacks or synthetic data
 */

const fetch = require('node-fetch');

// Known real executives for validation
const KNOWN_EXECUTIVES = {
    'salesforce.com': {
        expectedCFO: 'Amy Weaver',
        expectedCRO: 'Gavin Patterson'
    },
    'microsoft.com': {
        expectedCFO: 'Amy Hood', 
        expectedCRO: 'Judson Althoff'
    },
    'adobe.com': {
        expectedCFO: 'Dan Durn',
        expectedCRO: 'David Wadhwani'
    },
    'hubspot.com': {
        expectedCFO: 'Kathryn Bueker',
        expectedCRO: 'Yamini Rangan'
    },
    'snowflake.com': {
        expectedCFO: 'Mike Scarpelli',
        expectedCRO: 'Chris Degnan'
    }
};

// Patterns that indicate synthetic/fallback data
const SYNTHETIC_PATTERNS = [
    /test\s*(cfo|cro)/i,
    /example\.(com|org)/i,
    /placeholder/i,
    /default\s*(company|name)/i,
    /unknown\s*(title|company)/i,
    /sample\s*(data|company)/i,
    /lorem\s*ipsum/i,
    /fake\s*(email|phone)/i,
    /generated\s*data/i,
    /fallback/i,
    /synthetic/i
];

// Check if data appears synthetic
function isSyntheticData(value) {
    if (!value || typeof value !== 'string') return false;
    return SYNTHETIC_PATTERNS.some(pattern => pattern.test(value));
}

// Check if email looks realistic
function isRealisticEmail(email) {
    if (!email) return false;
    
    // Basic email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return false;
    
    // Check for synthetic patterns
    if (isSyntheticData(email)) return false;
    
    // Check for common fake domains
    const fakeDomains = ['example.com', 'test.com', 'fake.com', 'sample.com'];
    const domain = email.split('@')[1];
    if (fakeDomains.includes(domain)) return false;
    
    return true;
}

// Check if phone looks realistic
function isRealisticPhone(phone) {
    if (!phone) return false;
    
    // Basic phone format (various international formats)
    const phoneRegex = /^[\+]?[1-9][\d\-\(\)\s]{7,15}$/;
    if (!phoneRegex.test(phone)) return false;
    
    // Check for synthetic patterns
    if (isSyntheticData(phone)) return false;
    
    // Check for obvious fake patterns
    const fakePatterns = [
        /1234567/,
        /0000000/,
        /9999999/,
        /555-555-/
    ];
    
    return !fakePatterns.some(pattern => pattern.test(phone));
}

// Validate executive name accuracy
function validateExecutiveAccuracy(company, result) {
    const domain = company.domain || company.Website;
    const expected = KNOWN_EXECUTIVES[domain];
    
    if (!expected) return { accuracy: 'unknown', reason: 'No known executives for validation' };
    
    const cfoMatch = result['CFO Name'] && 
        (result['CFO Name'].toLowerCase().includes(expected.expectedCFO.toLowerCase().split(' ')[1]) ||
         expected.expectedCFO.toLowerCase().includes(result['CFO Name'].toLowerCase().split(' ')[1]));
         
    const croMatch = result['CRO Name'] && 
        (result['CRO Name'].toLowerCase().includes(expected.expectedCRO.toLowerCase().split(' ')[1]) ||
         expected.expectedCRO.toLowerCase().includes(result['CRO Name'].toLowerCase().split(' ')[1]));
    
    if (cfoMatch || croMatch) {
        return { accuracy: 'accurate', reason: 'Matches known executives' };
    } else if (result['CFO Name'] || result['CRO Name']) {
        return { 
            accuracy: 'different', 
            reason: `Found: ${result['CFO Name'] || 'None'} / ${result['CRO Name'] || 'None'}, Expected: ${expected.expectedCFO} / ${expected.expectedCRO}` 
        };
    } else {
        return { accuracy: 'missing', reason: 'No executives found' };
    }
}

async function validateRealData() {
    console.log('🔍 REAL DATA VALIDATION');
    console.log('========================');
    console.log('Checking for synthetic/fallback data patterns...');
    console.log('');
    
    const testCompanies = [
        { companyName: 'Salesforce', domain: 'salesforce.com', 'Account Owner': 'Dan Mirolli' },
        { companyName: 'Microsoft', domain: 'microsoft.com', 'Account Owner': 'Sarah Chen' },
        { companyName: 'Adobe', domain: 'adobe.com', 'Account Owner': 'Mike Rodriguez' },
        { companyName: 'HubSpot', domain: 'hubspot.com', 'Account Owner': 'Lisa Wang' },
        { companyName: 'Snowflake', domain: 'snowflake.com', 'Account Owner': 'Emily Brown' }
    ];
    
    try {
        console.log('🚀 Testing with hybrid-accurate API (full architecture)...');
        
        const response = await fetch('https://adrata-pipelines-c9ge1xmz5-adrata.vercel.app/api/hybrid-accurate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                companies: testCompanies
            }),
            timeout: 300000 // 5 minutes
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.results || data.results.length === 0) {
            throw new Error('No results returned');
        }
        
        console.log(`✅ Received ${data.results.length} results`);
        console.log('');
        
        let totalCompanies = 0;
        let syntheticDataFound = 0;
        let realDataFound = 0;
        let accurateExecutives = 0;
        let differentExecutives = 0;
        let missingExecutives = 0;
        
        const detailedResults = [];
        
        data.results.forEach((result, index) => {
            const company = testCompanies[index];
            totalCompanies++;
            
            console.log(`🏢 ${company.companyName} (${company.domain})`);
            console.log('=' .repeat(50));
            
            // Check for synthetic patterns in all text fields
            const textFields = [
                'companyName', 'cfo.name', 'cfo.title', 'cfo.email', 'cfo.phone',
                'cro.name', 'cro.title', 'cro.email', 'cro.phone'
            ];
            
            let hasSyntheticData = false;
            const syntheticFields = [];
            
            textFields.forEach(field => {
                const fieldPath = field.split('.');
                let value = result;
                fieldPath.forEach(part => {
                    value = value?.[part];
                });
                
                if (value && isSyntheticData(value)) {
                    hasSyntheticData = true;
                    syntheticFields.push(`${field}: ${value}`);
                }
            });
            
            // Check executive accuracy
            const accuracy = validateExecutiveAccuracy(company, {
                'CFO Name': result.cfo?.name,
                'CRO Name': result.cro?.name
            });
            
            // Check contact data quality
            const cfoEmail = result.cfo?.email;
            const croEmail = result.cro?.email;
            const cfoPhone = result.cfo?.phone;
            const croPhone = result.cro?.phone;
            
            const emailQuality = {
                cfoEmailReal: isRealisticEmail(cfoEmail),
                croEmailReal: isRealisticEmail(croEmail)
            };
            
            const phoneQuality = {
                cfoPhoneReal: isRealisticPhone(cfoPhone),
                croPhoneReal: isRealisticPhone(croPhone)
            };
            
            // Log findings
            console.log(`📊 Modules Used: ${result.modulesUsed?.join(', ') || 'None'}`);
            console.log(`👥 CFO: ${result.cfo?.name || 'None'} (${result.cfo?.title || 'No title'})`);
            console.log(`👥 CRO: ${result.cro?.name || 'None'} (${result.cro?.title || 'No title'})`);
            console.log(`📧 CFO Email: ${cfoEmail || 'None'} ${emailQuality.cfoEmailReal ? '✅' : '❌'}`);
            console.log(`📧 CRO Email: ${croEmail || 'None'} ${emailQuality.croEmailReal ? '✅' : '❌'}`);
            console.log(`📞 CFO Phone: ${cfoPhone || 'None'} ${phoneQuality.cfoPhoneReal ? '✅' : '❌'}`);
            console.log(`📞 CRO Phone: ${croPhone || 'None'} ${phoneQuality.croPhoneReal ? '✅' : '❌'}`);
            console.log(`🎯 Accuracy: ${accuracy.accuracy} - ${accuracy.reason}`);
            console.log(`🔍 Confidence: ${result.confidence || 0}%`);
            
            if (hasSyntheticData) {
                console.log(`❌ SYNTHETIC DATA DETECTED: ${syntheticFields.join(', ')}`);
                syntheticDataFound++;
            } else {
                console.log(`✅ NO SYNTHETIC PATTERNS DETECTED`);
                realDataFound++;
            }
            
            // Count accuracy
            if (accuracy.accuracy === 'accurate') accurateExecutives++;
            else if (accuracy.accuracy === 'different') differentExecutives++;
            else missingExecutives++;
            
            console.log('');
            
            detailedResults.push({
                company: company.companyName,
                hasSyntheticData,
                syntheticFields,
                accuracy: accuracy.accuracy,
                accuracyReason: accuracy.reason,
                modulesUsed: result.modulesUsed?.length || 0,
                confidence: result.confidence || 0,
                hasRealExecutives: !!(result.cfo?.name || result.cro?.name),
                hasContactData: !!(cfoEmail || croEmail || cfoPhone || croPhone),
                contactDataQuality: {
                    emailsReal: emailQuality.cfoEmailReal || emailQuality.croEmailReal,
                    phonesReal: phoneQuality.cfoPhoneReal || phoneQuality.croPhoneReal
                }
            });
        });
        
        // Summary
        console.log('📈 VALIDATION SUMMARY');
        console.log('=====================');
        console.log(`Total Companies Tested: ${totalCompanies}`);
        console.log(`Real Data (No Synthetic): ${realDataFound} (${Math.round(realDataFound/totalCompanies*100)}%)`);
        console.log(`Synthetic Data Detected: ${syntheticDataFound} (${Math.round(syntheticDataFound/totalCompanies*100)}%)`);
        console.log('');
        console.log('👥 EXECUTIVE ACCURACY:');
        console.log(`• Accurate: ${accurateExecutives} (${Math.round(accurateExecutives/totalCompanies*100)}%)`);
        console.log(`• Different: ${differentExecutives} (${Math.round(differentExecutives/totalCompanies*100)}%)`);
        console.log(`• Missing: ${missingExecutives} (${Math.round(missingExecutives/totalCompanies*100)}%)`);
        console.log('');
        
        // API Source Analysis
        const modulesUsage = {};
        detailedResults.forEach(result => {
            if (result.modulesUsed > 0) {
                modulesUsage[result.company] = result.modulesUsed;
            }
        });
        
        console.log('🔧 API MODULES USAGE:');
        Object.entries(modulesUsage).forEach(([company, count]) => {
            console.log(`• ${company}: ${count} modules`);
        });
        console.log('');
        
        // Final Assessment
        const realDataPercentage = Math.round(realDataFound/totalCompanies*100);
        const accuracyPercentage = Math.round(accurateExecutives/totalCompanies*100);
        
        console.log('🎯 FINAL ASSESSMENT:');
        console.log('====================');
        
        if (syntheticDataFound === 0) {
            console.log('✅ NO SYNTHETIC DATA DETECTED - All data appears to be from real APIs');
        } else {
            console.log('❌ SYNTHETIC DATA FOUND - Some fallback/generated data detected');
        }
        
        if (accuracyPercentage >= 60) {
            console.log('✅ EXECUTIVE ACCURACY GOOD - Most executives match known data');
        } else {
            console.log('⚠️ EXECUTIVE ACCURACY NEEDS IMPROVEMENT - Many executives don\'t match known data');
        }
        
        console.log('');
        console.log('📊 CONFIDENCE LEVELS:');
        console.log(`• Real Data: ${realDataPercentage >= 80 ? 'HIGH' : realDataPercentage >= 60 ? 'MEDIUM' : 'LOW'} (${realDataPercentage}%)`);
        console.log(`• Executive Accuracy: ${accuracyPercentage >= 60 ? 'GOOD' : accuracyPercentage >= 40 ? 'FAIR' : 'POOR'} (${accuracyPercentage}%)`);
        console.log(`• API Integration: ${Object.keys(modulesUsage).length >= 4 ? 'EXCELLENT' : 'NEEDS WORK'}`);
        
        const overallScore = (realDataPercentage + accuracyPercentage) / 2;
        console.log(`• Overall Score: ${overallScore >= 70 ? 'EXCELLENT' : overallScore >= 50 ? 'GOOD' : 'NEEDS IMPROVEMENT'} (${Math.round(overallScore)}%)`);
        
    } catch (error) {
        console.error('❌ Validation failed:', error.message);
        process.exit(1);
    }
}

// Run validation
validateRealData();
