/**
 * Redis Short-term Logs Schema
 * Stores recent system logs for monitoring and debugging
 * 
 * Key Format: logs:{logType}
 * Structure: Sorted Set (ZSET) - for time-based retrieval
 * TTL: 24 hours (86400 seconds)
 */

const shortTermLogsSchema = {
  logType: 'string',             // Type: system | calls | errors | security
  timestamp: 'number',           // Unix timestamp (score in ZSET)
  level: 'enum',                 // debug | info | warn | error | critical
  message: 'string',             // Log message
  userId: 'string',              // Associated user (optional)
  callId: 'string',              // Associated call (optional)
  source: 'string',              // Source file or service
  details: 'object',             // Additional context data
};

/**
 * Usage Examples:
 * 
 * // Add a log entry (Sorted Set)
 * redis_async.zadd(
 *   `logs:system`,
 *   Date.now(),  // score (timestamp)
 *   JSON.stringify({
 *     level: 'info',
 *     message: 'User logged in',
 *     userId: 'user123',
 *     source: 'auth.js',
 *     timestamp: Date.now(),
 *     details: { ip: '192.168.1.1' }
 *   })
 * );
 * 
 * // Get logs from last hour
 * const oneHourAgo = Date.now() - 3600000;
 * redis_async.zrangebyscore('logs:system', oneHourAgo, '+inf');
 * 
 * // Get latest 100 logs
 * redis_async.zrevrange('logs:system', 0, 99);
 * 
 * // Remove logs older than 24 hours
 * const oneDayAgo = Date.now() - 86400000;
 * redis_async.zremrangebyscore('logs:system', '-inf', oneDayAgo);
 */

module.exports = shortTermLogsSchema;
