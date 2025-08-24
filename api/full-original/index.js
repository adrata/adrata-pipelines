/**
 * FULL ORIGINAL ARCHITECTURE API
 * Uses the original pipeline files with ALL sophisticated modules intact
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Import original pipelines
const CorePipeline = require('../../pipelines/core-pipeline.js');
const AdvancedPipeline = require('../../pipelines/advanced-pipeline.js');
const PowerhousePipeline = require('../../pipelines/powerhouse-pipeline.js');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'GET') {
        return res.status(200).json({
            pipeline: 'full-original',
            description: 'Uses original pipeline files with ALL sophisticated modules',
            core_modules: [
                'CompanyResolver - Company identity and acquisitions',
                'ExecutiveResearch - Multi-layer executive discovery', 
                'ExecutiveContactIntelligence - CoreSignal + Lusha contacts',
                'ContactValidator - Email/phone validation',
                'ValidationEngine - Cross-validation and confidence scoring',
                'PEOwnershipAnalysis - Investment intelligence',
                'ApiCostOptimizer - Cost management',
                'ExecutiveTransitionDetector - Leadership changes'
            ],
            advanced_modules: [
                'All Core modules PLUS:',
                'IndustryClassification - Industry analysis',
                'RelationshipValidator - Relationship mapping',
                'DataEnhancer - Data quality enhancement',
                'AccuracyOptimizedContacts - Contact optimization'
            ],
            powerhouse_modules: [
                'All Advanced modules PLUS:',
                'BuyerGroupAI - Complete buyer group intelligence',
                'CompanyLeadershipScraper - Leadership analysis',
                'Additional enterprise modules'
            ],
            usage: {
                endpoint: '/api/full-original',
                method: 'POST',
                body: {
                    pipeline: 'core|advanced|powerhouse',
                    companies: [{ companyName: 'Example Corp', domain: 'example.com' }],
                    parallelization: 25
                }
            }
        });
    }

    if (req.method === 'POST') {
        try {
            const { pipeline = 'core', companies = [], parallelization = 25 } = req.body;

            if (!companies || companies.length === 0) {
                return res.status(400).json({ 
                    error: 'No companies provided',
                    required: 'companies array with companyName and domain'
                });
            }

            console.log(`🚀 FULL ORIGINAL PIPELINE: ${pipeline.toUpperCase()}`);
            console.log(`📊 Companies: ${companies.length}`);
            console.log(`⚡ Parallelization: ${parallelization}x`);

            const startTime = Date.now();
            const results = [];

            // Create pipeline instance
            let pipelineInstance;
            switch (pipeline.toLowerCase()) {
                case 'core':
                    pipelineInstance = new CorePipeline();
                    break;
                case 'advanced':
                    pipelineInstance = new AdvancedPipeline();
                    break;
                case 'powerhouse':
                    pipelineInstance = new PowerhousePipeline();
                    break;
                default:
                    return res.status(400).json({ error: 'Invalid pipeline type. Use: core, advanced, or powerhouse' });
            }

            // Process companies with maximum parallelization
            const processCompany = async (company) => {
                try {
                    console.log(`🔄 Processing: ${company.domain || company.companyName}`);
                    
                    const companyData = {
                        website: company.domain || company.website,
                        companyName: company.companyName,
                        accountOwner: company.accountOwner || 'Dan Mirolli',
                        isTop1000: company.isTop1000 || false
                    };

                    // Use original pipeline method
                    const result = await pipelineInstance.processCompany(companyData, companies.indexOf(company) + 1);
                    
                    if (result) {
                        console.log(`✅ Success: ${company.domain || company.companyName}`);
                        return result;
                    } else {
                        console.log(`⚠️ No result: ${company.domain || company.companyName}`);
                        return null;
                    }
                } catch (error) {
                    console.error(`❌ Error processing ${company.domain || company.companyName}:`, error.message);
                    return null;
                }
            };

            // Maximum parallelization with p-limit equivalent
            const limit = Math.min(parallelization, companies.length);
            const chunks = [];
            for (let i = 0; i < companies.length; i += limit) {
                chunks.push(companies.slice(i, i + limit));
            }

            for (const chunk of chunks) {
                const chunkPromises = chunk.map(processCompany);
                const chunkResults = await Promise.allSettled(chunkPromises);
                
                chunkResults.forEach((result, index) => {
                    if (result.status === 'fulfilled' && result.value) {
                        results.push(result.value);
                    } else {
                        console.log(`⚠️ Failed: ${chunk[index].domain || chunk[index].companyName}`);
                    }
                });
            }

            const endTime = Date.now();
            const duration = (endTime - startTime) / 1000;

            console.log(`🎯 FULL ORIGINAL RESULTS:`);
            console.log(`   • Processed: ${companies.length} companies`);
            console.log(`   • Successful: ${results.length}`);
            console.log(`   • Duration: ${duration.toFixed(1)}s`);
            console.log(`   • Speed: ${(companies.length / duration * 60).toFixed(1)} companies/minute`);

            return res.status(200).json({
                success: true,
                pipeline: pipeline.toUpperCase(),
                architecture: 'FULL ORIGINAL',
                results: results,
                stats: {
                    total_companies: companies.length,
                    successful: results.length,
                    failed: companies.length - results.length,
                    duration_seconds: duration,
                    companies_per_minute: Math.round(companies.length / duration * 60),
                    parallelization: parallelization
                },
                modules_used: pipeline === 'core' ? 8 : pipeline === 'advanced' ? 12 : 16,
                data_quality: 'MAXIMUM - All sophisticated modules active'
            });

        } catch (error) {
            console.error('❌ Full Original Pipeline Error:', error);
            return res.status(500).json({
                error: 'Pipeline execution failed',
                message: error.message,
                stack: error.stack
            });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
};
