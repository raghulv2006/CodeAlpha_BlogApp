require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { inputSanitizer, csrfOriginGuard, hppGuard, contentTypeGuard } = require('./middleware/security');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust reverse proxy headers (e.g. Nginx, Cloudflare, AWS ALB, Render, Vercel)
// Critical for accurate client IP identification and rate limiting
app.set('trust proxy', 1);

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
  max: 30, // Limit media uploads to 30 per 15 minutes per IP
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
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map((s) => s.trim()) : []),
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

// Security Trick 5: HTTP Parameter Pollution, OWASP Input Sanitization, Content Type Guard & Anti-CSRF Origin Guard
app.use(hppGuard);
app.use(contentTypeGuard);
app.use(inputSanitizer);
app.use(csrfOriginGuard);

// Serve static uploaded files safely
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Deep Health Check Endpoint with Database Connectivity Verification
const prisma = require('./utils/prisma');

app.get('/health', async (req, res) => {
  let dbStatus = 'healthy';
  let dbLatencyMs = null;

  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - start;
  } catch (err) {
    dbStatus = 'unreachable';
    console.error('[HEALTHCHECK ERROR] Database connection failed:', err.message);
  }

  const isHealthy = dbStatus === 'healthy';
  const statusCode = isHealthy ? 200 : 503;

  res.status(statusCode).json({
    status: isHealthy ? 'OK' : 'DEGRADED',
    message: isHealthy ? 'BotBlogs API Operational' : 'Database Unavailable',
    database: {
      status: dbStatus,
      latencyMs: dbLatencyMs,
    },
    environment: process.env.NODE_ENV || 'development',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api', apiRoutes);

// Security Trick 6: Global Masked Error Handler (Zero Data/Stack Trace Leakage in Production)
app.use((err, req, res, next) => {
  // Gracefully handle Multer file upload errors with 413 / 400
  if (err && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      message: 'File upload exceeds the 55MB maximum allowed limit.',
    });
  }
  if (err && err.name === 'MulterError') {
    return res.status(400).json({
      message: `File upload error: ${err.message}`,
    });
  }

  console.error('[SERVER ERROR]', err.stack || err.message || err);
  const isProd = process.env.NODE_ENV === 'production';
  res.status(500).json({
    message: 'Internal Server Error',
    ...(isProd ? {} : { error: err.message }),
  });
});

const server = app.listen(PORT, () => {
  console.log(`🔒 BotBlogs Production API server running on http://localhost:${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful Shutdown Handler for Containers & Production Process Managers
const gracefulShutdown = async (signal) => {
  console.log(`\n[SHUTDOWN] Received ${signal}. Starting graceful shutdown...`);
  server.close(async () => {
    console.log('[SHUTDOWN] HTTP server closed. Draining database connections...');
    try {
      await prisma.$disconnect();
      console.log('[SHUTDOWN] Prisma disconnected successfully.');
      process.exit(0);
    } catch (err) {
      console.error('[SHUTDOWN ERROR] Error during Prisma disconnect:', err);
      process.exit(1);
    }
  });

  // Force shutdown if cleanup takes too long
  setTimeout(() => {
    console.error('[SHUTDOWN] Forcefully shutting down after timeout.');
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

