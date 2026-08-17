const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const prisma = require('../utils/prisma');

// Initialize Firebase Admin (Only once)
let firebaseAdminReady = false;

if (!getApps().length) {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'FATAL: FIREBASE_SERVICE_ACCOUNT environment variable is not set. ' +
        'The server cannot start in production without Firebase Admin credentials.'
      );
    } else {
      console.warn(
        '[SECURITY WARNING] FIREBASE_SERVICE_ACCOUNT is not set. ' +
        'Auth token verification is DISABLED. Do NOT run without credentials in production.'
      );
    }
  } else {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      initializeApp({
        credential: cert(serviceAccount)
      });
      firebaseAdminReady = true;
    } catch (err) {
      throw new Error(`FATAL: Failed to initialize Firebase Admin SDK: ${err.message}`);
    }
  }
} else {
  firebaseAdminReady = true;
}

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: Missing or invalid Authorization header' });
  }

  const idToken = authHeader.split('Bearer ')[1]?.trim();
  if (!idToken || idToken.length > 4096) {
    return res.status(401).json({ message: 'Unauthorized: Invalid token format' });
  }

  try {
    let decodedToken;
    
    if (firebaseAdminReady) {
      decodedToken = await getAuth().verifyIdToken(idToken);
    } else {
      if (process.env.NODE_ENV === 'production') {
        return res.status(500).json({ message: 'Internal Server Error: Firebase Admin not initialized' });
      }
      // Dev fallback: decode token payload only in development environment
      try {
        const parts = idToken.split('.');
        if (parts.length < 2) throw new Error('Invalid JWT structure');
        const payload = Buffer.from(parts[1], 'base64').toString('utf-8');
        decodedToken = JSON.parse(payload);
      } catch (e) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token format' });
      }
    }

    const email = decodedToken.email;

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(401).json({ message: 'Unauthorized: Token must contain a valid email address' });
    }

    // Ensure the user exists in our DB
    const user = await prisma.user.upsert({
      where: { email: email.toLowerCase() },
      update: {},
      create: { 
        email: email.toLowerCase(), 
        name: decodedToken.name || email.split('@')[0],
        image: decodedToken.picture || null,
      },
    });

    // Attach verified user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({ message: 'Unauthorized: Invalid or expired token' });
  }
};

module.exports = { authMiddleware };
