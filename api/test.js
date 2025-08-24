// Simple test endpoint to verify deployment
module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.json({
    status: 'success',
    message: 'Adrata Pipeline System is deployed and working!',
    timestamp: new Date().toISOString(),
    environment: 'production',
    version: '1.0.0',
    endpoints: [
      '/api/core - Core Pipeline (Bronze)',
      '/api/advanced - Advanced Pipeline (Silver)', 
      '/api/powerhouse - Powerhouse Pipeline (Gold)',
      '/api/ultra-fast-core - Ultra-Fast Core Pipeline'
    ]
  });
};
