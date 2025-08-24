# REQUIRED API KEYS FOR 100% REAL DATA

## CRITICAL: Configure these API keys in Vercel Environment Variables

### 🔑 **EXECUTIVE RESEARCH APIs**
```
PERPLEXITY_API_KEY=your_perplexity_key_here
OPENAI_API_KEY=your_openai_key_here
CORESIGNAL_API_KEY=your_coresignal_key_here
```

### 📧 **EMAIL DISCOVERY & VALIDATION APIs**
```
ZEROBOUNCE_API_KEY=your_zerobounce_key_here
PROSPEO_API_KEY=your_prospeo_key_here
DROPCONTACT_API_KEY=your_dropcontact_key_here
MYEMAILVERIFIER_API_KEY=your_myemailverifier_key_here
```

### 👤 **CONTACT ENRICHMENT APIs**
```
LUSHA_API_KEY=your_lusha_key_here
```

### 📞 **PHONE VALIDATION APIs (Optional)**
```
TWILIO_ACCOUNT_SID=your_twilio_sid_here
TWILIO_AUTH_TOKEN=your_twilio_token_here
```

## 🚀 **VERCEL DEPLOYMENT STEPS**

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add each API key as a new environment variable
3. Redeploy the project

## 🧪 **TESTING AFTER API KEY SETUP**

Test with 3 companies to verify all APIs work:
```bash
curl -X POST "https://your-vercel-url/api/complete-csv" \
  -H "Content-Type: application/json" \
  -d '{"pipeline":"core","companies":[{"companyName":"Salesforce","domain":"salesforce.com"},{"companyName":"Microsoft","domain":"microsoft.com"},{"companyName":"Adobe","domain":"adobe.com"}]}'
```

Expected result: Real emails, phones, and LinkedIn profiles populated.

## 📊 **CURRENT STATUS**

✅ **Working APIs:**
- PERPLEXITY_API_KEY (executive research)
- CORESIGNAL_API_KEY (company intelligence)

⚠️ **Missing APIs (causing null emails/phones):**
- ZEROBOUNCE_API_KEY
- PROSPEO_API_KEY  
- LUSHA_API_KEY
- DROPCONTACT_API_KEY

## 🎯 **PRIORITY ORDER**

1. **ZEROBOUNCE_API_KEY** - Primary email validation
2. **PROSPEO_API_KEY** - Email discovery
3. **LUSHA_API_KEY** - Professional contact data
4. **DROPCONTACT_API_KEY** - Additional email discovery

Configure these 4 keys and you'll get 100% real contact data!
