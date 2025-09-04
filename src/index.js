// index.js
console.log("Ride app project is running!");

// Optional: test MySQL connection
import pool from './src/config/mysql.js';

const testDB = async () => {
  try {
    const [rows] = await pool.query('SELECT DATABASE() AS schema_name');
    console.log('Connected to schema:', rows[0].schema_name);
  } catch (err) {
    console.error('DB connection failed:', err.message);
  }
};

testDB();
