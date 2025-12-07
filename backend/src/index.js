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
app.use(cors()); // Enable CORS for frontend
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
app.use('/api/notifications', notificationRoutes);
app.use('/api/kyc', kycRoutes);

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
      console.log(`   👥 Users:        http://localhost:${PORT}/api/users`);
      console.log(`   📋 Applications: http://localhost:${PORT}/api/applications`);
      console.log(`   📄 Documents:    http://localhost:${PORT}/api/documents`);
      console.log(`   🏢 Companies:    http://localhost:${PORT}/api/companies`);
      console.log(`   📅 Appointments: http://localhost:${PORT}/api/appointments`);
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
