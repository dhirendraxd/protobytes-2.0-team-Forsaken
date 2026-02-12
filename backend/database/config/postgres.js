const pg = require('pg');
const dotenv = require('dotenv');

dotenv.config();

// PostgreSQL pool configuration
const pool = new pg.Pool({
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD,
  host: process.env.PG_HOST || 'localhost',
  port: process.env.PG_PORT || 5432,
  database: process.env.PG_DATABASE || 'village_voice_hub',
  ssl: process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

pool.on('connect', () => {
  console.log('✅ PostgreSQL connected successfully');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL error:', err);
});

// Test connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ PostgreSQL connection test failed:', err);
  } else {
    console.log('✅ PostgreSQL connection test passed');
  }
});

module.exports = pool;
