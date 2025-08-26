#!/bin/bash

# Set Vercel Environment Variables for Adrata Pipeline
# Run this script to set all required API keys in Vercel

echo "🔧 Setting Vercel Environment Variables for Adrata Pipeline"
echo "=========================================================="

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo "📝 Setting environment variables..."

# Core API Keys (you'll need to replace with your actual values)
echo "Setting PERPLEXITY_API_KEY..."
vercel env add PERPLEXITY_API_KEY production

echo "Setting OPENAI_API_KEY..."
vercel env add OPENAI_API_KEY production

echo "Setting CORESIGNAL_API_KEY..."
vercel env add CORESIGNAL_API_KEY production

echo "Setting LUSHA_API_KEY..."
vercel env add LUSHA_API_KEY production

echo "Setting ZEROBOUNCE_API_KEY..."
vercel env add ZEROBOUNCE_API_KEY production

echo "Setting PROSPEO_API_KEY..."
vercel env add PROSPEO_API_KEY production

echo "Setting MYEMAILVERIFIER_API_KEY..."
vercel env add MYEMAILVERIFIER_API_KEY production

echo ""
echo "✅ Environment variables set! You can verify them with:"
echo "   vercel env ls"
echo ""
echo "🚀 After setting variables, redeploy with:"
echo "   vercel --prod"

