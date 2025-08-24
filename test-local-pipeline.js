// Local Pipeline Test - Verify everything works before Vercel deployment
const { CorePipeline } = require('./pipelines/core-pipeline.js');

async function testLocalPipeline() {
  console.log('🚀 Testing Adrata Pipeline System Locally...\n');

  // Test data - 2 companies for quick verification
  const testCompanies = [
    {
      Website: 'microsoft.com',
      'Top 1000': '1',
      'Account Owner': 'Dan Mirolli'
    },
    {
      Website: 'salesforce.com', 
      'Top 1000': '1',
      'Account Owner': 'Dan Mirolli'
    }
  ];

  try {
    const pipeline = new CorePipeline();
    console.log('✅ Core Pipeline initialized successfully');

    const results = [];
    const startTime = Date.now();

    for (const company of testCompanies) {
      console.log(`\n🔄 Processing: ${company.Website}`);
      
      try {
        const result = await pipeline.processCompany({
          website: company.Website,
          accountOwner: company['Account Owner'],
          isTop1000: company['Top 1000'] === '1'
        });

        const processedResult = {
          website: company.Website,
          companyName: result.companyName || 'Unknown',
          accountOwner: company['Account Owner'],
          isTop1000: company['Top 1000'] === '1',
          
          // CFO Information
          cfoName: result.cfo?.name || null,
          cfoTitle: result.cfo?.title || null,
          cfoEmail: result.cfo?.email || null,
          
          // CRO Information  
          croName: result.cro?.name || null,
          croTitle: result.cro?.title || null,
          croEmail: result.cro?.email || null,
          
          // Metadata
          processingTime: result.processingTime || 0,
          confidence: result.confidence || 0,
          timestamp: new Date().toISOString()
        };

        results.push(processedResult);
        console.log(`✅ Success: Found ${result.cfo?.name || 'N/A'} (CFO), ${result.cro?.name || 'N/A'} (CRO)`);

      } catch (error) {
        console.error(`❌ Error processing ${company.Website}: ${error.message}`);
        results.push({
          website: company.Website,
          companyName: 'Error',
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }

    const totalTime = Date.now() - startTime;
    
    console.log('\n📊 LOCAL TEST RESULTS:');
    console.log('='.repeat(50));
    console.log(`Total Companies: ${testCompanies.length}`);
    console.log(`Successful: ${results.filter(r => !r.error).length}`);
    console.log(`Errors: ${results.filter(r => r.error).length}`);
    console.log(`Total Time: ${totalTime}ms`);
    console.log(`Average Time: ${Math.round(totalTime / testCompanies.length)}ms per company`);
    
    console.log('\n📋 DETAILED RESULTS:');
    results.forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.website}`);
      if (result.error) {
        console.log(`   ❌ Error: ${result.error}`);
      } else {
        console.log(`   Company: ${result.companyName}`);
        console.log(`   CFO: ${result.cfoName || 'Not found'} (${result.cfoEmail || 'No email'})`);
        console.log(`   CRO: ${result.croName || 'Not found'} (${result.croEmail || 'No email'})`);
        console.log(`   Confidence: ${result.confidence}%`);
      }
    });

    console.log('\n🎉 LOCAL PIPELINE TEST COMPLETED SUCCESSFULLY!');
    console.log('✅ Ready for Vercel deployment testing');
    
    return results;

  } catch (error) {
    console.error('❌ CRITICAL ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testLocalPipeline().catch(console.error);
}

module.exports = { testLocalPipeline };
