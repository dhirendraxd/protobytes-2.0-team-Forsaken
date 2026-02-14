// Voice Call and SMS Routes
const express = require('express');
const { makeVoiceCall, sendSMS, getCallDetails, getMessageDetails } = require('../services/twilioService');

const router = express.Router();

/**
 * POST /api/voice/call
 * Make a voice call to a recipient
 */
router.post('/call', async (req, res) => {
  try {
    const { toNumber, twimlUrl } = req.body;

    if (!toNumber) {
      return res.status(400).json({
        success: false,
        message: 'toNumber is required',
      });
    }

    const result = await makeVoiceCall(toNumber, twimlUrl);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * POST /api/voice/sms
 * Send an SMS message
 */
router.post('/sms', async (req, res) => {
  try {
    const { toNumber, message } = req.body;

    if (!toNumber || !message) {
      return res.status(400).json({
        success: false,
        message: 'toNumber and message are required',
      });
    }

    const result = await sendSMS(toNumber, message);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /api/voice/call/:callSid
 * Get details about a specific call
 */
router.get('/call/:callSid', async (req, res) => {
  try {
    const { callSid } = req.params;
    const result = await getCallDetails(callSid);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /api/voice/message/:messageSid
 * Get details about a specific message
 */
router.get('/message/:messageSid', async (req, res) => {
  try {
    const { messageSid } = req.params;
    const result = await getMessageDetails(messageSid);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
