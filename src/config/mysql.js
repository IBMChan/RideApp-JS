// config/mysql.js
import path from "path";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Create a connection pool
export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || process.env.DB_PASS, // support either var name
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test and establish a MySQL connection
export const connectMySQL = async () => {
  try {
    const connection = await pool.getConnection();
    await connection.ping(); // verify connection
    connection.release();
    console.log("MySQL Connected");
  } catch (error) {
    console.error("MySQL Error:", error);
    process.exit(1);
  }
};
