import pool from './config/mysql.js';
// adjust path if needed

const testDB = async () => {
  try {
    // Run a simple query to check connection
    const [rows] = await pool.query('SELECT DATABASE() AS schema_name');
    console.log('Connected to schema:', rows[0].schema_name);
  } catch (err) {
    console.error('DB connection failed:', err.message);
  }
};

testDB();
