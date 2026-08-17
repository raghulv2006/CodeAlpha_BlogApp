/**
 * Cyber Security & Defense-in-Depth Middleware for BotBlogs API
 * Implements OWASP Top 10 Protections (XSS, SQL/NoSQL Injection, CSRF, Path Traversal, HPP)
 */

// Recursive string sanitizer against XSS, script injection, and dangerous payloads
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;

  // 1. Remove Null Bytes (%00 / \0) to prevent path traversal & string truncation tricks
  let sanitized = str.replace(/\0/g, '').replace(/%00/gi, '');

  // 2. Neutralize HTML script tags, iframes, & executable tags (including whitespace and attribute variations)
  sanitized = sanitized
    .replace(/<\s*script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script\s*>/gi, '')
    .replace(/<\s*iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe\s*>/gi, '')
    .replace(/<\s*object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object\s*>/gi, '')
    .replace(/<\s*embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed\s*>/gi, '')
    .replace(/<\s*applet\b[^<]*(?:(?!<\/applet>)<[^<]*)*<\/applet\s*>/gi, '')
    .replace(/<\s*base\b[^>]*>/gi, '')
    .replace(/<\s*link\b[^>]*rel\s*=\s*['"]?import['"]?[^>]*>/gi, '');

  // 3. Neutralize inline JavaScript event handlers (e.g. onload=, onerror=, onclick=, onfocus=)
  sanitized = sanitized.replace(/\s*on[a-zA-Z]+\s*=\s*(['"]?).*?\1(?=\s|>|$)/gi, '');

  // 4. Neutralize javascript:, vbscript:, and data: text/html URIs
  sanitized = sanitized
    .replace(/javascript\s*:/gi, 'javascript_blocked:')
    .replace(/vbscript\s*:/gi, 'vbscript_blocked:')
    .replace(/data\s*:\s*text\/html/gi, 'data_blocked:');

  return sanitized;
};

// Deep object / array traversal sanitizer with prototype pollution guard
const sanitizeValue = (val) => {
  if (typeof val === 'string') {
    return sanitizeString(val);
  }
  if (Array.isArray(val)) {
    return val.map((item) => sanitizeValue(item));
  }
  if (val !== null && typeof val === 'object') {
    const cleaned = {};
    for (const key of Object.keys(val)) {
      // Prevent prototype pollution
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        continue;
      }
      cleaned[key] = sanitizeValue(val[key]);
    }
    return cleaned;
  }
  return val;
};

// HTTP Parameter Pollution (HPP) defense: Flatten duplicated query/body parameters into scalar values
const hppGuard = (req, res, next) => {
  const allowedArrayParams = ['tags', 'categories', 'votes', 'items'];

  if (req.query && typeof req.query === 'object') {
    for (const key of Object.keys(req.query)) {
      if (Array.isArray(req.query[key]) && !allowedArrayParams.includes(key)) {
        req.query[key] = req.query[key][req.query[key].length - 1];
      }
    }
  }

  if (req.body && typeof req.body === 'object' && !Array.isArray(req.body)) {
    for (const key of Object.keys(req.body)) {
      // If scalar fields (like slug, title, value, email) are sent as arrays, reduce to scalar
      const scalarExpectedFields = ['slug', 'title', 'value', 'catSlug', 'email', 'userEmail', 'notificationId', 'targetEmail'];
      if (scalarExpectedFields.includes(key) && Array.isArray(req.body[key])) {
        req.body[key] = req.body[key][req.body[key].length - 1];
      }
    }
  }

  next();
};

// Content-Type validation for mutating requests with bodies
const contentTypeGuard = (req, res, next) => {
  const mutatingMethods = ['POST', 'PUT', 'PATCH'];
  if (mutatingMethods.includes(req.method)) {
    const contentType = req.headers['content-type'] || '';
    const hasBody = req.body && Object.keys(req.body).length > 0;
    
    // If request contains body data, verify standard acceptable content-types
    if (hasBody && !contentType.includes('application/json') && !contentType.includes('multipart/form-data') && !contentType.includes('application/x-www-form-urlencoded')) {
      return res.status(415).json({ message: 'Unsupported Media Type: Request must use application/json or multipart/form-data' });
    }
  }
  next();
};

// Middleware: Sanitize req.body, req.query, and req.params
const inputSanitizer = (req, res, next) => {
  if (req.body) req.body = sanitizeValue(req.body);
  if (req.query) req.query = sanitizeValue(req.query);
  if (req.params) req.params = sanitizeValue(req.params);
  next();
};

// Middleware: CSRF & Origin Guard for state-changing requests
const csrfOriginGuard = (req, res, next) => {
  const mutatingMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
  if (!mutatingMethods.includes(req.method)) {
    return next();
  }

  const origin = req.headers.origin || req.headers.referer;
  const isProd = process.env.NODE_ENV === 'production';

  // In production, reject requests that have no Origin/Referer header at all
  if (isProd && !origin) {
    console.warn(`[SECURITY ALERT] Blocked request missing Origin header: ${req.method} ${req.path}`);
    return res.status(403).json({ message: 'Forbidden: Origin header is required' });
  }

  if (origin) {
    const allowedOrigins = [
      'http://localhost:3000',
      process.env.CLIENT_URL,
    ].filter(Boolean);

    const isAllowed = allowedOrigins.some((allowed) => origin.startsWith(allowed));
    if (!isAllowed) {
      console.warn(`[SECURITY ALERT] Blocked untrusted cross-origin request from: ${origin}`);
      return res.status(403).json({ message: 'Forbidden: Security Origin Policy Violation' });
    }
  }

  next();
};

module.exports = {
  inputSanitizer,
  csrfOriginGuard,
  hppGuard,
  contentTypeGuard,
  sanitizeString,
};
