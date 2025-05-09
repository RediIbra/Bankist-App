const { Client } = require('pg');

// Set up PostgreSQL client
const client = new Client({
  host: 'localhost', // Database host
  port: 5432,        // Default PostgreSQL port
  database: 'postgress',  // Your database name
  user: 'postgress',    // Your PostgreSQL username
  password: '1234',  // Your PostgreSQL password
});

client.connect()
  .then(() => console.log('Connected to PostgreSQL database'))
  .catch(err => console.error('Connection error', err.stack));
