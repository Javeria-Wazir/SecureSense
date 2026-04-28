const helmet = require('helmet');

// Week 4 Task 3 (Part 3): Security Headers & CSP Implementation
const securityHeaders = helmet({
  // Week 5 Fix: Hide X-Powered-By header to prevent server information leakage
  hidePoweredBy: true,
  
  // Enable Content Security Policy (CSP) to prevent script injections
  contentSecurityPolicy: {
    directives: {
      // Prevent <base> tags from changing base URL
      baseUri: ["'none'"],
      // Prevent inline event handlers
      scriptSrcAttr: ["'none'"],
      // Default policy: only allow resources from same origin
      defaultSrc: ["'self'"],
      
      // Scripts: only from same origin (removed unsafe-inline for stricter CSP)
      // Allows external scripts from CDN (Bootstrap, jQuery, etc.)
      scriptSrc: ["'self'", "https://cdn.jsdelivr.net", "https://code.jquery.com"],
      
      // Stylesheets: only from same origin or inline, plus google fonts
      styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com', "https://cdn.jsdelivr.net"],
      
      // Fonts
      fontSrc: ["'self'", 'fonts.gstatic.com'],
      
      // Images: from same origin and data URIs
      imgSrc: ["'self'", 'data:', 'https:'],
      
      // External connections (API calls)
      connectSrc: ["'self'", 'https://api.yourdomain.com'],
      
      // Disable embedded objects (Flash, etc.)
      objectSrc: ["'none'"],
      
      // Allow framing from google for maps
      frameSrc: ["'self'", "https://www.google.com"],
      
      // Form submissions
      formAction: ["'self'"],
      
      // Prevent other sites from framing this application
      frameAncestors: ["'none'"],
      
      // Upgrade insecure requests automatically
      upgradeInsecureRequests: [],
    },
  },
  
  // HSTS: Strict-Transport-Security (Enforces HTTPS)
  hsts: {
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true,
    preload: true,
  },
  
  // X-Frame-Options: Prevent clickjacking
  frameguard: { action: 'deny' },
  
  // X-Content-Type-Options: Prevent MIME type sniffing
  noSniff: true,
  
  // X-XSS-Protection (Legacy filter fallback)
  xssFilter: true,
  
  // Referrer-Policy
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
});

module.exports = securityHeaders;
