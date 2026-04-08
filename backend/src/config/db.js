const { Pool } = require('pg');
require('dotenv').config();

// Required for DigitalOcean managed PostgreSQL SSL
if (process.env.DB_SSL === 'true') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const schema = process.env.DB_SCHEMA || 'fincopilot';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'defaultdb',
  user: process.env.DB_USER || 'doadmin',
  password: process.env.DB_PASSWORD,
  max: 2,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  ssl: process.env.DB_SSL === 'true' ? true : false,
});

// Set search_path to our schema on every new connection
pool.on('connect', (client) => {
  client.query(`SET search_path TO ${schema}, public`);
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});

// Helper to run queries
const query = (text, params) => pool.query(text, params);

// Helper for transactions
const getClient = () => pool.connect();

module.exports = { pool, query, getClient, schema };
