const fs = require('fs');
const path = require('path');

// Read the full dataset
const csvContent = fs.readFileSync('inputs/all-1233-companies.csv', 'utf8');
const lines = csvContent.split('\n').filter(line => line.trim());
const header = lines[0];
const dataLines = lines.slice(1).filter(line => line.includes(','));

console.log(`📊 Processing ${dataLines.length} companies from all-1233-companies.csv`);

// Parse companies
const companies = dataLines.map(line => {
    const [website, top1000, accountOwner] = line.split(',');
    
    // Extract company name from domain
    let domain = website.replace(/^https?:\/\//, '').replace(/^www\./, '');
    let companyName;
    
    // Special handling for known domains
    const domainMappings = {
        'salesforce.com': 'Salesforce',
        'microsoft.com': 'Microsoft',
        'adobe.com': 'Adobe',
        'hubspot.com': 'HubSpot',
        'zoom.us': 'Zoom',
        'zoom.com': 'Zoom',
        'shopify.com': 'Shopify',
        'atlassian.com': 'Atlassian',
        'twilio.com': 'Twilio',
        'datadoghq.com': 'Datadog',
        'snowflake.com': 'Snowflake'
    };
    
    if (domainMappings[domain]) {
        companyName = domainMappings[domain];
    } else {
        // Generate company name from domain
        companyName = domain
            .split('.')[0]
            .replace(/[-_]/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
    
    return {
        companyName,
        domain,
        accountOwner: accountOwner || 'Unknown'
    };
});

console.log(`✅ Parsed ${companies.length} companies`);

// Create Core dataset (all companies)
const coreDataset = {
    pipeline: 'core',
    companies: companies
};

// Create Advanced dataset (first 100 companies)
const advancedDataset = {
    pipeline: 'advanced',
    companies: companies.slice(0, 100)
};

// Create Powerhouse dataset (first 10 companies)
const powerhouseDataset = {
    pipeline: 'powerhouse',
    companies: companies.slice(0, 10)
};

// Write datasets
fs.writeFileSync('production-core-1233-companies.json', JSON.stringify(coreDataset, null, 2));
fs.writeFileSync('production-advanced-100-companies.json', JSON.stringify(advancedDataset, null, 2));
fs.writeFileSync('production-powerhouse-10-companies.json', JSON.stringify(powerhouseDataset, null, 2));

console.log('📁 Created production datasets:');
console.log(`   ✅ Core: ${coreDataset.companies.length} companies`);
console.log(`   ✅ Advanced: ${advancedDataset.companies.length} companies`);
console.log(`   ✅ Powerhouse: ${powerhouseDataset.companies.length} companies`);

console.log('\n🎯 Sample companies from Powerhouse dataset:');
powerhouseDataset.companies.forEach((company, i) => {
    console.log(`   ${i+1}. ${company.companyName} (${company.domain}) - ${company.accountOwner}`);
});
