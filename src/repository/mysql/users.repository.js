import { pool } from '../../config/mysql.js';


export const createUser = async (user) => {
    const { fullName, email, phone, hashedPassword, role, licenseNumber } = user;
    const sql = 'INSERT INTO users (full_name, email, phone, password, role, license_number) VALUES (?, ?, ?, ?, ?, ?)';
    const [result] = await pool.query(sql, [fullName, email, phone, hashedPassword, role, licenseNumber]);
    
    return { userId: result.insertId, email, role };
};

export const findUserByEmail = async (email) => {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
};

export const findUserById = async (userId) => {
    const [rows] = await pool.query('SELECT user_id, full_name, email, phone, role, license_number FROM users WHERE user_id = ?', [userId]);
    return rows[0];
};

export const updateUserProfile = async (userId, profileData) => {
    const { fullName, phone } = profileData;
    const sql = 'UPDATE users SET full_name = ?, phone = ? WHERE user_id = ?';
    const [result] = await pool.query(sql, [fullName, phone, userId]);
    return result.affectedRows > 0;
};

export const updateUserPassword = async (userId, hashedPassword) => {
    const sql = 'UPDATE users SET password = ? WHERE user_id = ?';
    const [result] = await pool.query(sql, [hashedPassword, userId]);
    return result.affectedRows > 0;
};