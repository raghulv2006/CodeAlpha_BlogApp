require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { inputSanitizer, csrfOriginGuard } = require('./middleware/security');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Security Trick 1: Disable Express signature header (Prevents server fingerprinting)
app.disable('x-powered-by');

// Gzip Compression Middleware (Shrinks payloads by 75% for sub-100ms responses)
app.use(compression());

// Security Trick 2: Industrial-grade HTTP Security Headers via Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false, // Handled at client & reverse proxy level
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    frameguard: { action: 'deny' },
    noSniff: true,
    xssFilter: true,
  })
);

// Custom Permissions Policy Security Header
app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  next();
});

// Security Trick 3: Rate Limiting Defense (Anti-DDoS, Anti-Brute-Force, Anti-Spam)
const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per window
  message: { message: 'Too many requests from this IP address. Security rate limit engaged.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // Limit media uploads to 20 per 15 minutes per IP
  message: { message: 'Media upload rate limit exceeded. Please wait 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', globalApiLimiter);
app.use('/api/upload', uploadLimiter);

// Security Trick 4: Strict CORS Origin Protection
const allowedOrigins = [
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS Security Policy'));
      }
    },
    credentials: true,
  })
);

// Body Parsing Middleware with size limits to prevent Denial of Service (DoS) payloads
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Security Trick 5: OWASP Input Sanitization & Anti-CSRF Origin Guard
app.use(inputSanitizer);
app.use(csrfOriginGuard);

// Serve static uploaded files safely
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Security & Server Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'BotBlogs Hardened API Server Active',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api', apiRoutes);

// Security Trick 6: Global Masked Error Handler (Zero Data/Stack Trace Leakage in Production)
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err.stack || err.message || err);
  const isProd = process.env.NODE_ENV === 'production';
  res.status(500).json({
    message: 'Internal Server Error',
    ...(isProd ? {} : { error: err.message }),
  });
});

app.listen(PORT, () => {
  console.log(`🔒 BotBlogs Hardened API server running securely on http://localhost:${PORT}`);
});
