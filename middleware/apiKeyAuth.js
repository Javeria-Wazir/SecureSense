// Week 4 Task 2 (Step 3): API Key Authentication
const apiKeyAuth = (req, res, next) => {
  // Check header or query parameter for API Key
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  
  // Retrieve valid API keys from environment variables
  const validApiKeys = process.env.VALID_API_KEYS?.split(',') || [];
  
  if (!apiKey || !validApiKeys.includes(apiKey)) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or missing API key',
    });
  }
  
  // Attach API key info to request if needed by later routes
  req.apiKey = apiKey;
  next();
};

module.exports = apiKeyAuth;
