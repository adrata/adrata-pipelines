/**
 * Contact Validator Module
 * Validates and cleans contact information
 */

export class ContactValidator {
  constructor(config = {}) {
    this.config = {
      validateEmails: true,
      validatePhones: true,
      timeout: 5000,
      ...config
    };
  }

  /**
   * Validate contact information
   */
  async validateContact(contactData) {
    try {
      const startTime = Date.now();
      
      const validatedContact = {
        ...contactData,
        isValid: true,
        validationResults: {
          email: { isValid: true, reason: 'Valid format' },
          phone: { isValid: true, reason: 'Valid format' },
          name: { isValid: true, reason: 'Valid format' }
        }
      };

      // Validate email
      if (this.config.validateEmails && contactData.email) {
        validatedContact.validationResults.email = this.validateEmail(contactData.email);
      }

      // Validate phone
      if (this.config.validatePhones && contactData.phone) {
        validatedContact.validationResults.phone = this.validatePhone(contactData.phone);
      }

      // Validate name
      if (contactData.name) {
        validatedContact.validationResults.name = this.validateName(contactData.name);
      }

      // Overall validation status
      validatedContact.isValid = Object.values(validatedContact.validationResults)
        .every(result => result.isValid);

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        contact: validatedContact,
        confidence: validatedContact.isValid ? 95 : 60,
        processingTime
      };

    } catch (error) {
      console.error('❌ Contact validation error:', error);
      return {
        success: false,
        contact: contactData,
        confidence: 0,
        error: error.message,
        processingTime: 0
      };
    }
  }

  /**
   * Validate email format
   */
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    
    return {
      isValid,
      reason: isValid ? 'Valid email format' : 'Invalid email format',
      confidence: isValid ? 95 : 10
    };
  }

  /**
   * Validate phone format
   */
  validatePhone(phone) {
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    const isValid = cleanPhone.length >= 10 && cleanPhone.length <= 15;
    
    return {
      isValid,
      reason: isValid ? 'Valid phone format' : 'Invalid phone format',
      confidence: isValid ? 90 : 20
    };
  }

  /**
   * Validate name format
   */
  validateName(name) {
    const isValid = name && name.trim().length >= 2 && /^[a-zA-Z\s\-'\.]+$/.test(name);
    
    return {
      isValid,
      reason: isValid ? 'Valid name format' : 'Invalid name format',
      confidence: isValid ? 85 : 30
    };
  }

  /**
   * Batch validate multiple contacts
   */
  async validateContacts(contacts) {
    const results = await Promise.all(
      contacts.map(contact => this.validateContact(contact))
    );

    const validContacts = results.filter(result => result.success && result.contact.isValid);
    const invalidContacts = results.filter(result => !result.success || !result.contact.isValid);

    return {
      success: true,
      totalProcessed: contacts.length,
      validContacts: validContacts.length,
      invalidContacts: invalidContacts.length,
      results,
      summary: {
        validationRate: (validContacts.length / contacts.length) * 100,
        averageConfidence: results.reduce((sum, r) => sum + r.confidence, 0) / results.length
      }
    };
  }
}

export default ContactValidator;
