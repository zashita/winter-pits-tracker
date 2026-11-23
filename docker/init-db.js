const { Client } = require('pg');

const config = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 5432),
      user: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'yama-bd',
    };

if (process.env.DB_SSL === 'true') config.ssl = { rejectUnauthorized: true };

async function initializeDatabase() {
  const client = new Client(config);
  await client.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS winter_pit (
        id SERIAL PRIMARY KEY,
        starts double precision[] NOT NULL,
        ends double precision[],
        shape jsonb,
        square double precision NOT NULL,
        description text NOT NULL
      )
    `);
  } finally {
    await client.end();
  }
}

initializeDatabase().catch(error => {
  console.error('Database initialization failed:', error.message);
  process.exit(1);
});
