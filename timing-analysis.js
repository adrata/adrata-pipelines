#!/usr/bin/env node

/**
 * DETAILED TIMING ANALYSIS - Measure each pipeline section
 */

require('dotenv').config();

async function runTimingAnalysis() {
    console.log('🕐 STARTING DETAILED TIMING ANALYSIS');
    console.log('=====================================\n');
    
    const startTime = Date.now();
    const timings = {};
    
    try {
        // Initialize pipeline
        console.log('⏱️  STEP 0: Pipeline Initialization');
        const stepStart = Date.now();
        
        const { CorePipeline } = require("./pipelines/core-pipeline");
        const pipeline = new CorePipeline();
        
        timings.initialization = Date.now() - stepStart;
        console.log(`   ✅ Completed in ${timings.initialization}ms\n`);
        
        const testCompany = {
            website: 'microsoft.com',
            companyName: 'Microsoft',
            accountOwner: 'Dan Mirolli',
            isTop1000: false
        };
        
        // STEP 1: Company Resolution
        console.log('⏱️  STEP 1: Company Resolution');
        const step1Start = Date.now();
        
        const companyResolution = await pipeline.companyResolver.resolveCompany(testCompany.website);
        
        timings.companyResolution = Date.now() - step1Start;
        console.log(`   ✅ Completed in ${timings.companyResolution}ms`);
        console.log(`   📊 Company: ${companyResolution.companyName}\n`);
        
        // STEP 2: Executive Research
        console.log('⏱️  STEP 2: Executive Research');
        const step2Start = Date.now();
        
        const research = await pipeline.researcher.researchExecutives({
            name: companyResolution.companyName,
            website: testCompany.website,
            companyResolution: companyResolution
        });
        
        timings.executiveResearch = Date.now() - step2Start;
        console.log(`   ✅ Completed in ${timings.executiveResearch}ms`);
        console.log(`   👤 CFO: ${research.cfo?.name || 'Not found'}`);
        console.log(`   👤 CRO: ${research.cro?.name || 'Not found'}\n`);
        
        // Create result object for next steps
        const result = {
            companyName: companyResolution.companyName,
            cfo: {
                name: research.cfo?.name || '',
                title: research.cfo?.title || '',
                email: '',
                phone: '',
                linkedIn: '',
                confidence: research.cfo?.confidence || 0
            },
            cro: {
                name: research.cro?.name || '',
                title: research.cro?.title || '',
                email: '',
                phone: '',
                linkedIn: '',
                confidence: research.cro?.confidence || 0
            }
        };
        
        // STEP 3: Contact Intelligence (The suspected bottleneck)
        console.log('⏱️  STEP 3: Contact Intelligence');
        const step3Start = Date.now();
        
        const contactIntelligence = await pipeline.executiveContactIntelligence.enhanceExecutiveIntelligence(result);
        
        timings.contactIntelligence = Date.now() - step3Start;
        console.log(`   ✅ Completed in ${timings.contactIntelligence}ms`);
        console.log(`   📧 Contact data structure: ${JSON.stringify(Object.keys(contactIntelligence || {}))}\n`);
        
        // STEP 4: Contact Validation
        console.log('⏱️  STEP 4: Contact Validation');
        const step4Start = Date.now();
        
        const contactValidation = await pipeline.contactValidator.enrichContacts(
            { executives: { cfo: result.cfo, cro: result.cro } },
            companyResolution
        );
        
        timings.contactValidation = Date.now() - step4Start;
        console.log(`   ✅ Completed in ${timings.contactValidation}ms\n`);
        
        // STEP 5: Data Validation
        console.log('⏱️  STEP 5: Data Validation');
        const step5Start = Date.now();
        
        const dataValidation = await pipeline.validationEngine.validateExecutiveData(
            contactValidation,
            { executives: { cfo: result.cfo, cro: result.cro }, sources: ['ExecutiveResearch', 'ContactIntelligence'] },
            companyResolution
        );
        
        timings.dataValidation = Date.now() - step5Start;
        console.log(`   ✅ Completed in ${timings.dataValidation}ms\n`);
        
        // Calculate totals
        const totalTime = Date.now() - startTime;
        timings.total = totalTime;
        
        // RESULTS ANALYSIS
        console.log('📊 TIMING ANALYSIS RESULTS');
        console.log('===========================');
        console.log(`🏁 Total Time: ${totalTime}ms (${(totalTime/1000).toFixed(2)}s)`);
        console.log(`📈 Breakdown:`);
        console.log(`   1. Initialization:      ${timings.initialization}ms (${((timings.initialization/totalTime)*100).toFixed(1)}%)`);
        console.log(`   2. Company Resolution:  ${timings.companyResolution}ms (${((timings.companyResolution/totalTime)*100).toFixed(1)}%)`);
        console.log(`   3. Executive Research:  ${timings.executiveResearch}ms (${((timings.executiveResearch/totalTime)*100).toFixed(1)}%)`);
        console.log(`   4. Contact Intelligence: ${timings.contactIntelligence}ms (${((timings.contactIntelligence/totalTime)*100).toFixed(1)}%)`);
        console.log(`   5. Contact Validation:  ${timings.contactValidation}ms (${((timings.contactValidation/totalTime)*100).toFixed(1)}%)`);
        console.log(`   6. Data Validation:     ${timings.dataValidation}ms (${((timings.dataValidation/totalTime)*100).toFixed(1)}%)`);
        
        // Identify bottlenecks
        const steps = [
            { name: 'Company Resolution', time: timings.companyResolution },
            { name: 'Executive Research', time: timings.executiveResearch },
            { name: 'Contact Intelligence', time: timings.contactIntelligence },
            { name: 'Contact Validation', time: timings.contactValidation },
            { name: 'Data Validation', time: timings.dataValidation }
        ];
        
        steps.sort((a, b) => b.time - a.time);
        
        console.log(`\n🚨 BOTTLENECK ANALYSIS:`);
        console.log(`   1. ${steps[0].name}: ${steps[0].time}ms (SLOWEST)`);
        console.log(`   2. ${steps[1].name}: ${steps[1].time}ms`);
        console.log(`   3. ${steps[2].name}: ${steps[2].time}ms`);
        
        // Vercel compatibility analysis
        console.log(`\n⚡ VERCEL COMPATIBILITY:`);
        if (totalTime > 300000) {
            console.log(`   ❌ EXCEEDS Vercel timeout (300s)`);
        } else if (totalTime > 60000) {
            console.log(`   ⚠️  CLOSE to Vercel timeout (${(totalTime/1000).toFixed(1)}s / 300s)`);
        } else {
            console.log(`   ✅ WITHIN Vercel timeout (${(totalTime/1000).toFixed(1)}s / 300s)`);
        }
        
        // Optimization recommendations
        console.log(`\n💡 OPTIMIZATION RECOMMENDATIONS:`);
        if (timings.contactIntelligence > 30000) {
            console.log(`   🎯 Contact Intelligence is slow (${(timings.contactIntelligence/1000).toFixed(1)}s)`);
            console.log(`      - Add aggressive timeouts to API calls`);
            console.log(`      - Implement parallel API calls`);
            console.log(`      - Add circuit breakers for failing APIs`);
        }
        
        if (timings.executiveResearch > 20000) {
            console.log(`   🎯 Executive Research is slow (${(timings.executiveResearch/1000).toFixed(1)}s)`);
            console.log(`      - Cache leadership page scraping results`);
            console.log(`      - Optimize AI processing`);
        }
        
        return timings;
        
    } catch (error) {
        console.error('❌ Timing analysis failed:', error.message);
        console.error('Stack:', error.stack);
        return null;
    }
}

// Run with timeout
const timeout = setTimeout(() => {
    console.log('⏰ Timing analysis timed out after 5 minutes');
    process.exit(1);
}, 300000); // 5 minute timeout

runTimingAnalysis().then((timings) => {
    clearTimeout(timeout);
    if (timings) {
        console.log(`\n🎯 Analysis complete! Total time: ${(timings.total/1000).toFixed(2)}s`);
    }
    process.exit(0);
}).catch(error => {
    clearTimeout(timeout);
    console.error('❌ Analysis failed:', error.message);
    process.exit(1);
});
