const { Client } = require('pg');

const client = new Client({
  user: 'postgres',  // PostgreSQL user
  host: 'localhost',  // Database host
  database: 'postgres', // Database name
  password: '1234',  
  port: 5432,  
});

client.connect()
  .then(() => console.log('Connected to PostgreSQL database'))
  .catch(err => console.error('Connection error', err.stack));

  module.exports = client;