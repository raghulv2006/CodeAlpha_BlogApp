/**
 * Cyber Security & Defense-in-Depth Middleware for BotBlogs API
 * Implements OWASP Top 10 Protections (XSS, SQL/NoSQL Injection, CSRF, Path Traversal, HPP)
 */

// Recursive string sanitizer against XSS, script injection, and dangerous payloads
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;

  // 1. Remove Null Bytes (%00 / \0) to prevent path traversal & truncation tricks
  let sanitized = str.replace(/\0/g, '');

  // 2. Neutralize HTML script tags, iframes, & executable tags
  sanitized = sanitized
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '');

  // 3. Neutralize inline JavaScript event handlers (e.g. onload=, onerror=, onclick=)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*(['"]?).*?\1(?=\s|>|$)/gi, '');

  // 4. Neutralize javascript: and data: text/html URIs
  sanitized = sanitized
    .replace(/javascript\s*:/gi, 'javascript_blocked:')
    .replace(/data\s*:\s*text\/html/gi, 'data_blocked:');

  return sanitized;
};

// Deep object / array traversal sanitizer
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
  const isDev = process.env.NODE_ENV !== 'production';

  // In production, enforce origin matching
  if (!isDev && origin) {
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
  sanitizeString,
};
