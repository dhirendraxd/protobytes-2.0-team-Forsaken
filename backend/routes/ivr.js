/**
 * IVR Webhook Routes
 * Handles incoming calls and DTMF (keypad) input from IVR provider
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

const {
  initializeMenuState,
  handleMenuInput,
  getMenuState,
  endCallSession,
  storeRecording,
  storeReportId,
} = require('../utils/ivrMenu');
const {
  createMenuPromptResponse,
  createRecordingResponse,
  createPlaybackResponse,
  createTextResponse,
  createErrorResponse,
  createGoodbyeResponse,
} = require('../utils/ivrResponse');
const { getMenu } = require('../utils/ivrMenu');
const redisClient = require('../../database/config/redis');

/**
 * POST /ivr/call-started
 * Webhook triggered when a call starts
 * Provider sends: callId, callerId (phone number), timestamp, etc.
 */
router.post('/call-started', async (req, res) => {
  try {
    const { callId, callerId, timestamp, language = 'en' } = req.body;

    if (!callId || !callerId) {
      return res.status(400).json({ error: 'Missing callId or callerId' });
    }

    // Generate unique session ID
    const sessionId = `${callId}_${uuidv4()}`;

    // Initialize menu state in Redis
    const menuState = await initializeMenuState(sessionId, callerId, language);

    // Get main menu definition
    const mainMenu = getMenu('main_menu');

    // Create and return first prompt (Main Menu)
    const ivrResponse = createMenuPromptResponse(mainMenu, 'main_menu', language);

    // Store call session info
    await redisClient.setEx(
      `call:session:${sessionId}`,
      3600,
      JSON.stringify({
        sessionId,
        callId,
        callerId,
        startTime: new Date().toISOString(),
        status: 'active',
      })
    );

    console.log(`[IVR] Call started - Session: ${sessionId}, Caller: ${callerId}`);

    return res.json({
      success: true,
      sessionId,
      callId,
      response: ivrResponse,
    });
  } catch (error) {
    console.error('[IVR] Error in call-started:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      response: createErrorResponse(),
    });
  }
});

/**
 * POST /ivr/digit-pressed
 * Webhook triggered when caller presses a key
 * Provider sends: sessionId, digit (0-9, #, *), timestamp, etc.
 */
router.post('/digit-pressed', async (req, res) => {
  try {
    const { sessionId, digit, timestamp } = req.body;

    if (!sessionId || digit === undefined) {
      return res.status(400).json({ error: 'Missing sessionId or digit' });
    }

    // Validate digit
    if (!['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '#', '*'].includes(digit)) {
      return res.status(400).json({ error: 'Invalid digit' });
    }

    // Get current menu state
    const currentState = await getMenuState(sessionId);
    if (!currentState) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Handle menu input
    const result = await handleMenuInput(sessionId, digit);
    const { action, nextMenu, menuState } = result;

    console.log(`[IVR] Digit pressed - Session: ${sessionId}, Digit: ${digit}, Action: ${action}`);

    // Route to appropriate action
    let ivrResponse;

    switch (action) {
      case 'start_recording':
        ivrResponse = createRecordingResponse(120, menuState.language);
        break;

      case 'invalid_input':
        const currentMenu = getMenu(menuState.currentMenu);
        ivrResponse = createMenuPromptResponse(currentMenu, menuState.currentMenu, menuState.language);
        break;

      case 'submit_report':
        // Generate report ID and store it
        const reportId = `RPT_${uuidv4()}`;
        await storeReportId(sessionId, reportId);
        const confirmMenu = getMenu('submission_confirmed');
        ivrResponse = createMenuPromptResponse(confirmMenu, 'submission_confirmed', menuState.language);
        break;

      case 'get_alerts':
      case 'get_transport':
      case 'get_prices':
      case 'play_announcements':
        // Fetch data and create response
        ivrResponse = await handleDataFetch(action, menuState);
        break;

      default:
        // Navigate to next menu
        const menu = getMenu(nextMenu);
        if (!menu) {
          throw new Error(`Menu ${nextMenu} not found`);
        }
        ivrResponse = createMenuPromptResponse(menu, nextMenu, menuState.language);
    }

    return res.json({
      success: true,
      sessionId,
      action,
      nextMenu,
      response: ivrResponse,
    });
  } catch (error) {
    console.error('[IVR] Error in digit-pressed:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      response: createErrorResponse(),
    });
  }
});

/**
 * POST /ivr/recording-completed
 * Webhook triggered when recording is finished
 * Provider sends: sessionId, recordingUrl, duration, timestamp, etc.
 */
router.post('/recording-completed', async (req, res) => {
  try {
    const { sessionId, recordingUrl, duration, timestamp } = req.body;

    if (!sessionId || !recordingUrl) {
      return res.status(400).json({ error: 'Missing sessionId or recordingUrl' });
    }

    // Store recording reference
    await storeRecording(sessionId, recordingUrl);

    const menuState = await getMenuState(sessionId);
    const confirmMenu = getMenu('confirm_submission');
    const ivrResponse = createMenuPromptResponse(confirmMenu, 'confirm_submission', menuState.language);

    console.log(`[IVR] Recording completed - Session: ${sessionId}, URL: ${recordingUrl}`);

    return res.json({
      success: true,
      sessionId,
      recordingUrl,
      duration,
      response: ivrResponse,
    });
  } catch (error) {
    console.error('[IVR] Error in recording-completed:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      response: createErrorResponse(),
    });
  }
});

/**
 * POST /ivr/call-ended
 * Webhook triggered when call ends
 * Provider sends: sessionId, callDuration, hangupReason, timestamp, etc.
 */
router.post('/call-ended', async (req, res) => {
  try {
    const { sessionId, callDuration, hangupReason, timestamp } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Missing sessionId' });
    }

    // End call session and log to Redis
    const sessionSummary = await endCallSession(sessionId);

    console.log(`[IVR] Call ended - Session: ${sessionId}, Duration: ${callDuration}s, Reason: ${hangupReason}`);

    return res.json({
      success: true,
      sessionId,
      sessionSummary,
    });
  } catch (error) {
    console.error('[IVR] Error in call-ended:', error);
    // Still return 200 even on error for webhook reliability
    return res.json({
      success: true,
      error: error.message,
    });
  }
});

/**
 * Helper function to fetch data for info queries
 * @param {string} action - Action to perform (get_alerts, get_transport, get_prices, play_announcements)
 * @param {Object} menuState - Current menu state
 * @returns {Object} IVR response
 */
async function handleDataFetch(action, menuState) {
  try {
    let data = [];
    let responseText = '';

    switch (action) {
      case 'get_alerts':
        // Fetch from Redis cache:alerts
        const alertsData = await redisClient.get('cache:alerts');
        data = alertsData ? JSON.parse(alertsData) : [];
        responseText = data.length > 0
          ? `We have ${data.length} alerts. Press 1 for the first alert.`
          : 'No alerts available at this time.';
        break;

      case 'get_transport':
        // Fetch from Redis cache:transport
        const transportData = await redisClient.get('cache:transport');
        data = transportData ? JSON.parse(transportData) : [];
        responseText = data.length > 0
          ? `We have ${data.length} transport updates available.`
          : 'No transport updates available.';
        break;

      case 'get_prices':
        // Fetch from Redis cache:prices
        const pricesData = await redisClient.get('cache:prices');
        data = pricesData ? JSON.parse(pricesData) : [];
        responseText = data.length > 0
          ? `We have market price information available.`
          : 'No price information available.';
        break;

      case 'play_announcements':
        // Fetch from Redis cache:announcements
        const announcementsData = await redisClient.get('cache:announcements');
        data = announcementsData ? JSON.parse(announcementsData) : [];
        responseText = data.length > 0
          ? `We have ${data.length} community announcements.`
          : 'No announcements at this time.';
        break;
    }

    return createTextResponse(responseText, menuState.language);
  } catch (error) {
    console.error(`Error fetching data for action ${action}:`, error);
    return createTextResponse('Unable to fetch information. Please try again later.', menuState.language);
  }
}

/**
 * GET /ivr/status/:sessionId
 * Check status of an active call session (for debugging/monitoring)
 */
router.get('/status/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const menuState = await getMenuState(sessionId);
    if (!menuState) {
      return res.status(404).json({ error: 'Session not found' });
    }

    return res.json({
      success: true,
      sessionId,
      menuState,
    });
  } catch (error) {
    console.error('[IVR] Error getting status:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
