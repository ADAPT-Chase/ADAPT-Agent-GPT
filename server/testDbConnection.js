const { Client } = require('pg');
require('dotenv').config();

const config = {
  user: process.env.DB_USERNAME,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
};

async function createDatabaseIfNotExists() {
  const client = new Client({
    ...config,
    database: 'postgres', // Connect to the default 'postgres' database first
  });

  try {
    await client.connect();
    const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = '${process.env.DB_NAME}'`);
    if (res.rowCount === 0) {
      console.log(`Database ${process.env.DB_NAME} does not exist. Creating it now...`);
      await client.query(`CREATE DATABASE ${process.env.DB_NAME}`);
      console.log(`Database ${process.env.DB_NAME} created successfully.`);
    } else {
      console.log(`Database ${process.env.DB_NAME} already exists.`);
    }
  } catch (err) {
    console.error('Error creating database:', err);
  } finally {
    await client.end();
  }
}

async function testConnection() {
  const client = new Client({
    ...config,
    database: process.env.DB_NAME,
  });

  try {
    await client.connect();
    const res = await client.query('SELECT NOW()');
    console.log('Successfully connected to the database');
    console.log('Current time from database:', res.rows[0].now);
  } catch (err) {
    console.error('Error connecting to the database', err);
  } finally {
    await client.end();
  }
}

async function main() {
  await createDatabaseIfNotExists();
  await testConnection();
}

main();