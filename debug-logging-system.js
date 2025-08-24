#!/usr/bin/env node

/**
 * 🔍 COMPREHENSIVE DEBUG & LOGGING SYSTEM
 * 
 * Advanced debugging and monitoring for pipeline validation:
 * - Real-time performance monitoring
 * - Detailed error tracking and analysis
 * - API call logging and cost tracking
 * - Data quality validation
 * - Production readiness checks
 */

const fs = require('fs');
const path = require('path');

class DebugLoggingSystem {
    constructor() {
        this.logFile = 'pipeline-debug.log';
        this.errorFile = 'pipeline-errors.log';
        this.performanceFile = 'pipeline-performance.log';
        
        this.session = {
            id: this.generateSessionId(),
            startTime: Date.now(),
            pipeline: null,
            company: null,
            step: null,
            errors: [],
            warnings: [],
            performance: [],
            apiCalls: [],
            dataQuality: []
        };
        
        this.thresholds = {
            slowProcessing: 5000, // 5 seconds
            highCost: 1.0, // $1 per company
            lowAccuracy: 85, // 85%
            errorRate: 10 // 10%
        };
        
        // Initialize log files
        this.initializeLogFiles();
    }

    /**
     * 🚀 INITIALIZE LOGGING SESSION
     */
    initializeLogFiles() {
        const timestamp = new Date().toISOString();
        const header = `\n${'='.repeat(80)}\n🔍 PIPELINE DEBUG SESSION - ${timestamp}\n${'='.repeat(80)}\n`;
        
        fs.appendFileSync(this.logFile, header);
        fs.appendFileSync(this.errorFile, header);
        fs.appendFileSync(this.performanceFile, header);
        
        this.log('DEBUG', 'Logging system initialized', { sessionId: this.session.id });
    }

    /**
     * 📝 CORE LOGGING FUNCTION
     */
    log(level, message, data = {}) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            sessionId: this.session.id,
            level,
            message,
            pipeline: this.session.pipeline,
            company: this.session.company,
            step: this.session.step,
            data
        };
        
        // Console output with colors
        const colorCode = this.getColorCode(level);
        console.log(`${colorCode}[${timestamp}] ${level}: ${message}${this.getResetCode()}`);
        if (Object.keys(data).length > 0) {
            console.log(`   Data:`, JSON.stringify(data, null, 2));
        }
        
        // File output
        const logLine = `[${timestamp}] ${level}: ${message} | ${JSON.stringify(data)}\n`;
        fs.appendFileSync(this.logFile, logLine);
        
        // Error file for errors and warnings
        if (level === 'ERROR' || level === 'WARN') {
            fs.appendFileSync(this.errorFile, logLine);
        }
        
        // Performance file for performance data
        if (level === 'PERF') {
            fs.appendFileSync(this.performanceFile, logLine);
        }
    }

    /**
     * 🎯 PIPELINE SESSION MANAGEMENT
     */
    startPipelineSession(pipelineType, companies) {
        this.session.pipeline = pipelineType;
        this.session.totalCompanies = companies.length;
        this.session.currentCompany = 0;
        
        this.log('INFO', `Starting ${pipelineType} pipeline session`, {
            companies: companies.length,
            expectedDuration: this.estimateDuration(pipelineType, companies.length)
        });
    }

    startCompanyProcessing(company, index) {
        this.session.company = company.website || company.name || `company_${index}`;
        this.session.currentCompany = index;
        this.session.companyStartTime = Date.now();
        
        this.log('INFO', `Processing company ${index}/${this.session.totalCompanies}`, {
            company: this.session.company,
            progress: `${((index / this.session.totalCompanies) * 100).toFixed(1)}%`
        });
    }

    endCompanyProcessing(result, errors = []) {
        const processingTime = Date.now() - this.session.companyStartTime;
        
        // Performance tracking
        this.session.performance.push({
            company: this.session.company,
            processingTime,
            success: !errors.length,
            errors: errors.length
        });
        
        // Log performance
        this.log('PERF', 'Company processing completed', {
            company: this.session.company,
            processingTime: `${processingTime}ms`,
            success: !errors.length,
            errors: errors.length
        });
        
        // Check for performance issues
        if (processingTime > this.thresholds.slowProcessing) {
            this.log('WARN', 'Slow processing detected', {
                company: this.session.company,
                processingTime: `${processingTime}ms`,
                threshold: `${this.thresholds.slowProcessing}ms`
            });
        }
        
        // Log errors
        if (errors.length > 0) {
            this.session.errors.push(...errors);
            errors.forEach(error => {
                this.log('ERROR', 'Company processing error', {
                    company: this.session.company,
                    error: error.message || error
                });
            });
        }
    }

    /**
     * 🔧 STEP-BY-STEP DEBUGGING
     */
    startStep(stepName, description = '') {
        this.session.step = stepName;
        this.session.stepStartTime = Date.now();
        
        this.log('DEBUG', `Starting step: ${stepName}`, {
            description,
            company: this.session.company
        });
    }

    endStep(stepName, result = null, error = null) {
        const stepTime = Date.now() - this.session.stepStartTime;
        
        if (error) {
            this.log('ERROR', `Step failed: ${stepName}`, {
                stepTime: `${stepTime}ms`,
                error: error.message || error,
                company: this.session.company
            });
        } else {
            this.log('DEBUG', `Step completed: ${stepName}`, {
                stepTime: `${stepTime}ms`,
                success: !!result,
                company: this.session.company
            });
        }
        
        this.session.step = null;
    }

    /**
     * 💰 API CALL TRACKING
     */
    logApiCall(provider, endpoint, cost = 0, success = true, responseTime = 0) {
        const apiCall = {
            timestamp: Date.now(),
            provider,
            endpoint,
            cost,
            success,
            responseTime,
            company: this.session.company,
            step: this.session.step
        };
        
        this.session.apiCalls.push(apiCall);
        
        this.log('API', `${provider} API call`, {
            endpoint,
            cost: `$${cost.toFixed(4)}`,
            success,
            responseTime: `${responseTime}ms`,
            company: this.session.company
        });
        
        // Check for high costs
        if (cost > 0.1) { // More than 10 cents per call
            this.log('WARN', 'High cost API call detected', {
                provider,
                cost: `$${cost.toFixed(4)}`,
                company: this.session.company
            });
        }
    }

    /**
     * 📊 DATA QUALITY VALIDATION
     */
    validateDataQuality(data, expectedFields, dataType = 'unknown') {
        const validation = {
            timestamp: Date.now(),
            dataType,
            company: this.session.company,
            step: this.session.step,
            totalFields: expectedFields.length,
            presentFields: 0,
            missingFields: [],
            emptyFields: [],
            qualityScore: 0
        };
        
        expectedFields.forEach(field => {
            if (data && data.hasOwnProperty(field)) {
                validation.presentFields++;
                if (!data[field] || data[field] === '' || data[field] === null) {
                    validation.emptyFields.push(field);
                }
            } else {
                validation.missingFields.push(field);
            }
        });
        
        validation.qualityScore = (validation.presentFields / validation.totalFields) * 100;
        
        this.session.dataQuality.push(validation);
        
        this.log('DATA', `Data quality check: ${dataType}`, {
            qualityScore: `${validation.qualityScore.toFixed(1)}%`,
            presentFields: `${validation.presentFields}/${validation.totalFields}`,
            missingFields: validation.missingFields.length,
            emptyFields: validation.emptyFields.length,
            company: this.session.company
        });
        
        // Check for low quality
        if (validation.qualityScore < 70) {
            this.log('WARN', 'Low data quality detected', {
                dataType,
                qualityScore: `${validation.qualityScore.toFixed(1)}%`,
                missingFields: validation.missingFields,
                company: this.session.company
            });
        }
        
        return validation;
    }

    /**
     * 🚨 ERROR ANALYSIS
     */
    analyzeErrors() {
        const errorAnalysis = {
            totalErrors: this.session.errors.length,
            errorRate: (this.session.errors.length / this.session.totalCompanies) * 100,
            errorTypes: {},
            mostProblematicCompanies: [],
            recommendations: []
        };
        
        // Categorize errors
        this.session.errors.forEach(error => {
            const errorType = this.categorizeError(error);
            errorAnalysis.errorTypes[errorType] = (errorAnalysis.errorTypes[errorType] || 0) + 1;
        });
        
        // Find problematic companies
        const companyErrors = {};
        this.session.performance.forEach(perf => {
            if (perf.errors > 0) {
                companyErrors[perf.company] = perf.errors;
            }
        });
        
        errorAnalysis.mostProblematicCompanies = Object.entries(companyErrors)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([company, errors]) => ({ company, errors }));
        
        // Generate recommendations
        if (errorAnalysis.errorRate > this.thresholds.errorRate) {
            errorAnalysis.recommendations.push('High error rate detected - review input data quality');
        }
        
        Object.entries(errorAnalysis.errorTypes).forEach(([type, count]) => {
            if (count > 3) {
                errorAnalysis.recommendations.push(`Multiple ${type} errors - check ${type} configuration`);
            }
        });
        
        return errorAnalysis;
    }

    /**
     * 📈 PERFORMANCE ANALYSIS
     */
    analyzePerformance() {
        const performanceAnalysis = {
            totalProcessingTime: Date.now() - this.session.startTime,
            averageProcessingTime: 0,
            slowestCompanies: [],
            fastestCompanies: [],
            throughput: 0,
            projectedTimeFor1300: 0
        };
        
        if (this.session.performance.length > 0) {
            const times = this.session.performance.map(p => p.processingTime);
            performanceAnalysis.averageProcessingTime = times.reduce((a, b) => a + b, 0) / times.length;
            
            // Sort by processing time
            const sortedPerformance = [...this.session.performance].sort((a, b) => b.processingTime - a.processingTime);
            performanceAnalysis.slowestCompanies = sortedPerformance.slice(0, 3);
            performanceAnalysis.fastestCompanies = sortedPerformance.slice(-3).reverse();
            
            // Calculate throughput (companies per hour)
            performanceAnalysis.throughput = 3600000 / performanceAnalysis.averageProcessingTime;
            
            // Project time for 1300 companies
            performanceAnalysis.projectedTimeFor1300 = performanceAnalysis.averageProcessingTime * 1300;
        }
        
        return performanceAnalysis;
    }

    /**
     * 💰 COST ANALYSIS
     */
    analyzeCosts() {
        const costAnalysis = {
            totalCost: 0,
            averageCostPerCompany: 0,
            costByProvider: {},
            projectedCostFor1300: 0,
            highCostCalls: []
        };
        
        this.session.apiCalls.forEach(call => {
            costAnalysis.totalCost += call.cost;
            costAnalysis.costByProvider[call.provider] = (costAnalysis.costByProvider[call.provider] || 0) + call.cost;
            
            if (call.cost > 0.1) {
                costAnalysis.highCostCalls.push(call);
            }
        });
        
        if (this.session.totalCompanies > 0) {
            costAnalysis.averageCostPerCompany = costAnalysis.totalCost / this.session.totalCompanies;
            costAnalysis.projectedCostFor1300 = costAnalysis.averageCostPerCompany * 1300;
        }
        
        return costAnalysis;
    }

    /**
     * 📊 GENERATE COMPREHENSIVE DEBUG REPORT
     */
    generateDebugReport() {
        const report = {
            session: {
                id: this.session.id,
                pipeline: this.session.pipeline,
                duration: Date.now() - this.session.startTime,
                companies: this.session.totalCompanies
            },
            errors: this.analyzeErrors(),
            performance: this.analyzePerformance(),
            costs: this.analyzeCosts(),
            dataQuality: this.analyzeDataQuality(),
            recommendations: this.generateRecommendations(),
            timestamp: new Date().toISOString()
        };
        
        // Write report to file
        fs.writeFileSync('debug-report.json', JSON.stringify(report, null, 2));
        
        // Print summary
        this.printDebugSummary(report);
        
        return report;
    }

    /**
     * 📋 PRINT DEBUG SUMMARY
     */
    printDebugSummary(report) {
        console.log('\n' + '='.repeat(80));
        console.log('🔍 DEBUG REPORT SUMMARY');
        console.log('='.repeat(80));
        
        console.log(`\n📊 SESSION INFO:`);
        console.log(`   Pipeline: ${report.session.pipeline}`);
        console.log(`   Companies: ${report.session.companies}`);
        console.log(`   Duration: ${this.formatTime(report.session.duration)}`);
        
        console.log(`\n🚨 ERRORS:`);
        console.log(`   Total: ${report.errors.totalErrors}`);
        console.log(`   Rate: ${report.errors.errorRate.toFixed(1)}%`);
        
        console.log(`\n📈 PERFORMANCE:`);
        console.log(`   Avg Time: ${this.formatTime(report.performance.averageProcessingTime)}`);
        console.log(`   Throughput: ${report.performance.throughput.toFixed(1)} companies/hour`);
        console.log(`   Projected for 1300: ${this.formatTime(report.performance.projectedTimeFor1300)}`);
        
        console.log(`\n💰 COSTS:`);
        console.log(`   Total: $${report.costs.totalCost.toFixed(4)}`);
        console.log(`   Avg per company: $${report.costs.averageCostPerCompany.toFixed(4)}`);
        console.log(`   Projected for 1300: $${report.costs.projectedCostFor1300.toFixed(2)}`);
        
        if (report.recommendations.length > 0) {
            console.log(`\n💡 RECOMMENDATIONS:`);
            report.recommendations.forEach(rec => console.log(`   • ${rec}`));
        }
        
        console.log(`\n📁 DEBUG FILES GENERATED:`);
        console.log(`   • debug-report.json (comprehensive analysis)`);
        console.log(`   • pipeline-debug.log (detailed logs)`);
        console.log(`   • pipeline-errors.log (error tracking)`);
        console.log(`   • pipeline-performance.log (performance data)`);
    }

    /**
     * 🛠️ UTILITY FUNCTIONS
     */
    generateSessionId() {
        return `debug_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    estimateDuration(pipelineType, companies) {
        const estimates = { core: 2000, advanced: 6000, powerhouse: 4000 };
        return this.formatTime((estimates[pipelineType] || 3000) * companies);
    }

    categorizeError(error) {
        const errorStr = (error.message || error).toLowerCase();
        if (errorStr.includes('api') || errorStr.includes('key')) return 'API';
        if (errorStr.includes('network') || errorStr.includes('timeout')) return 'Network';
        if (errorStr.includes('validation') || errorStr.includes('invalid')) return 'Validation';
        if (errorStr.includes('parse') || errorStr.includes('json')) return 'Parsing';
        return 'Unknown';
    }

    analyzeDataQuality() {
        if (this.session.dataQuality.length === 0) return { averageQuality: 0, issues: [] };
        
        const avgQuality = this.session.dataQuality.reduce((sum, dq) => sum + dq.qualityScore, 0) / this.session.dataQuality.length;
        const issues = this.session.dataQuality.filter(dq => dq.qualityScore < 70);
        
        return { averageQuality: avgQuality, issues: issues.length };
    }

    generateRecommendations() {
        const recommendations = [];
        
        const errorAnalysis = this.analyzeErrors();
        const performanceAnalysis = this.analyzePerformance();
        const costAnalysis = this.analyzeCosts();
        
        if (errorAnalysis.errorRate > this.thresholds.errorRate) {
            recommendations.push('High error rate - review input data and API configurations');
        }
        
        if (performanceAnalysis.averageProcessingTime > this.thresholds.slowProcessing) {
            recommendations.push('Slow processing - consider parallel processing or caching');
        }
        
        if (costAnalysis.averageCostPerCompany > this.thresholds.highCost) {
            recommendations.push('High costs - optimize API usage and implement caching');
        }
        
        return recommendations;
    }

    getColorCode(level) {
        const colors = {
            ERROR: '\x1b[31m',   // Red
            WARN: '\x1b[33m',    // Yellow
            INFO: '\x1b[36m',    // Cyan
            DEBUG: '\x1b[37m',   // White
            PERF: '\x1b[35m',    // Magenta
            API: '\x1b[32m',     // Green
            DATA: '\x1b[34m'     // Blue
        };
        return colors[level] || '\x1b[37m';
    }

    getResetCode() {
        return '\x1b[0m';
    }

    formatTime(ms) {
        if (ms < 1000) return `${ms}ms`;
        if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
        if (ms < 3600000) return `${(ms / 60000).toFixed(1)}min`;
        return `${(ms / 3600000).toFixed(1)}hr`;
    }
}

module.exports = DebugLoggingSystem;
