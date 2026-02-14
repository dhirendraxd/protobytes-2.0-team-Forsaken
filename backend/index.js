const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');

// Load environment variables
dotenv.config();

// Import routes
const alertsRouter = require('./routes/alerts');
const contributorsRouter = require('./routes/contributors');
const moderatorsRouter = require('./routes/moderators');
const marketPricesRouter = require('./routes/marketPrices');
const transportRouter = require('./routes/transport');
const authRouter = require('./routes/auth');
const moderatorPortalRouter = require('./routes/moderator');
const disastersRouter = require('./routes/disasters');
const voiceRouter = require('./routes/voice');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // Logging

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Village Voice Hub API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/contributors', contributorsRouter);
app.use('/api/moderators', moderatorsRouter);
app.use('/api/market-prices', marketPricesRouter);
app.use('/api/transport', transportRouter);
app.use('/api/moderator-portal', moderatorPortalRouter);
app.use('/api/disasters', disastersRouter);
app.use('/api/voice', voiceRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
