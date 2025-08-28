/**
 * 💰 ENHANCED FINANCE LEADER DETECTION ENGINE
 * 
 * Comprehensive system to identify finance leaders with 100% accuracy
 * Mirrors the RevenueLeaderDetection system with proper 5-tier waterfall
 */

class FinanceLeaderDetection {
    constructor() {
        // TIER 1: C-Level Finance Leaders (Highest Priority)
        this.tier1Titles = [
            // Chief Financial Officer variations
            'chief financial officer', 'cfo', 'c.f.o.', 'c.f.o', 'c.f.o',
            'chief accounting officer', 'cao', 'c.a.o.', 'c.a.o', 'c.a.o',
            'chief finance officer', 'chief financial', 'group cfo',
            
            // Regional/Global C-Level
            'global chief financial officer', 'global cfo',
            'regional chief financial officer', 'regional cfo',
            'chief financial & accounting officer', 'chief financial and accounting officer',
            'chief finance & operations officer', 'chief finance and operations officer'
        ];

        // TIER 2: Senior VP Level (High Priority)
        this.tier2Titles = [
            // VP Finance variations
            'vp finance', 'vice president finance', 'vp of finance', 'vp financial',
            'vice president financial', 'vp of financial', 'senior vp finance',
            'executive vp finance', 'evp finance', 'group vp finance',
            
            // Finance Director variations
            'finance director', 'director of finance', 'director finance',
            'head of finance', 'finance head', 'senior finance director',
            'group finance director', 'corporate finance director',
            
            // VP Accounting variations
            'vp accounting', 'vice president accounting', 'vp of accounting'
        ];

        // TIER 3: Controller & Senior Finance Roles (Medium Priority)
        this.tier3Titles = [
            // Controller variations
            'controller', 'corporate controller', 'group controller',
            'senior controller', 'assistant controller', 'deputy controller',
            'financial controller', 'accounting controller',
            
            // Senior Finance Management
            'senior finance manager', 'finance manager', 'senior financial manager',
            'financial planning manager', 'fp&a manager', 'fpa manager',
            'financial planning and analysis manager', 'budget manager',
            
            // Director Level Finance
            'director of accounting', 'accounting director', 'senior director finance',
            'director financial planning', 'director fp&a'
        ];

        // TIER 4: Finance Management & Treasury (Lower Priority)
        this.tier4Titles = [
            // Treasury roles
            'treasurer', 'corporate treasurer', 'assistant treasurer',
            'treasury manager', 'treasury director', 'head of treasury',
            
            // Finance Operations
            'finance operations manager', 'financial operations manager',
            'finance operations director', 'head of financial operations',
            
            // Accounting Management
            'accounting manager', 'senior accounting manager',
            'financial analyst manager', 'senior financial analyst',
            
            // Industry-specific
            'head of fp&a', 'lead finance', 'finance lead', 'accounting lead',
            'principal finance', 'senior principal finance'
        ];

        // TIER 5: Other Finance Roles (Lowest Priority)
        this.tier5Titles = [
            // General Finance
            'finance', 'financial', 'accounting', 'finance specialist',
            'financial specialist', 'finance analyst', 'financial analyst',
            
            // Administrative Finance
            'finance administrator', 'accounting administrator',
            'finance coordinator', 'financial coordinator',
            
            // Junior Roles (fallback)
            'junior finance manager', 'associate finance manager',
            'finance associate', 'financial associate'
        ];

        // Revenue role exclusions (CRITICAL - prevent cross-contamination)
        this.revenueRoleExclusions = [
            'chief revenue officer', 'cro', 'chief sales officer', 'cso',
            'chief commercial officer', 'cco', 'chief business officer', 'cbo',
            'chief growth officer', 'cgo', 'chief marketing officer', 'cmo',
            'vp sales', 'vice president sales', 'sales director', 'head of sales',
            'revenue', 'sales', 'commercial', 'business development',
            'customer success', 'account management', 'partnerships'
        ];

        // Title pattern mappings for analysis
        this.titlePatterns = {
            'tier1': this.tier1Titles,
            'tier2': this.tier2Titles,
            'tier3': this.tier3Titles,
            'tier4': this.tier4Titles,
            'tier5': this.tier5Titles
        };

        // Confidence scoring by tier
        this.tierConfidence = {
            1: 95,  // CFO, CAO
            2: 85,  // VP Finance, Finance Director
            3: 75,  // Controller, Senior Finance Manager
            4: 65,  // Treasurer, Finance Operations
            5: 55   // General Finance roles
        };
    }

    /**
     * 🎯 MAIN FINANCE LEADER IDENTIFICATION - WATERFALL APPROACH
     */
    identifyFinanceLeader(executives) {
        console.log(`\n💰 FINANCE LEADER IDENTIFICATION - WATERFALL APPROACH - ${executives.length} executives`);
        
        // WATERFALL THESIS: Find the most relevant senior person in order of priority
        const waterfallCandidates = this.applyWaterfallThesis(executives);
        
        if (waterfallCandidates.length > 0) {
            const bestCandidate = waterfallCandidates[0];
            console.log(`   🎯 WATERFALL RESULT: ${bestCandidate.name} - ${bestCandidate.title} (Tier ${bestCandidate.tier}, Score: ${bestCandidate.financeScore})`);
            console.log(`      Reason: ${bestCandidate.waterfallReason}`);
            return bestCandidate;
        }

        console.log(`   ❌ No suitable finance leader found in waterfall approach`);
        return null;
    }

    /**
     * 🌊 WATERFALL THESIS - Find most relevant senior finance person
     * PRIORITY: Direct Finance Leaders > Controllers > Finance Management > Treasury > Other Finance
     */
    applyWaterfallThesis(executives) {
        const candidates = [];
        
        // TIER 1: Direct Finance Leaders (HIGHEST PRIORITY)
        console.log(`   🔍 TIER 1: Direct Finance Leaders (CFO, CAO, Chief Financial Officer)`);
        for (const executive of executives) {
            const analysis = this.analyzeFinanceRole(executive);
            if (analysis.isFinanceRole && analysis.tier <= 1) {
                candidates.push({
                    ...executive,
                    ...analysis,
                    waterfallReason: `Direct finance leader (${(analysis.matchedTitles || []).join(', ') || 'pattern match'})`
                });
            }
        }
        
        if (candidates.length > 0) {
            console.log(`      ✅ Found ${candidates.length} direct finance leaders`);
            return this.sortCandidates(candidates);
        }

        // TIER 2: VP Finance & Finance Directors (High Priority)
        console.log(`   🔍 TIER 2: VP Finance & Finance Directors`);
        for (const executive of executives) {
            const analysis = this.analyzeFinanceRole(executive);
            if (analysis.isFinanceRole && analysis.tier === 2) {
                candidates.push({
                    ...executive,
                    ...analysis,
                    waterfallReason: `Senior finance executive (${analysis.matchedTitles?.join(', ') || 'VP/Director level'})`
                });
            }
        }
        
        if (candidates.length > 0) {
            console.log(`      ✅ Found ${candidates.length} senior finance executives`);
            return this.sortCandidates(candidates);
        }

        // TIER 3: Controllers & Senior Finance Management
        console.log(`   🔍 TIER 3: Controllers & Senior Finance Management`);
        for (const executive of executives) {
            const analysis = this.analyzeFinanceRole(executive);
            if (analysis.isFinanceRole && analysis.tier === 3) {
                candidates.push({
                    ...executive,
                    ...analysis,
                    waterfallReason: `Finance management (${analysis.matchedTitles?.join(', ') || 'Controller/Manager level'})`
                });
            }
        }
        
        if (candidates.length > 0) {
            console.log(`      ✅ Found ${candidates.length} finance management executives`);
            return this.sortCandidates(candidates);
        }

        // TIER 4: Treasury & Finance Operations
        console.log(`   🔍 TIER 4: Treasury & Finance Operations`);
        for (const executive of executives) {
            const analysis = this.analyzeFinanceRole(executive);
            if (analysis.isFinanceRole && analysis.tier === 4) {
                candidates.push({
                    ...executive,
                    ...analysis,
                    waterfallReason: `Finance operations (${analysis.matchedTitles?.join(', ') || 'Treasury/Operations'})`
                });
            }
        }
        
        if (candidates.length > 0) {
            console.log(`      ✅ Found ${candidates.length} finance operations executives`);
            return this.sortCandidates(candidates);
        }

        // TIER 5: CEO/President Fallback (Only for small companies)
        console.log(`   🔍 TIER 5: CEO/President Fallback (small company structure)`);
        for (const executive of executives) {
            const title = (executive.title || '').toLowerCase();
            
            // Only CEO/President/Founder roles, exclude revenue executives
            if ((title.includes('ceo') || title.includes('chief executive') || 
                 title.includes('president') || title.includes('founder')) &&
                !this.isRevenueRole(title)) {
                
                candidates.push({
                    ...executive,
                    tier: 5,
                    financeScore: 50,
                    isFinanceRole: true,
                    waterfallReason: `CEO/President handles finance in smaller company structure`
                });
            }
        }
        
        if (candidates.length > 0) {
            console.log(`      ✅ Found ${candidates.length} CEO/President fallback candidates`);
            return this.sortCandidates(candidates);
        }

        console.log(`      ❌ No suitable candidates found in any tier`);
        return [];
    }

    /**
     * 📊 ANALYZE FINANCE ROLE
     */
    analyzeFinanceRole(executive) {
        const title = (executive.title || '').toLowerCase();
        const name = executive.name || '';
        
        // CRITICAL: Exclude revenue roles first
        if (this.isRevenueRole(title)) {
            console.log(`      🚫 EXCLUDED: ${name} (${executive.title}) - Revenue role, not finance`);
            return {
                isFinanceRole: false,
                tier: null,
                financeScore: 0,
                matchedTitles: [],
                exclusionReason: 'Revenue role excluded from finance detection'
            };
        }

        let tier = null;
        let financeScore = 0;
        let matchedTitles = [];

        // Check each tier for matches
        for (let tierNum = 1; tierNum <= 5; tierNum++) {
            const tierTitles = this.titlePatterns[`tier${tierNum}`];
            const matches = tierTitles.filter(pattern => title.includes(pattern.toLowerCase()));
            
            if (matches.length > 0) {
                tier = tierNum;
                financeScore = this.tierConfidence[tierNum];
                matchedTitles = matches;
                break;
            }
        }

        // Additional scoring adjustments
        if (tier) {
            // Boost for exact CFO matches
            if (title === 'cfo' || title === 'chief financial officer') {
                financeScore += 10;
            }
            
            // Boost for senior titles
            if (title.includes('senior') || title.includes('executive') || title.includes('group')) {
                financeScore += 5;
            }
            
            // Penalty for assistant/deputy roles
            if (title.includes('assistant') || title.includes('deputy') || title.includes('junior')) {
                financeScore -= 10;
            }
        }

        const isFinanceRole = tier !== null;
        
        if (isFinanceRole) {
            console.log(`      ✅ FINANCE ROLE: ${name} (${executive.title}) - Tier ${tier}, Score: ${financeScore}`);
        }

        return {
            isFinanceRole,
            tier,
            financeScore,
            matchedTitles,
            confidence: financeScore
        };
    }

    /**
     * 🚫 CHECK IF TITLE IS REVENUE ROLE (CRITICAL EXCLUSION)
     */
    isRevenueRole(title) {
        const titleLower = title.toLowerCase();
        return this.revenueRoleExclusions.some(exclusion => 
            titleLower.includes(exclusion.toLowerCase())
        );
    }

    /**
     * 📊 SORT CANDIDATES BY PRIORITY
     */
    sortCandidates(candidates) {
        return candidates.sort((a, b) => {
            // Primary sort: Tier (lower tier number = higher priority)
            if (a.tier !== b.tier) {
                return a.tier - b.tier;
            }
            
            // Secondary sort: Finance score (higher = better)
            if (a.financeScore !== b.financeScore) {
                return b.financeScore - a.financeScore;
            }
            
            // Tertiary sort: Title length (shorter titles often more senior)
            const aTitle = (a.title || '').length;
            const bTitle = (b.title || '').length;
            return aTitle - bTitle;
        });
    }

    /**
     * 🔧 UTILITY METHODS
     */
    
    /**
     * Calculate overall confidence for finance leader
     */
    calculateOverallConfidence(financeLeader) {
        if (!financeLeader) return 0;
        
        let confidence = financeLeader.financeScore || 0;
        
        // Adjust based on data completeness
        if (financeLeader.email) confidence += 5;
        if (financeLeader.linkedIn) confidence += 5;
        if (financeLeader.phone) confidence += 3;
        
        return Math.min(confidence, 100);
    }

    /**
     * Get tier description for reporting
     */
    getTierDescription(tier) {
        const descriptions = {
            1: 'C-Level Finance (CFO, CAO)',
            2: 'VP Finance / Finance Director',
            3: 'Controller / Senior Finance Manager',
            4: 'Treasury / Finance Operations',
            5: 'CEO/President Fallback'
        };
        return descriptions[tier] || 'Unknown Tier';
    }

    /**
     * Validate finance leader assignment
     */
    validateFinanceLeader(financeLeader, companyInfo) {
        if (!financeLeader) return { isValid: false, reason: 'No finance leader provided' };
        
        const title = (financeLeader.title || '').toLowerCase();
        
        // Check for revenue role contamination
        if (this.isRevenueRole(title)) {
            return { 
                isValid: false, 
                reason: 'Revenue executive incorrectly assigned as finance leader' 
            };
        }
        
        // Check minimum requirements
        if (!financeLeader.name || financeLeader.name === 'Not available') {
            return { isValid: false, reason: 'No valid name provided' };
        }
        
        if (financeLeader.financeScore < 30) {
            return { isValid: false, reason: 'Finance score too low for reliable assignment' };
        }
        
        return { isValid: true, reason: 'Valid finance leader assignment' };
    }
}

module.exports = FinanceLeaderDetection;
