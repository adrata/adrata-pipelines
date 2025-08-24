#!/usr/bin/env node

/**
 * 🚀 ADRATA PIPELINE SYSTEM - PRODUCTION SERVER
 * 
 * Three-tier intelligence system for SBI Growth methodology
 * - Core: Premium CFO/CRO contacts
 * - Advanced: Corporate structure intelligence  
 * - Powerhouse: Complete buyer group intelligence
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

// Import pipeline classes
const { CorePipeline } = require('./pipelines/core-pipeline');
const { AdvancedPipeline } = require('./pipelines/advanced-pipeline');
const { PowerhousePipeline } = require('./pipelines/powerhouse-pipeline');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        pipelines: ['core', 'advanced', 'powerhouse']
    });
});

// Pipeline status endpoint
app.get('/api/status', (req, res) => {
    res.json({
        pipelines: {
            core: { status: 'active', accuracy: '92%', speed: '<2s' },
            advanced: { status: 'active', accuracy: '95%', speed: '<6s' },
            powerhouse: { status: 'active', accuracy: '98%', speed: '<4s' }
        },
        apiKeys: {
            perplexity: !!process.env.PERPLEXITY_API_KEY,
            coresignal: !!process.env.CORESIGNAL_API_KEY,
            lusha: !!process.env.LUSHA_API_KEY,
            zerobounce: !!process.env.ZEROBOUNCE_API_KEY,
            prospeo: !!process.env.PROSPEO_API_KEY,
            myemailverifier: !!process.env.MYEMAILVERIFIER_API_KEY
        }
    });
});

// Core Pipeline API
app.post('/api/pipeline/core', async (req, res) => {
    try {
        console.log('🥉 Core Pipeline request received');
        const { companies } = req.body;
        
        if (!companies || !Array.isArray(companies)) {
            return res.status(400).json({
                error: 'Invalid request: companies array required',
                example: { companies: [{ website: 'example.com' }] }
            });
        }
        
        const pipeline = new CorePipeline();
        const results = [];
        
        for (const company of companies) {
            const startTime = Date.now();
            const result = await pipeline.processCompany(company, results.length + 1);
            const processingTime = Date.now() - startTime;
            
            results.push({
                ...result,
                processingTime: `${processingTime}ms`
            });
        }
        
        res.json({
            pipeline: 'core',
            processed: companies.length,
            results,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Core Pipeline error:', error);
        res.status(500).json({
            error: 'Core Pipeline processing failed',
            message: error.message
        });
    }
});

// Advanced Pipeline API
app.post('/api/pipeline/advanced', async (req, res) => {
    try {
        console.log('🥈 Advanced Pipeline request received');
        const { companies } = req.body;
        
        if (!companies || !Array.isArray(companies)) {
            return res.status(400).json({
                error: 'Invalid request: companies array required',
                example: { companies: [{ website: 'example.com' }] }
            });
        }
        
        const pipeline = new AdvancedPipeline();
        const results = [];
        
        for (const company of companies) {
            const startTime = Date.now();
            const result = await pipeline.processCompany(company, results.length + 1);
            const processingTime = Date.now() - startTime;
            
            results.push({
                ...result,
                processingTime: `${processingTime}ms`
            });
        }
        
        res.json({
            pipeline: 'advanced',
            processed: companies.length,
            results,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Advanced Pipeline error:', error);
        res.status(500).json({
            error: 'Advanced Pipeline processing failed',
            message: error.message
        });
    }
});

// Powerhouse Pipeline API
app.post('/api/pipeline/powerhouse', async (req, res) => {
    try {
        console.log('🥇 Powerhouse Pipeline request received');
        const { companies } = req.body;
        
        if (!companies || !Array.isArray(companies)) {
            return res.status(400).json({
                error: 'Invalid request: companies array required',
                example: { companies: [{ website: 'example.com' }] }
            });
        }
        
        const pipeline = new PowerhousePipeline();
        const results = [];
        
        for (const company of companies) {
            const startTime = Date.now();
            const result = await pipeline.processCompany(company, results.length + 1);
            const processingTime = Date.now() - startTime;
            
            results.push({
                ...result,
                processingTime: `${processingTime}ms`
            });
        }
        
        res.json({
            pipeline: 'powerhouse',
            processed: companies.length,
            results,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Powerhouse Pipeline error:', error);
        res.status(500).json({
            error: 'Powerhouse Pipeline processing failed',
            message: error.message
        });
    }
});

// Batch processing endpoint (all pipelines)
app.post('/api/pipeline/batch', async (req, res) => {
    try {
        console.log('🚀 Batch Pipeline request received');
        const { companies, pipelines = ['core', 'advanced', 'powerhouse'] } = req.body;
        
        if (!companies || !Array.isArray(companies)) {
            return res.status(400).json({
                error: 'Invalid request: companies array required'
            });
        }
        
        const results = {};
        
        // Process each pipeline
        for (const pipelineType of pipelines) {
            console.log(`Processing ${pipelineType} pipeline...`);
            
            let pipeline;
            switch (pipelineType) {
                case 'core':
                    pipeline = new CorePipeline();
                    break;
                case 'advanced':
                    pipeline = new AdvancedPipeline();
                    break;
                case 'powerhouse':
                    pipeline = new PowerhousePipeline();
                    break;
                default:
                    continue;
            }
            
            const pipelineResults = [];
            for (const company of companies) {
                const startTime = Date.now();
                const result = await pipeline.processCompany(company, pipelineResults.length + 1);
                const processingTime = Date.now() - startTime;
                
                pipelineResults.push({
                    ...result,
                    processingTime: `${processingTime}ms`
                });
            }
            
            results[pipelineType] = pipelineResults;
        }
        
        res.json({
            processed: companies.length,
            pipelines: pipelines,
            results,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Batch Pipeline error:', error);
        res.status(500).json({
            error: 'Batch Pipeline processing failed',
            message: error.message
        });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        availableEndpoints: [
            'GET /health',
            'GET /api/status',
            'POST /api/pipeline/core',
            'POST /api/pipeline/advanced',
            'POST /api/pipeline/powerhouse',
            'POST /api/pipeline/batch'
        ]
    });
});

// Start server
app.listen(PORT, () => {
    console.log('\n' + '='.repeat(80));
    console.log('🚀 ADRATA PIPELINE SYSTEM - PRODUCTION SERVER');
    console.log('='.repeat(80));
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('\nAvailable Endpoints:');
    console.log(`  GET  http://localhost:${PORT}/health`);
    console.log(`  GET  http://localhost:${PORT}/api/status`);
    console.log(`  POST http://localhost:${PORT}/api/pipeline/core`);
    console.log(`  POST http://localhost:${PORT}/api/pipeline/advanced`);
    console.log(`  POST http://localhost:${PORT}/api/pipeline/powerhouse`);
    console.log(`  POST http://localhost:${PORT}/api/pipeline/batch`);
    console.log('\n🎯 Ready for SBI Growth intelligence processing!');
    console.log('='.repeat(80));
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...');
    process.exit(0);
});

module.exports = app;
