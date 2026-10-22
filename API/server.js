const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config');
const { loadGrievances } = require('./utils/csvLoader');

const authRoutes = require('./routes/authRoutes');
const grievanceRoutes = require('./routes/grievanceRoutes');
const aiRoutes = require('./routes/aiRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const voiceRoutes = require('./routes/voiceRoutes');
const evalRoutes = require('./routes/evalRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString().substring(11, 19)}] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'CivicAI Grievance Assistant API',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/grievances', grievanceRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/evals', evalRoutes);

// Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.url}` });
});

// Start Server after loading CSV
async function start() {
  try {
    await loadGrievances();
    app.listen(config.port, () => {
      console.log(`=======================================================`);
      console.log(`🚀 CivicAI Grievance Assistant Backend running on port ${config.port}`);
      console.log(`🌐 API base: http://localhost:${config.port}/api`);
      console.log(`📊 Health check: http://localhost:${config.port}/api/health`);
      console.log(`=======================================================`);
    });
  } catch (err) {
    console.error('Failed to initialize server data:', err);
    process.exit(1);
  }
}

start();
