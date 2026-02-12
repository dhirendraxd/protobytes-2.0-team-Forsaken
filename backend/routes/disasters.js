const express = require('express');
const router = express.Router();
const reliefwebService = require('../services/reliefwebService');

// In-memory storage for disaster alerts configuration
// In production, this should be stored in a database
let disasterConfig = {
  enabled: true,
  autoSendSMS: false, // Require manual approval by default
  checkInterval: 3600000, // Check every hour (in milliseconds)
  lastCheck: new Date(),
  monitoredTypes: [
    'Earthquake',
    'Flood',
    'Landslide',
    'Epidemic',
    'Storm',
    'Fire',
    'Cold Wave',
  ],
  targetCountry: 'NPL', // Nepal
  regions: [], // Empty = all regions
};

// Storage for sent alerts
let sentAlerts = [];

/**
 * GET /api/disasters/config
 * Get current disaster monitoring configuration
 */
router.get('/config', async (req, res) => {
  try {
    res.json({
      success: true,
      data: disasterConfig,
    });
  } catch (error) {
    console.error('Error fetching disaster config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch disaster configuration',
    });
  }
});

/**
 * PUT /api/disasters/config
 * Update disaster monitoring configuration
 */
router.put('/config', async (req, res) => {
  try {
    const {
      enabled,
      autoSendSMS,
      checkInterval,
      monitoredTypes,
      targetCountry,
      regions,
    } = req.body;

    disasterConfig = {
      ...disasterConfig,
      enabled: enabled !== undefined ? enabled : disasterConfig.enabled,
      autoSendSMS:
        autoSendSMS !== undefined ? autoSendSMS : disasterConfig.autoSendSMS,
      checkInterval:
        checkInterval !== undefined
          ? checkInterval
          : disasterConfig.checkInterval,
      monitoredTypes:
        monitoredTypes !== undefined
          ? monitoredTypes
          : disasterConfig.monitoredTypes,
      targetCountry:
        targetCountry !== undefined
          ? targetCountry
          : disasterConfig.targetCountry,
      regions: regions !== undefined ? regions : disasterConfig.regions,
    };

    res.json({
      success: true,
      message: 'Configuration updated successfully',
      data: disasterConfig,
    });
  } catch (error) {
    console.error('Error updating disaster config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update configuration',
    });
  }
});

/**
 * GET /api/disasters/active
 * Get currently active disasters
 */
router.get('/active', async (req, res) => {
  try {
    const disasters = await reliefwebService.getActiveDisasters(
      disasterConfig.targetCountry
    );

    res.json({
      success: true,
      data: disasters,
      count: disasters.length,
    });
  } catch (error) {
    console.error('Error fetching active disasters:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active disasters',
    });
  }
});

/**
 * GET /api/disasters/recent
 * Get recent disaster reports
 */
router.get('/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const disasters = await reliefwebService.getDisasters({
      limit,
      country: disasterConfig.targetCountry,
    });

    res.json({
      success: true,
      data: disasters,
      count: disasters.length,
    });
  } catch (error) {
    console.error('Error fetching recent disasters:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent disasters',
    });
  }
});

/**
 * GET /api/disasters/check
 * Check for new disasters since last check
 */
router.get('/check', async (req, res) => {
  try {
    const newDisasters = await reliefwebService.getNewDisastersSince(
      disasterConfig.lastCheck,
      disasterConfig.targetCountry
    );

    // Update last check time
    disasterConfig.lastCheck = new Date();

    // Filter by monitored types
    const relevantDisasters = newDisasters.filter((disaster) => {
      const disasterTypes = disaster.fields?.disaster_type || [];
      return disasterTypes.some((type) =>
        disasterConfig.monitoredTypes.some((monitored) =>
          type.name?.toLowerCase().includes(monitored.toLowerCase())
        )
      );
    });

    res.json({
      success: true,
      data: relevantDisasters,
      count: relevantDisasters.length,
      lastCheck: disasterConfig.lastCheck,
    });
  } catch (error) {
    console.error('Error checking for new disasters:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check for new disasters',
    });
  }
});

/**
 * POST /api/disasters/send-alert
 * Send SMS alert for a specific disaster
 */
router.post('/send-alert', async (req, res) => {
  try {
    const { disasterId, disasterData, regions } = req.body;

    if (!disasterData) {
      return res.status(400).json({
        success: false,
        message: 'Disaster data is required',
      });
    }

    // Format disaster for SMS
    const smsMessage = reliefwebService.formatDisasterForSMS(disasterData);

    // Calculate recipients (mock - in production, query database)
    const targetRegions = regions || disasterConfig.regions || [];
    const recipientCount = targetRegions.length > 0 ? targetRegions.length * 50 : 500; // Mock calculation

    // In production, integrate with actual SMS service
    const alert = {
      id: sentAlerts.length + 1,
      disasterId,
      message: smsMessage,
      regions: targetRegions,
      recipientCount,
      sentAt: new Date(),
      status: 'sent',
    };

    sentAlerts.push(alert);

    res.json({
      success: true,
      message: 'Alert sent successfully',
      data: alert,
    });
  } catch (error) {
    console.error('Error sending disaster alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send alert',
    });
  }
});

/**
 * GET /api/disasters/alerts
 * Get history of sent disaster alerts
 */
router.get('/alerts', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const alerts = sentAlerts.slice(-limit).reverse();

    res.json({
      success: true,
      data: alerts,
      count: alerts.length,
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alerts',
    });
  }
});

/**
 * GET /api/disasters/stats
 * Get disaster statistics for dashboard
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await reliefwebService.getDisasterStats(
      disasterConfig.targetCountry
    );

    res.json({
      success: true,
      data: {
        ...stats,
        totalAlertsSent: sentAlerts.length,
        configEnabled: disasterConfig.enabled,
        autoSendEnabled: disasterConfig.autoSendSMS,
      },
    });
  } catch (error) {
    console.error('Error fetching disaster stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
    });
  }
});

module.exports = router;
