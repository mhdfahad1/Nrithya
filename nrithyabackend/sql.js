const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Read the SQL file
const sqlFilePath = path.join(__dirname, 'migration.sql');
const sql = fs.readFileSync(sqlFilePath, 'utf8');

// Database connection configuration
const client = new Client({
  host: '164.52.219.253',
  user: 'postgres',
  password: 'Bcast@123',
  database: 'nrithyauat',
  port: 5432, // default PostgreSQL port
});

client.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }

  console.log('Connected to the database.');

  // Execute the SQL script
  client.query(sql, (error, results) => {
    if (error) {
      console.error('Error executing SQL script:', error);
      return;
    }

    console.log('SQL script executed successfully.');
    client.end();
  });
});
