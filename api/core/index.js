// 🥉 CORE PIPELINE (Bronze) - 8 Essential Modules for Fast CFO/CRO Discovery
const { CorePipeline } = require('../../pipelines/core-pipeline.js');
const { RealTimeVerificationEngine } = require('../../modules/RealTimeVerificationEngine.js');

/**
 * 🚀 CORE PIPELINE API - Fast & Focused Executive Discovery
 * 
 * Essential modules for CFO/CRO contact discovery:
 * - CompanyResolver: Company information and acquisition detection
 * - ExecutiveResearch: Leadership scraping and executive identification
 * - ContactValidator: Email/phone validation and generation
 * - ExecutiveContactIntelligence: Multi-API contact enrichment
 * - ValidationEngine: Data quality scoring
 * - PEOwnershipAnalysis: Private equity detection
 * 
 * Output: 24 essential columns focused on CFO/CRO contacts
 */

async function processCoreCompany(company) {
  const pipeline = new CorePipeline();
  const verificationEngine = new RealTimeVerificationEngine();

  try {
    const website = company.Website || company.domain || company.companyName;
    console.log(`🔄 Processing: ${website}`);
    
    const result = await pipeline.processSingleCompany({
      website: website,
      companyName: company.companyName,
      accountOwner: company['Account Owner'] || 'Dan Mirolli',
      isTop1000: company['Top 1000'] === '1'
    });
    
    // Debug: Log the actual result structure
    console.log('🔍 DEBUG: Pipeline result keys:', Object.keys(result || {}));
    console.log('🔍 DEBUG: CFO data:', result?.cfo);
    console.log('🔍 DEBUG: CRO data:', result?.cro);

    // Real-time verification
    const verificationEngine = new RealTimeVerificationEngine();
    if (result.cfo && result.cfo.name) {
      result.cfo.verification = await verificationEngine.verifyExecutiveAuthenticity(
        result.cfo, 
        { companyName: result.companyName }, 
        'CFO'
      );
    }
    if (result.cro && result.cro.name) {
      result.cro.verification = await verificationEngine.verifyExecutiveAuthenticity(
        result.cro, 
        { companyName: result.companyName }, 
        'CRO'
      );
    }

    return {
      website: website,
      companyName: result.companyName || company.companyName || 'Unknown',
      accountOwner: company['Account Owner'] || 'Dan Mirolli',
      isTop1000: company['Top 1000'] === '1',
      
      // CFO Information
      cfoName: result.cfo?.name || null,
      cfoTitle: result.cfo?.title || null,
      cfoEmail: result.cfo?.email || null,
      cfoPhone: result.cfo?.phone || null,
      cfoLinkedIn: result.cfo?.linkedIn || null,
      
      // CRO Information  
      croName: result.cro?.name || null,
      croTitle: result.cro?.title || null,
      croEmail: result.cro?.email || null,
      croPhone: result.cro?.phone || null,
      croLinkedIn: result.cro?.linkedIn || null,
      
      // Verification
      verification: result.verification || null,
      
      // Metadata
      processingTime: result.processingTime || 0,
      confidence: result.confidence || 0,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    const website = company.Website || company.domain || company.companyName;
    console.error(`❌ Error processing ${website}: ${error.message}`);
    return {
      website: website,
      companyName: company.companyName || 'Error',
      accountOwner: company['Account Owner'] || 'Dan Mirolli',
      error: error.message,
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
      pipeline: 'core',
      description: 'Fast CFO/CRO discovery with essential contact intelligence',
      modules: [
        'CompanyResolver',
        'ExecutiveResearch', 
        'ContactValidator',
        'ExecutiveContactIntelligence',
        'ValidationEngine',
        'PEOwnershipAnalysis'
      ],
      outputColumns: 24,
      focus: 'CFO/CRO contact discovery and validation',
      idealFor: 'Fast executive outreach and contact generation'
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

      console.log(`🚀 Core Pipeline: Processing ${companies.length} companies`);
      
      const results = [];
      for (const company of companies) {
        const result = await processCoreCompany(company);
        results.push(result);
      }

      return res.json({
        pipeline: 'core',
        results,
        summary: {
          totalCompanies: companies.length,
          successfulProcessing: results.filter(r => !r.error).length,
          errors: results.filter(r => r.error).length
        }
      });

    } catch (error) {
      console.error('Core Pipeline Error:', error);
      return res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
