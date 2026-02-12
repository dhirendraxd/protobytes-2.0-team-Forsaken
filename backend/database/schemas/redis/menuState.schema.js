/**
 * Redis Menu State Schema
 * Stores IVR menu navigation state for users
 * 
 * Key Format: menu:state:{userId}:{sessionId}
 * TTL: 30 minutes (1800 seconds)
 */

const menuStateSchema = {
  userId: 'string',              // User identifier
  sessionId: 'string',           // Session identifier
  currentMenu: 'string',         // Current menu level: main | alerts | market | transport
  previousMenus: 'array',        // Stack of previous menus for navigation
  selectedOption: 'number',      // Last selected menu option
  timestamp: 'timestamp',        // When state was last updated
  language: 'string',            // Language preference: en | ne
  inputBuffer: 'string',         // Buffered user input
  navigationHistory: 'array',    // Complete menu path taken
  timeOnCurrentMenu: 'number',   // Seconds spent on current menu
};

/**
 * Usage Example:
 * 
 * redis_async.setEx(
 *   `menu:state:${userId}:${sessionId}`,
 *   1800,  // 30 minutes TTL
 *   JSON.stringify({
 *     userId,
 *     sessionId,
 *     currentMenu: 'main',
 *     previousMenus: [],
 *     selectedOption: 1,
 *     timestamp: Date.now(),
 *     language: 'en',
 *     inputBuffer: '',
 *     navigationHistory: ['main'],
 *     timeOnCurrentMenu: 0
 *   })
 * );
 */

module.exports = menuStateSchema;
