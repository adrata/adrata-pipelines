// 🥈 ADVANCED PIPELINE (Silver) - 16 Comprehensive Modules for Enhanced Intelligence
const { AdvancedPipeline } = require('../../pipelines/advanced-pipeline.js');

/**
 * 🚀 ADVANCED PIPELINE API - Comprehensive Intelligence & Analysis
 * 
 * All Core Pipeline modules PLUS:
 * - IndustryClassification: Industry analysis and categorization
 * - CompanyLeadershipScraper: Full leadership team discovery
 * - EmailDiscovery: Advanced email pattern detection
 * - ContactResearch: Multi-source contact validation
 * - DomainAnalysis: Technical infrastructure analysis
 * - EmailTransitionTracker: Leadership change detection
 * - LocationAnalysis: Geographic and office analysis
 * - JobPostingAnalysis: Hiring pattern insights
 * 
 * Output: 45+ columns with comprehensive intelligence
 */

async function processAdvancedCompany(company) {
  const pipeline = new AdvancedPipeline();

  try {
    console.log(`🔄 Advanced Processing: ${company.Website}`);
    
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
      
      // Technical Analysis
      domainAnalysis: result.domainAnalysis || null,
      emailPatterns: result.emailPatterns || [],
      
      // Market Intelligence
      jobPostings: result.jobPostings || [],
      hiringTrends: result.hiringTrends || null,
      
      // Verification & Quality
      verificationReport: result.verificationReport || null,
      confidenceScore: result.confidenceScore || 0,
      
      // Metadata
      processingTime: result.processingTime || 0,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error(`❌ Advanced Error: ${error.message}`);
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
      pipeline: 'advanced',
      description: 'Comprehensive intelligence with industry analysis and leadership mapping',
      modules: [
        'CompanyResolver', 'ExecutiveResearch', 'ContactValidator',
        'ExecutiveContactIntelligence', 'ValidationEngine', 'PEOwnershipAnalysis',
        'IndustryClassification', 'CompanyLeadershipScraper', 'EmailDiscovery',
        'ContactResearch', 'DomainAnalysis', 'EmailTransitionTracker',
        'LocationAnalysis', 'JobPostingAnalysis'
      ],
      outputColumns: '45+',
      focus: 'Comprehensive intelligence and relationship analysis',
      idealFor: 'Strategic account planning and competitive intelligence'
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

      console.log(`🚀 Advanced Pipeline: Processing ${companies.length} companies`);
      
      const results = [];
      for (const company of companies) {
        const result = await processAdvancedCompany(company);
        results.push(result);
      }

      return res.json({
        pipeline: 'advanced',
        results,
        summary: {
          totalCompanies: companies.length,
          successfulProcessing: results.filter(r => !r.error).length,
          errors: results.filter(r => r.error).length,
          averageConfidence: results.reduce((acc, r) => acc + (r.confidenceScore || 0), 0) / results.length
        }
      });

    } catch (error) {
      console.error('Advanced Pipeline Error:', error);
      return res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
