const db = require('../db');

const MAX_BODY_BYTES = 8000; // truncate huge responses

function truncate(str) {
  if (!str) return null;
  return str.length > MAX_BODY_BYTES
    ? str.slice(0, MAX_BODY_BYTES) + '\n…[truncated]'
    : str;
}

function moduleFromPath(path) {
  if (path.startsWith('/api/publicworks')) return 'publicworks';
  if (path.startsWith('/api/keys'))        return 'keys';
  return 'system';
}

function requestLogger(req, res, next) {
  // Never log the log-reader endpoint — avoids noise + loops
  if (req.path.startsWith('/api/logs')) return next();
  // Skip static files
  if (!req.path.startsWith('/api/')) return next();

  const startTime = Date.now();

  // Intercept res.json to capture response body
  const originalJson = res.json.bind(res);
  let capturedBody = null;

  res.json = function (body) {
    capturedBody = body;
    return originalJson(body);
  };

  res.on('finish', () => {
    try {
      const duration   = Date.now() - startTime;
      const statusCode = res.statusCode;
      const success    = statusCode >= 200 && statusCode < 400 ? 1 : 0;

      const requestBody  = truncate(JSON.stringify(req.body  || {}));
      const requestQuery = truncate(JSON.stringify(req.query || {}));
      const responseBody = truncate(JSON.stringify(capturedBody || {}));
      const ip = req.headers['x-forwarded-for']?.split(',')[0].trim()
              || req.ip
              || req.socket?.remoteAddress
              || 'unknown';

      db.prepare(`
        INSERT INTO api_logs
          (method, path, status_code, duration_ms, api_key_name,
           request_body, request_query, response_body, ip_address, module, success)
        VALUES (?,?,?,?,?,?,?,?,?,?,?)
      `).run(
        req.method,
        req.path,
        statusCode,
        duration,
        req.apiKeyName || (statusCode === 401 || statusCode === 403 ? 'UNAUTHENTICATED' : 'unknown'),
        requestBody,
        requestQuery,
        responseBody,
        ip,
        moduleFromPath(req.path),
        success
      );
    } catch (e) {
      // Never let logging break the app
      console.error('[logger] Failed to write log:', e.message);
    }
  });

  next();
}

module.exports = requestLogger;
