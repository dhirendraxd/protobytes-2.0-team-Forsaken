/**
 * Redis Call Sessions Schema
 * Stores active call session data with TTL expiration
 * 
 * Key Format: call:session:{sessionId}
 * TTL: 1 hour (3600 seconds) - auto expires after call ends
 */

const callSessionSchema = {
  sessionId: 'string',           // Unique session identifier
  userId: 'string',              // User making the call
  callerId: 'string',            // ID of the caller
  calleeId: 'string',            // ID of the person being called
  startTime: 'timestamp',        // When call started
  duration: 'number',            // Call duration in seconds
  status: 'enum',                // active | ended | on-hold | disconnected
  audioData: 'buffer',           // Cached audio segments
  encryption: 'string',          // Encryption method used
  ipAddress: 'string',           // Caller IP for security
  quality: 'string',             // call quality: poor | fair | good | excellent
};

/**
 * Usage Example:
 * 
 * redis_async.setEx(
 *   `call:session:${sessionId}`,
 *   3600,  // 1 hour TTL
 *   JSON.stringify({
 *     sessionId,
 *     userId,
 *     callerId,
 *     calleeId,
 *     startTime: Date.now(),
 *     status: 'active',
 *     duration: 0,
 *     quality: 'good'
 *   })
 * );
 */

module.exports = callSessionSchema;
