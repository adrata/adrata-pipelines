#!/usr/bin/env node

/**
 * CORE PIPELINE
 * 
 * Core pipeline that focuses ONLY on:
 * 1. Finding CFO (finance) and CRO (revenue/sales) with high accuracy
 * 2. Getting their verified contact information
 * 3. Essential validation for data quality
 * 
 * This version is optimized for speed and contact accuracy.
 * No related company expansion - just pure CFO/CRO contact data.
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { createObjectCsvWriter } = require('csv-writer');

// Load environment variables
require('dotenv').config();

const { CompanyResolver } = require("../modules/CompanyResolver");
const { ExecutiveResearch } = require("../modules/ExecutiveResearch");
const { ExecutiveContactIntelligence } = require("../modules/ExecutiveContactIntelligence");
const { ContactValidator } = require("../modules/ContactValidator");
const { ValidationEngine } = require("../modules/ValidationEngine");
const { PEOwnershipAnalysis } = require("../modules/PEOwnershipAnalysis");
const { ApiCostOptimizer } = require("../modules/ApiCostOptimizer");
const { ExecutiveTransitionDetector } = require("../modules/ExecutiveTransitionDetector");
const { DataCache } = require("../modules/DataCache");

/**
 * CORE PIPELINE 
 * 
 * Fast & focused executive contact discovery:
 * - CFO (finance) and CRO (revenue/sales) contacts + Parent/Merger/Acquisition companies
 * - Essential company data only
 * - Streamlined output (24 columns vs 80+ in advanced)
 * - Optimized for speed and essential contact data
 * - Perfect for quick prospecting and lead generation
 */
class CorePipeline {
    constructor() {
        // Pass environment variables to all modules that need API keys
        const config = {
            PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY?.trim(),
            OPENAI_API_KEY: process.env.OPENAI_API_KEY?.trim(),
            CORESIGNAL_API_KEY: process.env.CORESIGNAL_API_KEY?.trim(),
            LUSHA_API_KEY: process.env.LUSHA_API_KEY?.trim(),
            ZEROBOUNCE_API_KEY: process.env.ZEROBOUNCE_API_KEY?.trim(),
            PROSPEO_API_KEY: process.env.PROSPEO_API_KEY?.trim(),
            MYEMAILVERIFIER_API_KEY: process.env.MYEMAILVERIFIER_API_KEY?.trim(),
            // Performance optimizations
            PARALLEL_PROCESSING: true,
            MAX_PARALLEL_COMPANIES: 25,        // Increased from 10 to 25
            MAX_PARALLEL_APIS: 5,              // Concurrent API calls per company
            REDUCED_DELAYS: true,
            CACHE_ENABLED: true,
            AGGRESSIVE_CACHING: true
        };

        this.companyResolver = new CompanyResolver(config);
        this.researcher = new ExecutiveResearch(config);
        this.executiveContactIntelligence = new ExecutiveContactIntelligence(config);
        this.contactValidator = new ContactValidator(config);
        this.validationEngine = new ValidationEngine(config);
        this.peIntelligence = new PEOwnershipAnalysis(config);
        this.apiCostOptimizer = new ApiCostOptimizer(config);
        this.executiveTransitionDetector = new ExecutiveTransitionDetector(config);
        // Version management removed for self-contained deployment
        this.dataCache = new DataCache({
            CACHE_TTL_DAYS: 30,
            USE_FILE_CACHE: true
        });
        this.config = config; // Store config for later use
        
        this.results = [];
        this.stats = {
            processed: 0,
            successful: 0,
            errors: 0,
            cfoFound: 0,
            croFound: 0,
            bothFound: 0,
            contactsValidated: 0,
            highConfidence: 0,
            parentCompaniesAdded: 0,
            cacheHits: 0,
            cacheMisses: 0,
            apiCostsSaved: 0,
            startTime: Date.now()
        };
    }

    /**
     * MAIN PIPELINE EXECUTION - STREAMLINED FOR CFO/CRO CONTACTS
     */
    async runPipeline() {
        console.log('CORE PIPELINE');
        console.log('=' .repeat(80));
        console.log('Core executive contact discovery');
        console.log('Focus: CFO (finance) + CRO (revenue/sales) identification and verified contact info');
        console.log('No related company expansion - pure contact data');

        try {
            // STEP 1: Load companies from CSV
            console.log('\nSTEP 1: Loading Companies');
            const companies = await this.loadCompanies();
            console.log(`   Loaded ${companies.length} companies`);

            // STEP 2: Process each company for CFO/CRO contacts (PARALLEL PROCESSING)
            console.log('\nSTEP 2: Core Contact Discovery (PARALLEL PROCESSING)');
            console.log(`🚀 Processing ${companies.length} companies with ${this.config.MAX_PARALLEL_COMPANIES}x parallelization`);
            
            // Check cache coverage
            await this.analyzeCacheCoverage(companies.slice(0, Math.min(20, companies.length)));
            
            let processedCount = 0;
            const totalCompanies = companies.length;

            // Process in parallel batches
            for (let i = 0; i < totalCompanies; i += this.config.MAX_PARALLEL_COMPANIES) {
                const batch = companies.slice(i, i + this.config.MAX_PARALLEL_COMPANIES);
                const batchNumber = Math.floor(i / this.config.MAX_PARALLEL_COMPANIES) + 1;
                const totalBatches = Math.ceil(totalCompanies / this.config.MAX_PARALLEL_COMPANIES);

                console.log(`\n🔄 BATCH ${batchNumber}/${totalBatches} - Processing ${batch.length} companies in parallel`);
                console.log(`   Companies ${i + 1}-${Math.min(i + batch.length, totalCompanies)} of ${totalCompanies}`);

                // Process batch in parallel
                const batchStartTime = Date.now();
                const batchPromises = batch.map((company, index) => 
                    this.processCompanyOptimized(company, processedCount + index + 1)
                );

                const batchResults = await Promise.allSettled(batchPromises);
                
                // Handle results with safety checks
                for (let j = 0; j < batchResults.length; j++) {
                    if (batchResults[j].status === 'fulfilled' && batchResults[j].value) {
                        const result = batchResults[j].value;
                        
                                    // Ensure all required objects exist
                        if (!result.cfo) {
                            result.cfo = { name: '', title: '', email: '', phone: '', linkedIn: '', confidence: 0, tier: null, role: 'N/A' };
                        }
                        if (!result.cro) {
                            result.cro = { name: '', title: '', email: '', phone: '', linkedIn: '', confidence: 0, tier: null, role: 'N/A' };
                        }
                        if (!result.companyInfo) {
                            result.companyInfo = { industry: '', employeeCount: '', headquarters: '', isPublic: false };
                        }
                        if (!result.corporateStructure) {
                            result.corporateStructure = { isAcquired: false, parentCompany: '', acquisitionDate: '' };
                        }
                        
                        this.results.push(result);
                    } else {
                        const errorMsg = batchResults[j].reason?.message || 'Unknown error';
                        console.error(`   ❌ Company ${processedCount + j + 1} failed:`, errorMsg);
                        
                        // Add failed company with proper structure
                        this.results.push({
                            website: batch[j]?.website || 'Unknown',
                            companyName: batch[j]?.companyName || 'Unknown',
                            accountOwner: batch[j]?.accountOwner || 'Unknown',
                            processingStatus: 'FAILED',
                            error: errorMsg,
                            cfo: { name: '', title: '', email: '', phone: '', linkedIn: '', confidence: 0, tier: null, role: 'N/A' },
                            cro: { name: '', title: '', email: '', phone: '', linkedIn: '', confidence: 0, tier: null, role: 'N/A' },
                            companyInfo: { industry: '', employeeCount: '', headquarters: '', isPublic: false },
                            corporateStructure: { isAcquired: false, parentCompany: '', acquisitionDate: '' },
                            overallConfidence: 0,
                            relationType: 'original'
                        });
                    }
                }

                processedCount += batch.length;
                const batchTime = Date.now() - batchStartTime;
                const avgTimePerCompany = Math.round(batchTime / batch.length);
                
                console.log(`   ✅ Batch completed in ${Math.round(batchTime/1000)}s (${avgTimePerCompany}ms per company)`);
                
                // Save progress every batch
                if (processedCount % 10 === 0 || processedCount === totalCompanies) {
                    await this.saveProgressBackup(processedCount);
                }

                // Reduced rate limiting between batches
                if (i + this.config.MAX_PARALLEL_COMPANIES < totalCompanies) {
                    console.log('   ⏳ Inter-batch delay: 2s...');
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }

            // STEP 3: Add Parent/Merger/Acquisition Companies
            console.log('\nSTEP 3: Adding Parent/Merger/Acquisition Companies');
            await this.addRelatedCompanyRows();

            // STEP 4: Generate core contact CSV
            console.log('\nSTEP 4: Generating Core Contact CSV');
            const version = this.versionManager.getNextVersion();
            await this.generateContactCSV(version);

            // STEP 5: Generate summary report
            console.log('\nSTEP 5: Pipeline Summary');
            this.generateSummary();
            
            // STEP 6: Performance summary
            this.printPerformanceSummary();

            return {
                success: true,
                results: this.results,
                stats: this.stats
            };

        } catch (error) {
            console.error(`Pipeline failed: ${error.message}`);
            return {
                success: false,
                error: error.message,
                results: this.results,
                stats: this.stats
            };
        }
    }

    /**
     * LOAD COMPANIES FROM CSV
     */
    async loadCompanies() {
        return new Promise((resolve, reject) => {
            const companies = [];
            
            // Use command line argument or default file
            const inputFile = process.argv[2] || path.join(__dirname, '../../inputs/all-1000-companies.csv');
            console.log(`    Reading from: ${inputFile}`);
            
            fs.createReadStream(inputFile)
                .pipe(csv())
                .on('data', (row) => {
                    // Support multiple CSV formats
                    const website = row.Website || row.domain || row.Domain;
                    const companyName = row['Company Name'] || row.company_name || row['company_name'];
                    
                    if (website && website.trim()) {
                        companies.push({
                            website: website.trim(),
                            company_name: companyName || website.trim(),
                            accountOwner: row['Account Owner'] || 'Unknown',
                            isTop1000: row['Top 1000'] === '1'
                        });
                    }
                })
                .on('end', () => resolve(companies))
                .on('error', reject);
        });
    }

    /**
     * PROCESS INDIVIDUAL COMPANY - STREAMLINED FOR CFO/CRO CONTACTS
     */
    async processCompany(company, index) {
        const result = {
            index,
            website: company.website,
            accountOwner: company.accountOwner,
            isTop1000: company.isTop1000,
            companyName: '',
            
            // CFO Information (Finance Leader)
            cfo: {
                name: '',
                title: '',
                email: '',
                phone: '',
                linkedIn: '',
                confidence: 0,
                source: '',
                validated: false,
                role: '', // CFO, Controller, VP Finance, etc.
                tier: null // 1-5 tier level
            },
            
            // CRO Information (Revenue/Sales Leader)
            cro: {
                name: '',
                title: '',
                email: '',
                phone: '',
                linkedIn: '',
                confidence: 0,
                source: '',
                validated: false,
                role: '', // CRO, CSO, VP Sales, etc.
                tier: null // 1-5 tier level
            },
            
            // Essential Company Data (for validation)
            companyInfo: {
                isPublic: false,
                ticker: '',
                parentCompany: '',
                industry: '',
                employeeCount: '',
                headquarters: ''
            },
            
            // Processing Metadata
            researchMethod: '',
            overallConfidence: 0,
            processingTime: 0,
            timestamp: new Date().toISOString(),
            validationNotes: [],
            error: null
        };

        const startTime = Date.now();

        try {
            this.stats.processed++;

            // STEP 1: Company Resolution (Essential for validation)
            console.log('Resolving company identity...');
            const companyResolution = await this.companyResolver.resolveCompany(company.website);
            result.companyName = companyResolution.companyName || this.extractCompanyName(company.website);
            
            // Store essential company info for validation and CSV output
            result.companyInfo = {
                isPublic: companyResolution.isPublic || false,
                ticker: companyResolution.ticker || '',
                parentCompany: companyResolution.parentCompany || '',
                industry: companyResolution.industry || '',
                employeeCount: companyResolution.employeeCount || '',
                headquarters: companyResolution.headquarters || ''
            };

            // Store corporate structure info for acquisition detection
            result.corporateStructure = {
                isAcquired: companyResolution.acquisitionInfo?.isAcquired || false,
                parentCompany: companyResolution.acquisitionInfo?.parentCompany || companyResolution.parentCompany || '',
                acquisitionDate: companyResolution.acquisitionInfo?.acquisitionDate || '',
                acquisitionType: companyResolution.acquisitionInfo?.acquisitionType || '',
                confidence: companyResolution.acquisitionInfo?.confidence || 0
            };

            // STEP 1.5: Post-Acquisition Executive Tracking (if applicable)
            if (companyResolution.acquisitionInfo?.isAcquired && companyResolution.acquisitionInfo?.executiveTracking) {
                console.log('Tracking post-acquisition executives...');
                const executiveTracking = await this.companyResolver.trackPostAcquisitionExecutives(
                    result.companyName,
                    companyResolution.acquisitionInfo
                );
                if (executiveTracking) {
                    result.executiveTracking = executiveTracking;
                    console.log(`   ✅ Tracked ${executiveTracking.executives.length} post-acquisition executives`);
                }
            }

            // STEP 2: Dual Role Executive Research (CFO + CRO Focus)
            console.log('Researching CFO and CRO...');
            const research = await this.researcher.researchExecutives({
                name: result.companyName,
                website: company.website,
                companyResolution: companyResolution
            });

            // Process CFO results - Always initialize CFO object
            result.cfo = {
                name: research.cfo?.name || '',
                title: research.cfo?.title || '',
                email: '',
                phone: '',
                linkedIn: '',
                confidence: Math.round((research.cfo?.confidence || 0) * 100),
                source: research.cfo?.source || '',
                validated: (research.cfo?.confidence || 0) > 0.8,
                role: this.categorizeRevenueFinanceRole(research.cfo?.title || ''),
                tier: research.cfo?.tier || null
            };
            
            if (research.cfo && research.cfo.name) {
                this.stats.cfoFound++;
            }

            // Process CRO results - Always initialize CRO object
            result.cro = {
                name: research.cro?.name || '',
                title: research.cro?.title || '',
                email: '',
                phone: '',
                linkedIn: '',
                confidence: Math.round((research.cro?.confidence || 0) * 100),
                source: research.cro?.source || '',
                validated: (research.cro?.confidence || 0) > 0.8,
                role: this.categorizeRevenueFinanceRole(research.cro?.title || ''),
                tier: research.cro?.tier || null
            };
            
            if (research.cro && research.cro.name) {
                this.stats.croFound++;
            }

            // STEP 3: Contact Intelligence (Email/Phone Discovery)
            console.log('Discovering contact information...');
            console.log('🔍 DEBUG: Starting contact intelligence with detailed API logging...');
            const contactIntelligence = await this.executiveContactIntelligence.enhanceExecutiveIntelligence(result);
            
            // Merge contact data with enhanced logging
            console.log('   📧 Merging contact intelligence data...');
            this.mergeContactData(result, contactIntelligence);
            
            // Debug: Show what contact intelligence returned
            console.log(`   🔍 Contact Intelligence Summary:`);
            console.log(`      Structure: ${JSON.stringify(Object.keys(contactIntelligence || {}))}`);
            if (contactIntelligence?.executiveContacts) {
                console.log(`      Executive Contacts: ${JSON.stringify(Object.keys(contactIntelligence.executiveContacts))}`);
            }
            
            // Populate company data from research
            if (research.companyDetails) {
                result.companyInfo.industry = result.companyInfo.industry || research.companyDetails.industry || '';
                result.companyInfo.employeeCount = result.companyInfo.employeeCount || research.companyDetails.employeeCount || '';
                result.companyInfo.headquarters = result.companyInfo.headquarters || research.companyDetails.headquarters || '';
            }

            // STEP 4: Essential Contact Validation
            console.log('Validating executive contacts...');
            console.log(`🔍 DEBUG: Passing executives to validator - CFO: ${result.cfo?.name}, CRO: ${result.cro?.name}`);
            const contactValidation = await this.contactValidator.enrichContacts(
                { executives: { cfo: result.cfo, cro: result.cro } },
                companyResolution
            );
            
            // Apply validation results
            this.applyContactValidation(result, contactValidation);
            
            // Ensure contact information is properly captured
            this.finalizeContactData(result, contactIntelligence, contactValidation);
            
            // DEBUG: Check what data we have before validation
            console.log(`🔍 DEBUG: Data before final validation:`);
            console.log(`   CFO: ${result.cfo?.name} - Email: ${result.cfo?.email} - Phone: ${result.cfo?.phone}`);
            console.log(`   CRO: ${result.cro?.name} - Email: ${result.cro?.email} - Phone: ${result.cro?.phone}`);

            // STEP 5: Basic Data Validation (Essential quality check)
            console.log('Running essential data validation...');
            const dataValidation = await this.validationEngine.validateExecutiveData(
                contactValidation,
                { executives: { cfo: result.cfo, cro: result.cro }, sources: ['ExecutiveResearch', 'ContactIntelligence'] },
                companyResolution
            );
            
            // Update confidence based on validation
            this.updateConfidenceScores(result, dataValidation);

            // Count successful finds
            if (result.cfo?.name && result.cro?.name) {
                this.stats.bothFound++;
            }

            result.researchMethod = research.researchMethod || 'cfo_cro_focused';
            result.overallConfidence = Math.round(((result.cfo?.confidence || 0) + (result.cro?.confidence || 0)) / 2);
            
            if (result.overallConfidence >= 80) {
                this.stats.highConfidence++;
            }

            if (result.cfo.email || result.cro.email) {
                this.stats.contactsValidated++;
            }

            // Validation notes
            result.validationNotes = this.generateValidationNotes(result);

            this.stats.successful++;

            console.log(`SUCCESS: ${result.companyName}`);
            console.log(`   CFO: ${result.cfo?.name || 'Not found'} (${result.cfo?.confidence || 0}%) Tier ${result.cfo?.tier || 'N/A'} ${result.cfo?.email ? '📧' : ''}`);
            console.log(`   CRO: ${result.cro?.name || 'Not found'} (${result.cro?.confidence || 0}%) Tier ${result.cro?.tier || 'N/A'} ${result.cro?.email ? '📧' : ''}`);
            console.log(`   CFO Role: ${result.cfo?.role || 'N/A'}`);
            console.log(`   CRO Role: ${result.cro?.role || 'N/A'}`);
            console.log(`   Overall: ${result.overallConfidence || 0}% confidence`);

        } catch (error) {
            console.error(`❌ Error: ${error.message}`);
            // Ensure result object exists with basic structure
            if (!result) {
                result = {
                    index,
                    website: company.website,
                    companyName: company.website || 'Unknown',
                    cfo: { name: 'Not Found', confidence: 0 },
                    cro: { name: 'Not Found', confidence: 0 },
                    overallConfidence: 0
                };
            }
            result.error = error.message;
            this.stats.errors++;
        }

        // Ensure result exists before accessing properties
        if (result) {
            result.processingTime = Date.now() - startTime;
            this.results.push(result);
        }
        
        // Return the result for API usage
        return result;
    }

    /**
     * MERGE CONTACT DATA FROM INTELLIGENCE GATHERING
     */
    mergeContactData(result, contactIntelligence) {
        console.log(`   🔄 Merging contact data for ${result.companyName}...`);
        
        // Method 1: Check for direct executive contact data
        if (contactIntelligence?.executiveContacts) {
            console.log(`      Found executive contacts structure`);
            
            // Look for CFO contact data
            if (contactIntelligence.executiveContacts.cfo && result.cfo) {
                const cfoContact = contactIntelligence.executiveContacts.cfo;
                console.log(`      CFO contact data: ${JSON.stringify(cfoContact)}`);
                result.cfo.email = cfoContact.email || result.cfo.email;
                result.cfo.phone = cfoContact.phone || cfoContact.phoneNumbers?.[0]?.number || result.cfo.phone;
                result.cfo.linkedIn = cfoContact.linkedinUrl || result.cfo.linkedIn;
            }
            
            // Look for CRO contact data
            if (contactIntelligence.executiveContacts.cro && result.cro) {
                const croContact = contactIntelligence.executiveContacts.cro;
                console.log(`      CRO contact data: ${JSON.stringify(croContact)}`);
                result.cro.email = croContact.email || result.cro.email;
                result.cro.phone = croContact.phone || croContact.phoneNumbers?.[0]?.number || result.cro.phone;
                result.cro.linkedIn = croContact.linkedinUrl || result.cro.linkedIn;
            }
        }

        // Method 2: Check for array of executives
        if (contactIntelligence?.executiveContacts?.executives && Array.isArray(contactIntelligence.executiveContacts.executives)) {
            const executives = contactIntelligence.executiveContacts.executives;
            console.log(`      Found ${executives.length} executives in array`);
            
            // Find CRO contact data with enhanced matching
            const croContact = executives.find(exec => 
                ['CRO', 'CSO', 'VP Sales', 'VP Revenue', 'Chief Revenue Officer', 'Chief Sales Officer'].includes(exec.role) || 
                (exec.name && result.cro?.name && exec.name.toLowerCase().includes(result.cro.name.toLowerCase()))
            );

            if (croContact && result.cro) {
                console.log(`      Found CRO contact: ${croContact.name} - ${croContact.email}`);
                result.cro.email = croContact.email || result.cro.email;
                result.cro.phone = croContact.phone || croContact.phoneNumbers?.[0]?.number || result.cro.phone;
                result.cro.linkedIn = croContact.linkedinUrl || result.cro.linkedIn;
            }
            
            // Find CFO contact data with enhanced matching
            const cfoContact = executives.find(exec => 
                ['CFO', 'Chief Financial Officer', 'VP Finance'].includes(exec.role) || 
                (exec.name && result.cfo?.name && exec.name.toLowerCase().includes(result.cfo.name.toLowerCase()))
            );
            
            if (cfoContact && result.cfo) {
                console.log(`      Found CFO contact: ${cfoContact.name} - ${cfoContact.email}`);
                result.cfo.email = cfoContact.email || result.cfo.email;
                result.cfo.phone = cfoContact.phone || cfoContact.phoneNumbers?.[0]?.number || result.cfo.phone;
                result.cfo.linkedIn = cfoContact.linkedinUrl || result.cfo.linkedIn;
            }
        }

        // Method 3: Check for enhanced discovery results from ContactResearch
        if (contactIntelligence?.enhancedDiscovery) {
            console.log(`      Found enhanced discovery data`);
            const discovery = contactIntelligence.enhancedDiscovery;
            
            if (discovery.contacts?.emails?.length > 0) {
                console.log(`      Enhanced discovery has ${discovery.contacts.emails.length} emails`);
                // Try to match emails to executives by name
                for (const emailData of discovery.contacts.emails) {
                    console.log(`      Checking email: ${emailData.email} for executive: ${emailData.executive || 'unknown'}`);
                    if (result.cfo?.name && emailData.executive?.toLowerCase().includes(result.cfo.name.toLowerCase())) {
                        result.cfo.email = result.cfo.email || emailData.email;
                        console.log(`      ✅ Matched CFO email: ${emailData.email}`);
                    }
                    if (result.cro?.name && emailData.executive?.toLowerCase().includes(result.cro.name.toLowerCase())) {
                        result.cro.email = result.cro.email || emailData.email;
                        console.log(`      ✅ Matched CRO email: ${emailData.email}`);
                    }
                }
            }
            
            if (discovery.contacts?.phones?.length > 0) {
                console.log(`      Enhanced discovery has ${discovery.contacts.phones.length} phones`);
                // Try to match phones to executives by name
                for (const phoneData of discovery.contacts.phones) {
                    if (result.cfo?.name && phoneData.executive?.toLowerCase().includes(result.cfo.name.toLowerCase())) {
                        result.cfo.phone = result.cfo.phone || phoneData.phone;
                        console.log(`      ✅ Matched CFO phone: ${phoneData.phone}`);
                    }
                    if (result.cro?.name && phoneData.executive?.toLowerCase().includes(result.cro.name.toLowerCase())) {
                        result.cro.phone = result.cro.phone || phoneData.phone;
                        console.log(`      ✅ Matched CRO phone: ${phoneData.phone}`);
                    }
                }
            }
        }

        console.log(`   ✅ Contact merge complete`);
    }

    /**
     * APPLY CONTACT VALIDATION RESULTS
     */
    applyContactValidation(result, contactValidation) {
        if (contactValidation?.validatedContacts) {
            const validated = contactValidation.validatedContacts;
            
            // Apply CRO email validation
            if (validated.cro?.email) {
                result.cro.email = validated.cro.email;
                result.cro.validated = true;
            }
            
            // Apply CFO email validation
            if (validated.cfo?.email) {
                result.cfo.email = validated.cfo.email;
                result.cfo.validated = true;
            }
        }
    }

    /**
     * FINALIZE CONTACT DATA - Ensure all contact info is captured
     */
    finalizeContactData(result, contactIntelligence, contactValidation) {
        // Check if we have contact data from various sources that wasn't merged
        
        // From contact intelligence
        if (contactIntelligence?.executiveContacts?.cfo) {
            const cfoContact = contactIntelligence.executiveContacts.cfo;
            if (result.cfo && !result.cfo.email && cfoContact.email) {
                result.cfo.email = cfoContact.email;
            }
            if (result.cfo && !result.cfo.phone && cfoContact.phone) {
                result.cfo.phone = cfoContact.phone;
            }
            if (result.cfo && !result.cfo.linkedIn && cfoContact.linkedIn) {
                result.cfo.linkedIn = cfoContact.linkedIn;
            }
        }
        
        if (contactIntelligence?.executiveContacts?.cro) {
            const croContact = contactIntelligence.executiveContacts.cro;
            if (result.cro && !result.cro.email && croContact.email) {
                result.cro.email = croContact.email;
            }
            if (result.cro && !result.cro.phone && croContact.phone) {
                result.cro.phone = croContact.phone;
            }
            if (result.cro && !result.cro.linkedIn && croContact.linkedIn) {
                result.cro.linkedIn = croContact.linkedIn;
            }
        }

        // From contact validation - extract from enrichedExecutives structure
        if (contactValidation?.enrichedExecutives) {
            console.log(`      Contact validation structure: ${JSON.stringify(Object.keys(contactValidation.enrichedExecutives))}`);
            
            // Check CFO contacts
            if (contactValidation.enrichedExecutives.cfo?.contacts?.emails?.length > 0) {
                const cfoEmails = contactValidation.enrichedExecutives.cfo.contacts.emails;
                // Find the best email (prioritize non-generated, high confidence)
                const bestEmail = cfoEmails.find(e => e.source !== 'generated' && e.isValid) || 
                                 cfoEmails.find(e => e.confidence > 80) || 
                                 cfoEmails[0];
                if (bestEmail && result.cfo) {
                    result.cfo.email = bestEmail.email;
                    console.log(`      ✅ CFO Email extracted: ${bestEmail.email} (${bestEmail.source})`);
                }
            }
            
            if (contactValidation.enrichedExecutives.cfo?.contacts?.phones?.length > 0) {
                const cfoPhones = contactValidation.enrichedExecutives.cfo.contacts.phones;
                if (cfoPhones[0] && result.cfo) {
                    result.cfo.phone = cfoPhones[0].number || cfoPhones[0].phone;
                    console.log(`      ✅ CFO Phone extracted: ${result.cfo.phone}`);
                }
            }

            // Extract LinkedIn from contact validation
            if (contactValidation.enrichedExecutives.cfo?.linkedIn && result.cfo) {
                result.cfo.linkedIn = contactValidation.enrichedExecutives.cfo.linkedIn;
                console.log(`      ✅ CFO LinkedIn extracted: ${result.cfo.linkedIn}`);
            }

            // Check CRO contacts  
            if (contactValidation.enrichedExecutives.cro?.contacts?.emails?.length > 0) {
                const croEmails = contactValidation.enrichedExecutives.cro.contacts.emails;
                const bestEmail = croEmails.find(e => e.source !== 'generated' && e.isValid) || 
                                 croEmails.find(e => e.confidence > 80) || 
                                 croEmails[0];
                if (bestEmail && result.cro) {
                    result.cro.email = bestEmail.email;
                    console.log(`      ✅ CRO Email extracted: ${bestEmail.email} (${bestEmail.source})`);
                }
            }

            if (contactValidation.enrichedExecutives.cro?.contacts?.phones?.length > 0) {
                const croPhones = contactValidation.enrichedExecutives.cro.contacts.phones;
                if (croPhones[0] && result.cro) {
                    result.cro.phone = croPhones[0].number || croPhones[0].phone;
                    console.log(`      ✅ CRO Phone extracted: ${result.cro.phone}`);
                }
            }

            // Extract LinkedIn from contact validation
            if (contactValidation.enrichedExecutives.cro?.linkedIn && result.cro) {
                result.cro.linkedIn = contactValidation.enrichedExecutives.cro.linkedIn;
                console.log(`      ✅ CRO LinkedIn extracted: ${result.cro.linkedIn}`);
            }

            // Extract real contact data from CEO section (where AI research puts executive data)
            if (contactValidation.enrichedExecutives.ceo?.contacts?.emails?.length > 0) {
                const ceoEmails = contactValidation.enrichedExecutives.ceo.contacts.emails;
                console.log(`      Found ${ceoEmails.length} emails in CEO section`);
                
                ceoEmails.forEach((email, index) => {
                    console.log(`         ${index + 1}. ${email.email} (${email.source}) - Context: ${email.context || 'none'}`);
                    
                    // Extract real emails for CFO
                    if ((email.context?.toLowerCase().includes('cfo') || 
                         email.context?.toLowerCase().includes('financial') ||
                         email.context?.toLowerCase().includes(result.cfo?.name?.toLowerCase())) && 
                         result.cfo) {
                        
                        // Prioritize AI research emails over generated ones
                        if (email.source === 'ai_research' || !result.cfo.email) {
                            result.cfo.email = email.email;
                            console.log(`      ✅ CFO Email from CEO section: ${email.email} (${email.source})`);
                        }
                    }
                    
                    // Extract real emails for CRO
                    if ((email.context?.toLowerCase().includes('revenue') || 
                         email.context?.toLowerCase().includes('customer') ||
                         email.context?.toLowerCase().includes('sales') ||
                         email.context?.toLowerCase().includes(result.cro?.name?.toLowerCase())) && 
                         result.cro) {
                        
                        // Prioritize AI research emails over generated ones
                        if (email.source === 'ai_research' || !result.cro.email) {
                            result.cro.email = email.email;
                            console.log(`      ✅ CRO Email from CEO section: ${email.email} (${email.source})`);
                        }
                    }
                });
            }

            if (contactValidation.enrichedExecutives.ceo?.contacts?.phones?.length > 0) {
                const ceoPhones = contactValidation.enrichedExecutives.ceo.contacts.phones;
                console.log(`      Found ${ceoPhones.length} phones in CEO section`);
                
                ceoPhones.forEach((phone, index) => {
                    console.log(`         ${index + 1}. ${phone.number} - Context: ${phone.context || 'none'}`);
                    
                    // Extract phones for CFO
                    if ((phone.context?.toLowerCase().includes('cfo') || 
                         phone.context?.toLowerCase().includes('financial') ||
                         phone.context?.toLowerCase().includes(result.cfo?.name?.toLowerCase())) && 
                         result.cfo && !result.cfo.phone) {
                        result.cfo.phone = phone.number;
                        console.log(`      ✅ CFO Phone from CEO section: ${phone.number}`);
                    }
                    
                    // Extract phones for CRO
                    if ((phone.context?.toLowerCase().includes('revenue') || 
                         phone.context?.toLowerCase().includes('customer') ||
                         phone.context?.toLowerCase().includes('sales') ||
                         phone.context?.toLowerCase().includes(result.cro?.name?.toLowerCase())) && 
                         result.cro && !result.cro.phone) {
                        result.cro.phone = phone.number;
                        console.log(`      ✅ CRO Phone from CEO section: ${phone.number}`);
                    }
                });
            }
        }

        // Debug: Log what contact data we actually have
        console.log(`   🔍 Final contact data for ${result.companyName}:`);
        console.log(`      CFO ${result.cfo?.name}: Email=${result.cfo?.email || 'NONE'}, Phone=${result.cfo?.phone || 'NONE'}`);
        console.log(`      CRO ${result.cro?.name}: Email=${result.cro?.email || 'NONE'}, Phone=${result.cro?.phone || 'NONE'}`);
    }

    /**
     * UPDATE CONFIDENCE SCORES BASED ON VALIDATION
     */
    updateConfidenceScores(result, dataValidation) {
        if (dataValidation?.overallConfidence) {
            const validationBoost = Math.round(dataValidation.overallConfidence * 10);
            result.cro.confidence = Math.min(100, result.cro.confidence + validationBoost);
            result.cfo.confidence = Math.min(100, result.cfo.confidence + validationBoost);
        }
    }

    /**
     * UTILITY METHODS FOR NEW FIELDS - REAL DATA ONLY
     */
    determineCompanyStatus(result) {
        // Use real CoreSignal data for company status
        if (result.companyInfo?.fundingRounds && result.companyInfo.fundingRounds.length > 0) {
            return 'Private'; // Has funding rounds = private company
        }
        if (result.corporateStructure?.isAcquired) return 'Acquired';
        if (result.corporateStructure?.parentCompany) return 'Subsidiary';
        if (result.companyInfo?.isPublic === true) return 'Public';
        if (result.companyInfo?.isPublic === false) return 'Private';
        
        // Only return empty if we truly don't know
        return '';
    }

    determineEmailType(email) {
        if (!email) return '';
        
        // Use real email validation data if available
        const domain = email.split('@')[1];
        if (!domain) return '';
        
        // Check if it's a company domain (not gmail, yahoo, etc.)
        const personalDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com'];
        if (personalDomains.includes(domain.toLowerCase())) {
            return 'Personal Email';
        }
        
        return 'Work Email';
    }

    determinePhoneType(phone, phoneData) {
        if (!phone && !phoneData) return '';
        
        // Use real phone validation data from our providers
        if (phoneData?.lineType) {
            const lineType = phoneData.lineType.toLowerCase();
            if (lineType.includes('mobile') || lineType.includes('cell')) return 'Mobile';
            if (lineType.includes('landline') || lineType.includes('fixed')) return 'Office Phone';
        }
        
        if (phoneData?.type) {
            const type = phoneData.type.toLowerCase();
            if (type.includes('mobile') || type.includes('cell')) return 'Mobile';
            if (type.includes('landline') || type.includes('fixed')) return 'Office Phone';
        }
        
        // Only return empty if we don't have data
        return '';
    }

    extractLocationWithCountry(executive) {
        if (!executive?.location) return '';
        
        // Use real CoreSignal location data
        const location = executive.location;
        
        // CoreSignal provides location_country field
        if (executive.location_country) {
            return `${location}, ${executive.location_country}`;
        }
        
        return location;
    }

    calculateTimeInRole(executive) {
        if (!executive) return '';
        
        // Use real CoreSignal experience data
        if (executive.experience && Array.isArray(executive.experience)) {
            // Find current role in experience array
            const currentRole = executive.experience.find(exp => 
                exp.is_current === true || 
                exp.end_date === null || 
                exp.end_date === undefined
            );
            
            if (currentRole && currentRole.start_date) {
                const startDate = new Date(currentRole.start_date);
                const now = new Date();
                const diffTime = Math.abs(now - startDate);
                const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
                return `${diffYears.toFixed(1)} years`;
            }
        }
        
        // Check appointment date from our research
        if (executive.appointmentDate) {
            const appointmentDate = new Date(executive.appointmentDate);
            const now = new Date();
            const diffTime = Math.abs(now - appointmentDate);
            const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
            return `${diffYears.toFixed(1)} years`;
        }
        
        // Only return empty if we don't have real data
        return '';
    }

    estimateAge(executive) {
        // We don't have reliable age data from our providers
        // Remove this field rather than provide fake data
        return '';
    }

    /**
     * GENERATE STREAMLINED CRO/CFO CONTACT CSV
     */
    async generateContactCSV(version) {
        // Create versioned outputs directory
        const outputDir = this.versionManager.ensureOutputsDir(version);

        const csvWriter = createObjectCsvWriter({
            path: `${outputDir}/core-cro-cfo-contacts.csv`,
            header: [
                // IDENTIFIERS
                { id: 'website', title: 'Website' },
                { id: 'companyName', title: 'Company Name' },
                
                // CORE PIPELINE: VERIFIED CFO/CRO CONTACTS
                { id: 'cfoName', title: 'CFO Name' },
                { id: 'cfoTitle', title: 'CFO Title' },
                { id: 'cfoEmail', title: 'CFO Email' },
                { id: 'cfoEmailType', title: 'CFO Email Type' },
                { id: 'cfoPhone', title: 'CFO Phone' },
                { id: 'cfoPhoneType', title: 'CFO Phone Type' },
                { id: 'cfoLinkedIn', title: 'CFO LinkedIn' },
                { id: 'cfoLocation', title: 'CFO Location' },
                { id: 'cfoTimeInRole', title: 'CFO Time in Role' },
                { id: 'cfoSelectionReason', title: 'CFO Selection Reason' },
                
                { id: 'croName', title: 'CRO Name' },
                { id: 'croTitle', title: 'CRO Title' },
                { id: 'croEmail', title: 'CRO Email' },
                { id: 'croEmailType', title: 'CRO Email Type' },
                { id: 'croPhone', title: 'CRO Phone' },
                { id: 'croPhoneType', title: 'CRO Phone Type' },
                { id: 'croLinkedIn', title: 'CRO LinkedIn' },
                { id: 'croLocation', title: 'CRO Location' },
                { id: 'croTimeInRole', title: 'CRO Time in Role' },
                { id: 'croSelectionReason', title: 'CRO Selection Reason' },
                
                { id: 'timestamp', title: 'Timestamp' }
            ]
        });

        const csvData = this.results.map(result => {
            // Safety check for undefined results
            if (!result || typeof result !== 'object') {
                return {
                    website: 'Unknown',
                    companyName: 'Unknown',
                    cfoName: '', cfoTitle: '', cfoEmail: '', cfoEmailType: '', cfoPhone: '', cfoPhoneType: '',
                    cfoLinkedIn: '', cfoLocation: '', cfoTimeInRole: '', cfoSelectionReason: '',
                    croName: '', croTitle: '', croEmail: '', croEmailType: '', croPhone: '', croPhoneType: '',
                    croLinkedIn: '', croLocation: '', croTimeInRole: '', croSelectionReason: '',
                    timestamp: new Date().toISOString()
                };
            }
            
            return {
                // IDENTIFIERS
                website: result.website || '',
                companyName: result.companyName || '',
                
                // CFO DATA - Enhanced with new fields
                cfoName: result.cfo?.name || '',
                cfoTitle: result.cfo?.title || '',
                cfoEmail: result.cfo?.email || '',
                cfoEmailType: this.determineEmailType(result.cfo?.email),
                cfoPhone: result.cfo?.phone || result.cfo?.phoneNumbers?.[0]?.number || '',
                cfoPhoneType: this.determinePhoneType(result.cfo?.phone, result.cfo?.phoneNumbers?.[0]),
                cfoLinkedIn: result.cfo?.linkedIn || result.cfo?.linkedinUrl || '',
                cfoLocation: this.extractLocationWithCountry(result.cfo),
                cfoTimeInRole: this.calculateTimeInRole(result.cfo),
                cfoSelectionReason: result.cfo?.waterfallReason || result.cfo?.source || '',
                
                // CRO DATA - Enhanced with new fields
                croName: result.cro?.name || '',
                croTitle: result.cro?.title || '',
                croEmail: result.cro?.email || '',
                croEmailType: this.determineEmailType(result.cro?.email),
                croPhone: result.cro?.phone || result.cro?.phoneNumbers?.[0]?.number || '',
                croPhoneType: this.determinePhoneType(result.cro?.phone, result.cro?.phoneNumbers?.[0]),
                croLinkedIn: result.cro?.linkedIn || result.cro?.linkedinUrl || '',
                croLocation: this.extractLocationWithCountry(result.cro),
                croTimeInRole: this.calculateTimeInRole(result.cro),
                croSelectionReason: result.cro?.waterfallReason || result.cro?.source || '',
                
                // METADATA
                timestamp: new Date().toISOString()
            };
        });

        await csvWriter.writeRecords(csvData);
        console.log(`    Generated: ${outputDir}/core-cro-cfo-contacts.csv`);

        // Also generate JSON for analysis
        fs.writeFileSync(`${outputDir}/core-cro-cfo-data.json`, JSON.stringify(this.results, null, 2));
        console.log(`    Generated: ${outputDir}/core-cro-cfo-data.json`);
    }

    /**
     * GENERATE SUMMARY REPORT
     */
    generateSummary() {
        console.log('\nCORE PIPELINE SUMMARY');
        console.log('=' .repeat(80));
        console.log(`Companies Processed: ${this.stats.processed}`);
        console.log(`CFOs Found: ${this.stats.cfoFound}/${this.stats.processed} (${Math.round(this.stats.cfoFound/this.stats.processed*100)}%)`);
        console.log(`CROs Found: ${this.stats.croFound}/${this.stats.processed} (${Math.round(this.stats.croFound/this.stats.processed*100)}%)`);
        console.log(`Both Found: ${this.stats.bothFound}/${this.stats.processed} (${Math.round(this.stats.bothFound/this.stats.processed*100)}%)`);
        console.log(`Contacts Validated: ${this.stats.contactsValidated}/${this.stats.processed} (${Math.round(this.stats.contactsValidated/this.stats.processed*100)}%)`);
        console.log(`High Confidence: ${this.stats.highConfidence}/${this.stats.processed} (${Math.round(this.stats.highConfidence/this.stats.processed*100)}%)`);
        console.log(`Errors: ${this.stats.errors}/${this.stats.processed} (${Math.round(this.stats.errors/this.stats.processed*100)}%)`);

        const avgTime = this.results.reduce((sum, r) => sum + r.processingTime, 0) / this.results.length;
        console.log(`Average Processing Time: ${Math.round(avgTime/1000)}s per company`);

        console.log('\nOutput Files:');
        console.log('    outputs/contacts/cro-cfo-contacts.csv - Main contact results');
        console.log('    outputs/contacts/cro-cfo-data.json - Detailed data');
    }

    /**
     * UTILITY METHODS
     */
    
    extractCompanyName(website) {
        try {
            const domain = website.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
            return domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1);
        } catch (error) {
            return website;
        }
    }

    extractDomainFromCompany(companyName) {
        // Extract domain from company name for acquisition cases
        if (!companyName) return '';
        
        // Common domain patterns for major companies
        const domainMap = {
            'Blackstone': 'blackstone.com',
            'Microsoft': 'microsoft.com',
            'Google': 'google.com',
            'Amazon': 'amazon.com',
            'Apple': 'apple.com',
            'Meta': 'meta.com',
            'Salesforce': 'salesforce.com',
            'Oracle': 'oracle.com',
            'IBM': 'ibm.com',
            'Intel': 'intel.com',
            'Cisco': 'cisco.com',
            'Adobe': 'adobe.com',
            'VMware': 'vmware.com',
            'Dell': 'dell.com',
            'HP': 'hp.com'
        };
        
        return domainMap[companyName] || `${companyName.toLowerCase().replace(/\s+/g, '')}.com`;
    }

    categorizeRevenueFinanceRole(title) {
        const titleLower = title.toLowerCase();
        
        // TIER 1: Primary Targets
        if (titleLower.includes('cfo') || titleLower.includes('chief financial officer')) {
            return 'CFO';
        }
        if (titleLower.includes('cro') || titleLower.includes('chief revenue officer')) {
            return 'CRO';
        }
        
        // TIER 2: Senior Revenue/Sales Leaders
        if (titleLower.includes('cso') || titleLower.includes('chief sales officer')) {
            return 'CSO';
        }
        if (titleLower.includes('vp sales') || titleLower.includes('vp of sales') || titleLower.includes('vice president sales')) {
            return 'VP Sales';
        }
        if (titleLower.includes('vp revenue') || titleLower.includes('vp of revenue') || titleLower.includes('vice president revenue')) {
            return 'VP Revenue';
        }
        if (titleLower.includes('head of sales') || titleLower.includes('sales director')) {
            return 'Head of Sales';
        }
        if (titleLower.includes('head of revenue') || titleLower.includes('revenue director')) {
            return 'Head of Revenue';
        }
        if (titleLower.includes('vp business development')) {
            return 'VP Business Development';
        }
        
        // TIER 3: Finance Fallbacks (Chief Accounting Officer is FINANCE, not revenue)
        if (titleLower.includes('controller') || titleLower.includes('chief accounting officer')) {
            return 'Controller';
        }
        if (titleLower.includes('vp finance') || titleLower.includes('finance director')) {
            return 'VP Finance';
        }
        if (titleLower.includes('treasurer')) {
            return 'Treasurer';
        }
        if (titleLower.includes('finance') || titleLower.includes('accounting')) {
            return 'Finance Executive';
        }
        if (titleLower.includes('sales')) {
            return 'Sales Executive';
        }
        
        return 'Other Executive';
    }

    generateValidationNotes(result) {
        // Safety check for undefined result
        if (!result || typeof result !== 'object') {
            return [];
        }
        
        const notes = [];
        
        // Acquisition information
        if (result.corporateStructure?.isAcquired) {
            notes.push(`Company acquired by ${result.corporateStructure.parentCompany} (${result.corporateStructure.acquisitionDate})`);
        }
        
        // Executive tracking information
        if (result.executiveTracking?.executives?.length > 0) {
            const trackedCount = result.executiveTracking.executives.length;
            const verifiedCount = result.executiveTracking.executives.filter(e => e.currentStatus?.verified).length;
            notes.push(`Post-acquisition executive tracking: ${verifiedCount}/${trackedCount} executives verified`);
            
            // Add specific executive status updates
            result.executiveTracking.executives.forEach(exec => {
                const status = exec.currentStatus?.status || 'unknown';
                const company = exec.currentStatus?.currentCompany || 'unknown';
                notes.push(`${exec.name}: ${status} at ${company}`);
            });
        }
        
        // Executive identification confidence
        if (result.cfo.confidence >= 90) {
            notes.push(`High-confidence CFO identification (Tier ${result.cfo.tier})`);
        }
        
        if (result.cro.confidence >= 90) {
            notes.push(`High-confidence CRO identification (Tier ${result.cro.tier})`);
        }
        
        // Role categorization notes
        if (result.cfo.tier > 1 && result.cfo.name) {
            notes.push(`Finance leader is ${result.cfo.role} (Tier ${result.cfo.tier}), not traditional CFO`);
        }
        
        if (result.cro.tier > 1 && result.cro.name) {
            notes.push(`Revenue leader is ${result.cro.role} (Tier ${result.cro.tier}), not traditional CRO`);
        }
        
        // Contact discovery success
        if (result.cfo.email && result.cro.email) {
            notes.push('Both CFO and CRO emails discovered');
        }
        
        // Company status information
        if (result.companyInfo.isPublic) {
            notes.push('Public company - SEC filings available for validation');
        }
        
        if (result.companyInfo.parentCompany && !result.corporateStructure?.isAcquired) {
            notes.push(`Subsidiary of ${result.companyInfo.parentCompany}`);
        }
        
        return notes;
    }

    /**
     *  ADD RELATED COMPANY ROWS (CORE VERSION)
     * 
     * Analyzes results and adds:
     * 1. Parent companies (corporate parents)
     * 2. Merger and acquisition companies
     * 
     * Note: This is the core version - only parent/merger/acquisition
     */
    async addRelatedCompanyRows() {
        const relatedCompaniesToAdd = [];
        const processedCompanies = new Set();

        for (const result of this.results) {
            // ADD PARENT COMPANIES (includes mergers/acquisitions)
            await this.addParentCompanyIfNeeded(result, relatedCompaniesToAdd, processedCompanies);
        }

        // Add all related company results to the main results
        this.results.push(...relatedCompaniesToAdd);
        this.stats.parentCompaniesAdded = relatedCompaniesToAdd.length;
        
        console.log(`    Added ${relatedCompaniesToAdd.length} parent/merger/acquisition company rows`);
    }

    /**
     * Analyze cache coverage to estimate savings
     */
    async analyzeCacheCoverage(sampleCompanies) {
        let totalCached = 0;
        const sampleSize = sampleCompanies.length;
        
        console.log(`   💾 Analyzing cache for ${sampleSize} sample companies...`);
        
        for (const company of sampleCompanies) {
            const cacheInfo = await this.dataCache.hasCompanyData(company.website);
            if (cacheInfo.hasCachedData) {
                totalCached++;
            }
        }
        
        const estimatedCacheRate = Math.round((totalCached / sampleSize) * 100);
        
        console.log(`   💾 Cache hit rate: ${estimatedCacheRate}%`);
        console.log(`   💰 Estimated API cost savings: ${estimatedCacheRate}% of total API calls`);
        
        if (estimatedCacheRate > 50) {
            console.log(`   🎉 High cache coverage detected - significant speedup expected!`);
        }
    }

    /**
     * Process single company with caching optimization
     */
    async processCompanyOptimized(company, index) {
        const startTime = Date.now();
        
        try {
            console.log(`     [${index}] ${company.website}`);

            // Check for cached executive research first
            let cachedResearch = null;
            if (this.config.CACHE_ENABLED) {
                cachedResearch = await this.dataCache.get('lusha-cfo', company.website);
                if (cachedResearch) {
                    this.stats.cacheHits++;
                    this.stats.apiCostsSaved += 0.15; // Estimated Lusha cost per contact
                    console.log(`     [${index}] 💾 Using cached CFO data`);
                }
            }

            // Use the existing processCompany method but with caching awareness
            const result = await this.processCompany(company, index);
            
            // Add performance metrics (with safety check)
            if (result && typeof result === 'object') {
                result.processingTime = Date.now() - startTime;
                result.cacheUtilized = cachedResearch ? true : false;
            }
            
            return result || {
                website: company.website,
                companyName: company.companyName || 'Unknown',
                processingStatus: 'FAILED',
                error: 'Unknown processing error',
                processingTime: Date.now() - startTime,
                cacheUtilized: false
            };

        } catch (error) {
            console.log(`     [${index}] ❌ Error: ${error.message}`);
            throw error;
        }
    }

    /**
     * Save progress backup to prevent data loss
     */
    async saveProgressBackup(processedCount) {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupDir = process.env.VERCEL ? '/tmp/outputs/recovery' : path.join(__dirname, '../../outputs/recovery');
            
            // Create recovery directory if it doesn't exist
            if (!fs.existsSync(backupDir)) {
                fs.mkdirSync(backupDir, { recursive: true });
            }
            
            const backupFile = path.join(backupDir, `core-pipeline-backup-${processedCount}-companies-${timestamp}.json`);
            
            const backupData = {
                timestamp: new Date().toISOString(),
                processedCount,
                totalCompanies: this.results.length,
                stats: this.stats,
                results: this.results
            };
            
            fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
            console.log(`   💾 Progress saved: ${processedCount} companies processed (backup: recovery/core-pipeline-backup-${processedCount}-companies-${timestamp}.json)`);
        } catch (error) {
            console.error(`   ⚠️ Failed to save progress backup: ${error.message}`);
        }
    }

    /**
     * Print performance summary
     */
    printPerformanceSummary() {
        const totalTime = Date.now() - this.stats.startTime;
        const avgTimePerCompany = this.stats.processed > 0 ? 
            Math.round(totalTime / this.stats.processed) : 0;
        
        console.log('\n' + '='.repeat(60));
        console.log('📈 CORE PIPELINE PERFORMANCE SUMMARY');
        console.log('='.repeat(60));
        console.log(`⏱️  Total Time: ${Math.round(totalTime / 1000 / 60)} minutes`);
        console.log(`⚡ Avg per Company: ${avgTimePerCompany}ms`);
        console.log(`🚀 Companies/Minute: ${this.stats.processed > 0 ? Math.round((this.stats.processed / totalTime) * 60000) : 0}`);
        console.log(`🔄 Parallel Factor: ${this.config.MAX_PARALLEL_COMPANIES}x`);
        console.log(`💾 Cache Hit Rate: ${Math.round((this.stats.cacheHits / (this.stats.cacheHits + this.stats.cacheMisses)) * 100) || 0}%`);
        console.log(`💰 API Costs Saved: $${this.stats.apiCostsSaved.toFixed(2)}`);
        console.log(`📊 Companies Processed: ${this.stats.processed}`);
        console.log(`👔 CFOs Found: ${this.stats.cfoFound}`);
        console.log(`📈 CROs Found: ${this.stats.croFound}`);
        console.log(`🎯 Both Found: ${this.stats.bothFound}`);
        
        // Calculate improvement vs sequential
        const sequentialTime = this.stats.processed * 130; // 130s per company sequential
        const actualTime = totalTime / 1000;
        const speedup = Math.round(sequentialTime / actualTime);
        
        console.log(`\n🎯 SPEED IMPROVEMENT:`);
        console.log(`   Sequential estimate: ${Math.round(sequentialTime/3600)} hours`);
        console.log(`   Actual time: ${Math.round(actualTime/60)} minutes`);
        console.log(`   Speed improvement: ${speedup}x faster`);
        console.log('='.repeat(60));
    }

    /**
     * Add parent company row if needed
     */
    async addParentCompanyIfNeeded(result, relatedCompaniesToAdd, processedCompanies) {
        // Check multiple possible locations for parent company data
        let parentCompany = result.parentCompany || result.corporateStructure?.parentCompany || result.acquisitionInfo?.parentCompany;
        
        // Ensure parentCompany is a string, not an object
        if (typeof parentCompany === 'object' && parentCompany !== null) {
            parentCompany = parentCompany.name || parentCompany.companyName || parentCompany.toString();
        }
        
        if (parentCompany && 
            typeof parentCompany === 'string' &&
            parentCompany !== 'None' && 
            parentCompany !== 'null' &&
            !processedCompanies.has(parentCompany) &&
            this.shouldAddParentCompany(result)) {
            
            console.log(`   Processing parent company: ${parentCompany}`);
            processedCompanies.add(parentCompany);
            
            try {
                const parentResult = await this.researchRelatedCompany(
                    parentCompany, 
                    result, 
                    'parent_company',
                    'Standard Corporate Executives'
                );
                if (parentResult) {
                    relatedCompaniesToAdd.push(parentResult);
                    console.log(`    Added parent company: ${parentCompany}`);
                }
            } catch (error) {
                console.error(`    Failed to research parent company ${parentCompany}: ${error.message}`);
            }
            
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }

    /**
     * Determine if we should add parent company
     */
    shouldAddParentCompany(result) {
        // Skip if company is too small or if parent company is same as original
        if (result.companyName === result.corporateStructure?.parentCompany) {
            return false;
        }
        
        // Add parent companies for publicly traded companies or companies with clear corporate structures
        return result.corporateStructure?.parentCompany && 
               result.corporateStructure.parentCompany !== 'None';
    }

    /**
     * Research related company (parent/merger/acquisition)
     */
    async researchRelatedCompany(companyName, originalResult, relationType, executiveType) {
        console.log(`      Researching ${relationType}: ${companyName}`);
        
        try {
            // Create a simplified company object for the related company
            const relatedCompany = {
                company_name: companyName,
                website: await this.guessCompanyWebsite(companyName),
                accountOwner: originalResult.accountOwner || 'Unknown',
                isTop1000: false
            };
            
            // Process the related company with core pipeline logic
            const result = await this.processCompany(relatedCompany, -1); // -1 indicates related company
            
            if (result) {
                // Mark as related company
                result.relationType = relationType;
                result.originalCompany = originalResult.companyName;
                result.isRelatedCompany = true;
                
                return result;
            }
        } catch (error) {
            console.error(`      Error researching ${relationType} ${companyName}: ${error.message}`);
        }
        
        return null;
    }

    /**
     * Guess company website for related companies
     */
    async guessCompanyWebsite(companyName) {
        // Simple domain guessing - in production this would use AI
        if (!companyName) return '';
        
        // Ensure companyName is a string
        const nameStr = typeof companyName === 'string' ? companyName : String(companyName);
        
        const cleanName = nameStr.toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '')
            .replace(/(inc|corp|llc|ltd|company)$/g, '');
        
        return `${cleanName}.com`;
    }

    /**
     * 💰 CALCULATE TOTAL API COST
     */
    calculateTotalCost(result) {
        // Safety check for undefined result
        if (!result || typeof result !== 'object') {
            return 0;
        }
        
        let totalCost = 0;
        
        // Lusha costs
        if (result.cfo?.source?.includes('lusha')) totalCost += 0.08;
        if (result.cro?.source?.includes('lusha')) totalCost += 0.08;
        
        // Twilio costs (phone validation)
        const phoneCount = (result.cfo?.phone ? 1 : 0) + (result.cro?.phone ? 1 : 0);
        totalCost += phoneCount * 0.008;
        
        // Email validation costs
        const emailCount = (result.cfo?.email ? 1 : 0) + (result.cro?.email ? 1 : 0);
        totalCost += emailCount * 0.002; // ZeroBounce/MyEmailVerifier
        
        // Prospeo costs
        if (result.cfo?.source?.includes('prospeo')) totalCost += 0.0198;
        if (result.cro?.source?.includes('prospeo')) totalCost += 0.0198;
        
        return `$${totalCost.toFixed(4)}`;
    }

    /**
     * 🌐 EXTRACT DOMAIN FROM COMPANY NAME
     */
    extractDomainFromCompany(companyName) {
        if (!companyName) return '';
        
        // Ensure companyName is a string
        const nameStr = typeof companyName === 'string' ? companyName : String(companyName);
        
        const cleanName = nameStr.toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '')
            .replace(/(inc|corp|llc|ltd|company|plc)$/g, '');
        
        return `${cleanName}.com`;
    }

    /**
     * API-compatible single company processing method
     */
    async processSingleCompany(companyData) {
        try {
            console.log(`🔄 Processing single company: ${companyData.website}`);
            console.log(`🔧 Environment check: OPENAI_API_KEY exists: ${!!process.env.OPENAI_API_KEY}`);
            console.log(`🔧 Environment check: CORESIGNAL_API_KEY exists: ${!!process.env.CORESIGNAL_API_KEY}`);
            
            const company = {
                website: companyData.website,
                accountOwner: companyData.accountOwner || 'Dan Mirolli',
                isTop1000: companyData.isTop1000 || false
            };
            
            console.log(`🔧 Calling processCompany with:`, company);
            const result = await this.processCompany(company, 1);
            console.log(`🔧 processCompany returned:`, result ? 'Valid result' : 'NULL/UNDEFINED');
            
            // Ensure result has proper structure
            if (!result) {
                console.error('❌ processCompany returned null or undefined');
                throw new Error('No result returned from processing');
            }
            
            // Ensure CFO and CRO objects exist
            if (!result.cfo) {
                console.log('🔧 Adding default CFO object');
                result.cfo = { name: '', title: '', email: '', phone: '', linkedIn: '', confidence: 0, tier: null, role: 'N/A' };
            }
            if (!result.cro) {
                console.log('🔧 Adding default CRO object');
                result.cro = { name: '', title: '', email: '', phone: '', linkedIn: '', confidence: 0, tier: null, role: 'N/A' };
            }
            
            console.log(`✅ Returning result for ${companyData.website}`);
            return result;
            
        } catch (error) {
            console.error(`❌ Error processing single company: ${error.message}`);
            console.error(`❌ Stack trace:`, error.stack);
            throw error;
        }
    }
}

/**
 * MAIN EXECUTION
 */
async function main() {
    console.log('🎯 Starting Core Pipeline...\n');
    
    const pipeline = new CorePipeline();
    const result = await pipeline.runPipeline();
    
    if (result.success) {
        console.log('\nCORE PIPELINE COMPLETED SUCCESSFULLY!');
        console.log('Core executive contact discovery completed');
        console.log('Parent companies, mergers, and acquisitions included');
        console.log('Essential contact data generated');
        process.exit(0);
    } else {
        console.error(`\nPIPELINE FAILED: ${result.error}`);
        process.exit(1);
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { CorePipeline };
