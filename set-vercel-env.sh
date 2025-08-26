#!/bin/bash

echo "🔑 SETTING ALL API KEYS IN VERCEL..."

# Function to add environment variable
add_env_var() {
    local key=$1
    local value=$2
    echo "Setting $key..."
    echo "$value" | vercel env add "$key" production
}

# Core APIs for Pipeline
add_env_var "PERPLEXITY_API_KEY" "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"
add_env_var "CORESIGNAL_API_KEY" "hzwQmb13cF21if4arzLpx0SRWyoOUyzP"
add_env_var "OPENAI_API_KEY" "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"

# Contact Enrichment APIs
add_env_var "ZEROBOUNCE_API_KEY" "92c3ef20f1c345d0923cb50e69d36476"
add_env_var "PROSPEO_API_KEY" "6a1b513fda9e48728fcc134e4365e8eb"
add_env_var "LUSHA_API_KEY" "95f6ebea-312b-44d5-b24e-5b73dc4ab1ac"
add_env_var "MYEMAILVERIFIER_API_KEY" "XG4WBFCJMSONM71D"
add_env_var "DROPCONTACT_API_KEY" "HKxcV8LCjgeln7VQ3UoDb2hCU2zrIo"

# Phone Validation APIs
add_env_var "TWILIO_ACCOUNT_SID" "AC74a388ecb41ee7ef98fec4511cf0f09a"
add_env_var "TWILIO_AUTH_TOKEN" "91d33861ee83c8c584d9cff626cca4c6"

echo "✅ All API keys set in Vercel!"
echo "🔄 Triggering new deployment..."

# Trigger deployment to pick up new environment variables
vercel --prod

echo "🎉 Deployment with API keys complete!"
