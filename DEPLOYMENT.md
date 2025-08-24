# 🚀 Deployment Instructions

## Quick Deploy to Production

1. **Upload to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial pipeline system deployment"
   git remote add origin https://github.com/your-org/adrata-pipeline-system.git
   git push -u origin main
   ```

2. **Deploy to Server**
   ```bash
   # On your production server
   git clone https://github.com/your-org/adrata-pipeline-system.git
   cd adrata-pipeline-system
   npm install
   cp env.example .env
   # Edit .env with your API keys
   npm run validate
   npm start
   ```

3. **Test Deployment**
   ```bash
   curl http://localhost:3000/health
   curl -X POST http://localhost:3000/api/pipeline/core \
     -H "Content-Type: application/json" \
     -d '{"companies":[{"website":"salesforce.com"}]}'
   ```

## Environment Variables Required

- PERPLEXITY_API_KEY
- CORESIGNAL_API_KEY  
- LUSHA_API_KEY
- ZEROBOUNCE_API_KEY
- PROSPEO_API_KEY
- MYEMAILVERIFIER_API_KEY

## Performance Expectations

- Core: <2s per company, 92% accuracy
- Advanced: <6s per company, 95% accuracy  
- Powerhouse: <4s per company, 98% accuracy
