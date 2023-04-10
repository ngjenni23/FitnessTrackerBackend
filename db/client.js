const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || 'postgres://fitnessdev_9mxk_user:WvwNhDe1iYjpukGBTnsB3FAOHtnMtPbT@dpg-cg9r21hmbg5adg1rd6s0-a.ohio-postgres.render.com/fitnessdev_9mxk?ssl=true'

const client = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});

module.exports = client;
