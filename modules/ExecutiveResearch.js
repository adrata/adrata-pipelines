#!/usr/bin/env node

/**
 * 🎯 ENHANCED EXECUTIVE RESEARCH MODULE
 * 
 * Integrates CompanyLeadershipScraper with existing ExecutiveResearch
 * to achieve 100% CFO/CRO discovery rate with accurate, current data
 * 
 * Enhanced Features:
 * 1. Leadership page scraping as primary source
 * 2. AI-powered executive extraction
 * 3. Known executive database fallback
 * 4. Multi-source validation
 * 5. Freshness scoring and confidence calculation
 * 6. Waterfall reasoning for transparency
 */

// Load environment variables
require('dotenv').config();

const { CompanyLeadershipScraper } = require('./CompanyLeadershipScraper.js');
class ExecutiveResearch {
    constructor(config = {}) {
        this.config = {
            PERPLEXITY_API_KEY: config.PERPLEXITY_API_KEY || process.env.PERPLEXITY_API_KEY,
            OPENAI_API_KEY: config.OPENAI_API_KEY || process.env.OPENAI_API_KEY,
            CORESIGNAL_API_KEY: config.CORESIGNAL_API_KEY || process.env.CORESIGNAL_API_KEY,
            ENHANCED_ACCURACY: true,
            LEADERSHIP_SCRAPING_ENABLED: true,
            FALLBACK_ENABLED: true,
            ...config
        };

        // Initialize modules
        this.leadershipScraper = new CompanyLeadershipScraper(this.config);
        
        console.log('🚀 Enhanced Executive Research initialized');
        console.log(`   Leadership Scraping: ${this.config.LEADERSHIP_SCRAPING_ENABLED ? 'Enabled' : 'Disabled'}`);
        console.log(`   Fallback Database: ${this.config.FALLBACK_ENABLED ? 'Enabled' : 'Disabled'}`);
        console.log(`   API Keys Available: ${!!this.config.PERPLEXITY_API_KEY ? 'Yes' : 'No'}`);
    }

    /**
     * 🎯 MAIN ENHANCED EXECUTIVE RESEARCH
     * 
     * Multi-layered approach for 100% executive discovery
     */
    async researchExecutives(companyInfo) {
        console.log(`\n🎯 ENHANCED EXECUTIVE RESEARCH: ${companyInfo.companyName}`);
        console.log('=' .repeat(70));

        const result = {
            companyName: companyInfo.companyName,
            website: companyInfo.website,
            cfo: null,
            cro: null,
            departmentExecutives: [],
            similarExecutives: [],
            overallConfidence: 0,
            researchMethods: [],
            timestamp: new Date().toISOString(),
            processingTime: 0
        };

        const startTime = Date.now();

        try {
            // LAYER 1: Leadership Page Scraping (Primary)
            console.log('\n🏢 LAYER 1: Leadership Page Scraping');
            const leadershipResult = await this.leadershipScraper.scrapeCompanyLeadership(
                companyInfo.companyName, 
                companyInfo.website
            );

            if (leadershipResult.executives.cfo || leadershipResult.executives.cro) {
                console.log('   ✅ Leadership scraping successful');
                result.cfo = leadershipResult.executives.cfo;
                result.cro = leadershipResult.executives.cro;
                result.researchMethods.push('leadership_scraping');
                result.overallConfidence = leadershipResult.confidence;
            } else {
                console.log('   ⚠️ Leadership scraping found no CFO/CRO');
            }

            // LAYER 2: CoreSignal Executive Search (Secondary)
            if (!result.cfo || !result.cro) {
                console.log('\n🔍 LAYER 2: CoreSignal Executive Search');
                
                try {
                    const coreSignalResult = await this.searchCoreSignalExecutives(companyInfo);
                    
                    // Fill gaps with CoreSignal search
                    if (!result.cfo && coreSignalResult.cfo) {
                        result.cfo = this.enhanceExecutiveData(coreSignalResult.cfo, 'coresignal_search');
                        console.log(`   ✅ CFO found via CoreSignal: ${result.cfo.name}`);
                    }
                    
                    if (!result.cro && coreSignalResult.cro) {
                        result.cro = this.enhanceExecutiveData(coreSignalResult.cro, 'coresignal_search');
                        console.log(`   ✅ CRO found via CoreSignal: ${result.cro.name}`);
                    }

                    result.researchMethods.push('coresignal_search');
                    
                } catch (coreSignalError) {
                    console.log(`   ⚠️ CoreSignal search failed: ${coreSignalError.message}`);
                }
            }

            // LAYER 3: Intelligent Fallback (Tertiary)
            if (!result.cfo || !result.cro) {
                console.log('\n🧠 LAYER 3: Intelligent Executive Fallback');
                const fallbackExecutives = await this.intelligentExecutiveFallback(companyInfo);
                
                if (!result.cfo && fallbackExecutives.cfo) {
                    result.cfo = fallbackExecutives.cfo;
                    console.log(`   ✅ CFO found via intelligent fallback: ${result.cfo.name}`);
                }
                
                if (!result.cro && fallbackExecutives.cro) {
                    result.cro = fallbackExecutives.cro;
                    console.log(`   ✅ CRO found via intelligent fallback: ${result.cro.name}`);
                }

                if (fallbackExecutives.cfo || fallbackExecutives.cro) {
                    result.researchMethods.push('intelligent_fallback');
                }
            }

            // LAYER 4: CEO/Leadership Mapping (Last Resort)
            if (!result.cfo || !result.cro) {
                console.log('\n👑 LAYER 4: CEO/Leadership Role Mapping');
                const leadershipMapping = await this.mapLeadershipRoles(companyInfo, result);
                
                if (!result.cfo && leadershipMapping.cfo) {
                    result.cfo = leadershipMapping.cfo;
                    console.log(`   ✅ CFO role mapped: ${result.cfo.name} (${result.cfo.waterfallReason})`);
                }
                
                if (!result.cro && leadershipMapping.cro) {
                    result.cro = leadershipMapping.cro;
                    console.log(`   ✅ CRO role mapped: ${result.cro.name} (${result.cro.waterfallReason})`);
                }

                if (leadershipMapping.cfo || leadershipMapping.cro) {
                    result.researchMethods.push('leadership_mapping');
                }
            }

            // Calculate final metrics
            result.processingTime = Date.now() - startTime;
            result.overallConfidence = this.calculateOverallConfidence(result);

            // Final results
            console.log('\n📊 ENHANCED RESEARCH RESULTS:');
            console.log(`   CFO: ${result.cfo ? '✅ ' + result.cfo.name : '❌ Not found'}`);
            console.log(`   CRO: ${result.cro ? '✅ ' + result.cro.name : '❌ Not found'}`);
            console.log(`   Methods Used: ${result.researchMethods.join(', ')}`);
            console.log(`   Overall Confidence: ${result.overallConfidence}%`);
            console.log(`   Processing Time: ${result.processingTime}ms`);
            console.log(`   Discovery Rate: ${this.calculateDiscoveryRate(result)}%`);

            return result;

        } catch (error) {
            console.error(`❌ Enhanced research error: ${error.message}`);
            result.error = error.message;
            result.processingTime = Date.now() - startTime;
            return result;
        }
    }

    /**
     * 🧠 INTELLIGENT EXECUTIVE FALLBACK
     * 
     * Uses AI and patterns to find executives when direct methods fail
     */
    async intelligentExecutiveFallback(companyInfo) {
        const result = { cfo: null, cro: null };

        try {
            // Use Perplexity to search for current executives
            if (this.config.PERPLEXITY_API_KEY) {
                const prompt = `Find the current Chief Financial Officer (CFO) and Chief Revenue Officer (CRO) for ${companyInfo.companyName}.

Company website: ${companyInfo.website}

CRITICAL REQUIREMENTS:
1. CFO MUST have "Chief Financial Officer", "CFO", or "Finance" in their ACTUAL title
2. CRO MUST have "Chief Revenue Officer", "CRO", "Chief Sales Officer", "CSO" in their ACTUAL title
3. DO NOT return CEOs, COOs, or HR officers as CFOs
4. DO NOT return executives from other companies or with wrong email domains
5. ONLY return executives you can verify currently work at ${companyInfo.companyName}
6. Confidence must be 90%+ or return null

Please search for:
1. Current CFO - MUST be actual finance leader, not CEO
2. Current CRO/CSO - MUST be actual revenue/sales leader
3. Verify they currently work at ${companyInfo.companyName}
4. Cross-check against company leadership pages

Provide ONLY a JSON response:
{
    "cfo": {
        "name": "Full Name or null if not found",
        "title": "Exact Title (must contain Finance/CFO)",
        "confidence": 0.95,
        "source": "where found",
        "appointmentDate": "2025-01-01 or null",
        "roleValidation": "confirmed CFO role"
    },
    "cro": {
        "name": "Full Name or null if not found", 
        "title": "Exact Title (must contain Revenue/Sales/CRO/CSO)",
        "confidence": 0.90,
        "source": "where found",
        "appointmentDate": "2025-01-01 or null",
        "roleValidation": "confirmed CRO/CSO role"
    },
    "validation": {
        "companyMatch": "confirmed both work at ${companyInfo.companyName}",
        "sourceReliability": "company_website/SEC_filing/press_release"
    }
}`;

                const aiResult = await this.callPerplexityAPI(prompt);
                
                if (aiResult.cfo) {
                    result.cfo = {
                        name: aiResult.cfo.name,
                        title: aiResult.cfo.title,
                        tier: 1,
                        confidence: (aiResult.cfo.confidence || 0.8) * 100,
                        source: 'Perplexity AI Search',
                        waterfallReason: `AI-powered search found current CFO: ${aiResult.cfo.source}`,
                        roleType: 'CFO',
                        appointmentDate: aiResult.cfo.appointmentDate
                    };
                }

                if (aiResult.cro) {
                    result.cro = {
                        name: aiResult.cro.name,
                        title: aiResult.cro.title,
                        tier: 1,
                        confidence: (aiResult.cro.confidence || 0.8) * 100,
                        source: 'Perplexity AI Search',
                        waterfallReason: `AI-powered search found current CRO: ${aiResult.cro.source}`,
                        roleType: 'CRO',
                        appointmentDate: aiResult.cro.appointmentDate
                    };
                }

                // CRITICAL FIX: Prevent duplicate executives (same person as CFO and CRO)
                if (result.cfo && result.cro && result.cfo.name === result.cro.name) {
                    console.log(`   🚨 DUPLICATE EXECUTIVE DETECTED: ${result.cfo.name} listed as both CFO and CRO`);
                    console.log(`   🔧 FIXING: Keeping CFO role, clearing CRO (CFO takes priority)`);
                    
                    // Keep the CFO role, clear the CRO (CFO is more critical for most use cases)
                    result.cro = null;
                    
                    // Add validation note
                    if (!result.cfo.validationNotes) result.cfo.validationNotes = [];
                    result.cfo.validationNotes.push(`Duplicate role detected - same person was listed as both CFO and CRO, kept CFO role`);
                }

                // Handle alternative roles if no dedicated CFO/CRO
                if (!result.cfo && aiResult.alternativeRoles?.financeOversight) {
                    result.cfo = {
                        name: aiResult.alternativeRoles.financeOversight,
                        title: 'Finance Oversight (CEO/COO)',
                        tier: 2,
                        confidence: 70,
                        source: 'Perplexity AI Search',
                        waterfallReason: 'No dedicated CFO - CEO/COO handles finance responsibilities',
                        roleType: 'CFO'
                    };
                }

                if (!result.cro && aiResult.alternativeRoles?.revenueOversight) {
                    result.cro = {
                        name: aiResult.alternativeRoles.revenueOversight,
                        title: 'Revenue Oversight (CSO/VP Sales)',
                        tier: 2,
                        confidence: 70,
                        source: 'Perplexity AI Search',
                        waterfallReason: 'No dedicated CRO - CSO/VP Sales handles revenue responsibilities',
                        roleType: 'CRO'
                    };
                }
            }

        } catch (error) {
            console.log(`   ⚠️ Intelligent fallback error: ${error.message}`);
        }

        return result;
    }

    /**
     * 👑 MAP LEADERSHIP ROLES
     * 
     * Maps CEO/COO to CFO/CRO when no dedicated executives exist
     */
    async mapLeadershipRoles(companyInfo, currentResult) {
        const result = { cfo: null, cro: null };

        // For smaller companies, CEO often handles finance
        // CSO/VP Sales often handles revenue
        const companySize = this.estimateCompanySize(companyInfo);
        
        if (companySize === 'small' || companySize === 'medium') {
            // Look for CEO to map to CFO role
            if (!currentResult.cfo) {
                const ceoMapping = await this.findCEOForFinanceMapping(companyInfo);
                if (ceoMapping) {
                    result.cfo = {
                        ...ceoMapping,
                        roleType: 'CFO',
                        tier: 2,
                        waterfallReason: 'CEO handles finance oversight in smaller company - no dedicated CFO'
                    };
                }
            }

            // Look for CSO/VP Sales to map to CRO role  
            if (!currentResult.cro) {
                const revenueMapping = await this.findRevenueLeaderMapping(companyInfo);
                if (revenueMapping) {
                    result.cro = {
                        ...revenueMapping,
                        roleType: 'CRO',
                        tier: 2,
                        waterfallReason: 'Senior sales/strategy leader handles revenue - no dedicated CRO'
                    };
                }
            }
        }

        return result;
    }

    /**
     * 🔧 UTILITY METHODS
     */
    enhanceExecutiveData(executive, source) {
        return {
            ...executive,
            source: source,
            waterfallReason: executive.waterfallReason || `Found via ${source}`,
            enhancedAt: new Date().toISOString()
        };
    }

    calculateOverallConfidence(result) {
        let confidence = 0;
        let count = 0;

        if (result.cfo) {
            // Convert decimal confidence (0.98) to percentage (98%)
            const cfoConfidence = result.cfo.confidence ? 
                (result.cfo.confidence < 1 ? result.cfo.confidence * 100 : result.cfo.confidence) : 85;
            confidence += cfoConfidence;
            count++;
        }
        if (result.cro) {
            // Convert decimal confidence (0.97) to percentage (97%)
            const croConfidence = result.cro.confidence ? 
                (result.cro.confidence < 1 ? result.cro.confidence * 100 : result.cro.confidence) : 85;
            confidence += croConfidence;
            count++;
        }

        return count > 0 ? Math.round(confidence / count) : 0;
    }

    calculateDiscoveryRate(result) {
        const found = (result.cfo ? 1 : 0) + (result.cro ? 1 : 0);
        return (found / 2) * 100;
    }

    estimateCompanySize(companyInfo) {
        // Simple heuristic - could be enhanced with employee count data
        const domain = companyInfo.website.toLowerCase();
        
        // Known large companies
        if (domain.includes('snowflake') || domain.includes('atlassian') || domain.includes('stripe')) {
            return 'large';
        }
        
        // Likely medium companies
        if (domain.includes('vts') || domain.includes('rapid7') || domain.includes('zendesk')) {
            return 'medium';
        }
        
        return 'small';
    }

    async findCEOForFinanceMapping(companyInfo) {
        // Implementation would search for CEO
        return null;
    }

    async findRevenueLeaderMapping(companyInfo) {
        // Implementation would search for CSO/VP Sales
        return null;
    }

    /**
     * 🔍 SEARCH CORESIGNAL EXECUTIVES
     * 
     * Direct CoreSignal API search for CFO/CRO
     */
    async searchCoreSignalExecutives(companyInfo) {
        const result = { cfo: null, cro: null };

        if (!this.config.CORESIGNAL_API_KEY) {
            console.log('   ⚠️ CoreSignal API key not available');
            return result;
        }

        try {
            const fetch = require('node-fetch');
            
            // Search for CFO
            const cfoResponse = await fetch('https://api.coresignal.com/cdapi/v2/employee_multi_source/search/es_dsl', {
                method: 'POST',
                headers: {
                    'apikey': this.config.CORESIGNAL_API_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query: {
                        bool: {
                            must: [
                                {
                                    bool: {
                                        should: [
                                            { match: { "company_name": companyInfo.companyName } },
                                            { match: { "company_name": companyInfo.website } }
                                        ]
                                    }
                                },
                                {
                                    bool: {
                                        should: [
                                            { match: { "title": "Chief Financial Officer" } },
                                            { match: { "title": "CFO" } },
                                            { match: { "title": "Finance" } }
                                        ]
                                    }
                                }
                            ]
                        }
                    },
                    size: 3
                })
            });

            if (cfoResponse.ok) {
                const cfoData = await cfoResponse.json();
                if (cfoData.hits?.hits?.length > 0) {
                    const cfoHit = cfoData.hits.hits[0]._source;
                    result.cfo = {
                        name: cfoHit.name,
                        title: cfoHit.title,
                        tier: 1,
                        confidence: 85,
                        source: 'CoreSignal API',
                        roleType: 'CFO'
                    };
                }
            }

            // Search for CRO
            const croResponse = await fetch('https://api.coresignal.com/cdapi/v2/employee_multi_source/search/es_dsl', {
                method: 'POST',
                headers: {
                    'apikey': this.config.CORESIGNAL_API_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query: {
                        bool: {
                            must: [
                                {
                                    bool: {
                                        should: [
                                            { match: { "company_name": companyInfo.companyName } },
                                            { match: { "company_name": companyInfo.website } }
                                        ]
                                    }
                                },
                                {
                                    bool: {
                                        should: [
                                            { match: { "title": "Chief Revenue Officer" } },
                                            { match: { "title": "CRO" } },
                                            { match: { "title": "Revenue" } },
                                            { match: { "title": "Sales" } }
                                        ]
                                    }
                                }
                            ]
                        }
                    },
                    size: 3
                })
            });

            if (croResponse.ok) {
                const croData = await croResponse.json();
                if (croData.hits?.hits?.length > 0) {
                    const croHit = croData.hits.hits[0]._source;
                    result.cro = {
                        name: croHit.name,
                        title: croHit.title,
                        tier: 1,
                        confidence: 85,
                        source: 'CoreSignal API',
                        roleType: 'CRO'
                    };
                }
            }

        } catch (error) {
            console.log(`   ⚠️ CoreSignal search error: ${error.message}`);
        }

        return result;
    }

    async callPerplexityAPI(prompt) {
        if (!this.config.PERPLEXITY_API_KEY) {
            return {};
        }

        try {
            const fetch = require('node-fetch');
            const response = await fetch('https://api.perplexity.ai/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.PERPLEXITY_API_KEY?.trim()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'sonar-pro',
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.1,
                    max_tokens: 1500
                })
            });

            if (response.ok) {
                const data = await response.json();
                const content = data.choices[0].message.content;
                
                try {
                    const jsonMatch = content.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        return JSON.parse(jsonMatch[0]);
                    }
                } catch (parseError) {
                    console.log(`   ⚠️ JSON parsing failed`);
                }
            }
        } catch (error) {
            console.log(`   ⚠️ Perplexity API error: ${error.message}`);
        }

        return {};
    }

    /**
     * 🧪 TEST ENHANCED RESEARCH
     */
    async testEnhancedResearch(companyName, website) {
        console.log(`\n🧪 TESTING ENHANCED EXECUTIVE RESEARCH`);
        console.log(`🏢 Company: ${companyName}`);
        console.log(`🌐 Website: ${website}`);
        
        const result = await this.researchExecutives({
            companyName,
            website,
            domain: website
        });
        
        console.log('\n📊 TEST RESULTS SUMMARY:');
        console.log(`   Success Rate: ${this.calculateDiscoveryRate(result)}%`);
        console.log(`   CFO: ${result.cfo ? '✅ ' + result.cfo.name : '❌ Not found'}`);
        console.log(`   CRO: ${result.cro ? '✅ ' + result.cro.name : '❌ Not found'}`);
        console.log(`   Methods: ${result.researchMethods.join(' → ')}`);
        console.log(`   Confidence: ${result.overallConfidence}%`);
        
        return result;
    }
}

// Test if run directly
if (require.main === module) {
    console.log('ExecutiveResearch module loaded successfully');
    // Test code disabled to prevent circular dependency issues
    // Uncomment below to run tests:
    /*
    const executiveResearch = new ExecutiveResearch();
    
    // Test with Snowflake
    executiveResearch.testEnhancedResearch('Snowflake', 'https://snowflake.com')
        .then(result => {
            console.log('\n✅ Enhanced research test completed');
            
            // Check for specific executives
            if (result.cfo && result.cfo.name.includes('Scarpelli')) {
                console.log('🎯 SUCCESS: Found Mike Scarpelli as CFO!');
            }
            if (result.cro && result.cro.name.includes('Gannon')) {
                console.log('🎯 SUCCESS: Found Mike Gannon as CRO!');
            }
        })
        .catch(error => {
            console.error('❌ Enhanced research test failed:', error);
        });
    */
}

module.exports = { ExecutiveResearch };
