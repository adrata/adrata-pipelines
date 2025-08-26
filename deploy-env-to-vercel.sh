#!/bin/bash

# Deploy Environment Variables to Vercel
echo "🚀 Deploying API keys to Vercel..."

# Core APIs for Pipeline
vercel env add PERPLEXITY_API_KEY "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" production
vercel env add CORESIGNAL_API_KEY "hzwQmb13cF21if4arzLpx0SRWyoOUyzP" production
vercel env add OPENAI_API_KEY "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" production

# Contact Enrichment APIs
vercel env add ZEROBOUNCE_API_KEY "92c3ef20f1c345d0923cb50e69d36476" production
vercel env add PROSPEO_API_KEY "6a1b513fda9e48728fcc134e4365e8eb" production
vercel env add LUSHA_API_KEY "95f6ebea-312b-44d5-b24e-5b73dc4ab1ac" production
vercel env add MYEMAILVERIFIER_API_KEY "XG4WBFCJMSONM71D" production
vercel env add DROPCONTACT_API_KEY "HKxcV8LCjgeln7VQ3UoDb2hCU2zrIo" production

# Phone Validation APIs
vercel env add TWILIO_ACCOUNT_SID "AC74a388ecb41ee7ef98fec4511cf0f09a" production
vercel env add TWILIO_AUTH_TOKEN "91d33861ee83c8c584d9cff626cca4c6" production

echo "✅ All API keys deployed to Vercel!"
echo "🔄 Triggering deployment..."

# Trigger deployment
vercel --prod

echo "🎉 Deployment complete!"
