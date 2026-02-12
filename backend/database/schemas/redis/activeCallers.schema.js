/**
 * Redis Active Callers Schema
 * Tracks currently active calls and callers in the system
 * 
 * Key Format: active:caller:{callerId}
 * TTL: 2 hours (7200 seconds)
 */

const activeCallersSchema = {
  callerId: 'string',            // Unique caller identifier
  phoneNumber: 'string',         // Phone number (hashed for privacy)
  status: 'enum',                // available | in-call | on-hold | away | offline
  currentCallId: 'string',       // Current active call session ID
  callCount: 'number',           // Number of calls made today
  lastActive: 'timestamp',       // Last activity timestamp
  location: 'string',            // Location/village identifier
  language: 'string',            // Preferred language: en | ne
  features: 'array',             // Available features: [sms, voice, video]
  quality: 'string',             // Connection quality
  deviceType: 'string',          // Device type: phone | computer | mobile
};

/**
 * Usage Example:
 * 
 * redis_async.setEx(
 *   `active:caller:${callerId}`,
 *   7200,  // 2 hours TTL
 *   JSON.stringify({
 *     callerId,
 *     phoneNumber: hashedPhoneNumber,
 *     status: 'available',
 *     currentCallId: null,
 *     callCount: 5,
 *     lastActive: Date.now(),
 *     location: 'village-center',
 *     language: 'en',
 *     features: ['sms', 'voice'],
 *     quality: 'good',
 *     deviceType: 'phone'
 *   })
 * );
 * 
 * // Get all active callers using SCAN
 * redis_async.scan(0, { MATCH: 'active:caller:*', COUNT: 100 });
 */

module.exports = activeCallersSchema;
