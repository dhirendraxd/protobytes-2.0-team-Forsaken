/**
 * Redis Cached Data Schema
 * Stores cached audio/message data and other frequently accessed data
 * 
 * Key Formats:
 * - audio:message:{messageId}
 * - cache:alerts:{location}
 * - cache:prices:{category}
 * - cache:routes:{routeId}
 * 
 * TTL: Varies by data type (30 min - 24 hours)
 */

const cachedDataSchema = {
  // Audio/Message Cache
  messageId: 'string',           // Unique message identifier
  audioBuffer: 'buffer',         // Cached audio data (MP3/WAV)
  audioMeta: 'object',           // {duration, format, bitrate, sampleRate}
  messageText: 'string',         // Transcribed or original message text
  language: 'string',            // Language: en | ne
  createdAt: 'timestamp',        // When message was created
  accessCount: 'number',         // How many times accessed
  
  // Alerts Cache
  alertId: 'string',             // Alert identifier
  alertStatus: 'enum',           // pending | active | resolved
  location: 'string',            // Alert location
  category: 'string',            // Alert category
  upvotes: 'number',             // Current upvotes
  downvotes: 'number',           // Current downvotes
  
  // Market Prices Cache
  priceId: 'string',             // Price entry identifier
  item: 'string',                // Item name
  price: 'number',               // Current price
  unit: 'string',                // Price unit: kg | liter | piece
  location: 'string',            // Location of price
  lastUpdated: 'timestamp',      // When price was last updated
  
  // Transport Routes Cache
  routeId: 'string',             // Route identifier
  route: 'string',               // Route name
  schedules: 'array',            // Array of departure times
  fare: 'number',                // Fare amount
  operator: 'string',            // Transport operator name
};

/**
 * Usage Examples:
 * 
 * // Cache audio message (TTL: 1 hour)
 * redis_async.setEx(
 *   `audio:message:${messageId}`,
 *   3600,  // 1 hour
 *   JSON.stringify({
 *     messageId,
 *     audioBuffer: audioData,
 *     audioMeta: { duration: 45, format: 'mp3', bitrate: 128 },
 *     messageText: 'transcribed text',
 *     language: 'en',
 *     createdAt: Date.now(),
 *     accessCount: 0
 *   })
 * );
 * 
 * // Cache alerts by location (TTL: 30 minutes)
 * redis_async.setEx(
 *   `cache:alerts:${location}`,
 *   1800,  // 30 minutes
 *   JSON.stringify({
 *     location,
 *     alerts: [{ id, status, category, upvotes, downvotes }],
 *     lastUpdated: Date.now()
 *   })
 * );
 * 
 * // Cache market prices by category (TTL: 2 hours)
 * redis_async.setEx(
 *   `cache:prices:${category}`,
 *   7200,  // 2 hours
 *   JSON.stringify({
 *     category,
 *     prices: [{ item, price, unit, location }],
 *     lastUpdated: Date.now()
 *   })
 * );
 * 
 * // Cache transport routes (TTL: 6 hours)
 * redis_async.setEx(
 *   `cache:routes:${routeId}`,
 *   21600,  // 6 hours
 *   JSON.stringify({
 *     routeId,
 *     route,
 *     schedules: ['06:00', '12:00', '18:00'],
 *     fare,
 *     operator,
 *     lastUpdated: Date.now()
 *   })
 * );
 */

module.exports = cachedDataSchema;
