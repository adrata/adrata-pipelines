/**
 * 🛡️ EXECUTIVE VALIDATION MODULE
 * 
 * Prevents cross-contamination by validating executives actually work at target companies
 * 
 * Key Features:
 * 1. Email domain validation (must match company domain)
 * 2. Company employment verification
 * 3. Cross-reference with official sources
 * 4. Executive-company relationship validation
 */

const fetch = require('node-fetch');

class ExecutiveValidation {
    constructor(config = {}) {
        this.config = {
            PERPLEXITY_API_KEY: config.PERPLEXITY_API_KEY || process.env.PERPLEXITY_API_KEY,
            STRICT_DOMAIN_VALIDATION: true,
            CONFIDENCE_THRESHOLD: 80,
            ...config
        };
    }

    /**
     * 🛡️ VALIDATE EXECUTIVE BELONGS TO COMPANY
     * 
     * Ensures the executive actually works at the target company
     * CRITICAL: Prevents acquisition logic from mixing executives between companies
     */
    async validateExecutiveEmployment(executive, companyName, companyDomain) {
        console.log(`🛡️ Validating ${executive.name} employment at ${companyName}...`);
        
        const validation = {
            isValid: false,
            confidence: 0,
            issues: [],
            correctedData: null
        };

        // VALIDATION 1: Email Domain Check (CRITICAL FOR ACQUISITION LOGIC)
        if (executive.email) {
            const emailDomain = this.extractDomain(executive.email);
            const targetDomain = this.extractDomain(companyDomain);
            
            // Check for generic emails (REJECT IMMEDIATELY)
            const genericEmails = ['pr@', 'info@', 'contact@', 'support@', 'hello@', 'admin@'];
            const isGenericEmail = genericEmails.some(generic => executive.email.toLowerCase().startsWith(generic));
            
            if (isGenericEmail) {
                validation.issues.push(`REJECTED: Generic email ${executive.email}`);
                validation.confidence = 0; // ZERO confidence for generic emails
                validation.isValid = false;
                console.log(`   ❌ REJECTED: Generic email ${executive.email}`);
                return { ...executive, ...validation, email: 'Not available' };
            }
            
            if (emailDomain !== targetDomain) {
                validation.issues.push(`CRITICAL: Email domain mismatch - ${emailDomain} vs ${targetDomain}`);
                validation.confidence = 0; // ZERO tolerance for domain mismatch
                validation.isValid = false;
                
                console.log(`   🚨 CRITICAL: Email domain mismatch: ${executive.email} (${emailDomain}) vs ${companyName} (${targetDomain})`);
                console.log(`   🚨 This indicates executive works at different company!`);
                
                // Check if this is a known cross-contamination pattern
                if (this.isKnownCrossContamination(executive.name, emailDomain, companyName)) {
                    validation.issues.push(`KNOWN CROSS-CONTAMINATION: ${executive.name} from ${emailDomain} incorrectly assigned to ${companyName}`);
                    validation.confidence = 0;
                }
                
                // Return immediately with cleared email for domain mismatch
                return { ...executive, ...validation, email: 'Not available' };
            } else {
                validation.confidence += 25;
                console.log(`   ✅ Email domain matches: ${emailDomain}`);
            }
        }

        // VALIDATION 2: AI-Powered Employment Verification
        if (this.config.PERPLEXITY_API_KEY) {
            const employmentCheck = await this.verifyEmploymentWithAI(executive, companyName, companyDomain);
            
            if (employmentCheck.isCurrentEmployee) {
                validation.confidence += 30;
                console.log(`   ✅ AI confirms current employment at ${companyName}`);
            } else {
                validation.issues.push(`AI verification failed: ${employmentCheck.reason}`);
                validation.confidence -= 25;
                console.log(`   ❌ AI employment verification failed: ${employmentCheck.reason}`);
            }
            
            // If AI found corrected information
            if (employmentCheck.correctedInfo) {
                validation.correctedData = employmentCheck.correctedInfo;
            }
        }

        // VALIDATION 3: Name-Company Consistency Check
        const nameConsistency = this.checkNameCompanyConsistency(executive.name, companyName);
        if (!nameConsistency.isConsistent) {
            validation.issues.push(`Name-company inconsistency: ${nameConsistency.reason}`);
            validation.confidence -= 15;
        }

        // Final validation decision
        validation.isValid = validation.confidence >= this.config.CONFIDENCE_THRESHOLD;
        validation.confidence = Math.max(0, Math.min(100, validation.confidence));

        console.log(`   🎯 Validation result: ${validation.isValid ? 'VALID' : 'INVALID'} (${validation.confidence}% confidence)`);
        
        return validation;
    }

    /**
     * 🤖 AI-POWERED EMPLOYMENT VERIFICATION
     */
    async verifyEmploymentWithAI(executive, companyName, companyDomain) {
        try {
            const prompt = `Verify if ${executive.name} currently works at ${companyName} (${companyDomain}) as ${executive.title}.

Please check:
1. Is ${executive.name} currently employed at ${companyName}?
2. Is their title "${executive.title}" accurate?
3. Is their email domain correct for ${companyName}?
4. Are there any recent employment changes?

Current data to verify:
- Name: ${executive.name}
- Title: ${executive.title}
- Email: ${executive.email || 'Not provided'}
- Company: ${companyName}
- Domain: ${companyDomain}

Provide ONLY a JSON response:
{
    "isCurrentEmployee": true/false,
    "titleAccurate": true/false,
    "emailDomainCorrect": true/false,
    "reason": "explanation of verification result",
    "correctedInfo": {
        "name": "corrected name if different",
        "title": "corrected title if different",
        "email": "corrected email if different",
        "company": "actual current company if different"
    },
    "confidence": 0.95,
    "lastVerified": "2025-01-17"
}

Only return information you can verify from official sources.`;

            const response = await fetch('https://api.perplexity.ai/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.PERPLEXITY_API_KEY?.trim()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'sonar-pro',
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.1,
                    max_tokens: 800
                })
            });

            if (response.ok) {
                const data = await response.json();
                const content = data.choices[0].message.content;
                
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    return JSON.parse(jsonMatch[0]);
                }
            }
        } catch (error) {
            console.log(`   ⚠️ AI employment verification error: ${error.message}`);
        }
        
        return {
            isCurrentEmployee: false,
            reason: 'AI verification failed',
            confidence: 0
        };
    }

    /**
     * 🔍 EXTRACT DOMAIN FROM EMAIL OR URL
     */
    extractDomain(emailOrUrl) {
        if (!emailOrUrl) return '';
        
        // Handle email addresses
        if (emailOrUrl.includes('@')) {
            return emailOrUrl.split('@')[1].toLowerCase();
        }
        
        // Handle URLs
        try {
            const url = emailOrUrl.startsWith('http') ? emailOrUrl : `https://${emailOrUrl}`;
            const domain = new URL(url).hostname.toLowerCase();
            return domain.replace(/^www\./, '');
        } catch (error) {
            return emailOrUrl.toLowerCase().replace(/^www\./, '');
        }
    }

    /**
     * 🔍 CHECK NAME-COMPANY CONSISTENCY
     */
    checkNameCompanyConsistency(executiveName, companyName) {
        // Basic consistency checks
        if (!executiveName || !companyName) {
            return { isConsistent: false, reason: 'Missing name or company' };
        }

        // Check for obvious mismatches (e.g., Disney executive at Salesforce)
        const suspiciousPatterns = [
            { pattern: /disney/i, company: /salesforce/i },
            { pattern: /hitachi/i, company: /adobe/i },
            { pattern: /microsoft/i, company: /salesforce/i },
            { pattern: /google/i, company: /microsoft/i }
        ];

        for (const check of suspiciousPatterns) {
            if (executiveName.match(check.pattern) && companyName.match(check.company)) {
                return { 
                    isConsistent: false, 
                    reason: `Suspicious pattern: ${executiveName} at ${companyName}` 
                };
            }
        }

        return { isConsistent: true, reason: 'No obvious inconsistencies' };
    }

    /**
     * 🚨 CHECK FOR KNOWN CROSS-CONTAMINATION PATTERNS
     * ENHANCED: More comprehensive pattern detection
     */
    isKnownCrossContamination(executiveName, emailDomain, targetCompany) {
        const knownIssues = [
            { name: /amy chang/i, wrongDomain: /disney/i, wrongCompany: /salesforce/i },
            { name: /louise pentland/i, wrongDomain: /hitachi/i, wrongCompany: /adobe/i },
            { name: /miguel milano/i, wrongDomain: /salesforce/i, wrongCompany: /microsoft/i },
            // Enhanced patterns for better detection
            { name: /pentland/i, wrongDomain: /hitachi/i, wrongCompany: /adobe/i },
            { name: /chang/i, wrongDomain: /disney/i, wrongCompany: /salesforce/i }
        ];

        // Check for exact matches
        const exactMatch = knownIssues.some(issue => 
            executiveName.match(issue.name) && 
            emailDomain.match(issue.wrongDomain) && 
            targetCompany.match(issue.wrongCompany)
        );

        if (exactMatch) {
            console.log(`   🚨 CRITICAL: Known cross-contamination detected - ${executiveName} with ${emailDomain} domain at ${targetCompany}`);
            return true;
        }

        // Check for any email domain that doesn't match target company
        const targetDomain = this.extractDomain(targetCompany);
        if (targetDomain && emailDomain && emailDomain !== targetDomain) {
            console.log(`   ⚠️ Domain mismatch detected - ${emailDomain} vs expected ${targetDomain}`);
            return true;
        }

        return false;
    }

    /**
     * 🛡️ VALIDATE AND CORRECT EXECUTIVE DATA
     */
    async validateAndCorrectExecutive(executive, companyName, companyDomain) {
        if (!executive || !executive.name) {
            return null;
        }

        // CRITICAL: Check for redacted emails first and fix them
        if (executive.email && this.isEmailRedacted(executive.email)) {
            console.log(`   🚨 REDACTED EMAIL DETECTED: ${executive.email}`);
            executive.email = this.generateProbableEmail(executive.name, companyDomain);
            console.log(`   🔧 GENERATED CLEAN EMAIL: ${executive.email}`);
        }

        const validation = await this.validateExecutiveEmployment(executive, companyName, companyDomain);
        
        if (validation.isValid) {
            // Executive is valid, return as-is with validation metadata
            return {
                ...executive,
                validated: true,
                validationConfidence: validation.confidence,
                validationNotes: ['Executive employment verified']
            };
        } else {
            // Executive is invalid, try to correct or reject
            if (validation.correctedData) {
                console.log(`   🔧 Using corrected data for ${executive.name}`);
                return {
                    ...executive,
                    ...validation.correctedData,
                    validated: true,
                    validationConfidence: validation.confidence,
                    validationNotes: [`Corrected data: ${validation.issues.join(', ')}`]
                };
            } else {
                console.log(`   ❌ Rejecting invalid executive: ${executive.name}`);
                return {
                    name: 'Not available',
                    title: 'Not available',
                    email: 'Not available',
                    phone: 'Not available',
                    linkedIn: 'Not available',
                    validated: false,
                    validationConfidence: validation.confidence,
                    validationNotes: validation.issues
                };
            }
        }
    }

    /**
     * 🚨 DETECT REDACTED EMAILS
     */
    isEmailRedacted(email) {
        if (!email) return false;
        
        const redactionPatterns = [
            /\*+/,           // Asterisks: d****d@adobe.com
            /x+/i,           // X's: dxxxxd@adobe.com  
            /\.{3,}/,        // Dots: d...d@adobe.com
            /-+/,            // Dashes: d----d@adobe.com
            /_+/,            // Underscores: d____d@adobe.com
        ];
        
        return redactionPatterns.some(pattern => pattern.test(email));
    }

    /**
     * 📧 GENERATE PROBABLE EMAIL
     */
    generateProbableEmail(executiveName, companyDomain) {
        if (!executiveName || !companyDomain) return 'Not available';
        
        const nameParts = executiveName.split(' ');
        const firstName = nameParts[0]?.toLowerCase().replace(/[^a-z]/g, '') || '';
        const lastName = nameParts[nameParts.length - 1]?.toLowerCase().replace(/[^a-z]/g, '') || '';
        const domain = this.extractDomain(companyDomain);
        
        if (!firstName || !lastName || !domain) return 'Not available';
        
        return `${firstName}.${lastName}@${domain}`;
    }

    /**
     * 🔍 FIND CORRECT EXECUTIVE FOR COMPANY
     */
    async findCorrectExecutive(role, companyName, companyDomain) {
        if (!this.config.PERPLEXITY_API_KEY) {
            return null;
        }

        try {
            const prompt = `Find the current ${role} (${role === 'CFO' ? 'Chief Financial Officer' : 'Chief Revenue Officer'}) at ${companyName} (${companyDomain}).

Requirements:
1. Must currently work at ${companyName}
2. Must have email @${this.extractDomain(companyDomain)}
3. Must be verified from official sources

Please provide ONLY a JSON response:
{
    "name": "Full Name",
    "title": "Exact Title",
    "email": "executive@${this.extractDomain(companyDomain)}",
    "phone": "phone number if available",
    "linkedIn": "LinkedIn URL if available",
    "source": "company_website/press_release/SEC_filing",
    "confidence": 0.95,
    "appointmentDate": "2025-01-01 or null",
    "verified": true
}

Only return executives you can verify currently work at ${companyName} with the correct email domain.`;

            const response = await fetch('https://api.perplexity.ai/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.PERPLEXITY_API_KEY?.trim()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'sonar-pro',
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.1,
                    max_tokens: 600
                })
            });

            if (response.ok) {
                const data = await response.json();
                const content = data.choices[0].message.content;
                
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const executiveData = JSON.parse(jsonMatch[0]);
                    
                    // Validate the returned data
                    if (executiveData.email && this.extractDomain(executiveData.email) === this.extractDomain(companyDomain)) {
                        return {
                            ...executiveData,
                            validated: true,
                            validationConfidence: executiveData.confidence * 100,
                            validationNotes: ['AI-verified current employee with correct domain']
                        };
                    }
                }
            }
        } catch (error) {
            console.log(`   ⚠️ Correct executive search error: ${error.message}`);
        }
        
        return null;
    }
}

module.exports = { ExecutiveValidation };
