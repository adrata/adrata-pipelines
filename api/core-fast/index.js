// 🥉 CORE PIPELINE (Fast Version) - Skip heavy API calls for Vercel testing
const { CorePipeline } = require('../../pipelines/core-pipeline.js');

/**
 * 🚀 FAST CORE PIPELINE API - Executive Discovery Only
 * 
 * This version skips the heavy contact intelligence APIs to test
 * if the executive discovery is working properly on Vercel.
 */

async function processCoreCompanyFast(company) {
  const pipeline = new CorePipeline();

  try {
    const website = company.Website || company.domain || company.companyName;
    console.log(`🔄 Processing (Fast Mode): ${website}`);
    
    // Create a minimal company object
    const companyData = {
      website: website,
      companyName: company.companyName,
      accountOwner: company['Account Owner'] || 'Dan Mirolli',
      isTop1000: company['Top 1000'] === '1'
    };
    
    // Call the company resolver and executive research only
    const companyResolution = await pipeline.companyResolver.resolveCompany(website);
    const companyName = companyResolution.companyName || website;
    
    console.log(`✅ Company resolved: ${companyName}`);
    
    // Call executive research only (skip contact intelligence)
    const research = await pipeline.researcher.researchExecutives({
      name: companyName,
      website: website,
      companyResolution: companyResolution
    });
    
    console.log(`✅ Research complete - CFO: ${research.cfo?.name}, CRO: ${research.cro?.name}`);
    
    return {
      website: website,
      companyName: companyName,
      accountOwner: companyData.accountOwner,
      isTop1000: companyData.isTop1000,
      
      // CFO Information (from research only)
      cfoName: research.cfo?.name || null,
      cfoTitle: research.cfo?.title || null,
      cfoEmail: null, // Skip contact intelligence for now
      cfoPhone: null,
      cfoLinkedIn: null,
      cfoConfidence: research.cfo?.confidence || 0,
      
      // CRO Information (from research only)
      croName: research.cro?.name || null,
      croTitle: research.cro?.title || null,
      croEmail: null, // Skip contact intelligence for now
      croPhone: null,
      croLinkedIn: null,
      croConfidence: research.cro?.confidence || 0,
      
      // Metadata
      processingTime: 0,
      confidence: Math.round(((research.cfo?.confidence || 0) + (research.cro?.confidence || 0)) / 2 * 100),
      timestamp: new Date().toISOString(),
      mode: 'fast'
    };

  } catch (error) {
    console.error(`❌ Error processing ${company.companyName}: ${error.message}`);
    return {
      website: website,
      companyName: company.companyName || 'Error',
      accountOwner: company['Account Owner'] || 'Dan Mirolli',
      error: error.message,
      timestamp: new Date().toISOString(),
      mode: 'fast'
    };
  }
}

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    try {
      const { companies } = req.body;
      
      if (!companies || !Array.isArray(companies)) {
        return res.status(400).json({ 
          error: 'Invalid request. Expected { companies: [...] }' 
        });
      }

      console.log(`🚀 Processing ${companies.length} companies in FAST mode...`);
      
      const results = [];
      for (const company of companies) {
        const result = await processCoreCompanyFast(company);
        results.push(result);
      }

      const successfulProcessing = results.filter(r => !r.error).length;
      const errors = results.filter(r => r.error).length;

      res.status(200).json({
        pipeline: 'core-fast',
        results,
        summary: {
          totalCompanies: companies.length,
          successfulProcessing,
          errors
        }
      });

    } catch (error) {
      console.error('Error processing Core Pipeline:', error);
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'GET') {
    res.status(200).json({
      pipeline: 'core-fast',
      description: 'Fast Executive Discovery (Names & Titles Only)',
      note: 'Skips contact intelligence for speed testing',
      modules: [
        'CompanyResolver',
        'ExecutiveResearch'
      ],
      outputColumns: 'Executive names and titles only',
      focus: 'CFO/CRO identification speed test',
      idealFor: 'Testing executive discovery on Vercel'
    });
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
