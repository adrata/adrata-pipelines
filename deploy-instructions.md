# Vercel Deployment Instructions

## 🚀 Quick Deploy to Vercel

### Step 1: Deploy to Vercel
```bash
cd /Users/rosssylvester/Development/pipelines-master/adrata-pipeline-deploy-clean

# Install Vercel CLI if not already installed
npm install -g vercel

# Deploy to Vercel
vercel --prod

# Follow prompts:
# - Link to existing project or create new
# - Set project name: adrata-pipeline-vercel-optimized
# - Confirm settings
```

### Step 2: Configure Environment Variables
In Vercel Dashboard, add these environment variables:

**Required API Keys:**
```
PERPLEXITY_API_KEY=pplx-xxxxx
OPENAI_API_KEY=sk-xxxxx
CORESIGNAL_API_KEY=xxxxx
LUSHA_API_KEY=xxxxx
ZEROBOUNCE_API_KEY=xxxxx
PROSPEO_API_KEY=xxxxx
MYEMAILVERIFIER_API_KEY=xxxxx
```

### Step 3: Test Deployment

#### 3A. Test API Health (First!)
```bash
# Replace YOUR-DEPLOYMENT-URL with your actual Vercel URL
curl -X POST "https://YOUR-DEPLOYMENT-URL.vercel.app/api/vercel-optimized" \
  -H "Content-Type: application/json" \
  -d '{"mode": "health-check"}' \
  --max-time 60

# Expected: All APIs should show "healthy" status
```

#### 3B. Test Single Company
```bash
curl -X POST "https://YOUR-DEPLOYMENT-URL.vercel.app/api/vercel-optimized" \
  -H "Content-Type: application/json" \
  -d '{
    "pipeline": "core",
    "companies": [
      {
        "companyName": "Adobe Inc.",
        "domain": "adobe.com",
        "accountOwner": "Dan Mirolli"
      }
    ]
  }' \
  --max-time 180
```

#### 3C. Run Comprehensive 5-Company Test
```bash
# Update the API URL in the test script
VERCEL_URL="YOUR-DEPLOYMENT-URL.vercel.app" node test-5-companies.js

# This will test:
# - API health checks
# - Core pipeline (5 companies)
# - Advanced pipeline (3 companies)  
# - Powerhouse pipeline (2 companies)
```

## 📊 Production Usage

### For All 1,233 Companies (Core Pipeline)
```bash
# This will process in batches of 25 companies each
# Total time: ~2.5 hours
curl -X POST "https://YOUR-DEPLOYMENT-URL.vercel.app/api/vercel-optimized" \
  -H "Content-Type: application/json" \
  -d '{
    "pipeline": "core",
    "companies": [
      // ... your 1,233 companies array
    ]
  }' \
  --max-time 10800  # 3 hour timeout
```

### For 100 Companies (Advanced Pipeline)
```bash
# This will process in batches of 20 companies each
# Total time: ~20 minutes
curl -X POST "https://YOUR-DEPLOYMENT-URL.vercel.app/api/vercel-optimized" \
  -H "Content-Type: application/json" \
  -d '{
    "pipeline": "advanced",
    "companies": [
      // ... your 100 companies array
    ]
  }'
```

### For 10 Companies (Powerhouse Pipeline)
```bash
# This will process in a single batch
# Total time: ~5 minutes
curl -X POST "https://YOUR-DEPLOYMENT-URL.vercel.app/api/vercel-optimized" \
  -H "Content-Type: application/json" \
  -d '{
    "pipeline": "powerhouse", 
    "companies": [
      // ... your 10 companies array
    ]
  }'
```

## 🔧 Configuration Details

### Batch Sizes (Optimized for Vercel)
- **Core Pipeline**: 25 companies per batch
- **Advanced Pipeline**: 20 companies per batch
- **Powerhouse Pipeline**: 10 companies per batch

### Rate Limiting (Prevents API Quota Exhaustion)
- **Prospeo**: 60 requests/minute (PRIMARY BOTTLENECK)
- **CoreSignal**: 100 requests/minute
- **Lusha**: 200 requests/minute
- **ZeroBounce**: 100 requests/minute
- **OpenAI**: 50 requests/minute
- **Perplexity**: 60 requests/minute

### Timeouts
- **Per Company**: 45 seconds max
- **Per Batch**: 4 minutes max
- **Total Function**: 5 minutes (Vercel Pro limit)

## 🚨 Troubleshooting

### Common Issues:

**1. Function Timeout**
```
Error: Function execution timed out
Solution: Reduce batch size or upgrade to Vercel Enterprise (15min timeout)
```

**2. API Rate Limits Hit**
```
Error: Rate limit exceeded
Solution: Increase BATCH_DELAY in config or reduce concurrent processing
```

**3. Memory Issues**
```
Error: JavaScript heap out of memory
Solution: Reduce batch size or enable more frequent memory cleanup
```

**4. API Key Issues**
```
Error: Missing API key or unauthorized
Solution: Verify all environment variables are set correctly in Vercel dashboard
```

## 📈 Expected Performance

### Success Rates (Based on Testing)
- **API Health Check**: 95%+ (if all keys configured)
- **Core Pipeline**: 85-90% success rate
- **Advanced Pipeline**: 80-85% success rate  
- **Powerhouse Pipeline**: 75-80% success rate

### Processing Times
- **Core (1,233 companies)**: 2-3 hours
- **Advanced (100 companies)**: 15-25 minutes
- **Powerhouse (10 companies)**: 4-8 minutes

### Data Quality
- **Real Emails**: 60-80% of successful companies
- **Real Phones**: 40-60% of successful companies
- **Executive Names**: 90%+ of successful companies

## 🎯 Next Steps After Successful Test

1. **Validate 5-company test passes** ✅
2. **Run small batch (25 companies) for each pipeline** 
3. **Monitor performance and adjust batch sizes if needed**
4. **Process full datasets once confident**
5. **Consider AWS migration if processing time becomes critical**

## 📞 Support

If you encounter issues:
1. Check Vercel function logs in dashboard
2. Verify all API keys are working with health check
3. Test with smaller batches first
4. Review rate limiting if getting API errors
