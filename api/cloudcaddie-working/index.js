#!/usr/bin/env node

/**
 * 🚀 CLOUDCADDIE WORKING PIPELINE
 * 
 * Production-ready pipeline for CloudCaddie Consulting
 * Finds buyer groups for IT recruiting services at federal IT consulting firms
 * 
 * WORKING APIS:
 * ✅ Perplexity (sonar-pro model)
 * ✅ Lusha (3,449 credits remaining)
 * ✅ CoreSignal
 * ✅ ZeroBounce
 * ✅ Prospeo
 * ✅ DropContact
 * ✅ OpenAI
 */

require('dotenv').config({ path: './cloudcaddie.env' });
const fs = require('fs').promises;
const path = require('path');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Import working modules
const { ITRecruitingExecutiveResearch } = require('../../modules/ITRecruitingExecutiveResearch');
const { BuyerGroupAI } = require('../../modules/BuyerGroupAI');

// Configuration for working APIs
const CLOUDCADDIE_CONFIG = {
    // Data Quality - STRICT REAL DATA ONLY
    NO_FALLBACK_DATA: true,
    NO_SYNTHETIC_DATA: true,
    REAL_DATA_ONLY: true,
    STRICT_VALIDATION: true,
    
    // Working API Configuration
    PERPLEXITY_MODEL: 'sonar-pro',  // Confirmed working
    LUSHA_CREDITS_REMAINING: 3449,  // Confirmed available
    CORESIGNAL_ENABLED: true,
    ZEROBOUNCE_ENABLED: true,
    PROSPEO_ENABLED: true,
    DROPCONTACT_ENABLED: true,
    OPENAI_ENABLED: true,
    
    // Pipeline Focus
    FOCUS: 'IT_RECRUITING_SERVICES',
    TARGET_INDUSTRY: 'FEDERAL_IT_CONSULTING',
    BUYER_GROUP_SCOPE: 'FULL_HIRING_COMMITTEE',
    
    // Output Configuration
    OUTPUT_FORMAT: 'CSV',
    SAVE_TO_DESKTOP: true,
    DESKTOP_PATH: path.join(require('os').homedir(), 'Desktop'),
    
    // Processing Configuration
    BATCH_SIZE: 5,
    DELAY_BETWEEN_REQUESTS: 2000,
    MAX_RETRIES: 3,
    
    // Validation Configuration
    MIN_EXECUTIVES_PER_COMPANY: 1,
    MAX_EXECUTIVES_PER_COMPANY: 8,
    REQUIRED_FIELDS: ['name', 'title', 'company', 'email'],
    OPTIONAL_FIELDS: ['phone', 'linkedin', 'department', 'location']
};

/**
 * STRICT DATA VALIDATION - NO FALLBACK DATA ALLOWED
 */
function isRealData(value, fieldType = 'general') {
    if (!value || value === 'Not available' || value === 'Unknown' || value === 'TBD') {
        return false;
    }
    
    const syntheticPatterns = [
        /requires.*research/i, /placeholder/i, /default/i, /generated/i,
        /fallback/i, /synthetic/i, /example/i, /sample/i, /test/i,
        /demo/i, /fake/i, /mock/i, /dummy/i, /temp/i, /temporary/i
    ];
    
    const valueStr = value.toString().toLowerCase();
    if (syntheticPatterns.some(pattern => pattern.test(valueStr))) {
        return false;
    }
    
    if (fieldType === 'email') {
        return value.includes('@') && 
               !value.includes('example.com') && 
               !value.includes('test.com') &&
               !value.includes('placeholder.com') &&
               /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }
    
    if (fieldType === 'phone') {
        return /^\+?[\d\s\-\(\)]{10,}$/.test(value) && 
               !value.includes('555') &&
               !value.includes('000-0000');
    }
    
    if (fieldType === 'name') {
        return value.length > 2 && 
               /^[A-Za-z\s\-\.]+$/.test(value) &&
               !value.includes('John Doe') &&
               !value.includes('Jane Smith') &&
               !value.includes('Test User');
    }
    
    return true;
}

/**
 * VALIDATE EXECUTIVE DATA - ONLY RETURN REAL DATA
 */
function validateExecutiveData(executive, role) {
    const validated = {};
    
    // Required fields with strict validation
    if (isRealData(executive.name, 'name')) {
        validated.name = executive.name;
    }
    
    if (isRealData(executive.title, 'general')) {
        validated.title = executive.title;
    }
    
    if (isRealData(executive.company, 'general')) {
        validated.company = executive.company;
    }
    
    if (isRealData(executive.email, 'email')) {
        validated.email = executive.email;
    }
    
    // Optional fields
    if (isRealData(executive.phone, 'phone')) {
        validated.phone = executive.phone;
    }
    
    if (isRealData(executive.linkedin, 'general')) {
        validated.linkedin = executive.linkedin;
    }
    
    if (isRealData(executive.department, 'general')) {
        validated.department = executive.department;
    }
    
    if (isRealData(executive.location, 'general')) {
        validated.location = executive.location;
    }
    
    // Add role for CSV mapping
    validated.role = role;
    
    return validated;
}

/**
 * MAP TO CLOUDCADDIE CSV FORMAT
 */
function mapToCloudCaddieCSV(result, companySize) {
    const csvData = {
        // Company Information
        company_name: result.company?.name || '',
        company_domain: result.company?.domain || '',
        company_size: companySize || '',
        company_industry: result.company?.industry || '',
        company_location: result.company?.location || '',
        
        // Timing Intelligence
        fiscal_year_end: result.timing?.fiscalYearEnd || '',
        budget_cycle: result.timing?.budgetCycle || '',
        hiring_season: result.timing?.hiringSeason || '',
        project_award_timing: result.timing?.projectAwardTiming || '',
        
        // Primary Decision Maker
        primary_decision_maker_name: '',
        primary_decision_maker_title: '',
        primary_decision_maker_email: '',
        primary_decision_maker_phone: '',
        primary_decision_maker_linkedin: '',
        
        // Technical Leader
        technical_leader_name: '',
        technical_leader_title: '',
        technical_leader_email: '',
        technical_leader_phone: '',
        technical_leader_linkedin: '',
        
        // HR Leader
        hr_leader_name: '',
        hr_leader_title: '',
        hr_leader_email: '',
        hr_leader_phone: '',
        hr_leader_linkedin: '',
        
        // Champion
        champion_name: '',
        champion_title: '',
        champion_email: '',
        champion_phone: '',
        champion_linkedin: '',
        
        // Influencer
        influencer_name: '',
        influencer_title: '',
        influencer_email: '',
        influencer_phone: '',
        influencer_linkedin: '',
        
        // Procurement Contact
        procurement_name: '',
        procurement_title: '',
        procurement_email: '',
        procurement_phone: '',
        procurement_linkedin: '',
        
        // Data Quality
        data_quality_score: result.dataQuality?.score || 0,
        real_data_percentage: result.dataQuality?.realDataPercentage || 0,
        validation_status: result.dataQuality?.validationStatus || '',
        
        // Processing Info
        processed_at: new Date().toISOString(),
        pipeline_version: 'CloudCaddie-Working-v1.0'
    };
    
    // Map validated executive data
    if (result.executives) {
        result.executives.forEach(exec => {
            const validated = validateExecutiveData(exec, exec.role);
            
            if (validated.name && validated.title) {
                switch (exec.role) {
                    case 'Primary Decision Maker':
                        csvData.primary_decision_maker_name = validated.name;
                        csvData.primary_decision_maker_title = validated.title;
                        csvData.primary_decision_maker_email = validated.email || '';
                        csvData.primary_decision_maker_phone = validated.phone || '';
                        csvData.primary_decision_maker_linkedin = validated.linkedin || '';
                        break;
                    case 'Technical Leader':
                        csvData.technical_leader_name = validated.name;
                        csvData.technical_leader_title = validated.title;
                        csvData.technical_leader_email = validated.email || '';
                        csvData.technical_leader_phone = validated.phone || '';
                        csvData.technical_leader_linkedin = validated.linkedin || '';
                        break;
                    case 'HR Leader':
                        csvData.hr_leader_name = validated.name;
                        csvData.hr_leader_title = validated.title;
                        csvData.hr_leader_email = validated.email || '';
                        csvData.hr_leader_phone = validated.phone || '';
                        csvData.hr_leader_linkedin = validated.linkedin || '';
                        break;
                    case 'Champion':
                        csvData.champion_name = validated.name;
                        csvData.champion_title = validated.title;
                        csvData.champion_email = validated.email || '';
                        csvData.champion_phone = validated.phone || '';
                        csvData.champion_linkedin = validated.linkedin || '';
                        break;
                    case 'Influencer':
                        csvData.influencer_name = validated.name;
                        csvData.influencer_title = validated.title;
                        csvData.influencer_email = validated.email || '';
                        csvData.influencer_phone = validated.phone || '';
                        csvData.influencer_linkedin = validated.linkedin || '';
                        break;
                    case 'Procurement Contact':
                        csvData.procurement_name = validated.name;
                        csvData.procurement_title = validated.title;
                        csvData.procurement_email = validated.email || '';
                        csvData.procurement_phone = validated.phone || '';
                        csvData.procurement_linkedin = validated.linkedin || '';
                        break;
                }
            }
        });
    }
    
    return csvData;
}

/**
 * PROCESS SINGLE CLOUDCADDIE COMPANY
 */
async function processCloudCaddieCompany(company, index, total) {
    console.log(`\n🏢 Processing ${index + 1}/${total}: ${company.name}`);
    console.log(`   Domain: ${company.domain || 'N/A'}`);
    console.log(`   Size: ${company.size || 'N/A'}`);
    
    try {
        // Initialize research modules with working APIs
        const itRecruitingResearch = new ITRecruitingExecutiveResearch({
            perplexityModel: CLOUDCADDIE_CONFIG.PERPLEXITY_MODEL,
            coresignalEnabled: CLOUDCADDIE_CONFIG.CORESIGNAL_ENABLED,
            lushaEnabled: true, // Confirmed working
            zeroBounceEnabled: CLOUDCADDIE_CONFIG.ZEROBOUNCE_ENABLED,
            prospoEnabled: CLOUDCADDIE_CONFIG.PROSPEO_ENABLED,
            dropContactEnabled: CLOUDCADDIE_CONFIG.DROPCONTACT_ENABLED,
            openaiEnabled: CLOUDCADDIE_CONFIG.OPENAI_ENABLED
        });
        
        const buyerGroupAI = new BuyerGroupAI({
            focus: CLOUDCADDIE_CONFIG.FOCUS,
            industry: CLOUDCADDIE_CONFIG.TARGET_INDUSTRY,
            scope: CLOUDCADDIE_CONFIG.BUYER_GROUP_SCOPE
        });
        
        // Research IT recruiting executives
        console.log('   🔍 Researching IT recruiting executives...');
        const executives = await itRecruitingResearch.researchITRecruitingExecutives(company);
        
        // Determine buyer group structure
        console.log('   🧠 Determining buyer group structure...');
        const buyerGroup = await buyerGroupAI.determineBuyerGroup(company, executives);
        
        // Calculate data quality metrics
        const totalExecutives = executives.length;
        const realExecutives = executives.filter(exec => 
            isRealData(exec.name, 'name') && isRealData(exec.title, 'general')
        ).length;
        
        const dataQuality = {
            score: totalExecutives > 0 ? (realExecutives / totalExecutives) * 100 : 0,
            realDataPercentage: totalExecutives > 0 ? (realExecutives / totalExecutives) * 100 : 0,
            validationStatus: realExecutives > 0 ? 'VALIDATED' : 'NO_REAL_DATA',
            totalExecutives,
            realExecutives
        };
        
        // Determine company size category
        const companySize = company.size || 'Unknown';
        let sizeCategory = 'S3';
        if (companySize.includes('1-10') || companySize.includes('11-50')) {
            sizeCategory = 'S1';
        } else if (companySize.includes('51-200') || companySize.includes('201-500')) {
            sizeCategory = 'S2';
        }
        
        const result = {
            company: {
                name: company.name,
                domain: company.domain,
                size: companySize,
                industry: company.industry || 'Federal IT Consulting',
                location: company.location || ''
            },
            executives: buyerGroup.executives || executives,
            timing: buyerGroup.timing || {},
            dataQuality,
            buyerGroup: buyerGroup.structure || {}
        };
        
        console.log(`   ✅ Found ${realExecutives}/${totalExecutives} real executives`);
        console.log(`   📊 Data Quality: ${dataQuality.score.toFixed(1)}%`);
        
        return result;
        
    } catch (error) {
        console.log(`   ❌ Error processing ${company.name}: ${error.message}`);
        return {
            company: { name: company.name, domain: company.domain, size: company.size },
            executives: [],
            timing: {},
            dataQuality: { score: 0, realDataPercentage: 0, validationStatus: 'ERROR', totalExecutives: 0, realExecutives: 0 },
            buyerGroup: {},
            error: error.message
        };
    }
}

/**
 * MAIN CLOUDCADDIE PIPELINE
 */
async function runCloudCaddiePipeline() {
    console.log('🚀 CLOUDCADDIE WORKING PIPELINE');
    console.log('='.repeat(50));
    console.log('Finding buyer groups for IT recruiting services...\n');
    
    try {
        // Load target companies from CSV
        console.log('📂 Loading target companies...');
        const companies = [];
        
        const csvData = await fs.readFile('cloudcaddie_bd - Sheet1.csv', 'utf8');
        const lines = csvData.split('\n').filter(line => line.trim());
        
        // Skip header and parse companies
        for (let i = 1; i < lines.length; i++) {
            const columns = lines[i].split(',').map(col => col.trim().replace(/"/g, ''));
            if (columns.length >= 2) {
                companies.push({
                    name: columns[0],
                    domain: columns[1],
                    size: columns[2] || '',
                    industry: columns[3] || 'Federal IT Consulting',
                    location: columns[4] || ''
                });
            }
        }
        
        console.log(`📊 Loaded ${companies.length} target companies`);
        
        // Process companies with working APIs
        console.log('\n🔄 Processing companies with working APIs...');
        const results = [];
        
        for (let i = 0; i < companies.length; i++) {
            const result = await processCloudCaddieCompany(companies[i], i, companies.length);
            results.push(result);
            
            // Delay between requests to respect rate limits
            if (i < companies.length - 1) {
                await new Promise(resolve => setTimeout(resolve, CLOUDCADDIE_CONFIG.DELAY_BETWEEN_REQUESTS));
            }
        }
        
        // Generate CSV output
        console.log('\n📝 Generating CSV output...');
        const csvOutputData = results.map(result => mapToCloudCaddieCSV(result));
        
        // Calculate overall statistics
        const totalCompanies = results.length;
        const companiesWithData = results.filter(r => r.dataQuality.realExecutives > 0).length;
        const totalExecutives = results.reduce((sum, r) => sum + r.dataQuality.totalExecutives, 0);
        const realExecutives = results.reduce((sum, r) => sum + r.dataQuality.realExecutives, 0);
        const avgDataQuality = results.reduce((sum, r) => sum + r.dataQuality.score, 0) / totalCompanies;
        
        console.log('\n📊 PIPELINE RESULTS SUMMARY');
        console.log('='.repeat(40));
        console.log(`🏢 Total Companies Processed: ${totalCompanies}`);
        console.log(`✅ Companies with Real Data: ${companiesWithData} (${((companiesWithData/totalCompanies)*100).toFixed(1)}%)`);
        console.log(`👥 Total Executives Found: ${totalExecutives}`);
        console.log(`✅ Real Executives Validated: ${realExecutives} (${totalExecutives > 0 ? ((realExecutives/totalExecutives)*100).toFixed(1) : 0}%)`);
        console.log(`📊 Average Data Quality: ${avgDataQuality.toFixed(1)}%`);
        
        // Save to desktop
        const desktopPath = CLOUDCADDIE_CONFIG.DESKTOP_PATH;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
        const filename = `cloudcaddie_buyer_groups_${timestamp}.csv`;
        const filepath = path.join(desktopPath, filename);
        
        const csvWriter = createCsvWriter({
            path: filepath,
            header: [
                { id: 'company_name', title: 'Company Name' },
                { id: 'company_domain', title: 'Company Domain' },
                { id: 'company_size', title: 'Company Size' },
                { id: 'company_industry', title: 'Industry' },
                { id: 'company_location', title: 'Location' },
                { id: 'fiscal_year_end', title: 'Fiscal Year End' },
                { id: 'budget_cycle', title: 'Budget Cycle' },
                { id: 'hiring_season', title: 'Hiring Season' },
                { id: 'project_award_timing', title: 'Project Award Timing' },
                { id: 'primary_decision_maker_name', title: 'Primary Decision Maker Name' },
                { id: 'primary_decision_maker_title', title: 'Primary Decision Maker Title' },
                { id: 'primary_decision_maker_email', title: 'Primary Decision Maker Email' },
                { id: 'primary_decision_maker_phone', title: 'Primary Decision Maker Phone' },
                { id: 'primary_decision_maker_linkedin', title: 'Primary Decision Maker LinkedIn' },
                { id: 'technical_leader_name', title: 'Technical Leader Name' },
                { id: 'technical_leader_title', title: 'Technical Leader Title' },
                { id: 'technical_leader_email', title: 'Technical Leader Email' },
                { id: 'technical_leader_phone', title: 'Technical Leader Phone' },
                { id: 'technical_leader_linkedin', title: 'Technical Leader LinkedIn' },
                { id: 'hr_leader_name', title: 'HR Leader Name' },
                { id: 'hr_leader_title', title: 'HR Leader Title' },
                { id: 'hr_leader_email', title: 'HR Leader Email' },
                { id: 'hr_leader_phone', title: 'HR Leader Phone' },
                { id: 'hr_leader_linkedin', title: 'HR Leader LinkedIn' },
                { id: 'champion_name', title: 'Champion Name' },
                { id: 'champion_title', title: 'Champion Title' },
                { id: 'champion_email', title: 'Champion Email' },
                { id: 'champion_phone', title: 'Champion Phone' },
                { id: 'champion_linkedin', title: 'Champion LinkedIn' },
                { id: 'influencer_name', title: 'Influencer Name' },
                { id: 'influencer_title', title: 'Influencer Title' },
                { id: 'influencer_email', title: 'Influencer Email' },
                { id: 'influencer_phone', title: 'Influencer Phone' },
                { id: 'influencer_linkedin', title: 'Influencer LinkedIn' },
                { id: 'procurement_name', title: 'Procurement Contact Name' },
                { id: 'procurement_title', title: 'Procurement Contact Title' },
                { id: 'procurement_email', title: 'Procurement Contact Email' },
                { id: 'procurement_phone', title: 'Procurement Contact Phone' },
                { id: 'procurement_linkedin', title: 'Procurement Contact LinkedIn' },
                { id: 'data_quality_score', title: 'Data Quality Score' },
                { id: 'real_data_percentage', title: 'Real Data Percentage' },
                { id: 'validation_status', title: 'Validation Status' },
                { id: 'processed_at', title: 'Processed At' },
                { id: 'pipeline_version', title: 'Pipeline Version' }
            ]
        });
        
        await csvWriter.writeRecords(csvOutputData);
        
        console.log(`\n💾 Results saved to: ${filepath}`);
        console.log(`📊 CSV contains ${csvOutputData.length} companies with buyer group data`);
        
        // Final validation
        console.log('\n🔍 FINAL DATA VALIDATION');
        console.log('='.repeat(30));
        
        const companiesWithRealData = csvOutputData.filter(row => 
            row.data_quality_score > 0 && 
            (row.primary_decision_maker_name || row.technical_leader_name || row.hr_leader_name)
        );
        
        console.log(`✅ Companies with validated real data: ${companiesWithRealData.length}/${csvOutputData.length}`);
        
        if (companiesWithRealData.length > 0) {
            console.log('\n🎯 SAMPLE REAL DATA FOUND:');
            companiesWithRealData.slice(0, 3).forEach((company, index) => {
                console.log(`\n   ${index + 1}. ${company.company_name}`);
                if (company.primary_decision_maker_name) {
                    console.log(`      Primary: ${company.primary_decision_maker_name} - ${company.primary_decision_maker_title}`);
                }
                if (company.technical_leader_name) {
                    console.log(`      Technical: ${company.technical_leader_name} - ${company.technical_leader_title}`);
                }
                if (company.hr_leader_name) {
                    console.log(`      HR: ${company.hr_leader_name} - ${company.hr_leader_title}`);
                }
            });
        }
        
        console.log('\n✅ CLOUDCADDIE PIPELINE COMPLETED SUCCESSFULLY!');
        console.log('🚀 Ready for CloudCaddie Consulting to use for IT recruiting outreach');
        
        return {
            success: true,
            filepath,
            statistics: {
                totalCompanies,
                companiesWithData,
                totalExecutives,
                realExecutives,
                avgDataQuality
            }
        };
        
    } catch (error) {
        console.error('❌ Pipeline failed:', error);
        return { success: false, error: error.message };
    }
}

// Export for use in other modules
module.exports = {
    runCloudCaddiePipeline,
    processCloudCaddieCompany,
    mapToCloudCaddieCSV,
    isRealData,
    validateExecutiveData,
    CLOUDCADDIE_CONFIG
};

// Run if called directly
if (require.main === module) {
    runCloudCaddiePipeline();
}
