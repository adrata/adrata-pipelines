# Adrata Pipeline System - Vercel Deployment

🚀 **Production-ready pipeline system for executive intelligence and buyer group analysis**

## Overview

This is a self-contained deployment of the Adrata Pipeline System, optimized for Vercel deployment. It includes three tiers of intelligence gathering:

- **Core Pipeline (Bronze)**: 8 essential modules for fast CFO/CRO discovery
- **Advanced Pipeline (Silver)**: 16 comprehensive modules for enhanced intelligence  
- **Powerhouse Pipeline (Gold)**: 26 modules for complete enterprise intelligence

## API Endpoints

### Core Pipeline
- `GET /api/core` - Pipeline information and capabilities
- `POST /api/core` - Process companies through core pipeline (25x parallel)

### Ultra-Fast Core Pipeline 🚀
- `GET /api/ultra-fast-core` - Ultra-fast pipeline information and capabilities
- `POST /api/ultra-fast-core` - Process companies with maximum speed (50x parallel, 8x APIs per company)

### Advanced Pipeline  
- `GET /api/advanced` - Pipeline information and capabilities
- `POST /api/advanced` - Process companies through advanced pipeline (20x parallel)

### Powerhouse Pipeline
- `GET /api/powerhouse` - Pipeline information and capabilities  
- `POST /api/powerhouse` - Process companies through powerhouse pipeline (15x parallel)

## Usage

### API Request Format
```json
{
  "companies": [
    {
      "Website": "www.example.com",
      "Top 1000": "1", 
      "Account Owner": "Sales Rep Name"
    }
  ]
}
```

### API Response Format
```json
{
  "success": true,
  "results": [
    {
      "website": "www.example.com",
      "companyName": "Example Corp",
      "cfo": {
        "name": "John Smith",
        "email": "john.smith@example.com",
        "confidence": 95
      },
      "cro": {
        "name": "Jane Doe", 
        "email": "jane.doe@example.com",
        "confidence": 92
      }
    }
  ]
}
```

## Deployment Status

✅ **READY FOR VERCEL DEPLOYMENT**

- All modules are self-contained
- TypeScript errors fixed
- API routes optimized
- Error handling implemented
- Real production modules included

## Performance Optimizations

### Standard Pipelines
- **Core**: 25x parallel companies, 5x concurrent APIs per company
- **Advanced**: 20x parallel companies, 6x concurrent APIs per company  
- **Powerhouse**: 15x parallel companies, 8x concurrent APIs per company

### Ultra-Fast Pipeline 🚀
- **50x parallel companies** - Maximum parallelization
- **8x concurrent APIs per company** - Simultaneous data enrichment
- **In-memory caching** - Ultra-fast data access
- **Stream processing** - Memory-efficient large dataset handling
- **Micro-batching** - Optimal memory usage with fast feedback

### Infrastructure
- Edge Functions for global performance
- 3GB memory allocation per function
- Multi-region deployment (US East, US West, Europe)
- Aggressive caching with 30-day TTL
- 5-minute timeout for complex processing
- Production-grade error handling

## Environment Variables Required

```
CORESIGNAL_API_KEY=your_key_here
LUSHA_API_KEY=your_key_here  
PROSPEO_API_KEY=your_key_here
DROPCONTACT_API_KEY=your_key_here
ZEROBOUNCE_API_KEY=your_key_here
MYEMAILVERIFIER_API_KEY=your_key_here
TWILIO_ACCOUNT_SID=your_sid_here
TWILIO_AUTH_TOKEN=your_token_here
```

## Testing

Run local tests:
```bash
npm test
node quick-test.js
node comprehensive-pipeline-test.js
```

## Architecture

```
├── api/                    # Vercel API routes
│   ├── core/              # Core pipeline endpoint
│   ├── advanced/          # Advanced pipeline endpoint  
│   └── powerhouse/        # Powerhouse pipeline endpoint
├── pipelines/             # Pipeline implementations
├── modules/               # Real production modules
├── inputs/                # Test data
└── outputs/               # Results and reports
```

Built with ❤️ by the Adrata team for enterprise sales intelligence.