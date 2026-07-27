/**
 * Opulanz Banking Platform - Backend API Server
 *
 * This is the main entry point for the Express.js backend server.
 * It connects to Azure PostgreSQL and exposes REST APIs for the frontend.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { testConnection } = require('./config/db');
const userRoutes = require('./routes/users');
const applicationRoutes = require('./routes/applications');
const documentRoutes = require('./routes/documents');
const documentGenerationRoutes = require('./routes/document-generation');
const companyRoutes = require('./routes/companies');
const appointmentRoutes = require('./routes/appointments');
const notificationRoutes = require('./routes/notifications');
const kycRoutes = require('./routes/kyc');
const sumsubRoutes = require('./routes/sumsub');
const authRoutes = require('./routes/auth');
const taxAdvisoryBookingsRoutes = require('./routes/tax-advisory-bookings');
const lifeInsuranceBookingsRoutes = require('./routes/life-insurance-bookings');

const uploadRoutes = require('./routes/upload');
const narviRoutes = require('./routes/narvi');

// Investment Portal Routes
const investmentAdminsRoutes = require('./routes/investment-admins');
const investmentInvestorsRoutes = require('./routes/investment-investors');
const investmentPropertiesRoutes = require('./routes/investment-properties');
const investmentActivityRoutes = require('./routes/investment-activity');
const investmentsRoutes = require('./routes/investments');
const investmentContactRoutes = require('./routes/investment-contact');
const supportRoutes = require('./routes/support');
const supportChatsRoutes = require('./routes/support-chats');
const adminRoutes = require('./routes/admin');
const paypalRoutes = require('./routes/paypal');
const chatRoutes = require('./routes/chat');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
})); // Security headers with CSP configured

// CORS — allow frontend on any local port (3000-3010) and Capacitor mobile app origins
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'https://frontend.opulanz.com',
  'https://www.opulanz.com',
  'https://opulanz.com',
  'https://rg-opulanz-frontend-hdd4ddcvd4gsc6cx.canadacentral-01.azurewebsites.net',
  // Capacitor mobile app origins
  'capacitor://localhost',
  'ionic://localhost',
  'http://localhost',
];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., curl, Postman) and whitelisted origins
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-token'],
}));

// Rate limiting — protect auth and contact endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { success: false, error: 'Too many attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: { success: false, error: 'Too many submissions. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(morgan('dev')); // HTTP request logger
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Serve static files from public directory
app.use(express.static('public'));

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api', documentRoutes); // Documents routes include /api/applications/:id/documents and /api/documents/:id
app.use('/api/document-generation', documentGenerationRoutes); // Document generation and DocuSign integration
app.use('/api/companies', companyRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/notifications', contactLimiter, notificationRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/sumsub', sumsubRoutes);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/tax-advisory-bookings', contactLimiter, taxAdvisoryBookingsRoutes); // Tax advisory service bookings
app.use('/api/life-insurance-bookings', contactLimiter, lifeInsuranceBookingsRoutes); // Life insurance service bookings
app.use('/api/upload', uploadRoutes); // Azure Blob Storage file uploads
app.use('/api/paypal', paypalRoutes); // PayPal order create + capture
app.use('/api/narvi', narviRoutes); // Narvi banking API

// Investment Portal Routes
app.use('/api/investment/admins', investmentAdminsRoutes);
app.use('/api/investment/investors', investmentInvestorsRoutes);
app.use('/api/investment/properties', investmentPropertiesRoutes);
app.use('/api/investment/activity', investmentActivityRoutes);
app.use('/api/investment/investments', investmentsRoutes);
app.use('/api/investment/contact', contactLimiter, investmentContactRoutes);
app.use('/api/support', contactLimiter, supportRoutes);
app.use('/api/support-chats', supportChatsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes); // AI chat — moved from Next.js API route for Capacitor compatibility

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Opulanz Banking API is running',
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Opulanz Banking Platform API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      users: {
        getAll: 'GET /api/users',
        getOne: 'GET /api/users/:id',
        create: 'POST /api/users',
        update: 'PUT /api/users/:id',
        delete: 'DELETE /api/users/:id',
      },
      applications: {
        getAll: 'GET /api/applications',
        getOne: 'GET /api/applications/:id',
        create: 'POST /api/applications',
        update: 'PATCH /api/applications/:id',
        delete: 'DELETE /api/applications/:id',
      },
      documents: {
        getByApplication: 'GET /api/applications/:id/documents',
        getOne: 'GET /api/documents/:id',
        create: 'POST /api/applications/:id/documents',
        update: 'PATCH /api/documents/:id',
        delete: 'DELETE /api/documents/:id',
      },
      companies: {
        getAll: 'GET /api/companies',
        getOne: 'GET /api/companies/:id',
        create: 'POST /api/companies',
        update: 'PATCH /api/companies/:id',
        delete: 'DELETE /api/companies/:id',
      },
      appointments: {
        getAll: 'GET /api/appointments',
        getOne: 'GET /api/appointments/:id',
        create: 'POST /api/appointments',
        update: 'PATCH /api/appointments/:id',
        delete: 'DELETE /api/appointments/:id',
      },
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    console.log('🔌 Testing database connection...');
    const isConnected = await testConnection();

    if (!isConnected) {
      console.error('❌ Failed to connect to database. Please check your .env configuration.');
      process.exit(1);
    }

    // Start listening
    app.listen(PORT, () => {
      console.log('');
      console.log('🚀 Opulanz Banking API Server Started');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📡 Server running on: http://localhost:${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      console.log('');
      console.log('📚 Available API Endpoints:');
      console.log(`   👥 Users:           http://localhost:${PORT}/api/users`);
      console.log(`   📋 Applications:    http://localhost:${PORT}/api/applications`);
      console.log(`   📄 Documents:       http://localhost:${PORT}/api/documents`);
      console.log(`   🏢 Companies:       http://localhost:${PORT}/api/companies`);
      console.log(`   📅 Appointments:    http://localhost:${PORT}/api/appointments`);
      console.log(`   💼 Tax Advisory:    http://localhost:${PORT}/api/tax-advisory-bookings`);
      console.log(`   🛡️  Life Insurance:  http://localhost:${PORT}/api/life-insurance-bookings`);
      console.log(`   📈 Investments:     http://localhost:${PORT}/api/investment`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('');
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();
