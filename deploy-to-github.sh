#!/bin/bash

# 🚀 DEPLOY ADRATA PIPELINE TO GITHUB
# 
# This script initializes a Git repository and pushes to GitHub
# for production deployment

set -e

echo "🚀 DEPLOYING ADRATA PIPELINE SYSTEM TO GITHUB"
echo "=============================================="

# Check if we're already in a git repository
if [ -d ".git" ]; then
    echo "📂 Git repository already exists"
else
    echo "📂 Initializing Git repository..."
    git init
    
    # Create .gitignore
    cat > .gitignore << EOF
# Environment variables
.env
.env.local
.env.production

# Logs
logs/
*.log

# Output files
outputs/
results/

# Node modules
node_modules/

# OS files
.DS_Store
Thumbs.db

# IDE files
.vscode/
.idea/

# Temporary files
tmp/
temp/

# Cache
.cache/
EOF
fi

# Add all files
echo "📦 Adding files to Git..."
git add .

# Commit
echo "💾 Creating commit..."
git commit -m "Production deployment: Adrata Pipeline System with advanced logging and resume capability

Features:
- Three-tier pipeline system (Core, Advanced, Powerhouse)
- Advanced logging with API usage tracking
- Incremental CSV saving every 10 records
- Resume capability from last processed record
- Account owner distribution for Advanced/Powerhouse
- Real-time progress reporting and ETA
- Cost monitoring and error recovery
- Production-ready with retry logic

Ready for SBI Growth evaluation."

# Check if remote exists
if git remote get-url origin > /dev/null 2>&1; then
    echo "🔗 Remote 'origin' already configured"
else
    echo "🔗 Please add your GitHub repository URL:"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/adrata-pipeline-system.git"
    echo ""
    echo "Or run this script with the repository URL as an argument:"
    echo "   ./deploy-to-github.sh https://github.com/YOUR_USERNAME/adrata-pipeline-system.git"
    
    if [ ! -z "$1" ]; then
        echo "🔗 Adding remote: $1"
        git remote add origin "$1"
    else
        echo "⚠️  No repository URL provided. Please add remote manually and push."
        exit 0
    fi
fi

# Push to GitHub
echo "🚀 Pushing to GitHub..."
git branch -M main
git push -u origin main

echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo "======================"
echo "Your Adrata Pipeline System has been deployed to GitHub."
echo ""
echo "🎯 Next Steps:"
echo "1. Deploy to Vercel: vercel --prod"
echo "2. Set environment variables in Vercel dashboard"
echo "3. Test with: npm run validate"
echo "4. Run pipelines: npm run core / npm run advanced / npm run powerhouse"
echo ""
echo "📊 Production Commands:"
echo "- npm run core      # Process 1300 companies with Core pipeline"
echo "- npm run advanced  # Process 100 companies with Advanced pipeline"  
echo "- npm run powerhouse # Process 10 companies with Powerhouse pipeline"
echo "- npm run logs      # View log files"
echo "- npm run outputs   # View output files"
echo "- npm run clean     # Clean logs and outputs"
echo ""
echo "🔄 Resume Commands (if interrupted):"
echo "- npm run resume-core"
echo "- npm run resume-advanced"
echo "- npm run resume-powerhouse"
