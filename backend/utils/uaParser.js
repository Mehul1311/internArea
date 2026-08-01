const UAParser = require('ua-parser-js');

/**
 * Parses the User-Agent string to extract browser, OS, and device type.
 * @param {Object} req - Express request object
 * @returns {Object} { browser, os, deviceType, ip }
 */
function parseLoginContext(req) {
  const userAgentStr = req.headers['user-agent'] || '';
  const parser = new UAParser(userAgentStr);
  
  const browserResult = parser.getBrowser();
  const osResult = parser.getOS();
  const deviceResult = parser.getDevice();

  const browser = browserResult.name || 'Unknown Browser';
  const os = osResult.name || 'Unknown OS';
  
  // Treat ambiguous/missing device type as desktop
  let deviceType = deviceResult.type || 'desktop';
  if (deviceType !== 'mobile' && deviceType !== 'tablet' && deviceType !== 'desktop') {
      deviceType = 'desktop'; // default non-mobile to desktop
  }
  
  // Note: some laptops might not be identified as 'desktop', but if type is undefined it falls back to 'desktop'
  if (deviceResult.type === 'smarttv' || deviceResult.type === 'console' || deviceResult.type === 'wearable') {
      deviceType = 'other';
  }

  // Get IP
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

  return { browser, os, deviceType, ip };
}

module.exports = { parseLoginContext };
