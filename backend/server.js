const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

// Security: trust proxy for real IP behind nginx
app.set('trust proxy', 1);

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"],
      styleSrc: ["'self'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/"],
      connectSrc: ["'self'"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: 'same-origin',
  crossOriginResourcePolicy: 'same-origin',
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  hsts: { maxAge: 63072000, includeSubDomains: true, preload: true }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' }
});
app.use('/api/', limiter);

// CORS for secure origins only
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') || ['https://roomcheck.local'] }));

app.use(express.json({ limit: '10kb' }));

// Health check
app.get('/health', (req, res) => res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() }));

// Auth
app.post('/api/auth/login', async (req, res) => {
  // Implement with parameterized queries, bcrypt compare, JWT generation
  res.status(501).json({ message: 'Authentication endpoint — implement with secure query patterns.' });
});

// Room search (read-only DB user recommended)
app.get('/api/rooms/search', async (req, res) => {
  // Implement with Prisma `findMany`, strict parameter validation
  res.status(501).json({ message: 'Search endpoint — implement with parameterized Prisma queries.' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`RoomCheck API running securely on port ${PORT}`));
