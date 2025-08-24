// 🥇 POWERHOUSE PIPELINE (Gold) - All 26 Modules for Complete Enterprise Intelligence
const { PowerhousePipeline } = require('../../pipelines/powerhouse-pipeline.js');

/**
 * 🚀 POWERHOUSE PIPELINE API - Complete Enterprise Intelligence
 * 
 * Full-featured modules for maximum intelligence:
 * - All Advanced Pipeline modules PLUS:
 * - BuyerGroupAI: Buyer group identification and analysis
 * - Complete PE/VC firm analysis and relationship mapping
 * - Advanced competitive intelligence
 * - Full relationship network mapping
 * 
 * Output: 80+ columns with complete enterprise intelligence
 */

async function processPowerhouseCompany(company) {
  const pipeline = new PowerhousePipeline();

  try {
    console.log(`🔄 Powerhouse Processing: ${company.Website}`);
    
    const result = await pipeline.processCompany({
      website: company.Website,
      accountOwner: company['Account Owner'],
      isTop1000: company['Top 1000'] === '1'
    });

    return {
      website: company.Website,
      companyName: result.companyName || 'Unknown',
      accountOwner: company['Account Owner'],
      isTop1000: company['Top 1000'] === '1',
      
      // Core Executive Information
      cfoName: result.cfo?.name || null,
      cfoTitle: result.cfo?.title || null,
      cfoEmail: result.cfo?.email || null,
      cfoPhone: result.cfo?.phone || null,
      cfoLinkedIn: result.cfo?.linkedIn || null,
      
      croName: result.cro?.name || null,
      croTitle: result.cro?.title || null,
      croEmail: result.cro?.email || null,
      croPhone: result.cro?.phone || null,
      croLinkedIn: result.cro?.linkedIn || null,
      
      // Advanced Intelligence
      industry: result.industry || null,
      industryCategory: result.industryCategory || null,
      companySize: result.companySize || null,
      headquarters: result.headquarters || null,
      
      // Leadership Team
      leadershipTeam: result.leadershipTeam || [],
      totalExecutives: result.totalExecutives || 0,
      
      // Powerhouse Intelligence
      buyerGroups: result.buyerGroups || [],
      primaryBuyerGroup: result.primaryBuyerGroup || null,
      buyerGroupConfidence: result.buyerGroupConfidence || 0,
      
      // PE/VC Analysis
      peOwnership: result.peOwnership || null,
      vcFunding: result.vcFunding || null,
      investmentHistory: result.investmentHistory || [],
      
      // Relationship Mapping
      relationshipNetwork: result.relationshipNetwork || [],
      keyRelationships: result.keyRelationships || [],
      competitiveIntelligence: result.competitiveIntelligence || null,
      
      // Technical Analysis
      domainAnalysis: result.domainAnalysis || null,
      emailPatterns: result.emailPatterns || [],
      
      // Market Intelligence
      jobPostings: result.jobPostings || [],
      hiringTrends: result.hiringTrends || null,
      marketPosition: result.marketPosition || null,
      
      // Verification & Quality
      verificationReport: result.verificationReport || null,
      confidenceScore: result.confidenceScore || 0,
      riskAssessment: result.riskAssessment || null,
      
      // Metadata
      processingTime: result.processingTime || 0,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error(`❌ Powerhouse Error: ${error.message}`);
    return {
      website: company.Website,
      companyName: 'Error',
      accountOwner: company['Account Owner'],
      error: error.message,
      riskLevel: 'CRITICAL',
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.json({
      pipeline: 'powerhouse',
      description: 'Complete enterprise intelligence with buyer group analysis',
      modules: [
        'CompanyResolver', 'ExecutiveResearch', 'ContactValidator',
        'ExecutiveContactIntelligence', 'ValidationEngine', 'PEOwnershipAnalysis',
        'IndustryClassification', 'CompanyLeadershipScraper', 'EmailDiscovery',
        'ContactResearch', 'DomainAnalysis', 'EmailTransitionTracker',
        'LocationAnalysis', 'JobPostingAnalysis', 'BuyerGroupAI',
        'RelationshipMapping', 'RelationshipValidator', 'CoreSignalIntelligence',
        'IntelligenceGathering', 'PEFirmResearch', 'DataEnhancer',
        'AccuracyOptimizedContacts', 'RevenueLeaderDetection'
      ],
      outputColumns: '80+',
      focus: 'Complete enterprise intelligence and buyer group analysis',
      idealFor: 'Strategic account planning and complex B2B sales'
    });
  }

  if (req.method === 'POST') {
    try {
      const { companies } = req.body;

      if (!companies || !Array.isArray(companies)) {
        return res.status(400).json({ 
          error: 'Invalid request. Expected { companies: [...] }' 
        });
      }

      console.log(`🚀 Powerhouse Pipeline: Processing ${companies.length} companies`);
      
      const results = [];
      for (const company of companies) {
        const result = await processPowerhouseCompany(company);
        results.push(result);
      }

      return res.json({
        pipeline: 'powerhouse',
        results,
        summary: {
          totalCompanies: companies.length,
          successfulProcessing: results.filter(r => !r.error).length,
          errors: results.filter(r => r.error).length,
          averageConfidence: results.reduce((acc, r) => acc + (r.confidenceScore || 0), 0) / results.length,
          buyerGroupsIdentified: results.reduce((acc, r) => acc + (r.buyerGroups?.length || 0), 0)
        }
      });

    } catch (error) {
      console.error('Powerhouse Pipeline Error:', error);
      return res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
