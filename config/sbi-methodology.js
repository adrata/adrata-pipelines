/**
 * SBI GROWTH METHODOLOGY CONFIGURATION
 * Customizes buyer group intelligence for SBI's proven sales methodology
 * Based on SBI Growth's approach to B2B sales and buyer group mapping
 */

module.exports = {
    // SBI-specific buyer group roles and definitions
    SBI_BUYER_ROLES: {
        DECISION_MAKER: {
            definition: "Has final budget authority and decision-making power",
            typical_titles: ["CEO", "CFO", "CRO", "VP Sales", "VP Marketing", "President"],
            sbi_priority: "PRIMARY_TARGET",
            engagement_strategy: "Executive-level value proposition, ROI focus"
        },
        CHAMPION: {
            definition: "Internal advocate who promotes your solution",
            typical_titles: ["Director", "Senior Manager", "VP Operations", "Head of"],
            sbi_priority: "RELATIONSHIP_BUILDER", 
            engagement_strategy: "Technical validation, success stories, peer references"
        },
        STAKEHOLDER: {
            definition: "Influences decision but doesn't have final authority",
            typical_titles: ["Manager", "Senior Analyst", "Team Lead", "Specialist"],
            sbi_priority: "INFLUENCER",
            engagement_strategy: "Feature demonstrations, use case alignment"
        },
        BLOCKER: {
            definition: "Can delay or prevent the decision",
            typical_titles: ["IT Security", "Compliance", "Legal", "Procurement"],
            sbi_priority: "RISK_MITIGATION",
            engagement_strategy: "Address concerns early, provide compliance documentation"
        },
        INTRODUCER: {
            definition: "Provides access to other stakeholders",
            typical_titles: ["Business Development", "Partnerships", "Executive Assistant"],
            sbi_priority: "ACCESS_FACILITATOR",
            engagement_strategy: "Relationship building, referral requests"
        }
    },

    // SBI routing strategies
    SBI_ROUTING_STRATEGIES: {
        BOARD_FIRST: {
            description: "Engage C-level executives directly through board connections",
            best_for: ["Large Enterprise", "Strategic Deals", "Transformation Projects"],
            approach: "Executive briefings, board-level introductions, strategic partnerships"
        },
        CHAMPION_TECHNICAL: {
            description: "Build technical champion then escalate to decision makers",
            best_for: ["Technical Products", "Complex Solutions", "Proof-of-Concept Required"],
            approach: "Technical validation, pilot programs, champion development"
        },
        FOUNDER_DIRECT: {
            description: "Direct founder-to-founder engagement",
            best_for: ["Startups", "Growth Companies", "Innovation-Focused"],
            approach: "Peer networking, industry events, thought leadership"
        }
    },

    // SBI deal complexity framework
    SBI_DEAL_COMPLEXITY: {
        SIMPLE: {
            criteria: ["<100 employees", "Single decision maker", "Standard procurement"],
            sales_cycle: "1-3 months",
            stakeholder_count: "1-3 people",
            sbi_approach: "Direct sales, minimal customization"
        },
        COMPLEX: {
            criteria: ["100-1000 employees", "Committee decisions", "Formal RFP process"],
            sales_cycle: "3-9 months", 
            stakeholder_count: "4-8 people",
            sbi_approach: "Consensus building, multi-stakeholder engagement"
        },
        ENTERPRISE: {
            criteria: [">1000 employees", "Board approval required", "Enterprise procurement"],
            sales_cycle: "9-18 months",
            stakeholder_count: "8-15 people", 
            sbi_approach: "Strategic partnerships, executive sponsorship"
        }
    },

    // SBI-specific intelligence fields
    SBI_INTELLIGENCE_FIELDS: {
        PROCUREMENT_MATURITY: {
            description: "How sophisticated is their buying process",
            scale: "1-10 (1=informal, 10=enterprise procurement)",
            sbi_usage: "Determines sales approach and timeline"
        },
        DECISION_STYLE: {
            description: "How decisions are made in the organization", 
            options: ["Top-down", "Consensus-driven", "Committee-based", "Decentralized"],
            sbi_usage: "Guides stakeholder engagement strategy"
        },
        BUDGET_AUTHORITY_MAPPING: {
            description: "Who controls what budget levels",
            format: "Role + Budget threshold + Approval process",
            sbi_usage: "Identifies true economic buyers"
        },
        SALES_CYCLE_PREDICTION: {
            description: "Estimated time from first contact to close",
            factors: ["Company size", "Deal complexity", "Decision style", "Industry"],
            sbi_usage: "Resource allocation and pipeline forecasting"
        }
    },

    // SBI methodology prompts for AI
    SBI_AI_PROMPTS: {
        BUYER_GROUP_ANALYSIS: `
        Analyze this company using SBI Growth's proven B2B sales methodology:
        
        1. Identify the buyer group using SBI's 5-role framework:
           - Decision Maker (budget authority)
           - Champion (internal advocate) 
           - Stakeholder (influences decision)
           - Blocker (can prevent/delay)
           - Introducer (provides access)
        
        2. Determine SBI routing strategy:
           - Board-First: C-level engagement
           - Champion-Technical: Build technical champion first
           - Founder-Direct: Peer-to-peer approach
        
        3. Assess deal complexity using SBI framework:
           - Simple: 1-3 stakeholders, 1-3 month cycle
           - Complex: 4-8 stakeholders, 3-9 month cycle  
           - Enterprise: 8-15 stakeholders, 9-18 month cycle
        
        4. Provide SBI-specific intelligence:
           - Procurement maturity (1-10 scale)
           - Decision style (Top-down/Consensus/Committee/Decentralized)
           - Budget authority mapping
           - Sales cycle prediction
        `,
        
        ROUTING_INTELLIGENCE: `
        Based on SBI Growth's methodology, provide 3 specific routing strategies for this company:
        
        Strategy 1: Primary approach based on company profile
        Strategy 2: Alternative approach if primary fails
        Strategy 3: Backup approach for complex situations
        
        For each strategy, specify:
        - Target stakeholder type
        - Engagement method
        - Value proposition angle
        - Success metrics
        - Risk mitigation
        `,
        
        COMPETITIVE_POSITIONING: `
        Analyze competitive positioning using SBI's framework:
        
        1. Market position (Leader/Challenger/Follower/Niche)
        2. Competitive advantages and vulnerabilities
        3. Likely incumbent vendors
        4. Switching costs and barriers
        5. Competitive differentiation opportunities
        6. Timing advantages (budget cycles, contract renewals)
        `
    }
};
