/**
 * IVR Menu Management Utilities
 * Handles menu navigation, state management, and flow control
 */

const { IVR_MENUS } = require('../config/ivr');
const redisClient = require('../../database/config/redis');

/**
 * Get menu state for a call session
 * @param {string} sessionId - Unique call session ID
 * @returns {Promise<Object>} Current menu state
 */
async function getMenuState(sessionId) {
  try {
    const state = await redisClient.get(`menu:state:${sessionId}`);
    return state ? JSON.parse(state) : null;
  } catch (error) {
    console.error(`Error getting menu state for ${sessionId}:`, error);
    throw error;
  }
}

/**
 * Initialize menu state for new call session
 * @param {string} sessionId - Unique call session ID
 * @param {string} callerId - Phone number of the caller
 * @param {string} language - Language preference (en, ne)
 * @returns {Promise<Object>} Initialized menu state
 */
async function initializeMenuState(sessionId, callerId, language = 'en') {
  const initialState = {
    sessionId,
    callerId,
    currentMenu: 'main_menu',
    previousMenus: [],
    selectedOptions: [],
    language,
    inputBuffer: '',
    navigationHistory: [],
    startTime: new Date().toISOString(),
    category: null,
    recordingUrl: null,
    reportId: null,
    status: 'active',
  };

  try {
    await redisClient.setEx(
      `menu:state:${sessionId}`,
      3600, // 1 hour TTL
      JSON.stringify(initialState)
    );
    return initialState;
  } catch (error) {
    console.error(`Error initializing menu state for ${sessionId}:`, error);
    throw error;
  }
}

/**
 * Update menu state with new navigation
 * @param {string} sessionId - Unique call session ID
 * @param {string} keyPressed - Digit pressed by caller (0-9, #, *)
 * @returns {Promise<Object>} Updated menu state with next menu
 */
async function handleMenuInput(sessionId, keyPressed) {
  try {
    const state = await getMenuState(sessionId);
    if (!state) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const currentMenu = IVR_MENUS[state.currentMenu.toUpperCase().replace(/-/g, '_')];
    if (!currentMenu) {
      throw new Error(`Menu ${state.currentMenu} not found`);
    }

    const option = currentMenu.options[keyPressed];
    if (!option) {
      // Invalid input - stay on current menu
      state.inputBuffer += keyPressed;
      await redisClient.setEx(
        `menu:state:${sessionId}`,
        3600,
        JSON.stringify(state)
      );
      return {
        menuState: state,
        action: 'invalid_input',
        nextMenu: state.currentMenu,
        message: 'Invalid selection. Please try again.',
      };
    }

    // Update navigation history
    state.previousMenus.push(state.currentMenu);
    state.selectedOptions.push({ menu: state.currentMenu, key: keyPressed });
    state.navigationHistory.push({
      from: state.currentMenu,
      action: option.action,
      key: keyPressed,
      timestamp: new Date().toISOString(),
    });

    // Handle specific actions
    if (option.category) {
      state.category = option.category;
    }

    if (option.recordingDuration) {
      state.isRecording = true;
      state.recordingDuration = option.recordingDuration;
    }

    // Move to next menu
    state.currentMenu = option.nextMenu;
    state.inputBuffer = '';

    // Persist updated state
    await redisClient.setEx(
      `menu:state:${sessionId}`,
      3600,
      JSON.stringify(state)
    );

    return {
      menuState: state,
      action: option.action,
      nextMenu: option.nextMenu,
      menu: IVR_MENUS[option.nextMenu.toUpperCase().replace(/-/g, '_')],
    };
  } catch (error) {
    console.error(`Error handling menu input for ${sessionId}:`, error);
    throw error;
  }
}

/**
 * Navigate back to previous menu
 * @param {string} sessionId - Unique call session ID
 * @returns {Promise<Object>} Updated menu state
 */
async function goBackMenu(sessionId) {
  try {
    const state = await getMenuState(sessionId);
    if (!state || state.previousMenus.length === 0) {
      throw new Error('Cannot go back - no previous menu');
    }

    state.currentMenu = state.previousMenus.pop();
    state.selectedOptions.pop();

    await redisClient.setEx(
      `menu:state:${sessionId}`,
      3600,
      JSON.stringify(state)
    );

    return state;
  } catch (error) {
    console.error(`Error going back in menu for ${sessionId}:`, error);
    throw error;
  }
}

/**
 * Get current menu definition
 * @param {string} menuName - Menu identifier
 * @returns {Object} Menu definition
 */
function getMenu(menuName) {
  const key = menuName.toUpperCase().replace(/-/g, '_');
  return IVR_MENUS[key] || null;
}

/**
 * End call session and cleanup
 * @param {string} sessionId - Unique call session ID
 * @returns {Promise<Object>} Session summary
 */
async function endCallSession(sessionId) {
  try {
    const state = await getMenuState(sessionId);
    if (!state) {
      return null;
    }

    const endTime = new Date().toISOString();
    const duration = Math.round(
      (new Date(endTime) - new Date(state.startTime)) / 1000
    );

    const summary = {
      sessionId,
      callerId: state.callerId,
      startTime: state.startTime,
      endTime,
      durationSeconds: duration,
      language: state.language,
      menuSequence: state.navigationHistory,
      category: state.category,
      recordingUrl: state.recordingUrl,
      reportId: state.reportId,
      status: 'ended',
    };

    // Log call session to Redis
    await redisClient.rPush(
      `call:sessions:list`,
      JSON.stringify(summary)
    );

    // Delete menu state (TTL will handle cleanup anyway)
    await redisClient.del(`menu:state:${sessionId}`);

    return summary;
  } catch (error) {
    console.error(`Error ending call session ${sessionId}:`, error);
    throw error;
  }
}

/**
 * Store recording reference in call session
 * @param {string} sessionId - Unique call session ID
 * @param {string} recordingUrl - URL of the recording
 * @returns {Promise<void>}
 */
async function storeRecording(sessionId, recordingUrl) {
  try {
    const state = await getMenuState(sessionId);
    if (!state) {
      throw new Error(`Session ${sessionId} not found`);
    }

    state.recordingUrl = recordingUrl;
    state.isRecording = false;

    await redisClient.setEx(
      `menu:state:${sessionId}`,
      3600,
      JSON.stringify(state)
    );
  } catch (error) {
    console.error(`Error storing recording for ${sessionId}:`, error);
    throw error;
  }
}

/**
 * Store submitted report reference in call session
 * @param {string} sessionId - Unique call session ID
 * @param {string} reportId - ID of the submitted report
 * @returns {Promise<void>}
 */
async function storeReportId(sessionId, reportId) {
  try {
    const state = await getMenuState(sessionId);
    if (!state) {
      throw new Error(`Session ${sessionId} not found`);
    }

    state.reportId = reportId;

    await redisClient.setEx(
      `menu:state:${sessionId}`,
      3600,
      JSON.stringify(state)
    );
  } catch (error) {
    console.error(`Error storing report ID for ${sessionId}:`, error);
    throw error;
  }
}

/**
 * Get all active call sessions (for monitoring)
 * @returns {Promise<Array>} List of active menu states
 */
async function getActiveSessions() {
  try {
    const pattern = 'menu:state:*';
    const keys = await redisClient.keys(pattern);
    const sessions = [];

    for (const key of keys) {
      const state = await redisClient.get(key);
      if (state) {
        sessions.push(JSON.parse(state));
      }
    }

    return sessions;
  } catch (error) {
    console.error('Error getting active sessions:', error);
    throw error;
  }
}

/**
 * Get call session statistics
 * @returns {Promise<Object>} Statistics about current sessions
 */
async function getSessionStats() {
  try {
    const sessions = await getActiveSessions();
    const stats = {
      totalActiveSessions: sessions.length,
      byLanguage: {},
      byMenu: {},
      byStatus: {},
    };

    sessions.forEach((session) => {
      // Count by language
      stats.byLanguage[session.language] = (stats.byLanguage[session.language] || 0) + 1;

      // Count by current menu
      stats.byMenu[session.currentMenu] = (stats.byMenu[session.currentMenu] || 0) + 1;

      // Count by status
      stats.byStatus[session.status] = (stats.byStatus[session.status] || 0) + 1;
    });

    return stats;
  } catch (error) {
    console.error('Error getting session stats:', error);
    throw error;
  }
}

module.exports = {
  getMenuState,
  initializeMenuState,
  handleMenuInput,
  goBackMenu,
  getMenu,
  endCallSession,
  storeRecording,
  storeReportId,
  getActiveSessions,
  getSessionStats,
};
