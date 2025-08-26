/**
 * 🏢 OPERATIONAL STATUS ANALYZER
 * 
 * Determines if acquired subsidiaries are still operationally active
 * and where to target executives (subsidiary vs parent company)
 * 
 * Author: Adrata Pipeline System
 * Version: 1.0.0
 * Last Updated: 2025-01-17
 */

const fetch = require('node-fetch');

class OperationalStatusAnalyzer {
    constructor(config = {}) {
        this.config = {
            PERPLEXITY_API_KEY: config.PERPLEXITY_API_KEY,
            ...config
        };
    }

    /**
     * 🎯 MAIN OPERATIONAL STATUS ASSESSMENT
     */
    async assessOperationalStatus(companyResolution, acquisitionInfo) {
        console.log(`\n🔍 ASSESSING OPERATIONAL STATUS: ${companyResolution.companyName}`);
        
        if (!companyResolution.isAcquired) {
            return {
                operationalStatus: 'independent',
                targetEntity: 'original',
                confidence: 1.0,
                reasoning: 'Independent company - no acquisition detected',
                executiveTargeting: {
                    primary: 'original_company',
                    secondary: null,
                    strategy: 'direct_targeting'
                }
            };
        }

        const assessment = {
            operationalStatus: 'unknown',
            targetEntity: 'unknown',
            confidence: 0,
            reasoning: '',
            executiveTargeting: {
                primary: 'unknown',
                secondary: null,
                strategy: 'unknown'
            },
            indicators: {
                websiteActive: false,
                brandMaintained: false,
                independentOperations: false,
                executiveTeamIntact: false,
                customerFacingActive: false,
                legalEntityActive: false
            },
            integrationLevel: 'unknown',
            recommendedApproach: 'unknown'
        };

        try {
            // STEP 1: Analyze Website and Digital Presence
            console.log('   📱 Analyzing digital presence...');
            const digitalAnalysis = await this.analyzeDigitalPresence(companyResolution);
            assessment.indicators.websiteActive = digitalAnalysis.websiteActive;
            assessment.indicators.brandMaintained = digitalAnalysis.brandMaintained;
            assessment.indicators.customerFacingActive = digitalAnalysis.customerFacing;

            // STEP 2: Assess Business Operations Independence
            console.log('   🏢 Assessing operational independence...');
            const operationalAnalysis = await this.assessOperationalIndependence(
                companyResolution, 
                acquisitionInfo
            );
            assessment.indicators.independentOperations = operationalAnalysis.independent;
            assessment.indicators.executiveTeamIntact = operationalAnalysis.executiveTeam;

            // STEP 3: Determine Integration Level
            console.log('   🔗 Determining integration level...');
            const integrationAnalysis = await this.analyzeIntegrationLevel(
                companyResolution, 
                acquisitionInfo
            );
            assessment.integrationLevel = integrationAnalysis.level;

            // STEP 4: Calculate Overall Operational Status
            assessment.operationalStatus = this.calculateOperationalStatus(assessment.indicators);
            
            // STEP 5: Determine Executive Targeting Strategy
            const targetingStrategy = this.determineExecutiveTargeting(
                assessment.operationalStatus, 
                assessment.integrationLevel,
                companyResolution,
                acquisitionInfo
            );
            assessment.executiveTargeting = targetingStrategy;
            assessment.targetEntity = targetingStrategy.primary;
            assessment.recommendedApproach = targetingStrategy.strategy;

            // STEP 6: Calculate Confidence and Reasoning
            assessment.confidence = this.calculateConfidence(assessment.indicators);
            assessment.reasoning = this.generateReasoning(assessment);

            console.log(`   ✅ Status: ${assessment.operationalStatus.toUpperCase()}`);
            console.log(`   🎯 Target: ${assessment.targetEntity.toUpperCase()}`);
            console.log(`   📊 Confidence: ${(assessment.confidence * 100).toFixed(0)}%`);

            return assessment;

        } catch (error) {
            console.log(`   ❌ Operational status analysis failed: ${error.message}`);
            
            // Fallback logic
            return {
                operationalStatus: 'acquired_unknown',
                targetEntity: 'parent_company',
                confidence: 0.3,
                reasoning: 'Analysis failed - defaulting to parent company targeting',
                executiveTargeting: {
                    primary: 'parent_company',
                    secondary: 'original_company',
                    strategy: 'conservative_parent_targeting'
                }
            };
        }
    }

    /**
     * 📱 DIGITAL PRESENCE ANALYSIS
     */
    async analyzeDigitalPresence(companyResolution) {
        try {
            const prompt = `Analyze the current digital presence and brand status of ${companyResolution.companyName}:

Website: ${companyResolution.finalUrl}
Company: ${companyResolution.companyName}
${companyResolution.isAcquired ? `Acquired by: ${companyResolution.parentCompany?.name}` : ''}

Please assess:
1. Is the website actively maintained with recent content (2024-2025)?
2. Does the company maintain its original brand identity?
3. Are they still customer-facing with active products/services?
4. Do they have independent marketing and communications?
5. Is the website just a redirect or does it have substantial content?

Provide ONLY a JSON response:
{
    "websiteActive": true/false,
    "brandMaintained": true/false,
    "customerFacing": true/false,
    "independentMarketing": true/false,
    "contentRecency": "recent/outdated/redirect_only",
    "evidence": ["evidence point 1", "evidence point 2"],
    "confidence": 0.85
}`;

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
                    max_tokens: 500
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
                    console.log(`   ⚠️ Digital presence parsing failed`);
                }
            }
        } catch (error) {
            console.log(`   ❌ Digital presence analysis error: ${error.message}`);
        }

        return {
            websiteActive: false,
            brandMaintained: false,
            customerFacing: false,
            confidence: 0
        };
    }

    /**
     * 🏢 OPERATIONAL INDEPENDENCE ASSESSMENT
     */
    async assessOperationalIndependence(companyResolution, acquisitionInfo) {
        try {
            const prompt = `Assess the operational independence of ${companyResolution.companyName} after its acquisition:

Company: ${companyResolution.companyName}
Parent: ${acquisitionInfo.parentCompany?.name || 'Unknown'}
Acquisition Date: ${acquisitionInfo.acquisitionDate || 'Unknown'}

Please evaluate:
1. Does the company maintain independent business operations?
2. Do they have their own executive team (CEO, CFO, CRO)?
3. Are they run as a separate business unit or fully integrated?
4. Do they maintain independent customer relationships?
5. What level of autonomy do they have in decision-making?

Provide ONLY a JSON response:
{
    "independent": true/false,
    "executiveTeam": true/false,
    "separateBusinessUnit": true/false,
    "customerAutonomy": true/false,
    "decisionAutonomy": "high/medium/low/none",
    "operationalModel": "independent_subsidiary/integrated_division/fully_absorbed/unknown",
    "evidence": ["evidence point 1", "evidence point 2"],
    "confidence": 0.85
}`;

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
                    max_tokens: 500
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
                    console.log(`   ⚠️ Operational independence parsing failed`);
                }
            }
        } catch (error) {
            console.log(`   ❌ Operational independence analysis error: ${error.message}`);
        }

        return {
            independent: false,
            executiveTeam: false,
            confidence: 0
        };
    }

    /**
     * 🔗 INTEGRATION LEVEL ANALYSIS
     */
    async analyzeIntegrationLevel(companyResolution, acquisitionInfo) {
        const acquisitionDate = acquisitionInfo.acquisitionDate;
        let timeBasedLevel = 'unknown';
        
        if (acquisitionDate) {
            const acqDate = new Date(acquisitionDate);
            const now = new Date();
            const monthsSince = (now - acqDate) / (1000 * 60 * 60 * 24 * 30);
            
            if (monthsSince <= 6) {
                timeBasedLevel = 'early_integration';
            } else if (monthsSince <= 18) {
                timeBasedLevel = 'active_integration';
            } else if (monthsSince <= 36) {
                timeBasedLevel = 'mature_integration';
            } else {
                timeBasedLevel = 'fully_integrated';
            }
        }

        try {
            const prompt = `Analyze the integration level between ${companyResolution.companyName} and ${acquisitionInfo.parentCompany?.name}:

Subsidiary: ${companyResolution.companyName}
Parent: ${acquisitionInfo.parentCompany?.name || 'Unknown'}
Acquisition Date: ${acquisitionInfo.acquisitionDate || 'Unknown'}
Time Since Acquisition: ${timeBasedLevel}

Please determine:
1. What is the current integration status?
2. Are they operating as independent brands or fully integrated?
3. Have executive teams been consolidated?
4. Are customer-facing operations merged or separate?

Provide ONLY a JSON response:
{
    "level": "independent_subsidiary/integrated_division/fully_absorbed/transitional",
    "brandStatus": "maintained/rebranded/eliminated",
    "executiveConsolidation": "separate/mixed/consolidated",
    "customerOperations": "separate/integrated/mixed",
    "timeBasedAssessment": "${timeBasedLevel}",
    "confidence": 0.85
}`;

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
                    max_tokens: 400
                })
            });

            if (response.ok) {
                const data = await response.json();
                const content = data.choices[0].message.content;
                
                try {
                    const jsonMatch = content.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        const result = JSON.parse(jsonMatch[0]);
                        return {
                            level: result.level || timeBasedLevel,
                            brandStatus: result.brandStatus,
                            executiveConsolidation: result.executiveConsolidation,
                            confidence: result.confidence || 0.5
                        };
                    }
                } catch (parseError) {
                    console.log(`   ⚠️ Integration level parsing failed`);
                }
            }
        } catch (error) {
            console.log(`   ❌ Integration level analysis error: ${error.message}`);
        }

        return {
            level: timeBasedLevel,
            brandStatus: 'unknown',
            executiveConsolidation: 'unknown',
            confidence: 0.3
        };
    }

    /**
     * 📊 CALCULATE OPERATIONAL STATUS
     */
    calculateOperationalStatus(indicators) {
        const activeScore = (
            (indicators.websiteActive ? 2 : 0) +
            (indicators.brandMaintained ? 2 : 0) +
            (indicators.independentOperations ? 3 : 0) +
            (indicators.executiveTeamIntact ? 2 : 0) +
            (indicators.customerFacingActive ? 1 : 0)
        );

        if (activeScore >= 7) {
            return 'fully_operational';
        } else if (activeScore >= 4) {
            return 'partially_operational';
        } else if (activeScore >= 2) {
            return 'brand_maintained';
        } else {
            return 'fully_integrated';
        }
    }

    /**
     * 🎯 DETERMINE EXECUTIVE TARGETING STRATEGY
     */
    determineExecutiveTargeting(operationalStatus, integrationLevel, companyResolution, acquisitionInfo) {
        const strategies = {
            fully_operational: {
                primary: 'original_company',
                secondary: 'parent_company',
                strategy: 'subsidiary_first',
                reasoning: 'Subsidiary maintains independent operations and executive team'
            },
            partially_operational: {
                primary: 'both_companies',
                secondary: null,
                strategy: 'dual_targeting',
                reasoning: 'Mixed operations require targeting both subsidiary and parent executives'
            },
            brand_maintained: {
                primary: 'parent_company',
                secondary: 'original_company',
                strategy: 'parent_primary',
                reasoning: 'Brand exists but operations likely integrated - parent executives control decisions'
            },
            fully_integrated: {
                primary: 'parent_company',
                secondary: null,
                strategy: 'parent_only',
                reasoning: 'Fully integrated - only parent company executives are relevant'
            }
        };

        const baseStrategy = strategies[operationalStatus] || strategies.fully_integrated;

        // Adjust based on integration level
        if (integrationLevel === 'early_integration' && operationalStatus !== 'fully_integrated') {
            return {
                primary: 'both_companies',
                secondary: null,
                strategy: 'transitional_dual_targeting',
                reasoning: 'Recent acquisition in transition - target both for comprehensive coverage'
            };
        }

        return baseStrategy;
    }

    /**
     * 📊 CALCULATE CONFIDENCE SCORE
     */
    calculateConfidence(indicators) {
        const indicatorCount = Object.keys(indicators).length;
        const trueCount = Object.values(indicators).filter(v => v === true).length;
        const falseCount = Object.values(indicators).filter(v => v === false).length;
        const unknownCount = indicatorCount - trueCount - falseCount;

        // Higher confidence when we have clear true/false indicators
        const certaintyRatio = (trueCount + falseCount) / indicatorCount;
        const baseConfidence = certaintyRatio * 0.8;

        // Boost confidence if indicators are consistent
        const consistencyBoost = (trueCount > falseCount * 2 || falseCount > trueCount * 2) ? 0.2 : 0.1;

        return Math.min(baseConfidence + consistencyBoost, 1.0);
    }

    /**
     * 📝 GENERATE REASONING
     */
    generateReasoning(assessment) {
        const indicators = assessment.indicators;
        const activeIndicators = Object.entries(indicators)
            .filter(([key, value]) => value === true)
            .map(([key]) => key);
        
        const inactiveIndicators = Object.entries(indicators)
            .filter(([key, value]) => value === false)
            .map(([key]) => key);

        let reasoning = `Operational Status: ${assessment.operationalStatus}. `;
        
        if (activeIndicators.length > 0) {
            reasoning += `Active indicators: ${activeIndicators.join(', ')}. `;
        }
        
        if (inactiveIndicators.length > 0) {
            reasoning += `Inactive indicators: ${inactiveIndicators.join(', ')}. `;
        }

        reasoning += `Integration level: ${assessment.integrationLevel}. `;
        reasoning += assessment.executiveTargeting.reasoning;

        return reasoning;
    }

    /**
     * 🎯 GET EXECUTIVE TARGETING RECOMMENDATION
     */
    getExecutiveTargetingRecommendation(operationalAssessment) {
        const strategy = operationalAssessment.executiveTargeting.strategy;
        
        const recommendations = {
            subsidiary_first: {
                approach: 'Target subsidiary executives first, parent as backup',
                priority: ['subsidiary_cfo', 'subsidiary_cro', 'parent_cfo', 'parent_cro'],
                reasoning: 'Subsidiary maintains decision-making authority'
            },
            parent_primary: {
                approach: 'Target parent company executives primarily',
                priority: ['parent_cfo', 'parent_cro', 'subsidiary_cfo', 'subsidiary_cro'],
                reasoning: 'Parent company controls integrated operations'
            },
            dual_targeting: {
                approach: 'Target both subsidiary and parent executives simultaneously',
                priority: ['subsidiary_cfo', 'parent_cfo', 'subsidiary_cro', 'parent_cro'],
                reasoning: 'Mixed operational model requires comprehensive targeting'
            },
            parent_only: {
                approach: 'Target only parent company executives',
                priority: ['parent_cfo', 'parent_cro'],
                reasoning: 'Subsidiary fully integrated - no independent decision makers'
            },
            transitional_dual_targeting: {
                approach: 'Target both with emphasis on transition dynamics',
                priority: ['subsidiary_cfo', 'parent_cfo', 'subsidiary_cro', 'parent_cro'],
                reasoning: 'Recent acquisition requires monitoring both entities during transition'
            }
        };

        return recommendations[strategy] || recommendations.parent_primary;
    }
}

module.exports = { OperationalStatusAnalyzer };
